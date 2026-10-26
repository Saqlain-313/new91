const axios = require("axios");
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

const apiUrl = process.env.GAME_API_URL || "https://www.api-doc.space/api";
const launchUrl =
  process.env.GAME_LAUNCH_URL || "https://www.api-doc.space/api/launch-game";
const key = (process.env.GAME_API_KEY || "").trim();
const DEFAULT_HISTORY_UID = "e333695bcff28acdbecc641ae6ee2b23";

if (!key) {
  console.error("[FATAL] GAME_API_KEY is not set in .env");
}

const baseHeaders = {
  "x-domain": process.env.GAME_X_DOMAIN || "max-win.site",
  ...(key ? { key } : {}),
};

/* =========================
   HELPERS
========================= */

function timerJoin2(params = "", addHours = 0) {
  let date = params ? new Date(Number(params)) : new Date();
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
  const g = (t) => parts.find((p) => p.type === t).value;
  return `${g("year")}-${g("month")}-${g("day")} ${g("hour")}:${g("minute")}:${g("second")}`;
}

const paginate = (list, page, size) => {
  const p = Math.max(Number(page) || 1, 1);
  const s = Math.max(Number(size) || 10, 1);
  return list.slice((p - 1) * s, (p - 1) * s + s);
};

function extractApiError(error) {
  if (error?.response?.data) {
    const d = error.response.data;
    if (typeof d === "string") return d;
    return d.message || d.msg || JSON.stringify(d);
  }
  return error?.message || "Unknown error";
}

const fail = (res, name, error, httpStatus = 502) => {
  console.error(`${name} error:`, extractApiError(error));
  return res.status(httpStatus).json({
    message: httpStatus === 500 ? "Internal server error" : "Upstream game API error",
    status: false,
    error: extractApiError(error),
  });
};

const needKey = (res) =>
  res
    .status(500)
    .json({ message: "Server misconfigured: missing API key", status: false });

/**
 * Userbalance endpoint par "Key is required" aa raha tha jabki launch-game
 * chal raha tha. Isliye key bhejne ke kai tareeke try karte hain aur jo
 * chal jaye use yaad rakhte hain (server restart tak).
 */
const balanceStrategies = [
  {
    // playerid + key in query string AND in body (not yet verified against provider)
    name: "query-and-body",
    run: (playerid) =>
      axios.post(
        `${apiUrl}/Userbalance?playerid=${encodeURIComponent(playerid)}&key=${encodeURIComponent(key)}`,
        { playerid, key },
        {
          headers: { ...baseHeaders, "Content-Type": "application/json" },
          timeout: 15000,
        }
      ),
  },
  {
    name: "json-body",
    run: (playerid) =>
      axios.post(`${apiUrl}/Userbalance`, { playerid, key }, {
        headers: { ...baseHeaders, "Content-Type": "application/json" },
        timeout: 15000,
      }),
  },
  {
    name: "query-string",
    run: (playerid) =>
      axios.post(`${apiUrl}/Userbalance`, { playerid }, {
        params: { key },
        headers: { ...baseHeaders, "Content-Type": "application/json" },
        timeout: 15000,
      }),
  },
  {
    name: "form-urlencoded",
    run: (playerid) =>
      axios.post(
        `${apiUrl}/Userbalance`,
        new URLSearchParams({ playerid, key }).toString(),
        {
          headers: { ...baseHeaders, "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 15000,
        }
      ),
  },
];

let workingBalanceStrategy = null;

const looksLikeKeyError = (data) =>
  /key is required/i.test(typeof data === "string" ? data : JSON.stringify(data || ""));

async function fetchUserBalance(playerid) {
  const ordered = workingBalanceStrategy
    ? [
        balanceStrategies.find((s) => s.name === workingBalanceStrategy),
        ...balanceStrategies.filter((s) => s.name !== workingBalanceStrategy),
      ]
    : balanceStrategies;

  let last = null;
  for (const s of ordered) {
    try {
      const r = await s.run(playerid);
      console.log(`Userbalance [${s.name}] ->`, r.status, JSON.stringify(r.data));
      if (r.data && typeof r.data === "object" && !looksLikeKeyError(r.data)) {
        if (workingBalanceStrategy !== s.name) {
          workingBalanceStrategy = s.name;
          console.log(`[INFO] Userbalance works with strategy: ${s.name}`);
        }
        return r;
      }
      last = last || r; // pehla asli error rakho, aakhri se overwrite mat karo
    } catch (e) {
      console.log(`Userbalance [${s.name}] failed ->`, extractApiError(e));
      last = last || e.response;
      if (!e.response) throw e; // network/timeout: aage try karne ka fayda nahi
    }
  }
  return last || { data: { status: false, message: "No response from provider" } };
}

// Balance alag-alag naam se aa sakta hai
const readBalance = (d) => {
  const v =
    d?.Balance ?? d?.balance ?? d?.data?.Balance ?? d?.data?.balance ?? d?.money ?? null;
  return v === null || v === undefined ? null : Number(v);
};

/* =========================
   BALANCE
========================= */

const checkBalance = async (req, res) => {
  try {
    const playerid = req.body.playerid;
    if (!playerid) return res.status(400).json({ message: "Undefined token", status: false });
    if (!key) return needKey(res);

    const response = await fetchUserBalance(playerid);
    const d = response.data;

    if (d && d.status) {
      return res.status(200).json({
        message: "get balance successfully.",
        status: true,
        balance: readBalance(d),
        data: d,
      });
    }
    return res.status(502).json({
      message: extractApiError({ response }),
      status: false,
      data: d,
    });
  } catch (error) {
    return fail(res, "checkBalance", error);
  }
};

const transferBalance = async (req, res) => {
  try {
    const playerid = req.body.playerid;
    if (!playerid) return res.status(400).json({ message: "Undefined token", status: false });
    if (!key) return needKey(res);

    const balanceRes = await fetchUserBalance(playerid);
    if (!balanceRes.data?.status) {
      return res.status(502).json({
        message: extractApiError({ response: balanceRes }),
        status: false,
        data: balanceRes.data,
      });
    }

    const gameBalance = readBalance(balanceRes.data);
    if (!gameBalance || gameBalance <= 0) {
      return res.status(400).json({ message: "Insufficient balance", status: false });
    }

    const response = await axios.post(
      `${apiUrl}/Setbalance`,
      { playerid, key, opening_balance: -gameBalance },
      { headers: { ...baseHeaders, "Content-Type": "application/json" }, timeout: 15000 }
    );

    if (!response.data.status) {
      return res.status(502).json({
        message: extractApiError({ response }),
        status: false,
        data: response.data,
      });
    }

    await connection.query("UPDATE users SET money = ? WHERE phone = ?", [
      Number(response.data.BeforeBalance),
      playerid,
    ]);

    await connection.query(
      "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?",
      [playerid, "Game moved out", gameBalance, timerJoin2(Date.now())]
    );

    return res.status(200).json({
      message: "transfer balance successfully.",
      status: true,
      data: response.data,
    });
  } catch (error) {
    return fail(res, "transferBalance", error);
  }
};

/* =========================
   LAUNCH GAME
========================= */

const launchGame = async (req, res) => {
  let resdata = null;
  try {
    const playerid = req.body.playerid;
    const uid = req.body.gameId;

    if (!playerid) return res.status(400).json({ message: "Undefined token", status: false });
    if (!uid) return res.status(400).json({ message: "Undefined gameId", status: false });
    if (!key) return needKey(res);

    const [users] = await connection.execute("SELECT * FROM users WHERE phone = ?", [playerid]);
    if (!users.length) {
      return res.status(200).json({ message: "Invalid user", status: false });
    }

    const openingBalance = Number(users[0].money) || 0;

    const response = await axios.post(
      launchUrl,
      { playerid, key, uid, opening_balance: openingBalance },
      { headers: { ...baseHeaders, "Content-Type": "application/json" }, timeout: 15000 }
    );

    resdata = response.data;

    if (!resdata.status) {
      return res.status(502).json({
        message: "Game launch rejected by provider",
        status: false,
        error: extractApiError({ response }),
        data: resdata,
      });
    }

    const conn = await connection.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query("UPDATE users SET money = ? WHERE phone = ?", [0, playerid]);
      if (openingBalance > 0) {
        await conn.query(
          "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, type = ?, `time` = ?",
          [playerid, "Game moved in", openingBalance, 2, timerJoin2(Date.now())]
        );
      }
      await conn.commit();
    } catch (dbErr) {
      await conn.rollback();
      throw dbErr;
    } finally {
      conn.release();
    }

    return res.status(200).json({
      message: "Start game successfully.",
      status: true,
      data: resdata,
    });
  } catch (error) {
    if (error.response?.data) resdata = error.response.data;
    console.error("Launch game error:", extractApiError(error));
    return res.status(502).json({
      message: "Upstream game API error",
      status: false,
      error: extractApiError(error),
      data: resdata,
    });
  }
};

/* =========================
   GAME LISTS (API)
========================= */

const proxyGet = (name, path, okMessage) => async (req, res) => {
  try {
    const response = await axios.get(`${apiUrl}/${path(req)}`, {
      headers: baseHeaders,
      timeout: 15000,
    });
    if (response.data.status) {
      return res.status(200).json({ message: okMessage, status: true, data: response.data });
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
    return res.status(400).json({ message: "Undefined page & size", status: false });
  }
  return proxyGet(
    "getgamedetails",
    () => `getgamedetails?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`,
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

    const filtered = providerData.filter((g) => g.provider === provider);
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
    const filtered = typeAndProviderData.filter((g) => g.game_type === game_type);
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
      return res.status(400).json({ message: "Undefined page & size", status: false });
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
      (g) => g.provider === provider && g.game_type === game_type
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
    const { page, size, uid } = req.body;
    const playerid = req.params.id;

    if (!page || !size) {
      return res.status(400).json({ message: "Undefined page & size", status: false });
    }
    if (!key) return needKey(res);

    const response = await axios.post(
      `${apiUrl}/history`,
      { playerid, page, size, uid: uid || DEFAULT_HISTORY_UID, key },
      { headers: { ...baseHeaders, "Content-Type": "application/json" }, timeout: 15000 }
    );

    if (response.data.status) {
      return res.status(200).json({
        message: "get game type successfully.",
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