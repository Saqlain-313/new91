import connection from "../config/connectDB";
import jwt from "jsonwebtoken";
import md5 from "md5";
import axios from "axios"
import { exit } from "process";
const ExcelJS = require("exceljs");
const fs = require("fs");

const XLSX = require("xlsx");

const path = require("path");

require("dotenv").config();

let timeNow = Date.now();

const depositePage = async (req, res) => {
  return res.render("manage/liveChatPages/depositeNotReceive.ejs");
};

const withdrawalPage = async (req, res) => {
  return res.render("manage/liveChatPages/withdrawalProblem.ejs");
};

const changeloginIdPass = async (req, res) => {
  return res.render("manage/liveChatPages/changeIdLoginPassword.ejs");
};

const modifyBankInfo = async (req, res) => {
  return res.render("manage/liveChatPages/modifyBankInfo.ejs");
};

const usdtaddress = async (req, res) => {
  return res.render("manage/liveChatPages/usdtAddress.ejs");
};

const activityBonus = async (req, res) => {
  return res.render("manage/liveChatPages/activityBonus.ejs");
};

const gameProblems = async (req, res) => {
  return res.render("manage/liveChatPages/gameProblems.ejs");
};


const livePage = async (req, res) => {
  return res.render("manage/livechat.ejs");
};

const adminPage = async (req, res) => {
  return res.render("manage/index.ejs");
};

const adminPage3 = async (req, res) => {
  return res.render("manage/a-index-bet/index3.ejs");
};

const adminPage5 = async (req, res) => {
  return res.render("manage/a-index-bet/index5.ejs");
};

const adminPage10 = async (req, res) => {
  return res.render("manage/a-index-bet/index10.ejs");
};

const admintrxPage = async (req, res) => {
  return res.render("manage/trx.ejs");
};

const admintrxPage3 = async (req, res) => {
  return res.render("manage/a-index-bet/trx3.ejs");
};

const admintrxPage5 = async (req, res) => {
  return res.render("manage/a-index-bet/trx5.ejs")
};

const admintrxPage10 = async (req, res) => {
  return res.render("manage/a-index-bet/trx10.ejs");
};

const adminPage5d = async (req, res) => {
  return res.render("manage/5d.ejs");
};

const adminPageK3 = async (req, res) => {
  return res.render("manage/k3.ejs");
};

const ctvProfilePage = async (req, res) => {
  var phone = req.params.phone;
  return res.render("manage/profileCTV.ejs", { phone });
};

const giftPage = async (req, res) => {
  return res.render("manage/giftPage.ejs");
};

const membersPage = async (req, res) => {
  return res.render("manage/members.ejs");
};

const ctvPage = async (req, res) => {
  return res.render("manage/ctv.ejs");
};

const infoMember = async (req, res) => {
  let phone = req.params.id;
  return res.render("manage/profileMember.ejs", { phone });
};

const statistical = async (req, res) => {
  let data = req.query.datechoice ? req.query.datechoice : null;
  return res.render("manage/statistical.ejs", { data });
};

const rechargePage = async (req, res) => {
  return res.render("manage/recharge.ejs");
};

const rechargeAllPage = async (req, res) => {
  return res.render("manage/all.ejs");
};
const rechargeFailPage = async (req, res) => {
  return res.render("manage/fail.ejs");
};
const rechargePandingPage = async (req, res) => {
  return res.render("manage/panding.ejs");
};
const rechargeSuccessPage = async (req, res) => {
  return res.render("manage/success.ejs");
};

const rechargeRecord = async (req, res) => {
  return res.render("manage/rechargeRecord.ejs");
};
const turnover = async (req, res) => {
  return res.render("manage/turnover.ejs");
};
const betting = async (req, res) => {
  return res.render("manage/betting.ejs");
};

const todayreport = async (req, res) => {
  return res.render("manage/todayreport.ejs");
};

const withdraw = async (req, res) => {
  return res.render("manage/withdraw.ejs");
};

const withdrawRecord = async (req, res) => {
  return res.render("manage/withdrawRecord.ejs");
};

const withdrawsuccess = async (req, res) => {
  return res.render("manage/withdrawalsuccess.ejs");
};
const withdrawfail = async (req, res) => {
  return res.render("manage/withdrawalfail.ejs");
};





const settings = async (req, res) => {
  return res.render("manage/settings.ejs");
};
const demouser = async (req, res) => {
  return res.render("manage/demoaccount.ejs");
};
const notificationPage = async (req, res) => {
  return res.render("manage/createNotification.ejs");
};

const userlevelPage = async (req, res) => {
  return res.render("manage/userlevel.ejs");
};

const userlevelAllPage = async (req, res) => {
  return res.render("manage/userlevelAll.ejs");
};

const bannerPage = async (req, res) => {
  return res.render("manage/banner.ejs");
};
const activitybannerPage = async (req, res) => {
  return res.render("manage/activitybanner.ejs");
};
const logoSettingPage = async (req, res) => {
  return res.render("manage/logoSetting.ejs");
};
const chennalSettingPage = async (req, res) => {
  return res.render("manage/chennalSetting.ejs");
};

const promotionsPage = async (req, res) => {
  return res.render("manage/promotions.ejs");
};


const attendencebonesPage = async (req, res) => {
  return res.render("manage/newfiles/attendencebonce.ejs");
};

const SignupBonespage = async (req, res) => {
  return res.render("manage/newfiles/signupbones.ejs");
};


const agentperformancepage = async (req, res) => {
  return res.render("manage/newfiles/agentperformance.ejs");

  
};



const iprecord = async (req, res) => {
  return res.render("manage/newfiles/iprecord.ejs");
};
const topperformance = async (req, res) => {
  return res.render("manage/newfiles/topperformance.ejs");
};
const apitransaction = async (req, res) => {
  return res.render("manage/newfiles/apitransaction.ejs");
};
const createuser = async (req, res) => {
  return res.render("manage/newfiles/createuser.ejs");
};



const adminCarPage = async (req, res) => {
  return res.render("manage/carIndex.ejs");
};

const adminCarPage3 = async (req, res) => {
  return res.render("manage/a-index-bet/carIndex3.ejs");
};

const adminCarPage5 = async (req, res) => {
  return res.render("manage/a-index-bet/carIndex5.ejs");
};

const adminCarPage10 = async (req, res) => {
  return res.render("manage/a-index-bet/carIndex10.ejs");
};


const manualwithdraw = async (req, res) => {
  return res.render("manage/manualwithdraw.ejs");
};


// xác nhận admin
const middlewareAdminController = async (req, res, next) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) {
      return res.redirect("/admin/login");
    }

    const [rows] = await connection.execute(
      "SELECT `id`, `token`,`phone`, `level`, `status` FROM `users` WHERE `token` = ? AND veri = 1",
      [auth]
    );

    if (!rows.length) {
      return res.redirect("/admin/login");
    }

    const user = rows[0];

    if (user.token !== auth || user.status !== 1) {
      return res.redirect("/admin/login");
    }

    if (
      req.originalUrl.startsWith("/api/webapi") ||
      req.originalUrl.startsWith("/webapi")
    ) {
      return next();
    }

    const [permissions] = await connection.execute(
      "SELECT `permission_key`, `permission_value` FROM `user_permissions` WHERE `user_id` = ?",
      [user.phone]
    );

    const userPermissions = permissions.reduce((acc, row) => {
      acc[row.permission_key] = row.permission_value === 1 ? "1" : "0";
      return acc;
    }, {});

    const routePermissions = {
      "/admin/manager/Home": "Home",
      "/admin/manager/createsubpanel": "Create SubPanel",
      "/admin/manager/FirstDepositBonus": "First Deposit Bonus",
      "/admin/manager/InvitationBonus": "Invitation Bonus",
      "/admin/manager/lives": "Live Chat",
      "/admin/manager/index": "Wingo",
      "/admin/manager/trx": "TRX",
      "/admin/manager/5d": "5D",
      "/admin/manager/k3": "K3",
      "/admin/manager/Supportsection": "Support Tickets",
      "/admin/manager/spinwheel": "Spin Wheel",
      "/admin/manager/llegaltrade": "Illegal Trade",
      "/admin/manager/profitloss": "Profit & Loss",
      "/admin/manager/members": "Member",
      "/admin/manager/userlevel": "User Level",
       "/admin/manager/userlevelAll": "User Level All",
      "/admin/manager/ctv": "Agents",
       "/admin/manager/demouser": "demouser",
      "/admin/manager/CreatedSalaryRecord": "Created Salary",
      "/admin/manager/levelSetting": "Level Setting",
      "/admin/manager/statistical": "Business Manage",
      "/admin/manager/recharge": "Pending Recharge",
      "/admin/manager/withdraw": "Pending Withdrawal",
      "/admin/manager/rechargeRecord": "Recharge (Approved)",
      "/admin/manager/allrecharge": "Recharge (Approved)",
      "/admin/manager/successrecharge": "Recharge (Approved)",
      "/admin/manager/pandingrecharge": "Pending Recharge",
      "/admin/manager/failrecharge": "Recharge (Approved)",
      "/admin/manager/withdrawRecord": "Withdrawal (Approved)",
      "/admin/manager/turnover": "Turnover Report",
      "/admin/manager/betting": "Betting History",
      "/admin/manager/today_report": "Today Report",
      "/admin/manager/createBonus": "Create Giftcode",
      "/admin/manager/settings": "Settings",
      "/admin/manager/motobike":"Moto bike"
      
    };

    const requiredPermission = routePermissions[req.originalUrl];

    if (requiredPermission && userPermissions[requiredPermission] != 1) {
      const fallbackPath = Object.keys(routePermissions).find(
        (path) => userPermissions[routePermissions[path]] == 1
      );
      return fallbackPath
        ? res.redirect(fallbackPath)
        : res.status(403).json({ success: false, message: "Access denied" });
    }

    next();
  } catch (error) {
    console.error("Middleware error:", error);
    return res.redirect("/admin/login");
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

const getCurrentDate = (params = "", addHours = 0) => {
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
  )}`;

  return formattedDate;
};

const rechargeCallback = async (req, res) => {
  let orderids = req.body.client_txn_id;
  const parts = orderids.split("_");
  const orderid = parts[0];
  let status = req.body.status;
  console.log(orderid, status);
  try {
    if (status == "success") {
      await ConfirmRecharge(orderid, function (data) {
        res.status(200).json(data);
      });
    } else if (status !== "success") {
      await connection.query(`UPDATE recharge SET status = 2 WHERE id = ?`, [
        orderid,
      ]);
      res.status(200).json({ status: "Error By Response" });
    }
  } catch (e) {
    console.log({ status: e });
    res.status(200).json({ status: "By Response code", res: e });
  }
  //     await CheckCashfreeStatus(orderid, async function(response) {
  //         response = JSON.parse(response);
  //         console.log(response.customer_details.customer_id);
  //         id = parseInt(response.customer_details.customer_id);
  //         if (response.order_status === "PAID") {
  //             await ConfirmRecharge(id);
  //         } else if (response.order_status !== "ACTIVE") {
  //             await connection.query(`UPDATE recharge SET status = 2 WHERE id = ?`, [id]);
  //         }
  //     });
  //     // return res.status(200).json({"status": id});
  //     res.redirect("/");
};
const AgentCommission = async (req, res) => {
  try {
    const outerQueryResult = await connection.query(
      "SELECT * FROM users WHERE `level` = 2 ",
      []
    );
    for (const item of outerQueryResult[0]) {
      let sum = 0;
      if (item.phone) {
        const innerQueryResult = await connection.query(
          "SELECT users.*, SUM(minutes_1.money) AS total_betting FROM users LEFT JOIN minutes_1 ON minutes_1.phone = users.phone WHERE `ctv` = ? GROUP BY users.phone",
          [item.phone]
        );
        if (innerQueryResult[0].length > 0) {
          for (const item1 of innerQueryResult[0]) {
            if (
              item1.total_betting != null &&
              item1.total_betting > 0 &&
              item1.total_betting != ""
            ) {
              sum = sum + item1.total_betting;
            }
          }
        }
      }
      if (sum > 0) {
        let checkTime = timerJoin2(Date.now());
        let finalPercentange = sum * 0.01;
        let sql = `INSERT INTO transaction SET
                purpose = ?,
                phone = ?,
                money = ?,
                type = ?,
                status = ?,
                level = ?,
                today = ?,
                time = ?`;

        await connection.execute(sql, [
          "agent_commission",
          item.phone,
          finalPercentange,
          "credit",
          1,
          1,
          checkTime,
          checkTime,
        ]);
        // await connection.query('UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ? ', [finalPercentange, finalPercentange, item.phone]);
      }
    }
    return res.status(200).json("Success");
  } catch (e) {
    return res.status(500).json({ error: "Outer query error" });
  }
};

const totalJoin = async (req, res) => {
    try{
  let auth = req.cookies.auth;
  let typeid = req.body.typeid;
  if (!typeid) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let game = "";
  if (typeid == "1") game = "wingo";
  if (typeid == "2") game = "wingo3";
  if (typeid == "3") game = "wingo5";
  if (typeid == "4") game = "wingo10";
  if (typeid == "11") game = "trx";
  if (typeid == "22") game = "trx3";
  if (typeid == "33") game = "trx5";
  if (typeid == "44") game = "trx10";

  const [rows] = await connection.query(
    "SELECT * FROM users WHERE `token` = ? ",
    [auth]
  );

  if (rows.length > 0) {
    const [wingoall] = await connection.query(
      `SELECT * FROM minutes_1 WHERE game = "${game}" AND status = 0 AND isdemo = 0 ORDER BY id ASC `,
      [game]
    );
    const [winGo1] = await connection.execute(
      `SELECT * FROM wingo WHERE status = 0  AND game = '${game}' ORDER BY id DESC LIMIT 1 `,
      []
    );
    const [winGo10] = await connection.execute(
      `SELECT * FROM wingo WHERE status != 0  AND game = '${game}' ORDER BY id DESC LIMIT 10 `,
      []
    );
    const [setting] = await connection.execute(`SELECT * FROM admin `, []);

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: wingoall,
      lotterys: winGo1,
      list_orders: winGo10,
      setting: setting,
      timeStamp: timeNow,
      game,
    });
  } else {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };


const totalJoinRacing = async (req, res) => {
    try{
  let auth = req.cookies.auth;
  let typeid = req.body.typeid;
  if (!typeid) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let game = "";
  if (typeid == "1") game = "cargame";
  if (typeid == "2") game = "cargame3";
  if (typeid == "3") game = "cargame5";
  if (typeid == "4") game = "cargame10";

  const [rows] = await connection.query(
    "SELECT * FROM users WHERE `token` = ? ",
    [auth]
  );

  if (rows.length > 0) {
    const [wingoall] = await connection.query(
      `SELECT * FROM cargame_result WHERE game = "${game}" AND status = 0 AND isdemo = 0 ORDER BY id ASC `);
    

    const [winGo1] = await connection.execute(
      `SELECT * FROM cargame WHERE status = 0  AND game = '${game}' ORDER BY id DESC LIMIT 1 `,
      []
    );
    const [winGo10] = await connection.execute(
      `SELECT * FROM cargame WHERE status != 0  AND game = '${game}' ORDER BY id DESC LIMIT 10 `,
      []
    );
    const [setting] = await connection.execute(`SELECT * FROM admin `, []);

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: wingoall,
      lotterys: winGo1,
      list_orders: winGo10,
      setting: setting,
      timeStamp: timeNow,
      game,
    });
  } else {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };

const listMember = async (req, res) => {
  let { pageno, limit, value, status } = req.body;

  // Check if pageno and limit are provided
  if (!pageno || !limit || pageno < 0 || limit < 0) {
    return res.status(200).json({
      code: 0,
      msg: "Invalid pagination parameters",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  try {
    // Build the SQL query based on provided parameters
    let query = `SELECT * FROM users WHERE isdemo=0 AND veri = 1 AND level != 2`;
    if (value) {
      query += ` AND (phone LIKE "%${value}%" OR id_user LIKE "%${value}%" OR id LIKE "%${value}%")`;
    }
    if (status) {
      query += ` AND status = ${status}`;
    }
    query += ` ORDER BY id DESC LIMIT ${pageno}, ${limit}`;

    // Execute the query to fetch users for the current page
    const [users] = await connection.query(query);

    // Execute a separate query to get the total count of users (for pagination)
    const [total_users] = await connection.query(
      `SELECT COUNT(*) as total FROM users WHERE veri = 1 AND level != 2`
    );

    // Calculate total pages based on the total count of users and limit
    const total_pages = Math.ceil(total_users[0].total / limit);

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: users,
      page_total: total_pages,
    });
  } catch (e) {
    res.send(e.message);
  }
};

const settingdemo = async (req, res) => {
 
  let { username, password } = req.body;
  let auth = req.cookies.auth;

  let name_user = "Member" + randomNumber(10000, 99999);
  let code =  randomNumber(10000, 99999);
  let ip = ipAddress(req);
  let time = timeCreate();
  try {
    const [user] = await connection.query(
      "SELECT * FROM users WHERE token = ? ",
      [auth]
    );

    if (user.length == 0) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    let userInfo = user[0];

   let invitecode = "k9jijhuk";

    // //console.log("invitecode", invitecode);

    if (!username || !password ) {
      return res.status(200).json({
        message: "ERROR!!!",
        status: false,
      });
    }

    if (!username) {
      return res.status(200).json({
        message: "phone error",
        status: false,
      });
    }

    const [check_u] = await connection.query(
      "SELECT * FROM users WHERE phone = ? ",
      [username]
    );
      const [rows] = await connection.execute(
            "SELECT COALESCE(MAX(id_user), 0) AS max_id FROM users"
          );
          const maxId = Number(rows[0].max_id); // Convert to number
          const id_user = maxId + 1; // Add 1
          
    if (check_u.length == 1) {
      return res.status(200).json({
        message: "register account", //Số điện thoại đã được đăng ký
        status: false,
      });
    } else {
      const sql = `INSERT INTO users SET 
            id_user = ?,
            token=?,
            phone = ?,
            name_user = ?,
            password = ?,
            money = ?,
            level = ?,
            code = ?,
            invite = ?,
            veri = ?,
            ip_address = ?,
            status = ?,
              time = ?,
              isdemo=?
              `;
      await connection.execute(sql, [
        id_user,
        username,
        username,
        name_user,
        md5(password),
        0,
        0,
        code+id_user,
        invitecode,
        1,
        ip,
        1,
        time,
        1
      ]);
      await connection.execute(
        "INSERT INTO point_list SET phone = ?, level = 2",
        [username]
      );
      return res.status(200).json({
        message: "registration success", //Register Sucess
        status: true,
      });
    }
  } catch (error) {
    // console.log(error);
    return res.status(200).json({
      message: error, //Register Sucess
      status: true,
    });
    if (error) console.log(error);
  }
 
 
 
 
};

const settingneed = async (req, res) => {
    try{
  // let auth = req.cookies.auth;
  let { id_user, money_value } = req.body;
  // let buff_acc = req.body.buff_acc;
  // let money_value = req.body.money_value;

  //console.log("body7", req.body);
  if (!id_user || !money_value) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [user_id] = await connection.query(
    `SELECT * FROM users WHERE id_user = ?`,
    [id_user]
  );

  if (user_id.length > 0) {
    // if (buff_acc == "1") {
    await connection.query(`UPDATE users SET recharge = ? WHERE id_user = ?`, [
      money_value,
      id_user,
    ]);
    // }
    // if (buff_acc == "2") {
    //   await connection.query(
    //     `UPDATE users SET recharge = recharge - ? WHERE id_user = ?`,
    //     [money_value, id_user]
    //   );
    // }
    return res.status(200).json({
      message: "Successful change",
      status: true,
    });
  } else {
    return res.status(200).json({
      message: "Successful change",
      status: false,
    });
  }

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };

const FindTBettingByinvite = async (invite) => {
    try{
  let Total = 0;

  let currlevel = [{ code: invite }];

  for (let i = 0; i < 10; i++) {
    let arra = [];
    const promises = currlevel.map(async (user) => {
      const result = await connection.query(
        "SELECT users.*, COALESCE(SUM(minutes_1.money), 0) AS total_betting FROM users LEFT JOIN minutes_1 ON users.phone = minutes_1.phone WHERE users.invite = ? GROUP BY users.phone",
        [user.code]
      );

      result[0].forEach((userData) => {
        Total += parseFloat(userData.total_betting);
        arra.push(userData);
      });
    });
    await Promise.all(promises);
    currlevel = arra;
  }

  return Total;

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };


const listCTV = async (req, res) => {
    try{
  let { pageno, pageto } = req.body;

  if (!pageno || !pageto) {
    return res.status(200).json({
      code: 0,
      msg: "Không còn dữ liệu",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (pageno < 0 || pageto < 0) {
    return res.status(200).json({
      code: 0,
      msg: "Không còn dữ liệu",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }
  const [wingo] = await connection.query(
    `SELECT users.* FROM users WHERE veri = 1 AND level = 2 ORDER BY id DESC LIMIT ${pageno}, ${pageto} `
  );
  let wingos = [];

  // Use map to create a new array with 'total_betting' property
  wingos = await Promise.all(
    wingo.map(async (user) => {
      const totalBetting = await FindTBettingByinvite(user.code);
      return { ...user, total_betting: totalBetting };
    })
  );

  // Now 'wingos' contains all data from 'wingo' with 'total_betting' property
  console.log(wingos);

  return res.status(200).json({
    message: "Success",
    status: true,
    datas: wingos,
  });

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };

function formateT2(params) {
  let result = params < 10 ? "0" + params : params;
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

  const formattedDate = `${getPart("year")}-${getPart("month")}-${getPart(
    "day"
  )}`;

  return formattedDate;
}

const statistical2 = async (req, res) => { 
    try{
  let datefil = req.body.today == "" ? false : req.body.today;

  let time = timerJoins(Date.now());

  const [wingo] = await connection.query(
    `SELECT SUM(money) as total,COUNT(id) as count FROM minutes_1 WHERE status = 1  AND isdemo=0`
  );
  const [wingo2] = await connection.query(
    `SELECT SUM(money) as total,COUNT(id) as count FROM minutes_1 WHERE status = 2  AND isdemo=0`
  );
  const [users] = await connection.query(
    `SELECT COUNT(id) as total FROM users WHERE status = 1 `
  );
  const [users2] = await connection.query(
    `SELECT COUNT(id) as total FROM users WHERE status = 2 `
  );
  const [recharge] = await connection.query(
    `SELECT SUM(money) as total FROM recharge WHERE type != "demo" AND status = 1 AND isdemo=0 `
  );
  const [pendigrecharge] = await connection.query(
    `SELECT SUM(money) as total FROM recharge WHERE type != "demo" AND status = 0 AND isdemo=0 `
  );
  const [withdraw] = await connection.query(
    `SELECT SUM(money) as total FROM withdraw WHERE status = 1  AND isdemo=0`
  );
  const [pendigwithdraw] = await connection.query(
    `SELECT SUM(money) as total FROM withdraw WHERE status = 0  AND isdemo=0`
  );
  const [bet] = await connection.query(
    `SELECT SUM(money) as total FROM minutes_1`,
    []
  );
  const [pl] = await connection.query(
    `SELECT SUM(\`money\` - \`get\`) as total FROM minutes_1`,
    []
  );
  //  }
  const [recharge_today] = await connection.query(
    `SELECT SUM(money) as total FROM recharge WHERE type != "demo" AND status = 1 AND date(today) = ? AND isdemo=0`,
    [!datefil ? time : datefil]
  );
  const [bet_today] = await connection.query(
    `SELECT SUM(money) as total FROM minutes_1 WHERE date(today) = ? AND isdemo=0`,
    [!datefil ? time : datefil]
  );
  const [pl_today] = await connection.query(
    `SELECT SUM(\`money\` - \`get\`) as total FROM minutes_1 WHERE date(today) = ? AND isdemo=0`,
    [!datefil ? time : datefil]
  );
  const [withdraw_today] = await connection.query(
    `SELECT SUM(money) as total FROM withdraw WHERE status = 1 AND date(today) = ? AND isdemo=0`,
    [!datefil ? time : datefil]
  );

  let win = wingo[0].total;
  let wincount = wingo[0].count;
  let loss = wingo2[0].total;
  let losscount = wingo2[0].count;
  let usersOnline = users[0].total;
  let usersOffline = users2[0].total;
  let recharges = recharge[0].total;
  let pendigrecharges = pendigrecharge[0].total;
  let withdraws = withdraw[0].total;
  let pendigwithdraws = pendigwithdraw[0].total;
  return res.status(200).json({
    message: "Success",
    status: true,
    win: win,
    wincount: wincount,
    loss: loss,
    losscount: losscount,
    usersOnline: usersOnline,
    usersOffline: usersOffline,
    recharges: recharges,
    pendigrecharges: pendigrecharges,
    betToday: bet_today[0].total,
    bet: bet[0].total,
    withdraws: withdraws,
    pendigwithdraws: pendigwithdraws,
    rechargeToday: recharge_today[0].total,
    withdrawToday: withdraw_today[0].total,
    pltoday: pl_today[0].total,
    pl: pl[0].total,
    time: time,
  });

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };

const changeAdmin = async (req, res) => {
    try{
  let auth = req.cookies.auth;
  let value = req.body.value;
  let type = req.body.type;
  let typeid = req.body.typeid;

  if (!value || !type || !typeid)
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  let game = "";
  let bs = "";
  if (typeid == "1") {
    game = "wingo";
    bs = "bs1";
  }
  if (typeid == "2") {
    game = "wingo3";
    bs = "bs3";
  }
  if (typeid == "3") {
    game = "wingo5";
    bs = "bs5";
  }
  if (typeid == "4") {
    game = "wingo10";
    bs = "bs10";
  }
  if (typeid == "11") {
    game = "trx";
    bs = "bs1";
  }
  if (typeid == "22") {
    game = "trx3";
    bs = "bs3";
  }
  if (typeid == "33") {
    game = "trx5";
    bs = "bs5";
  }
  if (typeid == "44") {
    game = "trx0";
    bs = "bs10";
  }
  switch (type) {
    case "change-wingo1":
      await connection.query(`UPDATE admin SET ${game} = ? `, [value]);
      return res.status(200).json({
        message: "Editing results successfully",
        status: true,
        timeStamp: timeNow,
      });
      break;
    case "change-win_rate":
      await connection.query(`UPDATE admin SET ${bs} = ? `, [value]);
      return res.status(200).json({
        message: "Editing win rate successfully",
        status: true,
        timeStamp: timeNow,
      });
      break;

    default:
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
      break;
  }

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };


const changeAdminRacing = async (req, res) => {
    try{
  let auth = req.cookies.auth;
  let value = req.body.value;
  let type = req.body.type;
  let typeid = req.body.typeid;
  
  //console.log("valuechange",value)

  if (!value || !type || !typeid)
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  let game = "";
  let bs = "";
  if (typeid == "1") {
    game = "cargame";
    bs = "bs1";
  }
  if (typeid == "2") {
    game = "cargame3";
    bs = "bs3";
  }
  if (typeid == "3") {
    game = "cargame5";
    bs = "bs5";
  }
  if (typeid == "4") {
    game = "cargame10";
    bs = "bs10";
  }

  switch (type) {
    case "change-wingo1":
      await connection.query(`UPDATE admin SET ${game} = ? `, [value]);
      return res.status(200).json({
        message: "Editing results successfully",
        status: true,
        timeStamp: timeNow,
      });
      break;
    case "change-win_rate":
      await connection.query(`UPDATE admin SET ${bs} = ? `, [value]);
      return res.status(200).json({
        message: "Editing win rate successfully",
        status: true,
        timeStamp: timeNow,
      });
      break;

    default:
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
      break;
  }

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };



function formateT(params) {
  let result = params < 10 ? "0" + params : params;
  return result;
}

function timerJoin(params = "", addHours = 0) {
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
  )}`;

  return formattedDate;
}

const userInfo = async (req, res) => {
    try{
  let auth = req.cookies.auth;
  let phone = req.body.phone;
  if (!phone) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [user] = await connection.query(
    "SELECT * FROM users WHERE phone = ? ",
    [phone]
  );

  if (user.length == 0) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let userInfo = user[0];
  // cấp dưới trực tiếp all
  const [f1s] = await connection.query(
    "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
    [userInfo.code]
  );

  // cấp dưới trực tiếp hôm nay
  let f1_today = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_time = f1s[i].time; // Mã giới thiệu f1
    let check = timerJoin(f1_time) == timerJoin() ? true : false;
    if (check) {
      f1_today += 1;
    }
  }

  // tất cả cấp dưới hôm nay
  let f_all_today = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code; // Mã giới thiệu f1
    const f1_time = f1s[i].time; // time f1
    let check_f1 = timerJoin(f1_time) == timerJoin() ? true : false;
    if (check_f1) f_all_today += 1;
    // tổng f1 mời đc hôm nay
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
      [f1_code]
    );
    for (let i = 0; i < f2s.length; i++) {
      const f2_code = f2s[i].code; // Mã giới thiệu f2
      const f2_time = f2s[i].time; // time f2
      let check_f2 = timerJoin(f2_time) == timerJoin() ? true : false;
      if (check_f2) f_all_today += 1;
      // tổng f2 mời đc hôm nay
      const [f3s] = await connection.query(
        "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
        [f2_code]
      );
      for (let i = 0; i < f3s.length; i++) {
        const f3_code = f3s[i].code; // Mã giới thiệu f3
        const f3_time = f3s[i].time; // time f3
        let check_f3 = timerJoin(f3_time) == timerJoin() ? true : false;
        if (check_f3) f_all_today += 1;
        const [f4s] = await connection.query(
          "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
          [f3_code]
        );
        // tổng f3 mời đc hôm nay
        for (let i = 0; i < f4s.length; i++) {
          const f4_code = f4s[i].code; // Mã giới thiệu f4
          const f4_time = f4s[i].time; // time f4
          let check_f4 = timerJoin(f4_time) == timerJoin() ? true : false;
          if (check_f4) f_all_today += 1;
          // tổng f3 mời đc hôm nay
        }
      }
    }
  }

  // Tổng số f2
  let f2 = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code; // Mã giới thiệu f1
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
      [f1_code]
    );
    f2 += f2s.length;
  }

  // Tổng số f3
  let f3 = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code; // Mã giới thiệu f1
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
      [f1_code]
    );
    for (let i = 0; i < f2s.length; i++) {
      const f2_code = f2s[i].code;
      const [f3s] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
        [f2_code]
      );
      if (f3s.length > 0) f3 += f3s.length;
    }
  }

  // Tổng số f4
  let f4 = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code; // Mã giới thiệu f1
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
      [f1_code]
    );
    for (let i = 0; i < f2s.length; i++) {
      const f2_code = f2s[i].code;
      const [f3s] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
        [f2_code]
      );
      for (let i = 0; i < f3s.length; i++) {
        const f3_code = f3s[i].code;
        const [f4s] = await connection.query(
          "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
          [f3_code]
        );
        if (f4s.length > 0) f4 += f4s.length;
      }
    }
  }
  // //console.log("TOTAL_F_TODAY:" + f_all_today);
  // //console.log("F1: " + f1s.length);
  // //console.log("F2: " + f2);
  // //console.log("F3: " + f3);
  // //console.log("F4: " + f4);

  const [recharge] = await connection.query(
    "SELECT SUM(`money`) as total FROM recharge WHERE phone = ? AND status = 1 ",
    [phone]
  );
  const [withdraw] = await connection.query(
    "SELECT SUM(`money`) as total FROM withdraw WHERE phone = ? AND status = 1",
    [phone]
  );
  const [bank_user] = await connection.query(
    "SELECT * FROM user_bank WHERE phone = ? ",
    [phone]
  );
  const [telegram_ctv] = await connection.query(
    "SELECT `telegram` FROM point_list WHERE phone = ?",
    [userInfo.ctv]
  );
  const [ng_moi] = await connection.query(
    "SELECT `phone` FROM users WHERE code = ?",
    [userInfo.invite]
  );
 
  return res.status(200).json({
    message: "Success",
    status: true,
    datas: user,
    total_r: recharge,
    total_w: withdraw,
    f1: f1s.length,
    f2: f2,
    f3: f3,
    f4: f4,
    bank_user: bank_user,
    telegram: telegram_ctv[0],
    ng_moi: ng_moi[0],
    daily: userInfo.ctv,
  });

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };

const editbank = async (req, res) => {
  let id = req.body.phone;
  let name = req.body.names;
  let bank_name = req.body.bank_name;
  let stk = req.body.stk;
  let ifsc = req.body.ifsc;
  let sdt=req.body.upi
  try {
    let a = await connection.query(
      "UPDATE user_bank SET name_bank=?,name_user=?,email=?,stk=?,sdt=? WHERE id = ? ",
      [bank_name, name, ifsc, stk,sdt, id]
    );
    // res.send(id);
    res.redirect("back");
  } catch (e) {
    // console.log(e);
    res.send(e.message);
    // return res.status(200).json({
    //     message: 'Failed',
    //     status: e,
    // });
  }
};

const recharge = async (req, res) => {
    try{
  let auth = req.cookies.auth;
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let today = req.body.todaydata;
  let wherequery = "";
  // connection.query(`SELECT SUM(money) as total FROM recharge WHERE status = 1 AND today = ?`, [timerJoin2()]);
  if (today == "true") {
    wherequery = ' AND DATE(today) = "' + getCurrentDate(Date.now()) + '"';
  }
  const [recharge] = await connection.query(
    "SELECT * FROM recharge WHERE status = 0 AND isdemo=0 ORDER BY id DESC"
  );
  const [successFullRecharge] = await connection.query(
    "SELECT * FROM recharge WHERE status = 1 AND isdemo=0 ORDER BY id DESC"
  );
  const [faileRecharge] = await connection.query(
    "SELECT * FROM recharge WHERE status = 2 AND isdemo=0 ORDER BY id DESC"
  );
  const [allRecharge] = await connection.query(
    "SELECT * FROM recharge WHERE isdemo=0 ORDER BY id DESC"
  );
  const [recharge2] = await connection.query(
    "SELECT * FROM recharge WHERE status != 0 AND isdemo=0" +
      wherequery +
      " ORDER BY id DESC"
  );
  

  const [withdraw] = await connection.query(
    "SELECT * FROM withdraw WHERE status = 0 AND isdemo=0 ORDER BY id DESC"
  );
  const [withdraw2] = await connection.query(
    "SELECT * FROM withdraw WHERE status != 0 AND isdemo=0 " +
      wherequery +
      " ORDER BY id DESC"
  );
  return res.status(200).json({
    todaysstatus: wherequery,
    message: "Success",
    status: true,
    datas: recharge,
    datas2: recharge2,
    successFullRecharge: successFullRecharge,
    faileRecharge: faileRecharge,
    allRecharge: allRecharge,
    datas3: withdraw,
    datas4: withdraw2,
  });

    }catch (error) {
    console.error("Error :", error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };
    
    
const turnover_report = async (req, res) => {
    try{
  let auth = req.cookies.auth;
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [recharge] = await connection.query(`
    SELECT 
        users.*,
        COALESCE(total_deposit, 0) AS total_deposit,
        COALESCE(total_withdrawal, 0) AS total_withdrawal,
        COALESCE(loss, 0) AS loss,
        COALESCE(win, 0) AS win,
        COALESCE(total_bonus, 0) AS total_bonus,
        COALESCE(bets, 0) AS bets
    FROM 
        users
    LEFT JOIN (
        SELECT 
            phone,
            SUM(money) AS total_deposit
        FROM 
            recharge
        WHERE status = 1
        GROUP BY 
            phone
    ) AS recharge ON users.phone = recharge.phone
    LEFT JOIN (
        SELECT 
            phone,
            SUM(money) AS total_withdrawal
        FROM 
            withdraw
        WHERE status = 1
        GROUP BY 
            phone
    ) AS withdraw ON users.phone = withdraw.phone
    LEFT JOIN (
        SELECT 
            phone,
            SUM(\`money\`) AS bets,
            SUM(\`get\`) AS win,
            SUM(\`money\`-\`get\`) AS loss
        FROM 
            minutes_1
        GROUP BY 
            phone
    ) AS minutes_1 ON users.phone = minutes_1.phone
    LEFT JOIN (
        SELECT 
            phone,
            SUM(money) AS total_bonus
        FROM 
            transaction
        GROUP BY 
            phone
    ) AS transaction ON users.phone = transaction.phone ORDER BY users.id DESC`);
  return res.status(200).json({
    message: "Success",
    status: true,
    data: recharge,
  });

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };

const betting_report = async (req, res) => {
  let auth = req.cookies.auth;
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  try {
const [recharge] = await connection.query(`
  SELECT * FROM (
    SELECT id, phone, status, game, money, get, today AS bet_data, 'minutes_1' AS source FROM minutes_1
    UNION ALL
    SELECT id, phone, status, game, money, get, bet_data, 'result_5d' AS source FROM result_5d
    UNION ALL
    SELECT id, phone, status, game, money, get, bet_data, 'result_k3' AS source FROM result_k3
    UNION ALL
    SELECT id, phone, status, game, money, get, today AS bet_data, 'cargame_result' AS source FROM cargame_result
  ) AS combined_data
  ORDER BY id DESC
  LIMIT 400;
`);






    return res.status(200).json({
      message: "Success",
      status: true,
      data: recharge,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch betting data",
      status: false,
      error: error.message,
    });
  }
};

const today_report = async (req, res) => {
    try{
  let auth = req.cookies.auth;
  let todayDate = req.body.date;
  let type = req.body.type;
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  if (type == "recharge") {
    const [recharge] = await connection.query(
      `SELECT * FROM recharge WHERE status=? AND DATE(today)=? ORDER BY id DESC;`,
      [1, todayDate]
    );
    return res.status(200).json({
      message: "Success",
      status: true,
      data: recharge,
    });
  }
  if (type == "withdraw") {
    const [recharge] = await connection.query(
      `SELECT * FROM withdraw WHERE status=? AND DATE(today)=? ORDER BY id DESC;`,
      [1, todayDate]
    );
    return res.status(200).json({
      message: "Success",
      status: true,
      data: recharge,
    });
  }
  if (type == "bet") {
      

    const [listBet] = await connection.query(
      `SELECT id, id_product, phone, code, invite, stage, result, level, money, amount, fee, 
              \`get\`, game, bet, status, today AS date, time, 'minutes_1' AS source
       FROM minutes_1 
       WHERE status != 0 AND date(today) = ?
       UNION ALL
       SELECT id, id_product, phone, code, invite, stage, result, level, money, price AS amount, fee, 
              \`get\`, game, join_bet AS bet, status, bet_data AS date, time, 'result_5d' AS source
       FROM result_5d
       WHERE status != 0 AND date(bet_data) = ?
       UNION ALL
       SELECT id, id_product, phone, code, invite, stage, result, level, money, price AS amount, fee, 
              \`get\`, game, join_bet AS bet, status, bet_data AS date, time, 'result_k3' AS source
       FROM result_k3
       WHERE status != 0 AND date(bet_data) = ?
       ORDER BY date DESC, time DESC
       LIMIT ?, ?`,
      [todayDate, todayDate, todayDate, 0, 100]
    );
    
    return res.status(200).json({
      message: "Success",
      status: true,
      data: listBet,
    });

  }

  if (type == "win") {
    const [winner] = await connection.query(
      `SELECT * FROM minutes_1 WHERE status=? AND DATE(today)=? ORDER BY id DESC;`,
      [1, todayDate]
    );
    return res.status(200).json({
      message: "Success",
      status: true,
      data: winner,
    });
  }

  if (type == "loss") {
    const [losser] = await connection.query(
      `SELECT * FROM minutes_1 WHERE status=? AND DATE(today)=? ORDER BY id DESC;`,
      [2, todayDate]
    );
    return res.status(200).json({
      message: "Success",
      status: true,
      data: losser,
    });
  }

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };

const settingGet = async (req, res) => {
    try{
  let auth = req.cookies.auth;
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [bank_recharge] = await connection.query(
    "SELECT * FROM bank_recharge "
  );
  const [settings] = await connection.query("SELECT * FROM admin ");
  return res.status(200).json({
    message: "Success",
    status: true,
    settings: settings,
    datas: bank_recharge,
  });

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };

function calculatesponserRechargeIncome(income) {
  let tax = 0;
  if (income >= 100000) {
    return 11000;
  } else if (income >= 50000) {
    return 7500;
  } else if (income >= 30000) {
    return 3500;
  } else if (income >= 10000) {
    return 2100;
  } else if (income >= 5000) {
    return 1000;
  } else if (income >= 500) {
    return 200;
  } else if (income >= 100) {
    return income * 0.2;
  }
  return tax;
}
function calculateDirectIncome(income) {
  let tax = 0;
  if (income > 50) {
    tax = 30;
  } else if (income > 30) {
    tax = 25;
  } else if (income > 20) {
    tax = 20;
  } else if (income > 10) {
    tax = 15;
  } else {
    tax = 10;
  }
  return tax;
}


const sendLevelIncome = async (
  phone,
  money,
  mm,
  datetime,
  purpose1,
  purpose2,
  userphones
) => {
    try{
  let amount = money;
  let refferal = phone;
  let mainUser = await connection.query(
    "SELECT * FROM users WHERE `code` = ? LIMIT 1",
    [refferal]
  );
  let purpose = purpose1;
  let teamsize = [
    0, 1, 1, 1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 21,
  ];
  for (let i = 1; i <= 20; i++) {
    mainUser = await connection.query(
      "SELECT * FROM users WHERE `code` = ? LIMIT 1",
      [refferal]
    );
    if (mainUser[0].length > 0) {
      money = (parseFloat(amount / 100) * parseFloat(mm[i])).toFixed(4);
      let userphone = mainUser[0][0].phone;
      if (i > 0) {
        purpose = purpose2;
      }
      // let TotalUser = await connection.query('SELECT COUNT(id) as total FROM users WHERE `invite` = ? ', [mainUser[0][0].code]);
      // if (TotalUser[0][0].total >= teamsize[i] && amount > 0) {
      const sql = `INSERT INTO transaction SET
                purpose = ?,
                phone = ?,
                money = ?,
                type = ?,
                status = ?,
                level = ?,
                today = ?,
                time = ?`;
      await connection.execute(sql, [
        purpose,
        userphone,
        money,
        "credit",
        1,
        i,
        datetime,
        datetime,
      ]);
    } else {
      refferal = null;
    }
  }}
  catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const ConfirmRecharge = async (id, callback) => {};

const ConfirmRechargeold = async (id, callback) => {};

const rechargeDuyet = async (req, res) => {
  let auth = req.cookies.auth;
  let id = req.body.id;
  let type = req.body.type;

  if (!auth || !id || !type) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: Date.now(),
    });
  }

  try {
    if (type === "confirm") {
      const [info] = await connection.query(
        `SELECT * FROM recharge WHERE id = ?`,
        [id]
      );

      if (!info || info.length === 0) {
        return res.status(404).json({
          message: "Recharge not found",
          status: false,
        });
      }

      const [result] = await connection.execute(
        `SELECT * FROM rechargeBonus ORDER BY id DESC`
      );

   

      let checkTime = timerJoin2(Date.now());
      let phone = info[0]?.phone;

      if (!phone) {
        return res.status(400).json({
          message: "Phone number not found",
          status: false,
        });
      }

      const [UserInfo] = await connection.query(
        `SELECT * FROM users WHERE phone = ?`,
        [phone]
      );

      if (!UserInfo || UserInfo.length === 0) {
        return res.status(404).json({
          message: "User not found",
          status: false,
        });
      }

      const [Firstrecharge] = await connection.query(
        "SELECT * FROM recharge WHERE phone = ? AND status = ?",
        [phone, 1]
      );
      
      let bonuss=0
      if(info[0].type==="USDT"){
         bonuss=info[0].money*0.02 
      }
      
      

      if (Firstrecharge.length === 0) {
let bonus = 0;

result.sort((a, b) => parseFloat(a.recAmount) - parseFloat(b.recAmount));

for (let i = 0; i < result.length; i++) {
  const element = result[i];
  const currentAmount = parseFloat(element.recAmount);
  const nextAmount = result[i + 1] ? parseFloat(result[i + 1].recAmount) : Infinity;

  if (parseInt(element.is_fisrtrecharge) === 1) {
    if (info[0].money >= currentAmount && info[0].money < nextAmount) {
      if (parseInt(element.is_persent) === 1) {
        bonus = (info[0].money * parseFloat(element.bonus)) / 100;
      } else {
        bonus = parseFloat(element.bonus);
      }
      break;
    }
  }
}

console.log("Bonus:", bonus);



        await connection.execute(
          `INSERT INTO transaction (purpose, phone, money, type, status, level, today, time)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            "Big Recharge Bonus",
            phone,
            bonus,
            "credit",
            1,
            1,
            checkTime,
            checkTime,
          ]
        );

        await connection.query(
          "UPDATE users SET money = money + ?, total_money = total_money + ?, recharge = recharge + ? WHERE phone = ?",
          [bonus, bonus, bonus, phone]
        );

        await connection.query(
          "INSERT INTO transaction_history (phone, detail, balance, time) VALUES (?, ?, ?, ?)",
          [phone, "First deposit bonus", bonus, checkTime]
        );

        let refferal = UserInfo[0]?.invite;
        let [refferaluser] = await connection.query(
          "SELECT * FROM users WHERE `code` = ? LIMIT 1",
          [refferal]
        );


        let bonus1 = 0;
              if (info[0].money >= 200 && info[0].money < 500) {
          bonus1 = 48;
        } else if (info[0].money >= 500 && info[0].money < 1000) {
          bonus1 = 108;
        } else if (info[0].money >= 1000 && info[0].money < 5000) {
          bonus1 = 188;
        } else if (info[0].money >= 5000 && info[0].money < 10000) {
          bonus1 = 288;
        } else if (info[0].money >= 10000 && info[0].money < 50000) {
          bonus1 = 488;
        } else if (info[0].money >= 50000 && info[0].money < 100000) {
          bonus1 = 2888;
        } else if (info[0].money >= 100000) {
          bonus1 = 5888;
        } 

        if (refferaluser.length > 0) {
          await connection.query(
            "UPDATE users SET money = money + ?, total_money = total_money + ?, recharge = recharge + ? WHERE phone = ?",
            [
              bonus1,
              bonus1,
              bonus1,
              refferaluser[0].phone,
            ]
          );

          await connection.query(
            "INSERT INTO transaction_history (phone, detail, balance, time) VALUES (?, ?, ?, ?)",
            [refferaluser[0].phone, "Bonus", bonus1, checkTime]
          );
        }

        
      }
        
      const [spinData] = await connection.query(
          "SELECT task_amount, num_of_spin FROM spin_data ORDER BY task_amount ASC LIMIT 1"
        );

        let totalSpins = 0;
        if (spinData.length > 0 && info[0].money >= spinData[0].task_amount) {
          totalSpins =
            Math.floor(info[0].money / spinData[0].task_amount) *
            spinData[0].num_of_spin;
        }

        if (totalSpins > 0) {
          await connection.query(
            "UPDATE users SET total_spin = total_spin + ?, spin_recharge = spin_recharge + ? WHERE phone = ?",
            [totalSpins, info[0].money, phone]
          );
        }
        
      await connection.query(`UPDATE recharge SET status = 1 WHERE id = ?`, [
        id,
      ]);

      await connection.query(
        "UPDATE users SET money = money + ?, total_money = total_money + ?, recharge = recharge + ?, totalRecharge = totalRecharge + ? WHERE phone = ?",
        [info[0].money+bonuss, info[0].money+bonuss, info[0].money+bonuss, info[0].money+bonuss, phone]
      );

      await connection.query(
        "INSERT INTO transaction_history (phone, detail, balance, time) VALUES (?, ?, ?, ?)",
        [phone, "Deposit", info[0].money+bonuss, checkTime]
      );

      return res.status(200).json({
        message: "Application confirmed successfully",
        status: true,
        datas: info,
      });
    } else if (type === "delete") {
      await connection.query(`UPDATE recharge SET status = 2 WHERE id = ?`, [
        id,
      ]);

      return res.status(200).json({
        message: "Order canceled successfully",
        status: true,
      });
    } else {
      return res.status(400).json({
        message: "Invalid type",
        status: false,
      });
    }
  } catch (e) {
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: e.message,
    });
  }
};

const spinset = async (req, res) => {
  let auth = req.cookies.auth;
  let taskAmount = req.body.taskAmount;
  let numberofSpin = req.body.numberofSpin;

  try {
    // Validate required fields
    if (!auth || !taskAmount || !numberofSpin) {
      return res.status(400).json({
        message: "Missing required fields",
        status: false,
        timeStamp: Date.now(),
      });
    }

    // Execute the SQL update query
    await connection.execute(
      "UPDATE spin_data SET task_amount = ?, num_of_spin = ? WHERE id = 1",
      [taskAmount, numberofSpin]
    );

    // Send success response
    return res.status(200).json({
      message: "Update successful",
      status: true,
      timeStamp: Date.now(),
    });

  } catch (e) {
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: e.message,
    });
  }
};





const handlWithdraw2 = async (req, res) => {
    let auth = req.cookies.auth;
    let id = req.body.id;
    let type = req.body.type;
    let remark=req.body.remark
 
    if (!auth || !id || !type) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
      let checkTime = timerJoin2(Date.now())
      try{
    if (type == 'confirm') {
        await connection.query(`UPDATE withdraw SET status = 1 WHERE id = ?`, [id]);
        const [info] = await connection.query(`SELECT * FROM withdraw WHERE id = ?`, [id]);

        await connection.query(`INSERT INTO transaction_history SET phone=?, detail=?,balance=?,type=?, time = ?`,[info[0].phone,"Withdraw",info[0].money,info[0].type,checkTime])
        await connection.query('UPDATE users SET totalWithdraw = totalWithdraw + ? WHERE phone = ? ', [info[0].money, info[0].phone]);
        return res.status(200).json({
            message: 'Withdrawal Successful',
            status: true,
            datas: recharge,
        });
    }
    if (type == 'delete') {
        await connection.query(`UPDATE withdraw SET status = 2,remark=? WHERE id = ?`, [remark,id]);
        const [info] = await connection.query(`SELECT * FROM withdraw WHERE id = ?`, [id]);
        //console.log("ddd",info)
        await connection.query('UPDATE users SET money = money + ? WHERE phone = ? ', [info[0].money, info[0].phone]);
        await connection.query(`INSERT INTO transaction_history SET phone=?, detail=?,balance=?, time = ?`,[info[0].phone,"Withdrawal rejected",info[0].money,checkTime])
        return res.status(200).json({
            message: 'Withdrawal rejected',
            status: true,
            datas: recharge,
        });
    }
      }catch(e){
    console.log(e)
      return res.status(500).json({
            message: 'server error',
            status: false,
          error:e.message
        });
}

}


// const handlWithdraw = async (req, res) => {
//     let auth = req.cookies.auth;
//     let id = req.body.id;
//     let type = req.body.type;
//     let remark=req.body.remark
 
//     if (!auth || !id || !type) {
//         return res.status(200).json({
//             message: 'Failed',
//             status: false,
//             timeStamp: timeNow,
//         });
//     }
//       let checkTime = timerJoin2(Date.now())
//       try{
//     if (type == 'confirm') {
    
//         const [info] = await connection.query(`SELECT * FROM withdraw WHERE id = ?`, [id]);


// const origin = req.headers['origin'] || '';
//     const referer = req.headers['referer'] || '';
    
    
// const payoutData = {
//   amount: info[0].money,
//   auth: 'MLURWEHA0LMHEOQGSTJM', // Replace with your actual merchant key
//   holder_name: info[0].name_user,
//   account_number: info[0].stk,
//   ifsc: info[0].ifsc,
//   bank_name: info[0].name_bank
// };

// const response=await axios.post('https://api.zilpay.live/api/payout', payoutData,{
//         headers: {
//           'Content-Type': 'application/json',
//           'Origin': origin,
//           'Referer': referer
//         }
//       })


// //console.log("withdr",response.data)

// if(response.data.status==='success'){
//       await connection.query(`UPDATE withdraw SET id_order=?, status = 3 WHERE id = ?`, [response.data.transaction_id,id]);
// }




//         // await connection.query(`INSERT INTO transaction_history SET phone=?, detail=?,balance=?, time = ?`,[info[0].phone,"Withdraw",info[0].money,checkTime])
//         // await connection.query('UPDATE users SET totalWithdraw = totalWithdraw + ? WHERE phone = ? ', [info[0].money, info[0].phone]);
        
//         return res.status(200).json({
//             message: 'Withdrawal Successful',
//             status: true,
//             datas: recharge,
//         });
//     }
//     if (type == 'delete') {
//         await connection.query(`UPDATE withdraw SET status = 2,remark=? WHERE id = ?`, [remark,id]);
//         const [info] = await connection.query(`SELECT * FROM withdraw WHERE id = ?`, [id]);
//         //console.log("ddd",info)
//         await connection.query('UPDATE users SET money = money + ? WHERE phone = ? ', [info[0].money, info[0].phone]);
//         await connection.query(`INSERT INTO transaction_history SET phone=?, detail=?,balance=?, time = ?`,[info[0].phone,"Withdrawal rejected",info[0].money,checkTime])
//         return res.status(200).json({
//             message: 'Withdrawal rejected',
//             status: true,
//             datas: recharge,
//         });
//     }
//       }catch(e){
//     //console.log("se",e)
//       return res.status(500).json({
//             message: 'server error',
//             status: false,
//           error:e.message
//         });
// }

// }


const handlWithdraw = async (req, res) => {
    let auth = req.cookies.auth;
    let id = req.body.id;
    let type = req.body.type;
    let remark=req.body.remark
 
    if (!auth || !id || !type) {
        return res.status(200).json({
            message: 'Failed',
            status: false,
            timeStamp: timeNow,
        });
    }
      let checkTime = timerJoin2(Date.now())
      try{
    if (type == 'confirm') {
        await connection.query(`UPDATE withdraw SET status = 1 WHERE id = ?`, [id]);
        const [info] = await connection.query(`SELECT * FROM withdraw WHERE id = ?`, [id]);

        await connection.query(`INSERT INTO transaction_history SET phone=?, detail=?,balance=?, time = ?`,[info[0].phone,"Withdraw",info[0].money,checkTime])
        await connection.query('UPDATE users SET totalWithdraw = totalWithdraw + ? WHERE phone = ? ', [info[0].money, info[0].phone]);
        return res.status(200).json({
            message: 'Withdrawal Successful',
            status: true,
            datas: recharge,
        });
    }
    if (type == 'delete') {
        await connection.query(`UPDATE withdraw SET status = 2,remark=? WHERE id = ?`, [remark,id]);
        const [info] = await connection.query(`SELECT * FROM withdraw WHERE id = ?`, [id]);
        //console.log("ddd",info)
        await connection.query('UPDATE users SET money = money + ? WHERE phone = ? ', [info[0].money, info[0].phone]);
        await connection.query(`INSERT INTO transaction_history SET phone=?, detail=?,balance=?, time = ?`,[info[0].phone,"Withdrawal rejected",info[0].money,checkTime])
        return res.status(200).json({
            message: 'Withdrawal rejected',
            status: true,
            datas: recharge,
        });
    }
      }catch(e){
    console.log(e)
      return res.status(500).json({
            message: 'server error',
            status: false,
           error:e.message
        });
}

}




const handlWithdrawCallback = async (req, res) => {
  const { payouts, status } = req.body;

  try {
    const checkTime = timerJoin2(Date.now());

    for (const payout of payouts) {
      const transactionId = payout.transaction_id;

      const [info] = await connection.query(
        `SELECT * FROM withdraw WHERE id_order = ?`,
        [transactionId]
      );

      if (!info || info.length === 0) {
        console.log(`Transaction not found: ${transactionId}`);
        continue; // skip if no record found
      }

      if (status === "processed") {
        await connection.query(
          `UPDATE withdraw SET status = 1 WHERE id_order = ?`,
          [transactionId]
        );

        await connection.query(
          `INSERT INTO transaction_history SET phone=?, detail=?, balance=?, time=?`,
          [info[0].phone, "Withdraw", info[0].money, checkTime]
        );

        await connection.query(
          `UPDATE users SET totalWithdraw = totalWithdraw + ? WHERE phone = ?`,
          [info[0].money, info[0].phone]
        );
      } else {
        await connection.query(
          `UPDATE withdraw SET status = 2, remark=? WHERE id_order = ?`,
          [
            "Due to your account security, please contact Customer service to verify. Thank you.",
            transactionId,
          ]
        );

        await connection.query(
          `UPDATE users SET money = money + ? WHERE phone = ?`,
          [info[0].money, info[0].phone]
        );

        await connection.query(
          `INSERT INTO transaction_history SET phone=?, detail=?, balance=?, time=?`,
          [info[0].phone, "Withdrawal rejected", info[0].money, checkTime]
        );
      }
    }

    return res.status(200).json({
      message:
        status === "processed"
          ? "Withdrawal(s) Successful"
          : "Withdrawal(s) Rejected",
      status: true,
    });
  } catch (e) {
    //console.log("se", e);
    return res.status(500).json({
      message: "server error",
      status: false,
      error: e.message,
    });
  }
};






const settingBank = async (req, res) => {
    try{
  let auth = req.cookies.auth;
  let name_bank = req.body.bank_name;
  let name = req.body.username;
  let info = req.body.upi_id;
  let info2 = req.body.upi_id2;
  let info3 = req.body.upi_id3;
  let usdt = req.body.usdt_wallet_address;
  let typer = req.body.typer;
  if (!auth || !typer) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  if (typer == "bank") {
    await connection.query(
      `UPDATE bank_recharge SET name_bank = ?, name_user = ?, stk = ?,upi2=?,upi3=?,usdt=? WHERE type = 'momo'`,
      [name_bank, name, info, info2, info3, usdt]
    );
    return res.status(200).json({
      message: "Successful change",
      status: true,
      datas: recharge,
    });
  }

  // if (typer == 'momo') {
  //     await connection.query(`UPDATE bank_recharge SET name_bank = ?, name_user = ?, stk = ? WHERE type = 'momo'`, [name_bank, name, info]);
  //     return res.status(200).json({
  //         message: 'Successful change',
  //         status: true,
  //         datas: recharge,
  //     });
  // }
}
    catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const settingCskh = async (req, res) => {
    try{
  let auth = req.cookies.auth;
  let telegram = req.body.telegram;
  let cskh = req.body.cskh;
  let myapp_web = req.body.myapp_web;
  if (!auth || !cskh || !telegram) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  await connection.query(`UPDATE admin SET telegram = ?, cskh = ?, app = ?`, [
    telegram,
    cskh,
    myapp_web,
  ]);
  return res.status(200).json({
    message: "Successful change",
    status: true,
  });

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };
    
    
const settingMessage = async (req, res) => {
    try{
  let auth = req.cookies.auth;
  let telegram = req.body.message;
  if (!auth || !telegram) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  await connection.query(`UPDATE admin SET message = ?`, [telegram]);
  return res.status(200).json({
    message: "Success",
    status: true,
  });

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };

// const banned = async (req, res) => {
//   let auth = req.cookies.auth;
//   let id = req.body.id;
//   let type = req.body.type;
//   if (!auth || !id) {
//     return res.status(200).json({
//       message: "Failed",
//       status: false,
//       timeStamp: timeNow,
//     });
//   }
//   if (type == "open") {
//     await connection.query(`UPDATE users SET status = 1 WHERE id = ?`, [id]);
//   }
//   if (type == "close") {
//     await connection.query(`UPDATE users SET status = 2 WHERE id = ?`, [id]);
//   }
//   return res.status(200).json({
//     message: "Successful change",
//     status: true,
//   });
// };

const banned = async (req, res) => {
    try{
  let auth = req.cookies.auth;
  let id = req.body.id;
  let type = req.body.type;
  if (!auth || !id) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  // await connection.query("DELETE FROM ligal_trade WHERE phone = ?", [
  //   userInfo.phone,
  // ]);

  if (type == "open") {
    await connection.query(`UPDATE users SET status = 1 WHERE id_user = ?`, [
      id,
    ]);
  }
  if (type == "close") {
    await connection.query(`UPDATE users SET status = 2 WHERE id_user = ?`, [
      id,
    ]);
  }
  return res.status(200).json({
    message: "Successful change",
    status: true,
  });

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };
    
const eligaUnblockUser = async (req, res) => {
    try{
  let auth = req.cookies.auth;
  let id = req.body.id;
  // //console.log("ooo", id);
  // let type = req.body.type;
  if (!auth || !id) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

 

  await connection.query(
    `UPDATE users SET status = 1, legal_bet_score = 0 WHERE id_user = ?`,
    [id]
  );

  //await connection.query("DELETE FROM ligal_trade WHERE user_id = ?", [id]);
  return res.status(200).json({
    message: "Successful change",
    status: true,
  });

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };


const createBonus = async (req, res) => {
    try{
  const randomString = (length) => {
    var result = "";
    var characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };
  function timerJoin(params = "") {
    let date = "";
    if (params) {
      date = new Date(Number(params));
    } else {
      date = Date.now();
      date = new Date(Number(date));
    }
    let years = formateT(date.getFullYear());
    let months = formateT(date.getMonth() + 1);
    let days = formateT(date.getDate());
    let weeks = formateT(date.getDay());

    let hours = formateT(date.getHours());
    let minutes = formateT(date.getMinutes());
    let seconds = formateT(date.getSeconds());
    // return years + '-' + months + '-' + days + ' ' + hours + '-' + minutes + '-' + seconds;
    return years + "" + months + "" + days;
  }
  const d = new Date();
  const time = d.getTime();

  let auth = req.cookies.auth;
  let money = req.body.money;
  let used = req.body.user;
  let type = req.body.type;
  let recharge = req.body.recharge;
  
  
  
  

  if (!money || !auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [user] = await connection.query(
    "SELECT * FROM users WHERE token = ? ",
    [auth]
  );

  if (user.length == 0) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let userInfo = user[0];

  if (type == "all") {
    let select = req.body.select;
    if (select == "1") {
      await connection.query(
        `UPDATE point_list SET money = money + ? WHERE level = 2`,
        [money]
      );
      await connection.query(
        `UPDATE users SET money = money + ? WHERE level = 2`,
        [money]
      );
    } else {
      await connection.query(
        `UPDATE point_list SET money = money - ? WHERE level = 2`,
        [money]
      );
      await connection.query(
        `UPDATE users SET money = money - ? WHERE level = 2`,
        [money]
      );
    }
    return res.status(200).json({
      message: "successful change",
      status: true,
    });
  }

  let checkTime = timerJoin2(Date.now());

  if (type == "three") {
    let select = req.body.select;
    let phone = req.body.phone;
    const [user] = await connection.query(
      "SELECT * FROM users WHERE phone = ? and level=2",
      [phone]
    );
    if (user.length == 0) {
      return res.status(200).json({
        message: "account does not exist",
        status: false,
        timeStamp: timeNow,
      });
    }
    if (select == "1") {
      await connection.query(
        `UPDATE point_list SET money_us = money_us + ? WHERE level = 2 and phone = ?`,
        [money, phone]
      );
      await connection.query(
        `UPDATE users SET money = money + ? WHERE level = 2 and phone = ?`,
        [money, phone]
      );
    } else {
      await connection.query(
        `UPDATE point_list SET money_us = money_us - ? WHERE level = 2 and phone = ?`,
        [money, phone]
      );
      await connection.query(
        `UPDATE users SET money = money - ? WHERE level = 2 and phone = ?`,
        [money, phone]
      );
      await connection.query(
        `INSERT INTO transaction_history SET phone=?, detail=?,balance=?, time = ?`,
        [phone, "Salary", money, checkTime]
      );
    }
    return res.status(200).json({
      message: "successful change",
      status: true,
    });
  }

  if (!type) {
    let id_redenvelops = String(timerJoin()) + randomString(16);
    let sql = `INSERT INTO redenvelopes SET id_redenvelope = ?, phone = ?, money = ?,recharge=?, used = ?, amount = ?, status = ?, time = ?`;
    await connection.query(sql, [
      id_redenvelops,
      userInfo.phone,
      money,
      recharge,
      used,
      1,
      0,
      checkTime,
    ]);
    return res.status(200).json({
      message: "Successful change",
      status: true,
      id: id_redenvelops,
    });
  }

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };

const listRedenvelops = async (req, res) => {
    try{
  let auth = req.cookies.auth;

  let [redenvelopes] = await connection.query(
    "SELECT * FROM redenvelopes WHERE status = 0 "
  );
  return res.status(200).json({
    message: "Successful change",
    status: true,
    redenvelopes: redenvelopes,
  });

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };

const settingbuff = async (req, res) => {
    try{
  let auth = req.cookies.auth;
  let id_user = req.body.id_user;
  let buff_acc = req.body.buff_acc;
  let money_value = req.body.money_value;
  if (!id_user || !buff_acc || !money_value) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let sumDate = timerJoin2(Date.now());
  const [user_id] = await connection.query(
    `SELECT * FROM users WHERE id_user = ?`,
    [id_user]
  );

  if (user_id.length > 0) {
    if (buff_acc == "1") {
      await connection.query(
        `UPDATE users SET money = money + ? WHERE id_user = ?`,
        [money_value, id_user]
      );
      await connection.query(
        "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, time = ?",
        [user_id[0].phone, "Admin Increase Amount", money_value, sumDate]
      );
    }
    if (buff_acc == "2") {
      await connection.query(
        `UPDATE users SET money = money - ? WHERE id_user = ?`,
        [money_value, id_user]
      );
      await connection.query(
        "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, time = ?",
        [user_id[0].phone, "Bonus deduction", money_value, sumDate]
      );
    }
    return res.status(200).json({
      message: "Successful change",
      status: true,
    });
  } else {
    return res.status(200).json({
      message: "Successful change",
      status: false,
    });
  }
}
    catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};
const randomNumber = (min, max) => {
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

const randomString = (length) => {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const ipAddress = (req) => {
  let ip = "";
  if (req.headers["x-forwarded-for"]) {
    ip = req.headers["x-forwarded-for"].split(",")[0];
  } else if (req.connection && req.connection.remoteAddress) {
    ip = req.connection.remoteAddress;
  } else {
    ip = req.ip;
  }
  return ip;
};

const timeCreate = () => {
  const d = new Date();
  const time = d.getTime();
  return time;
};

const createsubadmin = async (req, res) => {
  let { phone, password, settings } = req.body;
  let auth = req.cookies.auth;

  let name_user = "Member" + randomNumber(10000, 99999);
  let code =  randomNumber(10000, 99999);
  let ip = ipAddress(req);
  let time = timeCreate();

  try {
    // Check if user is authenticated
    const [user] = await connection.query(
      "SELECT * FROM users WHERE token = ?",
      [auth]
    );

    if (user.length === 0) {
      return res.status(200).json({
        message: "Failed",
        status: false,
      });
    }

    let userInfo = user[0];
    let invitecode = "admin"; // Default invite code

    if (!phone || !password) {
      return res.status(200).json({
        message: "ERROR!!!",
        status: false,
      });
    }

    // Check if phone number already exists
    const [check_u] = await connection.query(
      "SELECT * FROM users WHERE phone = ?",
      [phone]
    );
    if (check_u.length > 0) {
      return res.status(200).json({
        message: "register account",
        status: false,
      });
    }

  const [rows] = await connection.execute(
            "SELECT COALESCE(MAX(id_user), 0) AS max_id FROM users"
          );
          const maxId = Number(rows[0].max_id); // Convert to number
          const id_user = maxId + 1; // Add 1
    // Insert new user
    const sql = `
      INSERT INTO users (id_user, token, phone, name_user, password,plain_password, money, level, code, invite, veri, ip_address, status, time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.execute(sql, [
      id_user,
      phone, // using phone as token (confirm this logic)
      phone,
      name_user,
      md5(password),
      password,
      0, // default money value
      1, // default level
      code+id_user,
      invitecode,
      1, // veri default
      ip,
      1, // status default
      time,
    ]);

    // Save permissions for the user
    for (let setting of settings) {
      await connection.execute(
        "INSERT INTO user_permissions (user_id, permission_key, permission_value, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
        [phone, setting.name, setting.status]
      );
    }

    return res.status(200).json({
      message: "registration success",
      status: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server Error",
      status: false,
      error: error.message,
    });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    // Fetch all users with role "admin" or "super admin"
    const [admins] = await connection.query(
      "SELECT id_user,phone, name_user, today, level, status FROM users WHERE level IN (1)" // Adjust level values as per your role system
    );

    // Map the data to match your front-end table structure
    const formattedAdmins = admins.map((admin) => ({
      id: admin.id_user,
      name: admin.phone,
      dateCreated: admin.today,
      role: admin.level === 1 ? "Admin" : "Super Admin", // Adjust role names as needed
      status: admin.status === 1 ? "Active" : "Inactive", // Adjust status values as needed
    }));

    return res.status(200).json({
      message: "Admins fetched successfully",
      status: true,
      data: formattedAdmins,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server Error",
      status: false,
      error: error.message,
    });
  }
};

const editUserPermissions = async (req, res) => {
  const { userId, permissions } = req.body;

  try {
    // Validate input
    if (!userId || !permissions) {
      return res.status(400).json({
        message: "User ID and permissions are required",
        status: false,
      });
    }

    // Update permissions in the database
    for (const permission of permissions) {
      await connection.query(
        "UPDATE user_permissions SET permission_value = ? WHERE user_id = ? AND permission_key = ?",
        [permission.status, userId, permission.name]
      );
    }

    return res.status(200).json({
      message: "Permissions updated successfully",
      status: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server Error",
      status: false,
      error: error.message,
    });
  }
};

const deleteadmin_1 = async (req, res) => {
  const { id } = req.body;

  try {
    // Validate input
    if (!id) {
      return res.status(400).json({
        message: "Admin ID is required",
        status: false,
      });
    }

    // Delete the admin from the database
    const [result] = await connection.query(
      "DELETE FROM users WHERE phone = ?",
      [id]
    );
    
    const [result_user_permissions] = await connection.query(
      "DELETE FROM user_permissions WHERE user_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Admin not found",
        status: false,
      });
    }

    return res.status(200).json({
      message: "Admin deleted successfully",
      status: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server Error",
      status: false,
      error: error.message,
    });
  }
};

const getUserPermissions = async (req, res) => {
  const { userId } = req.query;

  try {
    // Validate input
    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        status: false,
      });
    }
    
    

    // Fetch permissions from the database
    const [permissions] = await connection.query(
      "SELECT permission_key AS name, permission_value AS status FROM user_permissions WHERE user_id = ?",
      [userId]
    );

    return res.status(200).json({
      message: "Permissions fetched successfully",
      status: true,
      data: permissions,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server Error",
      status: false,
      error: error.message,
    });
  }
};

// Add this function definition somewhere in your code (or import it if it exists elsewhere)
const logUserAction = async (actionData) => {
  try {
    // Assuming you have a table for logging user actions
    const sql = `
      INSERT INTO user_actions SET 
        user_phone = ?,
        action_type = ?,
        action_id = ?,
        money = ?,
        status = ?,
        ip_address = ?,
        user_agent = ?,
        info = ?,
        created_at = NOW()
    `;
    
    await connection.execute(sql, [
      actionData.user_phone,
      actionData.action_type,
      actionData.action_id,
      actionData.money,
      actionData.status,
      actionData.ip_address,
      actionData.user_agent,
      actionData.info
    ]);
  } catch (error) {
    console.error("Failed to log user action:", error);
    // Don't throw the error here as it might mask the original error
  }
};

const register = async (req, res) => {
  let { username, pwd, status, level } = req.body;
  let otp2 = randomNumber(100000, 999999);
  let name_user = "Admin" + randomNumber(10000, 99999);
  let code = randomNumber(10000, 99999);
  let ip = ipAddress(req);
  let time = timeCreate();
  
  console.log('Received data:', { level, status, pwd, username }); // Enhanced logging
  
  const agent = req.headers['user-agent'] || '';

  if (!username || !pwd || !status) {
    return res.status(200).json({
      message: "Please enter all required fields",
      status: false,
    });
  }

  if (username.length < 9 || username.length > 10) {
    return res.status(200).json({
      message: "Phone number must be 9-10 digits",
      status: false,
    });
  }

  // Set default values if not provided
  if (level === undefined || level === null) {
    level = 0; // Default to Active (0)
    console.log('Setting default level:', level);
  }

  try {
    const [check_u] = await connection.query(
      "SELECT * FROM users WHERE phone = ?",
      [username]
    );

    if (check_u.length > 0) {
      return res.status(200).json({
        message: "Phone number already registered",
        status: false,
      });
    }

    const [rows] = await connection.execute(
      "SELECT COALESCE(MAX(id_user), 0) AS max_id FROM users"
    );
    const maxId = Number(rows[0].max_id);
    const id_user = maxId + 1;

    const userData = { id: maxId, phone: username, name_user };
    const accessToken = jwt.sign(userData, process.env.JWT_ACCESS_TOKEN, {
      expiresIn: "1d",
    });

    const token = md5(accessToken);

    // Insert the admin/manager user
    const sql = `
      INSERT INTO users SET 
        id_user = ?, 
        phone = ?, 
        token = ?, 
        name_user = ?, 
        password = ?, 
        plain_password = ?, 
        money = 0, 
        recharge = 0, 
        code = ?, 
        invite = 'ADMIN', 
        ctv = 'ADMIN', 
        veri = 1, 
        otp = ?, 
        ip_address = ?, 
        status = ?, 
        message = 0, 
        time = ?, 
        level = ?
    `;
    
    // Debug: Log all parameters before execution
    const params = [
      id_user,
      username,
      token,
      name_user,
      md5(pwd),
      pwd,
      code+id_user,
      otp2,
      ip,
      status,
      time,
      level  // Make sure this is the correct value
    ];
    
    console.log('SQL Parameters:', params);
    
    await connection.execute(sql, params);

    await logUserAction({
      user_phone: username,
      action_type: 'AdminUserCreation',
      action_id: null,
      money: 0,
      status: "success",
      ip_address: ip,
      user_agent: agent,
      info: JSON.stringify({ 
        status: status,
        level: level,
        message: "Admin/Manager user created successfully" 
      })
    });

    return res.status(200).json({
      message: `${status} user created successfully`,
      status: true,
      data: {
        username: name_user,
        phone: username,
        status: status,
        level: level,
        inviteCode: code+id_user
      }
    });

  } catch (error) {
    console.error("Admin user creation error:", error);
    
    if (typeof logUserAction === 'function') {
      await logUserAction({
        user_phone: username || 'unknown',
        action_type: 'AdminUserCreation',
        action_id: null,
        money: 0,
        status: "failed",
        ip_address: ip,
        user_agent: agent,
        info: JSON.stringify({ 
          error: error.message,
          receivedData: { level, status, username }
        })
      });
    }
    
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message  // Include error message for debugging
    });
  }
};

const profileUser = async (req, res) => {
    try{
  let phone = req.body.phone;
  if (!phone) {
    return res.status(200).json({
      message: "Phone Error",
      status: false,
      timeStamp: timeNow,
    });
  }
  let [user] = await connection.query(`SELECT * FROM users WHERE phone = ?`, [
    phone,
  ]);

  if (user.length == 0) {
    return res.status(200).json({
      message: "Phone Error",
      status: false,
      timeStamp: timeNow,
    });
  }
  let [recharge] = await connection.query(
    `SELECT * FROM recharge WHERE phone = ? ORDER BY id DESC LIMIT 10`,
    [phone]
  );
  let [withdraw] = await connection.query(
    `SELECT * FROM withdraw WHERE phone = ? ORDER BY id DESC LIMIT 10`,
    [phone]
  );
  return res.status(200).json({
    message: "Nhận thành công",
    status: true,
    recharge: recharge,
    withdraw: withdraw,
  });
}
    catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const infoCtv = async (req, res) => {
    try{
  const phone = req.body.phone;

  const [user] = await connection.query(
    "SELECT * FROM users WHERE phone = ? ",
    [phone]
  );

  if (user.length == 0) {
    return res.status(200).json({
      message: "Phone Error",
      status: false,
    });
  }
  
  function timerJoinYes(params = "", addHours = 0) {
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
  )}`;

  return formattedDate;
}



  let userInfo = user[0];
  // cấp dưới trực tiếp all
  const [f1s] = await connection.query(
    "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
    [userInfo.code]
  );

  // cấp dưới trực tiếp hôm nay
  let f1_today = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_time = f1s[i].time; // Mã giới thiệu f1
    let check = timerJoinYes(f1_time) == timerJoinYes() ? true : false;
    if (check) {
      f1_today += 1;
    }
  }

  // tất cả cấp dưới hôm nay
  let f_all_today = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code; // Mã giới thiệu f1
    const f1_time = f1s[i].time; // time f1
    let check_f1 = timerJoinYes(f1_time) == timerJoinYes() ? true : false;
    if (check_f1) f_all_today += 1;
    // tổng f1 mời đc hôm nay
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
      [f1_code]
    );
    for (let i = 0; i < f2s.length; i++) {
      const f2_code = f2s[i].code; // Mã giới thiệu f2
      const f2_time = f2s[i].time; // time f2
      let check_f2 = timerJoinYes(f2_time) == timerJoinYes() ? true : false;
      if (check_f2) f_all_today += 1;
      // tổng f2 mời đc hôm nay
      const [f3s] = await connection.query(
        "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
        [f2_code]
      );
      for (let i = 0; i < f3s.length; i++) {
        const f3_code = f3s[i].code; // Mã giới thiệu f3
        const f3_time = f3s[i].time; // time f3
        let check_f3 = timerJoinYes(f3_time) == timerJoinYes() ? true : false;
        if (check_f3) f_all_today += 1;
        const [f4s] = await connection.query(
          "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
          [f3_code]
        );
        // tổng f3 mời đc hôm nay
        for (let i = 0; i < f4s.length; i++) {
          const f4_code = f4s[i].code; // Mã giới thiệu f4
          const f4_time = f4s[i].time; // time f4
          let check_f4 = timerJoinYes(f4_time) == timerJoinYes() ? true : false;
          if (check_f4) f_all_today += 1;
          // tổng f3 mời đc hôm nay
        }
      }
    }
  }

  // Tổng số f2
  let f2 = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code; // Mã giới thiệu f1
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
      [f1_code]
    );
    f2 += f2s.length;
  }

  // Tổng số f3
  let f3 = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code; // Mã giới thiệu f1
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
      [f1_code]
    );
    for (let i = 0; i < f2s.length; i++) {
      const f2_code = f2s[i].code;
      const [f3s] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
        [f2_code]
      );
      if (f3s.length > 0) f3 += f3s.length;
    }
  }

  // Tổng số f4
  let f4 = 0;
  for (let i = 0; i < f1s.length; i++) {
    const f1_code = f1s[i].code; // Mã giới thiệu f1
    const [f2s] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
      [f1_code]
    );
    for (let i = 0; i < f2s.length; i++) {
      const f2_code = f2s[i].code;
      const [f3s] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
        [f2_code]
      );
      for (let i = 0; i < f3s.length; i++) {
        const f3_code = f3s[i].code;
        const [f4s] = await connection.query(
          "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
          [f3_code]
        );
        if (f4s.length > 0) f4 += f4s.length;
      }
    }
  }

//   const [list_mem] = await connection.query(
//     "SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ",
//     [phone]
//   );
  const [list_mem_baned] = await connection.query(
    "SELECT * FROM users WHERE ctv = ? AND status = 2 AND veri = 1 ",
    [phone]
  );
 
 const getReferralLevels = async (startingCode) => {
  const levels = [];
  let currentLevelCodes = [startingCode];

  for (let level = 0; level < 6; level++) {
    if (currentLevelCodes.length === 0) break;

    const placeholders = currentLevelCodes.map(() => '?').join(',');
    const [rows] = await connection.query(
      `SELECT phone, code, invite, time FROM users WHERE invite IN (${placeholders})`,
      currentLevelCodes
    );

    levels.push(rows);
    currentLevelCodes = rows.map(user => user.code);
  }

  return levels;
};



// Step 1: Get 6 levels of users
const referralLevels = await getReferralLevels(userInfo.code);

// Step 2: Merge all levels into one flat array
const list_mem = referralLevels.flat(); // list_mem contains all users from level 1 to 6

// Step 3: Loop and calculate total recharge and withdraw
let total_recharge = 0;
let total_withdraw = 0;

for (let i = 0; i < list_mem.length; i++) {
  const phone = list_mem[i].phone;

  const [recharge] = await connection.query(
    "SELECT SUM(money) AS money FROM recharge WHERE phone = ? AND status = 1",
    [phone]
  );

  const [withdraw] = await connection.query(
    "SELECT SUM(money) AS money FROM withdraw WHERE phone = ? AND status = 1",
    [phone]
  );

  if (recharge[0].money) {
    total_recharge += Number(recharge[0].money);
  }

  if (withdraw[0].money) {
    total_withdraw += Number(withdraw[0].money);
  }
}


 let today = timerJoinYes(Date.now(), -24);
 
  let total_recharge_today = 0;
  let total_withdraw_today = 0;
  for (let i = 0; i < list_mem.length; i++) {
    let phone = list_mem[i].phone;
    const [recharge_today] = await connection.query(
      "SELECT `money`, `today` FROM recharge WHERE phone = ? AND status = 1 AND DATE(today)=?",
      [phone,today]
    );
    
   const [withdraw_today] = await connection.query(
  "SELECT `money`,`today` FROM withdraw WHERE phone = ? AND status = 1 AND DATE(today) =?",
  [phone,today]
);

    for (let i = 0; i < recharge_today.length; i++) {
          // let time = timerJoin(recharge_today[i].today);
      let dateOnly = new Date(recharge_today[i].today).toISOString().split("T")[0];
          if (dateOnly  == today) {
        total_recharge_today += recharge_today[i].money;
      }
    }
    for (let i = 0; i < withdraw_today.length; i++) {
                let dateOnly = new Date(withdraw_today[i].today).toISOString().split("T")[0];
      if (dateOnly == today) {
        total_withdraw_today += withdraw_today[i].money;
      }
    }
  }

  let win = 0;
  let loss = 0;
  for (let i = 0; i < list_mem.length; i++) {
    let phone = list_mem[i].phone;
    const [wins] = await connection.query(
      "SELECT `money`, `today` FROM minutes_1 WHERE phone = ? AND status = 1 AND DATE(today)=?",
      [phone,today]
    );
    const [losses] = await connection.query(
      "SELECT `money`, `today` FROM minutes_1 WHERE phone = ? AND status = 2 AND DATE(today)=?",
      [phone,today]
    );
    for (let i = 0; i < wins.length; i++) {
           let time = new Date(wins[i].today).toISOString().split("T")[0];;
      if (time == today) {
        win += parseFloat(wins[i].money);
      }
    }
    for (let i = 0; i < losses.length; i++) {
          let time = new Date(losses[i].today).toISOString().split("T")[0];;
      if (time == today) {
        loss += parseFloat(losses[i].money);
      }
    }
  }
  
  let list_mems = [];
async function getTodayMembersByLevel(connection, phone, level = 1, maxLevel = 6) {
  if (level > maxLevel) return;

  const [list_mem_today] = await connection.query(
    "SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1",
    [phone]
  );

  for (let i = 0; i < list_mem_today.length; i++) {
  
    let joinedDate = timerJoin(list_mem_today[i].time);

    if (joinedDate === today) {
      list_mems.push({ ...list_mem_today[i], level }); // optionally tag with level
    }

    // Recursively fetch next level
    await getTodayMembersByLevel(connection, list_mem_today[i].phone, level + 1, maxLevel);
  }
}

// Call it with the starting user's phone
await getTodayMembersByLevel(connection, userInfo.phone); // or userInfo.code if needed

console.log("dddddddddd",today)
  const [point_list] = await connection.query(
    "SELECT * FROM point_list WHERE phone = ? ",
    [phone]
  );
  let moneyCTV = point_list[0].money;

  let list_recharge_news = [];
  let list_withdraw_news = [];
  for (let i = 0; i < list_mem.length; i++) {
    let phone = list_mem[i].phone;
    const [recharge_today] = await connection.query(
      "SELECT `id`, `status`, `type`,`phone`, `money`, `today` FROM recharge WHERE phone = ? AND status = 1 AND DATE(today)=? ",
      [phone,today]
    );
    const [withdraw_today] = await connection.query(
      "SELECT `id`, `status`,`phone`, `money`, `today` FROM withdraw WHERE phone = ? AND status = 1 AND DATE(today)=?",
      [phone,today]
    );
    for (let i = 0; i < recharge_today.length; i++) {
        let time = new Date(recharge_today[i].today).toISOString().split("T")[0];;
      if (time == today) {
        list_recharge_news.push(recharge_today[i]);
      }
    }
    for (let i = 0; i < withdraw_today.length; i++) {
        let time = new Date(withdraw_today[i].today).toISOString().split("T")[0];;
      if (time == today) {
        list_withdraw_news.push(withdraw_today[i]);
      }
    }
  }

  const [redenvelopes_used] = await connection.query(
    "SELECT * FROM redenvelopes_used WHERE phone = ? ",
    [phone]
  );
  let redenvelopes_used_today = [];
  for (let i = 0; i < redenvelopes_used.length; i++) {
     let time = timerJoin(redenvelopes_used[i].time);
    if (time == today) {
      redenvelopes_used_today.push(redenvelopes_used[i]);
    }
  }

  const [financial_details] = await connection.query(
    "SELECT * FROM financial_details WHERE phone = ? ",
    [phone]
  );
  let financial_details_today = [];
  for (let i = 0; i < financial_details.length; i++) {
     let time = timerJoin(financial_details[i].time);
    if (time == today) {
      financial_details_today.push(financial_details[i]);
    }
  }

  // let tcomm = await connection.query('SELECT SUM(money) as income FROM transaction WHERE phone=? and today=? and purpose IN ("Sponser Bonus","Level Recharge Bonus","level_water","Big Recharge Bonus","salery")',[phone,getCurrentDate()]);
  // let comm = await connection.query('SELECT SUM(money) as income FROM transaction WHERE phone=? and purpose IN ("Sponser Bonus","Level Recharge Bonus","level_water","Big Recharge Bonus","salery")',[phone]);
  // console.log(tcomm[0]);
  const [teamcommission] = await connection.query(
    "SELECT SUM(commission) as bonus FROM subordinatedata WHERE phone = ? ",
    [phone]
  );
  const [teamcommissionT] = await connection.query(
    "SELECT SUM(commission) as bonus FROM subordinatedata WHERE phone = ? and DATE(date) = ?",
    [phone,today]
  );
  return res.status(200).json({
    message: "Success",
    status: true,
    totalcommission: teamcommission.length > 0 ? teamcommission[0].bonus : 0,
    todaycommission: teamcommissionT.length > 0 ? teamcommissionT[0].bonus : 0,
    datas: user,
    f1: f1s.length,
    f2: f2,
    f3: f3,
    f4: f4,
    list_mems: list_mems,
    total_recharge: total_recharge,
    total_withdraw: total_withdraw,
    total_recharge_today: total_recharge_today,
    total_withdraw_today: total_withdraw_today,
    list_mem_baned: list_mem_baned.length,
    win: win,
    loss: loss,
    list_recharge_news: list_recharge_news,
    list_withdraw_news: list_withdraw_news,
    moneyCTV: moneyCTV,
    redenvelopes_used: redenvelopes_used_today,
    financial_details_today: financial_details_today,
  });
}
    catch (error) {
    console.error("Error :", error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const infoCtv2 = async (req, res) => {
    try{
  const phone = req.body.phone;
  const timeDate = req.body.timeDate;

  function timerJoin(params = "") {
    let date = "";
    if (params) {
      date = new Date(Number(params));
    } else {
      date = Date.now();
      date = new Date(Number(date));
    }
    let years = formateT(date.getFullYear());
    let months = formateT(date.getMonth() + 1);
    let days = formateT(date.getDate());
    let weeks = formateT(date.getDay());

    let hours = formateT(date.getHours());
    let minutes = formateT(date.getMinutes());
    let seconds = formateT(date.getSeconds());
    // return years + '-' + months + '-' + days + ' ' + hours + '-' + minutes + '-' + seconds;
    return years + "-" + months + "-" + days;
  }

  const [user] = await connection.query(
    "SELECT * FROM users WHERE phone = ? ",
    [phone]
  );

  if (user.length == 0) {
    return res.status(200).json({
      message: "Phone Error",
      status: false,
    });
  }
  let userInfo = user[0];
  const [list_mem] = await connection.query(
    "SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ",
    [phone]
  );

  let list_mems = [];
  const [list_mem_today] = await connection.query(
    "SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1 ",
    [phone]
  );
  for (let i = 0; i < list_mem_today.length; i++) {
    let today = timeDate;
    let time = timerJoin(list_mem_today[i].time);
    if (time == today) {
      list_mems.push(list_mem_today[i]);
    }
  }

  let list_recharge_news = [];
  let list_withdraw_news = [];
  for (let i = 0; i < list_mem.length; i++) {
    let phone = list_mem[i].phone;
    const [recharge_today] = await connection.query(
      "SELECT `id`, `status`, `type`,`phone`, `money`, `time` FROM recharge WHERE phone = ? AND status = 1 ",
      [phone]
    );
    const [withdraw_today] = await connection.query(
      "SELECT `id`, `status`,`phone`, `money`, `time` FROM withdraw WHERE phone = ? AND status = 1 ",
      [phone]
    );
    for (let i = 0; i < recharge_today.length; i++) {
      let today = timeDate;
      let time = timerJoin(recharge_today[i].time);
      if (time == today) {
        list_recharge_news.push(recharge_today[i]);
      }
    }
    for (let i = 0; i < withdraw_today.length; i++) {
      let today = timeDate;
      let time = timerJoin(withdraw_today[i].time);
      if (time == today) {
        list_withdraw_news.push(withdraw_today[i]);
      }
    }
  }

  const [redenvelopes_used] = await connection.query(
    "SELECT * FROM redenvelopes_used WHERE phone = ? ",
    [phone]
  );
  let redenvelopes_used_today = [];
  for (let i = 0; i < redenvelopes_used.length; i++) {
    let today = timeDate;
    let time = timerJoin(redenvelopes_used[i].time);
    if (time == today) {
      redenvelopes_used_today.push(redenvelopes_used[i]);
    }
  }

  const [financial_details] = await connection.query(
    "SELECT * FROM financial_details WHERE phone = ? ",
    [phone]
  );
  let financial_details_today = [];
  for (let i = 0; i < financial_details.length; i++) {
    let today = timeDate;
    let time = timerJoin(financial_details[i].time);
    if (time == today) {
      financial_details_today.push(financial_details[i]);
    }
  }

  return res.status(200).json({
    message: "Success",
    status: true,
    datas: user,
    list_mems: list_mems,
    list_recharge_news: list_recharge_news,
    list_withdraw_news: list_withdraw_news,
    redenvelopes_used: redenvelopes_used_today,
    financial_details_today: financial_details_today,
  });

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };

const listRechargeMem = async (req, res) => {
    try{
  let auth = req.cookies.auth;
  let phone = req.params.phone;
  let { pageno, limit } = req.body;

  if (!pageno || !limit) {
    return res.status(200).json({
      code: 0,
      msg: "Không còn dữ liệu",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (pageno < 0 || limit < 0) {
    return res.status(200).json({
      code: 0,
      msg: "Không còn dữ liệu",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (!phone) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [user] = await connection.query(
    "SELECT * FROM users WHERE phone = ? ",
    [phone]
  );
  const [auths] = await connection.query(
    "SELECT * FROM users WHERE token = ? ",
    [auth]
  );

  if (user.length == 0 || auths.length == 0) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let { token, password, otp, level, ...userInfo } = user[0];

  const [recharge] = await connection.query(
    `SELECT * FROM recharge WHERE phone = ? ORDER BY id DESC LIMIT ${pageno}, ${limit} `,
    [phone]
  );
  const [total_users] = await connection.query(
    `SELECT * FROM recharge WHERE phone = ?`,
    [phone]
  );
  return res.status(200).json({
    message: "Success",
    status: true,
    datas: recharge,
    page_total: Math.ceil(total_users.length / limit),
  });
}
    catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const listWithdrawMem = async (req, res) => {
    try{
  let auth = req.cookies.auth;
  let phone = req.params.phone;
  let { pageno, limit } = req.body;

  if (!pageno || !limit) {
    return res.status(200).json({
      code: 0,
      msg: "Không còn dữ liệu",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (pageno < 0 || limit < 0) {
    return res.status(200).json({
      code: 0,
      msg: "Không còn dữ liệu",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (!phone) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [user] = await connection.query(
    "SELECT * FROM users WHERE phone = ? ",
    [phone]
  );
  const [auths] = await connection.query(
    "SELECT * FROM users WHERE token = ? ",
    [auth]
  );

  if (user.length == 0 || auths.length == 0) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let { token, password, otp, level, ...userInfo } = user[0];

  const [withdraw] = await connection.query(
    `SELECT * FROM withdraw WHERE phone = ? ORDER BY id DESC LIMIT ${pageno}, ${limit} `,
    [phone]
  );
  const [total_users] = await connection.query(
    `SELECT * FROM withdraw WHERE phone = ?`,
    [phone]
  );
  return res.status(200).json({
    message: "Success",
    status: true,
    datas: withdraw,
    page_total: Math.ceil(total_users.length / limit),
  });
}
    catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const listRedenvelope = async (req, res) => {
    try{
  let auth = req.cookies.auth;
  let phone = req.params.phone;
  let { pageno, limit } = req.body;

  if (!pageno || !limit) {
    return res.status(200).json({
      code: 0,
      msg: "Không còn dữ liệu",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (pageno < 0 || limit < 0) {
    return res.status(200).json({
      code: 0,
      msg: "Không còn dữ liệu",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }

  if (!phone) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [user] = await connection.query(
    "SELECT * FROM users WHERE phone = ? ",
    [phone]
  );
  const [auths] = await connection.query(
    "SELECT * FROM users WHERE token = ? ",
    [auth]
  );

  if (user.length == 0 || auths.length == 0) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  let { token, password, otp, level, ...userInfo } = user[0];

  const [redenvelopes_used] = await connection.query(
    `SELECT * FROM redenvelopes_used WHERE phone_used = ? ORDER BY id DESC LIMIT ${pageno}, ${limit} `,
    [phone]
  );
  const [total_users] = await connection.query(
    `SELECT * FROM redenvelopes_used WHERE phone_used = ?`,
    [phone]
  );
  return res.status(200).json({
    message: "Success",
    status: true,
    datas: redenvelopes_used,
    page_total: Math.ceil(total_users.length / limit),
  });

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };

const CreatedSalary = async (req, res) => {
  try {
    const phone = req.body.phone;
    const amount = req.body.amount;
    const type = req.body.type;
const notes=req.body.notes
  
    // Check if user with the given phone number exists
    const checkUserQuery = "SELECT * FROM `users` WHERE id_user = ?";
    const [existingUser] = await connection.execute(checkUserQuery, [phone]);

    if (existingUser.length === 0) {
      // If user doesn't exist, return an error
      return res.status(400).json({
        message: "ERROR!!! User with the provided phone number does not exist.",
        status: false,
      });
    }
    let checkTime = timerJoin2(Date.now());
    // If user exists, update the 'users' table
    const updateUserQuery =
      "UPDATE `users` SET `money` = `money` + ? WHERE id_user = ?";
    await connection.execute(updateUserQuery, [amount, phone]);

    // Insert record into 'salary' table
    const insertSalaryQuery =
      "INSERT INTO salary (phone, amount, type, time) VALUES (?, ?, ?, ?)";
    await connection.execute(insertSalaryQuery, [
     existingUser[0].phone,
      amount,
      type,
      checkTime,
    ]);
    await connection.query(
      `INSERT INTO transaction_history SET phone=?, detail=?,type=?, balance=?, time = ?`,
      [existingUser[0].phone, "Bonus", notes, amount, checkTime]
    );
    res
      .status(200)
      .json({ message: "Salary record created successfully", time: checkTime });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getSalary = async (req, res) => {
    try{
  const [rows] = await connection.query(
    `SELECT * FROM salary ORDER BY id DESC`
  );

  const [dailtSelery] = await connection.query(
    `SELECT SUM(amount) as total FROM salary WHERE type = 'daily'`
  );
  const [monthlySelery] = await connection.query(
    `SELECT SUM(amount) as total FROM salary WHERE type = 'monthly'`
  );
  const [earlySelery] = await connection.query(
    `SELECT SUM(amount) as total FROM salary WHERE type = 'yearsly'`
  );

  const totalDailySalary = dailtSelery[0].total;
  const totalMonthlySalary = monthlySelery[0].total;
  const totalEarlySalary = earlySelery[0].total;

  if (!rows) {
    return res.status(200).json({
      message: "Failed",
      status: false,
    });
  }
  return res.status(200).json({
    message: "Success",
    status: true,
    data: {},
    rows: rows,
    totalDailySalary: totalDailySalary,
    totalMonthlySalary: totalMonthlySalary,
    totalEarlySalary: totalEarlySalary,
  });

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };

const listBet = async (req, res) => {
    try{
  let auth = req.cookies.auth;
  let phone = req.params.phone;
  let { pageno, limit } = req.body;

  if (!pageno || !limit || pageno < 0 || limit < 0) {
    return res.status(200).json({
      code: 0,
      msg: "Không còn dữ liệu",
      data: { gameslist: [] },
      status: false,
    });
  }

  if (!phone) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: Date.now(),
    });
  }

  const [user] = await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);
  const [auths] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);

  if (user.length === 0 || auths.length === 0) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: Date.now(),
    });
  }
  

  const offset = pageno - 1; // Adjust for 1-based index
  const limits = limit - pageno + 1; // Number of rows to fetch


  const [listBet] = await connection.query(
    `SELECT id, id_product, phone, code, invite, stage, result, level, money, amount, fee, 
            \`get\`, game, bet, status, today AS date, time, 'minutes_1' AS source
     FROM minutes_1 
     WHERE phone = ? AND status != 0 
     UNION ALL
     SELECT id, id_product, phone, code, invite, stage, result, level, money, price AS amount, fee, 
            \`get\`, game, join_bet AS bet, status, bet_data AS date, time, 'result_5d' AS source
     FROM result_5d
     WHERE phone = ? AND status != 0
     UNION ALL
     SELECT id, id_product, phone, code, invite, stage, result, level, money, price AS amount, fee, 
            \`get\`, game, join_bet AS bet, status, bet_data AS date, time, 'result_k3' AS source
     FROM result_k3
     WHERE phone = ? AND status != 0
     ORDER BY date DESC, time DESC
     LIMIT ${limits} OFFSET ${offset}`,
    [phone, phone, phone]
  );

  const [total_users] = await connection.query(
    `SELECT COUNT(*) AS total FROM (
     SELECT id FROM minutes_1 WHERE phone = ? AND status != 0
     UNION ALL
     SELECT id FROM result_5d WHERE phone = ? AND status != 0
     UNION ALL
     SELECT id FROM result_k3 WHERE phone = ? AND status != 0
     ) AS combined`,
    [phone, phone, phone]
  );

  return res.status(200).json({
    message: "Success",
    status: true,
    datas: listBet,
    page_total: Math.ceil(total_users[0].total / limit)
  });

    }catch (error) {
    console.error("Error :", error);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };



const listOrderOld = async (req, res) => {
    try{
  let { gameJoin } = req.body;

  let checkGame = ["1", "3", "5", "10"].includes(String(gameJoin));
  if (!checkGame) {
    return res.status(200).json({
      code: 0,
      msg: "Không còn dữ liệu",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }
  let game = Number(gameJoin);

  let join = "";
  if (game == 1) join = "k5d";
  if (game == 3) join = "k5d3";
  if (game == 5) join = "k5d5";
  if (game == 10) join = "k5d10";

  const [k5d] = await connection.query(
    `SELECT * FROM 5d WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT 10 `
  );
  const [period] = await connection.query(
    `SELECT period FROM 5d WHERE status = 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `
  );
  const [waiting] = await connection.query(
    `SELECT * FROM result_5d WHERE status = 0 AND game = ${game} ORDER BY id ASC `
  );
  const [settings] = await connection.query(`SELECT ${join} FROM admin`);
  if (k5d.length == 0) {
    return res.status(200).json({
      code: 0,
      msg: "Không còn dữ liệu",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }
  if (!k5d[0] || !period[0]) {
    return res.status(200).json({
      message: "Error!",
      status: false,
    });
  }
  return res.status(200).json({
    code: 0,
    msg: "Nhận thành công",
    data: {
      gameslist: k5d,
    },
    bet: waiting,
    settings: settings,
    join: join,
    period: period[0].period,
    status: true,
  });
}
    catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const listOrderOldK3 = async (req, res) => {
    try{
  let { gameJoin } = req.body;

  let checkGame = ["1", "3", "5", "10"].includes(String(gameJoin));
  if (!checkGame) {
    return res.status(200).json({
      code: 0,
      msg: "Không còn dữ liệu",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }
  let game = Number(gameJoin);

  let join = "";
  if (game == 1) join = "k3d";
  if (game == 3) join = "k3d3";
  if (game == 5) join = "k3d5";
  if (game == 10) join = "k3d10";

  const [k5d] = await connection.query(
    `SELECT * FROM k3 WHERE status != 0 AND game = '${game}' ORDER BY id DESC LIMIT 10 `
  );
  const [period] = await connection.query(
    `SELECT period FROM k3 WHERE status = 0 AND game = '${game}' ORDER BY id DESC LIMIT 1 `
  );
  const [waiting] = await connection.query(
    `SELECT phone, money, price, typeGame, amount, bet FROM result_k3 WHERE status = 0 AND game = '${game}' ORDER BY id ASC `
  );
  const [settings] = await connection.query(`SELECT ${join} FROM admin`);
  if (k5d.length == 0) {
    return res.status(200).json({
      code: 0,
      msg: "Không còn dữ liệu",
      data: {
        gameslist: [],
      },
      status: false,
    });
  }
  if (!k5d[0] || !period[0]) {
    return res.status(200).json({
      message: "Error!",
      status: false,
    });
  }
  return res.status(200).json({
    code: 0,
    msg: "Nhận thành công",
    data: {
      gameslist: k5d,
    },
    bet: waiting,
    settings: settings,
    join: join,
    period: period[0].period,
    status: true,
  });

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };

const editResult = async (req, res) => {
  let { game, list } = req.body;

  if (!list || !game) {
    return res.status(200).json({
      message: "ERROR!!!",
      status: false,
    });
  }

  let join = "";
  if (game == 1) join = "k5d";
  if (game == 3) join = "k5d3";
  if (game == 5) join = "k5d5";
  if (game == 10) join = "k5d10";

  const sql = `UPDATE admin SET ${join} = ?`;
  await connection.execute(sql, [list]);
  return res.status(200).json({
    message: "Chỉnh sửa thành công", //Register Sucess
    status: true,
  });
};

const editResult2 = async (req, res) => {
  let { game, list } = req.body;

  if (!list || !game) {
    return res.status(200).json({
      message: "ERROR!!!",
      status: false,
    });
  }

  let join = "";
  if (game == 1) join = "k3d";
  if (game == 3) join = "k3d3";
  if (game == 5) join = "k3d5";
  if (game == 10) join = "k3d10";

  const sql = `UPDATE admin SET ${join} = ?`;
  await connection.execute(sql, [list]);
  return res.status(200).json({
    message: "Chỉnh sửa thành công", //Register Sucess
    status: true,
  });
};
const todayrechargeexport = async (req, res) => {
  const today =
    req.query.today && req.query.today != "" ? req.query.today : timerJoin2();
  const purpose = req.query.purpose;
  let query;
  let allparameter = [];
  try {
    if (purpose == "todayrecharge") {
      query = "SELECT * FROM recharge WHERE date(today)=?";
      allparameter = [today];
    } else if (purpose == "totalrecharge") {
      query = "SELECT * FROM recharge";
    } else if (purpose == "totalwithdarwal") {
      query = "SELECT * FROM withdraw";
    } else if (purpose == "todaywithdarwal") {
      query = "SELECT * FROM withdraw WHERE date(today)=?";
      allparameter = [today];
    } else if (purpose == "todaybetting") {
      query = "SELECT * FROM minutes_1 WHERE date(today)=?";
      allparameter = [today];
    } else if (purpose == "totalbetting") {
      query = "SELECT * FROM minutes_1";
    }
    const [rows] = await connection.query(query, allparameter);
    if (!rows || rows[0].length <= 0) {
      return res.status(404).json({ message: "No data found" });
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    // Add column headers
    const columns = Object.keys(rows[0]);
    worksheet.addRow(columns);

    // Add rows from the database result
    rows.forEach((row) => {
      worksheet.addRow(Object.values(row));
    });

    // Generate a unique file name
    const fileName = `data_${Date.now()}.xlsx`;
    const filePath = `./exports/${fileName}`; // Update with your desired file path

    // Create the 'exports' directory if it doesn't exist
    if (!fs.existsSync("./exports")) {
      fs.mkdirSync("./exports");
    }

    // Write the workbook to a file
    await workbook.xlsx.writeFile(filePath);

    // Set the response headers for file download
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Stream the file to the client
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Delete the file after it's downloaded
    fileStream.on("end", () => {
      fs.unlinkSync(filePath);
      //console.log("File downloaded and deleted successfully");
    });
  } catch (error) {
    //console.log("Error exporting to Excel: " + error);
    res.status(500).json({ message: "Error exporting to Excel" });
  }
};

const createNotification = async (req, res) => {
  let auth = req.cookies.auth;
  const { title, description } = req.body;
  try {
    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
      [auth]
    );
    let userInfo = user[0];
    if (!user) {
      return res.status(200).json({
        message: "Invalid user",
        status: false,
        timeStamp: timeNow,
      });
    }

    let checkTime = timerJoin2(Date.now());

    const [notification] = await connection.query(
      `INSERT INTO notification SET phone = '${userInfo.phone}', heading='${title}', message='${description}',date='${checkTime}'`
    );

    return res.status(200).json({
      message: "notification create successful",
      data: notification,
      status: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      status: false,
    });
  }
};

const updateNotification = async (req, res) => {
    try{
  let auth = req.cookies.auth;
  const { title, description, id } = req.body;
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  const [user] = await connection.query(
    "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
    [auth]
  );
  let userInfo = user[0];
  if (!user) {
    return res.status(200).json({
      message: "Invalid user",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [notification] = await connection.query(
    `UPDATE notification SET phone = '${userInfo.phone}', heading='${title}', message='${description}' WHERE id='${id}'`
  );

  return res.status(200).json({
    message: "notification update successful",
    data: notification,
    status: true,
  });
}
    catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const singleNotificationDelete = async (req, res) => {
  let auth = req.cookies.auth;
  const id = req.params.id;
  try {
    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [result] = await connection.query(
      `DELETE FROM notification WHERE id='${id}'`
    );

    return res.status(200).json({
      message: "notification delete successful",
      data: result,
      status: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "notification get successful",

      status: true,
    });
  }
};

const getNotification = async (req, res) => { 
    try{
  const [notifications] = await connection.query("SELECT * FROM notification");
  return res.status(200).json({
    message: "notification recieve successful",
    data: notifications,
    status: true,
  });
}
    catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const minimumRecharge = async (req, res) => {
  let auth = req.cookies.auth;
  const { recharge, type, withdraw, bet } = req.body;
  try {
    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (type == "recharge") {
      const [result] = await connection.query(
        `UPDATE minimumValue SET recharge=? Where type="check" `,
        [recharge]
      );
    }
    if (type == "withdraw") {
      const [result] = await connection.query(
        `UPDATE minimumValue SET withdraw=? Where type="check" `,
        [withdraw]
      );
    }
    if (type == "bet") {
      const [result] = await connection.query(
        `UPDATE minimumValue SET betCommission=? Where type="check" `,
        [bet]
      );
    }

    return res.status(200).json({
      message: "notification  successful",
      // data: result,
      status: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "notification get successful",

      status: true,
    });
  }
};

const getLevelInfo = async (req, res) => {
    try{
  const [rows] = await connection.query("SELECT * FROM `level`");

  if (!rows) {
    return res.status(200).json({
      message: "Failed",
      status: false,
    });
  }
  return res.status(200).json({
    message: "Success",
    status: true,
    data: {},
    rows: rows,
  });

  // const [recharge] = await connection.query('SELECT * FROM recharge WHERE `phone` = ? AND status = 1', [rows[0].phone]);
  // let totalRecharge = 0;
  // recharge.forEach((data) => {
  //     totalRecharge += data.money;
  // });
  // const [withdraw] = await connection.query('SELECT * FROM withdraw WHERE `phone` = ? AND status = 1', [rows[0].phone]);
  // let totalWithdraw = 0;
  // withdraw.forEach((data) => {
  //     totalWithdraw += data.money;
  // });

  // const { id, password, ip, veri, ip_address, status, time, token, ...others } = rows[0];
  // return res.status(200).json({
  //     message: 'Success',
  //     status: true,
  //     data: {
  //         code: others.code,
  //         id_user: others.id_user,
  //         name_user: others.name_user,
  //         phone_user: others.phone,
  //         money_user: others.money,
  //     },
  //     totalRecharge: totalRecharge,
  //     totalWithdraw: totalWithdraw,
  //     timeStamp: timeNow,
  // });

    }catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
    };

// admin data get by user

const downlinerecharge_data_admin = async (req, res) => {
  let { id_user } = req.body;
  const { date } = req.body;

  if (!id_user) {
    return res.status(200).json({
      message: "id undefined",
      status: false,
      timeStamp: new Date().getTime(),
    });
  }

  try {
    // Fetch user information based on the provided token
    const [user] = await connection.query(
      "SELECT `phone`, `code`, `invite` FROM users WHERE `id_user` = ?",
      [id_user]
    );

    if (!user.length) {
      return res.status(200).json({
        message: "Invalid id_user",
        status: false,
      });
    }

    let userInfo = user[0];

    // Fetch all downline users up to 6 levels deep
    const [allUsers] = await connection.query(
      `
        WITH RECURSIVE InviteCTE AS (
            SELECT id_user, name_user, phone, code, invite, rank, total_money, 1 AS depth
            FROM users
            WHERE invite = ?
            UNION ALL
            SELECT u.id_user, u.name_user, u.phone, u.code, u.invite, u.rank, u.total_money, c.depth + 1
            FROM users u
            INNER JOIN InviteCTE c ON u.invite = c.code
            WHERE c.depth < 6
        )
        SELECT * FROM InviteCTE;
      `,
      [userInfo.code]
    );

    const [level] = await connection.query("SELECT * FROM level");

    // Check if level data contains the required rows

    // Build commissionRatios object based on fetched level data
    const commissionRatios = {
      1: level[0]?.f1 / 100,
      2: level[1]?.f1 / 100,
      3: level[2]?.f1 / 100,
      4: level[3]?.f1 / 100,
      5: level[4]?.f1 / 100,
      6: level[5]?.f1 / 100,
    };

    // Collect recharge data for each user using Promises
    const rechargePromises = allUsers.map(async (user) => {
      const levelRatio = commissionRatios[user.depth] || 0;
      const [userCombinedTotal] = await connection.query(
        `
        SELECT IFNULL(SUM(overall_total_money), 0) as grand_total_money
        FROM (
            SELECT SUM(\`money\`) as overall_total_money 
            FROM minutes_1 
            WHERE \`phone\` = ? AND DATE(\`today\`) = ?
            UNION ALL
            SELECT SUM(\`money\`) as overall_total_money 
            FROM result_k3 
            WHERE \`phone\` = ? AND DATE(\`bet_data\`) = ?
            UNION ALL
            SELECT SUM(\`money\`) as overall_total_money 
            FROM result_5d 
            WHERE \`phone\` = ? AND DATE(\`bet_data\`) = ?
        ) combined_table
        `,
        [user.phone, date, user.phone, date, user.phone, date]
      );

      const [rechargeRecord] = await connection.query(
        `
        SELECT IFNULL(SUM(\`money\`), 0) as grand_total_money 
        FROM \`recharge\` 
        WHERE \`phone\` = ? AND \`status\` = 1 AND DATE(\`today\`) = ?
        `,
        [user.phone, date]
      );

      const [deposits] = await connection.query(
        `
        SELECT \`id\`, \`id_order\`, \`transaction_id\`, \`utr\`, \`phone\`, \`money\`, \`type\`, \`status\`, \`today\`, \`url\`, \`time\` 
        FROM \`recharge\` 
        WHERE \`phone\` = ? AND \`status\` = 1 AND DATE(\`today\`) = ?
        `,
        [user.phone, date]
      );

      const [userCombinedTotalCount] = await connection.query(
        `
        SELECT COUNT(*) AS row_count
        FROM (
            SELECT phone 
            FROM minutes_1 
            WHERE \`phone\` = ? AND DATE(\`today\`) = ?
            UNION ALL
            SELECT phone 
            FROM result_k3 
            WHERE \`phone\` = ? AND DATE(\`bet_data\`) = ?
            UNION ALL
            SELECT phone 
            FROM result_5d 
            WHERE \`phone\` = ? AND DATE(\`bet_data\`) = ?
        ) AS combined_table
        `,
        [user.phone, date, user.phone, date, user.phone, date]
      );

      //const [commissions] = await connection.query(
      //  `
      //  SELECT SUM(\`commission\`) as total_subordinatedata_amount
      //  FROM \`subordinatedata\`
      //  WHERE \`phone\` = ? AND DATE(\`date\`) = ?
      //  `,
      //  [user.phone, date]
      //);
      //
      //const totalCommissionsAmount = parseFloat(commissions[0]?.total_subordinatedata_amount || 0).toFixed(2);

      const rowCount = userCombinedTotalCount[0]?.row_count || 0;
      const isBetter =
        parseFloat(userCombinedTotal[0]?.grand_total_money || 0) > 0;
      const totalCommissionsAmount = parseFloat(
        (
          parseFloat(userCombinedTotal[0]?.grand_total_money || 0) * levelRatio
        ).toFixed(2)
      );
      let date1 = new Date(date);
      date1.setUTCHours(0, 0, 0, 0); // Set time to midnight UTC

      let timestamp = date1.getTime();

      //console.log(timestamp);
      return {
        totalBetAmount: parseFloat(
          userCombinedTotal[0]?.grand_total_money || 0
        ).toFixed(2),
        totalRechargeAmount: parseFloat(
          rechargeRecord[0]?.grand_total_money || 0
        ).toFixed(2),
        totalCommsionsAmount: totalCommissionsAmount,
        userLevel: user.depth, // Using depth as level
        userId: user.id_user,
        dates: timestamp,
        rechargeCount: deposits.length,
        betCount: rowCount,
        isBetter,
        firstRecharge: deposits.length > 0,
      };
    });

    let rechargeData = await Promise.all(rechargePromises);

    // Filter users with non-zero values
    rechargeData = rechargeData.filter(
      (data) =>
        data.totalBetAmount > 0 ||
        data.totalRechargeAmount > 0 ||
        data.totalCommissionsAmount > 0
    );

    // Calculate totals
    const total_first_recharge_count = rechargeData.filter(
      (data) => data.firstRecharge
    ).length;
    const total_recharge_count = rechargeData.reduce(
      (sum, data) => sum + data.rechargeCount,
      0
    );
    const total_recharge_amount = rechargeData
      .reduce((sum, data) => sum + parseFloat(data.totalRechargeAmount), 0)
      .toFixed(2);
    const total_bet_count = rechargeData.reduce(
      (sum, data) => sum + data.betCount,
      0
    );
    const total_bet_amount = rechargeData
      .reduce((sum, data) => sum + parseFloat(data.totalBetAmount), 0)
      .toFixed(2);
    const better_number = rechargeData.filter((data) => data.isBetter).length;

    // Group data by levels for the additional array
    const levelData = rechargeData.reduce((acc, data) => {
      const level = data.userLevel;
      if (!acc[level]) {
        acc[level] = {
          total_first_recharge_count: 0,
          total_recharge_count: 0,
          total_recharge_amount: 0,
          total_bet_count: 0,
          total_bet_amount: 0,
          better_number: 0,
        };
      }

      acc[level].total_first_recharge_count += data.firstRecharge ? 1 : 0;
      acc[level].total_recharge_count += data.rechargeCount;
      acc[level].total_recharge_amount += parseFloat(data.totalRechargeAmount);
      acc[level].total_bet_count += data.betCount;
      acc[level].total_bet_amount += parseFloat(data.totalBetAmount);
      acc[level].better_number += data.isBetter ? 1 : 0;
      return acc;
    }, {});

    // Convert levelData object into an array
    const levelDataArray = Object.keys(levelData).map((level) => ({
      level: parseInt(level),
      total_first_recharge_count: levelData[level].total_first_recharge_count,
      total_recharge_count: levelData[level].total_recharge_count,
      total_recharge_amount: levelData[level].total_recharge_amount.toFixed(2),
      total_bet_count: levelData[level].total_bet_count,
      total_bet_amount: levelData[level].total_bet_amount.toFixed(2),
      better_number: levelData[level].better_number,
    }));

    // Return the results
    return res.status(200).json({
      message: "Success",
      status: true,
      timeStamp: new Date().getTime(),
      total_first_recharge_count,
      total_recharge_count,
      total_recharge_amount,
      date,
      total_bet_count,
      total_bet_amount,
      better_number,
      datas: rechargeData,
      levelData: levelDataArray, // Additional array with level-specific data
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({
      message: error.message,
      status: false,
      timeStamp: new Date().getTime(),
    });
  }
};



const downlinerecharge_data_adminAll = async (req, res) => {
  let { id_user } = req.body;


  if (!id_user) {
    return res.status(200).json({
      message: "id undefined",
      status: false,
      timeStamp: new Date().getTime(),
    });
  }

  try {
    // Fetch user information based on the provided token
    const [user] = await connection.query(
      "SELECT `phone`, `code`, `invite` FROM users WHERE `id_user` = ?",
      [id_user]
    );

    if (!user.length) {
      return res.status(200).json({
        message: "Invalid id_user",
        status: false,
      });
    }

    let userInfo = user[0];

    // Fetch all downline users up to 6 levels deep
    const [allUsers] = await connection.query(
      `
        WITH RECURSIVE InviteCTE AS (
            SELECT id_user, name_user, phone, code, invite, rank, total_money, 1 AS depth
            FROM users
            WHERE invite = ?
            UNION ALL
            SELECT u.id_user, u.name_user, u.phone, u.code, u.invite, u.rank, u.total_money, c.depth + 1
            FROM users u
            INNER JOIN InviteCTE c ON u.invite = c.code
            WHERE c.depth < 6
        )
        SELECT * FROM InviteCTE;
      `,
      [userInfo.code]
    );

    const [level] = await connection.query("SELECT * FROM level");

    // Check if level data contains the required rows

    // Build commissionRatios object based on fetched level data
    const commissionRatios = {
      1: level[0]?.f1 / 100,
      2: level[1]?.f1 / 100,
      3: level[2]?.f1 / 100,
      4: level[3]?.f1 / 100,
      5: level[4]?.f1 / 100,
      6: level[5]?.f1 / 100,
    };

    // Collect recharge data for each user using Promises
    const rechargePromises = allUsers.map(async (user) => {
      const levelRatio = commissionRatios[user.depth] || 0;
      const [userCombinedTotal] = await connection.query(
        `
        SELECT IFNULL(SUM(overall_total_money), 0) as grand_total_money
        FROM (
            SELECT SUM(\`money\`) as overall_total_money 
            FROM minutes_1 
            WHERE \`phone\` = ? 
            UNION ALL
            SELECT SUM(\`money\`) as overall_total_money 
            FROM result_k3 
            WHERE \`phone\` = ?
            UNION ALL
            SELECT SUM(\`money\`) as overall_total_money 
            FROM result_5d 
            WHERE \`phone\` = ? 
        ) combined_table
        `,
        [user.phone,  user.phone, user.phone]
      );

      const [rechargeRecord] = await connection.query(
        `
        SELECT IFNULL(SUM(\`money\`), 0) as grand_total_money 
        FROM \`recharge\` 
        WHERE \`phone\` = ? AND \`status\` = 1 
        `,
        [user.phone]
      );

      const [deposits] = await connection.query(
        `
        SELECT \`id\`, \`id_order\`, \`transaction_id\`, \`utr\`, \`phone\`, \`money\`, \`type\`, \`status\`, \`today\`, \`url\`, \`time\` 
        FROM \`recharge\` 
        WHERE \`phone\` = ? AND \`status\` = 1 
        `,
        [user.phone]
      );

      const [userCombinedTotalCount] = await connection.query(
        `
        SELECT COUNT(*) AS row_count
        FROM (
            SELECT phone 
            FROM minutes_1 
            WHERE \`phone\` = ?
            UNION ALL
            SELECT phone 
            FROM result_k3 
            WHERE \`phone\` = ?
            UNION ALL
            SELECT phone 
            FROM result_5d 
            WHERE \`phone\` = ?
        ) AS combined_table
        `,
        [user.phone,  user.phone, user.phone]
      );

      //const [commissions] = await connection.query(
      //  `
      //  SELECT SUM(\`commission\`) as total_subordinatedata_amount
      //  FROM \`subordinatedata\`
      //  WHERE \`phone\` = ? AND DATE(\`date\`) = ?
      //  `,
      //  [user.phone, date]
      //);
      //
      //const totalCommissionsAmount = parseFloat(commissions[0]?.total_subordinatedata_amount || 0).toFixed(2);

      const rowCount = userCombinedTotalCount[0]?.row_count || 0;
      const isBetter =
        parseFloat(userCombinedTotal[0]?.grand_total_money || 0) > 0;
      const totalCommissionsAmount = parseFloat(
        (
          parseFloat(userCombinedTotal[0]?.grand_total_money || 0) * levelRatio
        ).toFixed(2)
      );
   

      //console.log(timestamp);
      return {
        totalBetAmount: parseFloat(
          userCombinedTotal[0]?.grand_total_money || 0
        ).toFixed(2),
        totalRechargeAmount: parseFloat(
          rechargeRecord[0]?.grand_total_money || 0
        ).toFixed(2),
        totalCommsionsAmount: totalCommissionsAmount,
        userLevel: user.depth, // Using depth as level
        userId: user.id_user,
   
        rechargeCount: deposits.length,
        betCount: rowCount,
        isBetter,
        firstRecharge: deposits.length > 0,
      };
    });

    let rechargeData = await Promise.all(rechargePromises);

    // Filter users with non-zero values
    rechargeData = rechargeData.filter(
      (data) =>
        data.totalBetAmount > 0 ||
        data.totalRechargeAmount > 0 ||
        data.totalCommissionsAmount > 0
    );

    // Calculate totals
    const total_first_recharge_count = rechargeData.filter(
      (data) => data.firstRecharge
    ).length;
    const total_recharge_count = rechargeData.reduce(
      (sum, data) => sum + data.rechargeCount,
      0
    );
    const total_recharge_amount = rechargeData
      .reduce((sum, data) => sum + parseFloat(data.totalRechargeAmount), 0)
      .toFixed(2);
    const total_bet_count = rechargeData.reduce(
      (sum, data) => sum + data.betCount,
      0
    );
    const total_bet_amount = rechargeData
      .reduce((sum, data) => sum + parseFloat(data.totalBetAmount), 0)
      .toFixed(2);
    const better_number = rechargeData.filter((data) => data.isBetter).length;

    // Group data by levels for the additional array
    const levelData = rechargeData.reduce((acc, data) => {
      const level = data.userLevel;
      if (!acc[level]) {
        acc[level] = {
          total_first_recharge_count: 0,
          total_recharge_count: 0,
          total_recharge_amount: 0,
          total_bet_count: 0,
          total_bet_amount: 0,
          better_number: 0,
        };
      }

      acc[level].total_first_recharge_count += data.firstRecharge ? 1 : 0;
      acc[level].total_recharge_count += data.rechargeCount;
      acc[level].total_recharge_amount += parseFloat(data.totalRechargeAmount);
      acc[level].total_bet_count += data.betCount;
      acc[level].total_bet_amount += parseFloat(data.totalBetAmount);
      acc[level].better_number += data.isBetter ? 1 : 0;
      return acc;
    }, {});

    // Convert levelData object into an array
    const levelDataArray = Object.keys(levelData).map((level) => ({
      level: parseInt(level),
      total_first_recharge_count: levelData[level].total_first_recharge_count,
      total_recharge_count: levelData[level].total_recharge_count,
      total_recharge_amount: levelData[level].total_recharge_amount.toFixed(2),
      total_bet_count: levelData[level].total_bet_count,
      total_bet_amount: levelData[level].total_bet_amount.toFixed(2),
      better_number: levelData[level].better_number,
    }));

    // Return the results
    return res.status(200).json({
      message: "Success",
      status: true,
      timeStamp: new Date().getTime(),
      total_first_recharge_count,
      total_recharge_count,
      total_recharge_amount,
   
      total_bet_count,
      total_bet_amount,
      better_number,
      datas: rechargeData,
      levelData: levelDataArray, // Additional array with level-specific data
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({
      message: error.message,
      status: false,
      timeStamp: new Date().getTime(),
    });
  }
};


const CreatedSalaryRecord = async (req, res) => {
  return res.render("manage/CreatedSalaryRecord.ejs");
};

const levelSetting = async (req, res) => {
  return res.render("manage/levelSetting.ejs");
};
const updateLevel = async (req, res) => {
  try {
    let id = req.body.id;
    let f1 = req.body.f1;
    let f2 = req.body.f2;
    let f3 = req.body.f3;
    let f4 = req.body.f4;

    //console.log("level : " + id, f1, f2, f3, f4);

    await connection.query(
      "UPDATE `level` SET `f1`= ? ,`f2`= ? ,`f3`= ? ,`f4`= ?  WHERE `id` = ?",
      [f1, f2, f3, f4, id]
    );

    // Send a success response to the client
    res.status(200).json({
      message: "Update successful",
      status: true,
    });
  } catch (error) {
    console.error("Error updating level:", error);

    // Send an error response to the client
    res.status(500).json({
      message: "Update failed",
      status: false,
      error: error.message,
    });
  }
};

const adminaddUSDT = async (req, res) => {
  let phone = req.body.phone;
  let sdt = req.body.usdt;

  try {
    if (!sdt || !phone) {
      return res.status(200).json({
        message: "Please enter all field",
        status: false,
      });
    }

    const [user_bank] = await connection.query(
      "SELECT * FROM user_bank WHERE phone = ? ",
      [phone]
    );
    if (user_bank.length === 0) {
      return res.status(200).json({
        message: "Invalid phone number",
        status: false,
      });
    }

    await connection.query(
      "UPDATE user_bank SET sdt=?, chi_nhanh = ? WHERE phone = ?",
      [sdt, sdt, phone]
    );
    return res.status(200).json({
      message: "your account is updated",
      status: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "your account is updated",
      status: false,
      error: error.message,
    });
  }
};

const getBanner = async (req, res) => {
  try {
    const [banners] = await connection.query("SELECT * FROM `banner`");
    const [activity] = await connection.query(
      "SELECT * FROM `banner_activity`"
    );
    const [gameall] = await connection.query("SELECT * FROM `gameAll`");
    const [chennal] = await connection.query(
      "SELECT * FROM `recharge_chennal`"
    );
    return res.status(200).json({
      message: "get banner successful",
      status: true,
      data: banners[0],
      activity: activity[0],
      gameall: gameall[0],
      chennal: chennal[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      status: false,
      error: error.message,
    });
  }
};

const updateBanner = async (req, res) => {
  const { ban1, ban2, ban3, ban4, ban5, ban6, ban7, ban8, ban9, ban10 } = req.body;

  try {
    const [banners] = await connection.query(
      "UPDATE banner SET ban1 = ?,ban2=?,ban3=?,ban4=?,ban5=?,ban6=?,ban7=?,ban8=?,ban9=?,ban10=?",
      [ban1, ban2, ban3, ban4, ban5, ban6, ban7, ban8, ban9, ban10]
    );
    return res.status(200).json({
      message: "banner update successful",
      status: true,
      data: banners,
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      status: false,
      error: error.message,
    });
  }
};

const updateActivityBanner = async (req, res) => {
  const {
    ban1,
    ban11,
    ban2,
    ban22,
    ban3,
    ban33,
    ban4,
    ban44,
    ban5,
    ban55,
    ban6,
    ban66,
    ban7,
    ban77,
    ban8,
    ban88,
    ban888,
    telelink,
        telelink2,
      ban9,
    ban99,
     ban992,
    ban999,
    ban9992,
    ban9999,
    ban99992,
    ban101,
    ban1012,
     ban102,
      ban103,
       ban104,
        ban105,
         ban106,
          ban107,
           ban108,
            ban109,
             ban110,
  } = req.body;

  try {
    const [banners] = await connection.query(
      "UPDATE banner_activity SET ban1 = ?,ban11=?,ban2=?,ban22=?,ban3=?,ban33=?,ban4=?,ban44=?,ban5=?,ban55=?,ban6=?,ban66=?,ban7=?,ban77=?,ban8=?,ban88=?,ban888=?,telelink=?,telelink2=?,ban9=?,ban99=?,ban992=?,ban999=?,ban9992=?,ban9999=?,ban99992=?,ban101=?,ban1012=?,ban102=?,ban103=?,ban104=?,ban105=?,ban106=?,ban107=?,ban108=?,ban109=?,ban110=?",
      [
       ban1,
    ban11,
    ban2,
    ban22,
    ban3,
    ban33,
    ban4,
    ban44,
    ban5,
    ban55,
    ban6,
    ban66,
    ban7,
    ban77,
    ban8,
    ban88,
    ban888,
    telelink,
        telelink2,
      ban9,
    ban99,
     ban992,
    ban999,
    ban9992,
    ban9999,
    ban99992,
    ban101,
    ban1012,
     ban102,
      ban103,
       ban104,
        ban105,
         ban106,
          ban107,
           ban108,
            ban109,
             ban110,
      ]
    );
    return res.status(200).json({
      message: "banner update successful",
      status: true,
      data: banners,
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      status: false,
      error: error.message,
    });
  }
};

const updateLogo = async (req, res) => {
  const { name, logo, logo1, loader, favicon } = req.body;


try {
  const [banners] = await connection.query(
    "UPDATE gameAll SET name = ?, logo = ?, logo1 = ?, loader = ?, favicon = ?",
    [name, logo, logo1, loader, favicon]
  );
    return res.status(200).json({
      message: "banner update successful",
      status: true,
      data: banners,
    });
  } catch (error) {
      //console.log("ee",error)
    return res.status(500).json({
      message: "internal server error",
      status: false,
      error: error.message,
    });
  }
};

const updateChennal = async (req, res) => {
  const { chennal1, status1, chennal2, status2, chennal3, status3, apiKey } =
    req.body;

  try {
    const [banners] = await connection.query(
      "UPDATE recharge_chennal SET chennal1 = ?,status1=?,chennal2=?,status2=?,chennal3=?,status3=?, key_id=?",
      [chennal1, status1, chennal2, status2, chennal3, status3, apiKey]
    );
    return res.status(200).json({
      message: "chennal update successful",
      status: true,
      data: banners,
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      status: false,
      error: error.message,
    });
  }
};

const getDataRecharge = async (req, res) => {
  const { id, date } = req.body;

  if (!id) {
    return res.status(400).json({
      message: "id undefined",
      status: false,
    });
  }

  try {
    // Get today's date in the required format (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];

    if (!date) {
      return res.status(400).json({
        message: "endDate is required",
        status: false,
      });
    }

    // Fetch user information
    const [user] = await connection.query(
      "SELECT `phone` FROM users WHERE `id_user` = ?",
      [id]
    );

    if (user.length === 0) {
      //console.log("User not found for ID:", id);
      return res.status(404).json({
        message: "User not found",
        status: false,
      });
    }

    // Query the database
    const [rechargeData] = await connection.execute(
      "SELECT `phone`, `money`, `today` FROM recharge WHERE phone = ? AND status = 1 AND DATE(`today`) BETWEEN ? AND ?",
      [user[0].phone, date, today]
    );

    const [withdrawData] = await connection.execute(
      "SELECT `phone`, `money`, `today` FROM withdraw WHERE phone = ? AND status = 1 AND DATE(`today`) BETWEEN ? AND ?",
      [user[0].phone, date, today] // Fetch data for all dates between the selected date and today
    );

    // Combine the data
    const combinedData = [
      ...rechargeData.map((item) => ({ ...item, type: "Recharge" })),
      ...withdrawData.map((item) => ({ ...item, type: "Withdraw" })),
    ];

    if (combinedData.length === 0) {
      //console.log("No data found for the given date range.");
      return res.status(404).json({
        message: "No data found for the given date range",
        status: false,
      });
    }

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(combinedData);
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Recharge & Withdraw Data"
    );

    // Save workbook to temporary file
    const filePath = path.join(__dirname, "RechargeWithdrawData.xlsx");
    XLSX.writeFile(workbook, filePath);

    // Send file to client
    res.download(filePath, "RechargeWithdrawData.xlsx", (err) => {
      if (err) {
        console.error("Error sending file:", err);
      }
      fs.unlinkSync(filePath); // Clean up temporary file
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    res.status(500).json({
      message: "Error exporting data",
      status: false,
    });
  }
};

const vipsection = async (req, res) => {
  return res.render("manage/vip.ejs");
};
const FirstDepositBonus = async (req, res) => {
  return res.render("manage/FirstDepositBonus.ejs");
};
const profitloss = async (req, res) => {
  return res.render("manage/profitloss.ejs");
};
const createsubpanel = async (req, res) => {
  return res.render("manage/createsubpanel.ejs");
};
const llegaltrade = async (req, res) => {
  return res.render("manage/llegaltrade.ejs");
};
const Supportsection = async (req, res) => {
  return res.render("manage/supportsection.ejs");
};
const activitysettings = async (req, res) => {
  return res.render("manage/activitysettings.ejs");
};

const spinwheel = async (req, res) => {
  return res.render("manage/spinwheel.ejs");
};

const InvitationBonus = async (req, res) => {
  return res.render("manage/invitationbonus.ejs");
};

const attendanceBonus = async (req, res) => {
  const { days } = req.body;
  //console.log("Processing attendance bonus", days);

  // let auth = req.cookies.auth;

  // if (!auth) {
  //   return res.status(401).json({
  //     message: "Authorization failed",
  //     status: false,
  //     timeStamp: new Date().toISOString(),
  //   });
  // }

  try {
    // Fetch user information based on the token
    // const [userInfo] = await connection.query(
    //   `SELECT * FROM users WHERE token = ?`,
    //   [auth]
    // );

    // const user = userInfo[0];

    // //console.log("user", user);

    // if (!user) {
    //   return res.status(404).json({
    //     message: "User not found",
    //     status: false,
    //   });
    // }

    if (!days) {
      return res.status(400).json({
        message: "Invalid or incomplete days data",
        status: false,
      });
    }

    // Update the attendance bonus data
    const [result] = await connection.query(
      `UPDATE \`attendencs-bonus\` 
         SET 
          day1 = ?, 
          day1rech = ?, 
          day2 = ?, 
          day2rech = ?, 
          day3 = ?, 
          day3rech = ?, 
          day4 = ?, 
          day4rech = ?, 
          day5 = ?, 
          day5rech = ?, 
          day6 = ?, 
          day6rech = ?, 
          day7 = ?, 
          day7rech = ? 
         WHERE id = ?`,
      [
        days.day1,
        days.day1rech,
        days.day2,
        days.day2rech,
        days.day3,
        days.day3rech,
        days.day4,
        days.day4rech,
        days.day5,
        days.day5rech,
        days.day6,
        days.day6rech,
        days.day7,
        days.day7rech,
        1, // Hardcoded id for now; modify this as needed
      ]
    );

    // Fetch all existing values of total1 to total7 for all users
    const [existingData] = await connection.query(
      `SELECT id, total1, total2, total3, total4, total5, total6, total7 FROM point_list`
    );

    // //console.log("existingData", existingData);

    if (!existingData.length) {
      return res.status(404).json({
        message: "No users found",
        status: false,
      });
    }

    // Prepare batch update queries
    let updateQueries = [];
    for (const user of existingData) {
      const updatedValues = {
        total1: user.total1 === 0 ? 0 : days.day1,
        total2: user.total2 === 0 ? 0 : days.day2,
        total3: user.total3 === 0 ? 0 : days.day3,
        total4: user.total4 === 0 ? 0 : days.day4,
        total5: user.total5 === 0 ? 0 : days.day5,
        total6: user.total6 === 0 ? 0 : days.day6,
        total7: user.total7 === 0 ? 0 : days.day7,
      };

      updateQueries.push(
        connection.query(
          `UPDATE point_list SET 
              total1 = ?, 
              total2 = ?, 
              total3 = ?, 
              total4 = ?, 
              total5 = ?, 
              total6 = ?, 
              total7 = ? 
            WHERE id = ?`,
          [
            updatedValues.total1,
            updatedValues.total2,
            updatedValues.total3,
            updatedValues.total4,
            updatedValues.total5,
            updatedValues.total6,
            updatedValues.total7,
            user.id, // Updating each user individually
          ]
        )
      );
    }

    // Execute all updates in parallel
    await Promise.all(updateQueries);

    // Check if rows were affected
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Attendance bonus entry not found or not updated",
        status: false,
      });
    }

    return res.status(200).json({
      message: "Attendance data updated successfully",
      status: true,
    });
  } catch (e) {
    console.error("Error updating attendance data:", e);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: e.message,
    });
  }
};

const getattendanceBonus = async (req, res) => {
  // let auth = req.cookies.auth;

  // Authorization check
  // if (!auth) {
  //   return res.status(401).json({
  //     message: "Authorization failed",
  //     status: false,
  //     timeStamp: new Date().toISOString(),
  //   });
  // }

  try {
    // Fetch user information based on the token
    // const [userInfo] = await connection.execute(
    //   `SELECT * FROM users WHERE token = ?`,
    //   [auth]
    // );

    // const user = userInfo[0];

    // if (!user) {
    //   return res.status(404).json({
    //     message: "User not found",
    //     status: false,
    //   });
    // }

    // SQL query to get the total count of rows
    const [result] = await connection.execute(
      `SELECT *  FROM \`attendencs-bonus\``
    );

    return res.status(200).json({
      message: "Total rows fetched successfully",
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("Error fetching total count:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

const setWarningAlert = async (req, res) => {
  const { message, phone } = req.body;
  //   //console.log("Processing attendance bonus", days);

  //   let auth = "6619df37112718279f542813b0006eae";

  //   if (!auth) {
  //     return res.status(401).json({
  //       message: "Authorization failed",
  //       status: false,
  //       timeStamp: new Date().toISOString(),
  //     });
  //   }

  try {
    if (!message) {
      return res.status(400).json({
        message: "Invalid or incomplete message",
        status: false,
      });
    }

    const [result] = await connection.query(
      "UPDATE users SET message = ? WHERE phone = ? ",
      [message, phone]
    );

    //console.log("result", result);

    return res.status(200).json({
      message: "Message updated successfully",
      status: true,
    });
  } catch (e) {
    console.error("Error updating Message data:", e);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: e.message,
    });
  }
};
const setSinupBonus = async (req, res) => {
  const { amount } = req.body;
  //console.log("Processing attendance bonus", amount);

  //   let auth = "6619df37112718279f542813b0006eae";

  //   if (!auth) {
  //     return res.status(401).json({
  //       message: "Authorization failed",
  //       status: false,
  //       timeStamp: new Date().toISOString(),
  //     });
  //   }

  try {
    if (!amount) {
      return res.status(400).json({
        message: "Please Enter Sinup Bonus",
        status: false,
      });
    }

    const [result] = await connection.query(
      "UPDATE admin SET sinupbonus = ? WHERE id = ? ",
      [amount, 1]
    );

    //console.log("result", result);

    return res.status(200).json({
      message: "Amount updated successfully",
      status: true,
    });
  } catch (e) {
    console.error("Error updating Amount:", e);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: e.message,
    });
  }
};

const vipData = async (req, res) => {
  const { id, level, amount, onetime, monthstime, sefe, rebet } = req.body; // Destructure fields from the request body

  // //console.log("object", req.body);
  // Simulated authorization token for simplicity
  let auth = req.cookies.auth;

  if (!auth) {
    return res.status(401).json({
      message: "Authorization failed",
      status: false,
      timeStamp: new Date().toISOString(),
    });
  }

  try {
    // Fetch user information based on the token
    const [userInfo] = await connection.query(
      `SELECT * FROM users WHERE token = ?`,
      [auth]
    );

    const user = userInfo[0];

    // //console.log("user", user);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: false,
      });
    }

    // Validate the input data
    if (!id || !level || !amount || !onetime || !monthstime || !rebet) {
      return res.status(400).json({
        message: "Missing required fields",
        status: false,
      });
    }

    const [result] = await connection.query(
      `UPDATE \`vip_data\` 
         SET 
          level = ?, amount = ?, onetime = ?, monthstime = ?, sefe = ?, rebet = ? 
         WHERE id = ?`,
      [level, amount, onetime, monthstime, sefe, rebet, id]
    );

    // Check if the update was successful
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "No record found with the provided ID or no changes made",
        status: false,
      });
    }

    return res.status(200).json({
      message: "Data updated successfully",
      status: true,
      updatedId: id, // Return the updated record ID
    });
  } catch (e) {
    console.error("Error updating VIP data:", e);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: e.message,
    });
  }
};

const setRechargeBonus = async (req, res) => {
  let auth = req.cookies.auth;

  const { recAmount, bonus, is_persent, is_fisrtrecharge } = req.body;

  if (!auth) {
    return res.status(401).json({
      message: "Authorization failed",
      status: false,
      timeStamp: new Date().toISOString(),
    });
  }

  try {
    // Fetch user information based on the token
    const [userInfo] = await connection.execute(
      `SELECT * FROM users WHERE token = ?`,
      [auth]
    );

    if (!userInfo.length) {
      return res.status(404).json({
        message: "User not found",
        status: false,
      });
    }

    // Validate input data
    if (
      !recAmount ||
      !bonus ||
      is_persent === undefined ||
      is_fisrtrecharge === undefined
    ) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Insert data into database
    const sql = `INSERT INTO rechargeBonus (recAmount, bonus, is_persent, is_fisrtrecharge) VALUES (?, ?, ?, ?)`;
    const [result] = await connection.execute(sql, [
      recAmount,
      bonus,
      is_persent,
      is_fisrtrecharge,
    ]);

    return res.status(201).json({
      message: "Data inserted successfully",
      success: true,
      data: {
        id: result.insertId,
        recAmount,
        bonus,
        is_persent,
        is_fisrtrecharge,
      },
    });
  } catch (error) {
    console.error("Error inserting data:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

const updateRechargeBonus = async (req, res) => {
  // let auth = req.cookies.auth;

  const { id, recAmount, bonus, is_persent, is_fisrtrecharge } = req.body;

  // Authorization check
  // if (!auth) {
  //   return res.status(401).json({
  //     message: "Authorization failed",
  //     status: false,
  //     timeStamp: new Date().toISOString(),
  //   });
  // }

  try {
    // Fetch user information based on the token
    // const [userInfo] = await connection.execute(
    //   `SELECT * FROM users WHERE token = ?`,
    //   [auth]
    // );

    const user = userInfo[0];

    // if (!user) {
    //   return res.status(404).json({
    //     message: "User not found",
    //     status: false,
    //   });
    // }

    // Validate the input data
    if (
      !id ||
      !recAmount ||
      !bonus ||
      is_persent === undefined ||
      is_fisrtrecharge === undefined
    ) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // SQL query to update data in the `rechargeBonus` table
    const sql = `UPDATE rechargeBonus SET 
      recAmount = ?, 
      bonus = ?, 
      is_persent = ?, 
      is_fisrtrecharge = ? 
    WHERE id = ?`;

    const [result] = await connection.execute(sql, [
      recAmount,
      bonus,
      is_persent,
      is_fisrtrecharge,
      id,
    ]);

    // Check if any rows were updated
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "No record found with the provided ID",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Data updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error updating data:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

const getRechargeBonusCount = async (req, res) => {
  try {
    // SQL query to get the total count of rows
    const [result] = await connection.execute(`SELECT *  FROM rechargeBonus`);

    return res.status(200).json({
      message: "Total rows fetched successfully",
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching total count:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

const deleteRechargeBonus = async (req, res) => {
  let auth = req.cookies.auth;
  const { id } = req.params; // Get ID from request parameters

  if (!auth) {
    return res.status(401).json({
      message: "Authorization failed",
      status: false,
      timeStamp: new Date().toISOString(),
    });
  }

  try {
    // Fetch user information based on the token
    const [userInfo] = await connection.execute(
      `SELECT * FROM users WHERE token = ?`,
      [auth]
    );

    if (!userInfo.length) {
      return res.status(404).json({
        message: "User not found",
        status: false,
      });
    }

    // Check if the record exists before deleting
    const [existingRecord] = await connection.execute(
      `SELECT * FROM rechargeBonus WHERE id = ?`,
      [id]
    );

    if (!existingRecord.length) {
      return res.status(404).json({
        message: "Record not found",
        success: false,
      });
    }

    // SQL query to delete the record
    const sql = `DELETE FROM rechargeBonus WHERE id = ?`;
    await connection.execute(sql, [id]);

    return res.status(200).json({
      message: "Data deleted successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

const activeUser = async (req, res) => {
  let auth = req.cookies.auth;

  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    if (!auth) {
      return res.status(401).json({
        message: "Authorization failed",
        status: false,
        timeStamp: new Date().toISOString(),
      });
    }

    const [userInfo] = await connection.execute(
      `SELECT * FROM users WHERE token = ?`,
      [auth]
    );

    if (!userInfo.length) {
      return res.status(404).json({
        message: "User not found",
        status: false,
      });
    }
    // Get the date in "YYYY-MM-DD" format
    const formattedDate = oneWeekAgo.toISOString().split("T")[0];

    const today = new Date();

    const todayDate = today.toISOString().split("T")[0];

    // //console.log("formattedToday", todayDate);

    // //console.log("date", formattedDate);

    const query = `
      SELECT DISTINCT phone FROM minutes_1 WHERE isdemo != 1 AND DATE(today) >= ?
      UNION
      SELECT DISTINCT phone FROM result_k3 WHERE DATE(bet_data) >= ?
      UNION
      SELECT DISTINCT phone FROM result_5d WHERE DATE(bet_data) >= ?;
    `;

    const [rows] = await connection.execute(query, [
      formattedDate,
      formattedDate,
      formattedDate,
    ]);

    const todayquery = `
      SELECT DISTINCT phone FROM minutes_1 WHERE isdemo != 1 AND DATE(today) = ?
      UNION
      SELECT DISTINCT phone FROM result_k3 WHERE DATE(bet_data) = ?
      UNION
      SELECT DISTINCT phone FROM result_5d WHERE DATE(bet_data) = ?;
    `;

    const [todayUaer] = await connection.execute(todayquery, [
      todayDate,
      todayDate,
      todayDate,
    ]);

    const count = rows.length;
    const todayUser = todayUaer.length;

    const [allUser] = await connection.query(
      "SELECT COUNT(*) as total FROM users WHERE isdemo = 0"
    );
    const totalUser = allUser[0].total;
    const [allDemoUser] = await connection.query(
      "SELECT COUNT(*) as total FROM users WHERE isdemo = 1"
    );
    const totalDemoUser = allDemoUser[0].total;

    const [allUserAmount] = await connection.query(
      `SELECT COALESCE(SUM(money), 0) AS totalMoney FROM users WHERE isdemo = 0`
    );

const [usertodays] = await connection.query(
  "SELECT COUNT(*) as total FROM users WHERE DATE(today) = ?", [todayDate]
);
    
    
    
    const totalMoney = allUserAmount[0].totalMoney; // Extracting the value

    //console.log("allUserAmount", usertodays[0].total);

    res.json({
    activeUsers: count,
      totalUser: totalUser,
      totalDemoUser: totalDemoUser,
      totalMoney: totalMoney,
      todayUser: usertodays[0].total,
      
    });
  } catch (error) {
    console.error("Error fetching active users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const setUserBetCommition = async (req, res) => {
  const { id, commitionBetAmount, betCommition } = req.body;

  // Validate input
  if (
    (!id,
    !commitionBetAmount || betCommition === undefined || isNaN(betCommition))
  ) {
    return res.status(400).json({
      message:
        "Invalid input. ID and betCommition are required and must be valid.",
      status: false,
    });
  }

  try {
    // SQL query to update data in the `rechargeBonus` table
    const sql = `UPDATE admin SET user_bet_commition = ?, commition_Bet_Amount = ? WHERE id = ?`;

    const [result] = await connection.execute(sql, [
      parseFloat(betCommition),
      commitionBetAmount,
      id,
    ]);

    // const [result] = await connection.execute(
    //   "UPDATE admin SET user_bet_commition = ? commition_Bet_Amount = ? WHERE id = ?",
    //   [parseFloat(betCommition), commitionBetAmount, id]
    // );

    if (result.affectedRows == 0) {
      return res.status(404).json({
        message: "No record found with the given ID",
        status: false,
      });
    }

    return res.status(200).json({
      message: "Bet Commission updated successfully",
      data: result,
      status: true,
    });
  } catch (error) {
    console.error("Error updating bet commission:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

const setdepositerequrments = async (req, res) => {
  const { id, depositerequrments } = req.body;

  // //console.log("object", req.body);

  // Validate input
  if (!id || !depositerequrments) {
    return res.status(400).json({
      message: "Invalid input. ID and depositerequrments are required.",
      status: false,
    });
  }

  try {
    // SQL query to update data in the `rechargeBonus` table
    const sql = `UPDATE admin SET deposite_requre = ? WHERE id = ?`;

    const [result] = await connection.execute(sql, [depositerequrments, id]);

    if (result.affectedRows == 0) {
      return res.status(404).json({
        message: "No record found with the given ID",
        status: false,
      });
    }

    return res.status(200).json({
      message: "Deposit Requirements updated successfully",
      data: result,
      status: true,
    });
  } catch (error) {
    console.error("Error updating deposit requirements:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

// const getdepositerequrments = async (req, res) => {
//   let auth = req.cookies.auth;

//   // Authorization check
//   if (!auth) {
//     return res.status(401).json({
//       message: "Authorization failed",
//       status: false,
//       timeStamp: new Date().toISOString(),
//     });
//   }

//   try {
//     // Fetch user information based on the token
//     const [userInfo] = await connection.execute(
//       `SELECT * FROM users WHERE token = ?`,
//       [auth]
//     );

//     if (!userInfo.length) {
//       return res.status(404).json({
//         message: "User not found",
//         status: false,
//       });
//     }

//     const [dpositReq] = await connection.execute(
//       `SELECT deposite_requre FROM admin`
//     );

//     return res.status(200).json({
//       message: "Deposit Requirements updated successfully",
//       data: dpositReq[0].deposite_requre,
//       status: true,
//     });
//   } catch (error) {
//     console.error("Error updating deposit requirements:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//       status: false,
//       error: error.message,
//     });
//   }
// };

const getdepositerequrments = async (req, res) => {
  let auth = req.cookies.auth;

  // Authorization check
  if (!auth) {
    return res.status(401).json({
      message: "Authorization failed",
      status: false,
      timeStamp: new Date().toISOString(),
    });
  }

  try {
    // Fetch user information based on the token
    const [userInfo] = await connection.execute(
      `SELECT * FROM users WHERE token = ?`,
      [auth]
    );

    if (!userInfo.length) {
      return res.status(404).json({
        message: "User not found",
        status: false,
      });
    }

    const [dpositReq] = await connection.execute(
      `SELECT deposite_requre FROM admin`
    );
    const [admin] = await connection.query("SELECT * FROM `admin`");
    const sinupBonus = admin[0].sinupbonus;

    return res.status(200).json({
      message: "Deposit Requirements updated successfully",
      data: dpositReq[0].deposite_requre,
      sinupBonus: sinupBonus,
      status: true,
    });
  } catch (error) {
    console.error("Error updating deposit requirements:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};



const setwebsiteMode = async (req, res) => {
  const { id, depositerequrments } = req.body;

  // //console.log("object", req.body);

  // Validate input
  if (!id || !depositerequrments) {
    return res.status(400).json({
      message: "Invalid input. ID and depositerequrments are required.",
      status: false,
    });
  }

  try {
    // SQL query to update data in the `rechargeBonus` table
    const sql = `UPDATE admin SET website_mode = ? WHERE id = ?`;

    const [result] = await connection.execute(sql, [depositerequrments, id]);

    // //console.log("dddddddddd", result);

    if (result.affectedRows == 0) {
      return res.status(404).json({
        message: "No record found with the given ID",
        status: false,
      });
    }

    return res.status(200).json({
      message: "Deposit Requirements updated successfully",
      data: result,
      status: true,
    });
  } catch (error) {
    console.error("Error updating deposit requirements:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

const geWebsiteMode = async (req, res) => {
  let auth = req.cookies.auth;

  // Authorization check
  if (!auth) {
    return res.status(401).json({
      message: "Authorization failed",
      status: false,
      timeStamp: new Date().toISOString(),
    });
  }

  try {
    // Fetch user information based on the token
    const [userInfo] = await connection.execute(
      `SELECT * FROM users WHERE token = ?`,
      [auth]
    );

    if (!userInfo.length) {
      return res.status(404).json({
        message: "User not found",
        status: false,
      });
    }

    const [websirMode] = await connection.execute(
      `SELECT website_mode FROM admin`
    );

    return res.status(200).json({
      message: "Deposit Requirements updated successfully",
      data: websirMode[0].website_mode,
      status: true,
    });
  } catch (error) {
    console.error("Error updating deposit requirements:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

const winningPercentage = async (req, res) => {
  try {
    const today = new Date();
    // const formattedToday = "2024-12-04"; // Replace this with dynamic date if needed
    const formattedToday = today.toISOString().split("T")[0];

    //console.log("formattedToday", formattedToday);

    // Total User Winning Amount
    const [WinMoney] = await connection.query(
      `SELECT
          (SELECT COALESCE(SUM(get), 0) FROM minutes_1 WHERE status = 1 AND DATE(today) = ? AND isdemo = 0) +
          (SELECT COALESCE(SUM(get), 0) FROM result_k3 WHERE status = 1 AND DATE(bet_data) = ?) +
          (SELECT COALESCE(SUM(get), 0) FROM result_5d WHERE status = 1 AND DATE(bet_data) = ?)
          AS total_money`,
      [formattedToday, formattedToday, formattedToday]
    );

    const totalWinningMoney = WinMoney[0].total_money || 0;

    // Total Bet Money (All Users)
    const [totalMoney] = await connection.query(
      `SELECT
          (SELECT COALESCE(SUM(money), 0) FROM minutes_1 WHERE DATE(today) = ? AND isdemo = 0) +
          (SELECT COALESCE(SUM(money), 0) FROM result_k3 WHERE DATE(bet_data) = ?) +
          (SELECT COALESCE(SUM(money), 0) FROM result_5d WHERE DATE(bet_data) = ?)
          AS total_money`,
      [formattedToday, formattedToday, formattedToday]
    );

    const totalBetMoney = totalMoney[0].total_money || 0;

    // Total Loss Money (Users' Lost Amount)
    const [LossMoney] = await connection.query(
      `SELECT
          (SELECT COALESCE(SUM(money), 0) FROM minutes_1 WHERE status = 2 AND DATE(today) = ? AND isdemo = 0) +
          (SELECT COALESCE(SUM(money), 0) FROM result_k3 WHERE status = 2 AND DATE(bet_data) = ? ) +
          (SELECT COALESCE(SUM(money), 0) FROM result_5d WHERE status = 2 AND DATE(bet_data) = ? )
          AS total_money`,
      [formattedToday, formattedToday, formattedToday]
    );

    const totalLossMoney = LossMoney[0].total_money || 0;

    // Admin Profit = Total Bet Money - Total Winning Money
    const adminProfit = totalBetMoney - totalWinningMoney;

    // User Winning Percentage
    const userWinningPercentage =
      totalBetMoney > 0 ? (totalWinningMoney / totalBetMoney) * 100 : 0;

    // Admin Profit Percentage
    const adminProfitPercentage =
      totalBetMoney > 0 ? (adminProfit / totalBetMoney) * 100 : 0;

    //console.log("Total User Winning Money:", totalWinningMoney);
    //console.log("Total Bet Money:", totalBetMoney);
    //console.log("Total Loss Money:", totalLossMoney);
    //console.log("Admin Profit:", adminProfit);
    console.log(
      "User Winning Percentage:",
      userWinningPercentage.toFixed(2) + "%"
    );
    console.log(
      "Admin Profit Percentage:",
      adminProfitPercentage.toFixed(2) + "%"
    );

    res.json({
      totalWinningMoney,
      totalLossMoney,
      totalBetMoney,
      adminProfit,
      userWinningPercentage: userWinningPercentage.toFixed(2),
      adminProfitPercentage: adminProfitPercentage.toFixed(2),
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const spinController = async (req, res) => {
  // let auth = req.cookies.auth;

  const {
    taskAmount,
    numberofSpin,
    sec1,
    sec2,
    sec3,
    sec4,
    sec5,
    sec6,
    sec7,
    sec8,
    id,
  } = req.body;

  if (!taskAmount || !numberofSpin) {
    return res.status(400).json({
      message: "Invalid input. All fields are required.",
      status: false,
    });
  }

  try {
    const sql = `UPDATE spin_data SET  task_amount = ?, num_of_spin = ?, sec1 = ?, sec2 = ?, sec3 = ?, sec4 = ?, sec5 = ?, sec6 = ?, sec7 = ?, sec8 = ? WHERE id = ?`;

    const [result] = await connection.execute(sql, [
      taskAmount,
      numberofSpin,
      sec1,
      sec2,
      sec3,
      sec4,
      sec5,
      sec6,
      sec7,
      sec8,
      id,
    ]);

    return res.status(201).json({
      message: "Data inserted successfully",
      status: true,
      data: result[0],
    });
  } catch (error) {
    console.error("Error inserting data:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

const ligalTrade = async (req, res) => {
  const { user_id } = req.body; // Extract user_id from request body

  try {
    let userCondition = "";
    let historyCondition = "";
    let historyConditiondate = "";

    if (user_id) {
      userCondition = `AND id_user = ${user_id}`;
      historyCondition = `WHERE user_id = ${user_id}`;
      historyConditiondate = `AND user_id = ${user_id}`;
    }

    // Fetch users with a legal bet score greater than 0 (all or specific user)
    const [illageusers] = await connection.query(`
      SELECT id_user, phone, legal_bet_score 
      FROM users 
      WHERE legal_bet_score > 0 ${userCondition}
    `);

    

    // Fetch all illegal betting history (all or specific user)
    const [history] = await connection.query(`
      SELECT *
      FROM ligal_trade
      ${historyCondition}
      ORDER BY date DESC
    `);
    
    if (!history.length) {
      return res.status(404).json({
        message: "No users found with illegal betting activity",
        status: false,
      });
    }
    // Fetch the last illegal betting date for each user (all or specific user)
    const [lastIllegalData] = await connection.query(`
      SELECT user_id, MAX(date) AS last_illegal_date
      FROM ligal_trade
      WHERE user_id IN (SELECT id_user FROM users WHERE legal_bet_score > 0) ${historyConditiondate}
      GROUP BY user_id
    `);

    // Map last illegal date to users
    const userLastDateMap = {};
    lastIllegalData.forEach(({ user_id, last_illegal_date }) => {
      userLastDateMap[user_id] = last_illegal_date;
    });

    // Merge last illegal date into the illageusers list
    const result = illageusers.map(user => ({
      ...user,
      last_illegal_date: userLastDateMap[user.id_user] || null, // Add last date if found, else null
    }));

    return res.status(200).json({
      message: "Betting data retrieved successfully",
      status: true,
      data: {
        users: result, // Users with last illegal date
        history: history, // Illegal betting history
      },
    });
  } catch (error) {
    console.error("Error fetching betting data:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

// controllers/adminController.js

const profitLoss = async (req, res) => {
  const { range, uid } = req.body; 

  try {
    let phone = null;

    // If uid provided, fetch phone
    if (uid) {
      const [userResult] = await connection.query(
        "SELECT phone FROM users WHERE id_user = ? LIMIT 1",
        [uid]
      );

      if (!userResult.length) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }
      phone = userResult[0].phone;
    }

    // Build WHERE clause based on range
    let dateConditionMinutes = "";
    let dateConditionK3 = "";
    let dateCondition5d = "";

    switch (range) {
      case "yesterday":
        dateConditionMinutes = "DATE(today) = CURDATE() - INTERVAL 1 DAY";
        dateConditionK3 = "DATE(bet_data) = CURDATE() - INTERVAL 1 DAY";
        dateCondition5d = "DATE(bet_data) = CURDATE() - INTERVAL 1 DAY";
        break;

      case "thisWeek":
        dateConditionMinutes = "YEARWEEK(today, 1) = YEARWEEK(CURDATE(), 1)";
        dateConditionK3 = "YEARWEEK(bet_data, 1) = YEARWEEK(CURDATE(), 1)";
        dateCondition5d = "YEARWEEK(bet_data, 1) = YEARWEEK(CURDATE(), 1)";
        break;

      case "thisMonth":
        dateConditionMinutes = "MONTH(today) = MONTH(CURDATE()) AND YEAR(today) = YEAR(CURDATE())";
        dateConditionK3 = "MONTH(bet_data) = MONTH(CURDATE()) AND YEAR(bet_data) = YEAR(CURDATE())";
        dateCondition5d = "MONTH(bet_data) = MONTH(CURDATE()) AND YEAR(bet_data) = YEAR(CURDATE())";
        break;

      case "lastMonth":
        dateConditionMinutes = "MONTH(today) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND YEAR(today) = YEAR(CURDATE() - INTERVAL 1 MONTH)";
        dateConditionK3 = "MONTH(bet_data) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND YEAR(bet_data) = YEAR(CURDATE() - INTERVAL 1 MONTH)";
        dateCondition5d = "MONTH(bet_data) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND YEAR(bet_data) = YEAR(CURDATE() - INTERVAL 1 MONTH)";
        break;

      case "allTime":
        dateConditionMinutes = "1=1";
        dateConditionK3 = "1=1";
        dateCondition5d = "1=1";
        break;

      default: // today
        dateConditionMinutes = "DATE(today) = CURDATE()";
        dateConditionK3 = "DATE(bet_data) = CURDATE()";
        dateCondition5d = "DATE(bet_data) = CURDATE()";
        break;
    }

    // Build phone filter
    const phoneFilter = phone ? " AND phone = ? " : "";

    // ----- WIN MONEY -----
    const winSql = `
      SELECT
        (SELECT COALESCE(SUM(money), 0) FROM minutes_1 WHERE status = 1 AND isdemo = 0 ${phoneFilter} AND ${dateConditionMinutes}) +
        (SELECT COALESCE(SUM(money), 0) FROM result_k3  WHERE status = 1 ${phoneFilter} AND ${dateConditionK3}) +
        (SELECT COALESCE(SUM(money), 0) FROM result_5d  WHERE status = 1 ${phoneFilter} AND ${dateCondition5d})
        AS total_money
    `;

    const winParams = phone ? [phone, phone, phone] : [];
    const [WinMoney] = await connection.query(winSql, winParams);
    const totalWinnigMoney = WinMoney[0].total_money || 0;

    // ----- LOSS MONEY -----
    const lossSql = `
      SELECT
        (SELECT COALESCE(SUM(money), 0) FROM minutes_1 WHERE status = 2 AND isdemo = 0 ${phoneFilter} AND ${dateConditionMinutes}) +
        (SELECT COALESCE(SUM(money), 0) FROM result_k3  WHERE status = 2 ${phoneFilter} AND ${dateConditionK3}) +
        (SELECT COALESCE(SUM(money), 0) FROM result_5d  WHERE status = 2 ${phoneFilter} AND ${dateCondition5d})
        AS total_money
    `;

    const lossParams = phone ? [phone, phone, phone] : [];
    const [LossMoney] = await connection.query(lossSql, lossParams);

    // ----- FEES (TAX) -----
    const feeSql = `
      SELECT
        (SELECT COALESCE(SUM(fee), 0) FROM minutes_1 WHERE isdemo = 0 ${phoneFilter} AND ${dateConditionMinutes}) +
        (SELECT COALESCE(SUM(fee), 0) FROM result_k3  WHERE 1=1 ${phoneFilter} AND ${dateConditionK3}) +
        (SELECT COALESCE(SUM(fee), 0) FROM result_5d  WHERE 1=1 ${phoneFilter} AND ${dateCondition5d})
        AS total_money
    `;

    const feeParams = phone ? [phone, phone, phone] : [];
    const [textMoney] = await connection.query(feeSql, feeParams);

    // ----- LAST 10 BETS -----
    let winGo10Query = `SELECT * FROM minutes_1 WHERE status != 0`;
    const winGo10Params = [];
    if (phone) {
      winGo10Query += ` AND phone = ?`;
      winGo10Params.push(phone);
    }
    winGo10Query += ` ORDER BY id DESC LIMIT 10`;
    const [winGo10] = await connection.execute(winGo10Query, winGo10Params);

    // ----- CALCULATIONS -----
    const totalLossMoney = LossMoney[0].total_money || 0;
    const totalTextMoney = textMoney[0].total_money || 0;
    const totalbetMoney = Number(totalWinnigMoney) + Number(totalLossMoney);
    const winningPercentage =
      totalbetMoney > 0 ? (totalWinnigMoney / totalbetMoney) * 100 : 0;

    return res.status(200).json({
      message: "Betting data retrieved successfully",
      status: true,
      uid: uid || null,
      phone: phone || "ALL",
      range,
      totalbetMoney,
      totalWinnigMoney,
      totalLossMoney,
      totalTextMoney,
      winGo10,
      winningPercentage: winningPercentage.toFixed(2),
    });
  } catch (error) {
    console.error("Error fetching profit/loss:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};




const setInvitationBonus = async (req, res) => {
  // let auth = req.cookies.auth;
  const { rule, amount, bonus, count } = req.body;

  try {
    if (!amount || !bonus || !count) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    await connection.query(
      "INSERT INTO `invitation_bonus` (`rule`, `amount`, `bonus`, `count`) VALUES (?, ?, ?, ?)",
      [rule, amount, bonus, count]
    );

    return res.status(201).json({
      message: "Data inserted successfully",
      success: true,
      // data: result,
    });
  } catch (error) {
    console.error("Error fetching active users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const updateInvitationBonus = async (req, res) => {
  const { id, rule, amount, bonus, count } = req.body;

  try {
    // Validate required fields
    if (!id || !amount || !bonus || !count) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Update the existing record
    const [result] = await connection.query(
      "UPDATE `invitation_bonus` SET `rule` = ?, `amount` = ?, `bonus` = ?, `count` = ? WHERE `id` = ?",
      [rule, amount, bonus, count, id]
    );

    // Check if any row was actually updated
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "No record found with the given ID",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Data updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error updating invitation bonus:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteInvitationBonus = async (req, res) => {
  const { id } = req.body;

  try {
    // Validate required fields
    if (!id) {
      return res.status(400).json({
        message: "ID is required",
        success: false,
      });
    }

    // Delete the record with the given ID
    const [result] = await connection.query(
      "DELETE FROM `invitation_bonus` WHERE `id` = ?",
      [id]
    );

    // Check if any row was actually deleted
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "No record found with the given ID",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Data deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting invitation bonus:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const demoUser = async (req, res) => {
  try {
    // Delete the record with the given ID
    const [result] = await connection.query(
      "SELECT * FROM users WHERE isdemo = 1");
    return res.status(200).json({
      message: "demoUser successfully",
      success: true,
      data:result
    });
  } catch (error) {
    console.error("Error deleting invitation bonus:", error);
    res.status(500).json({ error: "Internal server error" ,err:error.message});
  }
};
const convertAgent = async (req, res) => {
    const {user_id,value}=req.body
  try {
    // Delete the record with the given ID
 await connection.query(
  "UPDATE `users` SET `level` = ? WHERE `id_user` = ?", [Number(value), user_id]
);

    return res.status(200).json({
      message: "update successfully",
      status: true,
   
    });
  } catch (error) {
    console.error("Error deleting invitation bonus:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const enableWithdraw=async(req,res)=>{
    
    const {enable,phone}=req.body
    
    
    try{
    
       await  connection.execute(
          'UPDATE `users` SET `enableWithdraw` = ? WHERE `phone` = ?',
          [enable, phone]
        )
        
       return  res.status(200).json({
      message: "update enableWithdraw",
      status: true,
    });
    }catch(error){
        return  res.status(500).json({
      message: "Error enableWithdraw",
      status: false,
    });
    }
}


module.exports = {
  todayrechargeexport,
  adminPage,
  adminPage3,
  adminPage5,
  adminPage10,
  
  admintrxPage,
  admintrxPage3,
  admintrxPage5,
  admintrxPage10,
  
   adminCarPage,
  adminCarPage3,
  adminCarPage5,
  adminCarPage10,
  
  totalJoin,
  middlewareAdminController,
 
  membersPage,
  listMember,
  infoMember,
  todayreport,
 
  turnover,
  statistical,
  statistical2,
  rechargePage,
  recharge,
  rechargeDuyet,
  rechargeRecord,
  withdrawRecord,
  withdraw,
  handlWithdraw,
  settings,
  editResult2,
  settingBank,
  settingGet,
  settingCskh,
  settingbuff,
  register,
  ctvPage,
  listCTV,
  profileUser,
  ctvProfilePage,
  infoCtv,
  betting,
  infoCtv2,
  giftPage,
  AgentCommission,
  createBonus,
  listRedenvelops,
  rechargeCallback,
  banned,
  eligaUnblockUser,
  editbank,
  listWithdrawMem,
  listRedenvelope,
  adminPage5d,
  listOrderOld,
  listOrderOldK3,
  settingMessage,
  editResult,
  adminPageK3,
  adminPage,
  turnover_report,
  today_report,
  betting_report,
  adminPage3,
  todayrechargeexport,
  adminPage5,
  adminPage10,
  middlewareAdminController,
  changeAdmin,
  membersPage,
  listMember,
  userInfo,
  statistical,
  statistical2,
  rechargePage,
  recharge,
  rechargeRecord,
  withdrawRecord,
  withdraw,
  levelSetting,
  handlWithdraw,
  settings,
  editResult2,
  settingBank,
  settingGet,
  settingCskh,
  settingbuff,
  register,
  ctvPage,
  listCTV,
  profileUser,
  ctvProfilePage,
  infoCtv,
  infoCtv2,
  giftPage,
  createBonus,
  listRedenvelops,
  listRechargeMem,
  listWithdrawMem,
  getLevelInfo,
  listBet,
  listOrderOld,
  listOrderOldK3,
  editResult,
  adminPageK3,
  updateLevel,
  settingMessage,
  CreatedSalaryRecord,
  CreatedSalary,
  getSalary,
  betting,
  todayreport,
  turnover,
  notificationPage,
  createNotification,
  getNotification,
  updateNotification,
  singleNotificationDelete,
  settingdemo,
  livePage,
  settingneed,
  userlevelPage,
   userlevelAllPage,
  downlinerecharge_data_admin,
  adminaddUSDT,
  getBanner,
  bannerPage,
  activitybannerPage,
  logoSettingPage,
  chennalSettingPage,
  updateBanner,
  updateActivityBanner,
  updateLogo,
  updateChennal,
  getDataRecharge,
  promotionsPage,
  attendanceBonus,
  setWarningAlert,
  setWarningAlert,
  setSinupBonus,
  vipData,
  setRechargeBonus,
  updateRechargeBonus,
  getRechargeBonusCount,
  activeUser,
  setUserBetCommition,
  setdepositerequrments,
  getdepositerequrments,
  winningPercentage,
  spinController,
  vipsection,
  FirstDepositBonus,
  activitysettings,
  InvitationBonus,
  spinwheel,
  llegaltrade,
  Supportsection,
  profitloss,
  rechargeAllPage,
  rechargeSuccessPage,
  rechargePandingPage,
  rechargeFailPage,
  getattendanceBonus,
  deleteRechargeBonus,
  ligalTrade,
  profitLoss,
  setInvitationBonus,
  // getInvitationBonus,
  updateInvitationBonus,
  deleteInvitationBonus,
  createsubpanel,
  createsubadmin,
  
  getUserPermissions,
  editUserPermissions,
  geWebsiteMode,
  getAllAdmins,
  setwebsiteMode,
  deleteadmin_1,
  totalJoinRacing,
  changeAdminRacing,
  spinset,
  demoUser,
  demouser,
  convertAgent,
  downlinerecharge_data_adminAll,
  
//   live chat
   depositePage,
  withdrawalPage,
  changeloginIdPass,
  modifyBankInfo,
  usdtaddress,
  activityBonus,
  gameProblems,
  enableWithdraw,
  attendencebonesPage,
  agentperformancepage,
  createuser,
  apitransaction,
  topperformance,
  iprecord,
  withdrawfail,
  withdrawsuccess,
  SignupBonespage,
 handlWithdrawCallback,
  manualwithdraw,
  handlWithdraw2
};
