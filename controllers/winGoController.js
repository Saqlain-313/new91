import connection from "../config/connectDB";
import axios from "axios";
require("dotenv").config();
import path from 'path';
import fs from 'fs';

/* ============================================================
   SHARED HELPERS
   ============================================================ */

const isNumber = (params) => /^\d+$/.test(String(params));

const formateT = (params) => (params < 10 ? "0" + params : params);

const generateRandomHash = (length) => {
  const characters = "abcdef0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
};

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
  const getPart = (type) => parts.find((p) => p.type === type).value;
  return `${getPart("year")}-${getPart("month")}-${getPart("day")} ${getPart("hour")}:${getPart("minute")}:${getPart("second")}`;
}

function shuffleArrayInPlace(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("API timeout")), ms)),
  ]);

// Safety helper — undefined ko null bana deta hai (MySQL2 undefined reject karta hai)
const safeParam = (v) => (v === undefined ? null : v);

/* ============================================================
   GAME / PERIOD MAPPINGS
   ============================================================ */

const GAME_MAP = {
  1: "wingo",
  3: "wingo3",
  5: "wingo5",
  10: "wingo10",
  11: "trx",
  33: "trx3",
  55: "trx5",
  100: "trx10",
};

const VALID_TYPEIDS = [1, 3, 5, 10, 11, 33, 55, 100];

/* ============================================================
   PAGES
   ============================================================ */

const winGoPage = async (req, res) => res.render("bet/wingo/win.ejs");
const winGoPage3 = async (req, res) => res.render("bet/wingo/win3.ejs");
const winGoPage5 = async (req, res) => res.render("bet/wingo/win5.ejs");
const winGoPage10 = async (req, res) => res.render("bet/wingo/win10.ejs");
const trxPage = async (req, res) => res.render("bet/trx/trx.ejs");
const trxPage3 = async (req, res) => res.render("bet/trx/trx3.ejs");
const trxPage5 = async (req, res) => res.render("bet/trx/trx5.ejs");
const trxPage10 = async (req, res) => res.render("bet/trx/trx10.ejs");

/* ============================================================
   COMMISSIONS
   ============================================================ */

const commissions = async (auth, money) => {
  try {
    const [user] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `user_level`, `total_money` FROM users WHERE token = ?",
      [auth]
    );
    if (!user.length) return;

    const [level] = await connection.query("SELECT * FROM level");
    const checkTime2 = timerJoin2(Date.now());

    let uplines2 = user;
    let count = 0;

    for (let i = 0; i < 6; i++) {
      if (uplines2.length === 0) break;
      const rosesFs = (money / 100) * level[i].f1;

      const [upline1] = await connection.query("SELECT * FROM users WHERE code = ?", [
        uplines2[0].invite,
      ]);
      if (upline1.length === 0) break;

      count++;

      await connection.execute(
        `INSERT INTO commission SET phone = ?, bonusby = ?, type = ?, commission = ?, amount = ?, level = ?, date = ?`,
        [upline1[0].phone, uplines2[0].phone, "Bet", rosesFs, money, count, checkTime2]
      );
      await connection.query(
        `INSERT INTO subordinatedata SET phone = ?, bonusby = ?, type = ?, commission = ?, amount = ?, level = ?, date = ?`,
        [upline1[0].phone, uplines2[0].phone, "bet commission", rosesFs, money, count, checkTime2]
      );
      await connection.query(
        "UPDATE users SET pending_commission = pending_commission + ? WHERE phone = ?",
        [rosesFs, upline1[0].phone]
      );

      uplines2 = upline1;
    }
  } catch (e) {
    console.error("commissions error:", e.message);
  }
};

/* ============================================================
   BET PLACE
   ============================================================ */

const betWinGo = async (req, res) => {
  try {
    const { typeid, join, x, money } = req.body;
    const auth = req.cookies.auth;

    const typeidNum = Number(typeid);
    const xNum = Number(x);
    const moneyNum = Number(money);

    if (!VALID_TYPEIDS.includes(typeidNum)) {
      return res.status(400).json({ message: "Invalid type id", status: false });
    }
    if (
      !["l", "n", "d", "x", "t", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(
        String(join)
      )
    ) {
      return res.status(400).json({ message: "Invalid bet option", status: false });
    }
    if (
      !isNumber(x) || !isNumber(money) ||
      isNaN(xNum) || isNaN(moneyNum) ||
      xNum <= 0 || moneyNum <= 0
    ) {
      return res.status(400).json({ message: "Invalid data", status: false });
    }

    const gameJoin = GAME_MAP[typeidNum];

    const [winGoNow] = await connection.query(
      `SELECT period FROM wingo WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1`,
      [gameJoin]
    );
    const [user] = await connection.query(
      "SELECT * FROM users WHERE token = ? AND veri = 1 LIMIT 1",
      [auth]
    );

    if (!winGoNow[0] || !user[0]) {
      return res.status(400).json({ message: "Invalid data", status: false });
    }

    const userInfo = user[0];
    const period = winGoNow[0].period;
    const fee = xNum * moneyNum * 0.02;
    const total = xNum * moneyNum - fee;

    if (userInfo.money - total < 0) {
      return res.status(400).json({ message: "The amount is not enough", status: false });
    }

    // Account lock check
    if (userInfo.legal_bet_score >= 10) {
      await connection.execute(
        "UPDATE users SET status = 2, token = 0 WHERE phone = ?",
        [userInfo.phone]
      );
      const [updatedUser] = await connection.query(
        "SELECT * FROM users WHERE phone = ? LIMIT 1",
        [userInfo.phone]
      );
      return res.status(403).json({
        message: "Your account is locked",
        status: true,
        change: updatedUser[0]?.level || null,
        money: updatedUser[0]?.money || 0,
      });
    }

    // Must have recharged at least once
    const [recharges] = await connection.query(
      "SELECT id FROM recharge WHERE phone = ? AND status = 1 LIMIT 1",
      [userInfo.phone]
    );
    if (recharges.length === 0) {
      return res.status(200).json({ message: "Need to first recharge", status: false });
    }

    const date = new Date();
    const id_product =
      formateT(date.getFullYear()) +
      formateT(date.getMonth() + 1) +
      formateT(date.getDate()) +
      Math.floor(Math.random() * 1000000000000000);
    const checkTime = timerJoin2(date.getTime());

    await connection.execute(
      `INSERT INTO minutes_1 SET 
        id_product = ?, phone = ?, code = ?, invite = ?, stage = ?, level = ?, 
        money = ?, amount = ?, fee = ?, get = ?, game = ?, bet = ?, status = ?, 
        today = ?, time = ?, isdemo = ?`,
      [
        id_product,
        safeParam(userInfo.phone),
        safeParam(userInfo.code),
        safeParam(userInfo.invite),
        safeParam(period),
        safeParam(userInfo.level),
        total,
        xNum,
        fee,
        0,
        gameJoin,
        String(join),
        0,
        checkTime,
        date.getTime(),
        safeParam(userInfo.isdemo),
      ]
    );

    // Legal-trade scoring
    const [bigScore] = await connection.query(
      "SELECT * FROM minutes_1 WHERE phone = ? AND stage = ? AND bet = ?",
      [userInfo.phone, period, "l"]
    );
    const [smallScore] = await connection.query(
      "SELECT * FROM minutes_1 WHERE phone = ? AND stage = ? AND bet = ?",
      [userInfo.phone, period, "n"]
    );

    if (bigScore.length >= 1 && smallScore.length >= 1 && bigScore.length === smallScore.length) {
      const [existingTrade] = await connection.query(
        "SELECT * FROM ligal_trade WHERE user_id = ? AND period = ? AND game = ?",
        [userInfo.id_user, period, gameJoin]
      );
      if (existingTrade.length >= 1) {
        await connection.query(
          "UPDATE ligal_trade SET score = score + ?, date = ? WHERE id = ?",
          [1, checkTime, existingTrade[0].id]
        );
      } else {
        await connection.query(
          "INSERT INTO ligal_trade SET period = ?, user_id = ?, phone = ?, game = ?, score = ?, date = ?",
          [period, userInfo.id_user, userInfo.phone, gameJoin, 1, checkTime]
        );
      }
      await connection.execute(
        "UPDATE users SET legal_bet_score = legal_bet_score + ? WHERE token = ?",
        [1, auth]
      );
    }

    // Deduct balance
    await connection.execute(
      "UPDATE users SET money = money - ?, rebate = rebate + ? WHERE token = ?",
      [xNum * moneyNum, xNum * moneyNum, auth]
    );

    // Adjust recharge pool
    const totalRecharge = Math.max((userInfo.recharge || 0) - xNum * moneyNum, 0);
    await connection.execute("UPDATE users SET recharge = ? WHERE phone = ?", [
      totalRecharge,
      userInfo.phone,
    ]);

    await commissions(auth, xNum * moneyNum);

    const [updatedUser] = await connection.query(
      "SELECT * FROM users WHERE token = ? AND veri = 1 LIMIT 1",
      [auth]
    );

    return res.status(200).json({
      message: "Bet Succeeded",
      status: true,
      change: updatedUser[0].level,
      money: updatedUser[0].money,
    });
  } catch (error) {
    console.error("Error in betWinGo:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

/* ============================================================
   LIST ORDERS (history)
   ============================================================ */

const listOrderOld = async (req, res) => {
  try {
    const { typeid, pageno, pageto } = req.body;
    const typeidNum = Number(typeid);

    if (!VALID_TYPEIDS.includes(typeidNum)) {
      return res.status(200).json({ message: "Invalid type id", status: false });
    }
    if (Number(pageno) < 1 || Number(pageto) < 1) {
      return res.status(200).json({
        code: 0,
        msg: "No more data",
        data: { gameslist: [] },
        status: false,
      });
    }

    const auth = req.cookies.auth;
    const [user] = await connection.query(
      "SELECT phone, code, invite, level, money FROM users WHERE token = ? AND veri = 1 LIMIT 1",
      [auth]
    );
    if (!user[0]) {
      return res.status(200).json({ message: "Error! user is missing.", status: false });
    }

    const game = GAME_MAP[typeidNum];
    const offset = Number(pageno) - 1;
    const limit = Number(pageto) - Number(pageno) + 1;

    const [wingo] = await connection.query(
      `SELECT * FROM wingo WHERE status != 0 AND game = ? ORDER BY id DESC LIMIT ? OFFSET ?`,
      [game, limit, offset]
    );
    if (!wingo.length) {
      return res.status(200).json({
        code: 0,
        msg: "No more data",
        data: { gameslist: [] },
        status: false,
      });
    }

    const [wingoAll] = await connection.query(
      "SELECT id FROM wingo WHERE status != 0 AND game = ?",
      [game]
    );
    const [period] = await connection.query(
      "SELECT period, time FROM wingo WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1",
      [game]
    );
    if (!period.length) {
      return res.status(200).json({ message: "Error! period is missing.", status: false });
    }

    const page = Math.ceil(wingoAll.length / limit) || 1;

    return res.status(200).json({
      code: 0,
      msg: "Get success",
      data: { gameslist: wingo },
      period: period[0].period,
      page,
      time: period[0].time,
      status: true,
    });
  } catch (error) {
    console.error("Error in listOrderOld:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

/* ============================================================
   MY BETS (all games)
   ============================================================ */

const GetMyEmerdList = async (req, res) => {
  try {
    const { typeid, pageno, pageto } = req.body;
    const typeidNum = Number(typeid);

    if (![...VALID_TYPEIDS, 15].includes(typeidNum)) {
      return res.status(200).json({ message: "Invalid type id", status: false });
    }
    if (Number(pageno) < 0 || Number(pageto) < 0) {
      return res.status(200).json({
        code: 0,
        msg: "No more data",
        data: { gameslist: [] },
        status: false,
      });
    }

    const auth = req.cookies.auth;
    const [user] = await connection.query(
      "SELECT phone, code, invite, level, money FROM users WHERE token = ? AND veri = 1 LIMIT 1",
      [auth]
    );
    if (!user[0]) {
      return res.status(200).json({
        code: 0,
        msg: "User not found",
        data: { gameslist: [] },
        status: false,
      });
    }

    // typeid 15 = all-games combined
    if (typeidNum === 15) {
      const phone = user[0].phone;
      const limit = 100;
      const offset = 0;

      const [minutes_1] = await connection.query(
        "SELECT * FROM minutes_1 WHERE phone = ? ORDER BY id DESC LIMIT ? OFFSET ?",
        [phone, limit, offset]
      );
      const [result_k3] = await connection.query(
        `SELECT *, CASE 
            WHEN game = 1 THEN 'K3 1' WHEN game = 3 THEN 'K3 3'
            WHEN game = 5 THEN 'K3 5' WHEN game = 10 THEN 'K3 10'
            ELSE game END AS game
         FROM result_k3 WHERE phone = ? ORDER BY id DESC LIMIT ? OFFSET ?`,
        [phone, limit, offset]
      );
      const [result_5d] = await connection.query(
        `SELECT *, CASE 
            WHEN game = 1 THEN '5D 1' WHEN game = 3 THEN '5D 3'
            WHEN game = 5 THEN '5D 5' WHEN game = 10 THEN '5D 10'
            ELSE game END AS game
         FROM result_5d WHERE phone = ? ORDER BY id DESC LIMIT ? OFFSET ?`,
        [phone, limit, offset]
      );
      const [cargame_result] = await connection.query(
        "SELECT * FROM cargame_result WHERE phone = ? ORDER BY id DESC LIMIT ? OFFSET ?",
        [phone, limit, offset]
      );

      const combinedData = [...cargame_result, ...minutes_1, ...result_5d, ...result_k3];

      return res.status(200).json({
        code: 0,
        msg: "Get success",
        data: { gameslist: combinedData },
        status: true,
      });
    }

    const game = GAME_MAP[typeidNum];
    const offset = Number(pageno) - 1;
    const limit = Number(pageto) - Number(pageno) + 1;

    const [minutes_1] = await connection.query(
      `SELECT * FROM minutes_1 WHERE phone = ? AND game = ? ORDER BY id DESC LIMIT ? OFFSET ?`,
      [user[0].phone, game, limit, offset]
    );
    if (!minutes_1.length) {
      return res.status(200).json({
        code: 0,
        msg: "No more data",
        data: { gameslist: [] },
        status: false,
      });
    }

    const [minutes_1All] = await connection.query(
      "SELECT id FROM minutes_1 WHERE phone = ? AND game = ?",
      [user[0].phone, game]
    );
    const page = Math.ceil(minutes_1All.length / 10) || 1;

    return res.status(200).json({
      code: 0,
      msg: "Get success data",
      data: { gameslist: minutes_1 },
      page,
      status: true,
    });
  } catch (error) {
    console.error("Error in GetMyEmerdList:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

/* ============================================================
   PAYOUT RESOLVER
   ============================================================ */

function getPayoutMultiplier(result, bet) {
  result = Number(result);
  bet = String(bet);

  if (bet === "l" || bet === "n") {
    const isSmall = result < 5;
    if ((bet === "l" && !isSmall) || (bet === "n" && isSmall)) return 2;
    return 0;
  }

  const isD = [0, 2, 4, 6, 8].includes(result);
  const isX = [1, 3, 5, 7, 9].includes(result);
  const isViolet = result === 0 || result === 5;

  // Exact number → x9
  if (bet === String(result)) return 9;

  // Violet
  if (bet === "t" && isViolet) return 4.5;

  // Color bets
  if (bet === "d" && isD) return isViolet ? 1.5 : 2;
  if (bet === "x" && isX) return 2;

  return 0;
}

/* ============================================================
   RESULT PROCESSING
   ============================================================ */

const handlingWinGo1P = async (typeid) => {
  try {
    const game = GAME_MAP[typeid];
    if (!game) return;

    const [winGoNow] = await connection.query(
      "SELECT * FROM wingo WHERE status != 0 AND game = ? ORDER BY id DESC LIMIT 1",
      [game]
    );
    if (!winGoNow.length) return;

    const result = Number(winGoNow[0].amount);
    if (isNaN(result)) return;

    await connection.execute(
      "UPDATE minutes_1 SET result = ? WHERE status = 0 AND game = ?",
      [result, game]
    );

    const [orders] = await connection.execute(
      "SELECT * FROM minutes_1 WHERE status = 0 AND game = ?",
      [game]
    );

    const processBet = async (order) => {
      try {
        const { bet, money: total, id, phone } = order;
        const multiplier = getPayoutMultiplier(result, bet);
        const winnings = Number(total) * multiplier;

        await connection.execute(
          "UPDATE minutes_1 SET get = ?, status = 1 WHERE id = ?",
          [winnings, id]
        );

        if (winnings > 0) {
          await connection.execute(
            "UPDATE users SET money = money + ? WHERE phone = ?",
            [winnings, phone]
          );
        }
      } catch (e) {
        console.error("processBet error:", e.message);
      }
    };

    await Promise.all(orders.map(processBet));
  } catch (error) {
    console.error("Error in handlingWinGo1P:", error.message);
  }
};

/* ============================================================
   AGENT COMMISSIONS
   ============================================================ */

const _processAgentCommissions = async () => {
  const [users] = await connection.execute(
    "SELECT * FROM users WHERE pending_commission > 0"
  );
  if (users.length === 0) return 0;

  const sumdate = timerJoin2(Date.now());
  const updates = [];
  const inserts = [];

  for (const user of users) {
    updates.push(
      connection.execute(
        "UPDATE users SET money = money + ?, pending_commission = 0 WHERE phone = ?",
        [user.pending_commission, user.phone]
      )
    );
    inserts.push(
      connection.execute(
        "INSERT INTO transaction_history (phone, detail, balance, time) VALUES (?, ?, ?, ?)",
        [user.phone, "Agent Commission", user.pending_commission, sumdate]
      )
    );
  }

  await Promise.all(updates);
  await Promise.all(inserts);
  return users.length;
};

const tradeCommission = async () => {
  try {
    await _processAgentCommissions();
  } catch (error) {
    console.error("Error processing commissions:", error);
  }
};

const tradeCommissionadmin = async (req, res) => {
  try {
    const count = await _processAgentCommissions();
    if (count === 0) {
      return res
        .status(200)
        .json({ message: "No users with pending commission!", status: true });
    }
    return res.status(200).json({ message: "commission Successfully!", status: true });
  } catch (error) {
    return res.status(500).json({ message: "internal server error!", status: false });
  }
};

const tradeCommissionGet = async (req, res) => {
  try {
    const [users] = await connection.query(
      "SELECT * FROM users WHERE pending_commission > 0"
    );
    return res
      .status(200)
      .json({ message: "commission Successfully!", status: true, data: users });
  } catch (error) {
    return res.status(500).json({ message: "internal server error!", status: false });
  }
};

/* ============================================================
   DEFINE RESULT (house-edge mode)
   ============================================================ */

const BET_COLUMNS = [
  { name: "red_small", bets: ["0", "2", "4", "d", "n"] },
  { name: "red_big", bets: ["6", "8", "d", "l"] },
  { name: "green_big", bets: ["5", "7", "9", "x", "l"] },
  { name: "green_small", bets: ["1", "3", "x", "n"] },
  { name: "violet_small", bets: ["0", "t", "n"] },
  { name: "violet_big", bets: ["5", "t", "l"] },
];

const defineresult = async (game) => {
  try {
    const join = GAME_MAP[game];
    if (!join) {
      console.error("[defineresult] invalid game:", game);
      return Math.floor(Math.random() * 10);
    }

    const [winGoNow] = await connection.query(
      "SELECT period FROM wingo WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1",
      [join]
    );
    if (!winGoNow.length) return Math.floor(Math.random() * 10);

    const categories = await Promise.all(
      BET_COLUMNS.map(async (column) => {
        const placeholders = column.bets.map(() => "?").join(",");
        const [result] = await connection.query(
          `SELECT SUM(money) AS total_money FROM minutes_1
           WHERE game = ? AND status = 0 AND isdemo = 0 AND bet IN (${placeholders})`,
          [join, ...column.bets]
        );
        return {
          name: column.name,
          total_money: parseInt(result[0]?.total_money) || 0,
        };
      })
    );

    shuffleArrayInPlace(categories);

    const smallest = categories.reduce((s, c) =>
      !s || c.total_money < s.total_money ? c : s
    );

    const [color, size] = smallest.name.split("_");
    const sourceBets =
      BET_COLUMNS.find((c) => c.name === `${color}_${size}`)?.bets || [];
    const validNumericBets = sourceBets.filter((b) => !isNaN(parseInt(b, 10)));

    if (validNumericBets.length === 0) return Math.floor(Math.random() * 10);

    return parseInt(
      validNumericBets[Math.floor(Math.random() * validNumericBets.length)],
      10
    );
  } catch (error) {
    console.error("Error in defineresult:", error.message);
    return Math.floor(Math.random() * 10);
  }
};

/* ============================================================
   API FETCHERS
   ============================================================ */

const MAX_API_RETRIES = 3;
const API_TIMEOUT_SHORT = 900;
const API_TIMEOUT_LONG = 5000;

const fetchLottery7List = async ({ url, bearerToken, origin, referer, typeId, userAgent }) => {
  const body = {
    pageSize: 10,
    pageNo: 1,
    typeId,
    language: 0,
    random: "d9781e8c339a4c1a85aec64ed1d86821",
    signature: "25BA37A78635FCCBC665ACA640283C41",
    timestamp: Math.floor(Date.now() / 1000),
  };
  const headers = {
    accept: "application/json, text/plain, */*",
    "content-type": "application/json;charset=UTF-8",
    authorization: `Bearer ${bearerToken}`,
    origin,
    referer,
    "user-agent": userAgent,
  };

  for (let attempt = 1; attempt <= MAX_API_RETRIES; attempt++) {
    try {
      const start = Date.now();
      const r = await axios.post(url, body, { headers, timeout: API_TIMEOUT_SHORT });
      if (Date.now() - start > API_TIMEOUT_SHORT) continue;
      return r.data?.data?.list?.[0] || null;
    } catch (e) {
      if (attempt >= MAX_API_RETRIES) throw new Error("API failed after maximum retries");
    }
  }
  return null;
};

const fetchApiData_lottery7_1 = () =>
  fetchLottery7List({
    url: "https://lottery7api.com/api/webapi/GetNoaverageEmerdList",
    bearerToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIxNzM3Mzk2MTg4IiwibmJmIjoiMTczNzM5NjE4OCIsImV4cCI6IjE3MzczOTc5ODgiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL2V4cGlyYXRpb24iOiIxLzIxLzIwMjUgMTI6MDM6MDggQU0iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBY2Nlc3NfVG9rZW4iLCJVc2VySWQiOiIxNTAwMDQyNyIsIlVzZXJOYW1lIjoiOTEzNDYzNTY1MTY0IiwiVXNlclBob3RvIjoiMSIsIk5pY2tOYW1lIjoiTWVtYmVyTk5HWkhGSVQiLCJBbW91bnQiOiI1OC4wMCIsIkludGVncmFsIjoiMCIsIkxvZ2luTWFyayI6Ikg1IiwiTG9naW5UaW1lIjoiMS8yMC8yMDI1IDExOjMzOjA4IFBNIiwiTG9naW5JUEFkZHJlc3MiOiIyMjMuMTIzLjEwLjkiLCJEYk51bWJlciI6IjAiLCJJc3ZhbGlkYXRvciI6IjAiLCJLZXlDb2RlIjoiMSIsIlRva2VuVHlwZSI6IkFjY2Vzc19Ub2tlbiIsIlBob25lVHlwZSI6IjAiLCJVc2VyVHlwZSI6IjAiLCJVc2VyTmFtZTIiOiIiLCJpc3MiOiJqd3RJc3N1ZXIiLCJhdWQiOiJsb3R0ZXJ5VGlja2V0In0.lNcBy8hBjnDff2yFJsg7Knbawb3NoLgD5nmLakTR5Ss",
    origin: "https://www.lottery7j.com",
    referer: "https://www.lottery7j.com/",
    typeId: 1,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
  });

const fetchApiData_tiranga_1 = () =>
  fetchLottery7List({
    url: "https://tirangaapi.com/api/webapi/GetNoaverageEmerdList",
    bearerToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIxNzQxMTY1NjQ3IiwibmJmIjoiMTc0MTE2NTY0NyIsImV4cCI6IjE3NDExNjc0NDciLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL2V4cGlyYXRpb24iOiIzLzUvMjAyNSAzOjA3OjI3IFBNIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiQWNjZXNzX1Rva2VuIiwiVXNlcklkIjoiMTk1NDYxNTEiLCJVc2VyTmFtZSI6IjkxMzEwMTM2MTY0NyIsIlVzZXJQaG90byI6IjEiLCJOaWNrTmFtZSI6Ik1lbWJlck5OR09WVVVOIiwiQW1vdW50IjoiMC4wMCIsIkludGVncmFsIjoiMCIsIkxvZ2luTWFyayI6Ikg1IiwiTG9naW5UaW1lIjoiMy81LzIwMjUgMjozNzoyNyBQTSIsIkxvZ2luSVBBZGRyZXNzIjoiMzcuMTExLjE2Ny4yMDAiLCJEYk51bWJlciI6IjAiLCJJc3ZhbGlkYXRvciI6IjAiLCJLZXlDb2RlIjoiMSIsIlRva2VuVHlwZSI6IkFjY2Vzc19Ub2tlbiIsIlBob25lVHlwZSI6IjAiLCJVc2VyVHlwZSI6IjAiLCJVc2VyTmFtZTIiOiIiLCJpc3MiOiJqd3RJc3N1ZXIiLCJhdWQiOiJsb3R0ZXJ5VGlja2V0In0.CXQ5b2cMcDKh_lBRytR3cwgNmsOu9T5R6zXGYH6iIwI",
    origin: "https://www.tirangagame.top",
    referer: "https://www.tirangagame.top/",
    typeId: 1,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
  });

const fetchArLottery = async (pathPart) => {
  const apiUrl = `https://draw.ar-lottery01.com/${pathPart}/GetHistoryIssuePage.json?ts=${Date.now()}`;
  const headers = { accept: "application/json, text/plain, */*" };
  for (let attempt = 1; attempt <= MAX_API_RETRIES; attempt++) {
    try {
      const start = Date.now();
      const r = await axios.get(apiUrl, { headers, timeout: API_TIMEOUT_LONG });
      if (Date.now() - start > API_TIMEOUT_LONG) continue;
      return r.data?.data?.list?.[0] || null;
    } catch (e) {
      if (attempt >= MAX_API_RETRIES) throw new Error("API failed after maximum retries");
    }
  }
  return null;
};

const fetchApiData_bdgwin_1 = () => fetchArLottery("WinGo/WinGo_1M");
const fetchApiData_bdgwin_10 = () => fetchArLottery("WinGo/WinGo_30S");
const fetchApiData_wingo3 = () => fetchArLottery("WinGo/WinGo_3M");
const fetchApiData_wingo5 = () => fetchArLottery("WinGo/WinGo_5M");

const fetchApiData_11 = async () => {
  const apiUrl = `https://draw.ar-lottery01.com/TrxWinGo/TrxWinGo_1M/GetHistoryIssuePage.json?ts=${Date.now()}`;
  const headers = {
    accept: "application/json, text/plain, */*",
    referer: "https://www.tirangagame.top/",
  };

  for (let attempt = 1; attempt <= MAX_API_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_SHORT);
      const start = Date.now();
      const r = await fetch(apiUrl, { method: "GET", headers, signal: controller.signal });
      clearTimeout(timeout);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      if (Date.now() - start > API_TIMEOUT_SHORT) continue;
      const data = await r.json();
      return data?.data?.list?.[0] || null;
    } catch (e) {
      if (attempt >= MAX_API_RETRIES) throw new Error("API failed after maximum retries");
    }
  }
  return null;
};

/* ============================================================
   PERIOD FETCHERS (guarded against undefined)
   ============================================================ */

const POLL_ATTEMPTS = 10;
const POLL_INTERVAL = 500;

const fetchNewPeriod_generic = async (fetchers, currentPeriod) => {
  for (let attempt = 1; attempt <= POLL_ATTEMPTS; attempt++) {
    const start = Date.now();
    try {
      const results = await Promise.allSettled(
        fetchers.map((fn) => withTimeout(fn(), 450).catch(() => null))
      );
      for (const r of results) {
        if (
          r.status === "fulfilled" &&
          r.value?.issueNumber == currentPeriod &&
          r.value?.number !== undefined &&
          r.value?.number !== null
        ) {
          const num = parseInt(r.value.number, 10);
          if (isNaN(num)) continue;
          return {
            newPeriod: (BigInt(currentPeriod) + BigInt(1)).toString(),
            resultAmount: num,
            raw: r.value,
            attempts: attempt,
          };
        }
      }
    } catch (e) {
      console.error(`Attempt ${attempt} error:`, e.message);
    }
    const elapsed = Date.now() - start;
    await new Promise((r) => setTimeout(r, Math.max(POLL_INTERVAL - elapsed, 0)));
  }
  return null;
};

const fetchNewPeriod_1 = (p) =>
  fetchNewPeriod_generic(
    [fetchApiData_lottery7_1, fetchApiData_tiranga_1, fetchApiData_bdgwin_1],
    p
  );
const fetchNewPeriod_10 = (p) => fetchNewPeriod_generic([fetchApiData_bdgwin_10], p);

const fetchNewPeriod_11 = async (currentPeriod) => {
  let attempts = 0;
  const MAX_TRX_ATTEMPTS = 30; // cap to avoid infinite loop

  while (attempts < MAX_TRX_ATTEMPTS) {
    try {
      const apiData = await fetchApiData_11();
      if (
        apiData &&
        apiData.issueNumber == currentPeriod &&
        apiData.number !== undefined &&
        apiData.number !== null &&
        !isNaN(parseInt(apiData.number, 10))
      ) {
        const lastSix = String(apiData.blockId || "").slice(-6);
        return {
          newPeriod: (BigInt(apiData.issueNumber) + BigInt(1)).toString(),
          resultAmount: parseInt(apiData.number, 10),
          hashvalue: `**${lastSix}`,
          blockNumber: apiData.blockNumber ?? 50,
          attempts,
        };
      }
    } catch (e) {
      console.error("API call error:", e.message);
    }
    await new Promise((r) => setTimeout(r, 700));
    attempts++;
  }
  console.error("fetchNewPeriod_11 exhausted attempts");
  return null;
};

/* ============================================================
   PERIOD CREATORS (undefined-safe)
   ============================================================ */

const lastCallTime = {};
const LOCK_DURATION = 5000;

const _lockGame = (game) => {
  const now = Date.now();
  if (now - (lastCallTime[game] || 0) < LOCK_DURATION) return false;
  lastCallTime[game] = now;
  return true;
};

const _ensurePeriodAndApplyResult = async (
  game,
  period,
  newPeriod,
  resultAmount,
  hashvalue,
  blockNumber,
  checkTime2
) => {
  try {
    // ---------- GUARDS ----------
    if (
      !game ||
      !period ||
      !newPeriod ||
      resultAmount === undefined ||
      resultAmount === null ||
      isNaN(Number(resultAmount))
    ) {
      console.error("[_ensurePeriod] Skipping - invalid params:", {
        game,
        period,
        newPeriod,
        resultAmount,
      });
      return;
    }

    const gameId = Number(Object.keys(GAME_MAP).find((k) => GAME_MAP[k] === game));
    if (isNaN(gameId)) {
      console.error("[_ensurePeriod] Unknown game:", game);
      return;
    }

    const [setting] = await connection.query("SELECT * FROM admin");
    if (!setting.length) {
      console.error("[_ensurePeriod] admin table empty");
      return;
    }

    const safeHash = hashvalue || generateRandomHash(10);
    const safeBlock =
      blockNumber !== undefined && blockNumber !== null ? blockNumber : 50;
    const safeTime = checkTime2 || timerJoin2(Date.now());

    let nextResult = setting[0][game];
    let newArr = "-1";
    let amount = Number(resultAmount);

    const [pending] = await connection.query(
      "SELECT COUNT(*) AS count FROM minutes_1 WHERE status = 0 AND game = ?",
      [game]
    );

    if (pending[0].count > 0 && setting[0].website_mode == 1) {
      const defined = await defineresult(gameId);
      if (defined !== undefined && defined !== null && !isNaN(defined)) {
        amount = defined;
      }
    }

    if (nextResult === "-1" || nextResult === undefined || nextResult === null) {
      await connection.execute(
        `UPDATE wingo SET amount = ?, hashvalue = ?, blocs = ?, status = 1 WHERE period = ? AND game = ?`,
        [amount, safeHash, safeBlock, period, game]
      );
      newArr = "-1";
    } else {
      const arr = String(nextResult).split("|");
      newArr = arr.length === 1 ? "-1" : arr.slice(1).join("|");
      const adminAmount = Number(arr[0]);
      const finalAmount = isNaN(adminAmount) ? amount : adminAmount;
      await connection.execute(
        `UPDATE wingo SET amount = ?, hashvalue = ?, blocs = ?, status = 1 WHERE period = ? AND game = ?`,
        [finalAmount, safeHash, safeBlock, period, game]
      );
    }

    await connection.execute(
      "UPDATE wingo SET status = 1 WHERE period != ? AND game = ?",
      [newPeriod, game]
    );

    await connection.execute(
      "INSERT INTO wingo (period, amount, game, status, hashvalue, blocs, time) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [String(newPeriod), 0, game, 0, generateRandomHash(10), 50, safeTime]
    );

    await connection.execute(`UPDATE admin SET \`${game}\` = ?`, [newArr]);
  } catch (error) {
    console.error("[_ensurePeriod] DB error:", error.message, {
      game,
      period,
      newPeriod,
      resultAmount,
    });
  }
};

const addWinGo_1 = async (period_id) => {
  try {
    if (!_lockGame("wingo")) return;
    const checkTime2 = timerJoin2(Date.now());

    const [winGoNow] = await connection.query(
      "SELECT period FROM wingo WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1",
      ["wingo"]
    );
    const period = winGoNow[0]?.period || "98778990";

    const newData = await fetchNewPeriod_1(period_id);
    if (!newData) return;

    let { newPeriod, resultAmount, raw } = newData;
    if (!newPeriod || resultAmount === undefined || resultAmount === null) {
      console.error("[addWinGo_1] invalid newData:", newData);
      return;
    }
    if (String(period) === String(newPeriod)) {
      newPeriod = (BigInt(newPeriod) + BigInt(1)).toString();
    }

    await _ensurePeriodAndApplyResult(
      "wingo",
      period,
      newPeriod,
      resultAmount,
      raw?.hashvalue ?? null,
      raw?.blockNumber ?? null,
      checkTime2
    );
  } catch (error) {
    console.error("Error in addWinGo_1:", error.message);
  }
};

const addWinGo_10 = async (period_id) => {
  try {
    if (!_lockGame("wingo10")) return;
    const checkTime2 = timerJoin2(Date.now());

    const [winGoNow] = await connection.query(
      "SELECT period FROM wingo WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1",
      ["wingo10"]
    );
    const period = winGoNow[0]?.period || "98778990";

    const newData = await fetchNewPeriod_10(period_id);
    if (!newData) return;

    const { newPeriod, resultAmount, raw } = newData;
    if (!newPeriod || resultAmount === undefined || resultAmount === null) {
      console.error("[addWinGo_10] invalid newData:", newData);
      return;
    }

    await _ensurePeriodAndApplyResult(
      "wingo10",
      period,
      newPeriod,
      resultAmount,
      raw?.hashvalue ?? null,
      raw?.blockNumber ?? null,
      checkTime2
    );
  } catch (error) {
    console.error("Error in addWinGo_10:", error.message);
  }
};

const addWinGo_11 = async (periodfromserver) => {
  try {
    if (!_lockGame("trx")) return;
    const checkTime2 = timerJoin2(Date.now());

    const [winGoNow] = await connection.query(
      "SELECT period FROM wingo WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1",
      ["trx"]
    );
    const period = winGoNow[0]?.period || "98778990";

    const newData = await fetchNewPeriod_11(periodfromserver);
    if (!newData) return;

    let { newPeriod, resultAmount, hashvalue, blockNumber } = newData;
    if (!newPeriod || resultAmount === undefined || resultAmount === null) {
      console.error("[addWinGo_11] invalid newData:", newData);
      return;
    }
    if (String(period) === String(newPeriod)) {
      newPeriod = (BigInt(newPeriod) + BigInt(1)).toString();
    }

    await _ensurePeriodAndApplyResult(
      "trx",
      period,
      newPeriod,
      resultAmount,
      hashvalue ?? null,
      blockNumber ?? null,
      checkTime2
    );
  } catch (error) {
    console.error("Error in addWinGo_11:", error.message);
  }
};

const _addWinGoFixed = async (game, gameId, fetchLatestFn) => {
  try {
    if (!_lockGame(game)) return;
    const checkTime2 = timerJoin2(Date.now());

    const [winGoNow] = await connection.query(
      "SELECT period FROM wingo WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1",
      [game]
    );
    let period = winGoNow[0]?.period || "98778990";

    const [setting] = await connection.query("SELECT * FROM admin");
    if (!setting.length) {
      console.error(`[addWinGo ${game}] admin table empty`);
      return;
    }

    let amount = Math.floor(Math.random() * 10);

    const [pending] = await connection.query(
      "SELECT COUNT(*) AS count FROM minutes_1 WHERE status = 0 AND game = ?",
      [game]
    );

    if (pending[0].count > 0 && setting[0].website_mode == 1) {
      const defined = await defineresult(gameId);
      if (defined !== undefined && defined !== null && !isNaN(defined)) {
        amount = defined;
      }
    } else {
      const latest = await fetchLatestFn();
      if (latest && latest.period && latest.amount !== undefined) {
        period = latest.period;
        amount = parseInt(latest.amount, 10);
        if (isNaN(amount)) amount = Math.floor(Math.random() * 10);
      }
    }

    const nextResult = setting[0][game];
    let newArr = "-1";

    if (nextResult === "-1" || nextResult === undefined || nextResult === null) {
      await connection.execute(
        "UPDATE wingo SET amount = ?, status = 1 WHERE period = ? AND game = ?",
        [amount, period, game]
      );
    } else {
      const arr = String(nextResult).split("|");
      newArr = arr.length > 1 ? arr.slice(1).join("|") : "-1";
      const adminAmount = Number(arr[0]);
      await connection.execute(
        "UPDATE wingo SET amount = ?, status = 1 WHERE period = ? AND game = ?",
        [isNaN(adminAmount) ? amount : adminAmount, period, game]
      );
    }

    const newPeriod = (BigInt(period) + BigInt(1)).toString();

    await connection.execute(
      "INSERT INTO wingo (period, amount, game, status, hashvalue, blocs, time) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [newPeriod, 0, game, 0, generateRandomHash(10), 50, checkTime2]
    );

    await connection.execute(`UPDATE admin SET \`${game}\` = ?`, [newArr]);
  } catch (error) {
    console.error(`Error in addWinGo for ${game}:`, error.message);
  }
};

const addWinGo_3 = () => _addWinGoFixed("wingo3", 3, fetchApiData_wingo3);
const addWinGo_5 = () => _addWinGoFixed("wingo5", 5, fetchApiData_wingo5);

/* ============================================================
   EXPORTS
   ============================================================ */

module.exports = {
  winGoPage,
  betWinGo,
  listOrderOld,
  GetMyEmerdList,
  handlingWinGo1P,
  winGoPage3,
  winGoPage5,
  winGoPage10,
  trxPage,
  trxPage3,
  trxPage5,
  trxPage10,
  tradeCommission,
  tradeCommissionadmin,
  tradeCommissionGet,
  addWinGo_10,
  addWinGo_1,
  addWinGo_3,
  addWinGo_5,
  addWinGo_11,
};