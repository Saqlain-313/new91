const axios = require("axios");
const crypto = require("crypto");
const connectionModule = require("../config/connectDB");
const connection = connectionModule.default || connectionModule;

const {
  typeAndProviderData,
  providerData,
  jilidata,
  casino10,
  casino3,
  casino4,
  casino2,
} = require("./gameData");

/* =========================
   CONFIG
========================= */

const apiUrl = (
  process.env.GAME_API_URL || "https://www.api-doc.space/api"
).replace(/\/+$/, "");

const launchUrl =
  process.env.GAME_LAUNCH_URL ||
  "https://www.api-doc.space/api/launch-game";

const key = (process.env.GAME_API_KEY || "").trim();

// "decimal" (1.23) or "cents" (123). Some providers only accept one.
const balanceUnit = (process.env.GAME_API_BALANCE_UNIT || "decimal").toLowerCase();

// How long to wait after Setbalance before verifying (ms).
const setBalanceSettleMs = Math.max(
  Number(process.env.GAME_SETBALANCE_SETTLE_MS) || 800,
  0
);

// How many times to retry the Setbalance + verify loop.
const setBalanceMaxAttempts = Math.max(
  Number(process.env.GAME_SETBALANCE_MAX_ATTEMPTS) || 3,
  1
);

const DEFAULT_HISTORY_UID = "e333695bcff28acdbecc641ae6ee2b23";

if (!key) {
  console.error("[CONFIG] GAME_API_KEY is not set in .env");
}

const baseHeaders = {
  "x-domain": process.env.GAME_X_DOMAIN || "max-win.site",
  ...(key ? { key } : {}),
};

/* =========================
   HELPERS
========================= */

function timerJoin2(params = "", addHours = 0) {
  const date = params ? new Date(Number(params)) : new Date();
  if (addHours !== 0) date.setHours(date.getHours() + addHours);

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value || "00";

  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

const paginate = (list, page, size) => {
  const p = Math.max(Number(page) || 1, 1);
  const s = Math.max(Number(size) || 10, 1);
  return list.slice((p - 1) * s, (p - 1) * s + s);
};

function extractApiError(error) {
  if (error?.response?.data) {
    const data = error.response.data;
    if (typeof data === "string") return data;
    return data.message || data.msg || JSON.stringify(data);
  }
  return error?.message || "Unknown error";
}

const fail = (res, name, error, httpStatus = 502) => {
  const message = extractApiError(error);
  console.error(`[${name}]`, message);
  return res.status(httpStatus).json({
    message:
      httpStatus === 500 ? "Internal server error" : "Upstream game API error",
    status: false,
    error: message,
  });
};

const needKey = (res) =>
  res.status(500).json({
    message: "Server misconfigured: missing API key",
    status: false,
  });

function readBalance(data) {
  const value =
    data?.Balance ??
    data?.balance ??
    data?.data?.Balance ??
    data?.data?.balance ??
    data?.money ??
    null;

  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

const round2 = (number) => {
  const n = Number(number);
  if (!Number.isFinite(n)) return NaN;
  return Math.round((n + Number.EPSILON) * 100) / 100;
};

const makeTransferRef = () =>
  `tr_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const isTrueStatus = (data) =>
  data?.status === true ||
  data?.status === 1 ||
  String(data?.status).toLowerCase() === "true";

// Only treat the response as rejected when the provider EXPLICITLY says so.
// Some providers don't return `status` on Setbalance at all; the real proof
// is the Userbalance verify step that follows.
const isExplicitFail = (data) =>
  data?.status === false ||
  data?.status === 0 ||
  String(data?.status).toLowerCase() === "false";

/**
 * Convert a decimal amount to whatever wire format the provider expects.
 * decimal -> number (1.23)
 * cents   -> integer (123)
 */
function toWireBalance(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) throw new Error("Invalid balance amount");
  if (balanceUnit === "cents") return Math.round(n * 100);
  return n;
}

/**
 * Providers often validate with `!opening_balance`, which treats the number 0
 * as "missing". So for Setbalance we try different representations of the
 * value, one per attempt:
 *   0 -> "0"  ->  "0.00"  ->  0
 */
function formatOpeningBalance(wireBalance, formatIndex) {
  const variants = [
    String(wireBalance),
    Number(wireBalance).toFixed(2),
    wireBalance,
  ];
  return variants[formatIndex % variants.length];
}

/* =========================
   USER LOOKUP
========================= */

async function findUserByIdentifier(db, identifier, lock = false) {
  const sql = `
    SELECT id_user, phone, token, money
    FROM users
    WHERE phone = ? OR id_user = ? OR token = ?
    LIMIT 1 ${lock ? "FOR UPDATE" : ""}
  `;
  const [rows] = await db.query(sql, [identifier, identifier, identifier]);
  return rows.length ? rows[0] : null;
}

/* =========================
   TRANSFER LOG (separate connection)
   These writes use their own connection so they are NOT undone when the main
   wallet transaction rolls back. This is what makes reconciliation possible.
========================= */

async function writeTransferLog(sql, params) {
  let c;
  try {
    c = await connection.getConnection();
    await c.query(sql, params);
    return true;
  } catch (e) {
    console.error("[transferLog] write failed:", e.message);
    return false;
  } finally {
    if (c) {
      try {
        c.release();
      } catch (_) {}
    }
  }
}

const markTransferPending = (transferRef, phone, playerid) =>
  writeTransferLog(
    `INSERT INTO game_transfers
       (transfer_ref, phone, playerid, status, amount, created_at)
     VALUES (?, ?, ?, 'pending', 0, ?)
     ON DUPLICATE KEY UPDATE status = 'pending', created_at = VALUES(created_at)`,
    [transferRef, phone, String(playerid), timerJoin2(Date.now())]
  );

const markTransferFailed = (transferRef, amount, providerBalance) =>
  writeTransferLog(
    `UPDATE game_transfers
        SET status = 'failed', amount = ?, provider_balance_after = ?
      WHERE transfer_ref = ?`,
    [amount ?? 0, providerBalance ?? null, transferRef]
  );

/* =========================
   PROVIDER BALANCE API
========================= */

function providerSaysRequiredFieldsMissing(data) {
  const message = typeof data === "string" ? data : JSON.stringify(data || "");
  return (
    /key,\s*playerid\s*and\s*opening_balance\s*are\s*required/i.test(message) ||
    /opening_balance.*required/i.test(message)
  );
}

async function fetchUserBalance(playerid) {
  if (!key) throw new Error("GAME_API_KEY is missing");

  const response = await axios.post(
    `${apiUrl}/Userbalance`,
    { playerid: String(playerid), key },
    {
      params: { playerid: String(playerid), key },
      headers: {
        ...baseHeaders,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    }
  );

  console.log(
    `[Userbalance] playerid=${String(playerid)} response=${JSON.stringify(response.data)}`
  );
  return response;
}

/**
 * Send a Setbalance request. Sends key, playerid and opening_balance in BOTH
 * query params and JSON body. opening_balance is sent in a different format
 * per attempt (see formatOpeningBalance) so a provider that rejects the
 * number 0 as "missing" still gets a valid value.
 */
async function setProviderBalance(playerid, openingBalance, formatIndex = 0) {
  if (!key) throw new Error("GAME_API_KEY is missing");

  const numericBalance = Number(openingBalance);
  if (!Number.isFinite(numericBalance) || numericBalance < 0) {
    throw new Error("opening_balance must be a non-negative number");
  }

  const wireBalance = toWireBalance(numericBalance);
  const sendValue = formatOpeningBalance(wireBalance, formatIndex);

  const payload = {
    key,
    playerid: String(playerid),
    opening_balance: sendValue,
  };

  const response = await axios.post(`${apiUrl}/Setbalance`, payload, {
    params: payload,
    headers: {
      ...baseHeaders,
      "Content-Type": "application/json",
    },
    timeout: 15000,
  });

  // Never log the API key.
  console.log(
    `[Setbalance] playerid=${String(playerid)} opening_balance=${JSON.stringify(sendValue)} (type=${typeof sendValue}) unit=${balanceUnit} status=${response.status} response=${JSON.stringify(response.data)}`
  );

  if (providerSaysRequiredFieldsMissing(response.data)) {
    const error = new Error(
      "Provider did not recognize key/playerid/opening_balance. Verify the official Setbalance endpoint and required parameter format."
    );
    error.response = { data: response.data, status: response.status };
    throw error;
  }

  return response;
}

/**
 * Set the provider balance and verify the result, retrying the whole loop.
 * targetBalance is ALWAYS a decimal amount (e.g. 0 or 12.5).
 * Returns { ok, reason?, providerBalance, attempts, lastResponse }.
 */
async function setProviderBalanceAndVerify(playerid, targetBalance) {
  let lastResponse = null;
  let lastProviderBalance = null;
  let lastReason = "exhausted";

  for (let attempt = 1; attempt <= setBalanceMaxAttempts; attempt++) {
    const isLast = attempt === setBalanceMaxAttempts;

    // --- 1. Setbalance (different value format on each attempt) ---
    try {
      lastResponse = await setProviderBalance(
        playerid,
        targetBalance,
        attempt - 1
      );
    } catch (err) {
      console.error(
        `[setProviderBalanceAndVerify] attempt ${attempt} Setbalance threw:`,
        extractApiError(err)
      );
      lastReason = "provider_rejected";
      if (isLast) {
        return {
          ok: false,
          reason: lastReason,
          providerBalance: lastProviderBalance,
          attempts: attempt,
          lastResponse,
        };
      }
      await sleep(setBalanceSettleMs);
      continue;
    }

    // Reject only on an explicit failure. Missing/odd `status` is fine, the
    // Userbalance verify below is the real source of truth.
    if (isExplicitFail(lastResponse?.data)) {
      console.warn(
        `[setProviderBalanceAndVerify] attempt ${attempt} provider rejected:`,
        JSON.stringify(lastResponse?.data ?? null)
      );
      lastReason = "provider_rejected";
      if (isLast) {
        return {
          ok: false,
          reason: lastReason,
          providerBalance: lastProviderBalance,
          attempts: attempt,
          lastResponse,
        };
      }
      await sleep(setBalanceSettleMs);
      continue;
    }

    // Provider APIs may update asynchronously. Use a growing delay per attempt.
    await sleep(setBalanceSettleMs * attempt);

    // --- 2. Verify with Userbalance ---
    let verifyData;
    try {
      const verify = await fetchUserBalance(playerid);
      verifyData = verify?.data;
    } catch (err) {
      console.error(
        `[setProviderBalanceAndVerify] attempt ${attempt} Userbalance threw:`,
        extractApiError(err)
      );
      lastReason = "verify_failed";
      if (isLast) {
        return {
          ok: false,
          reason: lastReason,
          providerBalance: lastProviderBalance,
          attempts: attempt,
          lastResponse,
        };
      }
      await sleep(setBalanceSettleMs);
      continue;
    }

    if (!isTrueStatus(verifyData)) {
      console.warn(
        `[setProviderBalanceAndVerify] attempt ${attempt} Userbalance status false:`,
        JSON.stringify(verifyData ?? null)
      );
      lastReason = "verify_status_false";
      if (isLast) {
        return {
          ok: false,
          reason: lastReason,
          providerBalance: lastProviderBalance,
          attempts: attempt,
          lastResponse,
        };
      }
      await sleep(setBalanceSettleMs);
      continue;
    }

    const providerBalance = readBalance(verifyData);
    lastProviderBalance = providerBalance;

    // targetBalance is already decimal (no cents conversion needed here).
    if (
      providerBalance !== null &&
      Math.abs(providerBalance - targetBalance) <= 0.01
    ) {
      return {
        ok: true,
        providerBalance,
        attempts: attempt,
        lastResponse,
      };
    }

    console.warn(
      `[setProviderBalanceAndVerify] attempt ${attempt} mismatch: expected≈${targetBalance}, got ${providerBalance}`
    );
    lastReason = "balance_not_zero";

    if (isLast) {
      return {
        ok: false,
        reason: lastReason,
        providerBalance,
        attempts: attempt,
        lastResponse,
      };
    }

    await sleep(setBalanceSettleMs);
  }

  return {
    ok: false,
    reason: lastReason,
    providerBalance: lastProviderBalance,
    attempts: setBalanceMaxAttempts,
    lastResponse,
  };
}

/* =========================
   CHECK BALANCE
========================= */

const checkBalance = async (req, res) => {
  try {
    const playerid = req.body?.playerid;
    if (!playerid) {
      return res.status(400).json({ message: "Undefined token", status: false });
    }
    if (!key) return needKey(res);

    const response = await fetchUserBalance(playerid);
    const data = response.data;

    if (data?.status) {
      const balance = readBalance(data);
      if (balance === null || balance < 0) {
        return res.status(502).json({
          message: "Invalid balance received from provider",
          status: false,
          data,
        });
      }

      return res.status(200).json({
        message: "get balance successfully.",
        status: true,
        balance: round2(balance),
        data,
      });
    }

    return res.status(502).json({
      message: extractApiError({ response }),
      status: false,
      data,
    });
  } catch (error) {
    return fail(res, "checkBalance", error);
  }
};

/* =========================
   TRANSFER BALANCE (game -> wallet)
========================= */

const transferBalance = async (req, res) => {
  let conn;
  let transactionStarted = false;
  let playerid;
  let transferRef;
  let gameBalance = 0;
  let providerResetSucceeded = false;
  let pendingLogged = false;

  try {
    playerid = req.body?.playerid;
    transferRef = req.body?.transferRef || makeTransferRef();

    if (!playerid) {
      return res
        .status(400)
        .json({ status: false, message: "Undefined token" });
    }
    if (!key) return needKey(res);

    // 1. Open DB + lock the user row first.
    conn = await connection.getConnection();
    await conn.beginTransaction();
    transactionStarted = true;

    const user = await findUserByIdentifier(conn, playerid, true);
    if (!user) {
      await conn.rollback();
      transactionStarted = false;
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const userPhone = user.phone;
    const userMoneyBefore = Number(user.money);

    if (!Number.isFinite(userMoneyBefore) || userMoneyBefore < 0) {
      await conn.rollback();
      transactionStarted = false;
      return res
        .status(500)
        .json({ status: false, message: "Invalid user wallet balance" });
    }

    // 2. Idempotency check.
    const [existing] = await conn.query(
      `SELECT status, amount, provider_balance_after, user_money_before, user_money_after
       FROM game_transfers WHERE transfer_ref = ? LIMIT 1`,
      [transferRef]
    );

    if (existing.length) {
      const row = existing[0];
      if (row.status === "completed") {
        await conn.commit();
        transactionStarted = false;
        return res.status(200).json({
          status: true,
          message: "Transfer already completed",
          data: {
            playerid,
            transferRef,
            transferredAmount: Number(row.amount),
            providerBalanceAfter: row.provider_balance_after,
            userPhone,
            userMoneyBefore: Number(row.user_money_before),
            userMoneyAfter: Number(row.user_money_after),
            idempotent: true,
          },
        });
      }
      if (row.status === "pending") {
        await conn.rollback();
        transactionStarted = false;
        return res.status(409).json({
          status: false,
          message:
            "Previous transfer for this reference is still pending reconciliation. Do not retry until it is resolved.",
          transferRef,
        });
      }
      // 'failed' -> allow retry
    }

    // Mark pending on a SEPARATE connection (committed immediately) BEFORE the
    // provider call. If the wallet transaction rolls back, this row survives,
    // so failures are always visible for reconciliation.
    pendingLogged = await markTransferPending(transferRef, userPhone, playerid);

    // 3. Read provider balance.
    const balanceResponse = await fetchUserBalance(playerid);
    const balanceData = balanceResponse?.data;

    if (!isTrueStatus(balanceData)) {
      await conn.rollback();
      transactionStarted = false;
      await markTransferFailed(transferRef, 0, null);
      return res.status(502).json({
        status: false,
        message: "Unable to fetch provider balance",
        data: balanceData ?? null,
      });
    }

    gameBalance = round2(readBalance(balanceData));

    if (!Number.isFinite(gameBalance) || gameBalance <= 0) {
      await conn.rollback();
      transactionStarted = false;
      await markTransferFailed(transferRef, 0, null);
      return res
        .status(400)
        .json({ status: false, message: "Insufficient balance" });
    }

    // 4. Request provider balance reset to zero and verify using Userbalance.
    // Wallet credit is forbidden unless the provider reports zero.
    const reset = await setProviderBalanceAndVerify(playerid, 0);

    if (!reset.ok) {
      await conn.rollback();
      transactionStarted = false;

      // Row now definitely exists (committed earlier), so this update works.
      await markTransferFailed(transferRef, gameBalance, reset.providerBalance);

      const reason = reset.reason;
      const providerBalance = reset.providerBalance;

      console.error(
        `[transferBalance] Setbalance failed reason=${reason} playerid=${playerid} providerBalance=${providerBalance} attempts=${reset.attempts}`
      );

      return res.status(409).json({
        status: false,
        message:
          reason === "balance_not_zero"
            ? "Provider balance is still not zero. Wallet was not credited."
            : reason === "provider_rejected"
            ? "Provider rejected balance reset."
            : reason === "verify_failed" || reason === "verify_status_false"
            ? "Reset was requested but provider balance could not be verified. Reconciliation required."
            : "Unable to reset provider balance after retries.",
        providerBalance,
        transferRef,
        reason,
        attempts: reset.attempts,
      });
    }

    providerResetSucceeded = true;
    const providerBalanceAfter = reset.providerBalance;

    // 5. Credit wallet only after zero is confirmed.
    const userMoneyAfter = round2(userMoneyBefore + gameBalance);

    const [updateResult] = await conn.query(
      "UPDATE users SET money = ? WHERE phone = ?",
      [userMoneyAfter, userPhone]
    );

    if (updateResult.affectedRows !== 1) {
      await conn.rollback();
      transactionStarted = false;
      // Provider is already zero but wallet not credited: keep it 'pending'
      // with the amount so it can be fixed manually.
      await writeTransferLog(
        `UPDATE game_transfers SET amount = ?, provider_balance_after = ?
          WHERE transfer_ref = ?`,
        [gameBalance, providerBalanceAfter, transferRef]
      );
      return res.status(500).json({
        status: false,
        message:
          "Provider balance is zero but wallet update failed. Reconciliation required.",
        transferRef,
      });
    }

    // 6. Transaction history.
    await conn.query(
      `INSERT INTO transaction_history
         SET phone = ?, detail = ?, balance = ?, \`time\` = ?`,
      [userPhone, "Game moved out", gameBalance, timerJoin2(Date.now())]
    );

    // 7. Mark transfer completed.
    await conn.query(
      `UPDATE game_transfers
         SET status = 'completed', amount = ?, provider_balance_after = ?,
             user_money_before = ?, user_money_after = ?
       WHERE transfer_ref = ?`,
      [
        gameBalance,
        providerBalanceAfter,
        round2(userMoneyBefore),
        userMoneyAfter,
        transferRef,
      ]
    );

    await conn.commit();
    transactionStarted = false;

    return res.status(200).json({
      status: true,
      message: "Transfer completed successfully",
      data: {
        playerid,
        transferRef,
        transferredAmount: gameBalance,
        providerBalanceAfter,
        userPhone,
        userMoneyBefore: round2(userMoneyBefore),
        userMoneyAfter,
      },
    });
  } catch (error) {
    if (conn && transactionStarted) {
      try {
        await conn.rollback();
      } catch (rollbackError) {
        console.error(
          "[transferBalance] Rollback failed:",
          rollbackError.message
        );
      }
    }

    console.error("[transferBalance]", extractApiError(error));

    if (providerResetSucceeded) {
      // Provider is zero but wallet may not be credited. Leave row 'pending'.
      console.error(
        "[transferBalance] Provider may already be zero. Reconcile before retrying.",
        { playerid, transferRef, gameBalance }
      );
      await writeTransferLog(
        `UPDATE game_transfers SET amount = ? WHERE transfer_ref = ?`,
        [gameBalance, transferRef]
      );
    } else if (pendingLogged && transferRef) {
      // Provider was never reset, safe to allow retry.
      await markTransferFailed(transferRef, gameBalance, null);
    }

    return fail(res, "transferBalance", error);
  } finally {
    if (conn) {
      try {
        conn.release();
      } catch (error) {
        console.error("[transferBalance] Release failed:", error.message);
      }
    }
  }
};

/* =========================
   LAUNCH GAME (wallet -> game)
========================= */

const launchGame = async (req, res) => {
  let conn;
  let transactionStarted = false;
  let userPhone;
  let openingBalance = 0;

  try {
    const playerid = req.body?.playerid;
    const uid = req.body?.gameId;

    if (!playerid) {
      return res
        .status(400)
        .json({ message: "Undefined token", status: false });
    }
    if (!uid) {
      return res
        .status(400)
        .json({ message: "Undefined gameId", status: false });
    }
    if (!key) return needKey(res);

    // 1. Lock wallet, zero it, commit BEFORE calling the provider.
    conn = await connection.getConnection();
    await conn.beginTransaction();
    transactionStarted = true;

    const user = await findUserByIdentifier(conn, playerid, true);
    if (!user) {
      await conn.rollback();
      transactionStarted = false;
      return res.status(404).json({ message: "Invalid user", status: false });
    }

    userPhone = user.phone;
    openingBalance = round2(user.money);

    if (!Number.isFinite(openingBalance) || openingBalance < 0) {
      await conn.rollback();
      transactionStarted = false;
      return res
        .status(500)
        .json({ message: "Invalid wallet balance", status: false });
    }

    const [updateResult] = await conn.query(
      "UPDATE users SET money = ? WHERE phone = ? AND money = ?",
      [0, userPhone, openingBalance]
    );

    if (updateResult.affectedRows !== 1) {
      await conn.rollback();
      transactionStarted = false;
      return res.status(409).json({
        message: "Wallet balance changed, please retry",
        status: false,
      });
    }

    await conn.commit();
    transactionStarted = false;

    // 2. Call provider after wallet is zeroed.
    let response;
    try {
      const wireBalance = toWireBalance(openingBalance);
      response = await axios.post(
        launchUrl,
        {
          playerid: String(playerid),
          key,
          uid,
          opening_balance: wireBalance,
        },
        {
          params: {
            playerid: String(playerid),
            key,
            uid,
            opening_balance: wireBalance,
          },
          headers: {
            ...baseHeaders,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );
    } catch (providerError) {
      await compensateLaunch(connection, userPhone, openingBalance);
      throw providerError;
    }

    const responseData = response.data;

    if (!responseData?.status) {
      await compensateLaunch(connection, userPhone, openingBalance);
      return res.status(502).json({
        message: "Game launch rejected by provider",
        status: false,
        error: extractApiError({ response }),
        data: responseData,
      });
    }

    // 3. Record transaction history (non-fatal).
    if (openingBalance > 0) {
      const c2 = await connection.getConnection();
      try {
        await c2.query(
          "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, type = ?, `time` = ?",
          [userPhone, "Game moved in", openingBalance, 2, timerJoin2(Date.now())]
        );
      } catch (e) {
        console.error(
          "[launchGame] Failed to write transaction_history (non-fatal):",
          e.message
        );
      } finally {
        c2.release();
      }
    }

    return res.status(200).json({
      message: "Start game successfully.",
      status: true,
      data: responseData,
    });
  } catch (error) {
    if (conn && transactionStarted) {
      try {
        await conn.rollback();
      } catch (_) {}
    }
    console.error("[launchGame]", extractApiError(error));
    return res.status(502).json({
      message: "Upstream game API error",
      status: false,
      error: extractApiError(error),
      data: error.response?.data || null,
    });
  } finally {
    if (conn) {
      try {
        conn.release();
      } catch (_) {}
    }
  }
};

async function compensateLaunch(db, phone, amount) {
  if (!amount) return;
  let c;
  try {
    c = await db.getConnection();
    await c.beginTransaction();
    const [rows] = await c.query(
      "SELECT money FROM users WHERE phone = ? FOR UPDATE",
      [phone]
    );
    if (rows.length) {
      const restored = round2(Number(rows[0].money) + amount);
      await c.query("UPDATE users SET money = ? WHERE phone = ?", [
        restored,
        phone,
      ]);
    }
    await c.commit();
    console.warn(
      `[launchGame] Compensated wallet for ${phone} by ${amount} after provider failure`
    );
  } catch (e) {
    console.error(
      `[launchGame] Compensation FAILED for ${phone} amount ${amount}. Manual fix required.`,
      e.message
    );
  } finally {
    if (c) {
      try {
        c.release();
      } catch (_) {}
    }
  }
}

/* =========================
   GAME LISTS (API)
========================= */

const proxyGet = (name, path, okMessage) => async (req, res) => {
  try {
    const response = await axios.get(`${apiUrl}/${path(req)}`, {
      headers: baseHeaders,
      timeout: 15000,
    });

    if (response.data?.status) {
      return res.status(200).json({
        message: okMessage,
        status: true,
        data: response.data,
      });
    }

    return res.status(502).json({
      message: extractApiError({ response }),
      status: false,
      data: response.data,
    });
  } catch (error) {
    return fail(res, name, error);
  }
};

const getgamedetails = async (req, res) => {
  const { page, size } = req.query;
  if (!page || !size) {
    return res.status(400).json({
      message: "Undefined page & size",
      status: false,
    });
  }

  return proxyGet(
    "getgamedetails",
    () =>
      `getgamedetails?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`,
    "get game list successfully."
  )(req, res);
};

const gameProvider = proxyGet(
  "gameProvider",
  () => "getgamedetails?provider_list=1",
  "get game provider successfully."
);

const gameType = proxyGet(
  "gameType",
  () => "getgamedetails?gametype_list=1",
  "get game type successfully."
);

/* =========================
   GAME LISTS (LOCAL DATA)
========================= */

const gameListByProvider = async (req, res) => {
  try {
    const { provider = "spribe", page = 1, size = 10 } = req.query;

    if (Number(page) === 6) {
      return res.status(200).json({
        message: "jilli game type successfully.",
        status: true,
        data: { data: jilidata },
      });
    }

    const filtered = providerData.filter((game) => game.provider === provider);
    return res.status(200).json({
      message: "get game list successfully.",
      status: true,
      data: { data: paginate(filtered, page, size) },
    });
  } catch (error) {
    return fail(res, "gameListByProvider", error, 500);
  }
};

const gameListByGameType = async (req, res) => {
  try {
    const { game_type = "CasinoLive", page = 1, size = 20 } = req.query;
    const filtered = typeAndProviderData.filter(
      (game) => game.game_type === game_type
    );

    return res.status(200).json({
      message: "get game type successfully.",
      status: true,
      data: { data: paginate(filtered, page, size) },
    });
  } catch (error) {
    return fail(res, "gameListByGameType", error, 500);
  }
};

const gameListByGameTypeAndProvider = async (req, res) => {
  try {
    const { provider, game_type, page, size } = req.query;

    if (!provider || !game_type || !page || !size) {
      return res.status(400).json({
        message: "Undefined page & size",
        status: false,
      });
    }

    if (provider === "evolutionlive") {
      const special = { 2: casino2, 3: casino3, 4: casino4, 10: casino10 };
      const list = special[Number(page)];

      if (list) {
        return res.status(200).json({
          message: "all game type successfully.",
          status: true,
          data: { data: list },
        });
      }
    }

    const filtered = typeAndProviderData.filter(
      (game) => game.provider === provider && game.game_type === game_type
    );

    return res.status(200).json({
      message: "get game type successfully.",
      status: true,
      data: { data: paginate(filtered, page, size) },
    });
  } catch (error) {
    return fail(res, "gameListByGameTypeAndProvider", error, 500);
  }
};

/* =========================
   HISTORY
========================= */

const gameHistory = async (req, res) => {
  try {
    const { page, size, uid } = req.body || {};
    const playerid = req.params.id;

    if (!page || !size) {
      return res.status(400).json({
        message: "Undefined page & size",
        status: false,
      });
    }
    if (!playerid) {
      return res.status(400).json({
        message: "Undefined player id",
        status: false,
      });
    }
    if (!key) return needKey(res);

    const response = await axios.post(
      `${apiUrl}/history`,
      { playerid, page, size, uid: uid || DEFAULT_HISTORY_UID, key },
      {
        params: {
          playerid,
          page,
          size,
          uid: uid || DEFAULT_HISTORY_UID,
          key,
        },
        headers: {
          ...baseHeaders,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    if (response.data?.status) {
      return res.status(200).json({
        message: "get game history successfully.",
        status: true,
        data: response.data,
      });
    }

    return res.status(502).json({
      message: extractApiError({ response }),
      status: false,
      data: response.data,
    });
  } catch (error) {
    return fail(res, "gameHistory", error);
  }
};

module.exports = {
  checkBalance,
  transferBalance,
  launchGame,
  getgamedetails,
  gameProvider,
  gameType,
  gameListByProvider,
  gameListByGameType,
  gameListByGameTypeAndProvider,
  gameHistory,
};