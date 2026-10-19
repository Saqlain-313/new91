import axios from "axios";
import connection from "../config/connectDB";

// ==================== CONFIG ====================
const apiUrl = process.env.GAME_API_URL || "https://zapcore.live/api";
const key = process.env.GAME_API_KEY || "880h7Ptu2VvetP2BVrWVyul74JR2tNw2";

// ==================== HELPERS ====================
function timerJoin2(params = "", addHours = 0) {
  const date = params ? new Date(Number(params)) : new Date();
  if (addHours !== 0) date.setHours(date.getHours() + addHours);

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
  const getPart = (type) => parts.find((p) => p.type === type).value;

  return `${getPart("year")}-${getPart("month")}-${getPart("day")} ${getPart("hour")}:${getPart("minute")}:${getPart("second")}`;
}

// ==================== EXTERNAL API CONTROLLERS ====================
const checkBalance = async (req, res) => {
  try {
    const { playerid } = req.body;
    if (!playerid) {
      return res.status(400).json({ message: "playerid is required", status: false });
    }

    const response = await axios.post(`${apiUrl}/Userbalance`, { playerid, key });

    if (response.data.status) {
      return res.status(200).json({
        message: "get balance successfully.",
        status: true,
        data: response.data,
      });
    }

    return res.status(500).json({ message: "Internal server error", status: false });
  } catch (error) {
    console.error("checkBalance error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

const transferBalance = async (req, res) => {
  try {
    const { playerid } = req.body;
    if (!playerid) {
      return res.status(400).json({ message: "playerid is required", status: false });
    }

    const responses = await axios.post(`${apiUrl}/Userbalance`, { playerid, key });

    if (Number(responses.data.Balance) <= 0) {
      return res.status(500).json({ message: "Insufficient balance", status: false });
    }

    const checkTime = timerJoin2(Date.now());

    await connection.query(
      "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?",
      [playerid, "Game moved out", responses.data.Balance, checkTime]
    );

    const response = await axios.post(`${apiUrl}/Setbalance`, {
      playerid,
      key,
      opening_balance: -responses.data.Balance,
    });

    if (response.data.status) {
      // NOTE: original set money = BeforeBalance (replaces entire balance).
      // This assumes BeforeBalance is the intended final user wallet amount.
      await connection.query(
        "UPDATE users SET money = ? WHERE phone = ?",
        [Number(response.data.BeforeBalance), playerid]
      );
      return res.status(200).json({
        message: "transfer balance successfully.",
        status: true,
        data: response.data,
      });
    }

    return res.status(500).json({ message: "Internal server error", status: false });
  } catch (error) {
    console.error("transferBalance error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

const launchGame = async (req, res) => {
  let resdata = null;
  try {
    const { playerid, gameId: uid } = req.body;

    if (!playerid) {
      return res.status(400).json({ message: "playerid is required", status: false });
    }

    const [users] = await connection.execute("SELECT * FROM users WHERE phone = ?", [playerid]);
    if (!users.length) {
      return res.status(200).json({ message: "Invalid user", status: false });
    }
    const userInfo = users[0];

    const response = await axios.post(`${apiUrl}/launch-game`, {
      playerid,
      key,
      uid,
      opening_balance: userInfo.money,
    });
    resdata = response.data;

    if (resdata.status) {
      await connection.query("UPDATE users SET money = ? WHERE phone = ?", [0, playerid]);

      if (Number(userInfo.money) > 0) {
        const checkTime = timerJoin2(Date.now());
        await connection.query(
          "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, status = ?, `time` = ?",
          [playerid, "Game moved in", userInfo.money, 2, checkTime]
        );
      }

      return res.status(200).json({
        message: "Start game successfully.",
        status: true,
        data: resdata,
      });
    }

    return res.status(500).json({
      message: "Internal server error (game launch failed)",
      status: false,
      error: resdata,
    });
  } catch (error) {
    if (error.response?.data) resdata = error.response.data;
    console.error("launchGame error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
      data: resdata,
    });
  }
};

const getgamedetails = async (req, res) => {
  try {
    const { page, size } = req.query;
    if (!page || !size) {
      return res.status(400).json({ message: "page & size required", status: false });
    }

    const response = await axios.get(`${apiUrl}/getgamedetails?page=${page}&size=${size}`);

    if (response.data.status) {
      return res.status(200).json({
        message: "get game list successfully.",
        status: true,
        data: response.data,
      });
    }
    return res.status(500).json({ message: "Internal server error", status: false });
  } catch (error) {
    console.error("getgamedetails error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

const gameProvider = async (req, res) => {
  try {
    const response = await axios.get(`${apiUrl}/getgamedetails?provider_list=1`);
    if (response.data.status) {
      return res.status(200).json({
        message: "get game provider successfully.",
        status: true,
        data: response.data,
      });
    }
    return res.status(500).json({ message: "Internal server error", status: false });
  } catch (error) {
    console.error("gameProvider error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

const gameType = async (req, res) => {
  try {
    const response = await axios.get(`${apiUrl}/getgamedetails?gametype_list=1`);
    if (response.data.status) {
      return res.status(200).json({
        message: "get game type successfully.",
        status: true,
        data: response.data,
      });
    }
    return res.status(500).json({ message: "Internal server error", status: false });
  } catch (error) {
    console.error("gameType error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

const gameHistory = async (req, res) => {
  try {
    const { page, size } = req.body;
    const playerid = req.params.id;

    if (!playerid || !page || !size) {
      return res.status(400).json({ message: "playerid, page & size required", status: false });
    }

    const payload = {
      playerid,
      page,
      size,
      uid: "e333695bcff28acdbecc641ae6ee2b23",
      key,
    };

    const response = await axios.post(`${apiUrl}/history`, payload);

    if (response.data.status) {
      return res.status(200).json({
        message: "get game history successfully.",
        status: true,
        data: response.data,
      });
    }
    return res.status(500).json({ message: "Internal server error", status: false });
  } catch (error) {
    console.error("gameHistory error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

// ==================== LOCAL GAME DATA ====================
// NOTE: These arrays are unchanged from the original. In a production app,
// they should live in the DB or a JSON file, not inline in a controller.

const typeAndProviderData = [ /* ... unchanged ... */ ];
const providerData = [ /* ... unchanged ... */ ];
const jilidata = [ /* ... unchanged ... */ ];
const casino10 = [ /* ... unchanged ... */ ];
const casino3 = [ /* ... unchanged ... */ ];
const casino4 = [ /* ... unchanged ... */ ];
const casino2 = [ /* ... unchanged ... */ ];

// ==================== GAME LIST CONTROLLERS ====================
const paginate = (arr, page, size) => {
  const pn = Math.max(1, parseInt(page) || 1);
  const sz = Math.max(1, parseInt(size) || 10);
  const start = (pn - 1) * sz;
  return arr.slice(start, start + sz);
};

const gameListByProvider = async (req, res) => {
  try {
    const { provider = "spribe", page = 1, size = 10 } = req.query;

    // Preserved special-case: page=6 returns jili slot list
    if (Number(page) === 6) {
      return res.status(200).json({
        message: "game type successfully.",
        status: true,
        data: { data: jilidata },
      });
    }

    const filteredGames = providerData.filter((game) => game.provider === provider);
    return res.status(200).json({
      message: "get game list successfully.",
      status: true,
      data: { data: paginate(filteredGames, page, size) },
    });
  } catch (error) {
    console.error("gameListByProvider error:", error);
    return res.status(500).json({ message: "Internal server error", status: false, error: error.message });
  }
};

const gameListByGameType = async (req, res) => {
  try {
    const { game_type = "CasinoLive", page = 1, size = 20 } = req.query;

    const filteredGames = typeAndProviderData.filter((game) => game.game_type === game_type);
    return res.status(200).json({
      message: "get game type successfully.",
      status: true,
      data: { data: paginate(filteredGames, page, size) },
    });
  } catch (error) {
    console.error("gameListByGameType error:", error);
    return res.status(500).json({ message: "Internal server error", status: false, error: error.message });
  }
};

const gameListByGameTypeAndProvider = async (req, res) => {
  try {
    const { provider, game_type, page, size } = req.query;
    if (!provider || !game_type || !page || !size) {
      return res.status(400).json({ message: "provider, game_type, page & size required", status: false });
    }

    // Preserved special-case pagination for evolutionlive
    if (provider === "evolutionlive") {
      const pn = Number(page);
      if (pn === 2) return res.status(200).json({ message: "ok", status: true, data: { data: casino2 } });
      if (pn === 3) return res.status(200).json({ message: "ok", status: true, data: { data: casino3 } });
      if (pn === 4) return res.status(200).json({ message: "ok", status: true, data: { data: casino4 } });
      if (pn === 10) return res.status(200).json({ message: "ok", status: true, data: { data: casino10 } });
    }

    const filteredGames = typeAndProviderData.filter(
      (game) => game.provider === provider && game.game_type === game_type
    );

    return res.status(200).json({
      message: "get game type successfully.",
      status: true,
      data: { data: paginate(filteredGames, page, size) },
    });
  } catch (error) {
    console.error("gameListByGameTypeAndProvider error:", error);
    return res.status(500).json({ message: "Internal server error", status: false, error: error.message });
  }
};

// ==================== EXPORTS ====================
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