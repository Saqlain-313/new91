const crypto = require("crypto");
const request = require("request");
const moment = require("moment-timezone");
const axios = require("axios");
import connection from "../config/connectDB";

// ==================== CONFIG ====================
const agentId = process.env.JILI_AGENT_ID || "battingbook_bdgclub_new_INR";
const agentKey = process.env.JILI_AGENT_KEY || "3bce441fb5390f042959ba25c169281928c64452";
const lang = "en-US";
const api = process.env.JILI_API_BASE || "https://wb-api-2.h5bzgga2.com/api1";

// ==================== HELPERS ====================
const getRechargeOrderId = () => {
  const date = new Date();
  const id_time = `${date.getUTCFullYear()}${date.getUTCMonth() + 1}${date.getUTCDate()}`;
  const id_order = Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) + 10000000000000;
  return id_time + id_order;
};

function getCurrentTimeFormatted() {
  const currentDate = moment().tz("America/Santo_Domingo");
  return currentDate.format("YYMMD");
}

function generateKeyG(agentId, agentKey) {
  const now = getCurrentTimeFormatted();
  return crypto.createHash("md5").update(now + agentId + agentKey).digest("hex");
}

function generateValidationKey(paramsString, keyG) {
  const md5string = crypto.createHash("md5").update(paramsString + keyG).digest("hex");
  return "123456" + md5string + "abcdef";
}

function formateT(params) {
  return params < 10 ? "0" + params : params;
}

function timerJoin(params = "", addHours = 0) {
  const date = params ? new Date(Number(params)) : new Date();
  date.setHours(date.getHours() + addHours);

  const years = formateT(date.getFullYear());
  const months = formateT(date.getMonth() + 1);
  const days = formateT(date.getDate());
  let hours = date.getHours() % 12;
  hours = hours === 0 ? 12 : hours;
  const ampm = date.getHours() < 12 ? "AM" : "PM";
  const minutes = formateT(date.getMinutes());
  const seconds = formateT(date.getSeconds());

  return `${years}-${months}-${days} ${hours}:${minutes}:${seconds} ${ampm}`;
}

function roundDecimal(number, precision) {
  const multiplier = Math.pow(10, precision);
  return Math.round(number * multiplier) / multiplier;
}

// Wraps request.post in a Promise and parses JSON safely
function postForm(url, form) {
  return new Promise((resolve, reject) => {
    request.post({ url, form, followRedirect: true }, (error, response, body) => {
      if (error) return reject(error);
      let parsed = null;
      try {
        parsed = JSON.parse(body);
      } catch (e) {
        // body not JSON (could be 302 redirect HTML) — leave parsed as null
      }
      resolve({ response, body, parsed });
    });
  });
}

// ==================== JILI API ====================
async function login(account, gameId, retryCount = 0) {
  const maxRetries = 3;
  const paramsString = `Account=${account}&GameId=${gameId}&Lang=${lang}&AgentId=${agentId}`;
  const keyG = generateKeyG(agentId, agentKey);
  const key = generateValidationKey(paramsString, keyG);

  const payload = { Account: account, GameId: gameId, Lang: lang, AgentId: agentId, Key: key };
  const apiUrl = `${api}/Login`;

  try {
    const { response, body, parsed } = await postForm(apiUrl, payload);

    if (response.statusCode === 200) {
      if (parsed && parsed.ErrorCode === 14 && parsed.Message === "User not exist or not enabled!") {
        if (retryCount < maxRetries) {
          console.log("User does not exist. Creating member...");
          await createMember(account);
          return await login(account, gameId, retryCount + 1);
        }
        return {};
      }
      return body;
    }

    if (response.statusCode === 302) {
      return { url: response.headers.location };
    }

    console.log("Login failed with status code:", response.statusCode);
    return {};
  } catch (error) {
    console.log("Error during login:", error.message);
    return null;
  }
}

async function createMember(account) {
  const paramsString = `Account=${account}&AgentId=${agentId}`;
  const keyG = generateKeyG(agentId, agentKey);
  const key = generateValidationKey(paramsString, keyG);
  const payload = { Account: account, AgentId: agentId, Key: key };
  const apiUrl = `${api}/CreateMember`;

  try {
    const { body } = await postForm(apiUrl, payload);
    return body;
  } catch (error) {
    console.log("Error creating member:", error.message);
    throw error;
  }
}

async function exchangeTransferByAgentId(account, amount, TransferType, TransactionId) {
  const paramsString = `Account=${account}&TransactionId=${TransactionId}&Amount=${amount}&TransferType=${TransferType}&AgentId=${agentId}`;
  const keyG = generateKeyG(agentId, agentKey);
  const key = generateValidationKey(paramsString, keyG);
  const payload = { Account: account, TransactionId, Amount: amount, TransferType, AgentId: agentId, Key: key };
  const apiUrl = `${api}/ExchangeTransferByAgentId`;

  try {
    const { parsed } = await postForm(apiUrl, payload);
    if (!parsed) throw new Error("Invalid JSON response from ExchangeTransferByAgentId");
    return parsed;
  } catch (error) {
    console.log("Error in exchangeTransferByAgentId:", error.message);
    throw error;
  }
}

async function getMemberInfo(account) {
  const paramsString = `Accounts=${account}&AgentId=${agentId}`;
  const keyG = generateKeyG(agentId, agentKey);
  const key = generateValidationKey(paramsString, keyG);
  const payload = { Accounts: account, AgentId: agentId, Key: key };
  const apiUrl = `${api}/GetMemberInfo`;

  try {
    const { parsed } = await postForm(apiUrl, payload);
    if (!parsed) throw new Error("Invalid JSON response from GetMemberInfo");
    return parsed;
  } catch (error) {
    console.log("Error in getMemberInfo:", error.message);
    throw error;
  }
}

// ==================== CONTROLLERS ====================

// Start a JILI game (transfer user's wallet to JILI + get login URL)
const boardGame = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    let gameId = req.params.gameId;

    if (!auth || !gameId) {
      return res.status(200).json({ message: "Failed", status: false });
    }

    gameId = parseInt(gameId);
    const [rows] = await connection.query("SELECT * FROM users WHERE `token` = ?", [auth]);
    if (!rows.length) {
      return res.status(200).json({ message: "Failed", status: false });
    }

    const { phone, id_user, money } = rows[0];
    const username = `${id_user}${phone}`;

    const response = await login(username, gameId);

    if (response && response.url && response.url.length) {
      const transactionId = getRechargeOrderId();
      const dates = Date.now();
      const checkTime = timerJoin(dates);

      const { Data } = await exchangeTransferByAgentId(username, money, 2, transactionId);

      if (Data) {
        const sql = `INSERT INTO withdrawgame SET id_order = ?, phone = ?, money = ?, gameName = ?, status = ?, today = ?, time = ?`;
        await connection.execute(sql, [
          transactionId,
          phone,
          money,
          "jilli",
          Data.Status,
          checkTime,
          dates,
        ]);
        await connection.query("UPDATE users SET money = money - ? WHERE phone = ?", [money, phone]);
      }
    }

    return res.status(200).json({
      message: "Success",
      status: true,
      data: response,
    });
  } catch (error) {
    console.error("boardGame error:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// Fetch game history in 60-minute chunks for the last 7 days
const gamehistory = async (req, res) => {
  try {
    const Account = req.params.account;
    if (!Account) {
      return res.status(400).json({ message: "Account parameter is required", status: false });
    }

    const currentDate = moment().tz("America/Santo_Domingo");
    const sevenDaysAgo = moment(currentDate).subtract(7, "days");

    const apiUrl = `${api}/GetUserBetRecordByTime`;

    const fetchChunk = async (startTime, endTime) => {
      const paramsString = `StartTime=${startTime}&EndTime=${endTime}&Page=1&PageLimit=10000&Account=${Account}&AgentId=${agentId}`;
      const keyG = generateKeyG(agentId, agentKey);
      const key = generateValidationKey(paramsString, keyG);

      const payload = {
        StartTime: startTime,
        EndTime: endTime,
        Page: 1,
        PageLimit: 10000,
        Account,
        AgentId: agentId,
        Key: key,
      };

      const { parsed } = await postForm(apiUrl, payload);
      if (!parsed) throw new Error("Invalid response from game history API");
      if (parsed.ErrorCode !== 0) throw new Error(parsed.Message || "API error");
      return parsed.Data?.Result || [];
    };

    const results = [];
    let startTime = moment(sevenDaysAgo);

    while (startTime < currentDate) {
      const endTime = moment(startTime).add(60, "minutes");
      const queryEndTime = endTime > currentDate ? currentDate : endTime;

      const chunk = await fetchChunk(
        startTime.format("YYYY-MM-DDTHH:mm:ss"),
        queryEndTime.format("YYYY-MM-DDTHH:mm:ss")
      );
      results.push(...chunk);
      startTime = moment(endTime);
    }

    return res.status(200).json({
      message: "Success",
      status: true,
      data: results,
    });
  } catch (error) {
    console.error("gamehistory error:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

// Get the player's JILI wallet balance
const getboardGameInfo = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false });
    }

    const [rows] = await connection.query("SELECT * FROM users WHERE `token` = ?", [auth]);
    if (!rows.length) {
      return res.status(200).json({ message: "Failed", status: false });
    }

    const { id_user, phone } = rows[0];
    const username = `${id_user}${phone}`;
    const response = await getMemberInfo(username);

    return res.status(200).json({
      message: "Success",
      status: true,
      data: response,
    });
  } catch (error) {
    console.error("getboardGameInfo error:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// Transfer JILI wallet balance back to the user's main wallet
const transferMoneyToMainWallet = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false });
    }

    const [rows] = await connection.query("SELECT * FROM users WHERE `token` = ?", [auth]);
    if (!rows.length) {
      return res.status(200).json({ message: "Failed", status: false });
    }

    const { id_user, phone } = rows[0];
    const username = `${id_user}${phone}`;

    const response = await getMemberInfo(username);
    if (!response.Data || !response.Data.length) {
      return res.status(200).json({ message: "No data found.", status: false });
    }

    const data = response.Data[0];
    const transactionId = getRechargeOrderId();
    const transferResponse = await exchangeTransferByAgentId(username, data.Balance, 1, transactionId);
    const { Data } = transferResponse;

    if (!Data || !Object.keys(Data).length) {
      return res.status(200).json({ message: "Transfer failed.", status: false, data: transferResponse });
    }

    const dates = Date.now();
    const checkTime = timerJoin(dates);
    const sql = `INSERT INTO rechargefromgame SET transaction_id = ?, phone = ?, money = ?, type = ?, status = ?, today = ?, url = ?, time = ?`;
    await connection.execute(sql, [
      transactionId,
      phone,
      data.Balance,
      "jilli",
      Data.Status || null,
      checkTime,
      111,
      dates,
    ]);

    await connection.query("UPDATE users SET money = money + ? WHERE phone = ?", [data.Balance, phone]);

    return res.status(200).json({
      message: "Success",
      status: true,
      data: transferResponse,
    });
  } catch (error) {
    console.error("transferMoneyToMainWallet error:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// Legacy JILI API — start game (external service)
const jillistart = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const gameId = req.params.gameId;

    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false });
    }
    if (!gameId) {
      return res.status(200).json({ message: "Invalid Failed", status: false });
    }

    const [rows] = await connection.query("SELECT * FROM users WHERE `token` = ?", [auth]);
    if (!rows.length) {
      return res.status(200).json({ message: "Failed", status: false });
    }

    const userInfo = rows[0];
    const params = { user: userInfo.phone, money: userInfo.money, gameId };

    const response = await axios.post("https://jiliapi.codehello.site/api/startgame", params);

    if (response.status === 200) {
      await connection.query("UPDATE users SET money = money - ? WHERE phone = ?", [
        userInfo.money,
        userInfo.phone,
      ]);
    }

    return res.status(200).json({
      message: "Success",
      status: true,
      data: response.data.data,
    });
  } catch (error) {
    console.error("jillistart error:", error);
    return res.status(500).json({
      message: "An error occurred.",
      status: false,
      error: error.message,
    });
  }
};

// Legacy JILI API — get wallet balance
const jillimoney = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false });
    }

    const [rows] = await connection.query("SELECT * FROM users WHERE `token` = ?", [auth]);
    if (!rows.length) {
      return res.status(200).json({ message: "Failed", status: false });
    }

    const params = { user: rows[0].phone };
    const response = await axios.post("https://jiliapi.codehello.site/api/getmoney", params);

    return res.status(200).json({
      message: "Success",
      status: true,
      data: response.data.data,
    });
  } catch (error) {
    console.error("jillimoney error:", error);
    return res.status(500).json({
      message: "An error occurred.",
      status: false,
      error: error.message,
    });
  }
};

// Legacy JILI API — transfer wallet back
const jillitransfermoney = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false });
    }

    const [rows] = await connection.query("SELECT * FROM users WHERE `token` = ?", [auth]);
    if (!rows.length) {
      return res.status(200).json({ message: "Failed", status: false });
    }

    const userInfo = rows[0];
    const params = { user: userInfo.phone };
    const response = await axios.post("https://jiliapi.codehello.site/api/transfermoney", params);

    if (response.status === 200) {
      await connection.query("UPDATE users SET money = money + ? WHERE phone = ?", [
        response.data.data.Data.CoinBefore,
        userInfo.phone,
      ]);
    }

    return res.status(200).json({
      message: "Success",
      status: true,
      data: response.data.data,
    });
  } catch (error) {
    console.error("jillitransfermoney error:", error);
    return res.status(500).json({
      message: "An error occurred.",
      status: false,
      error: error.message,
    });
  }
};

// ==================== EXPORTS ====================
module.exports = {
  boardGame,
  getboardGameInfo,
  transferMoneyToMainWallet,
  gamehistory,
  jillistart,
  jillimoney,
  jillitransfermoney,
};