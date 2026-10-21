const crypto = require("crypto");
const request = require("request");
import connection from "../config/connectDB";
const moment = require("moment-timezone");
import axios from "axios";
const getRechargeOrderId = () => {
  const date = new Date();
  let id_time =
    date.getUTCFullYear() +
    "" +
    date.getUTCMonth() +
    1 +
    "" +
    date.getUTCDate();
  let id_order =
    Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) +
    10000000000000;
  return id_time + id_order;
};
function getCurrentTimeFormatted() {
  // const currentDate = new Date();
  // const utcMinus4Time = new Date(currentDate.getTime() - (4 * 60 * 60 * 1000)); // Adjust for UTC-4
  // const year = utcMinus4Time.getFullYear().toString().slice(-2); // Get last two digits of the year
  // const month = (utcMinus4Time.getMonth() + 1).toString().padStart(2, '0'); // Month (01-12)
  // const day = utcMinus4Time.getDate().toString().padStart(2, '0'); // Day (01-31)
  // const formattedDate = year + month + day;
  let currentDate = moment().tz("America/Santo_Domingo");
  let formattedDate = currentDate.format("YYMMD");
  return formattedDate;
}

function generateKeyG(agentId, agentKey) {
  const now = getCurrentTimeFormatted();
  const hash = crypto.createHash("md5");
  hash.update(now + agentId + agentKey);
  return hash.digest("hex");
}

function generateValidationKey(paramsString, keyG) {
  const hash = crypto.createHash("md5");
  hash.update(paramsString + keyG);
  const md5string = hash.digest("hex");
  const randomText1 = "123456";
  const randomText2 = "abcdef";
  const key = randomText1 + md5string + randomText2;
  return key;
}
const agentId = "battingbook_bdgclub_new_INR";
const agentKey = "3bce441fb5390f042959ba25c169281928c64452";
const lang = "en-US";
const api = `https://wb-api-2.h5bzgga2.com/api1`;

async function login(account, gameId, retryCount = 0) {
  const maxRetries = 3;
  const paramsString = `Account=${account}&GameId=${gameId}&Lang=${lang}&AgentId=${agentId}`;
  const keyG = generateKeyG(agentId, agentKey);
  const key = generateValidationKey(paramsString, keyG);
  const payload = {
    Account: account,
    GameId: gameId,
    Lang: lang,
    AgentId: agentId,
    Key: key,
  };

  const apiUrl = `${api}/Login`;
  try {
    const response = await new Promise((resolve, reject) => {
      request.post(
        {
          url: apiUrl,
          form: payload,
          followRedirect: true,
        },
        (error, response, body) => {
          if (error) {
            reject(error);
          } else {
            resolve({ response, body });
          }
        }
      );
    });

    if (response.response.statusCode === 200) {
      let responseBody;

      try {
        responseBody = JSON.parse(response.body);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        console.log(response.body);
      }
      if (
        responseBody &&
        responseBody.ErrorCode === 14 &&
        responseBody.Message === "User not exist or not enabled!"
      ) {
        if (retryCount < maxRetries) {
          console.log(
            "User does not exist or is not enabled. Creating member..."
          );
          await createMember(account);
          //console.log("Retrying login after member creation...");
          return await login(account, gameId, retryCount + 1);
        } else {
          //console.log("Maximum retry attempts reached. Login failed.");
          return {};
        }
      } else {
        return response.body;
      }
    } else if (response.response.statusCode === 302) {
      return {
        url: response.response.headers.location,
      };
    } else {
      console.log(
        "Login failed with status code: ",
        response.response.statusCode
      );
      //console.log("Response body: ", response.body);
      return {};
    }
  } catch (error) {
    //console.log("Error during login: ", error);
    return null;
  }
}
async function createMember(account) {
  const paramsString = `Account=${account}&AgentId=${agentId}`;
  const keyG = generateKeyG(agentId, agentKey);
  const key = generateValidationKey(paramsString, keyG);
  const payload = {
    Account: account,
    AgentId: agentId,
    Key: key,
  };
  const apiUrl = `${api}/CreateMember`;

  try {
    const response = await new Promise((resolve, reject) => {
      request.post({ url: apiUrl, form: payload }, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve({ response, body });
        }
      });
    });
    return response.body;
  } catch (error) {
    //console.log("Error creating member: ", error);
    throw error;
  }
}

async function exchangeTransferByAgentId(
  account,
  amount,
  TransferType,
  TransactionId
) {
  const paramsString = `Account=${account}&TransactionId=${TransactionId}&Amount=${amount}&TransferType=${TransferType}&AgentId=${agentId}`;
  const keyG = generateKeyG(agentId, agentKey);
  const key = generateValidationKey(paramsString, keyG);
  const payload = {
    Account: account,
    TransactionId,
    Amount: amount,
    TransferType,
    AgentId: agentId,
    Key: key,
  };
  const apiUrl = `${api}/ExchangeTransferByAgentId`;

  try {
    const response = await new Promise((resolve, reject) => {
      request.post({ url: apiUrl, form: payload }, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve({ response, body });
        }
      });
    });
    return JSON.parse(response.body);
  } catch (error) {
    //console.log("Error creating member: ", error);
    throw error;
  }
}

function formateT(params) {
  let result = params < 10 ? "0" + params : params;
  return result;
}

function timerJoin(params = "", addHours = 0) {
  let date = "";
  if (params) {
    date = new Date(Number(params));
  } else {
    date = new Date();
  }

  date.setHours(date.getHours() + addHours);

  let years = formateT(date.getFullYear());
  let months = formateT(date.getMonth() + 1);
  let days = formateT(date.getDate());

  let hours = date.getHours() % 12;
  hours = hours === 0 ? 12 : hours;
  let ampm = date.getHours() < 12 ? "AM" : "PM";

  let minutes = formateT(date.getMinutes());
  let seconds = formateT(date.getSeconds());

  return (
    years +
    "-" +
    months +
    "-" +
    days +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds +
    " " +
    ampm
  );
}

function roundDecimal(number, precision) {
  const multiplier = Math.pow(10, precision);
  return Math.round(number * multiplier) / multiplier;
}

async function getMemberInfo(account) {
  const paramsString = `Accounts=${account}&AgentId=${agentId}`;
  const keyG = generateKeyG(agentId, agentKey);
  const key = generateValidationKey(paramsString, keyG);
  const payload = {
    Accounts: account,
    AgentId: agentId,
    Key: key,
  };
  const apiUrl = `${api}/GetMemberInfo`;

  try {
    const response = await new Promise((resolve, reject) => {
      request.post({ url: apiUrl, form: payload }, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve({ response, body: JSON.parse(body) });
        }
      });
    });
    return response.body; //'{"ErrorCode":0,"Message":"","Data":[{"Account":"Testss0ssssa6","Balance":0,"Status":2}]}'
  } catch (error) {
    //console.log("Error creating member: ", error);
    throw error;
  }
}

const boardGame = async (req, res) => {
  let auth = req.cookies.auth;
  let gameId = req.params.gameId;

  //console.log("gameId", gameId);
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
    });
  }
  if (!gameId) {
    return res.status(200).json({
      message: "Failed",
      status: false,
    });
  }
  gameId = parseInt(gameId);
  const [rows] = await connection.query(
    "SELECT * FROM users WHERE `token` = ? ",
    [auth]
  );

  if (!rows) {
    return res.status(200).json({
      message: "Failed",
      status: false,
    });
  }
  const {
    id,
    id_user,
    phone,
    password,
    money,
    ip,
    veri,
    ip_address,
    status,
    time,
    token,
    ...others
  } = rows[0];
  let username = `${id_user}${phone}`;
  //console.log("username", username);
  let response = await login(username, gameId);
  //console.log("response", response);
  if (response && response.url && response.url.length) {
    let transactionId = getRechargeOrderId();
    //console.log("transactionId", transactionId);
    const sql = `INSERT INTO withdrawgame SET 
                    id_order = ?,
                    phone = ?,
                    money = ?,
                    gameName=?,
                    status = ?,
                    today = ?,
                    time = ?`;
    let dates = new Date().getTime();
    let checkTime = timerJoin(dates);
    let { Data } = await exchangeTransferByAgentId(
      username,
      money,
      2,
      transactionId
    );

    if (Data) {
      //console.log("oijijio");
      await connection.execute(sql, [
        transactionId,
        phone,
        money,
        "jilli",
        Data.Status,
        checkTime,
        dates,
      ]);
      await connection.query(
        "UPDATE users SET money = money - ? WHERE phone = ? ",
        [money, phone]
      );
      //console.log("done");
    }
  }
  return res.status(200).json({
    message: "Send SMS regularly.",
    status: true,
    data: response,
  });
};

const gamehistory = async (req, res) => {
  const Account = req.params.account;

  if (!Account) {
    return res.status(400).json({
      message: "Account parameter is required",
      status: false,
    });
  }

  // Set current time and 7 days ago in America/Santo_Domingo timezone
  let currentDate = moment().tz("America/Santo_Domingo");
  let sevenDaysAgo = moment(currentDate).subtract(7, "days");

  const apiUrl = `${api}/GetUserBetRecordByTime`;

  const fetchGameHistoryChunk = async (startTime, endTime) => {
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

    return new Promise((resolve, reject) => {
      request.post({ url: apiUrl, form: payload }, (error, response, body) => {
        if (error) {
          return reject(error);
        }
        try {
          const parsedBody = JSON.parse(body);
          if (parsedBody.ErrorCode !== 0) {
            return reject(new Error(parsedBody.Message || "API error"));
          }
          resolve(parsedBody.Data.Result || []);
        } catch (err) {
          reject(err);
        }
      });
    });
  };

  try {
    const results = [];
    let startTime = moment(sevenDaysAgo);

    while (startTime < currentDate) {
      const endTime = moment(startTime).add(60, "minutes"); // Add 60 minutes

      // Ensure endTime does not exceed currentDate
      const queryEndTime = endTime > currentDate ? currentDate : endTime;

      const chunkResults = await fetchGameHistoryChunk(
        startTime.format("YYYY-MM-DDTHH:mm:ss"),
        queryEndTime.format("YYYY-MM-DDTHH:mm:ss")
      );
      results.push(...chunkResults);

      // Move startTime forward by 60 minutes
      startTime = moment(endTime);
    }

    return res.status(200).json({
      message: "Success",
      status: true,
      data: results,
    });
  } catch (error) {
    console.error("Error querying game history: ", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

const getboardGameInfo = async (req, res) => {
  let auth = req.cookies.auth;

  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
    });
  }

  const [rows] = await connection.query(
    "SELECT * FROM users WHERE `token` = ? ",
    [auth]
  );

  if (!rows) {
    return res.status(200).json({
      message: "Failed",
      status: false,
    });
  }
  const { id, password, ip, veri, ip_address, status, time, token, ...others } =
    rows[0];
  let username = `${others.id_user}${others.phone}`;
  let response = await getMemberInfo(username);

  return res.status(200).json({
    message: "Send SMS regularly.",
    status: true,
    data: response,
  });
};

const transferMoneyToMainWallet = async (req, res) => {
  try {
    // Extract authentication token from cookies
    let auth = req.cookies.auth;

    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
      });
    }

    // Fetch user data by token
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE `token` = ?",
      [auth]
    );
    if (!rows || rows.length === 0) {
      return res.status(200).json({
        message: "Failed",
        status: false,
      });
    }

    const { id_user, phone, money, ...others } = rows[0];
    let username = `${id_user}${phone}`;

    // Fetch member info
    let response = await getMemberInfo(username);
    if (response.Data && response.Data.length) {
      let data = response.Data[0]; // Assuming first element has the needed data
      let transactionId = getRechargeOrderId();

      // Perform transfer
      let transferResponse = await exchangeTransferByAgentId(
        username,
        data.Balance,
        1,
        transactionId
      );
      let { Data } = transferResponse;

      // Check if transfer was successful
      if (Data && Object.keys(Data).length) {
        const sql = `INSERT INTO rechargefromgame SET 
                    transaction_id = ?,
                    phone = ?,
                    money = ?,
                    type = ?,
                    status = ?,
                    today = ?,
                    url = ?,
                    time = ?`;
        let dates = new Date().getTime();
        let checkTime = timerJoin(dates);

        // Insert transaction record
        await connection.execute(sql, [
          transactionId || null,
          phone || null,
          data.Balance,
          "jilli",
          Data.Status || null,
          checkTime || null,
          111,
          dates || null,
        ]);

        // Update user balance
        await connection.query(
          "UPDATE users SET money = money + ? WHERE phone = ?",
          [data.Balance, phone]
        );

        // Respond with success
        return res.status(200).json({
          message: "Send SMS regularly.",
          status: true,
          data: transferResponse,
        });
      }

      // If Data is invalid, respond with transfer details
      return res.status(200).json({
        message: "Transfer failed.",
        status: false,
        data: transferResponse,
      });
    }

    // If no data found in member info
    return res.status(200).json({
      message: "No data found.",
      status: false,
    });
  } catch (error) {
    console.error("Error in transferMoneyToMainWallet:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};

const jillistart = async (req, res) => {
  let auth = req.cookies.auth;
  let gameId = req.params.gameId;

  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
    });
  }

  if (!gameId) {
    return res.status(200).json({
      message: "Invalid Failed",
      status: false,
    });
  }

  try {
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE `token` = ?",
      [auth]
    );

    if (!rows || rows.length === 0) {
      return res.status(200).json({
        message: "Failed",
        status: false,
      });
    }

    const userInfo = rows[0];
    const params = {
      user: userInfo.phone,
      money: userInfo.money,
      gameId: gameId,
    };

    const response = await axios.post(
      "https://jiliapi.codehello.site/api/startgame",
      params
    );
    if (response.status) {
      // Check for successful response
      await connection.query(
        "UPDATE users SET money = money - ? WHERE phone = ?",
        [userInfo.money, userInfo.phone]
      );
    }

    return res.status(200).json({
      message: "Send SMS regularly.",
      status: true,
      data: response.data.data, // Include only the relevant data
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "An error occurred.",
      status: false,
      error: error.message, // Provide error details
    });
  }
};

const jillimoney = async (req, res) => {
  let auth = req.cookies.auth;

  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
    });
  }

  try {
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE `token` = ?",
      [auth]
    );

    if (!rows || rows.length === 0) {
      return res.status(200).json({
        message: "Failed",
        status: false,
      });
    }

    const userInfo = rows[0];
    const params = {
      user: userInfo.phone,
    };

    const response = await axios.post(
      "https://jiliapi.codehello.site/api/getmoney",
      params
    );

    return res.status(200).json({
      message: "Send SMS regularly.",
      status: true,
      data: response.data.data, // Include only the relevant data
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "An error occurred.",
      status: false,
      error: error.message, // Provide error details
    });
  }
};

const jillitransfermoney = async (req, res) => {
  let auth = req.cookies.auth;

  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
    });
  }

  try {
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE `token` = ?",
      [auth]
    );

    if (!rows || rows.length === 0) {
      return res.status(200).json({
        message: "Failed",
        status: false,
      });
    }

    const userInfo = rows[0];
    const params = {
      user: userInfo.phone,
    };

    const response = await axios.post(
      "https://jiliapi.codehello.site/api/transfermoney",
      params
    );

    // //console.log("jgui",response.data.data.Data.CoinBefore)
    if (response.status) {
      await connection.query(
        "UPDATE users SET money = money + ? WHERE phone = ? ",
        [response.data.data.Data.CoinBefore, userInfo.phone]
      );
    }
    return res.status(200).json({
      message: "Send SMS regularly.",
      status: true,
      data: response.data.data, // Include only the relevant data
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "An error occurred.",
      status: false,
      error: error.message, // Provide error details
    });
  }
};

module.exports = {
  boardGame,
  getboardGameInfo,
  transferMoneyToMainWallet,
  gamehistory,
  jillistart,
  jillimoney,
  jillitransfermoney,
};
