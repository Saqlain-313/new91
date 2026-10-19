import connection from "../config/connectDB";
require("dotenv").config();

// ==================== HELPERS ====================
const isNumber = (params) => /^[0-9]+$/.test(String(params));

function formateT(params) {
  return params < 10 ? "0" + params : params;
}

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

function timerJoins(params = "", addHours = 0) {
  const date = params ? new Date(Number(params)) : new Date();
  if (addHours !== 0) date.setHours(date.getHours() + addHours);

  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour12: false,
  };
  const formatter = new Intl.DateTimeFormat("en-GB", options);
  const parts = formatter.formatToParts(date);
  const getPart = (type) => parts.find((p) => p.type === type).value;

  return `${getPart("year")}${getPart("month")}${getPart("day")}`;
}

function shuffleArrayInPlace(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function getDigitByPosition(numStr, position) {
  const parts = String(numStr || "").split(",");
  const v = parts[position - 1];
  return v === undefined ? null : Number(v);
}

// ==================== COMMISSIONS ====================
const commissions = async (auth, money) => {
  const [user] = await connection.query(
    "SELECT `phone`, `code`, `invite`, `user_level`, `total_money` FROM users WHERE token = ?",
    [auth]
  );
  if (!user.length) return;
  const userInfo = user;

  const [level] = await connection.query("SELECT * FROM level");
  const checkTime2 = timerJoin2(Date.now());

  let uplines = userInfo;
  let count = 0;

  for (let i = 0; i < 6; i++) {
    if (!uplines || uplines.length === 0) break;
    if (!level[i]) break;

    const rosesFs = (money / 100) * level[i].f1;
    const [upline] = await connection.query("SELECT * FROM users WHERE code = ?", [uplines[0].invite]);

    if (!upline.length) break;

    count++;
    await connection.query(
      "INSERT INTO subordinatedata SET phone = ?, bonusby = ?, type = ?, commission = ?, amount = ?, level = ?, `date` = ?",
      [upline[0].phone, uplines[0].phone, "bet commission", rosesFs, money, count, checkTime2]
    );
    await connection.query(
      "UPDATE users SET pending_commission = pending_commission + ? WHERE phone = ?",
      [rosesFs, upline[0].phone]
    );
    uplines = upline;
  }
};

// ==================== PLACE BET ====================
const betcargame = async (req, res) => {
  try {
    const { typeid = 1, join, x, money, activePoint } = req.body;
    const auth = req.cookies.auth;
    const gameJoin = "cargame";

    const [cargameNow] = await connection.query(
      "SELECT period FROM cargame WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1",
      [gameJoin]
    );
    const [user] = await connection.query(
      "SELECT * FROM users WHERE token = ? AND veri = 1 LIMIT 1",
      [auth]
    );

    if (!cargameNow[0] || !user[0] || !isNumber(x) || !isNumber(money)) {
      return res.status(200).json({ message: "Invalid data", status: false });
    }

    const userInfo = user[0];
    const period = cargameNow[0].period;

    // "bet" should be a valid position string; guard against injection (used in INSERT param, safe)
    if (!join) {
      return res.status(200).json({ message: "Invalid bet", status: false });
    }

    const xNum = Number(x);
    const moneyNum = Number(money);
    const fee = xNum * moneyNum * 0.02;
    const total = xNum * moneyNum - fee;
    const timeNow = Date.now();
    const check = Number(userInfo.money) - total;

    if (check < 0) {
      return res.status(200).json({ message: "The amount is not enough", status: false });
    }

    const date = new Date();
    const id_product =
      formateT(date.getFullYear()) +
      formateT(date.getMonth() + 1) +
      formateT(date.getDate()) +
      Math.floor(Math.random() * 1000000000000000);
    const checkTime = timerJoin2(date.getTime());

    const sql = `INSERT INTO cargame_result SET 
      id_product = ?, phone = ?, code = ?, invite = ?, stage = ?, level = ?,
      money = ?, amount = ?, fee = ?, get = ?, game = ?, gamePosition = ?,
      bet = ?, status = ?, today = ?, time = ?, isdemo = ?`;

    await connection.execute(sql, [
      id_product,
      userInfo.phone,
      userInfo.code,
      userInfo.invite,
      period,
      userInfo.level,
      total,
      xNum,
      fee,
      0,
      gameJoin,
      activePoint,
      join,
      0,
      checkTime,
      timeNow,
      userInfo.isdemo,
    ]);

    await connection.execute(
      "UPDATE `users` SET `money` = `money` - ?, `rebate` = `rebate` + ? WHERE `token` = ?",
      [moneyNum * xNum, moneyNum * xNum, auth]
    );

    const [updatedUser] = await connection.query(
      "SELECT * FROM users WHERE token = ? AND veri = 1 LIMIT 1",
      [auth]
    );

    const total_money = moneyNum * xNum;
    let total_recharge = Number(userInfo.recharge) - total_money;
    if (total_recharge < 0) total_recharge = 0;

    await connection.execute("UPDATE `users` SET `recharge` = ? WHERE `phone` = ?", [
      total_recharge,
      userInfo.phone,
    ]);

    await commissions(auth, total_money);

    return res.status(200).json({
      message: "Bet Succeed",
      status: true,
      change: updatedUser[0].level,
      money: updatedUser[0].money,
    });
  } catch (error) {
    console.error("betcargame error:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== LIST ORDER ====================
const listOrderOld = async (req, res) => {
  try {
    const { typeid = 1, pageno, pageto } = req.body;
    const pn = Number(pageno);
    const pt = Number(pageto);

    if (!Number.isFinite(pn) || !Number.isFinite(pt) || pn < 1 || pt < 1) {
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

    const game = typeid == 1 ? "cargame" : null;
    if (!game) {
      return res.status(200).json({ code: 0, msg: "No more data", data: { gameslist: [] }, status: false });
    }

    const offset = pn - 1;
    const limit = pt - pn + 1;

    const [cargame] = await connection.query(
      "SELECT * FROM cargame WHERE status != 0 AND game = ? ORDER BY id DESC LIMIT ? OFFSET ?",
      [game, limit, offset]
    );
    const [cargameAll] = await connection.query(
      "SELECT id FROM cargame WHERE status != 0 AND game = ?",
      [game]
    );
    const [period] = await connection.query(
      "SELECT period, time FROM cargame WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1",
      [game]
    );

    if (!cargame.length) {
      return res.status(200).json({
        code: 0,
        msg: "No more data",
        data: { gameslist: [] },
        status: false,
      });
    }
    if (!period.length) {
      return res.status(200).json({ message: "Error! period is missing.", status: false });
    }

    const page = Math.ceil(cargameAll.length / limit);

    return res.status(200).json({
      code: 0,
      msg: "Get success",
      data: { gameslist: cargame },
      period: period[0].period,
      page,
      time: period[0].time,
      status: true,
    });
  } catch (error) {
    console.error("listOrderOld error:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== MY BETS ====================
const GetMyEmerdList = async (req, res) => {
  try {
    const { typeid = 1, pageno, pageto } = req.body;

    if (typeid != 1) {
      return res.status(200).json({ message: "Invalid type id", status: false });
    }

    const pn = Number(pageno);
    const pt = Number(pageto);
    if (!Number.isFinite(pn) || !Number.isFinite(pt) || pn < 0 || pt < 0) {
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

    const game = "cargame";
    const offset = pn - 1;
    const limit = pt - pn + 1;

    const [cargame_result] = await connection.query(
      "SELECT * FROM cargame_result WHERE phone = ? AND game = ? ORDER BY id DESC LIMIT ? OFFSET ?",
      [user[0].phone, game, limit, offset]
    );
    const [cargame_resultAll] = await connection.query(
      "SELECT id FROM cargame_result WHERE phone = ? AND game = ?",
      [user[0].phone, game]
    );

    if (!cargame_result.length) {
      return res.status(200).json({
        code: 0,
        msg: "No more data",
        data: { gameslist: [] },
        status: false,
      });
    }

    const page = Math.ceil(cargame_resultAll.length / 10);

    return res.status(200).json({
      code: 0,
      msg: "Get success data",
      data: { gameslist: cargame_result },
      page,
      status: true,
    });
  } catch (error) {
    console.error("GetMyEmerdList error:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== ADD CARGAME (create next round) ====================
const addcargame_handel = async (join, position) => {
  try {
    const [setting] = await connection.query("SELECT * FROM `admin`");
    let amount = Math.floor(Math.random() * 9) + 1;

    const [minPlayers] = await connection.query(
      "SELECT * FROM cargame_result WHERE gamePosition = ? AND status = 0 AND isdemo = 0 AND game = ?",
      [position, join]
    );

    if (minPlayers.length >= 1) {
      const betColumns = [
        { name: "red_small", bets: ["0", "2", "4", "d", "n"] },
        { name: "red_big", bets: ["6", "8", "d", "l"] },
        { name: "green_big", bets: ["5", "7", "9", "x", "l"] },
        { name: "green_small", bets: ["1", "3", "x", "n"] },
        { name: "violet_small", bets: ["0", "t", "n"] },
        { name: "violet_big", bets: ["5", "t", "l"] },
      ];

      shuffleArrayInPlace(betColumns);

      const categories = await Promise.all(
        betColumns.map(async (column) => {
          const [result] = await connection.query(
            `SELECT SUM(money) AS total_money FROM cargame_result 
             WHERE gamePosition = ? AND game = ? AND status = 0 AND isdemo = 0 
             AND bet IN (${column.bets.map(() => "?").join(",")})`,
            [position, join, ...column.bets]
          );
          return { name: column.name, total_money: parseInt(result[0]?.total_money) || 0 };
        })
      );

      shuffleArrayInPlace(categories);

      const smallestCategory = categories.reduce(
        (smallest, category) =>
          !smallest || category.total_money < smallest.total_money ? category : smallest,
        null
      );

      const [color, size] = smallestCategory.name.split("_");
      const availableBets = betColumns.find((col) => col.name === `${color}_${size}`)?.bets || [];
      const validBets = availableBets.filter((bet) => !isNaN(parseInt(bet, 10)));
      amount = parseInt(validBets[Math.floor(Math.random() * validBets.length)], 10);
    }

    return amount;
  } catch (error) {
    console.error("addcargame_handel error:", error);
    return Math.floor(Math.random() * 9) + 1;
  }
};

const addcargame = async () => {
  try {
    const join = "cargame";
    const updatenum = 1;

    const [cargameNow] = await connection.query(
      "SELECT period FROM cargame WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1",
      [join]
    );

    let period = cargameNow[0]?.period || timerJoins(Date.now());
    const [setting] = await connection.query("SELECT * FROM `admin`");
    const nextResult = setting[0]?.[join] || "-1";
    let newArr = "";

    if (nextResult == "-1") {
      // Generate 3 distinct results
      const results = new Set();
      let guard = 0;
      while (results.size < 3 && guard++ < 100) {
        const result = await addcargame_handel(join, results.size + 1);
        if (result >= 1 && result <= 9) results.add(result);
      }
      const [r1, r2, r3] = [...results];
      newArr = `${r1},${r2},${r3}`;

      await connection.execute(
        "UPDATE cargame SET amount = ?, status = ? WHERE period = ? AND game = ?",
        [newArr, 1, period, join]
      );
    } else {
      await connection.execute(
        "UPDATE cargame SET amount = ?, status = ? WHERE period = ? AND game = ?",
        [nextResult, 1, period, join]
      );
    }

    const times = timerJoins(Date.now());

    if (cargameNow[0] === undefined) {
      period = `${times}1${updatenum}0000`;
    } else {
      const dbPeriod = cargameNow[0].period;
      const dbDatePart = dbPeriod.slice(0, 8);
      period = dbDatePart == times ? dbPeriod : `${times}1${updatenum}0000`;
    }

    const newPeriod = BigInt(period) + BigInt(1);

    await connection.execute(
      "INSERT INTO cargame (period, amount, game, status, time) VALUES (?, ?, ?, ?, ?)",
      [String(newPeriod), 0, join, 0, timerJoin2(Date.now())]
    );

    await connection.execute(`UPDATE admin SET ${join} = -1`);
  } catch (error) {
    console.error("addcargame error:", error);
  }
};

// ==================== HANDLE SETTLEMENT ====================
const handlingcargame1P = async () => {
  await handlingcargamepostion("cargame", 1);
  await handlingcargamepostion("cargame", 2);
  await handlingcargamepostion("cargame", 3);
};

const handlingcargamepostion = async (typeid, carpostion) => {
  const game = "cargame";

  const [cargameNow] = await connection.query(
    "SELECT * FROM cargame WHERE status != 0 AND game = ? ORDER BY id DESC LIMIT 1",
    [game]
  );

  if (!cargameNow?.length) return false;

  await connection.execute(
    "UPDATE cargame_result SET result = ? WHERE status = 0 AND game = ? AND gamePosition = ?",
    [cargameNow[0].amount, game, carpostion]
  );

  const result = cargameNow[0].amount;
  const digit = getDigitByPosition(result, carpostion);
  if (digit === null) return false;

  // Determine which bets are losers (status = 2) for this position
  let excludedBets;
  switch (digit) {
    case 0:
      excludedBets = ["l", "n", "d", "0", "t"];
      break;
    case 1:
      excludedBets = ["l", "n", "x", "1"];
      break;
    case 2:
      excludedBets = ["l", "n", "d", "2"];
      break;
    case 3:
      excludedBets = ["l", "n", "x", "3"];
      break;
    case 4:
      excludedBets = ["l", "n", "d", "4"];
      break;
    case 5:
      excludedBets = ["l", "n", "x", "5", "t"];
      break;
    case 6:
      excludedBets = ["l", "n", "d", "6"];
      break;
    case 7:
      excludedBets = ["l", "n", "x", "7"];
      break;
    case 8:
      excludedBets = ["l", "n", "d", "8"];
      break;
    case 9:
      excludedBets = ["l", "n", "x", "9"];
      break;
    default:
      excludedBets = [];
  }

  if (excludedBets.length) {
    const placeholders = excludedBets.map(() => "?").join(",");
    await connection.execute(
      `UPDATE cargame_result SET status = 2 
       WHERE status = 0 AND game = ? AND gamePosition = ? AND bet NOT IN (${placeholders})`,
      [game, carpostion, ...excludedBets]
    );
  }

  // Mark big/small losers
  if (digit < 5) {
    await connection.execute(
      'UPDATE cargame_result SET status = 2 WHERE status = 0 AND game = ? AND gamePosition = ? AND bet = "l"',
      [game, carpostion]
    );
  } else {
    await connection.execute(
      'UPDATE cargame_result SET status = 2 WHERE status = 0 AND game = ? AND gamePosition = ? AND bet = "n"',
      [game, carpostion]
    );
  }

  // Payout winners
  const [orders] = await connection.execute(
    "SELECT * FROM cargame_result WHERE status = 0 AND game = ? AND gamePosition = ?",
    [game, carpostion]
  );

  const checkTime2 = timerJoin2(Date.now());

  for (const order of orders) {
    const { id, phone, bet } = order;
    const orderResult = getDigitByPosition(order?.result, carpostion);
    const total = Number(order.money);
    let nhan_duoc = 0;

    if (bet === "l" || bet === "n") {
      nhan_duoc = total * 2;
    } else if (orderResult === 0 || orderResult === 5) {
      if (bet === "d" || bet === "x") nhan_duoc = total * 1.5;
      else if (bet === "t") nhan_duoc = total * 4.5;
      else if (bet === "0" || bet === "5") nhan_duoc = total * 4.5;
    } else {
      if (orderResult === 1 && bet === "1") nhan_duoc = total * 9;
      else if (orderResult === 1 && bet === "x") nhan_duoc = total * 2;
      if (orderResult === 2 && bet === "2") nhan_duoc = total * 9;
      else if (orderResult === 2 && bet === "d") nhan_duoc = total * 2;
      if (orderResult === 3 && bet === "3") nhan_duoc = total * 9;
      else if (orderResult === 3 && bet === "x") nhan_duoc = total * 2;
      if (orderResult === 4 && bet === "4") nhan_duoc = total * 9;
      else if (orderResult === 4 && bet === "d") nhan_duoc = total * 2;
      if (orderResult === 6 && bet === "6") nhan_duoc = total * 9;
      else if (orderResult === 6 && bet === "d") nhan_duoc = total * 2;
      if (orderResult === 7 && bet === "7") nhan_duoc = total * 9;
      else if (orderResult === 7 && bet === "x") nhan_duoc = total * 2;
      if (orderResult === 8 && bet === "8") nhan_duoc = total * 9;
      else if (orderResult === 8 && bet === "d") nhan_duoc = total * 2;
      if (orderResult === 9 && bet === "9") nhan_duoc = total * 9;
      else if (orderResult === 9 && bet === "x") nhan_duoc = total * 2;
    }

    const totalsGet = parseFloat(nhan_duoc) || 0;

    await connection.execute("UPDATE `cargame_result` SET `get` = ?, `status` = 1 WHERE `id` = ?", [
      totalsGet,
      id,
    ]);
    await connection.execute(
      "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?",
      [phone, "Win", totalsGet, checkTime2]
    );
    await connection.execute("UPDATE `users` SET `money` = `money` + ? WHERE `phone` = ?", [
      totalsGet,
      phone,
    ]);
  }
};

// ==================== EXPORTS ====================
module.exports = {
  betcargame,
  listOrderOld,
  GetMyEmerdList,
  handlingcargame1P,
  addcargame,
};