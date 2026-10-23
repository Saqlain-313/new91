import connection from "../config/connectDB";
require("dotenv").config();

// ===================== HELPERS =====================
const isNumber = (params) => {
  let pattern = /^[0-9]*\d$/;
  return pattern.test(params);
};

function formateT(params) {
  return params < 10 ? "0" + params : String(params);
}

function timerJoin2(params = "", addHours = 0) {
  let date = params ? new Date(Number(params)) : new Date();
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
  const getPart = (t) => parts.find((p) => p.type === t).value;
  return `${getPart("year")}-${getPart("month")}-${getPart("day")} ${getPart("hour")}:${getPart("minute")}:${getPart("second")}`;
}

function makeid(length) {
  let result = "";
  const characters = "123456";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// ===================== PAGE =====================
const K3Page = async (req, res) => {
  return res.render("bet/k3/k3.ejs");
};

// ===================== ROSE COMMISSION (F1-F4) =====================
const rosesPlus = async (auth, money) => {
  try {
    if (money < 10000) return;

    const [level] = await connection.query("SELECT * FROM level LIMIT 1");
    if (!level.length) return;
    const level0 = level[0];

    const [user] = await connection.query(
      "SELECT `phone`, `code`, `invite` FROM users WHERE token = ? AND veri = 1 LIMIT 1",
      [auth],
    );
    if (!user.length) return;
    const userInfo = user[0];

    const [f1] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `rank` FROM users WHERE code = ? AND veri = 1 LIMIT 1",
      [userInfo.invite],
    );
    if (!f1.length) return;
    const infoF1 = f1[0];
    const rosesF1 = (money / 100) * level0.f1;
    await connection.query(
      "UPDATE users SET money = money + ?, roses_f1 = roses_f1 + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ?",
      [rosesF1, rosesF1, rosesF1, rosesF1, infoF1.phone],
    );

    const [f2] = await connection.query(
      "SELECT `phone`, `code`, `invite` FROM users WHERE code = ? AND veri = 1 LIMIT 1",
      [infoF1.invite],
    );
    if (!f2.length) return;
    const infoF2 = f2[0];
    const rosesF2 = (money / 100) * level0.f2;
    await connection.query(
      "UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ?",
      [rosesF2, rosesF2, rosesF2, infoF2.phone],
    );

    const [f3] = await connection.query(
      "SELECT `phone`, `code`, `invite` FROM users WHERE code = ? AND veri = 1 LIMIT 1",
      [infoF2.invite],
    );
    if (!f3.length) return;
    const infoF3 = f3[0];
    const rosesF3 = (money / 100) * level0.f3;
    await connection.query(
      "UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ?",
      [rosesF3, rosesF3, rosesF3, infoF3.phone],
    );

    const [f4] = await connection.query(
      "SELECT `phone`, `code`, `invite` FROM users WHERE code = ? AND veri = 1 LIMIT 1",
      [infoF3.invite],
    );
    if (!f4.length) return;
    const infoF4 = f4[0];
    const rosesF4 = (money / 100) * level0.f4;
    await connection.query(
      "UPDATE users SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ? WHERE phone = ?",
      [rosesF4, rosesF4, rosesF4, infoF4.phone],
    );
  } catch (error) {
    console.error("rosesPlus error:", error.message);
  }
};

// ===================== VALIDATE BET =====================
const validateBet = (join, list_join, x, money, game) => {
  const checks = ["a", "b", "c", "d", "e", "total"].includes(join);
  const checkGame = ["1", "3", "5", "10"].includes(String(game));
  const checkMoney = ["1000", "10000", "100000", "1000000"].includes(
    String(money),
  );

  if (
    !checks ||
    !list_join ||
    list_join.length > 10 ||
    !isNumber(String(x)) ||
    !checkMoney ||
    !checkGame
  ) {
    return false;
  }

  const arr = String(list_join).split("");
  for (let i = 0; i < arr.length; i++) {
    if (
      ![
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "c",
        "l",
        "b",
        "s",
      ].includes(arr[i])
    ) {
      return false;
    }
  }
  return true;
};

// ===================== BET K3 =====================
const betK3 = async (req, res) => {
  try {
    let { listJoin, game, gameJoin, xvalue, money } = req.body;
    let auth = req.cookies.auth;

    // ✅ Normalize types
    game = Number(game);
    gameJoin = Number(gameJoin);
    xvalue = Number(xvalue);
    money = Number(money);

    if (!auth) {
      return res.status(200).json({ message: "Unauthorized", status: false });
    }

    const [k3Now] = await connection.query(
      `SELECT period FROM k3 WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1`,
      [game],
    );
    const [user] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1 LIMIT 1",
      [auth],
    );

    if (k3Now.length < 1 || user.length < 1) {
      return res.status(200).json({ message: "Error!", status: false });
    }

    const userInfo = user[0];
    const period = k3Now[0];

    // ✅ Safe split for gameJoin 2/3/4
    const parts = String(listJoin).split("@");
    const safeParts = (i) => (parts[i] !== undefined ? String(parts[i]) : "");

    let total = 0;

    if (gameJoin === 1) {
      // Total
      total = money * xvalue * String(listJoin).split(",").length;
    } else if (gameJoin === 2) {
      // Two-same
      let twoSame = safeParts(0);
      let motDuyNhat = safeParts(1);

      let twoSameCount = 0;
      if (twoSame.length > 0) twoSameCount = twoSame.split(",").length;

      let lengthArr = 0;
      let count = 0;
      if (motDuyNhat.length > 0) {
        let arr = motDuyNhat.split("&");
        for (let i = 0; i < arr.length; i++) {
          let item = arr[i].split("|");
          count = item[1] ? item[1].split(",").length : 0;
        }
        lengthArr = arr.length;
      }
      total =
        money * xvalue * (lengthArr * count) + twoSameCount * money * xvalue;
    } else if (gameJoin === 3) {
      // Three-same
      let baDuyNhat = safeParts(0);
      let threeSame = safeParts(1);

      let countBaDuyNhat = 0;
      if (baDuyNhat.length > 0) countBaDuyNhat = baDuyNhat.split(",").length;

      let threeSameCount = threeSame.length;
      total = money * xvalue * countBaDuyNhat + threeSameCount * money * xvalue;
    } else if (gameJoin === 4) {
      // Unlike
      let threeNumberUnlike = safeParts(0);
      let twoLienTiep = safeParts(1);
      let twoNumberUnlike = safeParts(2);

      let threeUn = 0;
      if (threeNumberUnlike.length > 0) {
        let arr = threeNumberUnlike.split(",").length;
        if (arr <= 4) threeUn += xvalue * (money * arr);
        else if (arr == 5) threeUn += xvalue * (money * arr) * 2;
        else if (arr == 6) threeUn += xvalue * (money * 5) * 4;
      }
      let twoUn = 0;
      if (twoNumberUnlike.length > 0) {
        let arr = twoNumberUnlike.split(",").length;
        if (arr <= 3) twoUn += xvalue * (money * arr);
        else if (arr == 4) twoUn += xvalue * (money * arr) * 1.5;
        else if (arr == 5) twoUn += xvalue * (money * arr) * 2;
        else if (arr == 6) twoUn += xvalue * (money * arr * 2.5);
      }
      let UnlienTiep = 0;
      if (twoLienTiep == "u") UnlienTiep += xvalue * money;

      total = threeUn + twoUn + UnlienTiep;
    }

    const fee = total * 0.02;
    const price = total - fee;

    let typeGame = "";
    if (gameJoin === 1) typeGame = "total";
    if (gameJoin === 2) typeGame = "two-same";
    if (gameJoin === 3) typeGame = "three-same";
    if (gameJoin === 4) typeGame = "unlike";

    const check = userInfo.money - total;

    if (check >= 0) {
      const id_product = `${new Date().getFullYear()}${formateT(new Date().getMonth() + 1)}${formateT(new Date().getDate())}${Math.floor(Math.random() * 1000000000000000)}`;
      const timeNow = timerJoin2(Date.now());

      const sql = `INSERT INTO result_k3 SET id_product = ?, phone = ?, code = ?, invite = ?, stage = ?, level = ?, money = ?, price = ?, amount = ?, fee = ?, game = ?, join_bet = ?, typeGame = ?, bet = ?, status = ?, time = ?`;
      await connection.execute(sql, [
        id_product,
        userInfo.phone,
        userInfo.code,
        userInfo.invite,
        period.period,
        userInfo.level,
        total,
        price,
        xvalue,
        fee,
        game,
        gameJoin,
        typeGame,
        listJoin,
        0,
        timeNow,
      ]);

      await connection.execute(
        "UPDATE `users` SET `money` = `money` - ? WHERE `token` = ?",
        [total, auth],
      );

      const [users] = await connection.query(
        "SELECT * FROM users WHERE token = ? AND veri = 1 LIMIT 1",
        [auth],
      );

      await rosesPlus(auth, total);

      const [level] = await connection.query("SELECT * FROM level");
      const level0 = level[0];

      // Roses log
      const sql2 = `INSERT INTO roses SET phone = ?, code = ?, invite = ?, f1 = ?, f2 = ?, f3 = ?, f4 = ?, time = ?`;
      const f1 = (total / 100) * level0.f1;
      const f2 = (total / 100) * level0.f2;
      const f3 = (total / 100) * level0.f3;
      const f4 = (total / 100) * level0.f4;
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

      if (total < users[0].recharge) {
        await connection.execute(
          "UPDATE `users` SET `recharge` = `recharge` - ? WHERE `phone` = ?",
          [total, users[0].phone],
        );
      }

      // Upline commission log
      let uplines2 = users;
      let count = 0;
      for (let i = 0; i < 6; i++) {
        if (!level[i]) break;
        const rosesF = (total / 100) * level[i].f1;

        if (uplines2.length !== 0) {
          const [upline1] = await connection.query(
            "SELECT * FROM users WHERE code = ?",
            [uplines2[0].invite],
          );
          if (upline1.length > 0) {
            count++;
            await connection.query(
              "INSERT INTO subordinatedata SET phone = ?, bonusby=?, type = ?, commission=?, amount = ?, level=?, `date` = ?",
              [
                upline1[0].phone,
                uplines2[0].phone,
                "Bet commission",
                rosesF,
                total,
                count,
                timeNow,
              ],
            );
            uplines2 = upline1;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      return res.status(200).json({
        message: "Bet Succeed",
        status: true,
        change: users[0].level,
        money: users[0].money,
      });
    } else {
      return res.status(200).json({
        message: "The amount is not enough",
        status: false,
      });
    }
  } catch (error) {
    console.error("betK3 error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", status: false });
  }
};

// ===================== ADD K3 (NEXT PERIOD) =====================
const addK3 = async (game) => {
  try {
    const joinMap = { 1: "k3d", 3: "k3d3", 5: "k3d5", 10: "k3d10" };
    const join = joinMap[game];
    if (!join) return;

    const result2 = makeid(3);

    const [k5D] = await connection.query(
      `SELECT period FROM k3 WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1`,
      [game],
    );
    const [setting] = await connection.query("SELECT * FROM `admin`");

    const now = new Date();
    const formattedDates = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

    let period;
    if (!k5D.length || k5D[0] === undefined) {
      period = `${formattedDates}0100`;
    } else {
      const dbPeriod = k5D[0].period;
      const dbDatePart = String(dbPeriod).slice(0, 8);
      if (dbDatePart === formattedDates) {
        period = dbPeriod;
      } else {
        period = `${formattedDates}0100`;
      }
    }

    const timeNow = timerJoin2(Date.now());

    let nextResult = "-1";
    if (game === 1) nextResult = setting[0].k3d;
    if (game === 3) nextResult = setting[0].k3d3;
    if (game === 5) nextResult = setting[0].k3d5;
    if (game === 10) nextResult = setting[0].k3d10;

    let newArr = "-1";
    if (nextResult == "-1") {
      await connection.execute(
        `UPDATE k3 SET result = ?, status = ? WHERE period = ? AND game = ?`,
        [result2, 1, period, game],
      );
    } else {
      const arr = String(nextResult).split("|");
      if (arr.length == 1) {
        newArr = "-1";
      } else {
        newArr = arr.slice(1).join("|");
      }
      const result = arr[0];
      await connection.execute(
        `UPDATE k3 SET result = ?, status = ? WHERE period = ? AND game = ?`,
        [result, 1, period, game],
      );
    }

    const sql = `INSERT INTO k3 SET period = ?, result = ?, game = ?, status = ?, time = ?`;
    await connection.execute(sql, [Number(period) + 1, 0, game, 0, timeNow]);

    await connection.execute(`UPDATE admin SET ${join} = ?`, [newArr]);
  } catch (error) {
    console.error("addK3 error:", error.message);
  }
};

// ===================== HANDLING (RESULT + PAYOUT) =====================
async function funHanding(game) {
  try {
    const [k5d] = await connection.query(
      `SELECT * FROM k3 WHERE status != 0 AND game = ? ORDER BY id DESC LIMIT 1`,
      [game],
    );
    if (!k5d.length) return;
    const k5dInfo = k5d[0];

    await connection.execute(
      `UPDATE result_k3 SET result = ? WHERE status = 0 AND game = ?`,
      [k5dInfo.result, game],
    );

    const result = String(k5dInfo.result).split("");
    let total = 0;
    for (let i = 0; i < result.length; i++) total += Number(result[i]);

    // ---------- TOTAL ----------
    const [totalNumber] = await connection.execute(
      `SELECT id, bet FROM result_k3 WHERE status = 0 AND game = ? AND typeGame = 'total'`,
      [game],
    );
    for (let i = 0; i < totalNumber.length; i++) {
      const sult = totalNumber[i].bet.split(",");
      const lengWin = sult.filter((age) => age == total);

      let check1 = total >= 3 && total <= 10 && sult.includes("s");
      let check2 = total >= 11 && total <= 18 && sult.includes("b");
      let check3 = total % 2 == 0 && sult.includes("c");
      let check4 = total % 2 != 0 && sult.includes("l");

      if (!check1 && !check2 && !check3 && !check4 && lengWin.length === 0) {
        await connection.execute(
          `UPDATE result_k3 SET status = 2 WHERE id = ?`,
          [totalNumber[i].id],
        );
      }
    }

    // ---------- TWO-SAME ----------
    const [totaltwoSame] = await connection.execute(
      `SELECT id, bet FROM result_k3 WHERE status = 0 AND game = ? AND typeGame = 'two-same'`,
      [game],
    );
    for (let i = 0; i < totaltwoSame.length; i++) {
      const sult = totaltwoSame[i].bet.split("@");
      const id = totaltwoSame[i].id;
      const kq = String(k5dInfo.result).split("");
      const kq1 = kq[0] + kq[1];
      const kq2 = kq[1] + kq[2];

      let isWin = false;

      if (sult[0] && sult[0].length > 0) {
        const array = sult[0].split(",");
        const result1 = array.includes(String(kq1));
        const result2 = array.includes(String(kq2));
        if (result1 || result2) isWin = true;
      }

      if (sult[1] && sult[1].length > 0) {
        const array2 = sult[1].split("&");
        for (let j = 0; j < array2.length; j++) {
          const parts = array2[j].split("|");
          const newArr = parts[0] || "";
          const newArr2 = parts[1] ? parts[1].split(",") : [];
          const resultA1 = newArr.includes(kq1);
          const resultA2 = newArr.includes(kq2);
          if (resultA1 || resultA2) {
            isWin = true;
            break;
          }
        }
      }

      if (!isWin) {
        await connection.execute(
          `UPDATE result_k3 SET status = 2 WHERE id = ?`,
          [id],
        );
      }
    }

    // ---------- THREE-SAME ----------
    const [ThreeSame] = await connection.execute(
      `SELECT id, bet FROM result_k3 WHERE status = 0 AND game = ? AND typeGame = 'three-same'`,
      [game],
    );
    for (let i = 0; i < ThreeSame.length; i++) {
      const sult = ThreeSame[i].bet.split("@");
      const id = ThreeSame[i].id;
      const kq = String(k5dInfo.result);
      let isWin = false;

      if (sult[0] && sult[0].length > 0) {
        const array = sult[0].split(",");
        if (array.includes(kq)) isWin = true;
      }
      if (sult[1] && sult[1].length > 0) {
        if (["111", "222", "333", "444", "555", "666"].includes(kq))
          isWin = true;
      }
      if (!isWin) {
        await connection.execute(
          `UPDATE result_k3 SET status = 2 WHERE id = ?`,
          [id],
        );
      }
    }

    // ---------- UNLIKE ----------
    const [Unlike] = await connection.execute(
      `SELECT id, bet FROM result_k3 WHERE status = 0 AND game = ? AND typeGame = 'unlike'`,
      [game],
    );
    for (let i = 0; i < Unlike.length; i++) {
      const sult = Unlike[i].bet.split("@");
      const id = Unlike[i].id;
      const kq = String(k5dInfo.result).split("");
      const kq1 = kq[0] + kq[1];
      const kq2 = kq[1] + kq[2];
      const kq3 = kq[0] + kq[2];
      const twoSameList = ["11", "22", "33", "44", "55", "66"];

      let isWin = false;

      const arr1 = (sult[0] || "").split(",").filter((x) => x);
      const arr2 = sult[1] || "";
      const arr3 = (sult[2] || "").split(",").filter((x) => x);

      // 3 unlike numbers - match koi bhi kq digit
      if (arr1.length > 0) {
        for (let d of kq)
          if (arr1.includes(d)) {
            isWin = true;
            break;
          }
      }

      // 2 unlike numbers
      if (arr3.length > 0) {
        for (let d of kq)
          if (arr3.includes(d)) {
            isWin = true;
            break;
          }
      }

      // Lien tiep (u)
      if (arr2 === "u") {
        if (
          twoSameList.includes(kq1) ||
          twoSameList.includes(kq2) ||
          twoSameList.includes(kq3)
        ) {
          isWin = true;
        }
      }

      // Y (any pair position match)
      if (arr2 === "y") {
        if (
          twoSameList.includes(kq1) ||
          twoSameList.includes(kq2) ||
          twoSameList.includes(kq3)
        ) {
          isWin = true;
        }
      }

      if (!isWin) {
        await connection.execute(
          `UPDATE result_k3 SET status = 2 WHERE id = ?`,
          [id],
        );
      }
    }
  } catch (error) {
    console.error("funHanding error:", error.message);
  }
}

// ===================== PAYOUT =====================
async function plusMoney(game) {
  try {
    const [orders] = await connection.execute(
      `SELECT id, phone, bet, price, money, fee, amount, result, typeGame FROM result_k3 WHERE status = 0 AND game = ?`,
      [game],
    );

    for (let i = 0; i < orders.length; i++) {
      const o = orders[i];
      const phone = o.phone;
      const id = o.id;
      let nhan_duoc = 0;

      // ---------- TOTAL ----------
      if (o.typeGame === "total") {
        const arr = o.bet.split(",");
        const totalResult = o.result.split("");
        let totalSum = 0;
        for (let k = 0; k < 3; k++) totalSum += Number(totalResult[k]);

        const perBet = o.money / arr.length / o.amount;
        const fee = perBet * 0.02;
        const price = perBet - fee;

        const lengWin = arr.filter((a) => a == totalSum);
        const lengWin2 = arr.filter((a) => !isNumber(a));

        if (totalSum % 2 == 0 && lengWin2.includes("c"))
          nhan_duoc += price * 1.92;
        if (totalSum % 2 != 0 && lengWin2.includes("l"))
          nhan_duoc += price * 1.92;
        if (totalSum >= 11 && totalSum <= 18 && lengWin2.includes("b"))
          nhan_duoc += price * 1.92;
        if (totalSum >= 3 && totalSum <= 10 && lengWin2.includes("s"))
          nhan_duoc += price * 1.92;

        const getMap = {
          3: 207.36,
          4: 69.12,
          5: 34.56,
          6: 20.74,
          7: 13.83,
          8: 9.88,
          9: 8.3,
          10: 7.68,
          11: 7.68,
          12: 8.3,
          13: 9.88,
          14: 13.83,
          15: 20.74,
          16: 34.56,
          17: 69.12,
          18: 207.36,
        };
        if (lengWin.length > 0 && getMap[lengWin[0]] !== undefined) {
          nhan_duoc += price * getMap[lengWin[0]];
        }

        await connection.execute(
          "UPDATE `result_k3` SET `get` = ?, `status` = 1 WHERE `id` = ?",
          [nhan_duoc, id],
        );
        await connection.execute(
          "UPDATE `users` SET `money` = `money` + ? WHERE `phone` = ?",
          [nhan_duoc, phone],
        );
      }

      // ---------- TWO-SAME ----------
      nhan_duoc = 0;
      if (o.typeGame === "two-same") {
        const kq = o.result.split("");
        const kq1 = kq[0] + kq[1];
        const kq2 = kq[1] + kq[2];
        const array = o.bet.split("@");
        const arr1 = (array[0] || "").split(",").filter((x) => x);
        const arr3 = (array[1] || "").split("&").filter((x) => x);

        let lengthArr = arr3.length;
        let count = 0;
        for (let j = 0; j < arr3.length; j++) {
          const parts = arr3[j].split("|");
          if (parts[1]) count = parts[1].split(",").length;
        }

        for (let j = 0; j < arr1.length; j++) {
          const check1 = arr1[j].includes(kq1);
          const check2 = arr1[j].includes(kq2);
          if (check1 || check2) {
            const total = o.money / o.amount / (lengthArr + arr1.length);
            nhan_duoc += total * 13.83; // ✅ FIXED: 12.83 → 13.83
          }
        }

        for (let j = 0; j < arr3.length; j++) {
          const parts = arr3[j].split("|");
          const head = parts[0] || "";
          const check1 = head.includes(kq1);
          const check2 = head.includes(kq2);
          if (check1 || check2) {
            const total = o.money / o.amount / (lengthArr + arr1.length);
            nhan_duoc += total * 69.12;
          }
        }

        nhan_duoc -= o.fee;

        await connection.execute(
          "UPDATE `result_k3` SET `get` = ?, `status` = 1 WHERE `id` = ?",
          [nhan_duoc, id],
        );
        await connection.execute(
          "UPDATE `users` SET `money` = `money` + ? WHERE `phone` = ?",
          [nhan_duoc, phone],
        );
      }

      // ---------- THREE-SAME ----------
      nhan_duoc = 0;
      if (o.typeGame === "three-same") {
        const kq = String(o.result);
        const array = o.bet.split("@");
        const arr1 = (array[0] || "").split(",").filter((x) => x);
        const arr2 = array[1] || "";

        const bala = arr2 !== "" ? 1 : 0;

        for (let j = 0; j < arr1.length; j++) {
          if (arr1[j] && arr1[j].includes(kq)) {
            const total = o.money / (arr1.length + bala) / o.amount;
            nhan_duoc += total * 207.36 - o.fee;
          }
        }
        if (arr2 !== "") {
          const total = o.money / (1 + arr1.length) / o.amount;
          nhan_duoc += total * 34.56 - o.fee;
        }

        await connection.execute(
          "UPDATE `result_k3` SET `get` = ?, `status` = 1 WHERE `id` = ?",
          [nhan_duoc, id],
        );
        await connection.execute(
          "UPDATE `users` SET `money` = `money` + ? WHERE `phone` = ?",
          [nhan_duoc, phone],
        );
      }

      // ---------- UNLIKE ----------
      nhan_duoc = 0;
      if (o.typeGame === "unlike") {
        const kq = o.result.split("");
        const array = o.bet.split("@");
        const arr1 = (array[0] || "").split(",").filter((x) => x);
        const arr2 = array[1] || "";
        const arr3 = (array[2] || "").split(",").filter((x) => x);

        const bala = arr1.length;
        const bala2 = arr3.length;
        const isU = arr2 === "u";

        // 3 unlike numbers (not in result)
        for (let j = 0; j < arr1.length; j++) {
          const check1 = kq.includes(arr1[j]);
          if (!check1) {
            const denom = arr1.length + bala2 + (isU ? 1 : 0);
            const total = o.money / denom / o.amount;
            nhan_duoc += total * 34.56 - o.fee;
          }
        }

        if (isU) {
          const denom = 1 + bala + bala2;
          const total = o.money / denom / o.amount;
          nhan_duoc += (total - o.fee) * 8.64;
        }

        // 2 unlike numbers (not in result)
        for (let j = 0; j < arr3.length; j++) {
          const check1 = kq.includes(arr3[j]);
          if (!check1) {
            const total = o.money / (arr3.length + bala) / o.amount;
            nhan_duoc += total * 6.91 - o.fee;
          }
        }

        await connection.execute(
          "UPDATE `result_k3` SET `get` = ?, `status` = 1 WHERE `id` = ?",
          [nhan_duoc, id],
        );
        await connection.execute(
          "UPDATE `users` SET `money` = `money` + ? WHERE `phone` = ?",
          [nhan_duoc, phone],
        );
      }
    }
  } catch (error) {
    console.error("plusMoney error:", error.message);
  }
}

// ===================== PUBLIC HANDLER =====================
const handlingK3 = async (typeid) => {
  const game = Number(typeid);
  await funHanding(game);
  await plusMoney(game);
};

// ===================== LIST ORDER OLD =====================
const listOrderOld = async (req, res) => {
  try {
    let { gameJoin, pageno, pageto } = req.body;
    let auth = req.cookies.auth;

    pageno = Number(pageno);
    pageto = Number(pageto);

    const checkGame = ["1", "3", "5", "10"].includes(String(gameJoin));
    if (!checkGame || !pageno || !pageto || pageno < 1 || pageto < pageno) {
      return res.status(200).json({
        code: 0,
        msg: "No more data",
        data: { gameslist: [] },
        status: false,
      });
    }

    const [user] = await connection.query(
      "SELECT `phone` FROM users WHERE token = ? AND veri = 1 LIMIT 1",
      [auth],
    );
    if (!user.length) {
      return res.status(200).json({ message: "Error!", status: false });
    }

    const game = Number(gameJoin);
    const limit = pageto - pageno + 1;
    const offset = pageno - 1;

    const [k5d] = await connection.query(
      `SELECT * FROM k3 WHERE status != 0 AND game = ? ORDER BY id DESC LIMIT ? OFFSET ?`,
      [game, limit, offset],
    );
    const [k5dAll] = await connection.query(
      `SELECT * FROM k3 WHERE status != 0 AND game = ?`,
      [game],
    );
    const [period] = await connection.query(
      `SELECT period FROM k3 WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1`,
      [game],
    );

    if (k5d.length == 0) {
      return res.status(200).json({
        code: 0,
        msg: "No more data",
        data: { gameslist: [] },
        page: 1,
        status: false,
      });
    }

    const page = Math.ceil(k5dAll.length / 10);
    return res.status(200).json({
      code: 0,
      msg: "Get success",
      data: { gameslist: k5d },
      period: period[0]?.period,
      page,
      status: true,
    });
  } catch (error) {
    console.error("listOrderOld error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", status: false });
  }
};

// ===================== MY HISTORY =====================
const GetMyEmerdList = async (req, res) => {
  try {
    let { gameJoin, pageno, pageto } = req.body;
    let auth = req.cookies.auth;

    pageno = Number(pageno);
    pageto = Number(pageto);

    const checkGame = ["1", "3", "5", "10"].includes(String(gameJoin));
    if (!checkGame || !pageno || !pageto || pageno < 1 || pageto < pageno) {
      return res.status(200).json({
        code: 0,
        msg: "No more data",
        data: { gameslist: [] },
        status: false,
      });
    }

    const game = Number(gameJoin);
    const [user] = await connection.query(
      "SELECT `phone` FROM users WHERE token = ? AND veri = 1 LIMIT 1",
      [auth],
    );
    if (!user.length) {
      return res.status(200).json({ message: "Error!", status: false });
    }

    const limit = pageto - pageno + 1;
    const offset = pageno - 1;

    const [result_5d] = await connection.query(
      `SELECT * FROM result_k3 WHERE phone = ? AND game = ? ORDER BY id DESC LIMIT ? OFFSET ?`,
      [user[0].phone, game, limit, offset],
    );
    const [result_5dAll] = await connection.query(
      `SELECT * FROM result_k3 WHERE phone = ? AND game = ? ORDER BY id DESC`,
      [user[0].phone, game],
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

    const page = Math.ceil(result_5dAll.length / 10);
    const datas = result_5d.map((data) => {
      let { id, phone, code, invite, level, game, ...others } = data;
      return others;
    });

    return res.status(200).json({
      code: 0,
      msg: "Get success",
      data: { gameslist: datas },
      page,
      status: true,
    });
  } catch (error) {
    console.error("GetMyEmerdList error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", status: false });
  }
};

// ===================== ADMIN LIVE ORDERS (For Cards) =====================
const getAdminListOrders = async (req, res) => {
  try {
    let game = req.body.gameJoin || req.body.game;

    // Live bets fetch karein (jo status 0 par hain, matlab abhi chal rahe hain)
    const [orders] = await connection.query(
      `SELECT bet, money, typeGame FROM result_k3 WHERE status = 0 AND game = ?`,
      [game],
    );

    // History fetch karein (jo win/loss ho chuke hain)
    const [history] = await connection.query(
      `SELECT * FROM k3 WHERE status != 0 AND game = ? ORDER BY id DESC LIMIT 10`,
      [game],
    );

    const [settings] = await connection.query(`SELECT * FROM admin`);
    const [period] = await connection.query(
      `SELECT period FROM k3 WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1`,
      [game],
    );

    return res.status(200).json({
      status: true,
      data: { gameslist: history },
      bet: orders, // 👈 YEH ARRAY FRONTEND KO BHEJNA HAI
      settings: settings,
      period: period.length > 0 ? period[0].period : "---",
    });
  } catch (error) {
    console.error("getAdminListOrders error:", error.message);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

// Export me add karein:
module.exports = {
  K3Page,
  betK3,
  addK3,
  handlingK3,
  listOrderOld,
  GetMyEmerdList,
  getAdminListOrders, // 👈 Add kiya
};
