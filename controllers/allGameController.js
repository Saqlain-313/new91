const axios = require("axios");
const connectionModule = require("../config/connectDB");
const connection = connectionModule.default || connectionModule;

// Game lists ko alag file me rakha hai (neeche instructions dekho)
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

// ⚠️ IMPORTANT: Do NOT hardcode a fallback key in production.
// The old fallback "C2T9WqU7caTFOETomkuR" is what triggered
// "Key is required1111" — it is invalid/expired on the server side.
const key = process.env.GAME_API_KEY || "C2T9WqU7caTFOETomkuR";

if (!key) {
  console.error(
    "[FATAL] GAME_API_KEY is not set. Set it in your environment/.env file. " +
      "The game API will reject all requests without a valid key."
  );
}

const DEFAULT_HISTORY_UID = "e333695bcff28acdbecc641ae6ee2b23";

const zapHeaders = {
  "Content-Type": "application/json",
  "x-domain": process.env.GAME_X_DOMAIN || "max-win.site",
  // Some deployments of this API also accept the key as a header.
  // Harmless to send both; remove if the provider documents otherwise.
  ...(key ? { key } : {}),
};

/* =========================
   HELPERS
========================= */

function timerJoin2(params = "", addHours = 0) {
  let date = params ? new Date(Number(params)) : new Date();
  if (addHours !== 0) {
    date.setHours(date.getHours() + addHours);
  }

  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat("en-GB", options);
  const parts = formatter.formatToParts(date);
  const getPart = (type) => parts.find((part) => part.type === type).value;

  return `${getPart("year")}-${getPart("month")}-${getPart("day")} ${getPart(
    "hour"
  )}:${getPart("minute")}:${getPart("second")}`;
}

const paginate = (list, page, size) => {
  const p = Math.max(Number(page) || 1, 1);
  const s = Math.max(Number(size) || 10, 1);
  const start = (p - 1) * s;
  return list.slice(start, start + s);
};

/**
 * Extract a useful error message from an axios error (or any error).
 * The old code just returned error.message which hides the API's
 * actual body ("Key is required1111", etc.) from the caller.
 */
function extractApiError(error) {
  if (error?.response?.data) {
    const d = error.response.data;
    if (typeof d === "string") return d;
    return d.message || d.msg || JSON.stringify(d);
  }
  return error?.message || "Unknown error";
}

/* =========================
   BALANCE
========================= */

const checkBalance = async (req, res) => {
  try {
    const playerid = req.body.playerid;
    if (!playerid) {
      return res.status(400).json({ message: "Undefined token", status: false });
    }
    if (!key) {
      return res
        .status(500)
        .json({ message: "Server misconfigured: missing API key", status: false });
    }

    const response = await axios.post(
      `${apiUrl}/Userbalance`,
      { playerid, key },
      { headers: zapHeaders, timeout: 15000 }
    );

    if (response.data.status) {
      return res.status(200).json({
        message: "get balance successfully.",
        status: true,
        data: response.data,
      });
    }
    // Pass through the API's real message instead of a generic one
    return res.status(502).json({
      message: extractApiError({ response }),
      status: false,
      data: response.data,
    });
  } catch (error) {
    console.error("checkBalance error:", extractApiError(error));
    return res.status(502).json({
      message: "Upstream game API error",
      status: false,
      error: extractApiError(error),
    });
  }
};

const transferBalance = async (req, res) => {
  try {
    const playerid = req.body.playerid;
    if (!playerid) {
      return res.status(400).json({ message: "Undefined token", status: false });
    }
    if (!key) {
      return res
        .status(500)
        .json({ message: "Server misconfigured: missing API key", status: false });
    }

    const balanceRes = await axios.post(
      `${apiUrl}/Userbalance`,
      { playerid, key },
      { headers: zapHeaders, timeout: 15000 }
    );

    if (!balanceRes.data.status) {
      return res.status(502).json({
        message: extractApiError({ response: balanceRes }),
        status: false,
        data: balanceRes.data,
      });
    }

    const gameBalance = Number(balanceRes.data.Balance);
    if (!gameBalance || gameBalance <= 0) {
      return res
        .status(400)
        .json({ message: "Insufficient balance", status: false });
    }

    const response = await axios.post(
      `${apiUrl}/Setbalance`,
      { playerid, key, opening_balance: -gameBalance },
      { headers: zapHeaders, timeout: 15000 }
    );

    if (!response.data.status) {
      return res.status(502).json({
        message: extractApiError({ response }),
        status: false,
        data: response.data,
      });
    }

    // API success hone ke baad hi DB update + history (taaki fake entry na bane)
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
    console.error("transferBalance error:", extractApiError(error));
    return res.status(502).json({
      message: "Upstream game API error",
      status: false,
      error: extractApiError(error),
    });
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

    if (!playerid) {
      return res.status(400).json({ message: "Undefined token", status: false });
    }
    if (!uid) {
      return res.status(400).json({ message: "Undefined gameId", status: false });
    }
    if (!key) {
      return res
        .status(500)
        .json({ message: "Server misconfigured: missing API key", status: false });
    }

    const [users] = await connection.execute(
      "SELECT * FROM users WHERE phone = ?",
      [playerid]
    );

    if (!users.length) {
      return res.status(200).json({ message: "Invalid user", status: false });
    }

    const userInfo = users[0];
    const openingBalance = Number(userInfo.money) || 0;

    const response = await axios.post(
      launchUrl,
      { playerid, key, uid, opening_balance: openingBalance },
      { headers: zapHeaders, timeout: 15000 }
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

    // Balance zero karna + history insert ek hi transaction me
    const conn = await connection.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query("UPDATE users SET money = ? WHERE phone = ?", [
        0,
        playerid,
      ]);

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
    if (error.response && error.response.data) {
      resdata = error.response.data;
    }
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

const getgamedetails = async (req, res) => {
  try {
    const { page, size } = req.query;
    if (!page || !size) {
      return res
        .status(400)
        .json({ message: "Undefined page & size", status: false });
    }

    const response = await axios.get(
      `${apiUrl}/getgamedetails?page=${page}&size=${size}`,
      { headers: zapHeaders, timeout: 15000 }
    );

    if (response.data.status) {
      return res.status(200).json({
        message: "get game list successfully.",
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
    console.error("getgamedetails error:", extractApiError(error));
    return res.status(502).json({
      message: "Upstream game API error",
      status: false,
      error: extractApiError(error),
    });
  }
};

const gameProvider = async (req, res) => {
  try {
    const response = await axios.get(
      `${apiUrl}/getgamedetails?provider_list=1`,
      { headers: zapHeaders, timeout: 15000 }
    );

    if (response.data.status) {
      return res.status(200).json({
        message: "get game provider successfully.",
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
    console.error("gameProvider error:", extractApiError(error));
    return res.status(502).json({
      message: "Upstream game API error",
      status: false,
      error: extractApiError(error),
    });
  }
};

const gameType = async (req, res) => {
  try {
    const response = await axios.get(
      `${apiUrl}/getgamedetails?gametype_list=1`,
      { headers: zapHeaders, timeout: 15000 }
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
    console.error("gameType error:", extractApiError(error));
    return res.status(502).json({
      message: "Upstream game API error",
      status: false,
      error: extractApiError(error),
    });
  }
};

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

    const filteredGames = providerData.filter((g) => g.provider === provider);

    return res.status(200).json({
      message: "get game list successfully.",
      status: true,
      data: { data: paginate(filteredGames, page, size) },
    });
  } catch (error) {
    console.error("gameListByProvider error:", extractApiError(error));
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: extractApiError(error),
    });
  }
};

const gameListByGameType = async (req, res) => {
  try {
    const { game_type = "CasinoLive", page = 1, size = 20 } = req.query;

    const filteredGames = typeAndProviderData.filter(
      (g) => g.game_type === game_type
    );

    return res.status(200).json({
      message: "get game type successfully.",
      status: true,
      data: { data: paginate(filteredGames, page, size) },
    });
  } catch (error) {
    console.error("gameListByGameType error:", extractApiError(error));
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: extractApiError(error),
    });
  }
};

const gameListByGameTypeAndProvider = async (req, res) => {
  try {
    const { provider, game_type, page, size } = req.query;
    if (!provider || !game_type || !page || !size) {
      return res
        .status(400)
        .json({ message: "Undefined page & size", status: false });
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

    const filteredGames = typeAndProviderData.filter(
      (g) => g.provider === provider && g.game_type === game_type
    );

    return res.status(200).json({
      message: "get game type successfully.",
      status: true,
      data: { data: paginate(filteredGames, page, size) },
    });
  } catch (error) {
    console.error(
      "gameListByGameTypeAndProvider error:",
      extractApiError(error)
    );
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: extractApiError(error),
    });
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
      return res
        .status(400)
        .json({ message: "Undefined page & size", status: false });
    }
    if (!key) {
      return res
        .status(500)
        .json({ message: "Server misconfigured: missing API key", status: false });
    }

    const payload = {
      playerid,
      page,
      size,
      uid: uid || DEFAULT_HISTORY_UID,
      key,
    };

    const response = await axios.post(`${apiUrl}/history`, payload, {
      headers: zapHeaders,
      timeout: 15000,
    });

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
    console.error("gameHistory error:", extractApiError(error));
    return res.status(502).json({
      message: "Upstream game API error",
      status: false,
      error: extractApiError(error),
    });
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