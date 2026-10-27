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

// Max Setbalance + verify attempts.
const setBalanceMaxAttempts = Math.max(
  Number(process.env.GAME_SETBALANCE_MAX_ATTEMPTS) || 4,
  1
);

// Residual fallback for providers that reject 0.
const resetResidual = Math.max(
  Number(process.env.GAME_RESET_RESIDUAL ?? 0.01) || 0,
  0
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const round2 = (number) => {
  const n = Number(number);
  if (!Number.isFinite(n)) return NaN;
  return Math.round((n + Number.EPSILON) * 100) / 100;
};

const makeTransferRef = () =>
  `tr_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;

/* =========================
   BALANCE UNIT NORMALIZATION
   Converts a raw provider balance into a decimal amount (₹ / USD),
   respecting balanceUnit. Also converts a decimal amount into the
   wire format the provider expects.
========================= */

function fromProviderBalance(rawValue) {
  if (rawValue === null || rawValue === undefined || rawValue === "") return null;
  const n = Number(rawValue);
  if (!Number.isFinite(n)) return null;
  // Provider returns cents: 50000 means 500.00
  if (balanceUnit === "cents") return n / 100;
  return n;
}

function toProviderBalance(decimalAmount) {
  const n = Number(decimalAmount);
  if (!Number.isFinite(n)) throw new Error("Invalid balance amount");
  if (balanceUnit === "cents") return Math.round(n * 100);
  return n;
}

function readBalance(data) {
  const value =
    data?.Balance ??
    data?.balance ??
    data?.data?.Balance ??
    data?.data?.balance ??
    data?.money ??
    null;

  return fromProviderBalance(value);
}

const isTrueStatus = (data) =>
  data?.status === true ||
  data?.status === 1 ||
  String(data?.status).toLowerCase() === "true";

const isExplicitFail = (data) =>
  data?.status === false ||
  data?.status === 0 ||
  String(data?.status).toLowerCase() === "false";

/* =========================
   SETBALANCE PLAN
========================= */

function formatOpeningBalance(wireBalance, formatIndex) {
  const variants = [
    String(wireBalance),
    Number(wireBalance).toFixed(2),
    wireBalance,
  ];
  return variants[formatIndex % variants.length];
}

function buildResetPlan() {
  // Every attempt must target an actual zero balance.
  return [
    { targetDecimal: 0, formatIndex: 0 },
    { targetDecimal: 0, formatIndex: 1 },
    { targetDecimal: 0, formatIndex: 2 },
  ].slice(0, setBalanceMaxAttempts);
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

const updateTransferProgress = (transferRef, amount, providerBalance) =>
  writeTransferLog(
    `UPDATE game_transfers SET amount = ?, provider_balance_after = ?
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

async function setProviderBalance(playerid, openingBalanceDecimal, formatIndex = 0) {
  if (!key) throw new Error("GAME_API_KEY is missing");

  // Negative opening_balance is intentionally supported for provider balance
  // deduction/reset: e.g. live balance 10781.02 -> send -10781.02.
  const numericBalance = Number(openingBalanceDecimal);
  if (!Number.isFinite(numericBalance)) {
    throw new Error("opening_balance must be a finite number");
  }

  const wireBalance = toProviderBalance(numericBalance);
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

async function setProviderBalanceAndVerify(playerid) {
  let lastResponse = null;
  let lastProviderBalance = null;
  let lastReason = "exhausted";

  for (let attempt = 1; attempt <= setBalanceMaxAttempts; attempt++) {
    // 1) Always fetch the current provider balance before sending a deduction.
    let liveResponse;
    let liveData;
    try {
      liveResponse = await fetchUserBalance(playerid);
      liveData = liveResponse?.data;
    } catch (err) {
      console.error(`[setProviderBalanceAndVerify] attempt ${attempt} Userbalance failed:`, extractApiError(err));
      lastReason = "balance_fetch_failed";
      if (attempt < setBalanceMaxAttempts) await sleep(setBalanceSettleMs);
      continue;
    }

    if (!isTrueStatus(liveData)) {
      console.warn(`[setProviderBalanceAndVerify] attempt ${attempt} Userbalance status false:`, JSON.stringify(liveData ?? null));
      lastReason = "verify_status_false";
      if (attempt < setBalanceMaxAttempts) await sleep(setBalanceSettleMs);
      continue;
    }

    const currentBalance = readBalance(liveData);
    if (currentBalance === null || !Number.isFinite(currentBalance)) {
      lastReason = "invalid_provider_balance";
      if (attempt < setBalanceMaxAttempts) await sleep(setBalanceSettleMs);
      continue;
    }

    lastProviderBalance = currentBalance;

    // Provider is already at zero; do not send a needless adjustment.
    if (Math.abs(currentBalance) <= 0.01) {
      return { ok: true, providerBalance: currentBalance, targetUsed: 0, attempts: attempt, lastResponse };
    }

    // 2) Deduct the exact current balance using a negative opening_balance.
    // Example: Balance=10781.02 -> opening_balance=-10781.02.
    const negativeBalance = round2(-currentBalance);
    try {
      lastResponse = await setProviderBalance(playerid, negativeBalance, (attempt - 1) % 3);
    } catch (err) {
      console.error(`[setProviderBalanceAndVerify] attempt ${attempt} Setbalance failed:`, extractApiError(err));
      lastReason = "provider_rejected";
      if (attempt < setBalanceMaxAttempts) await sleep(setBalanceSettleMs * attempt);
      continue;
    }

    if (isExplicitFail(lastResponse?.data)) {
      console.warn(`[setProviderBalanceAndVerify] attempt ${attempt} provider rejected:`, JSON.stringify(lastResponse?.data ?? null));
      lastReason = "provider_rejected";
      if (attempt < setBalanceMaxAttempts) await sleep(setBalanceSettleMs * attempt);
      continue;
    }

    // 3) Wait for provider processing, then verify using Userbalance.
    await sleep(setBalanceSettleMs * attempt);
    try {
      const verifyResponse = await fetchUserBalance(playerid);
      const verifyData = verifyResponse?.data;
      if (!isTrueStatus(verifyData)) {
        lastReason = "verify_status_false";
      } else {
        const verifiedBalance = readBalance(verifyData);
        lastProviderBalance = verifiedBalance;
        if (verifiedBalance !== null && Math.abs(verifiedBalance) <= 0.01) {
          return { ok: true, providerBalance: verifiedBalance, targetUsed: 0, attempts: attempt, lastResponse };
        }
        lastReason = "balance_not_zero";
        console.warn(`[setProviderBalanceAndVerify] attempt ${attempt} balance still not zero: ${verifiedBalance}`);
      }
    } catch (err) {
      lastReason = "verify_failed";
      console.error(`[setProviderBalanceAndVerify] attempt ${attempt} verify failed:`, extractApiError(err));
    }

    if (attempt < setBalanceMaxAttempts) await sleep(setBalanceSettleMs);
  }

  return {
    ok: false,
    reason: lastReason,
    providerBalance: lastProviderBalance,
    targetUsed: lastProviderBalance === null ? null : round2(-lastProviderBalance),
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
  let userPhone;
  let walletCredited = false;

  try {
    playerid = req.body?.playerid;
    transferRef = req.body?.transferRef || makeTransferRef();

    if (!playerid) {
      return res.status(400).json({ status: false, message: "Undefined token" });
    }
    if (!key) return needKey(res);

    // Create/lock the transfer record first to prevent duplicate wallet credits.
    conn = await connection.getConnection();
    await conn.beginTransaction();
    transactionStarted = true;

    const user = await findUserByIdentifier(conn, playerid, true);
    if (!user) {
      await conn.rollback(); transactionStarted = false;
      return res.status(404).json({ status: false, message: "User not found" });
    }
    userPhone = user.phone;
    const userMoneyBefore = round2(Number(user.money));
    if (!Number.isFinite(userMoneyBefore) || userMoneyBefore < 0) {
      await conn.rollback(); transactionStarted = false;
      return res.status(500).json({ status: false, message: "Invalid user wallet balance" });
    }

    const [existing] = await conn.query(
      `SELECT status, amount, provider_balance_after, user_money_before, user_money_after
       FROM game_transfers WHERE transfer_ref = ? LIMIT 1 FOR UPDATE`,
      [transferRef]
    );
    if (existing.length) {
      const row = existing[0];
      if (row.status === "completed") {
        await conn.commit(); transactionStarted = false;
        return res.status(200).json({
          status: true, message: "Transfer already completed",
          data: { playerid, transferRef, transferredAmount: Number(row.amount),
            providerBalanceAfter: row.provider_balance_after, userPhone,
            userMoneyBefore: Number(row.user_money_before),
            userMoneyAfter: Number(row.user_money_after), idempotent: true }
        });
      }
      if (row.status === "pending") {
        await conn.rollback(); transactionStarted = false;
        return res.status(409).json({ status: false,
          message: "This transfer is pending. Run reconcileTransfer with the same transferRef; do not create a new reference.", transferRef });
      }
      // Failed reference may be retried; reset its persisted progress.
      await conn.query(`UPDATE game_transfers SET status='pending', amount=0,
        provider_balance_after=NULL, user_money_before=NULL, user_money_after=NULL
        WHERE transfer_ref=?`, [transferRef]);
    } else {
      await conn.query(`INSERT INTO game_transfers
        (transfer_ref, phone, playerid, status, amount, created_at)
        VALUES (?, ?, ?, 'pending', 0, ?)`,
        [transferRef, userPhone, String(playerid), timerJoin2(Date.now())]);
    }

    // 1) Read the provider balance first.
    const balanceResponse = await fetchUserBalance(playerid);
    const balanceData = balanceResponse?.data;
    if (!isTrueStatus(balanceData)) {
      await conn.query(`UPDATE game_transfers SET status='failed' WHERE transfer_ref=?`, [transferRef]);
      await conn.commit(); transactionStarted = false;
      return res.status(502).json({ status: false, message: "Unable to fetch provider balance", data: balanceData ?? null, transferRef });
    }

    gameBalance = round2(readBalance(balanceData));
    if (!Number.isFinite(gameBalance) || gameBalance <= 0) {
      await conn.query(`UPDATE game_transfers SET status='failed', amount=0 WHERE transfer_ref=?`, [transferRef]);
      await conn.commit(); transactionStarted = false;
      return res.status(400).json({ status: false, message: "Insufficient provider balance", providerBalance: gameBalance, transferRef });
    }

    // 2) Credit wallet FIRST and persist the credit marker atomically.
    const userMoneyAfter = round2(userMoneyBefore + gameBalance);
    const [updateResult] = await conn.query("UPDATE users SET money = ? WHERE phone = ?", [userMoneyAfter, userPhone]);
    if (updateResult.affectedRows !== 1) throw new Error("User wallet update failed");

    await conn.query(`INSERT INTO transaction_history
      SET phone = ?, detail = ?, balance = ?, \`time\` = ?`,
      [userPhone, "Game moved out (pending provider reset)", gameBalance, timerJoin2(Date.now())]);

    await conn.query(`UPDATE game_transfers SET status='pending', amount=?,
      provider_balance_after=NULL, user_money_before=?, user_money_after=?
      WHERE transfer_ref=?`, [gameBalance, userMoneyBefore, userMoneyAfter, transferRef]);

    await conn.commit(); transactionStarted = false;
    walletCredited = true;

    // 3) Only after wallet credit is committed, reset provider to zero and verify.
    const reset = await setProviderBalanceAndVerify(playerid);
    if (!reset.ok) {
      console.error(`[transferBalance] wallet credited; provider reset pending playerid=${playerid} transferRef=${transferRef} providerBalance=${reset.providerBalance}`);
      await updateTransferProgress(transferRef, gameBalance, reset.providerBalance);
      return res.status(409).json({
        status: false,
        message: "Wallet credited, but provider balance is not verified as zero. Transfer remains pending; call reconcileTransfer using this transferRef. Do not retry with a new reference.",
        transferRef, transferredAmount: gameBalance,
        providerBalance: reset.providerBalance, reason: reset.reason, attempts: reset.attempts,
        walletCredited: true, userMoneyBefore, userMoneyAfter
      });
    }

    await writeTransferLog(`UPDATE game_transfers SET status='completed', amount=?,
      provider_balance_after=?, user_money_before=?, user_money_after=? WHERE transfer_ref=?`,
      [gameBalance, reset.providerBalance, userMoneyBefore, userMoneyAfter, transferRef]);

    return res.status(200).json({ status: true, message: "Provider balance transferred to wallet and provider reset verified",
      data: { playerid, transferRef, transferredAmount: gameBalance,
        providerBalanceBefore: gameBalance, providerBalanceAfter: reset.providerBalance,
        userPhone, userMoneyBefore, userMoneyAfter, walletCredited: true, attempts: reset.attempts } });
  } catch (error) {
    if (conn && transactionStarted) {
      try { await conn.rollback(); } catch (e) { console.error("[transferBalance] Rollback failed:", e.message); }
    }
    console.error("[transferBalance]", extractApiError(error));
    // Never mark failed after a wallet credit: reconciliation must not credit again.
    if (!walletCredited && transferRef) {
      await markTransferFailed(transferRef, gameBalance, null);
    }
    return fail(res, "transferBalance", error);
  } finally {
    if (conn) { try { conn.release(); } catch (e) { console.error("[transferBalance] Release failed:", e.message); } }
  }
};

/* =========================
   RECONCILE PENDING TRANSFER
   Fixes rows stuck in 'pending'. Safe to call repeatedly.
========================= */

const reconcileTransfer = async (req, res) => {
  const transferRef = req.body?.transferRef || req.params?.transferRef;
  if (!transferRef) return res.status(400).json({ status: false, message: "transferRef required" });
  if (!key) return needKey(res);

  let conn;
  try {
    conn = await connection.getConnection();
    await conn.beginTransaction();
    const [rows] = await conn.query(`SELECT transfer_ref, phone, playerid, status, amount,
      provider_balance_after, user_money_before, user_money_after
      FROM game_transfers WHERE transfer_ref=? LIMIT 1 FOR UPDATE`, [transferRef]);
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ status: false, message: "Transfer not found" });
    }
    const row = rows[0];
    if (row.status === "completed") {
      await conn.rollback();
      return res.status(200).json({ status: true, message: "Already completed", data: row });
    }

    // A persisted user_money_after means the wallet credit was committed already.
    // Never credit the wallet a second time during reconciliation.
    const walletAlreadyCredited = row.user_money_after !== null && row.user_money_after !== undefined && Number(row.amount) > 0;
    if (!walletAlreadyCredited) {
      await conn.rollback();
      return res.status(409).json({ status: false,
        message: "No confirmed wallet-credit marker exists for this transfer. Automatic credit is blocked to prevent double credit; manual review required.", transferRef });
    }
    await conn.commit();

    // Reset/verify provider balance; do not change wallet here.
    let liveProviderBalance = null;
    try {
      const live = await fetchUserBalance(row.playerid);
      if (isTrueStatus(live?.data)) liveProviderBalance = readBalance(live.data);
    } catch (e) {
      console.error("[reconcileTransfer] Userbalance failed:", e.message);
    }

    if (liveProviderBalance === null || Math.abs(liveProviderBalance) > 0.01) {
      const reset = await setProviderBalanceAndVerify(row.playerid);
      if (!reset.ok) {
        await updateTransferProgress(transferRef, Number(row.amount), reset.providerBalance ?? liveProviderBalance);
        return res.status(409).json({ status: false,
          message: "Wallet was already credited; provider reset still not verified. No second wallet credit was made.",
          transferRef, walletCredited: true, providerBalance: reset.providerBalance ?? liveProviderBalance,
          reason: reset.reason, attempts: reset.attempts });
      }
      liveProviderBalance = reset.providerBalance;
    }

    await writeTransferLog(`UPDATE game_transfers SET status='completed', provider_balance_after=?, amount=? WHERE transfer_ref=?`,
      [liveProviderBalance, Number(row.amount), transferRef]);
    return res.status(200).json({ status: true, message: "Reconciled: provider is zero; existing wallet credit retained",
      data: { transferRef, creditedAmount: Number(row.amount), liveProviderBalance, walletCredited: true } });
  } catch (e) {
    if (conn) { try { await conn.rollback(); } catch (_) {} }
    return fail(res, "reconcileTransfer", e);
  } finally {
    if (conn) { try { conn.release(); } catch (_) {} }
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

    // 1. Lock wallet, zero it, commit BEFORE provider call.
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

    // 2. Call provider.
    let response;
    try {
      const wireBalance = toProviderBalance(openingBalance);
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

    // 3. History (non-fatal).
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
  reconcileTransfer,   // NEW
  launchGame,
  getgamedetails,
  gameProvider,
  gameType,
  gameListByProvider,
  gameListByGameType,
  gameListByGameTypeAndProvider,
  gameHistory,
};