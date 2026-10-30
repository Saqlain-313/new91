import express from "express";
import { rateLimit } from "express-rate-limit";
import connection from "../config/connectDB";
import accountController from "../controllers/accountController";
import adminController from "../controllers/adminController";
import allGameController from "../controllers/allGameController";
import bettingController from "../controllers/bettingController";
import carController from "../controllers/carController";
import commissionController from "../controllers/commissionController";
import dailyController from "../controllers/dailyController";
import homeController from "../controllers/homeController";
import jilliController from "../controllers/jilliController";
import k3Controller from "../controllers/k3Controller";
import k5Controller from "../controllers/k5Controller";
import middlewareController from "../controllers/middlewareController";
import paymentController from "../controllers/paymentController";
import supportController from "../controllers/supportController";
import userController from "../controllers/userController";
import winGoController from "../controllers/winGoController";
import demoBalanceController from "../controllers/demoBalanceController";

import {
  addBonus,
  addProblem,
  addressAcceptOrReject,
  addUSDTAddress,
  bankModification,
  bankName,
  bonusAcceptOrReject,
  bonusDetails,
  depositAcceptOrReject,
  depositNotReceived,
  getBankModification,
  getDepositNotReceived,
  getifscModification,
  getRecharge,
  getUsdtAddress,
  getUserBank,
  getUserProblems,
  getwithdrawl2,
  getwithdrawlProblems,
  ifscModification,
  modifyBankAcceptorReject,
  problemAcceptOrReject,
  problemsDetails,
  sendOtp,
  updatePassword,
  updatePassword2,
  withdrawlProblems,
  withdrawlProblemsAcceptOrReject,
} from "../controllers/depositNotRecieved";

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

let router = express.Router();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});

const allowedIps = ["154.80.91.199", "106.219.162.65", "106.219.164.242"];

const maintenanceMode = (req, res, next) => {
  const clientIp =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  if (allowedIps.includes(clientIp)) {
    return next();
  }

  res.status(503).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Maintenance Mode</title>
            <style>
                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    color: #333;
                }
                .container {
                    text-align: center;
                }
                h1 {
                    font-size: 3em;
                    margin-bottom: 0.5em;
                }
                p {
                    font-size: 1.2em;
                }
                .logo {
                    width: 100px;
                    height: auto;
                    margin-bottom: 1em;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <img src="https://img.lovepik.com/free-png/20211215/lovepik-child-asleep-waiting-for-a-gift-png-image_401649100_wh1200.png" alt="Logo" class="logo">
                <h1>We're currently undergoing maintenance</h1>
                <p>Our site is currently being updated. We'll be back online shortly. Thank you for your patience!</p>
            </div>
        </body>
        </html>
    `);
};

const initWebRouter = (app) => {
  // app.use(maintenanceMode);

  router.delete("/delete/item/:id", async (req, res) => {
    const { id } = req.params;

    try {
      const sql = `DELETE FROM rechargeBonus WHERE id = ?`;
      const [result] = await connection.execute(sql, [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Item not found" });
      }

      res
        .status(200)
        .json({ success: true, message: "Item deleted successfully" });
    } catch (err) {
      console.error("Error deleting item:", err);
      res.status(500).json({ error: "Database query failed" });
    }
  });

  router.get("/gettime_now", (req, res) => {
    res.status(503)
      .send(`<form action="/support/submitGameProblem" method="POST" enctype="multipart/form-data">
  <div class="form-item">
    <label for="issueDescription">Explain the issue happen to you inside the game clear and detail:</label>
    <textarea id="issueDescription" name="issueDescription" rows="5" placeholder="Please enter content" maxlength="500" required></textarea>
  </div>
  <div class="form-item">
    <label for="tirangaId">Tiranga ID:</label>
    <input type="text" id="tirangaId" name="games_id" placeholder="Please enter username" required />
  </div>
  <div class="form-item">
    <label for="photo">Attach Photo:</label>
    <input type="file" id="photo" name="photo" accept="image/*" />
  </div>
  <div class="form-item">
    <label for="pdfFile">Attach PDF File:</label>
    <input type="file" id="pdfFile" name="pdf" accept=".pdf,image/*,video/*" />
  </div>
  <div class="form-item">
    <label for="video">Attach Video:</label>
    <input type="file" id="video" name="video_path" accept=".pdf,image/*,video/*" />
  </div>
  <div class="form-item">
    <button type="submit">Submit</button>
  </div>
</form>
`);
  });

  const ipCache = new Map();

  async function enrichIp(ip) {
    if (!ip) return {};
    if (ipCache.has(ip) && Date.now() - ipCache.get(ip).ts < 6 * 3600 * 1000)
      return ipCache.get(ip).val;

    let location = "Unknown",
      city = "",
      country = "",
      risk = "Low Risk",
      status = "Active";
    try {
      let locRes = await axios.get(
        `http://ip-api.com/json/${ip}?fields=status,countryCode,city,hosting,query`,
      );
      if (locRes.data && locRes.data.status === "success") {
        location =
          `${locRes.data.city || ""}, ${locRes.data.countryCode || ""}`.replace(
            /^, /,
            "",
          );
        if (locRes.data.hosting === true) {
          risk = "Medium Risk";
          status = "Active";
        }
      }
      if (
        ip.startsWith("192.168.") ||
        ip.startsWith("10.") ||
        ip.startsWith("127.")
      ) {
        risk = "Low Risk";
        status = "Active";
        location = "Local Network";
      }
    } catch (e) { }

    const val = { location, risk, status };
    ipCache.set(ip, { ts: Date.now(), val });
    return val;
  }

  router.get("/api/ip-records", async (req, res) => {
    try {
      await connection.query(`SET SESSION group_concat_max_len = 1000000`);

      const [rows] = await connection.query(`
      SELECT 
        ip_address, 
        COUNT(*) AS total_activities,
        COUNT(DISTINCT user_phone) AS unique_users,
        GROUP_CONCAT(
          DISTINCT CONCAT(user_phone, ' (', action_type, ')') 
          ORDER BY user_phone 
          SEPARATOR ', '
        ) AS user_actions,
        MAX(created_at) AS last_activity
      FROM user_action_log
      WHERE ip_address IS NOT NULL 
        AND ip_address <> ''
        AND user_phone IS NOT NULL
        AND user_phone <> ''
      GROUP BY ip_address
      ORDER BY last_activity DESC
      LIMIT 50
    `);

      const results = rows.map((row) => {
        const risk = row.unique_users > 3 ? "High Risk" : "Normal";
        return {
          ip: row.ip_address,
          risk,
          activities: Number(row.total_activities),
          users: Number(row.unique_users),
          phones: row.user_actions ? row.user_actions.split(", ") : [],
          lastActivity: row.last_activity
            ? new Date(row.last_activity).toISOString().slice(0, 10)
            : "Invalid Date",
        };
      });

      const totalActiveIps = results.length;
      const highRiskIps = results.filter((x) => x.risk === "High Risk").length;
      const activeUsers = results.reduce((sum, x) => sum + x.users, 0);

      res.json({
        summary: { totalActiveIps, highRiskIps, activeUsers },
        data: results,
      });
    } catch (err) {
      console.error("IP records error:", err.message, err.sqlMessage || "");
      res.status(500).json({
        error: "Server error",
        details: err.sqlMessage || err.message,
      });
    }
  });

  async function getDownlineByLevel(connection, rootCode, levels = 6) {
    let result = [];
    let prevLevelCodes = [rootCode];
    for (let lvl = 0; lvl < levels; lvl++) {
      if (!prevLevelCodes.length) {
        result.push([]);
        continue;
      }
      const [users] = await connection.query(
        "SELECT id_user, name_user, phone, code, invite, today AS created_at FROM users WHERE invite IN (?)",
        [prevLevelCodes],
      );
      result.push(users);
      prevLevelCodes = users.map((u) => u.code);
    }
    return result;
  }

  router.get("/api/agent-downline-dashboard", async (req, res) => {
    try {
      const userId = req.query.userId;
      if (!userId) return res.status(400).json({ error: "Missing userId" });

      const [agentArr] = await connection.query(
        "SELECT id_user, name_user,money, phone, code, today AS created_at FROM users WHERE id_user = ?",
        [userId],
      );
      if (!agentArr.length)
        return res.status(404).json({ error: "Agent not found" });
      const agent = agentArr[0];

      const downlines = await getDownlineByLevel(connection, agent.code, 6);

      let levelDetails = [];
      for (let i = 0; i < 6; i++) {
        const users = downlines[i];
        if (!users.length) {
          levelDetails.push({
            level: `Level ${i + 1}`,
            users: 0,
            deposits: 0,
            withdrawals: 0,
            betAmount: 0,
            winAmount: 0,
            profitLoss: 0,
            firstDeposits: [],
            secondDeposits: [],
            thirdDeposits: [],
          });
          continue;
        }
        const phones = users.map((u) => u.phone);
        const [[{ depositSum }]] = await connection.query(
          "SELECT COALESCE(SUM(money),0) as depositSum FROM recharge WHERE phone IN (?) AND status=1",
          [phones],
        );
        const [[{ withdrawSum }]] = await connection.query(
          "SELECT COALESCE(SUM(money),0) as withdrawSum FROM withdraw WHERE phone IN (?) AND status=1",
          [phones],
        );
        let betSum = 0,
          winSum = 0;
        if (phones.length > 0) {
          const [betData] = await connection.query(
            `SELECT 
                SUM(IFNULL(money, 0)) AS grand_total_bet
              FROM (
                SELECT phone, money FROM minutes_1 WHERE phone IN (?) AND isdemo = 0
                UNION ALL
                SELECT phone, money FROM result_k3 WHERE phone IN (?)
                UNION ALL
                SELECT phone, money FROM result_5d WHERE phone IN (?)
              ) AS combined_table`,
            [phones, phones, phones],
          );
          betSum = betData[0]?.grand_total_bet || 0;

          const [winData] = await connection.query(
            `SELECT 
                SUM(IFNULL(get, 0)) AS grand_total_win
              FROM (
                SELECT phone, get FROM minutes_1 WHERE phone IN (?) AND isdemo = 0
                UNION ALL
                SELECT phone, get FROM result_k3 WHERE phone IN (?)
                UNION ALL
                SELECT phone, get FROM result_5d WHERE phone IN (?)
              ) AS combined_table`,
            [phones, phones, phones],
          );
          winSum = winData[0]?.grand_total_win || 0;
        }

        const profitLoss = betSum - winSum;

        let firstDeposits = [],
          secondDeposits = [],
          thirdDeposits = [];
        for (const u of users) {
          const [deposits] = await connection.query(
            `SELECT id_order AS id, money AS amount 
           FROM recharge 
           WHERE phone = ? AND status = 1 
           ORDER BY today ASC LIMIT 3`,
            [u.phone],
          );
          if (deposits[0])
            firstDeposits.push({
              userId: u.id_user,
              amount: deposits[0].amount,
            });
          if (deposits[1])
            secondDeposits.push({
              userId: u.id_user,
              amount: deposits[1].amount,
            });
          if (deposits[2])
            thirdDeposits.push({
              userId: u.id_user,
              amount: deposits[2].amount,
            });
        }

        levelDetails.push({
          level: `Level ${i + 1}`,
          users: users.length,
          deposits: depositSum || 0,
          withdrawals: withdrawSum || 0,
          betAmount: betSum || 0,
          winAmount: winSum || 0,
          profitLoss: profitLoss || 0,
          firstDeposits,
          secondDeposits,
          thirdDeposits,
        });
      }

      const networkSize = downlines.reduce((a, arr) => a + arr.length, 0);

      res.json({
        networkSize,
        networkLevels: 6,
        levelDetails,
        agentInfo: {
          id: agent.id_user,
          username: agent.name_user,
          mobile: agent.phone,
          balance: agent.money,
          createdAt: agent.created_at,
        },
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  function getDateRange(interval) {
    const today = new Date();
    let from;
    switch (interval) {
      case "today":
        from = today.toISOString().slice(0, 10);
        break;
      case "week":
        from = new Date(today.getTime() - 7 * 86400000)
          .toISOString()
          .slice(0, 10);
        break;
      case "month":
        from = new Date(today.getTime() - 30 * 86400000)
          .toISOString()
          .slice(0, 10);
        break;
      case "year":
        from = new Date(today.getTime() - 365 * 86400000)
          .toISOString()
          .slice(0, 10);
        break;
      default:
        from = null;
    }
    return from;
  }

  router.get("/api/top-performers", async (req, res) => {
    try {
      let { interval = "today", limit = 10 } = req.query;
      limit = Math.max(parseInt(limit), 1);
      const fromDate = getDateRange(interval);

      let userSql = `
      SELECT DISTINCT u.id_user, u.name_user, u.phone, u.money
      FROM users u
      WHERE u.phone IN (
        SELECT phone FROM recharge WHERE status=1 ${fromDate ? "AND today >= ?" : ""}
        UNION
        SELECT phone FROM withdraw WHERE status=1 ${fromDate ? "AND today >= ?" : ""}
        UNION
        SELECT phone FROM minutes_1 WHERE isdemo=0 ${fromDate ? "AND today >= ?" : ""}
        UNION
        SELECT phone FROM result_k3 ${fromDate ? "WHERE bet_data >= ?" : ""}
        UNION
        SELECT phone FROM result_5d ${fromDate ? "WHERE bet_data >= ?" : ""}
      )
    `;
      const params = [];
      if (fromDate)
        params.push(fromDate, fromDate, fromDate, fromDate, fromDate);

      const [users] = await connection.query(userSql, params);

      if (!users.length) return res.json([]);

      const performers = [];
      for (let i = 0; i < users.length; ++i) {
        const { phone, name_user, id_user, money } = users[i];

        const [[deposit]] = await connection.query(
          `SELECT COALESCE(SUM(money),0) AS amount, COUNT(*) AS count
         FROM recharge WHERE phone=? AND status=1 ${fromDate ? "AND today >= ?" : ""}`,
          fromDate ? [phone, fromDate] : [phone],
        );

        const [[withdrawal]] = await connection.query(
          `SELECT COALESCE(SUM(money),0) AS amount
         FROM withdraw WHERE phone=? AND status=1 ${fromDate ? "AND today >= ?" : ""}`,
          fromDate ? [phone, fromDate] : [phone],
        );

        const [[m1bet]] = await connection.query(
          `SELECT COALESCE(SUM(money),0) AS bet, COALESCE(SUM(\`get\`),0) AS win
         FROM minutes_1 WHERE phone=? AND isdemo=0 ${fromDate ? "AND today >= ?" : ""}`,
          fromDate ? [phone, fromDate] : [phone],
        );
        const [[k3bet]] = await connection.query(
          `SELECT COALESCE(SUM(money),0) AS bet, COALESCE(SUM(\`get\`),0) AS win
         FROM result_k3 WHERE phone=? ${fromDate ? "AND bet_data >= ?" : ""}`,
          fromDate ? [phone, fromDate] : [phone],
        );
        const [[d5bet]] = await connection.query(
          `SELECT COALESCE(SUM(money),0) AS bet, COALESCE(SUM(\`get\`),0) AS win
         FROM result_5d WHERE phone=? ${fromDate ? "AND bet_data >= ?" : ""}`,
          fromDate ? [phone, fromDate] : [phone],
        );

        const betsAmount =
          Number(m1bet.bet) + Number(k3bet.bet) + Number(d5bet.bet);
        const winAmount =
          Number(m1bet.win) + Number(k3bet.win) + Number(d5bet.win);

        const depositAmount = Number(deposit.amount) || 0;
        const depositCount = Number(deposit.count) || 0;
        const withdrawalAmount = Number(withdrawal.amount) || 0;
        const currentBalance = Number(money) || 0;

        const winRate = betsAmount
          ? Math.round((winAmount / betsAmount) * 100)
          : null;
        const withdrawalRatio = depositAmount
          ? Math.round((withdrawalAmount / depositAmount) * 100)
          : 0;

        performers.push({
          rank: i + 1,
          name: name_user || `User${id_user}`,
          phone,
          status: "Active",
          deposits: {
            amount: depositAmount,
            transactions: depositCount,
          },
          withdrawals: {
            amount: withdrawalAmount,
            ratio: withdrawalRatio,
          },
          betting: {
            bets: betsAmount,
            winRate,
          },
          balance: {
            amount: currentBalance,
          },
        });
      }

      performers.sort((a, b) => b.betting.bets - a.betting.bets);

      performers.forEach((item, idx) => {
        item.rank = idx + 1;
      });

      res.json(performers.slice(0, limit));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/api/handleCaptcha", accountController.handleCaptcha);

  router.post(
    "/support/submit-verification",
    supportController.upload,
    supportController.submitVerification,
  );

  router.post(
    "/support/submitGameProblem",
    supportController.uploadGameProblem,
    supportController.submitGameProblem,
  );

  router.post(
    "/support/submit-verification-id",
    supportController.upload_Retrieve_Login,
    supportController.submit_Retrieve_Login,
  );

  router.get("/keFuMenu", accountController.keFuMenu);
  router.get("/admin/login", accountController.login2Page);

  router.post("/api/sent/otp/verify", accountController.verifyCode);
  router.post("/api/sent/otp/verify/reset", accountController.verifyCodePass);
  router.post("/api/resetPasword", accountController.forGotPassword);

  router.post("/api/sent/otp/verify1", accountController.verifyCodeforregister);
  router.post("/api/addutr", userController.addutr);

  router.get("/aviator", userController.aviator);

  router.get("/api/webapi/searchUser", userController.searchUser);

  router.post("/api/webapi/feedback", userController.feedback);

  router.post(`/api/spribeapi/checkBalance`, allGameController.checkBalance);
  router.post(`/api/spribeapi/transferBalance`, allGameController.transferBalance);
  router.post(`/api/spribeapi/launchGame`, allGameController.launchGame);

  /* ---------- Game listing (public) ---------- */
  router.get(`/api/spribeapi/gamelist`, allGameController.getgamedetails);
  router.get(`/api/spribeapi/gameProvider`, allGameController.gameProvider);
  router.get(`/api/spribeapi/gameType`, allGameController.gameType);
  router.get(`/api/spribeapi/gameListByProvider`, allGameController.gameListByProvider);
  router.get(`/api/spribeapi/gameListByGameType`, allGameController.gameListByGameType);
  router.get(
    `/api/spribeapi/gameListByGameTypeAndProvider`,
    allGameController.gameListByGameTypeAndProvider
  );

  /* ---------- History (login zaroori) ----------
     Controller player ko req.user.mobile se leta hai, URL ke :id se nahi.
     Isliye :id hata diya (kisi aur ki id daalne ka koi matlab/risk nahi).
     page, size, from_date, to_date query params me jayenge. */
  router.get(`/api/spribeapi/gameHistory`, allGameController.gameHistory);

  router.post(
    "/api/webapi/initiateTrexoPayPayment",
    middlewareController,
    userController.initiateTrexoPayPayment,
  );

  router.post(
    "/api/webapi/verifyPayPayment",
    upload.none(),
    userController.verifyTrexoPayPayment,
  );

  router.post("/api/webapi/zilpayCallback", userController.zilpayCallback);

  router.post(
    "/api/webapi/zilpay",
    middlewareController,
    userController.zilpay,
  );
  router.post(
    "/api/webapi/recharge3",
    middlewareController,
    userController.recharge3,
  );

  router.post("/api/webapi/rechargepay", userController.handleRechargeppay);

  router.post("/api/webapi/callbackdatappay", userController.callbackdatappay);

  router.post("/api/webapi/recharge-callback", userController.callbackdata);

  router.get("/checkDes", middlewareController, homeController.checkDes);
  router.get("/checkRecord", middlewareController, homeController.checkRecord);

  router.get(
    "/api/webapi/downlinerecharge/list",
    middlewareController,
    userController.downlinerecharge,
  );
  router.post(
    "/api/webapi/downlinerecharge-data/list-data",
    middlewareController,
    userController.downlinerecharge_data,
  );

  router.get(
    "/api/webapi/commissiondata",
    middlewareController,
    userController.commissiondata,
  );

  router.get(
    "/api/webapi/logincount",
    middlewareController,
    accountController.getLogincount,
  );

  router.get(
    "/api/webapi/loginupdate",
    middlewareController,
    accountController.getLoginupdate,
  );

  router.post(
    "/api/webapi/admin/k3/listOrders",
    adminController.middlewareAdminController,
    k3Controller.getAdminListOrders, // 👈 Naya function k3Controller se
  );

  router.post(
    "/api/webapi/admin/5d/listOrders",
    adminController.middlewareAdminController,
    k5Controller.getAdminListOrders5D, // 👈 Naya function k5Controller se
  );

  router.get(
    "/api/webapi/subordinatedata",
    middlewareController,
    userController.subordinatedata,
  );
  router.get("/api/webapi/get-Notification", adminController.getNotification);
  router.get(
    "/api/webapi/vip-level",
    middlewareController,
    userController.vipLevel,
  );
  router.get(
    "/api/webapi/vip-data",
    middlewareController,
    userController.getVipData,
  );
  router.post(
    "/api/webapi/email-otp",
    middlewareController,
    accountController.sendOTPOnEmail,
  );
  router.post(
    "/api/webapi/email",
    middlewareController,
    accountController.submitEmail,
  );
  router.post("/api/webapi/login-email", accountController.loginEmail);
  router.post("/api/webapi/login-admin", accountController.loginAdmin);

  router.post("/api/webapi/verify-admin-otp", accountController.verifyAdminOTP);

  router.get(
    "/admin/manager/promotions",
    adminController.middlewareAdminController,
    adminController.promotionsPage,
  );

  router.post(
    "/api/webapi/admin/totalJoin",
    adminController.middlewareAdminController,
    adminController.totalJoin,
  );

  router.get("/user/permissions", async (req, res) => {
    try {
      let auth = req.cookies.auth;

      const [user] = await connection.query(
        "SELECT * FROM users WHERE token = ?",
        [auth],
      );

      if (user.length === 0) {
        return res.status(200).json({ message: "Failed", status: false });
      }

      let userId = user[0].phone;

      const [rows] = await connection.query(
        "SELECT permission_key, permission_value FROM user_permissions WHERE user_id = ?",
        [userId],
      );

      const permissions = rows.reduce((acc, row) => {
        acc[row.permission_key] = row.permission_value === 1 ? "1" : "0";
        return acc;
      }, {});

      res.json({ success: true, permissions });
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  router.post(
    "/webapi/createsubadmin",
    adminController.middlewareAdminController,
    adminController.createsubadmin,
  );

  router.get(
    "/webapi/getAllAdmins",
    adminController.middlewareAdminController,
    adminController.getAllAdmins,
  );

  router.post(
    "/webapi/deleteadmin",
    adminController.middlewareAdminController,
    adminController.deleteadmin_1,
  );

  router.post(
    "/webapi/edituserpermissions",
    adminController.middlewareAdminController,
    adminController.editUserPermissions,
  );

  router.get(
    "/webapi/getuserpermissions",
    adminController.middlewareAdminController,
    adminController.getUserPermissions,
  );

  router.get(
    "/api/webapi/random-promotion",
    middlewareController,
    userController.getpromotiondata,
  );
  router.post(
    "/api/webapi/update-promotion",
    adminController.middlewareAdminController,
    userController.updateRandomPromotion,
  );
  router.post(
    "/api/webapi/update-rank",
    adminController.middlewareAdminController,
    userController.makePromotion,
  );
  router.post(
    "/api/webapi/daily-bet-commition",
    userController.dailyBetCommition,
  );
  router.post(
    "/api/webapi/update-attendencs-bonus",
    adminController.attendanceBonus,
  );

  router.get(
    "/api/webapi/get-attendencs-bonus",
    adminController.getattendanceBonus,
  );
  router.post("/api/webapi/get-ligalTrade-data", adminController.ligalTrade);
  router.post(
    "/api/webapi/get-profit-loss",
    adminController.middlewareAdminController,
    adminController.profitLoss,
  );

  router.post("/api/webapi/set-warning-alert", adminController.setWarningAlert);
  router.post(
    "/api/webapi/set-deposite-requrment",
    adminController.middlewareAdminController,
    adminController.setdepositerequrments,
  );
  router.get(
    "/api/webapi/get-deposite-requrment",
    adminController.middlewareAdminController,
    adminController.getdepositerequrments,
  );
  router.post(
    "/api/webapi/set-website-mode",
    adminController.middlewareAdminController,
    adminController.setwebsiteMode,
  );
  router.get(
    "/api/webapi/get-website-mode",
    adminController.middlewareAdminController,
    adminController.geWebsiteMode,
  );
  router.post("/api/webapi/set-sinup-bonus", adminController.setSinupBonus);
  router.get("/api/webapi/get-signup-bonus", adminController.getSignupBonus);

  router.post("/api/webapi/set-vip-data", adminController.vipData);
  router.post(
    "/api/webapi/set-userBet-commition",
    adminController.setUserBetCommition,
  );
  router.post(
    "/api/webapi/set-recharge-bonus",
    adminController.setRechargeBonus,
  );
  router.delete(
    "/api/webapi/delete-recharge-bonus/:id",
    adminController.deleteRechargeBonus,
  );

  router.post(
    "/api/webapi/update-recharge-bonus",
    adminController.updateRechargeBonus,
  );
  router.get(
    "/api/webapi/getrecharge-bonus",
    adminController.getRechargeBonusCount,
  );
  router.get(
    "/api/webapi/get-active-user",
    adminController.middlewareAdminController,
    adminController.activeUser,
  );
  router.get(
    "/api/webapi/get-winning-percentage",
    adminController.middlewareAdminController,
    adminController.winningPercentage,
  );
  router.post(
    "/api/webapi/set-invitation-bonus",
    adminController.setInvitationBonus,
  );
  router.post(
    "/api/webapi/update-inviaion-bonus",
    adminController.updateInvitationBonus,
  );
  router.delete(
    "/api/webapi/delete-inviaion-bonus",
    adminController.deleteInvitationBonus,
  );
  router.get(
    "/api/webapi/get-invitation-bonus",
    userController.getInvitationBonus,
  );

  router.get("/wallet", middlewareController, homeController.walletPage);
  router.get(
    "/wallet/recharge",
    middlewareController,
    homeController.rechargePage,
  );
  router.get(
    "/wallet/withdrawal",
    middlewareController,
    homeController.withdrawalPage,
  );
  router.get(
    "/wallet/rechargerecord",
    middlewareController,
    homeController.rechargerecordPage,
  );

  router.get(
    "/wallet/withdrawalrecord",
    middlewareController,
    homeController.withdrawalrecordPage,
  );

  router.get(
    "/admin/manager/withdrawalsuccess",
    middlewareController,
    adminController.withdrawsuccess,
  );

  router.get(
    "/admin/manager/withdrawlfail",
    middlewareController,
    adminController.withdrawfail,
  );

  router.get("/wallet/addBank", middlewareController, homeController.addBank);
  router.get(
    "/wallet/downlinerecharge",
    middlewareController,
    homeController.downlinerechargePage,
  );
  router.get(
    "/wallet/transactionhistory",
    middlewareController,
    homeController.transactionhistoryPage,
  );

  // ============================================
  // PAYMENT ROUTES — KwikPay + UPI_MANUAL ONLY
  // ============================================

  // ---- Manual UPI Payment ----
  router.get(
    "/api/wallet/paynow/manual_upi",
    middlewareController,
    paymentController.initiateManualUPIPayment,
  );
  router.post(
    "/api/wallet/paynow/manual_upi_request",
    middlewareController,
    paymentController.addManualUPIPaymentRequest,
  );
  // KwikPay routes removed: this project uses the QuroPay routes below.
// ============================================

  router.get("/mian", middlewareController, homeController.mianPage);

  router.get(
    "/recordsalary",
    middlewareController,
    homeController.recordsalary,
  );
  router.get(
    "/getrecord",
    middlewareController,
    homeController.getSalaryRecord,
  );
  router.get("/about", middlewareController, homeController.aboutPage);
  router.get(
    "/redenvelopes",
    middlewareController,
    homeController.redenvelopes,
  );
  router.get("/mian/forgot", middlewareController, homeController.forgot);
  router.get("/newtutorial", homeController.newtutorial);
  router.get(
    "/about/privacyPolicy",
    middlewareController,
    homeController.privacyPolicy,
  );
  router.get(
    "/about/riskAgreement",
    middlewareController,
    homeController.riskAgreement,
  );

  router.get("/myProfile", middlewareController, homeController.myProfilePage);

  router.post(
    "/admin/manager/settings/demo",
    adminController.middlewareAdminController,
    adminController.settingdemo,
  );

  // BET trx
  router.get("/trx", middlewareController, winGoController.trxPage);
  router.get("/trx/3", middlewareController, winGoController.trxPage3);
  router.get("/trx/5", middlewareController, winGoController.trxPage5);
  router.get("/trx/10", middlewareController, winGoController.trxPage10);

  // BET K5D
  router.get("/5d", middlewareController, k5Controller.K5DPage);
  router.post(
    "/api/webapi/action/5d/join",
    middlewareController,
    k5Controller.betK5D,
  );
  router.post(
    "/api/webapi/5d/GetNoaverageEmerdList",
    middlewareController,
    k5Controller.listOrderOld,
  );
  router.post(
    "/api/webapi/5d/GetMyEmerdList",
    middlewareController,
    k5Controller.GetMyEmerdList,
  );

  router.post(
    "/api/webapi/action/cargame/join",
    middlewareController,
    carController.betcargame,
  );
  router.post(
    "/api/webapi/cargame/GetNoaverageEmerdList",
    middlewareController,
    carController.listOrderOld,
  );
  router.post(
    "/api/webapi/cargame/GetMyEmerdList",
    middlewareController,
    carController.GetMyEmerdList,
  );

  // BET K3
  router.get("/k3", middlewareController, k3Controller.K3Page);

  router.post(
    "/api/webapi/action/k3/join",
    middlewareController,
    k3Controller.betK3,
  );
  router.post(
    "/api/webapi/k3/GetNoaverageEmerdList",
    middlewareController,
    k3Controller.listOrderOld,
  );
  router.post(
    "/api/webapi/k3/GetMyEmerdList",
    middlewareController,
    k3Controller.GetMyEmerdList,
  );

  // login | register
  router.post("/api/webapi/login", accountController.login);
  router.post(
    "/api/webapi/notification",
    middlewareController,
    accountController.deleteLoginDetail,
  );
  router.get(
    "/api/webapi/notification",
    middlewareController,
    accountController.getLoginDetail,
  );
  router.post("/api/webapi/register", accountController.register);
  router.get("/aviator", middlewareController, userController.aviator);
  router.get(
    "/api/webapi/GetUserInfo",
    middlewareController,
    userController.userInfo,
  );
  router.post(
    "/api/webapi/change/userInfo",
    middlewareController,
    userController.changeUser,
  );
  router.post(
    "/api/webapi/change/pass",
    middlewareController,
    userController.changePassword,
  );
  router.post(
    "/api/webapi/change/userPhoto",
    middlewareController,
    userController.changeUserPhoto,
  );

  router.post(
    "/api/webapi/rebateCreate",
    middlewareController,
    userController.rebateCreate,
  );
  router.get(
    "/api/webapi/getRebate",
    middlewareController,
    userController.getRebate,
  );

  // bet wingo
  router.post(
    "/api/webapi/action/join",
    middlewareController,
    winGoController.betWinGo,
  );
  router.post(
    "/api/webapi/GetNoaverageEmerdList",
    middlewareController,
    winGoController.listOrderOld,
  );
  router.post(
    "/api/webapi/GetMyEmerdList",
    middlewareController,
    winGoController.GetMyEmerdList,
  );

  router.get(
    "/api/webapi/totalcommission",
    middlewareController,
    userController.totalCommission,
  );
  router.get(
    "/api/webapi/promotion",
    middlewareController,
    userController.promotion,
  );

  router.get("/api/webapi/promotioncron", commissionController.promotion);
  router.get(
    "/api/webapi/downlinerecharge_newcron",
    commissionController.downlinerecharge_new,
  );
  router.get(
    "/api/webapi/tradeCommissioncron",
    winGoController.tradeCommission,
  );

  router.get("/api/webapi/vipLevelEverycron", userController.vipLevelEvery);

  router.get("/api/webapi/vipLevelMonthlycron", userController.vipLevelMonthly);

  router.get(
    "/api/webapi/totalcommission",
    middlewareController,
    userController.totalCommission,
  );
  router.get(
    "/api/webapi/transactionhistory",
    middlewareController,
    userController.transactionHistory,
  );
  router.post(
    "/api/webapi/checkIn",
    middlewareController,
    userController.checkInHandling,
  );
  router.get(
    "/api/webapi/check/Info",
    middlewareController,
    userController.infoUserBank,
  );
  router.post(
    "/api/webapi/addBank",
    middlewareController,
    userController.addBank,
  );

  router.post(
    "/api/webapi/addusdt",
    middlewareController,
    userController.addUSDT,
  );

  router.post(
    "/api/webapi/otp",
    middlewareController,
    userController.verifyCode,
  );
  router.post(
    "/api/webapi/use/redenvelope",
    middlewareController,
    userController.useRedenvelope,
  );
  router.get(
    "/api/webapi/get/redenvelope",
    middlewareController,
    userController.getRedenvelope,
  );
  router.get(
    "/api/webapi/new-subordinate",
    middlewareController,
    userController.newSubordinateData,
  );
  router.get(
    "/api/webapi/calculateDownlineBonuses",
    middlewareController,
    userController.calculateDownlineBonuses,
  );
  // wallet
  router.post(
    "/api/webapi/recharge",
    middlewareController,
    userController.recharge,
  );
  router.get("/api/webapi/bhatclub_callback", userController.handleCallback);
  router.post(
    "/api/webapi/online-recharge",
    middlewareController,
    userController.onlineRecharge,
  );
  router.post(
    "/api/webapi/cancel_recharge",
    middlewareController,
    userController.cancelRecharge,
  );
  router.post("/wowpay/create", middlewareController, userController.wowpay);
  router.post(
    "/api/webapi/confirm_recharge",
    middlewareController,
    userController.confirmRecharge,
  );

  router.get(
    "/api/webapi/getdailyactivyreward",
    middlewareController,
    userController.getdailyactivyreward,
  );

  router.get("/api/webapi/bonus-get", async (req, res) => {
    try {
      const [bonusSettings] = await connection.query(
        "SELECT `id`, `betrequriment`, `bonus`, `type`, `created_at`, `updated_at` FROM `bonus_settings`",
      );
      return res.status(200).json({
        message: "Bonus retrieved successfully",
        success: true,
        data: bonusSettings,
      });
    } catch (error) {
      console.error("Error fetching bonus settings:", error);
      return res.status(500).json({
        message: "Internal server error",
        success: false,
        error: error.message,
      });
    }
  });

  router.post("/api/webapi/bonus-settings", async (req, res) => {
    try {
      const { betrequriment, bonus, type } = req.body;

      if (!betrequriment || !bonus || !type) {
        return res
          .status(400)
          .json({ message: "Missing required fields", success: false });
      }

      await connection.query(
        "INSERT INTO bonus_settings (betrequriment, bonus, type) VALUES (?, ?, ?)",
        [betrequriment, bonus, type],
      );

      return res
        .status(201)
        .json({ message: "Bonus setting created successfully", success: true });
    } catch (error) {
      console.error("Error creating bonus setting:", error);
      return res.status(500).json({
        message: "Internal server error",
        success: false,
        error: error.message,
      });
    }
  });

  router.post("/api/webapi/bonus-settings_update", async (req, res) => {
    try {
      const { betrequriment, bonus, type, id } = req.body;

      if (!betrequriment || !bonus || !type) {
        return res
          .status(400)
          .json({ message: "Missing required fields", success: false });
      }

      const [result] = await connection.query(
        "UPDATE bonus_settings SET betrequriment = ?, bonus = ?, type = ? WHERE id = ?",
        [betrequriment, bonus, type, id],
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Bonus setting not found", success: false });
      }

      return res
        .status(200)
        .json({ message: "Bonus setting updated successfully", success: true });
    } catch (error) {
      console.error("Error updating bonus setting:", error);
      return res.status(500).json({
        message: "Internal server error",
        success: false,
        error: error.message,
      });
    }
  });

  router.delete("/api/webapi/bonus-settings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await connection.query(
        "DELETE FROM bonus_settings WHERE id = ?",
        [id],
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Bonus setting not found", success: false });
      }

      return res
        .status(200)
        .json({ message: "Bonus setting deleted successfully", success: true });
    } catch (error) {
      console.error("Error deleting bonus setting:", error);
      return res.status(500).json({
        message: "Internal server error",
        success: false,
        error: error.message,
      });
    }
  });

  router.get(
    "/api/webapi/myTeam",
    middlewareController,
    userController.listMyTeam,
  );
  router.get(
    "/api/webapi/recharge/list",
    middlewareController,
    userController.listRecharge,
  );

  router.get(
    "/api/webapi/recharge/list2",
    middlewareController,
    userController.listRecharge2,
  );

  router.get(
    "/api/webapi/withdraw/list",
    middlewareController,
    userController.listWithdraw,
  );
  router.get(
    "/api/webapi/recharge/check",
    middlewareController,
    userController.recharge2,
  );
  router.post(
    "/api/webapi/withdrawal",
    middlewareController,
    userController.withdrawal3,
  );
  router.post(
    "/api/webapi/callback_bank",
    middlewareController,
    userController.callback_bank,
  );
  router.post(
    "/api/webapi/recharge/update",
    middlewareController,
    userController.updateRecharge,
  );
  router.get(
    "/api/webapi/confirm_recharge_usdt",
    middlewareController,
    userController.confirmUSDTRecharge,
  );
  router.post(
    "/api/webapi/confirm_recharge_usdt",
    middlewareController,
    userController.confirmUSDTRecharge,
  );

  router.post(
    "/api/webapi/search",
    middlewareController,
    userController.search,
  );

  // daily

  router.get(
    "/manager/Agentperformance",
    dailyController.middlewareDailyController,
    dailyController.getAgentPerformance,
  );

  router.get(
    "/manager/salary",
    dailyController.middlewareDailyController,
    dailyController.salary,
  );

  router.get(
    "/manager/index",
    dailyController.middlewareDailyController,
    dailyController.dailyPage,
  );
  router.get(
    "/manager/listRecharge",
    dailyController.middlewareDailyController,
    dailyController.listRecharge,
  );
  router.get(
    "/manager/listWithdraw",
    dailyController.middlewareDailyController,
    dailyController.listWithdraw,
  );
  router.get(
    "/manager/members",
    dailyController.middlewareDailyController,
    dailyController.listMeber,
  );
  router.get(
    "/manager/profileMember",
    dailyController.middlewareDailyController,
    dailyController.profileMember,
  );
  router.get(
    "/manager/settings",
    dailyController.middlewareDailyController,
    dailyController.settingPage,
  );
  router.get(
    "/manager/gifts",
    dailyController.middlewareDailyController,
    dailyController.giftPage,
  );
  router.get(
    "/manager/support",
    dailyController.middlewareDailyController,
    dailyController.support,
  );
  router.get(
    "/manager/member/info/:phone",
    dailyController.middlewareDailyController,
    dailyController.pageInfo,
  );

  router.post(
    "/manager/member/info/:phone",
    dailyController.middlewareDailyController,
    dailyController.userInfo,
  );
  router.post(
    "/manager/member/listRecharge/:phone",
    dailyController.middlewareDailyController,
    dailyController.listRechargeMem,
  );
  router.post(
    "/manager/member/listWithdraw/:phone",
    dailyController.middlewareDailyController,
    dailyController.listWithdrawMem,
  );
  router.post(
    "/manager/member/redenvelope/:phone",
    dailyController.middlewareDailyController,
    dailyController.listRedenvelope,
  );
  router.post(
    "/manager/member/bet/:phone",
    dailyController.middlewareDailyController,
    dailyController.listBet,
  );

  router.post(
    "/manager/settings/list",
    dailyController.middlewareDailyController,
    dailyController.settings,
  );

  router.post(
    "/manager/createBonus",
    dailyController.middlewareDailyController,
    dailyController.createBonus,
  );
  router.post(
    "/manager/listRedenvelops",
    dailyController.middlewareDailyController,
    dailyController.listRedenvelops,
  );

  router.post(
    "/manager/listRecharge",
    dailyController.middlewareDailyController,
    dailyController.listRechargeP,
  );
  router.post(
    "/manager/listWithdraw",
    dailyController.middlewareDailyController,
    dailyController.listWithdrawP,
  );

  router.post(
    "/api/webapi/statistical",
    dailyController.middlewareDailyController,
    dailyController.statistical,
  );
  router.post(
    "/manager/infoCtv",
    dailyController.middlewareDailyController,
    dailyController.infoCtv,
  );
  router.post(
    "/manager/infoCtv/select",
    dailyController.middlewareDailyController,
    dailyController.infoCtv2,
  );
  router.post(
    "/api/webapi/manager/listMember",
    dailyController.middlewareDailyController,
    dailyController.listMember,
  );

  router.post(
    "/api/webapi/manager/buff",
    dailyController.middlewareDailyController,
    dailyController.buffMoney,
  );

  router.post("/admin/manager/settings/need", adminController.settingneed);

  router.post("/admin/manager/set-spin-data", adminController.spinController);
  router.get(
    "/api/webapi/get-spin-data",
    middlewareController,
    userController.getSpinData,
  );
  router.post(
    "/api/webapi/clime-spin-data",
    middlewareController,
    userController.claimSpin,
  );

  router.get(
    "/api/webapi/spin-history",
    middlewareController,
    userController.spineHistory,
  );

  // user problem
  router.post(
    "/api/webapi/userProblem",
    middlewareController,
    userController.userProblem,
  );
  router.post(
    "/api/webapi/userProblem-get",
    middlewareController,
    userController.userProblemGet,
  );
  router.get(
    "/api/webapi/admin/livechat",
    middlewareController,
    userController.adminProblemGet,
  );
  router.post(
    "/api/webapi/admin/livechatupdate",
    middlewareController,
    userController.adminProblemSubmit,
  );

  router.get(
    "/api/webapi/admin/get-commission",
    middlewareController,
    winGoController.tradeCommissionGet,
  );

  router.get(
    "/api/webapi/admin/update-commission",
    middlewareController,
    winGoController.tradeCommissionadmin,
  );

  router.get(
    "/admin/manager/lives",
    adminController.middlewareAdminController,
    adminController.livePage,
  );

  router.get(
    "/admin/manager/userlevel",
    adminController.middlewareAdminController,
    adminController.userlevelPage,
  );
  router.get(
    "/admin/manager/userlevelAll",
    adminController.middlewareAdminController,
    adminController.userlevelAllPage,
  );

  router.post(
    "/api/webapi/admin/manager/user-data",
    adminController.middlewareAdminController,
    adminController.downlinerecharge_data_admin,
  );

  router.post(
    "/api/webapi/admin/manager/user-data-all",
    adminController.middlewareAdminController,
    adminController.downlinerecharge_data_adminAll,
  );

  router.post(
    "/admin/manager/addust",
    adminController.middlewareAdminController,
    adminController.adminaddUSDT,
  );

  router.get("/admin/manager/banner", adminController.bannerPage);
  router.get(
    "/admin/manager/activity-banner",
    adminController.activitybannerPage,
  );
  router.get("/admin/manager/logo-setting", adminController.logoSettingPage);
  router.get(
    "/admin/manager/chennal-setting",
    adminController.chennalSettingPage,
  );

  router.get("/api/webapi/banner", adminController.getBanner);
  router.post("/api/webapi/banners", adminController.updateBanner);
  router.post(
    "/api/webapi/activity-banners",
    adminController.updateActivityBanner,
  );
  router.post("/api/webapi/logo-banners", adminController.updateLogo);
  router.post("/api/webapi/update-chennal", adminController.updateChennal);

  router.post("/api/webapi/getDataRecharge", adminController.getDataRecharge);

  router.get(
    "/admin/manager/vipsection",
    adminController.middlewareAdminController,
    adminController.vipsection,
  );

  router.get(
    "/admin/manager/FirstDepositBonus",
    adminController.middlewareAdminController,
    adminController.FirstDepositBonus,
  );

  router.get(
    "/admin/manager/newfiles/attendencebones",
    adminController.middlewareAdminController,
    adminController.attendencebonesPage,
  );

  router.get(
    "/admin/manager/newfiles/SignupBones",
    adminController.middlewareAdminController,
    adminController.SignupBonespage,
  );

  router.get(
    "/admin/manager/newfiles/agentperformance",
    adminController.middlewareAdminController,
    adminController.agentperformancepage,
  );

  router.get(
    "/admin/manager/newfiles/createuser",
    adminController.middlewareAdminController,
    adminController.createuser,
  );
    // NEW: List users for User Management page
  router.get(
    "/admin/users/list",
    adminController.middlewareAdminController,
    adminController.listAdminUsers,
  );

  // NEW: Update user level (Active/Inactive)
  router.put(
    "/admin/users/update-level/:id",
    adminController.middlewareAdminController,
    adminController.updateUserLevel,
  );
  router.get(
    "/admin/manager/newfiles/apitransaction",
    adminController.middlewareAdminController,
    adminController.apitransaction,
  );
  router.get(
    "/admin/manager/newfiles/topperformance",
    adminController.middlewareAdminController,
    adminController.topperformance,
  );

  // ============================================
// DEMO USER BALANCE REFILL
// ============================================
router.post(
  "/api/webapi/demo/refill-balance",
  middlewareController,
  demoBalanceController.refillDemoBalance,
);

router.get(
  "/api/webapi/demo/check-balance",
  middlewareController,
  demoBalanceController.checkDemoBalance,
);
  router.get(
    "/admin/manager/newfiles/iprecord",
    adminController.middlewareAdminController,
    adminController.iprecord,
  );

  router.get(
    "/admin/manager/createsubpanel",
    adminController.middlewareAdminController,
    adminController.createsubpanel,
  );
  router.get(
    "/admin/manager/llegaltrade",
    adminController.middlewareAdminController,
    adminController.llegaltrade,
  );
  router.get(
    "/admin/manager/Supportsection",
    adminController.middlewareAdminController,
    adminController.Supportsection,
  );
  router.get(
    "/admin/manager/profitloss",
    adminController.middlewareAdminController,
    adminController.profitloss,
  );
  router.get(
    "/admin/manager/spinwheel",
    adminController.middlewareAdminController,
    adminController.spinwheel,
  );
  router.get(
    "/admin/manager/activitysettings",
    adminController.middlewareAdminController,
    adminController.activitysettings,
  );
  router.get(
    "/admin/manager/InvitationBonus",
    adminController.middlewareAdminController,
    adminController.InvitationBonus,
  );

  router.get(
    "/admin/manager/index",
    adminController.middlewareAdminController,
    adminController.adminPage,
  );
  router.get(
    "/admin/manager/index/3",
    adminController.middlewareAdminController,
    adminController.adminPage3,
  );
  router.get(
    "/admin/manager/index/5",
    adminController.middlewareAdminController,
    adminController.adminPage5,
  );
  router.get(
    "/admin/manager/index/10",
    adminController.middlewareAdminController,
    adminController.adminPage10,
  );

  router.post(
    "/api/admin/enableWithdraw",
    adminController.middlewareAdminController,
    adminController.enableWithdraw,
  );

  router.get(
    "/admin/manager/motobike",
    adminController.middlewareAdminController,
    adminController.adminCarPage,
  );

  router.get(
    "/admin/manager/Home",
    adminController.middlewareAdminController,
    homeController.homeAdminPage,
  );

  // trx
  router.get(
    "/admin/manager/trx",
    adminController.middlewareAdminController,
    adminController.admintrxPage,
  );
  router.get(
    "/admin/manager/trx/3",
    adminController.middlewareAdminController,
    adminController.admintrxPage3,
  );
  router.get(
    "/admin/manager/trx/5",
    adminController.middlewareAdminController,
    adminController.admintrxPage5,
  );
  router.get(
    "/admin/manager/trx/10",
    adminController.middlewareAdminController,
    adminController.admintrxPage10,
  );

  router.get(
    "/admin/manager/5d",
    adminController.middlewareAdminController,
    adminController.adminPage5d,
  );

  router.get(
    "/admin/manager/5d/3",
    adminController.middlewareAdminController,
    adminController.adminPage5d,
  );

  router.get(
    "/admin/manager/5d/5",
    adminController.middlewareAdminController,
    adminController.adminPage5d,
  );

  router.get(
    "/admin/manager/5d/10",
    adminController.middlewareAdminController,
    adminController.adminPage5d,
  );
  router.get(
    "/admin/manager/k3",
    adminController.middlewareAdminController,
    adminController.adminPageK3,
  );

  router.get(
    "/admin/manager/members",
    adminController.middlewareAdminController,
    adminController.membersPage,
  );
  router.get(
    "/admin/manager/createBonus",
    adminController.middlewareAdminController,
    adminController.giftPage,
  );
  router.get(
    "/admin/manager/ctv",
    adminController.middlewareAdminController,
    adminController.ctvPage,
  );
  router.get(
    "/admin/manager/demouser",
    adminController.middlewareAdminController,
    adminController.demouser,
  );
  router.get(
    "/admin/manager/ctv/profile/:phone",
    adminController.middlewareAdminController,
    adminController.ctvProfilePage,
  );

  router.get(
    "/admin/manager/turnover",
    adminController.middlewareAdminController,
    adminController.turnover,
  );
  router.get(
    "/admin/manager/betting",
    adminController.middlewareAdminController,
    adminController.betting,
  );
  router.get(
    "/admin/manager/today_report",
    adminController.middlewareAdminController,
    adminController.todayreport,
  );

  router.post(
    "/admin/manager/settings/message",
    adminController.middlewareAdminController,
    adminController.settingMessage,
  );

  router.get(
    "/admin/manager/settings",
    adminController.middlewareAdminController,
    adminController.settings,
  );

  router.get(
    "/admin/manager/listRedenvelops",
    adminController.middlewareAdminController,
    adminController.listRedenvelops,
  );
  router.post(
    "/admin/manager/infoCtv",
    adminController.middlewareAdminController,
    adminController.infoCtv,
  );
  router.post(
    "/admin/manager/infoCtv/select",
    adminController.middlewareAdminController,
    adminController.infoCtv2,
  );
  router.post(
    "/admin/manager/settings/bank",
    adminController.middlewareAdminController,
    adminController.settingBank,
  );
  router.post(
    "/admin/manager/settings/cskh",
    adminController.middlewareAdminController,
    adminController.settingCskh,
  );
  router.post(
    "/admin/manager/settings/buff",
    adminController.middlewareAdminController,
    adminController.settingbuff,
  );
  router.post(
    "/admin/manager/create/ctv",
    adminController.middlewareAdminController,
    adminController.register,
  );
  router.post(
    "/admin/manager/settings/get",
    adminController.middlewareAdminController,
    adminController.settingGet,
  );
  router.post(
    "/admin/manager/createBonus",
    adminController.middlewareAdminController,
    adminController.createBonus,
  );

  router.post(
    "/admin/member/listRecharge/:phone",
    adminController.middlewareAdminController,
    adminController.listRechargeMem,
  );
  router.post(
    "/admin/member/listWithdraw/:phone",
    adminController.middlewareAdminController,
    adminController.listWithdrawMem,
  );
  router.post(
    "/admin/member/redenvelope/:phone",
    adminController.middlewareAdminController,
    adminController.listRedenvelope,
  );
  router.post(
    "/admin/member/bet/:phone",
    adminController.middlewareAdminController,
    adminController.listBet,
  );

  router.get(
    "/admin/manager/export/todayrecharge",
    adminController.middlewareAdminController,
    adminController.todayrechargeexport,
  );
  router.get(
    "/admin/manager/recharge",
    adminController.middlewareAdminController,
    adminController.rechargePage,
  );
  router.get(
    "/admin/manager/allrecharge",
    adminController.middlewareAdminController,
    adminController.rechargeAllPage,
  );
  router.get(
    "/admin/manager/successrecharge",
    adminController.middlewareAdminController,
    adminController.rechargeSuccessPage,
  );
  router.get(
    "/admin/manager/pandingrecharge",
    adminController.middlewareAdminController,
    adminController.rechargePandingPage,
  );
  router.get(
    "/admin/manager/failrecharge",
    adminController.middlewareAdminController,
    adminController.rechargeFailPage,
  );

  router.get(
    "/admin/manager/withdraw",
    adminController.middlewareAdminController,
    adminController.withdraw,
  );
  router.get(
    "/admin/manager/levelSetting",
    adminController.middlewareAdminController,
    adminController.levelSetting,
  );
  router.get(
    "/admin/manager/CreatedSalaryRecord",
    adminController.middlewareAdminController,
    adminController.CreatedSalaryRecord,
  );
  router.get(
    "/admin/manager/rechargeRecord",
    adminController.middlewareAdminController,
    adminController.rechargeRecord,
  );
  router.get(
    "/admin/manager/withdrawRecord",
    adminController.middlewareAdminController,
    adminController.withdrawRecord,
  );
  router.get(
    "/admin/manager/statistical",
    adminController.middlewareAdminController,
    adminController.statistical,
  );
  router.get(
    "/admin/member/info/:id",
    adminController.middlewareAdminController,
    adminController.infoMember,
  );
  router.get(
    "/api/webapi/admin/getLevelInfo",
    adminController.middlewareAdminController,
    adminController.getLevelInfo,
  );
  router.get(
    "/api/webapi/admin/getSalary",
    adminController.middlewareAdminController,
    adminController.getSalary,
  );

  router.post(
    "/admin/member/editbank",
    adminController.middlewareAdminController,
    adminController.editbank,
  );
  router.post(
    "/api/webapi/admin/updateLevel",
    adminController.middlewareAdminController,
    adminController.updateLevel,
  );
  router.post(
    "/api/webapi/admin/CreatedSalary",
    adminController.middlewareAdminController,
    adminController.CreatedSalary,
  );

  router.post(
    "/api/webapi/getweeldetails",
    middlewareController,
    userController.redeemSpin,
  );

  router.post(
    "/api/webapi/admin/listMember",
    adminController.middlewareAdminController,
    adminController.listMember,
  );
  router.post(
    "/api/webapi/admin/listctv",
    adminController.middlewareAdminController,
    adminController.listCTV,
  );
  router.post(
    "/api/webapi/admin/withdraw",
    adminController.middlewareAdminController,
    adminController.handlWithdraw,
  );

  router.post(
    "/api/webapi/admin/withdraw2",
    adminController.middlewareAdminController,
    adminController.handlWithdraw2,
  );

  router.post(
    "/api/handlWithdrawCallback",
    adminController.handlWithdrawCallback,
  );

  router.post(
    "/api/webapi/admin/recharge",
    adminController.middlewareAdminController,
    adminController.recharge,
  );

  router.post(
    "/api/webapi/admin/rechargeDuyet",
    adminController.middlewareAdminController,
    adminController.rechargeDuyet,
  );

  router.post(
    "/api/webapi/admin/spinset",
    adminController.middlewareAdminController,
    adminController.spinset,
  );

  router.post(
    "/api/webapi/admin/member/info",
    adminController.middlewareAdminController,
    adminController.userInfo,
  );
  router.post("/api/webapi/admin/statistical", adminController.statistical2);

  router.post(
    "/api/webapi/admin/banned",
    adminController.middlewareAdminController,
    adminController.banned,
  );

  router.post(
    "/api/webapi/admin/eliga-unblock",
    adminController.middlewareAdminController,
    adminController.eligaUnblockUser,
  );
  router.post(
    "/api/webapi/admin/turnover",
    adminController.middlewareAdminController,
    adminController.turnover_report,
  );
  router.post(
    "/api/webapi/admin/betting",
    adminController.middlewareAdminController,
    adminController.betting_report,
  );
  router.post(
    "/api/webapi/admin/todayreport",
    adminController.middlewareAdminController,
    adminController.today_report,
  );

  router.post(
    "/api/webapi/admin/racing/totalJoin",
    adminController.middlewareAdminController,
    adminController.totalJoinRacing,
  );

  router.post(
    "/api/webapi/admin/change",
    adminController.middlewareAdminController,
    adminController.changeAdmin,
  );

  router.post(
    "/api/webapi/admin/racing/change",
    adminController.middlewareAdminController,
    adminController.changeAdminRacing,
  );

  router.post(
    "/api/webapi/admin/profileUser",
    adminController.middlewareAdminController,
    adminController.profileUser,
  );

  // admin 5d
  router.post(
    "/api/webapi/admin/5d/listOrders",
    adminController.middlewareAdminController,
    adminController.listOrderOld,
  );
  router.post(
    "/api/webapi/admin/k3/listOrders",
    adminController.middlewareAdminController,
    adminController.listOrderOldK3,
  );
  router.post(
    "/api/webapi/admin/5d/editResult",
    adminController.middlewareAdminController,
    adminController.editResult,
  );
  router.post(
    "/api/webapi/admin/k3/editResult",
    adminController.middlewareAdminController,
    adminController.editResult2,
  );
  // my admin code
  router.get(
    "/admin/manager/notification",
    adminController.middlewareAdminController,
    adminController.notificationPage,
  );
  router.post(
    "/api/webapi/admin/create-notification",
    adminController.middlewareAdminController,
    adminController.createNotification,
  );
  router.post(
    "/api/webapi/admin/delete-notification/:id",
    adminController.middlewareAdminController,
    adminController.singleNotificationDelete,
  );

  router.get(
    "/api/webapi/GetTopBettingboardGame/:app_id",
    middlewareController,
    bettingController.boardGame,
  );
  router.get("/api/webapi/jilihistory/:account", jilliController.gamehistory);

  router.get(
    "/api/webapi/GetJilliboardGame/:gameId",
    middlewareController,
    jilliController.jillistart,
  );
  router.get(
    "/api/webapi/getboardGameInfo",
    middlewareController,
    jilliController.jillimoney,
  );
  router.get(
    "/api/webapi/transferMoneyToMainWallet",
    middlewareController,
    jilliController.jillitransfermoney,
  );

  router.get(
    "/api/webapi/demoUser",
    adminController.middlewareAdminController,
    adminController.demoUser,
  );
  router.post(
    "/api/webapi/convertAgent",
    adminController.middlewareAdminController,
    adminController.convertAgent,
  );

  // pages
  router.get(
    "/admin/manager/deposite",
    adminController.middlewareAdminController,
    adminController.depositePage,
  );
  router.get(
    "/admin/manager/withdrawal",
    adminController.middlewareAdminController,
    adminController.withdrawalPage,
  );

  router.get(
    "/admin/manager/changeloginid",
    adminController.middlewareAdminController,
    adminController.changeloginIdPass,
  );
  router.get(
    "/admin/manager/modifyBankInfo",
    adminController.middlewareAdminController,
    adminController.modifyBankInfo,
  );
  router.get(
    "/admin/manager/usdtAddress",
    adminController.middlewareAdminController,
    adminController.usdtaddress,
  );
  router.get(
    "/admin/manager/activityBonus",
    adminController.middlewareAdminController,
    adminController.activityBonus,
  );

  router.get(
    "/admin/manager/gameproblems",
    adminController.middlewareAdminController,
    adminController.gameProblems,
  );
   router.post(
    "/api/wallet/paynow/quropay",
    middlewareController,
    paymentController.initiateQuroPayPayment,
  );

  // Webhook — PUBLIC (no auth), RAW body for HMAC verification
  router.post(
    "/api/wallet/verify/quropay",
    express.raw({ type: "application/json" }),
    paymentController.verifyQuroPayPayment,
  );

  // GET → checkout se return hone par status check
  router.get(
    "/api/wallet/check/quropay",
    middlewareController,
    paymentController.checkQuroPayStatus,
  );

  // support system
  router.get("/api/recharge/:auth", getRecharge);
  router.get("/api/withdrawl2/:auth", getwithdrawl2);

  router.get("/api/getUserProblems/:auth", getUserProblems);

  router.post("/api/deposit", depositNotReceived);

  router.post("/api/ifsc", ifscModification);

  router.post("/api/bankName", bankName);

  router.post("/api/modification", bankModification);

  router.post("/api/usdt", addUSDTAddress);

  router.post("/api/bonus", addBonus);

  router.post("/api/problem", addProblem);

  router.post("/api/sendotp", sendOtp);

  router.post("/api/updatepassword", updatePassword);

  router.post("/api/password", updatePassword2);

  //get details api
  router.get("/api/webapi/getdetails", getDepositNotReceived);
  router.get("/api/webapi/usdtdetails", getUsdtAddress);

  router.get("/api/webapi/modificationdetails", getifscModification);
  router.get("/api/webapi/userbankdetails", getUserBank);

  router.get("/api/webapi/bankdetails", getBankModification);
  router.get("/api/webapi/bonusdetails", bonusDetails);
  router.get("/api/webapi/problemsdetails", problemsDetails);
  router.get("/api/webapi/withproblem", getwithdrawlProblems);

  router.post("/api/withdrawlproblem", withdrawlProblems);

  //Admin
  router.post("/api/webapi/status/:status/:id", depositAcceptOrReject);

  router.post("/api/webapi/bankstatus/:status/:id", modifyBankAcceptorReject);

  router.post("/api/webapi/addressstatus/:status/:id", addressAcceptOrReject);

  router.post("/api/webapi/bonusstatus/:status/:id", bonusAcceptOrReject);

  router.post("/api/webapi/problemsstatus/:status/:id", problemAcceptOrReject);

  router.post(
    "/api/webapi/withprob/:status/:id",
    withdrawlProblemsAcceptOrReject,
  );

  

  return app.use("/", router);
};

module.exports = {
  initWebRouter,
};
