import connection from "../config/connectDB";
// import jwt from 'jsonwebtoken'
// import md5 from "md5";
// import e from "express";
import axios from "axios";
require("dotenv").config();
import path from 'path';
import fs from 'fs';

const winGoPage = async (req, res) => {
  return res.render("bet/wingo/win.ejs");
};

const winGoPage3 = async (req, res) => {
  return res.render("bet/wingo/win3.ejs");
};

const winGoPage5 = async (req, res) => {
  return res.render("bet/wingo/win5.ejs");
};

const winGoPage10 = async (req, res) => {
  return res.render("bet/wingo/win10.ejs");
};

const trxPage = async (req, res) => {
  return res.render("bet/trx/trx.ejs");
};

const trxPage3 = async (req, res) => {
  return res.render("bet/trx/trx3.ejs");
};

const trxPage5 = async (req, res) => {
  return res.render("bet/trx/trx5.ejs");
};

const trxPage10 = async (req, res) => {
  return res.render("bet/trx/trx10.ejs");
};

const isNumber = (params) => {
  let pattern = /^[0-9]*\d$/;
  return pattern.test(params);
};

function formateT(params) {
  let result = params < 10 ? "0" + params : params;
  return result;
}

const commissions = async (auth, money) => {
    try{
  const [user] = await connection.query(
    "SELECT `phone`, `code`, `invite`, `user_level`, `total_money` FROM users WHERE token = ?",
    [auth]
  );
  let userInfo = user;

  // commission

  const [level] = await connection.query("SELECT * FROM level ");

  let checkTime2 = timerJoin2(Date.now());

  let uplines2 = userInfo;
  let count = 0;
  for (let i = 0; i < 6; i++) {
    const rosesFs = (money / 100) * level[i].f1;

    if (uplines2.length !== 0) {
      let [upline1] = await connection.query(
        "SELECT * FROM users WHERE code = ?",
        [uplines2[0].invite]
      );

      if (upline1.length > 0) {
        count++;

        const commissions = `INSERT INTO commission SET 
                  phone = ?,
                  bonusby=?,
                  type = ?,
                  commission=?,
                  amount = ?,
                  level = ?,
                  date = ?`;
        await connection.execute(commissions, [
          upline1[0].phone,
          uplines2[0].phone,
          "Bet",
          rosesFs,
          money,
          count,
          checkTime2,
        ]);
        await connection.query(
          "INSERT INTO subordinatedata SET phone = ?, bonusby=?, type = ?, commission=?, amount = ?, level=?, `date` = ?",
          [
            upline1[0].phone,
            uplines2[0].phone,
            "bet commission",
            rosesFs,
            money,
            count,
            checkTime2,
          ]
        );

        await connection.query(
          "UPDATE users SET pending_commission = pending_commission + ? WHERE phone = ? ",
          [rosesFs, upline1[0].phone]
        );
        uplines2 = upline1;
      } else {
        break; // Exit the loop if no further uplines are found
      }
    } else {
      break; // Exit the loop if uplines2 is empty
    }
  }
    }catch(e){
        console.log(e)
    }
};




const betWinGo = async (req, res) => {
  try {
    let { typeid, join, x, money } = req.body;
    let auth = req.cookies.auth;

    if (![1, 3, 5, 10, 11, 33, 55, 100].includes(typeid)) {
      return res.status(400).json({ message: "Invalid type id", status: false });
    }

    const gameMap = {
      1: "wingo",
      3: "wingo3",
      5: "wingo5",
      10: "wingo10",
      11: "trx",
      33: "trx3",
      55: "trx5",
      100: "trx10",
    };
    const gameJoin = gameMap[typeid];

    const [winGoNow] = await connection.query(
      `SELECT period FROM wingo WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1`,
      [gameJoin]
    );
    const [user] = await connection.query(
      "SELECT * FROM users WHERE token = ? AND veri = 1 LIMIT 1",
      [auth]
    );

    if (!winGoNow[0] || !user[0] || !isNumber(x) || !isNumber(money)) {
      return res.status(400).json({ message: "Invalid data", status: false });
    }

    let userInfo = user[0];
    let period = winGoNow[0].period;
    let fee = x * money * 0.02;
    let total = x * money - fee;
    let timeNow = Date.now();
    let check = userInfo.money - total;

    if (check < 0) {
      return res.status(400).json({ message: "The amount is not enough", status: false });
    }

    if (userInfo.legal_bet_score >= 10) {
      await connection.execute("UPDATE users SET status = 2 WHERE phone = ?", [userInfo.phone]);
      const [updatedUser] = await connection.query(
        "SELECT * FROM users WHERE phone = ? LIMIT 1",
        [userInfo.phone]
      );
      
              await connection.execute("UPDATE users SET status = 2,token=0 WHERE phone = ?", [userInfo.phone]);
    
      return res.status(403).json({
        message: "Your account is locked",
        status: true,
        change: updatedUser[0]?.level || null,
        money: updatedUser[0]?.money || 0,
      });
    }


//   const [rowss] = await connection.query(
//   "SELECT SUM(money) AS total FROM recharge WHERE phone = ? AND status = 1",
//   [userInfo.phone]
// );

// const rechargeTotal = rowss[0]?.total || 0;

// if (rechargeTotal < money) {
//   return res.status(200).json({
//     message: 'Need to first recharge',
//     status: false,
//   });
// }

   const [rowss] = await connection.query(
  "SELECT * FROM recharge WHERE phone = ? AND status = 1",
  [userInfo.phone]
);

if (rowss.length===0) {
  return res.status(200).json({
    message: 'Need to first recharge',
    status: false,
  });
}

    let date = new Date();
    let id_product =
      formateT(date.getFullYear()) +
      formateT(date.getMonth() + 1) +
      formateT(date.getDate()) +
      Math.floor(Math.random() * 1000000000000000);
    let checkTime = timerJoin2(date.getTime());

    const sql = `INSERT INTO minutes_1 SET 
          id_product = ?, phone = ?, code = ?, invite = ?, stage = ?, level = ?, 
          money = ?, amount = ?, fee = ?, get = ?, game = ?, bet = ?, status = ?, 
          today = ?, time = ?, isdemo = ?`;

    await connection.execute(sql, [
      id_product, userInfo.phone, userInfo.code, userInfo.invite, period,
      userInfo.level, total, x, fee, 0, gameJoin, join, 0, checkTime, timeNow, userInfo.isdemo
    ]);

    const formattedToday = new Date().toISOString().split("T")[0];

    const [admindata] = await connection.execute("SELECT * FROM admin");

    const [totalMoneyResult] = await connection.query(
      `SELECT 
          (SELECT COALESCE(SUM(money), 0) FROM minutes_1 WHERE phone = ? AND DATE(today) = ?) +
          (SELECT COALESCE(SUM(money), 0) FROM result_k3 WHERE phone = ? AND DATE(bet_data) = ?) +
          (SELECT COALESCE(SUM(money), 0) FROM result_5d WHERE phone = ? AND DATE(bet_data) = ?) 
          AS total_money`,
      [userInfo.phone, formattedToday, userInfo.phone, formattedToday, userInfo.phone, formattedToday]
    );

    const totalMoney = totalMoneyResult[0].total_money || 0;
    let commission = 0;

    // if (totalMoney >= admindata[0].commition_Bet_Amount) {
    //   commission = (totalMoney * admindata[0].user_bet_commition) / 100;

    //   const dailybetcommitin = 
    //     "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
    //   await connection.query(dailybetcommitin, [
    //     userInfo.phone, "Daily Bet Commission", commission, checkTime
    //   ]);
    // }

    // money = parseFloat(money) + parseFloat(commission);

    const [bigScore] = await connection.query(
      "SELECT * FROM minutes_1 WHERE phone = ? AND stage = ? AND bet = ?",
      [userInfo.phone, period, "l"]
    );
    const [smallScore] = await connection.query(
      "SELECT * FROM minutes_1 WHERE phone = ? AND stage = ? AND bet = ?",
      [userInfo.phone, period, "n"]
    );

    const [existingTrade] = await connection.query(
      "SELECT * FROM ligal_trade WHERE user_id = ? AND period = ? AND game = ?",
      [userInfo.id_user, period, gameJoin]
    );

    if (bigScore.length >= 1 && smallScore.length >= 1 && bigScore.length === smallScore.length) {
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
        "UPDATE `users` SET `legal_bet_score` = `legal_bet_score` + ? WHERE `token` = ?",
        [1, auth]
      );
    }

    await connection.execute(
      "UPDATE `users` SET `money` = `money` - ?, `rebate` = `rebate` + ? WHERE `token` = ?",
      [money * x, money * x, auth]
    );


    const [updatedUser] = await connection.query(
      "SELECT * FROM users WHERE token = ? AND veri = 1 LIMIT 1",
      [auth]
    );

    let total_money = money * x;
    let total_recharge = Math.max(userInfo.recharge - total_money, 0);

    await connection.execute(
      "UPDATE `users` SET `recharge` = ? WHERE `phone` = ?",
      [total_recharge, userInfo.phone]
    );

    // const datasql =
    //   "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
    // await connection.query(datasql, [userInfo.phone, "Bet", total, checkTime]);

    // await connection.query(
    //   "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?",
    //   [userInfo.phone, "Daily Bet Commission", commission, checkTime]
    // );


    await commissions(auth, money * x);

    res.status(200).json({
      message: "Bet Succeeded",
      status: true,
      change: updatedUser[0].level,
      money: updatedUser[0].money,
    });

  } catch (error) {
    console.error("Error in betWinGo:", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};





function timerJoin2(params = "", addHours = 0) {
  let date = params ? new Date(Number(params)) : new Date();
  if (addHours !== 0) {
    date.setHours(date.getHours() + addHours);
  }

  const options = {
    timeZone: "Asia/Kolkata", // Specify the desired time zone
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // 24-hour format
  };

  const formatter = new Intl.DateTimeFormat("en-GB", options);
  const parts = formatter.formatToParts(date);

  const getPart = (type) => parts.find((part) => part.type === type).value;

  const formattedDate = `${getPart("year")}-${getPart("month")}-${getPart(
    "day"
  )} ${getPart("hour")}:${getPart("minute")}:${getPart("second")}`;

  return formattedDate;
}



const listOrderOld = async (req, res) => {  
    try{
  let { typeid, pageno, pageto } = req.body;

  // Validate typeid
  if (![1, 3, 5, 10, 11, 33, 55, 100].includes(typeid)) {
    return res.status(200).json({
      message: "Invalid type id",
      status: false,
    });
  }

  // Validate pageno and pageto
  if (pageno < 1 || pageto < 1) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  let auth = req.cookies.auth;
  const [user] = await connection.query(
    "SELECT phone, code, invite, level, money FROM users WHERE token = ? AND veri = 1 LIMIT 1",
    [auth]
  );

  if (!user[0]) {
    return res.status(200).json({
      message: "Error! user is missing.",
      status: false,
    });
  }

  let game = "";
  if (typeid == 1) game = "wingo";
  if (typeid == 3) game = "wingo3";
  if (typeid == 5) game = "wingo5";
  if (typeid == 10) game = "wingo10";
  if (typeid == 11) game = "trx";
  if (typeid == 33) game = "trx3";
  if (typeid == 55) game = "trx5";
  if (typeid == 100) game = "trx10";

  const offset = pageno - 1; // Adjust for 1-based index
  const limit = pageto - pageno + 1; // Number of rows to fetch

  const [wingo] = await connection.query(`
        SELECT * 
        FROM wingo 
        WHERE status != 0 AND game = '${game}' 
        ORDER BY id DESC 
        LIMIT ${limit} OFFSET ${offset}
    `);

  const [wingoAll] = await connection.query(
    `SELECT * FROM wingo WHERE status != 0 AND game = '${game}'`
  );
  const [period] = await connection.query(
    `SELECT period, time FROM wingo WHERE status = 0 AND game = '${game}' ORDER BY id DESC LIMIT 1`
  );

  //  await connection.query(`DELETE FROM wingo WHERE game = '${game}' AND time < NOW() - INTERVAL 30 DAY`);

  if (!wingo.length) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (!period.length) {
    return res.status(200).json({
      message: "Error! period is missing.",
      status: false,
    });
  }

  let page = Math.ceil(wingoAll.length / limit);

  return res.status(200).json({
    code: 0,
    msg: "Get success",
    data: {
      gameslist: wingo,
    },
    period: period[0].period,
    page: page,
    time: period[0].time,
    status: true,
  });
 }
 catch (error) {
    console.error("Error in betWinGo:", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    
};

const GetMyEmerdList = async (req, res) => { 
    try{
  let { typeid, pageno, pageto } = req.body;

  // if (!pageno || !pageto) {
  //     pageno = 0;
  //     pageto = 10;
  // }

  if (
    typeid != 1 &&
    typeid != 3 &&
    typeid != 5 &&
    typeid != 10 &&
    typeid != 11 &&
    typeid != 33 &&
    typeid != 55 &&
    typeid != 100 &&
    typeid != 15
  ) {
    return res.status(200).json({
      message: "Invalid type id",
      status: false,
    });
  }

  if (pageno < 0 || pageto < 0) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }
  let auth = req.cookies.auth;

  let game = "";
  if (typeid == 1) game = "wingo";
  if (typeid == 3) game = "wingo3";
  if (typeid == 5) game = "wingo5";
  if (typeid == 10) game = "wingo10";
  if (typeid == 11) game = "trx";
  if (typeid == 33) game = "trx3";
  if (typeid == 55) game = "trx5";
  if (typeid == 100) game = "trx10";
  if (typeid == 15) {
    const [user] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1 LIMIT 1",
      [auth]
    );

    if (!user[0]) {
      return res.status(200).json({
        code: 0,
        msg: "User not found",
        data: {
          gameslist: [],
        },
        status: false,
      });
    }

    const phone = user[0].phone;

    const limit = 100; // Number of records per page
    const offset = (1 - 1) * limit;

    const [minutess_1] = await connection.query(
      `SELECT * FROM minutes_1 WHERE phone = ? ORDER BY id DESC LIMIT ? OFFSET ?`,
      [phone, limit, offset]
    );

    const [result_k3] = await connection.query(
      `SELECT *,
     CASE 
         WHEN game = 1 THEN 'K3 1'
         WHEN game = 3 THEN 'K3 3'
         WHEN game = 5 THEN 'K3 5'
         WHEN game = 10 THEN 'K3 10'
         ELSE game
     END AS game
     FROM result_k3 
     WHERE phone = ? 
     ORDER BY id DESC LIMIT ? OFFSET ?`,
      [phone, limit, offset]
    );

    const [result_5d] = await connection.query(
      `SELECT *,
     CASE 
         WHEN game = 1 THEN '5D 1'
         WHEN game = 3 THEN '5D 3'
         WHEN game = 5 THEN '5D 5'
         WHEN game = 10 THEN '5D 10'
         ELSE game
     END AS game
     FROM result_5d 
     WHERE phone = ? 
     ORDER BY id DESC LIMIT ? OFFSET ?`,
      [phone, limit, offset]
    );
    
     const [cargame_result] = await connection.query(
      `SELECT * FROM cargame_result WHERE phone = ? ORDER BY id DESC LIMIT ? OFFSET ?`,
      [phone, limit, offset]
    );

    const combinedData = [...cargame_result,...minutess_1, ...cargame_result,...result_5d, ...result_k3];

    // await connection.query(  "DELETE FROM `result_5d` WHERE `phone` = ? AND `bet_data` < NOW() - INTERVAL 10 DAY",  [phone]);
    //   await connection.query(  "DELETE FROM `result_k3` WHERE `phone` = ? AND `bet_data` < NOW() - INTERVAL 10 DAY",  [phone]);
    //     await connection.query(  "DELETE FROM `minutes_1` WHERE `phone` = ? AND `today` < NOW() - INTERVAL 10 DAY",  [phone]);

    return res.status(200).json({
      code: 0,
      msg: "Get success",
      data: {
        gameslist: combinedData,
      },
      status: true,
    });
  }

  const [user] = await connection.query(
    "SELECT `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1 LIMIT 1 ",
    [auth]
  );

  const offset = pageno - 1; // Adjust for 1-based index
  const limit = pageto - pageno + 1; // Number of rows to fetch

  // const [wingo] = await connection.query(`
  //     SELECT *
  //     FROM wingo
  //     WHERE status != 0 AND game = '${game}'
  //     ORDER BY id DESC
  //     LIMIT ${limit} OFFSET ${offset}
  // `);

  const [minutes_1] = await connection.query(
    `SELECT * FROM minutes_1 WHERE phone = ? AND game = '${game}' ORDER BY id DESC  LIMIT ${limit} OFFSET ${offset}`,
    [user[0].phone]
  );
  const [minutes_1All] = await connection.query(
    `SELECT * FROM minutes_1 WHERE phone = ? AND game = '${game}' ORDER BY id DESC `,
    [user[0].phone]
  );

  if (minutes_1[0] === undefined || minutes_1[0] === null) {
    return res.status(200).json({
      code: 0,
      msg: "No more data",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (
    pageno === undefined ||
    pageno === null ||
    pageto === undefined ||
    pageto === null ||
    user[0] === undefined ||
    user[0] === null ||
    minutes_1[0] === undefined ||
    minutes_1[0] === null
  ) {
    return res.status(200).json({
      message: "Error!",
      status: false,
    });
  }
  let page = Math.ceil(minutes_1All.length / 10);

  let datas = minutes_1.map((data) => {
    let { id, phone, code, invite, level, game, ...others } = data;
    return others;
  });

  return res.status(200).json({
    code: 0,
    msg: "Get success data",
    data: {
      gameslist: minutes_1,
    },
    page: page,
    status: true,
  });
 }
    catch (error) {
    console.error("Error in betWinGo:", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};


function generateRandomHash(length) {
  const characters = "abcdef0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

function timerJoins(params = "", addHours = 0) {
  let date = params ? new Date(Number(params)) : new Date();
  if (addHours !== 0) {
    date.setHours(date.getHours() + addHours);
  }

  const options = {
    timeZone: "Asia/Kolkata", // Specify the desired time zone
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // 24-hour format
  };

  const formatter = new Intl.DateTimeFormat("en-GB", options);
  const parts = formatter.formatToParts(date);

  const getPart = (type) => parts.find((part) => part.type === type).value;

  const formattedDate = `${getPart("year")}${getPart("month")}${getPart(
    "day"
  )}`;

  return formattedDate;
}


// Function to shuffle the array in place
function shuffleArrayInPlace(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}


const handlingWinGo1P = async (typeid) => { 
    try{
  let game = "";
  if (typeid == 1) game = "wingo";
  if (typeid == 3) game = "wingo3";
  if (typeid == 5) game = "wingo5";
  if (typeid == 10) game = "wingo10";
  if (typeid == "11") game = "trx";
  if (typeid == "33") game = "trx3";
  if (typeid == "55") game = "trx5";
  if (typeid == "100") game = "trx10";
  const [winGoNow] = await connection.query(
    `SELECT * FROM wingo WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `
  );

  // update ket qua
  await connection.execute(
    `UPDATE minutes_1 SET result = ? WHERE status = 0 AND game = '${game}'`,
    [winGoNow[0].amount]
  );
  let result = Number(winGoNow[0].amount);
  switch (result) {
    case 0:
      await connection.execute(
        `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "d" AND bet != "0" AND bet != "t" `,
        []
      );
      break;
    case 1:
      await connection.execute(
        `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "x" AND bet != "1" `,
        []
      );
      break;
    case 2:
      await connection.execute(
        `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "d" AND bet != "2" `,
        []
      );
      break;
    case 3:
      await connection.execute(
        `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "x" AND bet != "3" `,
        []
      );
      break;
    case 4:
      await connection.execute(
        `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "d" AND bet != "4" `,
        []
      );
      break;
    case 5:
      await connection.execute(
        `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "x" AND bet != "5" AND bet != "t" `,
        []
      );
      break;
    case 6:
      await connection.execute(
        `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "d" AND bet != "6" `,
        []
      );
      break;
    case 7:
      await connection.execute(
        `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "x" AND bet != "7" `,
        []
      );
      break;
    case 8:
      await connection.execute(
        `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "d" AND bet != "8" `,
        []
      );
      break;
    case 9:
      await connection.execute(
        `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet != "l" AND bet != "n" AND bet != "x" AND bet != "9" `,
        []
      );
      break;
    default:
      break;
  }

  if (result < 5) {
    await connection.execute(
      `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet = "l" `,
      []
    );
  } else {
    await connection.execute(
      `UPDATE minutes_1 SET status = 2 WHERE status = 0 AND game = "${game}" AND bet = "n" `,
      []
    );
  }

  // lấy ra danh sách đặt cược chưa xử lý
  const [orders] = await connection.execute(
    `SELECT * FROM minutes_1 WHERE status = 0 AND game = '${game}'`
  );

  const processBet = async (orders) => {
    let result = orders.result;
    let bet = orders.bet;
    let total = orders.money;
    let id = orders.id;
    let phone = orders.phone;
    let nhan_duoc = 0;

    if (bet == "l" || bet == "n") {
      nhan_duoc = total * 2;
    } else {
      if (result == 0 || result == 5) {
        if (bet == "d" || bet == "x") {
          nhan_duoc = total * 1.5;
        } else if (bet == "t") {
          nhan_duoc = total * 4.5;
        } else if (bet == "0" || bet == "5") {
          nhan_duoc = total * 4.5;
        }
      } else {
        if (result == 1 && bet == "1") {
          nhan_duoc = total * 9;
        } else if (result == 1 && bet == "x") {
          nhan_duoc = total * 2;
        }
        if (result == 2 && bet == "2") {
          nhan_duoc = total * 9;
        } else if (result == 2 && bet == "d") {
          nhan_duoc = total * 2;
        }
        if (result == 3 && bet == "3") {
          nhan_duoc = total * 9;
        } else if (result == 3 && bet == "x") {
          nhan_duoc = total * 2;
        }
        if (result == 4 && bet == "4") {
          nhan_duoc = total * 9;
        } else if (result == 4 && bet == "d") {
          nhan_duoc = total * 2;
        }
        if (result == 6 && bet == "6") {
          nhan_duoc = total * 9;
        } else if (result == 6 && bet == "d") {
          nhan_duoc = total * 2;
        }
        if (result == 7 && bet == "7") {
          nhan_duoc = total * 9;
        } else if (result == 7 && bet == "x") {
          nhan_duoc = total * 2;
        }
        if (result == 8 && bet == "8") {
          nhan_duoc = total * 9;
        } else if (result == 8 && bet == "d") {
          nhan_duoc = total * 2;
        }
        if (result == 9 && bet == "9") {
          nhan_duoc = total * 9;
        } else if (result == 9 && bet == "x") {
          nhan_duoc = total * 2;
        }
      }
    }

    let checkTime2 = timerJoin2(Date.now());

    let totalsGet = parseFloat(nhan_duoc);

    await connection.execute(
      "UPDATE `minutes_1` SET `get` = ?, `status` = 1 WHERE `id` = ? ",
      [totalsGet, id]
    );
    // await connection.execute(
    //   "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?",
    //   [phone, "Win", totalsGet, checkTime2]
    // );
    await connection.execute(
      "UPDATE `users` SET `money` = `money` + ? WHERE `phone` = ?",
      [totalsGet, phone]
    );
  };

  const promises = orders.map((order) => processBet(order));

  await Promise.all(promises);

    }catch (error) {
    console.error("Error in betWinGo:", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };



const tradeCommission = async () => {
  try {
    // Fetch users with pending commission
    const [users] = await connection.execute(
      "SELECT * FROM `users` WHERE `pending_commission` > 0"
    );

    if (users.length === 0) {
      //console.log("No users with pending commission.");
      return;
    }

    const sumdate = timerJoin2(Date.now());

    // Prepare bulk update and insert statements
    const updateQueries = [];
    const insertQueries = [];

    for (let user of users) {
      updateQueries.push(
        connection.execute(
          "UPDATE `users` SET `money` = `money` + ?, `pending_commission` = 0 WHERE `phone` = ?",
          [user.pending_commission, user.phone]
        )
      );

      insertQueries.push(
        connection.execute(
          "INSERT INTO transaction_history (phone, detail, balance, `time`) VALUES (?, ?, ?, ?)",
          [
            user.phone,
            "Agent Commission",
            user.pending_commission,
            sumdate,
          ]
        )
      );
    }

    // Execute all updates and inserts in parallel
    await Promise.all(updateQueries);
    await Promise.all(insertQueries);
  } catch (error) {
    console.error("Error processing commissions:", error);
  } finally {
  }
};

const tradeCommissionadmin = async (req, res) => {
  try {
    // Fetch users with pending commission
    const [users] = await connection.execute(
      "SELECT * FROM `users` WHERE `pending_commission` > 0"
    );

    if (users.length === 0) {
      //console.log("No users with pending commission.");
      return res.status(200).json({
        message: "No users with pending commission!",
        status: true,
      });
    }

    const sumdate = timerJoin2(Date.now());

    // Prepare bulk update and insert statements
    const updateQueries = [];
    const insertQueries = [];

    for (let user of users) {
      updateQueries.push(
        connection.execute(
          "UPDATE `users` SET `money` = `money` + ?, `pending_commission` = 0 WHERE `phone` = ?",
          [user.pending_commission, user.phone]
        )
      );

      insertQueries.push(
        connection.execute(
          "INSERT INTO transaction_history (phone, detail, balance, `time`) VALUES (?, ?, ?, ?)",
          [
            user.phone,
            "Agent Commission",
            user.pending_commission,
            sumdate,
          ]
        )
      );
    }

    // Execute all updates and inserts in parallel
    await Promise.all(updateQueries);
    await Promise.all(insertQueries);

    return res.status(200).json({
      message: "commission Successfully!",
      status: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error!",
      status: false,
    });
  } finally {
  }
};

const tradeCommissionGet = async (req, res) => {
  try {
    // Fetch users with pending commission
    const [users] = await connection.query(
      "SELECT * FROM `users` WHERE `pending_commission` > 0"
    );

    // //console.log("users", users);
    return res.status(200).json({
      message: "commission Successfully!",
      status: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error!",
      status: false,
    });
  }
};







const maxApiRetries = 3; // Max retries for API
const apiTimeout = 900; // 900ms timeout

const fetchApiData_lottery7_10 = async () => {
    
    const apiUrlPeriod = "https://lottery7api.com/api/webapi/GetNoaverageEmerdList";
    const bearerToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIxNzM3Mzk2MTg4IiwibmJmIjoiMTczNzM5NjE4OCIsImV4cCI6IjE3MzczOTc5ODgiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL2V4cGlyYXRpb24iOiIxLzIxLzIwMjUgMTI6MDM6MDggQU0iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBY2Nlc3NfVG9rZW4iLCJVc2VySWQiOiIxNTAwMDQyNyIsIlVzZXJOYW1lIjoiOTEzNDYzNTY1MTY0IiwiVXNlclBob3RvIjoiMSIsIk5pY2tOYW1lIjoiTWVtYmVyTk5HWkhGSVQiLCJBbW91bnQiOiI1OC4wMCIsIkludGVncmFsIjoiMCIsIkxvZ2luTWFyayI6Ikg1IiwiTG9naW5UaW1lIjoiMS8yMC8yMDI1IDExOjMzOjA4IFBNIiwiTG9naW5JUEFkZHJlc3MiOiIyMjMuMTIzLjEwLjkiLCJEYk51bWJlciI6IjAiLCJJc3ZhbGlkYXRvciI6IjAiLCJLZXlDb2RlIjoiMSIsIlRva2VuVHlwZSI6IkFjY2Vzc19Ub2tlbiIsIlBob25lVHlwZSI6IjAiLCJVc2VyVHlwZSI6IjAiLCJVc2VyTmFtZTIiOiIiLCJpc3MiOiJqd3RJc3N1ZXIiLCJhdWQiOiJsb3R0ZXJ5VGlja2V0In0.lNcBy8hBjnDff2yFJsg7Knbawb3NoLgD5nmLakTR5Ss"; // Use a valid token

    const requestDataPeriod = {
        "pageSize": 10,
        "pageNo": 1,
        "typeId": 30,
        "language": 0,
        "random": "d9781e8c339a4c1a85aec64ed1d86821",
        "signature": "25BA37A78635FCCBC665ACA640283C41",
        "timestamp": 1737398159
    };
    const headers = {
        "accept": "application/json, text/plain, */*",
        "content-type": "application/json;charset=UTF-8",
        "authorization": `Bearer ${bearerToken}`,
        "origin": "https://www.lottery7j.com",
        "referer": "https://www.lottery7j.com/",
        "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
    };

    let attempts = 0;
    while (attempts < maxApiRetries) {
        try {
            const startTime = Date.now();
            const response = await axios.post(apiUrlPeriod, requestDataPeriod, { headers, timeout: apiTimeout });
            const endTime = Date.now();

            if (endTime - startTime > apiTimeout) {
                attempts++;
                ////console.log(`API took too long (${endTime - startTime}ms), retrying... Attempt ${attempts}`);
                continue;
            }
            
            // //console.log("fetchApiData_lottery7_10", response.data?.data?.list?.[0]);
            return response.data?.data?.list?.[0] || null;
        } catch (error) {
            attempts++;
            console.error(`API call failed (Attempt ${attempts}):`, error.message);
            if (attempts >= maxApiRetries) {
                throw new Error("API failed after maximum retries");
            }
        }
    }
    return null;
};

const fetchApiData_tiranga_10 = async () => {
    const apiUrlPeriod = "https://tirangaapi.com/api/webapi/GetNoaverageEmerdList";
    const bearerToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIxNzQxMTcxNzk3IiwibmJmIjoiMTc0MTE3MTc5NyIsImV4cCI6IjE3NDExNzM1OTciLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL2V4cGlyYXRpb24iOiIzLzUvMjAyNSA0OjQ5OjU3IFBNIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiQWNjZXNzX1Rva2VuIiwiVXNlcklkIjoiMTk1NDYxNTEiLCJVc2VyTmFtZSI6IjkxMzEwMTM2MTY0NyIsIlVzZXJQaG90byI6IjEiLCJOaWNrTmFtZSI6Ik1lbWJlck5OR09WVVVOIiwiQW1vdW50IjoiMC4wMCIsIkludGVncmFsIjoiMCIsIkxvZ2luTWFyayI6Ikg1IiwiTG9naW5UaW1lIjoiMy81LzIwMjUgNDoxOTo1NyBQTSIsIkxvZ2luSVBBZGRyZXNzIjoiMzcuMTExLjE2Ny4yMDAiLCJEYk51bWJlciI6IjAiLCJJc3ZhbGlkYXRvciI6IjAiLCJLZXlDb2RlIjoiMSIsIlRva2VuVHlwZSI6IkFjY2Vzc19Ub2tlbiIsIlBob25lVHlwZSI6IjAiLCJVc2VyVHlwZSI6IjAiLCJVc2VyTmFtZTIiOiIiLCJpc3MiOiJqd3RJc3N1ZXIiLCJhdWQiOiJsb3R0ZXJ5VGlja2V0In0.-BMjnCK9nN-etFV9fvbO6nX8HNDEqPp0j8gqTKQ0aeE";

    const requestDataPeriod = {
        "pageSize": 10,
        "pageNo": 1,
        "typeId": 30,
        "language": 0,
        "random": "c5322bb7c5b9426e91e5bec85264c913",
        "signature": "4E16C1F5F371D00CA595EAEAED81593B",
        "timestamp": 1741171832
    };

    const headers = {
        "accept": "application/json, text/plain, */*",
        "content-type": "application/json;charset=UTF-8",
        "authorization": `Bearer ${bearerToken}`,
        "origin": "https://www.tirangagame.top",
        "referer": "https://www.tirangagame.top/",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
    };

    let attempts = 0;
    const maxApiRetries = 3;
    const apiTimeout = 5000;

    while (attempts < maxApiRetries) {
        try {
            const startTime = Date.now();
            const response = await axios.post(apiUrlPeriod, requestDataPeriod, { headers, timeout: apiTimeout });
            const endTime = Date.now();

            if (endTime - startTime > apiTimeout) {
                attempts++;
                continue;
            }

            // //console.log("fetchApiData_tiranga_10", response.data?.data?.list?.[0]);
            return response.data?.data?.list?.[0] || null;
        } catch (error) {
            attempts++;
            console.error(`API call failed (Attempt ${attempts}):`, error.message);
            if (attempts >= maxApiRetries) {
                throw new Error("API failed after maximum retries");
            }
        }
    }
    return null;
};

const fetchApiData_bdgwin_10 = async () => {
    // Build the request URL with a current timestamp
    const ts = Date.now();
    const apiUrl = `https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?ts=${ts}`;

    // Request headers (optional, can add user-agent if you want to mimic browser)
    const headers = {
        accept: "application/json, text/plain, */*",
        // "user-agent": "Mozilla/5.0 ..."  // (optional)
    };

    let attempts = 0;
    const maxApiRetries = 3;
    const apiTimeout = 5000;

    while (attempts < maxApiRetries) {
        try {
            const startTime = Date.now();
            const response = await axios.get(apiUrl, { headers, timeout: apiTimeout });
            const endTime = Date.now();

            if (endTime - startTime > apiTimeout) {
                attempts++;
                continue;
            }

            // Return the first element in the list, or null if not found
            return response.data?.data?.list?.[0] || null;
        } catch (error) {
            attempts++;
            console.error(`API call failed (Attempt ${attempts}):`, error.message);
            if (attempts >= maxApiRetries) {
                throw new Error("API failed after maximum retries");
            }
        }
    }
    return null;
};

const logFilePath = path.join(__dirname, 'wingo10.log');
const lastCallTime = { value: 0 };
const lockDuration = 5000; // 5 seconds

const fetchNewPeriod_10 = async (currentPeriod) => {
    const maxAttempts = 10;
    const apiTimeout = 450; // Timeout per API call (ms)
    const retryInterval = 500; // Total attempt cycle time (ms)

    // Helper to add timeout to API calls
    const withTimeout = (promise, ms) => Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API timeout')), ms)
        )
    ]);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const attemptStart = Date.now();
        let validResponse = null;

        try {
            // Create timeout-controlled API calls
            const apiCalls = [
                withTimeout(fetchApiData_bdgwin_10(), apiTimeout)
            ].map(p => p.catch(e => null));

            // Get all responses that complete within timeout
            const results = await Promise.allSettled(apiCalls);
            
            //console.log("results 30", results);

            // Check valid responses from fastest APIs
            for (const result of results) {
                if (result.status === 'fulfilled' && result.value?.issueNumber === currentPeriod) {
                    validResponse = result.value;
                    //console.log("validResponse", validResponse);
                    break;
                }
            }
            

            if (validResponse) {
                return {
                    newPeriod: (BigInt(currentPeriod) + BigInt(1)).toString(),
                    resultAmount: validResponse.number,
                    attempts: attempt
                };
            }
        } catch (error) {
            console.error(`Attempt ${attempt} error:`, error.message);
        }

        // Maintain consistent retry interval
        const elapsed = Date.now() - attemptStart;
        const waitTime = Math.max(retryInterval - elapsed, 0);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    //console.log("Maximum attempts reached without success");
    return null;
};

const addWinGo_10 = async (period_id) => {
    try {
        
        
        const currentTime = new Date();
        if (Date.now() - lastCallTime.value < lockDuration) {
            ////console.log("Function call ignored: less than 5 seconds since last call.");
            return;
        }
        lastCallTime.value = Date.now();

        let join = "wingo10";
        
        let checkTime2 = timerJoin2(Date.now());

        let logData = {
            functionStartTime: currentTime.toLocaleString(),
            functionEndTime: null,
            sqlPeriod: null,
            periodFromAPI: null,
            newPeriod: null,
            oldPeriod: null,
            adminControl: null,
            apiResponseTime: null,
            resultAmount: null,
            attempts: 0,
        };

        // Fetch latest period with status 0
        let [winGoNow] = await connection.query(
            `SELECT period FROM wingo WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1`, [join]
        );

        let period = winGoNow.length > 0 ? winGoNow[0]?.period : "98778990";
        logData.sqlPeriod = period;
        logData.oldPeriod = period;
        ////console.log("Old SQL Period:", period);

        // Fetch admin settings
        const [setting] = await connection.query('SELECT * FROM `admin`');
        let nextResult = setting[0].wingo10;
        logData.adminControl = nextResult;

        let startApiTime = Date.now();
        let newPeriodData = await fetchNewPeriod_10(period_id);



        let endApiTime = Date.now();
        logData.apiResponseTime = `${endApiTime - startApiTime}ms`;

        if (!newPeriodData) {
            console.error("No new period received. Aborting function.");
            return;
        }

        let { newPeriod, resultAmount, attempts } = newPeriodData;
        
        //console.log("newPeriodData 30 second" , newPeriodData);

        logData.periodFromAPI = newPeriod;


        logData.newPeriod = newPeriod;
        logData.resultAmount = resultAmount;
        logData.attempts = attempts;

        ////console.log("New Period:", newPeriod);

        // Process the nextResult logic
        let newArr = "";
        
        const [minPlayers] = await connection.query(`
            SELECT COUNT(*) AS count
            FROM minutes_1
            WHERE status = 0 AND game = ?
        `, [join]);
        
        //         const [minPlayers] = await connection.query(`
        //     SELECT SUM(money) AS count
        //     FROM minutes_1
        //     WHERE status = 0 AND game = ?
        // `, [join]);
        
        if (minPlayers[0].count > 0) {
            
            if (setting[0].website_mode == 1) {
                resultAmount = await defineresult(10);
            }
            
            //  resultAmount = await defineresult(10)
        }

        if (nextResult === "-1") {
            await connection.execute(
                `UPDATE wingo SET amount = ?, status = ? WHERE period = ? AND game = ?`, [resultAmount, 1, period, join]
            );
            newArr = "-1";
        } else {
            let arr = nextResult.split("|");
            newArr = arr.length === 1 ? "-1" : arr.slice(1).join("|");

            await connection.execute(
                `UPDATE wingo SET amount = ?, status = ? WHERE period = ? AND game = ?`, [Number(arr[0]), 1, period, join]
            );
        }

        // Update the previous period status
        await connection.execute(
            `UPDATE wingo SET status = ? WHERE period != ? AND game = ?`, [1, newPeriod, join]
        );

        // Insert new period data
        await connection.execute(
            `INSERT INTO wingo (period, amount, game, status, hashvalue, blocs, time) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [String(newPeriod), 0, join, 0, generateRandomHash(10), 50, checkTime2]
        );

        // Update admin settings
        await connection.execute(`UPDATE admin SET ${join} = ?`, [newArr]);

        logData.functionEndTime = new Date().toLocaleString();

        // Save log to file
        //fs.appendFileSync(logFilePath, JSON.stringify(logData, null, 2) + '\n\n', 'utf8');
        ////console.log("Log saved:", logData);
    } catch (error) {
        console.error("Error in addWinGo_10:", error);
        //fs.appendFileSync(logFilePath, `Error: ${error.message}\n\n`, 'utf8');
    }
};


//--------------------------------------------------------------


const maxApiRetries_1 = 3; // Max retries for API
const apiTimeout_1 = 900; // 900ms timeout

const fetchApiData_lottery7_1 = async () => {
    
    
    
    const apiUrlPeriod = "https://lottery7api.com/api/webapi/GetNoaverageEmerdList";
    const bearerToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIxNzM3Mzk2MTg4IiwibmJmIjoiMTczNzM5NjE4OCIsImV4cCI6IjE3MzczOTc5ODgiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL2V4cGlyYXRpb24iOiIxLzIxLzIwMjUgMTI6MDM6MDggQU0iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBY2Nlc3NfVG9rZW4iLCJVc2VySWQiOiIxNTAwMDQyNyIsIlVzZXJOYW1lIjoiOTEzNDYzNTY1MTY0IiwiVXNlclBob3RvIjoiMSIsIk5pY2tOYW1lIjoiTWVtYmVyTk5HWkhGSVQiLCJBbW91bnQiOiI1OC4wMCIsIkludGVncmFsIjoiMCIsIkxvZ2luTWFyayI6Ikg1IiwiTG9naW5UaW1lIjoiMS8yMC8yMDI1IDExOjMzOjA4IFBNIiwiTG9naW5JUEFkZHJlc3MiOiIyMjMuMTIzLjEwLjkiLCJEYk51bWJlciI6IjAiLCJJc3ZhbGlkYXRvciI6IjAiLCJLZXlDb2RlIjoiMSIsIlRva2VuVHlwZSI6IkFjY2Vzc19Ub2tlbiIsIlBob25lVHlwZSI6IjAiLCJVc2VyVHlwZSI6IjAiLCJVc2VyTmFtZTIiOiIiLCJpc3MiOiJqd3RJc3N1ZXIiLCJhdWQiOiJsb3R0ZXJ5VGlja2V0In0.lNcBy8hBjnDff2yFJsg7Knbawb3NoLgD5nmLakTR5Ss";

    const requestDataPeriod = {
        "pageSize": 10,
        "pageNo": 1,
        "typeId": 1,
        "language": 0,
        "random": "080353e895f440c5a7c21bfb6f7ce267",
        "signature": "1F7EEED071971EF8B91D86DE0C507B92",
        "timestamp": 1737398159
    };
    const headers = {
        "accept": "application/json, text/plain, */*",
        "content-type": "application/json;charset=UTF-8",
        "authorization": `Bearer ${bearerToken}`,
        "origin": "https://www.lottery7j.com",
        "referer": "https://www.lottery7j.com/",
        "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
    };

    let attempts = 0;
    while (attempts < maxApiRetries_1) {
        try {
            const startTime = Date.now();
            const response = await axios.post(apiUrlPeriod, requestDataPeriod, { headers, timeout: apiTimeout_1 });
            const endTime = Date.now();

            if (endTime - startTime > apiTimeout_1) {
                attempts++;
                ////console.log(`API took too long (${endTime - startTime}ms), retrying... Attempt ${attempts}`);
                continue;
            }
            
            ////console.log("response.data?.data?", response.data?.data?.list?.[0]);
            return response.data?.data?.list?.[0] || null;
        } catch (error) {
            attempts++;
            console.error(`API call failed (Attempt ${attempts}):`, error.message);
            if (attempts >= maxApiRetries_1) {
                throw new Error("API failed after maximum retries");
            }
        }
    }
    return null;
};

const fetchApiData_tiranga_1 = async () => {
    const apiUrlPeriod = "https://tirangaapi.com/api/webapi/GetNoaverageEmerdList";
    const bearerToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIxNzQxMTY1NjQ3IiwibmJmIjoiMTc0MTE2NTY0NyIsImV4cCI6IjE3NDExNjc0NDciLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL2V4cGlyYXRpb24iOiIzLzUvMjAyNSAzOjA3OjI3IFBNIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiQWNjZXNzX1Rva2VuIiwiVXNlcklkIjoiMTk1NDYxNTEiLCJVc2VyTmFtZSI6IjkxMzEwMTM2MTY0NyIsIlVzZXJQaG90byI6IjEiLCJOaWNrTmFtZSI6Ik1lbWJlck5OR09WVVVOIiwiQW1vdW50IjoiMC4wMCIsIkludGVncmFsIjoiMCIsIkxvZ2luTWFyayI6Ikg1IiwiTG9naW5UaW1lIjoiMy81LzIwMjUgMjozNzoyNyBQTSIsIkxvZ2luSVBBZGRyZXNzIjoiMzcuMTExLjE2Ny4yMDAiLCJEYk51bWJlciI6IjAiLCJJc3ZhbGlkYXRvciI6IjAiLCJLZXlDb2RlIjoiMSIsIlRva2VuVHlwZSI6IkFjY2Vzc19Ub2tlbiIsIlBob25lVHlwZSI6IjAiLCJVc2VyVHlwZSI6IjAiLCJVc2VyTmFtZTIiOiIiLCJpc3MiOiJqd3RJc3N1ZXIiLCJhdWQiOiJsb3R0ZXJ5VGlja2V0In0.CXQ5b2cMcDKh_lBRytR3cwgNmsOu9T5R6zXGYH6iIwI";

    const requestDataPeriod = {
        pageSize: 10,
        pageNo: 1,
        typeId: 1,
        language: 0,
        random: "e70e2b662df249fd83340b8a42c54c9a",
        signature: "F82C038F59B015DA0E41C725F1DCDAAA",
        timestamp: 1741165669
    };
    const headers = {
        "accept": "application/json, text/plain, */*",
        "content-type": "application/json;charset=UTF-8",
        "authorization": `Bearer ${bearerToken}`,
        "origin": "https://www.tirangagame.top",
        "referer": "https://www.tirangagame.top/",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
    };

    let attempts = 0;
    const maxApiRetries = 3;
    const apiTimeout = 5000;

    while (attempts < maxApiRetries) {
        try {
            const startTime = Date.now();
            const response = await axios.post(apiUrlPeriod, requestDataPeriod, { headers, timeout: apiTimeout });
            const endTime = Date.now();

            if (endTime - startTime > apiTimeout) {
                attempts++;
                continue;
            }
            ////console.log("fetchApiData_tiranga_1: ", response.data?.data?.list?.[0]);
            return response.data?.data?.list?.[0] || null;
        } catch (error) {
            attempts++;
            console.error(`API call failed (Attempt ${attempts}):`, error.message);
            if (attempts >= maxApiRetries) {
                throw new Error("API failed after maximum retries");
            }
        }
    }
    return null;
};

const fetchApiData_bdgwin_1 = async () => {
    // Build the request URL with a current timestamp
    const ts = Date.now();
    const apiUrl = `https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?ts=${ts}`;

    // Request headers (optional, can add user-agent if you want to mimic browser)
    const headers = {
        accept: "application/json, text/plain, */*",
        // "user-agent": "Mozilla/5.0 ..."  // (optional)
    };

    let attempts = 0;
    const maxApiRetries = 3;
    const apiTimeout = 5000;

    while (attempts < maxApiRetries) {
        try {
            const startTime = Date.now();
            const response = await axios.get(apiUrl, { headers, timeout: apiTimeout });
            const endTime = Date.now();

            if (endTime - startTime > apiTimeout) {
                attempts++;
                continue;
            }

            // Return the first element in the list, or null if not found
            return response.data?.data?.list?.[0] || null;
        } catch (error) {
            attempts++;
            console.error(`API call failed (Attempt ${attempts}):`, error.message);
            if (attempts >= maxApiRetries) {
                throw new Error("API failed after maximum retries");
            }
        }
    }
    return null;
};

const fetchNewPeriod_1 = async (currentPeriod) => {
    const maxAttempts = 10;
    const apiTimeout = 450; // Timeout per API call (ms)
    const retryInterval = 500; // Total attempt cycle time (ms)

    // Helper to add timeout to API calls
    const withTimeout = (promise, ms) => Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API timeout')), ms)
        )
    ]);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const attemptStart = Date.now();
        let validResponse = null;

        try {
            // Create timeout-controlled API calls
            const apiCalls = [
                withTimeout(fetchApiData_lottery7_1(), apiTimeout),
                withTimeout(fetchApiData_tiranga_1(), apiTimeout),
                withTimeout(fetchApiData_bdgwin_1(), apiTimeout)
            ].map(p => p.catch(e => null));

            // Get all responses that complete within timeout
            const results = await Promise.allSettled(apiCalls);

            // Check valid responses from fastest APIs
            for (const result of results) {
                if (result.status === 'fulfilled' && result.value?.issueNumber === currentPeriod) {
                    validResponse = result.value;
                    break;
                }
            }

            if (validResponse) {
                return {
                    newPeriod: (BigInt(currentPeriod) + BigInt(1)).toString(),
                    resultAmount: validResponse.number,
                    attempts: attempt
                };
            }
        } catch (error) {
            console.error(`Attempt ${attempt} error:`, error.message);
        }

        // Maintain consistent retry interval
        const elapsed = Date.now() - attemptStart;
        const waitTime = Math.max(retryInterval - elapsed, 0);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    //console.log("Maximum attempts reached without success");
    return null;
};

const fetchApiData_bdg_1 = async () => {
    const apiUrlPeriod = "https://lottery7api.com/api/webapi/GetNoaverageEmerdList";
    const bearerToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIxNzM3Mzk2MTg4IiwibmJmIjoiMTczNzM5NjE4OCIsImV4cCI6IjE3MzczOTc5ODgiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL2V4cGlyYXRpb24iOiIxLzIxLzIwMjUgMTI6MDM6MDggQU0iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBY2Nlc3NfVG9rZW4iLCJVc2VySWQiOiIxNTAwMDQyNyIsIlVzZXJOYW1lIjoiOTEzNDYzNTY1MTY0IiwiVXNlclBob3RvIjoiMSIsIk5pY2tOYW1lIjoiTWVtYmVyTk5HWkhGSVQiLCJBbW91bnQiOiI1OC4wMCIsIkludGVncmFsIjoiMCIsIkxvZ2luTWFyayI6Ikg1IiwiTG9naW5UaW1lIjoiMS8yMC8yMDI1IDExOjMzOjA4IFBNIiwiTG9naW5JUEFkZHJlc3MiOiIyMjMuMTIzLjEwLjkiLCJEYk51bWJlciI6IjAiLCJJc3ZhbGlkYXRvciI6IjAiLCJLZXlDb2RlIjoiMSIsIlRva2VuVHlwZSI6IkFjY2Vzc19Ub2tlbiIsIlBob25lVHlwZSI6IjAiLCJVc2VyVHlwZSI6IjAiLCJVc2VyTmFtZTIiOiIiLCJpc3MiOiJqd3RJc3N1ZXIiLCJhdWQiOiJsb3R0ZXJ5VGlja2V0In0.lNcBy8hBjnDff2yFJsg7Knbawb3NoLgD5nmLakTR5Ss";

    const requestDataPeriod = {
        "pageSize": 10,
        "pageNo": 1,
        "typeId": 1,
        "language": 0,
        "random": "080353e895f440c5a7c21bfb6f7ce267",
        "signature": "1F7EEED071971EF8B91D86DE0C507B92",
        "timestamp": 1737398159
    };
    const headers = {
        "accept": "application/json, text/plain, */*",
        "content-type": "application/json;charset=UTF-8",
        "authorization": `Bearer ${bearerToken}`,
        "origin": "https://www.lottery7j.com",
        "referer": "https://www.lottery7j.com/",
        "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
    };

    let attempts = 0;
    while (attempts < maxApiRetries_1) {
        try {
            const startTime = Date.now();
            const response = await axios.post(apiUrlPeriod, requestDataPeriod, { headers, timeout: apiTimeout_1 });
            const endTime = Date.now();

            if (endTime - startTime > apiTimeout_1) {
                attempts++;
                ////console.log(`API took too long (${endTime - startTime}ms), retrying... Attempt ${attempts}`);
                continue;
            }
            
            // //console.log("response.data?.data?", response.data?.data);
            return response.data?.data?.list?.[0] || null;
        } catch (error) {
            attempts++;
            console.error(`API call failed (Attempt ${attempts}):`, error.message);
            if (attempts >= maxApiRetries_1) {
                throw new Error("API failed after maximum retries");
            }
        }
    }
    return null;
};

const logFilePath_1 = path.join(__dirname, 'wingo1.log');
const lastCallTime_1 = { value: 0 };
const lockDuration_1 = 5000; // 5 seconds

const addWinGo_1 = async (period_id) => {

    try {
        const currentTime = new Date();
        if (Date.now() - lastCallTime_1.value < lockDuration_1) {

            ////console.log("Function call ignored: less than 5 seconds since last call.");
            return;

        }
        lastCallTime_1.value = Date.now();

        let join = "wingo";
        let checkTime2 = timerJoin2(Date.now());

        let logData = {
            functionStartTime: currentTime.toLocaleString(),
            functionEndTime: null,
            sqlPeriod: null,
            periodFromAPI: null,
            newPeriod: null,
            oldPeriod: null,
            adminControl: null,
            apiResponseTime: null,
            resultAmount: null,
            attempts: 0,
        };

        // Fetch latest period with status 0
        let [winGoNow] = await connection.query(
            `SELECT period FROM wingo WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1`, [join]
        );

        let period = winGoNow.length > 0 ? winGoNow[0]?.period : "98778990";
        logData.sqlPeriod = period;
        logData.oldPeriod = period;
        ////console.log("Old SQL Period:", period);

        // Fetch admin settings
        const [setting] = await connection.query('SELECT * FROM `admin`');
        let nextResult = setting[0].wingo;
        logData.adminControl = nextResult;

        let startApiTime = Date.now();
        let newPeriodData = await fetchNewPeriod_1(period_id);
        
        
        let endApiTime = Date.now();
        logData.apiResponseTime = `${endApiTime - startApiTime}ms`;

        if (!newPeriodData) {
            console.error("No new period received. Aborting function.");
            return;
        }

        let { newPeriod, resultAmount, attempts } = newPeriodData;
        
        ////console.log("newPeriodData" , newPeriodData);

        logData.periodFromAPI = newPeriod;

        //if (newPeriod && period == newPeriod) {

          //  newPeriod = (BigInt(newPeriod) + BigInt(1)).toString();

        //}

        logData.newPeriod = newPeriod;
        logData.resultAmount = resultAmount;
        logData.attempts = attempts;

        ////console.log("New Period:", newPeriod);

        // Process the nextResult logic
        let newArr = "";
        
        
        const [minPlayers] = await connection.query(`
            SELECT COUNT(*) AS count
            FROM minutes_1
            WHERE status = 0 AND game = ?
        `, [join]);
        
        //   const [minPlayers] = await connection.query(`
        //     SELECT SUM(money) AS count
        //     FROM minutes_1
        //     WHERE status = 0 AND game = ?
        // `, [join]);
        
        ////console.log("count", minPlayers[0].count);
        
        if (minPlayers[0].count > 0) {
            
            if (setting[0].website_mode == 1) {
                resultAmount = await defineresult(1);
            }
            // resultAmount = await defineresult(1)
        }
        
        if (nextResult === "-1") {
            await connection.execute(
                `UPDATE wingo SET amount = ?, status = ? WHERE period = ? AND game = ?`, [resultAmount, 1, period, join]
            );
            newArr = "-1";
        } else {
            let arr = nextResult.split("|");
            newArr = arr.length === 1 ? "-1" : arr.slice(1).join("|");

            await connection.execute(
                `UPDATE wingo SET amount = ?, status = ? WHERE period = ? AND game = ?`, [Number(arr[0]), 1, period, join]
            );
        }

        // Update the previous period status
        await connection.execute(
            `UPDATE wingo SET status = ? WHERE period != ? AND game = ?`, [1, newPeriod, join]
        );
        
        //console.log("newPeriod" , newPeriod);

        // Insert new period data
        await connection.execute(
            `INSERT INTO wingo (period, amount, game, status, hashvalue, blocs, time) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [String(newPeriod), 0, join, 0, generateRandomHash(10), 50, checkTime2]
        );

        // Update admin settings
        await connection.execute(`UPDATE admin SET ${join} = ?`, [newArr]);

        logData.functionEndTime = new Date().toLocaleString();

        // Save log to file
        //fs.appendFileSync(logFilePath_1, JSON.stringify(logData, null, 2) + '\n\n', 'utf8');
        ////console.log("Log saved:", logData);
    } catch (error) {
        console.error("Error in addWinGo_10:", error);
        //fs.appendFileSync(logFilePath_1, `Error: ${error.message}\n\n`, 'utf8');
    }
};



//-----------------------------------------------------------------------------



const maxApiRetries_11 = 3; // Max retries for API
const apiTimeout_11 = 900; // 900ms timeout

const fetchApiData_11 = async () => {
    const apiUrl = "https://draw.ar-lottery01.com/TrxWinGo/TrxWinGo_1M/GetHistoryIssuePage.json?ts=1746504243564";

    const headers = {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9,ur;q=0.8",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "referer": "https://www.tirangagame.top/"
    };

    let attempts = 0;

    while (attempts < maxApiRetries_11) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), apiTimeout_11);

            const startTime = Date.now();
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers,
                signal: controller.signal,
            });
            const endTime = Date.now();

            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            if (endTime - startTime > apiTimeout_11) {
                attempts++;
                continue;
            }

            const data = await response.json();
            return data?.data?.list?.[0] || null;

        } catch (error) {
            attempts++;
            console.error(`API call failed (Attempt ${attempts}):`, error.message);
            if (attempts >= maxApiRetries_11) {
                throw new Error("API failed after maximum retries");
            }
        }
    }

    return null;
};


const logFilePath_11 = path.join(__dirname, 'trx.log');
const lastCallTime_11 = { value: 0 };
const lockDuration_11 = 5000; // 5 seconds

const fetchNewPeriod_11 = async (currentPeriod, game) => {
    
    let attempts = 0;
    let apiPeriod = null;
    let apiData = null;

    while (true) {
        try {
            apiData = await fetchApiData_11();
            if (apiData) {
                // //console.log("apidata", apiData);
                // //console.log("currentPeriod", currentPeriod)
                apiPeriod = apiData.issueNumber;
                // //console.log("apiPeriod", apiPeriod, "result", apiData.number);
                ////console.log("newPeriod", apiPeriod + 1);
                
                if (apiPeriod == currentPeriod) {
                    //console.log("brack call");
                    break;
                }
            }
        } catch (error) {
            console.error("API call error:", error.message);
        }

        await new Promise((resolve) => setTimeout(resolve, 700));
        attempts++;
    }
    
    

    const blockID = apiData.blockID;
  
    const lastFourChars = (apiData.blockId).slice(-6); // Get the last 6 characters
    const formattedBlockID = `**${lastFourChars}`;

    return {
        newPeriod: (BigInt(apiPeriod) + BigInt(1)).toString(), // Convert to string
        resultAmount: apiData.number,
        hashvalue: formattedBlockID,
        blockNumber: apiData.blockNumber,
        attempts
    };
};


const addWinGo_11 = async (periodfromserver) => {
    try {
        ////console.log("i am called");
        const currentTime = new Date();
        if (Date.now() - lastCallTime_11.value < lockDuration_11) {
            ////console.log("Function call ignored: less than 5 seconds since last call.");
            return;
        }
        lastCallTime_11.value = Date.now();

        let join = "trx";
        let checkTime2 = timerJoin2(Date.now());

        let logData = {
            functionStartTime: currentTime.toLocaleString(),
            functionEndTime: null,
            sqlPeriod: null,
            periodFromAPI: null,
            newPeriod: null,
            oldPeriod: null,
            adminControl: null,
            apiResponseTime: null,
            resultAmount: null,
            attempts: 0,
        };

        // Fetch latest period with status 0
        let [winGoNow] = await connection.query(
            `SELECT period FROM wingo WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1`, [join]
        );

        let period = winGoNow.length > 0 ? winGoNow[0]?.period : "98778990";
        logData.sqlPeriod = period;
        logData.oldPeriod = period;
        ////console.log("Old SQL Period:", period);

        // Fetch admin settings
        const [setting] = await connection.query('SELECT * FROM `admin`');
        let nextResult = setting[0].trx;
        logData.adminControl = nextResult;

        let startApiTime = Date.now();
        let newPeriodData = await fetchNewPeriod_11(periodfromserver, join);



        let endApiTime = Date.now();
        logData.apiResponseTime = `${endApiTime - startApiTime}ms`;

        if (!newPeriodData) {
            console.error("No new period received. Aborting function.");
            return;
        }

        let { newPeriod, resultAmount, attempts, hashvalue, blockNumber } = newPeriodData;

        logData.periodFromAPI = newPeriod;

        if (newPeriod && period == newPeriod) {

            newPeriod = (BigInt(newPeriod) + BigInt(1)).toString();

        }

        logData.newPeriod = newPeriod;
        logData.resultAmount = resultAmount;
        logData.attempts = attempts;

        ////console.log("New Period:", newPeriod);

        // Process the nextResult logic
        let newArr = "";
        
        const [minPlayers] = await connection.query(`
            SELECT COUNT(*) AS count
            FROM minutes_1
            WHERE status = 0 AND game = ?
        `, [join]);
        
        
        //  const [minPlayers] = await connection.query(`
        //     SELECT SUM(money) AS count
        //     FROM minutes_1
        //     WHERE status = 0 AND game = ?
        // `, [join]);
        
        
        if (minPlayers[0].count > 0) {
            
            if (setting[0].website_mode == 1) {
                resultAmount = await defineresult(11);
            }
        //    resultAmount = await defineresult(11)
            
        }
        
        if (nextResult === "-1") {
            await connection.execute(
                `UPDATE wingo SET amount = ?, hashvalue = ?, blocs = ?, status = ? WHERE period = ? AND game = ?`, [resultAmount, hashvalue, blockNumber, 1, period, join]
            );
            newArr = "-1";
        } else {
            let arr = nextResult.split("|");
            newArr = arr.length === 1 ? "-1" : arr.slice(1).join("|");

            await connection.execute(
                `UPDATE wingo SET amount = ?, hashvalue = ?, blocs = ?, status = ? WHERE period = ? AND game = ?`, [Number(arr[0]), hashvalue, blockNumber, 1, period, join]
            );
        }

        // Update the previous period status
        await connection.execute(
            `UPDATE wingo SET status = ? WHERE period != ? AND game = ?`, [1, newPeriod, join]
        );

        // Insert new period data
        await connection.execute(
            `INSERT INTO wingo (period, amount, game, status, hashvalue, blocs, time) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [String(newPeriod), 0, join, 0, generateRandomHash(10), 50, checkTime2]
        );

        // Update admin settings
        await connection.execute(`UPDATE admin SET ${join} = ?`, [newArr]);

        logData.functionEndTime = new Date().toLocaleString();

        // Save log to file
        fs.appendFileSync(logFilePath_11, JSON.stringify(logData, null, 2) + '\n\n', 'utf8');
        // //console.log("Log saved:", logData);
    } catch (error) {
        console.error("Error in addWinGo_110:", error);
        //fs.appendFileSync(logFilePath_11, `Error: ${error.message}\n\n`, 'utf8');
    }
};



const defineresult = async (game) => {
    try {
        const gameMappings = {
            1: { join: 'wingo', updatenum: 1 },
            3: { join: 'wingo3', updatenum: 2 },
            5: { join: 'wingo5', updatenum: 3 },
            10: { join: 'wingo10', updatenum: 4 },
            11: { join: 'trx', updatenum: 3 },
            33: { join: 'trx3', updatenum: 4 },
            55: { join: 'trx5', updatenum: 5 },
            100: { join: 'trx10', updatenum: 6 }
        };

        const { join, updatenum } = gameMappings[game] || {};
        if (!join) throw new Error('Invalid game type provided');

        if (typeof join === "undefined") {
            console.error("Error: 'join' parameter is undefined.");
            return;
        }

        const [winGoNow] = await connection.query(
            `SELECT period FROM wingo WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1`, 
            [join]
        );

        if (!winGoNow.length) {
            return Math.floor(Math.random() * 10); // Return random number 0 to 9 if no data found
        }

        const period = winGoNow[0]?.period;

        const betColumns = [
            { name: 'red_small', bets: ['0', '2', '4', 'd', 'n'] },
            { name: 'red_big', bets: ['6', '8', 'd', 'l'] },
            { name: 'green_big', bets: ['5', '7', '9', 'x', 'l'] },
            { name: 'green_small', bets: ['1', '3', 'x', 'n'] },
            { name: 'violet_small', bets: ['0', 't', 'n'] },
            { name: 'violet_big', bets: ['5', 't', 'l'] }
        ];

        shuffleArrayInPlace(betColumns);

        const categories = await Promise.all(betColumns.map(async column => {
            const [result] = await connection.query(
                `SELECT SUM(money) AS total_money
                 FROM minutes_1
                 WHERE game = ? AND status = 0 AND isdemo = 0 AND bet IN (${column.bets.map(bet => `"${bet}"`).join(',')})`,
                [join]
            );
            return { name: column.name, total_money: parseInt(result[0]?.total_money) || 0 };
        }));

        shuffleArrayInPlace(categories);

        const smallestCategory = categories.reduce((smallest, category) =>
            (!smallest || category.total_money < smallest.total_money) ? category : smallest
        );

        const [color, size] = smallestCategory.name.split('_');
        const availableBets = betColumns.find(col => col.name === `${color}_${size}`)?.bets || [];
        const validBets = availableBets.filter(bet => !isNaN(parseInt(bet, 10)));

        const randomIndex = Math.floor(Math.random() * validBets.length);

        let amount = parseInt(validBets[randomIndex], 10);

        return amount;

    } catch (error) {
        console.error("Error in defineresult:", error);
    }
};

const fetchLatestWingo3Data = async () => {
    const ts = Date.now();
    const apiUrl = `https://draw.ar-lottery01.com/WinGo/WinGo_3M/GetHistoryIssuePage.json?ts=${ts}`;
    const headers = {
        accept: "application/json, text/plain, */*"
    };

    let attempts = 0;
    const maxApiRetries = 3;
    const apiTimeout = 5000;

    while (attempts < maxApiRetries) {
        try {
            const startTime = Date.now();
            const response = await axios.get(apiUrl, { headers, timeout: apiTimeout });
            const endTime = Date.now();

            if (endTime - startTime > apiTimeout) {
                attempts++;
                continue;
            }

            const latest = response.data.data.list[0];
            return {
                period: latest.issueNumber,
                amount: latest.number
            };
        } catch (error) {
            attempts++;
            console.error(`API call failed (Attempt ${attempts}):`, error.message);
            if (attempts >= maxApiRetries) throw new Error("API failed after maximum retries");
        }
    }
};

let lastCallTime_3 = 0;
const lockDuration_3 = 5000; // 5 seconds

const addWinGo_3 = async () => {
    try {
        const currentTime = Date.now();
        if (currentTime - lastCallTime_3 < lockDuration_3) return;
        lastCallTime_3 = currentTime;

        const join = "wingo3";
        const checkTime2 = timerJoin2(Date.now());

        const [winGoNow] = await connection.query(`
            SELECT period FROM wingo WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1
        `, [join]);

        let period = winGoNow.length > 0 ? winGoNow[0].period : "98778990";
        const [setting] = await connection.query('SELECT * FROM `admin`');

        let amount = Math.floor(Math.random() * 10);

        const [minPlayers] = await connection.query(`
            SELECT COUNT(*) AS count FROM minutes_1 WHERE status = 0 AND game = ?
        `, [join]);

        // Decide amount based on player count and mode
        if (minPlayers[0].count > 0) {
            if (setting[0].website_mode == 1) {
                amount = await defineresult(3);
            } else {
                const latestData = await fetchLatestWingo3Data();
                period = latestData.period;
                amount = latestData.amount;
            }
        } else {
            const latestData = await fetchLatestWingo3Data();
            period = latestData.period;
            amount = latestData.amount;
        }

        let nextResult = setting[0].wingo3;
        let newArr = '';

        if (nextResult === '-1') {
            await connection.execute(`
                UPDATE wingo SET amount = ?, status = ? WHERE period = ? AND game = ?
            `, [amount, 1, period, join]);
            newArr = '-1';
        } else {
            let arr = nextResult.split('|');
            let result = arr[0];
            newArr = arr.length > 1 ? arr.slice(1).join('|') : '-1';

            await connection.execute(`
                UPDATE wingo SET amount = ?, status = ? WHERE period = ? AND game = ?
            `, [Number(result), 1, period, join]);
        }

        const newPeriod = BigInt(period) + BigInt(1);
        const blockHeight = 50; // Default block height increment

        await connection.execute(`
            INSERT INTO wingo SET period = ?, amount = ?, game = ?, status = ?, hashvalue = ?, blocs = ?, time = ?
        `, [String(newPeriod), 0, join, 0, generateRandomHash(10), blockHeight, checkTime2]);

        await connection.execute(`UPDATE admin SET ${join} = ?`, [newArr]);

    } catch (error) {
        console.error("addWinGo_3 error:", error.message);
    }
};






const fetchLatestWingo5Data = async () => {
    const ts = Date.now();
    const apiUrl = `https://draw.ar-lottery01.com/WinGo/WinGo_5M/GetHistoryIssuePage.json?ts=${ts}`;
    const headers = {
        accept: "application/json, text/plain, */*"
    };

    let attempts = 0;
    const maxApiRetries = 3;
    const apiTimeout = 5000;

    while (attempts < maxApiRetries) {
        try {
            const startTime = Date.now();
            const response = await axios.get(apiUrl, { headers, timeout: apiTimeout });
            const endTime = Date.now();

            if (endTime - startTime > apiTimeout) {
                attempts++;
                continue;
            }

            const latest = response.data.data.list[0];
            return {
                period: latest.issueNumber,
                amount: latest.number
            };
        } catch (error) {
            attempts++;
            console.error(`API call failed (Attempt ${attempts}):`, error.message);
            if (attempts >= maxApiRetries) throw new Error("API failed after maximum retries");
        }
    }
};


let lastCallTime_5 = 0;
const lockDuration_5 = 5000;


const addWinGo_5 = async () => {
    try {
        const currentTime = Date.now();
        if (currentTime - lastCallTime_5 < lockDuration_5) return;
        lastCallTime_5 = currentTime;

        const join = "wingo5";
        const checkTime2 = timerJoin2(Date.now());

        const [winGoNow] = await connection.query(`
            SELECT period FROM wingo WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1
        `, [join]);

        let period = winGoNow.length > 0 ? winGoNow[0].period : "98778990";
        const [setting] = await connection.query('SELECT * FROM `admin`');

        let amount = Math.floor(Math.random() * 10);

        const [minPlayers] = await connection.query(`
            SELECT COUNT(*) AS count FROM minutes_1 WHERE status = 0 AND game = ?
        `, [join]);

        if (minPlayers[0].count > 0) {
            if (setting[0].website_mode == 1) {
                amount = await defineresult(5);
            } else {
                const latest = await fetchLatestWingo5Data();
                period = latest.period;
                amount = latest.amount;
            }
        } else {
            const latest = await fetchLatestWingo5Data();
            period = latest.period;
            amount = latest.amount;
        }

        let nextResult = setting[0].wingo5;
        let newArr = "";

        if (nextResult === "-1") {
            await connection.execute(`
                UPDATE wingo SET amount = ?, status = ? WHERE period = ? AND game = ?
            `, [amount, 1, period, join]);
            newArr = "-1";
        } else {
            const arr = nextResult.split("|");
            const result = arr[0];
            newArr = arr.length > 1 ? arr.slice(1).join("|") : "-1";

            await connection.execute(`
                UPDATE wingo SET amount = ?, status = ? WHERE period = ? AND game = ?
            `, [Number(result), 1, period, join]);
        }

        const newPeriod = BigInt(period) + BigInt(1);
        const blockHeight = 50;

        await connection.execute(`
            INSERT INTO wingo SET 
                period = ?, amount = ?, game = ?, status = ?, hashvalue = ?, blocs = ?, time = ?
        `, [String(newPeriod), 0, join, 0, generateRandomHash(10), blockHeight, checkTime2]);

        await connection.execute(`UPDATE admin SET ${join} = ?`, [newArr]);

    } catch (error) {
        console.error("addWinGo_5 error:", error.message);
    }
};






module.exports = {
  winGoPage,
  betWinGo,
  listOrderOld,
  GetMyEmerdList,
  handlingWinGo1P,
  //addWinGo,
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
  addWinGo_11
};

