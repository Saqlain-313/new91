import connection from "../config/connectDB";
require("dotenv").config();

// ==================== PAGES ====================
const K3Page = async (req, res) => {
  return res.render("bet/k3/k3.ejs");
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
  const characters = "123456";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// ==================== ROSES PLUS (upline bonus for 10k+ bets) ====================
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
    throw error;
  }
};

// ==================== BET VALIDATION ====================
const validateBet = async (join, list_join, x, money, game) => {
  const checkJoin = isNumber(list_join);
  const checkX = isNumber(x);

  const validJoins = ["1", "2", "3", "4"];
  const validGames = ["1", "3", "5", "10"];
  const validMoney = ["1000", "10000", "100000", "1000000"];

  if (
    !validJoins.includes(String(join)) ||
    String(list_join || "").length > 1000 ||
    !checkX ||
    !validMoney.includes(String(money)) ||
    !validGames.includes(String(game))
  ) {
    return false;
  }

  return true;
};

// ==================== BET K3 ====================
const betK3 = async (req, res) => {
  try {
    const { listJoin, game, gameJoin, xvalue, money } = req.body;
    const auth = req.cookies.auth;

    const [k3Now] = await connection.query(
      "SELECT period FROM k3 WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1",
      [game]
    );
    const [user] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1 LIMIT 1",
      [auth]
    );
    if (k3Now.length < 1 || user.length < 1) {
      return res.status(200).json({ message: "Error!", status: false });
    }

    const userInfo = user[0];
    const period = k3Now[0];

    const date = new Date();
    const years = formateT(date.getFullYear());
    const months = formateT(date.getMonth() + 1);
    const days = formateT(date.getDate());
    const id_product = years + months + days + Math.floor(Math.random() * 1000000000000000);

    const moneyNum = Number(money);
    const xNum = Number(xvalue);

    let total = 0;
    if (gameJoin == 1) {
      total = moneyNum * xNum * String(listJoin).split(",").length;
    } else if (gameJoin == 2) {
      let twoSame = listJoin.split("@")[0];
      const motDuyNhat = listJoin.split("@")[1];
      if (twoSame.length > 0) {
        twoSame = twoSame.split(",").length;
      }
      let lengthArr = 0;
      let count = 0;
      if (motDuyNhat.length > 0) {
        const arr = motDuyNhat.split("&");
        for (let i = 0; i < arr.length; i++) {
          const parts = arr[i].split("|");
          count = parts[1].split(",").length;
        }
        lengthArr = arr.length;
      }
      total = moneyNum * xNum * (lengthArr * count) + twoSame * moneyNum * xNum;
    } else if (gameJoin == 3) {
      const baDuyNhat = listJoin.split("@")[0];
      let countBaDuyNhat = 0;
      if (baDuyNhat.length > 0) {
        countBaDuyNhat = baDuyNhat.split(",").length;
      }
      const threeSame = listJoin.split("@")[1].length;
      total = moneyNum * xNum * countBaDuyNhat + threeSame * moneyNum * xNum;
    } else if (gameJoin == 4) {
      const threeNumberUnlike = listJoin.split("@")[0];
      const twoLienTiep = listJoin.split("@")[1];
      const twoNumberUnlike = listJoin.split("@")[2];

      let threeUn = 0;
      if (threeNumberUnlike.length > 0) {
        const arr = threeNumberUnlike.split(",").length;
        if (arr <= 4) threeUn += xNum * (moneyNum * arr);
        if (arr == 5) threeUn += xNum * (moneyNum * arr) * 2;
        if (arr == 6) threeUn += xNum * (moneyNum * 5) * 4;
      }
      let twoUn = 0;
      if (twoNumberUnlike.length > 0) {
        const arr = twoNumberUnlike.split(",").length;
        if (arr <= 3) twoUn += xNum * (moneyNum * arr);
        if (arr == 4) twoUn += xNum * (moneyNum * arr) * 1.5;
        if (arr == 5) twoUn += xNum * (moneyNum * arr) * 2;
        if (arr == 6) twoUn += xNum * (moneyNum * arr * 2.5);
      }
      let UnlienTiep = 0;
      if (twoLienTiep == "u") {
        UnlienTiep += xNum * moneyNum;
      }
      total = threeUn + twoUn + UnlienTiep;
    }

    const fee = total * 0.02;
    const price = total - fee;

    let typeGame = "";
    if (gameJoin == 1) typeGame = "total";
    if (gameJoin == 2) typeGame = "two-same";
    if (gameJoin == 3) typeGame = "three-same";
    if (gameJoin == 4) typeGame = "unlike";

    const check = Number(userInfo.money) - total;
    const timeNow = timerJoin2(Date.now());

    if (check < 0) {
      return res.status(200).json({ message: "The amount is not enough", status: false });
    }

    // Insert bet
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

    await connection.execute("UPDATE `users` SET `money` = `money` - ? WHERE `token` = ?", [total, auth]);

    const [users] = await connection.query(
      "SELECT * FROM users WHERE token = ? AND veri = 1 LIMIT 1",
      [auth]
    );

    await rosesPlus(auth, total);

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

    if (total < users[0].recharge) {
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
    console.error("betK3 error:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== ADD K3 (admin round creation) ====================
const addK3 = async (game) => {
  try {
    let join = "";
    if (game == 1) join = "k3d";
    if (game == 3) join = "k3d3";
    if (game == 5) join = "k3d5";
    if (game == 10) join = "k3d10";

    const result2 = makeid(3);

    const [k3] = await connection.query(
      "SELECT period FROM k3 WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1",
      [game]
    );
    const [setting] = await connection.query("SELECT * FROM `admin`");

    let period;
    const currentDates = new Date();
    const years = currentDates.getFullYear();
    const months = String(currentDates.getMonth() + 1).padStart(2, "0");
    const days = String(currentDates.getDate()).padStart(2, "0");
    const formattedDates = `${years}${months}${days}`;

    if (k3[0] === undefined) {
      period = `${formattedDates}0100`;
    } else {
      const dbPeriod = k3[0].period;
      const dbDatePart = dbPeriod.toString().slice(0, 8);
      period = dbDatePart == formattedDates ? dbPeriod : `${formattedDates}0100`;
    }

    const timeNow = timerJoin2(Date.now());

    let nextResult = "";
    if (game == 1) nextResult = setting[0].k3d;
    if (game == 3) nextResult = setting[0].k3d3;
    if (game == 5) nextResult = setting[0].k3d5;
    if (game == 10) nextResult = setting[0].k3d10;

    let newArr = "";
    if (nextResult == "-1") {
      await connection.execute("UPDATE k3 SET result = ?, status = ? WHERE period = ? AND game = ?", [
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
      await connection.execute("UPDATE k3 SET result = ?, status = ? WHERE period = ? AND game = ?", [
        result,
        1,
        period,
        game,
      ]);
    }

    await connection.execute("INSERT INTO k3 SET period = ?, result = ?, game = ?, status = ?, time = ?", [
      Number(period) + 1,
      0,
      game,
      0,
      timeNow,
    ]);

    await connection.execute(`UPDATE admin SET ${join} = ?`, [newArr]);
  } catch (error) {
    console.error("addK3 error:", error);
  }
};

// ==================== FUN HANDLING (settlement of losing bets) ====================
async function funHanding(game) {
  try {
    const [k3] = await connection.query(
      "SELECT * FROM k3 WHERE status != 0 AND game = ? ORDER BY id DESC LIMIT 1",
      [game]
    );
    if (!k3.length) return;
    const k3Info = k3[0];

    await connection.execute("UPDATE result_k3 SET result = ? WHERE status = 0 AND game = ?", [
      k3Info.result,
      game,
    ]);

    const digits = String(k3Info.result).split("");
    let total = 0;
    for (const d of digits) total += Number(d);

    // --- Total ---
    {
      const [bets] = await connection.execute(
        `SELECT id, bet FROM result_k3 WHERE status = 0 AND game = ? AND typeGame = 'total'`,
        [game]
      );
      for (const b of bets) {
        const sult = b.bet.split(",");
        const lengWin = sult.filter((age) => age == total);
        const check1 = total >= 3 && total <= 10 && sult.includes("s");
        const check2 = total >= 11 && total <= 18 && sult.includes("b");
        const check3 = total % 2 == 0 && sult.includes("c");
        const check4 = total % 2 != 0 && sult.includes("l");
        if (!check1 && !check2 && !check3 && !check4) {
          await connection.execute("UPDATE result_k3 SET status = 2 WHERE id = ?", [b.id]);
        }
        if (lengWin.length >= 1) {
          await connection.execute("UPDATE result_k3 SET status = 0 WHERE id = ?", [b.id]);
        }
      }
    }

    // --- Two-same ---
    {
      const [bets] = await connection.execute(
        `SELECT id, bet FROM result_k3 WHERE status = 0 AND game = ? AND typeGame = 'two-same'`,
        [game]
      );
      const kq = String(k3Info.result).split("");
      const kq1 = kq[0] + kq[1];
      const kq2 = kq[1] + kq[2];

      for (const b of bets) {
        const sult = b.bet.split("@");
        const id = b.id;

        if (sult[0].length > 0 && sult[1].length > 0) {
          const array = sult[0].split(",");
          let check1 = false;
          let check2 = false;

          const array2 = sult[1].split("&");
          for (const pair of array2) {
            const pairLeft = pair.split("|")[0];
            const pairRight = pair.split("|")[1].split(",");
            const resultA1 = pairLeft.includes(String(kq1));
            const resultA2 = pairLeft.includes(String(kq2));
            if (!resultA1 && !resultA2) {
              check1 = true;
            } else if (resultA1 && !resultA2) {
              if (!pairRight.includes(String(kq[2]))) check1 = true;
            } else if (!resultA1 && resultA2) {
              if (!pairRight.includes(String(kq[0]))) check1 = true;
            }
          }

          const result1 = array.includes(String(kq1));
          const result2 = array.includes(String(kq2));
          if (!result1 && !result2) check2 = true;

          if (check1 && check2) {
            await connection.execute("UPDATE result_k3 SET status = 2 WHERE id = ?", [id]);
          }
        } else if (sult[0].length > 0 && sult[1].length <= 0) {
          const array = sult[0].split(",");
          const result1 = array.includes(String(kq1));
          const result2 = array.includes(String(kq2));
          if (!result1 && !result2) {
            await connection.execute("UPDATE result_k3 SET status = 2 WHERE id = ?", [id]);
          }
        } else if (sult[0].length <= 0 && sult[1].length > 0) {
          let check = false;
          const array2 = sult[1].split("&");
          for (const pair of array2) {
            const pairLeft = pair.split("|")[0];
            const pairRight = pair.split("|")[1].split(",");
            const resultA1 = pairLeft.includes(String(kq1));
            const resultA2 = pairLeft.includes(String(kq2));
            const resultA3 = pairRight.includes(String(kq[0]));
            const resultA4 = pairRight.includes(String(kq[2]));
            if (!resultA1 && !resultA2) {
              if (!resultA3 && !resultA4) {
                await connection.execute("UPDATE result_k3 SET status = 2 WHERE id = ?", [id]);
              }
            } else if (resultA1 && !resultA2) {
              if (pairRight.includes(String(kq[2]))) check = true;
            } else if (!resultA1 && resultA2) {
              if (pairRight.includes(String(kq[0]))) check = true;
            }
          }
          if (!check) {
            await connection.execute("UPDATE result_k3 SET status = 2 WHERE id = ?", [id]);
          }
        }
      }
    }

    // --- Three-same ---
    {
      const [bets] = await connection.execute(
        `SELECT id, bet FROM result_k3 WHERE status = 0 AND game = ? AND typeGame = 'three-same'`,
        [game]
      );
      const kq = String(k3Info.result);

      for (const b of bets) {
        const sult = b.bet.split("@");
        const id = b.id;

        if (sult[0].length > 0 && sult[1].length > 0) {
          const array = sult[0].split(",");
          let check1 = false;
          let check2 = false;
          if (!array.includes(String(kq))) check1 = true;
          if (!["111", "222", "333", "444", "555", "666"].includes(String(kq))) check2 = true;
          if (check1 && check2) {
            await connection.execute("UPDATE result_k3 SET status = 2 WHERE id = ?", [id]);
          }
        } else if (sult[0].length > 0 && sult[1].length <= 0) {
          const array = sult[0].split(",");
          if (!array.includes(String(kq))) {
            await connection.execute("UPDATE result_k3 SET status = 2 WHERE id = ?", [id]);
          }
        } else if (sult[0].length <= 0 && sult[1].length > 0) {
          if (!["111", "222", "333", "444", "555", "666"].includes(String(kq))) {
            await connection.execute("UPDATE result_k3 SET status = 2 WHERE id = ?", [id]);
          }
        }
      }
    }

    // --- Unlike ---
    {
      const [bets] = await connection.execute(
        `SELECT id, bet FROM result_k3 WHERE status = 0 AND game = ? AND typeGame = 'unlike'`,
        [game]
      );
      const kq = String(k3Info.result).split("");
      const kq1 = kq[0] + kq[1];
      const kq2 = kq[1] + kq[2];
      const kq3 = kq[0] + kq[2];
      const samePairs = ["11", "22", "33", "44", "55", "66"];

      for (const b of bets) {
        const sult = b.bet.split("@");
        const id = b.id;
        const leftRaw = sult[0];
        const mid = sult[1];
        const rightRaw = sult[2] || "";

        if (leftRaw.length > 1 && mid === "u" && rightRaw.length > 1) {
          const array = leftRaw.split(",");
          const array2 = rightRaw.split(",");
          let check1 = false, check2 = false, check3 = false;
          for (const ch of kq) if (array.includes(String(ch))) check1 = true;
          for (const ch of kq) if (array2.includes(String(ch))) check2 = true;
          if (samePairs.includes(kq1) || samePairs.includes(kq2) || samePairs.includes(kq3)) check3 = true;
          if (check1 && check2 && check3) {
            await connection.execute("UPDATE result_k3 SET status = 2 WHERE id = ?", [id]);
          }
        } else if (leftRaw.length > 1 && mid === "y" && rightRaw.length > 1) {
          const array = leftRaw.split(",");
          const array2 = rightRaw.split(",");
          let check1 = false, check2 = false;
          for (const ch of kq) if (array.includes(String(ch))) check1 = true;
          for (const ch of kq) if (array2.includes(String(ch))) check2 = true;
          if (check1 && check2) {
            await connection.execute("UPDATE result_k3 SET status = 2 WHERE id = ?", [id]);
          }
        } else if (leftRaw.length > 1 && mid === "u" && rightRaw.length <= 1) {
          const array = leftRaw.split(",");
          let check1 = false, check2 = false;
          for (const ch of kq) if (array.includes(String(ch))) check1 = true;
          if (samePairs.includes(kq1) || samePairs.includes(kq2) || samePairs.includes(kq3)) check2 = true;
          if (check1 && check2) {
            await connection.execute("UPDATE result_k3 SET status = 2 WHERE id = ?", [id]);
          }
        } else if (leftRaw.length <= 1 && mid === "u" && rightRaw.length > 1) {
          const array2 = rightRaw.split(",");
          let check1 = false, check2 = false;
          for (const ch of kq) if (array2.includes(String(ch))) check1 = true;
          if (samePairs.includes(kq1) || samePairs.includes(kq2) || samePairs.includes(kq3)) check2 = true;
          if (check1 && check2) {
            await connection.execute("UPDATE result_k3 SET status = 2 WHERE id = ?", [id]);
          }
        } else if (leftRaw.length > 1 && mid === "y" && rightRaw.length <= 1) {
          const array = leftRaw.split(",");
          let check1 = false;
          for (const ch of kq) if (array.includes(String(ch))) check1 = true;
          if (check1) {
            await connection.execute("UPDATE result_k3 SET status = 2 WHERE id = ?", [id]);
          }
        } else if (leftRaw.length <= 1 && mid === "u" && rightRaw.length <= 1) {
          let check1 = false;
          if (samePairs.includes(kq1) || samePairs.includes(kq2) || samePairs.includes(kq3)) check1 = true;
          if (check1) {
            await connection.execute("UPDATE result_k3 SET status = 2 WHERE id = ?", [id]);
          }
        } else if (leftRaw.length <= 1 && mid === "y" && rightRaw.length > 1) {
          const array2 = rightRaw.split(",");
          let check1 = false;
          for (const ch of kq) if (array2.includes(String(ch))) check1 = true;
          if (check1) {
            await connection.execute("UPDATE result_k3 SET status = 2 WHERE id = ?", [id]);
          }
        }
      }
    }
  } catch (error) {
    console.error("funHanding error:", error.message);
    throw error;
  }
}

// ==================== PRICE TABLE ====================
const priceGet = {
  total: {
    t3: 207.36, t4: 69.12, t5: 34.56, t6: 20.74, t7: 13.83, t8: 9.88, t9: 8.3,
    t10: 7.68, t11: 7.68, t12: 8.3, t13: 9.88, t14: 13.83, t15: 20.74, t16: 34.56,
    t17: 69.12, t18: 207.36, b: 1.92, s: 1.92, l: 1.92, c: 1.92,
  },
  two: { twoSame: 13.83, twoD: 69.12 },
  three: { threeD: 207.36, threeSame: 34.56 },
  unlike: { unlikeThree: 34.56, threeL: 8.64, unlikeTwo: 6.91 },
};

// ==================== PAYOUT ====================
async function plusMoney(game) {
  try {
    const [order] = await connection.execute(
      "SELECT id, phone, bet, price, money, fee, amount, result, typeGame FROM result_k3 WHERE status = 0 AND game = ?",
      [game]
    );

    for (const orders of order) {
      const { id, phone, result } = orders;
      let nhan_duoc = 0;

      if (orders.typeGame == "total") {
        const arr = orders.bet.split(",");
        const totalResult = result.split("");
        const totalResult2 = totalResult.reduce((sum, d) => sum + Number(d), 0);
        const total = orders.money / arr.length / orders.amount;
        const fee = total * 0.02;
        const price = total - fee;

        const lengWin = arr.filter((age) => age == totalResult2);
        const lengWin2 = arr.filter((age) => !isNumber(age));

        if (totalResult2 % 2 == 0 && lengWin2.includes("c")) nhan_duoc += price * 1.92;
        if (totalResult2 % 2 != 0 && lengWin2.includes("l")) nhan_duoc += price * 1.92;
        if (totalResult2 >= 11 && totalResult2 <= 18 && lengWin2.includes("b")) nhan_duoc += price * 1.92;
        if (totalResult2 >= 3 && totalResult2 <= 11 && lengWin2.includes("s")) nhan_duoc += price * 1.92;

        let get = 0;
        switch (lengWin[0]) {
          case "3": get = 207.36; break;
          case "4": get = 69.12; break;
          case "5": get = 34.56; break;
          case "6": get = 20.74; break;
          case "7": get = 13.83; break;
          case "8": get = 9.88; break;
          case "9": get = 8.3; break;
          case "10": get = 7.68; break;
          case "11": get = 7.68; break;
          case "12": get = 8.3; break;
          case "13": get = 9.88; break;
          case "14": get = 13.83; break;
          case "15": get = 20.74; break;
          case "16": get = 34.56; break;
          case "17": get = 69.12; break;
          case "18": get = 207.36; break;
        }
        nhan_duoc += price * get;
        await connection.execute("UPDATE `result_k3` SET `get` = ?, `status` = 1 WHERE `id` = ?", [nhan_duoc, id]);
        await connection.execute("UPDATE `users` SET `money` = `money` + ? WHERE `phone` = ?", [nhan_duoc, phone]);
      }

      nhan_duoc = 0;
      if (orders.typeGame == "two-same") {
        const kq = result.split("");
        const kq1 = kq[0] + kq[1];
        const kq2 = kq[1] + kq[2];
        const array = orders.bet.split("@");
        const arr1 = array[0].split(",");
        let arr2 = array[1];
        const arr3 = array[1].split("&");

        for (const v of arr1) {
          if (v != "") {
            const check1 = v.includes(kq1);
            const check2 = v.includes(kq2);
            if (check1 || check2) {
              let lengthArr = 0;
              if (arr2.length > 0) {
                const arr = arr2.split("&");
                lengthArr = arr.length;
              }
              const total = orders.money / orders.amount / (lengthArr + arr1.length);
              nhan_duoc += total * 12.83;
            }
          }
        }

        arr2 = array[1];
        for (const item of arr3) {
          if (item != "") {
            const files = item.split("|");
            const check1 = files[0].includes(kq1);
            const check2 = files[0].includes(kq2);
            if (check1 || check2) {
              let lengthArr = 0;
              if (arr2.length > 0) {
                const arr = arr2.split("&");
                lengthArr = arr.length;
              }
              let bale = arr1.length;
              const total = orders.money / orders.amount / (lengthArr + bale);
              nhan_duoc += total * 69.12;
            }
          }
        }
        nhan_duoc -= orders.fee;

        await connection.execute("UPDATE `result_k3` SET `get` = ?, `status` = 1 WHERE `id` = ?", [nhan_duoc, id]);
        await connection.execute("UPDATE `users` SET `money` = `money` + ? WHERE `phone` = ?", [nhan_duoc, phone]);
      }

      nhan_duoc = 0;
      if (orders.typeGame == "three-same") {
        const kq = result;
        const array = orders.bet.split("@");
        const arr1 = array[0].split(",");
        const arr2 = array[1];

        for (const v of arr1) {
          if (v != "") {
            const check1 = v.includes(kq);
            const bala = arr2 != "" ? 1 : 0;
            if (check1) {
              const total = orders.money / (arr1.length + bala) / orders.amount;
              nhan_duoc += total * 207.36 - orders.fee;
            }
          }
        }
        if (arr2 != "") {
          const bala = arr1.length;
          const total = orders.money / (1 + bala) / orders.amount;
          nhan_duoc += total * 34.56 - orders.fee;
        }
        await connection.execute("UPDATE `result_k3` SET `get` = ?, `status` = 1 WHERE `id` = ?", [nhan_duoc, id]);
        await connection.execute("UPDATE `users` SET `money` = `money` + ? WHERE `phone` = ?", [nhan_duoc, phone]);
      }

      nhan_duoc = 0;
      if (orders.typeGame == "unlike") {
        const kq = result.split("");
        const array = orders.bet.split("@");
        const arr1 = array[0].split(",");
        const arr2 = array[1];
        const arr3 = array[2].split(",");

        for (const v of arr1) {
          if (v != "") {
            const check1 = kq.includes(v);
            let bala = 0, bala2 = 0;
            for (const v3 of arr3) if (v3.length != "") bala = arr3.length;
            if (arr2 == "u") bala2 = 1;
            if (!check1) {
              const total = orders.money / (arr1.length + bala + bala2) / orders.amount;
              nhan_duoc += total * 34.56 - orders.fee;
              if (arr2 == "u") {
                const total2 = orders.money / (1 + bala + bala2) / orders.amount;
                nhan_duoc += (total2 - orders.fee) * 8.64;
              }
            }
          }
        }
        if (arr2 == "u") {
          const bala = arr1.length;
          let bala2 = 0;
          for (const v3 of arr3) if (v3.length != "") bala2 = arr3.length;
          const total = orders.money / (1 + bala + bala2) / orders.amount;
          nhan_duoc += (total - orders.fee) * 8.64;
        }
        for (let i = 0; i < arr3.length; i++) {
          if (arr1[i] != undefined && arr1[i] != "") {
            const check1 = kq.includes(arr3[i]);
            const bala = arr1.length;
            if (!check1) {
              const total = orders.money / (arr3.length + bala) / orders.amount;
              nhan_duoc += total * 6.91 - orders.fee;
            }
          }
        }
        await connection.execute("UPDATE `result_k3` SET `get` = ?, `status` = 1 WHERE `id` = ?", [nhan_duoc, id]);
        await connection.execute("UPDATE `users` SET `money` = `money` + ? WHERE `phone` = ?", [nhan_duoc, phone]);
      }
    }
  } catch (error) {
    console.error("plusMoney error:", error.message);
    throw error;
  }
}

// ==================== HANDLING K3 ====================
const handlingK3 = async (typeid) => {
  const game = Number(typeid);
  await funHanding(game);
  await plusMoney(game);
};

// ==================== LIST ORDER ====================
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

    const [k3] = await connection.query(
      "SELECT * FROM k3 WHERE status != 0 AND game = ? ORDER BY id DESC LIMIT ? OFFSET ?",
      [game, limit, offset]
    );
    const [k3All] = await connection.query("SELECT * FROM k3 WHERE status != 0 AND game = ?", [game]);
    const [period] = await connection.query(
      "SELECT period FROM k3 WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1",
      [game]
    );

    if (k3.length === 0) {
      return res.status(200).json({
        code: 0,
        msg: "No more data",
        data: { gameslist: [] },
        page: 1,
        status: false,
      });
    }

    if (!pageno || !pageto || !user[0] || !k3[0] || !period[0]) {
      return res.status(200).json({ message: "Error!", status: false });
    }

    const page = Math.ceil(k3All.length / 10);
    return res.status(200).json({
      code: 0,
      msg: "Get success",
      data: { gameslist: k3 },
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

    const [result_k3] = await connection.query(
      "SELECT * FROM result_k3 WHERE phone = ? AND game = ? ORDER BY id DESC LIMIT ? OFFSET ?",
      [user[0].phone, game, limit, offset]
    );
    const [result_k3All] = await connection.query(
      "SELECT * FROM result_k3 WHERE phone = ? AND game = ? ORDER BY id DESC",
      [user[0].phone, game]
    );

    if (!result_k3[0]) {
      return res.status(200).json({
        code: 0,
        msg: "No more data",
        data: { gameslist: [] },
        page: 1,
        status: false,
      });
    }

    const page = Math.ceil(result_k3All.length / 10);

    const datas = result_k3.map((data) => {
      const { id, phone, code, invite, level, game, ...others } = data;
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
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== EXPORTS ====================
module.exports = {
  K3Page,
  betK3,
  addK3,
  handlingK3,
  listOrderOld,
  GetMyEmerdList,
};