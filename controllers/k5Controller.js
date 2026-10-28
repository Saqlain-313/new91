import connection from "../config/connectDB";
require("dotenv").config();

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

const isNumber = (params) => {
  let pattern = /^[0-9]*\d$/;
  return pattern.test(params);
};

function formateT(params) {
  return params < 10 ? "0" + params : params;
}

function timerJoin2(params = "", addHours = 0) {
  let date = params ? new Date(Number(params)) : new Date();
  if (addHours !== 0) date.setHours(date.getHours() + addHours);
  const options = {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  };
  const formatter = new Intl.DateTimeFormat("en-GB", options);
  const parts = formatter.formatToParts(date);
  const getPart = (type) => parts.find((part) => part.type === type).value;
  return `${getPart("year")}-${getPart("month")}-${getPart("day")} ${getPart("hour")}:${getPart("minute")}:${getPart("second")}`;
}

const rosesPlus = async (auth, money) => {
  try {
    const [level] = await connection.query("SELECT * FROM level ");
    let level0 = level[0];
    const [user] = await connection.query(
      "SELECT `phone`, `code`, `invite` FROM users WHERE token = ? AND veri = 1 LIMIT 1 ",
      [auth],
    );
    let userInfo = user[0];
    const [f1] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `rank` FROM users WHERE code = ? AND veri = 1 LIMIT 1 ",
      [userInfo.invite],
    );
    if (money >= 10000) {
      if (f1.length > 0) {
        let infoF1 = f1[0];
        let rosesF1 = (money / 100) * level0.f1;
        await connection.query(
          "UPDATE users SET money = money + ?, roses_f1 = roses_f1 + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ",
          [rosesF1, rosesF1, rosesF1, rosesF1, infoF1.phone],
        );
        const [f2] = await connection.query(
          "SELECT `phone`, `code`, `invite`, `rank` FROM users WHERE code = ? AND veri = 1 LIMIT 1 ",
          [infoF1.invite],
        );
        if (f2.length > 0) {
          let infoF2 = f2[0];
          let rosesF2 = (money / 100) * level0.f2;
          await connection.query(
            "UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ",
            [rosesF2, rosesF2, rosesF2, infoF2.phone],
          );
          const [f3] = await connection.query(
            "SELECT `phone`, `code`, `invite`, `rank` FROM users WHERE code = ? AND veri = 1 LIMIT 1 ",
            [infoF2.invite],
          );
          if (f3.length > 0) {
            let infoF3 = f3[0];
            let rosesF3 = (money / 100) * level0.f3;
            await connection.query(
              "UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ",
              [rosesF3, rosesF3, rosesF3, infoF3.phone],
            );
            const [f4] = await connection.query(
              "SELECT `phone`, `code`, `invite`, `rank` FROM users WHERE code = ? AND veri = 1 LIMIT 1 ",
              [infoF3.invite],
            );
            if (f4.length > 0) {
              let infoF4 = f4[0];
              let rosesF4 = (money / 100) * level0.f4;
              await connection.query(
                "UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ? ",
                [rosesF4, rosesF4, rosesF4, infoF4.phone],
              );
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error :", error.message);
  }
};

const validateBet = async (join, list_join, x, money, game) => {
  let checkJoin = isNumber(list_join);
  let checkX = isNumber(x);
  const checks = ["a", "b", "c", "d", "e", "total"].includes(join);
  const checkGame = ["1", "3", "5", "10"].includes(String(game));
  const checkMoney = [1, 10, 100, 1000].includes(money);
  if (!checks || list_join?.length > 10 || !checkX || !checkMoney || !checkGame) return false;
  if (checkJoin) {
    let arr = String(list_join)?.split("");
    for (let i = 0; i < arr.length; i++) {
      if (!["0","1","2","3","4","5","6","7","8","9"].includes(arr[i])) return false;
    }
  } else {
    let arr = String(list_join).split("");
    for (let i = 0; i < arr.length; i++) {
      if (!["c", "l", "b", "s"].includes(arr[i])) return false;
    }
  }
  return true;
};

const betK5D = async (req, res) => {
  try {
    let { join, list_join, x, money, game } = req.body;
    let auth = req.cookies.auth;
    let validate = await validateBet(join, list_join, x, money, game);
    if (!validate) return res.status(200).json({ message: "Invalid bet", status: false });
    if (!money) return res.status(200).json({ message: "server error", status: false });

    const [k5DNow] = await connection.query(
      `SELECT period FROM \`5d\` WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1 `,
      [game]
    );
    const [user] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1 LIMIT 1 ",
      [auth],
    );
    if (k5DNow.length < 1 || user.length < 1) {
      return res.status(200).json({ message: "Error!", status: false });
    }
    let userInfo = user[0];
    let period = k5DNow[0];

    let date = new Date();
    let years = formateT(date.getFullYear());
    let months = formateT(date.getMonth() + 1);
    let days = formateT(date.getDate());
    let id_product = years + months + days + Math.floor(Math.random() * 1000000000000000);

    let total = money * x * String(list_join).split("").length;
    let fee = total * 0.02;
    let price = total - fee;
    let check = userInfo.money - total;
    const timeNow = timerJoin2(Date.now());

    if (check >= 0) {
      const sql = `INSERT INTO result_5d SET id_product = ?,phone = ?,code = ?,invite = ?,stage = ?,level = ?,money = ?,price = ?,amount = ?,fee = ?,game = ?,join_bet = ?,bet = ?,status = ?,time = ?`;
      await connection.execute(sql, [
        id_product, userInfo.phone, userInfo.code, userInfo.invite,
        period.period, userInfo.level, total, price, x, fee, game,
        join, list_join, 0, timeNow,
      ]);
      await connection.execute(
        "UPDATE `users` SET `money` = `money` - ? WHERE `token` = ? ",
        [total, auth],
      );
      const [users] = await connection.query(
        "SELECT * FROM users WHERE token = ? AND veri = 1 LIMIT 1 ",
        [auth],
      );
      await rosesPlus(auth, money * x);
      const [level] = await connection.query("SELECT * FROM level ");
      let level0 = level[0];
      const sql2 = `INSERT INTO roses SET phone = ?,code = ?,invite = ?,f1 = ?,f2 = ?,f3 = ?,f4 = ?,time = ?`;
      let total_m = total;
      let f1 = (total_m / 100) * level0.f1;
      let f2 = (total_m / 100) * level0.f2;
      let f3 = (total_m / 100) * level0.f3;
      let f4 = (total_m / 100) * level0.f4;
      await connection.execute(sql2, [
        userInfo.phone, userInfo.code, userInfo.invite, f1, f2, f3, f4, timeNow,
      ]);

      if (total < users[0].recharge) {
        await connection.execute(
          "UPDATE `users` SET `recharge` = `recharge` - ? WHERE `phone` = ? ",
          [total, users[0].phone],
        );
      }

      let uplines2 = users;
      let count = 0;
      for (let i = 0; i < 6; i++) {
        let rosesF = (total / 100) * level[i].f1;
        if (uplines2.length !== 0) {
          let [upline1] = await connection.query(
            "SELECT * FROM users WHERE code = ?", [uplines2[0].invite]
          );
          if (upline1.length > 0) {
            count++;
            await connection.query(
              "INSERT INTO subordinatedata SET phone = ?, bonusby=?, type = ?,commission=?, amount = ?,level=?, `date` = ?",
              [upline1[0].phone, uplines2[0].phone, "Bet commission", rosesF, total, count, timeNow],
            );
            uplines2 = upline1;
          } else break;
        } else break;
      }

      return res.status(200).json({
        message: "Bet Succeed", status: true,
        change: users[0].level, money: users[0].money,
      });
    } else {
      return res.status(200).json({ message: "The amount is not enough", status: false });
    }
  } catch (error) {
    if (error) console.log(error);
  }
};

const listOrderOld = async (req, res) => {
  try {
    let { gameJoin, pageno, pageto } = req.body;
    let auth = req.cookies.auth;
    let checkGame = ["1", "3", "5", "10"].includes(String(gameJoin));
    if (!checkGame || pageno < 0 || pageto < 0) {
      return res.status(200).json({ code: 0, msg: "No more data", data: { gameslist: [] }, status: false });
    }
    const [user] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1 LIMIT 1 ",
      [auth],
    );
    let game = Number(gameJoin);
    const offset = pageno - 1;
    const limit = pageto - pageno + 1;
    const [k5d] = await connection.query(
      `SELECT * FROM \`5d\` WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`
    );
    const [k5dAll] = await connection.query(
      `SELECT * FROM \`5d\` WHERE status != 0 AND game = '${game}' `
    );
    const [period] = await connection.query(
      `SELECT period FROM \`5d\` WHERE status = 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `
    );
    if (k5d.length == 0) {
      return res.status(200).json({ code: 0, msg: "No more data", data: { gameslist: [] }, page: 1, status: false });
    }
    if (!pageno || !pageto || !user[0] || !k5d[0] || !period[0]) {
      return res.status(200).json({ message: "Error!", status: false });
    }
    let page = Math.ceil(k5dAll.length / 10);
    return res.status(200).json({
      code: 0, msg: "Get success", data: { gameslist: k5d },
      period: period[0].period, page: page, status: true,
    });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const GetMyEmerdList = async (req, res) => {
  try {
    let { gameJoin, pageno, pageto } = req.body;
    let auth = req.cookies.auth;
    let checkGame = ["1", "3", "5", "10"].includes(String(gameJoin));
    if (!checkGame || pageno < 0 || pageto < 0) {
      return res.status(200).json({ code: 0, msg: "No more data", data: { gameslist: [] }, status: false });
    }
    let game = Number(gameJoin);
    const [user] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1 LIMIT 1 ",
      [auth],
    );
    const offset = pageno - 1;
    const limit = pageto - pageno + 1;
    const [result_5d] = await connection.query(
      `SELECT * FROM result_5d WHERE phone = ? AND game = '${game}' ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`,
      [user[0].phone]
    );
    const [result_5dAll] = await connection.query(
      `SELECT * FROM result_5d WHERE phone = ? AND game = '${game}' ORDER BY id DESC `,
      [user[0].phone]
    );
    if (!result_5d[0]) {
      return res.status(200).json({ code: 0, msg: "No more data", data: { gameslist: [] }, page: 1, status: false });
    }
    if (!pageno || !pageto || !user[0] || !result_5d[0]) {
      return res.status(200).json({ message: "Error!", status: true });
    }
    let page = Math.ceil(result_5dAll.length / 10);
    let datas = result_5d.map((data) => {
      let { id, phone, code, invite, level, game, ...others } = data;
      return others;
    });
    return res.status(200).json({
      code: 0, msg: "Get Success", data: { gameslist: datas }, page: page, status: true,
    });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

function makeid(length) {
  var result = "";
  var characters = "0123456789";
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// ✅ FULLY FIXED add5D
const add5D = async (game) => {
  try {
    let join = "";
    if (game == 1) join = "k5d";
    if (game == 3) join = "k5d3";
    if (game == 5) join = "k5d5";
    if (game == 10) join = "k5d10";

    let result2 = makeid(5);

    // ✅ Backticks added to `5d`
    let [k5D] = await connection.query(
      `SELECT period FROM \`5d\` WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1 `,
      [game]
    );
    const [setting] = await connection.query("SELECT * FROM `admin` ");

    let period;
    const currentDates = new Date();
    const years = currentDates.getFullYear();
    const months = String(currentDates.getMonth() + 1).padStart(2, "0");
    const days = String(currentDates.getDate()).padStart(2, "0");
    const formattedDates = `${years}${months}${days}`;

    if (k5D[0] === undefined) {
      period = `${formattedDates}0100`;
    } else {
      let dbPeriod = k5D[0].period;
      let dbDatePart = dbPeriod.toString().slice(0, 8);
      if (dbDatePart == formattedDates) {
        period = dbPeriod;
      } else {
        period = `${formattedDates}0100`;
      }
    }

    let nextResult = "";
    if (game == 1) nextResult = setting[0].k5d;
    if (game == 3) nextResult = setting[0].k5d3;
    if (game == 5) nextResult = setting[0].k5d5;
    if (game == 10) nextResult = setting[0].k5d10;

    const timeNow = timerJoin2(Date.now());
    let newArr = "";

    // ✅ Backticks and proper ? placeholders
    if (nextResult == "-1") {
      await connection.execute(
        `UPDATE \`5d\` SET result = ?, status = ? WHERE period = ? AND game = ?`,
        [result2, 1, period, game]
      );
      newArr = "-1";
    } else {
      let result = "";
      let arr = nextResult.split("|");
      let check = arr.length;
      if (check == 1) {
        newArr = "-1";
      } else {
        for (let i = 1; i < arr.length; i++) newArr += arr[i] + "|";
        newArr = newArr.slice(0, -1);
      }
      result = arr[0];
      await connection.execute(
        `UPDATE \`5d\` SET result = ?, status = ? WHERE period = ? AND game = ?`,
        [result, 1, period, game]
      );
    }

    // ✅ Backticks added to INSERT
    const sql = `INSERT INTO \`5d\` SET period = ?, result = ?, game = ?, status = ?, time = ?`;
    await connection.execute(sql, [Number(period) + 1, 0, game, 0, timeNow]);

    await connection.execute(`UPDATE admin SET ${join} = ?`, [newArr]);
  } catch (error) {
    console.log("add5D Error:", error);
  }
};

async function funHanding(game) {
  try {
    // ✅ Backticks
    const [k5d] = await connection.query(
      `SELECT * FROM \`5d\` WHERE status != 0 AND game = ? ORDER BY id DESC LIMIT 1 `,
      [game]
    );
    let k5dInfo = k5d[0];

    await connection.execute(
      `UPDATE result_5d SET result = ? WHERE status = 0 AND game = ?`,
      [k5dInfo.result, game]
    );

    let result = String(k5dInfo.result).split("");
    let a = result[0], b = result[1], c = result[2], d = result[3], e = result[4];
    let total = 0;
    for (let i = 0; i < result.length; i++) total += Number(result[i]);

    // xử lý game a
    const [joinA] = await connection.execute(
      `SELECT id, bet FROM result_5d WHERE status = 0 AND game = ? AND join_bet = 'a' `, [game]
    );
    for (let i = 0; i < joinA.length; i++) {
      let info = joinA[i];
      if (isNumber(info.bet)) {
        if (!info.bet.split("").includes(a)) {
          await connection.execute(`UPDATE result_5d SET status = 2 WHERE id = ? `, [info.id]);
        }
      }
    }
    if (joinA.length > 0) {
      if (a <= "4") await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'a' AND bet = 'b' AND game = ?`, [game]);
      if (a >= "5") await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'a' AND bet = 's' AND game = ?`, [game]);
      if (Number(a) % 2 == 0) await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'a' AND bet = 'l' AND game = ?`, [game]);
      if (Number(a) % 2 != 0) await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'a' AND bet = 'c' AND game = ?`, [game]);
    }

    // xử lý game b
    const [joinB] = await connection.execute(
      `SELECT id, bet FROM result_5d WHERE status = 0 AND game = ? AND join_bet = 'b' `, [game]
    );
    for (let i = 0; i < joinB.length; i++) {
      let info = joinB[i];
      if (isNumber(info.bet) && !info.bet.split("").includes(b)) {
        await connection.execute(`UPDATE result_5d SET status = 2 WHERE id = ? `, [info.id]);
      }
    }
    if (joinB.length > 0) {
      if (b <= "4") await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'b' AND bet = 'b' AND game = ?`, [game]);
      if (b >= "5") await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'b' AND bet = 's' AND game = ?`, [game]);
      if (Number(b) % 2 == 0) await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'b' AND bet = 'l' AND game = ?`, [game]);
      if (Number(b) % 2 != 0) await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'b' AND bet = 'c' AND game = ?`, [game]);
    }

    // xử lý game c
    const [joinC] = await connection.execute(
      `SELECT id, bet FROM result_5d WHERE status = 0 AND game = ? AND join_bet = 'c' `, [game]
    );
    for (let i = 0; i < joinC.length; i++) {
      let info = joinC[i];
      if (isNumber(info.bet) && !info.bet.split("").includes(c)) {
        await connection.execute(`UPDATE result_5d SET status = 2 WHERE id = ? `, [info.id]);
      }
    }
    if (joinC.length > 0) {
      if (c <= "4") await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'c' AND bet = 'b' AND game = ?`, [game]);
      if (c >= "5") await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'c' AND bet = 's' AND game = ?`, [game]);
      if (Number(c) % 2 == 0) await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'c' AND bet = 'l' AND game = ?`, [game]);
      if (Number(c) % 2 != 0) await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'c' AND bet = 'c' AND game = ?`, [game]);
    }

    // xử lý game d
    const [joinD] = await connection.execute(
      `SELECT id, bet FROM result_5d WHERE status = 0 AND game = ? AND join_bet = 'd' `, [game]
    );
    for (let i = 0; i < joinD.length; i++) {
      let info = joinD[i];
      if (isNumber(info.bet) && !info.bet.split("").includes(d)) {
        await connection.execute(`UPDATE result_5d SET status = 2 WHERE id = ? `, [info.id]);
      }
    }
    if (joinD.length > 0) {
      if (d <= "4") await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'd' AND bet = 'b' AND game = ?`, [game]);
      if (d >= "5") await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'd' AND bet = 's' AND game = ?`, [game]);
      if (Number(d) % 2 == 0) await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'd' AND bet = 'l' AND game = ?`, [game]);
      if (Number(d) % 2 != 0) await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'd' AND bet = 'c' AND game = ?`, [game]);
    }

    // xử lý game e
    const [joinE] = await connection.execute(
      `SELECT id, bet FROM result_5d WHERE status = 0 AND game = ? AND join_bet = 'e' `, [game]
    );
    for (let i = 0; i < joinE.length; i++) {
      let info = joinE[i];
      if (isNumber(info.bet) && !info.bet.split("").includes(e)) {
        await connection.execute(`UPDATE result_5d SET status = 2 WHERE id = ? `, [info.id]);
      }
    }
    if (joinE.length > 0) {
      if (e <= "4") await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'e' AND bet = 'b' AND game = ?`, [game]);
      if (e >= "5") await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'e' AND bet = 's' AND game = ?`, [game]);
      if (Number(e) % 2 == 0) await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'e' AND bet = 'l' AND game = ?`, [game]);
      if (Number(e) % 2 != 0) await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'e' AND bet = 'c' AND game = ?`, [game]);
    }

    // xử lý total
    const [joinTotal] = await connection.execute(
      `SELECT id, bet FROM result_5d WHERE status = 0 AND game = ? AND join_bet = 'total' `, [game]
    );
    if (joinTotal.length > 0) {
      if (total <= 22) await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'total' AND bet = 'b' AND game = ?`, [game]);
      if (total > 22) await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'total' AND bet = 's' AND game = ?`, [game]);
      if (total % 2 == 0) await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'total' AND bet = 'l' AND game = ?`, [game]);
      if (total % 2 != 0) await connection.execute(`UPDATE result_5d SET status = 2 WHERE join_bet = 'total' AND bet = 'c' AND game = ?`, [game]);
    }
  } catch (error) {
    console.error("funHanding Error:", error.message);
  }
}

const handling5D = async (typeid) => {
  try {
    let game = Number(typeid);
    await funHanding(game);

    const [order] = await connection.execute(
      `SELECT id, phone, bet, price, money, fee, amount FROM result_5d WHERE status = 0 AND game = ? `, [game]
    );
    for (let i = 0; i < order.length; i++) {
      let orders = order[i];
      let id = orders.id;
      let phone = orders.phone;
      let nhan_duoc = 0;

      if (isNumber(orders.bet)) {
        let arr = orders.bet.split("");
        let total = orders.money / arr.length / orders.amount;
        let fee = total * 0.02;
        let price = total - fee;
        nhan_duoc += price * 9;
      } else {
        nhan_duoc += orders.price * 2;
      }

      await connection.execute(
        "UPDATE `result_5d` SET `get` = ?, `status` = 1 WHERE `id` = ? ",
        [nhan_duoc, id]
      );
      await connection.execute(
        "UPDATE `users` SET `money` = `money` + ? WHERE `phone` = ? ",
        [nhan_duoc, phone]
      );
    }
  } catch (error) {
    console.error("handling5D Error:", error.message);
  }
};

const getAdminListOrders5D = async (req, res) => {
  try {
    let game = req.body.gameJoin || req.body.game;
    const [orders] = await connection.query(
      `SELECT bet, money FROM result_5d WHERE status = 0 AND game = ?`, [game]
    );
    const [history] = await connection.query(
      `SELECT * FROM \`5d\` WHERE status != 0 AND game = ? ORDER BY id DESC LIMIT 10`, [game]
    );
    const [settings] = await connection.query(`SELECT * FROM admin`);
    const [period] = await connection.query(
      `SELECT period FROM \`5d\` WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1`, [game]
    );
    return res.status(200).json({
      status: true, data: { gameslist: history }, bet: orders,
      settings: settings, period: period.length > 0 ? period[0].period : "---",
    });
  } catch (error) {
    console.error("getAdminListOrders5D error:", error.message);
    return res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = {
  K5DPage, K5DPage3, K5DPage5, K5DPage10,
  betK5D, listOrderOld, GetMyEmerdList,
  add5D, handling5D, getAdminListOrders5D,
};