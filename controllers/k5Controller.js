import connection from "../config/connectDB";
require("dotenv").config();

// ==================== PAGES ====================
const K5DPage = async (req, res) => {
  return res.render("bet/5d/5d.ejs");
};

const K5DPage3 = async (req, res) => {
  return res.render("bet/wingo/win3.ejs");
};

const K5DPage5 = async (req, res) => {
  return res.render("bet/wingo/win5.ejs");
};

const K5DPage10 = async (req, res) => {
  return res.render("bet/wingo/win10.ejs");
};

// ==================== HELPERS ====================
const isNumber = (params) => {
  const pattern = /^[0-9]+$/;
  return pattern.test(String(params));
};

const formateT = (params) => (params < 10 ? "0" + params : params);

function timerJoin2(params = "", addHours = 0) {
  const date = params ? new Date(Number(params)) : new Date();
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

  return `${getPart("year")}-${getPart("month")}-${getPart("day")} ${getPart("hour")}:${getPart("minute")}:${getPart("second")}`;
}

function makeid(length) {
  let result = "";
  const characters = "0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// ==================== ROSES PLUS ====================
const rosesPlus = async (auth, money) => {
  try {
    const [level] = await connection.query("SELECT * FROM level");
    const level0 = level[0];

    const [user] = await connection.query(
      "SELECT `phone`, `code`, `invite` FROM users WHERE token = ? AND veri = 1 LIMIT 1",
      [auth]
    );
    if (!user.length) return;
    const userInfo = user[0];

    if (money < 10000) return;

    const [f1] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `rank` FROM users WHERE code = ? AND veri = 1 LIMIT 1",
      [userInfo.invite]
    );
    if (!f1.length) return;

    const infoF1 = f1[0];
    const rosesF1 = (money / 100) * level0.f1;
    await connection.query(
      "UPDATE users SET money = money + ?, roses_f1 = roses_f1 + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ?",
      [rosesF1, rosesF1, rosesF1, rosesF1, infoF1.phone]
    );

    const [f2] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `rank` FROM users WHERE code = ? AND veri = 1 LIMIT 1",
      [infoF1.invite]
    );
    if (!f2.length) return;

    const infoF2 = f2[0];
    const rosesF2 = (money / 100) * level0.f2;
    await connection.query(
      "UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ?",
      [rosesF2, rosesF2, rosesF2, infoF2.phone]
    );

    const [f3] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `rank` FROM users WHERE code = ? AND veri = 1 LIMIT 1",
      [infoF2.invite]
    );
    if (!f3.length) return;

    const infoF3 = f3[0];
    const rosesF3 = (money / 100) * level0.f3;
    await connection.query(
      "UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ?",
      [rosesF3, rosesF3, rosesF3, infoF3.phone]
    );

    const [f4] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `rank` FROM users WHERE code = ? AND veri = 1 LIMIT 1",
      [infoF3.invite]
    );
    if (!f4.length) return;

    const infoF4 = f4[0];
    const rosesF4 = (money / 100) * level0.f4;
    await connection.query(
      "UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ?",
      [rosesF4, rosesF4, rosesF4, infoF4.phone]
    );
  } catch (error) {
    console.error("rosesPlus error:", error.message);
    throw error; // let caller decide how to handle
  }
};

// ==================== BET VALIDATION ====================
const validateBet = async (join, list_join, x, money, game) => {
  const checkJoin = isNumber(list_join);
  const checkX = isNumber(x);

  const validJoins = ["a", "b", "c", "d", "e", "total"];
  const validGames = ["1", "3", "5", "10"];
  const validMoney = [1, 10, 100, 1000];

  if (
    !validJoins.includes(join) ||
    String(list_join || "").length > 10 ||
    !checkX ||
    !validMoney.includes(Number(money)) ||
    !validGames.includes(String(game))
  ) {
    return false;
  }

  if (checkJoin) {
    const arr = String(list_join).split("");
    for (const ch of arr) {
      if (!"0123456789".includes(ch)) return false;
    }
  } else {
    const arr = String(list_join).split("");
    for (const ch of arr) {
      if (!"clbs".includes(ch)) return false;
    }
  }

  return true;
};

// ==================== BET 5D ====================
const betK5D = async (req, res) => {
  try {
    const { join, list_join, x, money, game } = req.body;
    const auth = req.cookies.auth;

    const validate = await validateBet(join, list_join, x, money, game);
    if (!validate) {
      return res.status(200).json({ message: "Invalid bet", status: false });
    }

    if (!money) {
      return res.status(200).json({ message: "server error", status: false });
    }

    const [k5DNow] = await connection.query(
      "SELECT period FROM 5d WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1",
      [game]
    );
    const [user] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1 LIMIT 1",
      [auth]
    );
    if (k5DNow.length < 1 || user.length < 1) {
      return res.status(200).json({ message: "Error!", status: false });
    }

    const userInfo = user[0];
    const period = k5DNow[0];

    const date = new Date();
    const years = formateT(date.getFullYear());
    const months = formateT(date.getMonth() + 1);
    const days = formateT(date.getDate());
    const id_product = years + months + days + Math.floor(Math.random() * 1000000000000000);

    const total = Number(money) * Number(x) * String(list_join).split("").length;
    const fee = total * 0.02;
    const price = total - fee;

    const check = Number(userInfo.money) - total;
    const timeNow = timerJoin2(Date.now());

    if (check < 0) {
      return res.status(200).json({ message: "The amount is not enough", status: false });
    }

    // Insert bet
    const sql = `INSERT INTO result_5d SET id_product = ?, phone = ?, code = ?, invite = ?, stage = ?, level = ?, money = ?, price = ?, amount = ?, fee = ?, game = ?, join_bet = ?, bet = ?, status = ?, time = ?`;
    await connection.execute(sql, [
      id_product,
      userInfo.phone,
      userInfo.code,
      userInfo.invite,
      period.period,
      userInfo.level,
      total,
      price,
      x,
      fee,
      game,
      join,
      list_join,
      0,
      timeNow,
    ]);

    await connection.execute("UPDATE `users` SET `money` = `money` - ? WHERE `token` = ?", [total, auth]);

    // Fetch updated user
    const [users] = await connection.query(
      "SELECT * FROM users WHERE token = ? AND veri = 1 LIMIT 1",
      [auth]
    );

    // Roses (level 1-4 upline bonus on 10k+ bets)
    await rosesPlus(auth, Number(money) * Number(x));

    // Insert roses record
    const [level] = await connection.query("SELECT * FROM level");
    const level0 = level[0];
    const f1 = (total / 100) * level0.f1;
    const f2 = (total / 100) * level0.f2;
    const f3 = (total / 100) * level0.f3;
    const f4 = (total / 100) * level0.f4;
    const sql2 = `INSERT INTO roses SET phone = ?, code = ?, invite = ?, f1 = ?, f2 = ?, f3 = ?, f4 = ?, time = ?`;
    await connection.execute(sql2, [
      userInfo.phone,
      userInfo.code,
      userInfo.invite,
      f1,
      f2,
      f3,
      f4,
      timeNow,
    ]);

    // Deduct from recharge (if bet < recharge)
    if (total < Number(users[0].recharge)) {
      await connection.execute("UPDATE `users` SET `recharge` = `recharge` - ? WHERE `phone` = ?", [
        total,
        users[0].phone,
      ]);
    }

    // Walk up 6 levels of uplines, record subordinatedata
    let uplines = users;
    let count = 0;
    for (let i = 0; i < 6; i++) {
      if (!uplines || uplines.length === 0) break;
      if (!level[i]) break;

      const rosesF = (total / 100) * level[i].f1;
      const [upline] = await connection.query("SELECT * FROM users WHERE code = ?", [uplines[0].invite]);

      if (upline.length === 0) break;

      count++;
      await connection.query(
        "INSERT INTO subordinatedata SET phone = ?, bonusby = ?, type = ?, commission = ?, amount = ?, level = ?, `date` = ?",
        [upline[0].phone, uplines[0].phone, "Bet commission", rosesF, total, count, timeNow]
      );
      uplines = upline;
    }

    return res.status(200).json({
      message: "Bet Succeed",
      status: true,
      change: users[0].level,
      money: users[0].money,
    });
  } catch (error) {
    console.error("betK5D error:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== LIST ORDER OLD ====================
const listOrderOld = async (req, res) => {
  try {
    const { gameJoin, pageno, pageto } = req.body;
    const auth = req.cookies.auth;

    const validGames = ["1", "3", "5", "10"];
    if (!validGames.includes(String(gameJoin)) || pageno < 0 || pageto < 0) {
      return res.status(200).json({
        code: 0,
        msg: "No more data",
        data: { gameslist: [] },
        status: false,
      });
    }

    const [user] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1 LIMIT 1",
      [auth]
    );
    if (!user.length) {
      return res.status(200).json({ message: "Error!", status: false });
    }

    const game = Number(gameJoin);
    const offset = Number(pageno) - 1;
    const limit = Number(pageto) - Number(pageno) + 1;

    const [k5d] = await connection.query(
      "SELECT * FROM 5d WHERE status != 0 AND game = ? ORDER BY id DESC LIMIT ? OFFSET ?",
      [game, limit, offset]
    );
    const [k5dAll] = await connection.query("SELECT * FROM 5d WHERE status != 0 AND game = ?", [game]);
    const [period] = await connection.query(
      "SELECT period FROM 5d WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1",
      [game]
    );

    if (k5d.length === 0) {
      return res.status(200).json({
        code: 0,
        msg: "No more data",
        data: { gameslist: [] },
        page: 1,
        status: false,
      });
    }

    if (!pageno || !pageto || !user[0] || !k5d[0] || !period[0]) {
      return res.status(200).json({ message: "Error!", status: false });
    }

    const page = Math.ceil(k5dAll.length / 10);
    return res.status(200).json({
      code: 0,
      msg: "Get success",
      data: { gameslist: k5d },
      period: period[0].period,
      page,
      status: true,
    });
  } catch (error) {
    console.error("listOrderOld error:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== GET MY EMERD LIST ====================
const GetMyEmerdList = async (req, res) => {
  try {
    const { gameJoin, pageno, pageto } = req.body;
    const auth = req.cookies.auth;

    const validGames = ["1", "3", "5", "10"];
    if (!validGames.includes(String(gameJoin)) || pageno < 0 || pageto < 0) {
      return res.status(200).json({
        code: 0,
        msg: "No more data",
        data: { gameslist: [] },
        status: false,
      });
    }

    const game = Number(gameJoin);
    const [user] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1 LIMIT 1",
      [auth]
    );
    if (!user.length) {
      return res.status(200).json({ message: "Error!", status: false });
    }

    const offset = Number(pageno) - 1;
    const limit = Number(pageto) - Number(pageno) + 1;

    const [result_5d] = await connection.query(
      "SELECT * FROM result_5d WHERE phone = ? AND game = ? ORDER BY id DESC LIMIT ? OFFSET ?",
      [user[0].phone, game, limit, offset]
    );
    const [result_5dAll] = await connection.query(
      "SELECT * FROM result_5d WHERE phone = ? AND game = ? ORDER BY id DESC",
      [user[0].phone, game]
    );

    if (!result_5d[0]) {
      return res.status(200).json({
        code: 0,
        msg: "No more data",
        data: { gameslist: [] },
        page: 1,
        status: false,
      });
    }

    if (!pageno || !pageto || !user[0] || !result_5d[0]) {
      return res.status(200).json({ message: "Error!", status: true });
    }

    const page = Math.ceil(result_5dAll.length / 10);

    const datas = result_5d.map((data) => {
      const { id, phone, code, invite, level, game, ...others } = data;
      return others;
    });

    return res.status(200).json({
      code: 0,
      msg: "Get Success",
      data: { gameslist: datas },
      page,
      status: true,
    });
  } catch (error) {
    console.error("GetMyEmerdList error:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== ADD 5D (admin round creation) ====================
const add5D = async (game) => {
  try {
    let join = "";
    if (game == 1) join = "k5d";
    if (game == 3) join = "k5d3";
    if (game == 5) join = "k5d5";
    if (game == 10) join = "k5d10";

    const result2 = makeid(5);

    const [k5D] = await connection.query(
      "SELECT period FROM 5d WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1",
      [game]
    );
    const [setting] = await connection.query("SELECT * FROM `admin`");

    let period;
    const currentDates = new Date();
    const years = currentDates.getFullYear();
    const months = String(currentDates.getMonth() + 1).padStart(2, "0");
    const days = String(currentDates.getDate()).padStart(2, "0");
    const formattedDates = `${years}${months}${days}`;

    if (k5D[0] === undefined) {
      period = `${formattedDates}0100`;
    } else {
      const dbPeriod = k5D[0].period;
      const dbDatePart = dbPeriod.toString().slice(0, 8);
      period = dbDatePart == formattedDates ? dbPeriod : `${formattedDates}0100`;
    }

    let nextResult = "";
    if (game == 1) nextResult = setting[0].k5d;
    if (game == 3) nextResult = setting[0].k5d3;
    if (game == 5) nextResult = setting[0].k5d5;
    if (game == 10) nextResult = setting[0].k5d10;

    const timeNow = timerJoin2(Date.now());
    let newArr = "";

    if (nextResult == "-1") {
      await connection.execute("UPDATE 5d SET result = ?, status = ? WHERE period = ? AND game = ?", [
        result2,
        1,
        period,
        game,
      ]);
      newArr = "-1";
    } else {
      const arr = nextResult.split("|");
      if (arr.length == 1) {
        newArr = "-1";
      } else {
        newArr = arr.slice(1).join("|");
      }
      const result = arr[0];
      await connection.execute("UPDATE 5d SET result = ?, status = ? WHERE period = ? AND game = ?", [
        result,
        1,
        period,
        game,
      ]);
    }

    await connection.execute("INSERT INTO 5d SET period = ?, result = ?, game = ?, status = ?, time = ?", [
      Number(period) + 1,
      0,
      game,
      0,
      timeNow,
    ]);

    await connection.execute(`UPDATE admin SET ${join} = ?`, [newArr]);
  } catch (error) {
    console.error("add5D error:", error);
  }
};

// ==================== FUN HANDLING (settlement) ====================
async function funHanding(game) {
  try {
    const [k5d] = await connection.query(
      "SELECT * FROM 5d WHERE status != 0 AND game = ? ORDER BY id DESC LIMIT 1",
      [game]
    );
    const k5dInfo = k5d[0];

    await connection.execute("UPDATE result_5d SET result = ? WHERE status = 0 AND game = ?", [
      k5dInfo.result,
      game,
    ]);

    const result = String(k5dInfo.result).split("");
    const [a, b, c, d, e] = result;
    let total = 0;
    for (const digit of result) {
      total += Number(digit);
    }

    // Helper: settle one position (a/b/c/d/e)
    const settlePosition = async (position, digit) => {
      const [bets] = await connection.execute(
        `SELECT id, bet FROM result_5d WHERE status = 0 AND game = ? AND join_bet = ?`,
        [game, position]
      );

      for (const info of bets) {
        if (isNumber(info.bet)) {
          if (!info.bet.split("").includes(digit)) {
            await connection.execute("UPDATE result_5d SET status = 2 WHERE id = ?", [info.id]);
          }
        }
      }

      if (bets.length > 0) {
        const num = Number(digit);
        if (num >= 0 && num <= 4) {
          await connection.execute(
            `UPDATE result_5d SET status = 2 WHERE join_bet = ? AND bet = 'b'`,
            [position]
          );
        }
        if (num >= 5 && num <= 9) {
          await connection.execute(
            `UPDATE result_5d SET status = 2 WHERE join_bet = ? AND bet = 's'`,
            [position]
          );
        }
        if (num % 2 === 0) {
          await connection.execute(
            `UPDATE result_5d SET status = 2 WHERE join_bet = ? AND bet = 'l'`,
            [position]
          );
        }
        if (num % 2 !== 0) {
          await connection.execute(
            `UPDATE result_5d SET status = 2 WHERE join_bet = ? AND bet = 'c'`,
            [position]
          );
        }
      }
    };

    await settlePosition("a", a);
    await settlePosition("b", b);
    await settlePosition("c", c);
    await settlePosition("d", d);
    await settlePosition("e", e);

    // Total
    const [joinTotal] = await connection.execute(
      `SELECT id FROM result_5d WHERE status = 0 AND game = ? AND join_bet = 'total'`,
      [game]
    );
    if (joinTotal.length > 0) {
      if (total <= 22) {
        await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'total' AND bet = 'b'`);
      }
      if (total > 22) {
        await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'total' AND bet = 's'`);
      }
      if (total % 2 === 0) {
        await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'total' AND bet = 'l'`);
      }
      if (total % 2 !== 0) {
        await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'total' AND bet = 'c'`);
      }
    }
  } catch (error) {
    console.error("funHanding error:", error.message);
    throw error;
  }
}

// ==================== HANDLING 5D (payout) ====================
const handling5D = async (typeid) => {
  try {
    const game = Number(typeid);
    await funHanding(game);

    const [order] = await connection.execute(
      "SELECT id, phone, bet, price, money, fee, amount FROM result_5d WHERE status = 0 AND game = ?",
      [game]
    );

    for (const orders of order) {
      const { id, phone, bet, price, money, amount } = orders;
      let nhan_duoc = 0;

      if (isNumber(bet)) {
        const arr = bet.split("");
        const total = money / arr.length / amount;
        const fee = total * 0.02;
        const pricePerDigit = total - fee;
        nhan_duoc += pricePerDigit * 9;
      } else {
        nhan_duoc += price * 2;
      }

      await connection.execute("UPDATE `result_5d` SET `get` = ?, `status` = 1 WHERE `id` = ?", [nhan_duoc, id]);
      await connection.execute("UPDATE `users` SET `money` = `money` + ? WHERE `phone` = ?", [nhan_duoc, phone]);
    }
  } catch (error) {
    console.error("handling5D error:", error.message);
    throw error;
  }
};

// ==================== EXPORTS ====================
module.exports = {
  K5DPage,
  K5DPage3,
  K5DPage5,
  K5DPage10,
  betK5D,
  listOrderOld,
  GetMyEmerdList,
  add5D,
  handling5D,
};