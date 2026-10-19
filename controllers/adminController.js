import connection from "../config/connectDB";
import jwt from "jsonwebtoken";
import md5 from "md5";
import axios from "axios";
const ExcelJS = require("exceljs");
const fs = require("fs");
const XLSX = require("xlsx");
const path = require("path");

require("dotenv").config();

const timeNow = Date.now();

// ==================== HELPERS ====================
const randomNumber = (min, max) =>
  String(Math.floor(Math.random() * (max - min + 1)) + min);

const randomString = (length) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const ipAddress = (req) => {
  let ip = "";
  if (req.headers["x-forwarded-for"]) ip = req.headers["x-forwarded-for"].split(",")[0];
  else if (req.connection?.remoteAddress) ip = req.connection.remoteAddress;
  else ip = req.ip;
  return ip;
};

const timeCreate = () => Date.now();

const formateT = (params) => (params < 10 ? "0" + params : params);

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

const getCurrentDate = (params = "", addHours = 0) => {
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

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
};

// Recursive CTE helper: fetch downline up to N levels
async function fetchDownlineTree(rootCode, maxDepth = 6) {
  const [rows] = await connection.query(
    `WITH RECURSIVE tree AS (
       SELECT id_user, name_user, phone, code, invite, time, 1 AS depth
       FROM users WHERE invite = ?
       UNION ALL
       SELECT u.id_user, u.name_user, u.phone, u.code, u.invite, u.time, t.depth + 1
       FROM users u INNER JOIN tree t ON u.invite = t.code
       WHERE t.depth < ?
     ) SELECT * FROM tree`,
    [rootCode, maxDepth]
  );
  return rows;
}

const logUserAction = async (actionData) => {
  try {
    const sql = `
      INSERT INTO user_actions SET 
        user_phone = ?, action_type = ?, action_id = ?, money = ?,
        status = ?, ip_address = ?, user_agent = ?, info = ?, created_at = NOW()
    `;
    await connection.execute(sql, [
      actionData.user_phone,
      actionData.action_type,
      actionData.action_id,
      actionData.money,
      actionData.status,
      actionData.ip_address,
      actionData.user_agent,
      actionData.info,
    ]);
  } catch (error) {
    console.error("Failed to log user action:", error);
  }
};

// ==================== PAGE RENDERERS (unchanged, thin wrappers) ====================
const page = (view, extraFn) => async (req, res) => {
  try {
    const extra = extraFn ? await extraFn(req) : {};
    return res.render(view, extra || {});
  } catch (e) {
    console.error(`${view} render error:`, e.message);
    return res.status(500).send("Internal server error");
  }
};

const depositePage = page("manage/liveChatPages/depositeNotReceive.ejs");
const withdrawalPage = page("manage/liveChatPages/withdrawalProblem.ejs");
const changeloginIdPass = page("manage/liveChatPages/changeIdLoginPassword.ejs");
const modifyBankInfo = page("manage/liveChatPages/modifyBankInfo.ejs");
const usdtaddress = page("manage/liveChatPages/usdtAddress.ejs");
const activityBonus = page("manage/liveChatPages/activityBonus.ejs");
const gameProblems = page("manage/liveChatPages/gameProblems.ejs");
const livePage = page("manage/livechat.ejs");
const adminPage = page("manage/index.ejs");
const adminPage3 = page("manage/a-index-bet/index3.ejs");
const adminPage5 = page("manage/a-index-bet/index5.ejs");
const adminPage10 = page("manage/a-index-bet/index10.ejs");
const admintrxPage = page("manage/trx.ejs");
const admintrxPage3 = page("manage/a-index-bet/trx3.ejs");
const admintrxPage5 = page("manage/a-index-bet/trx5.ejs");
const admintrxPage10 = page("manage/a-index-bet/trx10.ejs");
const adminPage5d = page("manage/5d.ejs");
const adminPageK3 = page("manage/k3.ejs");
const ctvProfilePage = async (req, res) => res.render("manage/profileCTV.ejs", { phone: req.params.phone });
const giftPage = page("manage/giftPage.ejs");
const membersPage = page("manage/members.ejs");
const ctvPage = page("manage/ctv.ejs");
const infoMember = async (req, res) => res.render("manage/profileMember.ejs", { phone: req.params.id });
const statistical = async (req, res) => res.render("manage/statistical.ejs", { data: req.query.datechoice || null });
const rechargePage = page("manage/recharge.ejs");
const rechargeAllPage = page("manage/all.ejs");
const rechargeFailPage = page("manage/fail.ejs");
const rechargePandingPage = page("manage/panding.ejs");
const rechargeSuccessPage = page("manage/success.ejs");
const rechargeRecord = page("manage/rechargeRecord.ejs");
const turnover = page("manage/turnover.ejs");
const betting = page("manage/betting.ejs");
const todayreport = page("manage/todayreport.ejs");
const withdraw = page("manage/withdraw.ejs");
const withdrawRecord = page("manage/withdrawRecord.ejs");
const withdrawsuccess = page("manage/withdrawalsuccess.ejs");
const withdrawfail = page("manage/withdrawalfail.ejs");
const settings = page("manage/settings.ejs");
const demouser = page("manage/demoaccount.ejs");
const notificationPage = page("manage/createNotification.ejs");
const userlevelPage = page("manage/userlevel.ejs");
const userlevelAllPage = page("manage/userlevelAll.ejs");
const bannerPage = page("manage/banner.ejs");
const activitybannerPage = page("manage/activitybanner.ejs");
const logoSettingPage = page("manage/logoSetting.ejs");
const chennalSettingPage = page("manage/chennalSetting.ejs");
const promotionsPage = page("manage/promotions.ejs");
const attendencebonesPage = page("manage/newfiles/attendencebonce.ejs");
const SignupBonespage = page("manage/newfiles/signupbones.ejs");
const agentperformancepage = page("manage/newfiles/agentperformance.ejs");
const iprecord = page("manage/newfiles/iprecord.ejs");
const topperformance = page("manage/newfiles/topperformance.ejs");
const apitransaction = page("manage/newfiles/apitransaction.ejs");
const createuser = page("manage/newfiles/createuser.ejs");
const adminCarPage = page("manage/carIndex.ejs");
const adminCarPage3 = page("manage/a-index-bet/carIndex3.ejs");
const adminCarPage5 = page("manage/a-index-bet/carIndex5.ejs");
const adminCarPage10 = page("manage/a-index-bet/carIndex10.ejs");
const manualwithdraw = page("manage/manualwithdraw.ejs");
const vipsection = page("manage/vip.ejs");
const FirstDepositBonus = page("manage/FirstDepositBonus.ejs");
const profitloss = page("manage/profitloss.ejs");
const createsubpanel = page("manage/createsubpanel.ejs");
const llegaltrade = page("manage/llegaltrade.ejs");
const Supportsection = page("manage/supportsection.ejs");
const activitysettings = page("manage/activitysettings.ejs");
const spinwheel = page("manage/spinwheel.ejs");
const InvitationBonus = page("manage/invitationbonus.ejs");
const CreatedSalaryRecord = page("manage/CreatedSalaryRecord.ejs");
const levelSetting = page("manage/levelSetting.ejs");

// ==================== MIDDLEWARE ====================
const middlewareAdminController = async (req, res, next) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) return res.redirect("/admin/login");

    const [rows] = await connection.execute(
      "SELECT id, token, phone, level, status FROM users WHERE token = ? AND veri = 1",
      [auth]
    );
    if (!rows.length) return res.redirect("/admin/login");

    const user = rows[0];
    if (user.token !== auth || user.status !== 1) return res.redirect("/admin/login");

    if (req.originalUrl.startsWith("/api/webapi") || req.originalUrl.startsWith("/webapi")) {
      return next();
    }

    const [permissions] = await connection.execute(
      "SELECT permission_key, permission_value FROM user_permissions WHERE user_id = ?",
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
      "/admin/manager/motobike": "Moto bike",
    };

    const requiredPermission = routePermissions[req.originalUrl];
    if (requiredPermission && userPermissions[requiredPermission] != 1) {
      const fallbackPath = Object.keys(routePermissions).find(
        (p) => userPermissions[routePermissions[p]] == 1
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

// ==================== RECHARGE CALLBACK ====================
const rechargeCallback = async (req, res) => {
  let orderids = req.body.client_txn_id;
  if (!orderids) return res.status(400).json({ status: "Missing order id" });

  const orderid = orderids.split("_")[0];
  const status = req.body.status;
  try {
    if (status === "success") {
      await ConfirmRecharge(orderid, function (data) {
        res.status(200).json(data);
      });
    } else {
      await connection.query("UPDATE recharge SET status = 2 WHERE id = ?", [orderid]);
      res.status(200).json({ status: "Error By Response" });
    }
  } catch (e) {
    console.error("rechargeCallback:", e);
    res.status(200).json({ status: "By Response code", res: e.message });
  }
};

// ==================== AGENT COMMISSION ====================
const AgentCommission = async (req, res) => {
  try {
    const [agents] = await connection.query("SELECT * FROM users WHERE level = 2");
    const checkTime = timerJoin2(Date.now());

    for (const item of agents) {
      if (!item.phone) continue;

      const [innerQuery] = await connection.query(
        `SELECT users.phone, SUM(minutes_1.money) AS total_betting
         FROM users LEFT JOIN minutes_1 ON minutes_1.phone = users.phone
         WHERE ctv = ? GROUP BY users.phone`,
        [item.phone]
      );

      let sum = 0;
      for (const row of innerQuery) {
        if (row.total_betting > 0) sum += Number(row.total_betting);
      }

      if (sum > 0) {
        const finalPercentange = sum * 0.01;
        await connection.execute(
          `INSERT INTO transaction (purpose, phone, money, type, status, level, today, time)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          ["agent_commission", item.phone, finalPercentange, "credit", 1, 1, checkTime, checkTime]
        );
      }
    }
    return res.status(200).json("Success");
  } catch (e) {
    console.error("AgentCommission:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== TOTAL JOIN (live bet feed) ====================
const totalJoin = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const typeid = req.body.typeid;
    if (!typeid) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const gameMap = {
      1: "wingo", 2: "wingo3", 3: "wingo5", 4: "wingo10",
      11: "trx", 22: "trx3", 33: "trx5", 44: "trx10",
    };
    const game = gameMap[typeid];
    if (!game) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const [rows] = await connection.query("SELECT id FROM users WHERE token = ?", [auth]);
    if (!rows.length) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const [wingoall] = await connection.query(
      "SELECT * FROM minutes_1 WHERE game = ? AND status = 0 AND isdemo = 0 ORDER BY id ASC",
      [game]
    );
    const [winGo1] = await connection.execute(
      "SELECT * FROM wingo WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1",
      [game]
    );
    const [winGo10] = await connection.execute(
      "SELECT * FROM wingo WHERE status != 0 AND game = ? ORDER BY id DESC LIMIT 10",
      [game]
    );
    const [setting] = await connection.execute("SELECT * FROM admin");

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: wingoall,
      lotterys: winGo1,
      list_orders: winGo10,
      setting,
      timeStamp: timeNow,
      game,
    });
  } catch (error) {
    console.error("totalJoin:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

const totalJoinRacing = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const typeid = req.body.typeid;
    if (!typeid) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const gameMap = { 1: "cargame", 2: "cargame3", 3: "cargame5", 4: "cargame10" };
    const game = gameMap[typeid];
    if (!game) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const [rows] = await connection.query("SELECT id FROM users WHERE token = ?", [auth]);
    if (!rows.length) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const [wingoall] = await connection.query(
      "SELECT * FROM cargame_result WHERE game = ? AND status = 0 AND isdemo = 0 ORDER BY id ASC",
      [game]
    );
    const [winGo1] = await connection.execute(
      "SELECT * FROM cargame WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1",
      [game]
    );
    const [winGo10] = await connection.execute(
      "SELECT * FROM cargame WHERE status != 0 AND game = ? ORDER BY id DESC LIMIT 10",
      [game]
    );
    const [setting] = await connection.execute("SELECT * FROM admin");

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: wingoall,
      lotterys: winGo1,
      list_orders: winGo10,
      setting,
      timeStamp: timeNow,
      game,
    });
  } catch (error) {
    console.error("totalJoinRacing:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== LIST MEMBER (SQL-injection fixed) ====================
const listMember = async (req, res) => {
  const { pageno, limit, value, status } = req.body;
  const pn = Number(pageno);
  const lim = Number(limit);

  if (!Number.isFinite(pn) || !Number.isFinite(lim) || pn < 0 || lim <= 0) {
    return res.status(200).json({
      code: 0,
      msg: "Invalid pagination parameters",
      data: { gameslist: [] },
      status: false,
    });
  }

  try {
    let where = "WHERE isdemo = 0 AND veri = 1 AND level != 2";
    const params = [];

    if (value) {
      where += " AND (phone LIKE ? OR id_user LIKE ? OR id LIKE ?)";
      const q = `%${value}%`;
      params.push(q, q, q);
    }
    if (status) {
      where += " AND status = ?";
      params.push(Number(status));
    }

    const [users] = await connection.query(
      `SELECT * FROM users ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, lim, pn]
    );

    const [total_users] = await connection.query(
      `SELECT COUNT(*) as total FROM users ${where}`,
      params
    );

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: users,
      page_total: Math.ceil(total_users[0].total / lim),
    });
  } catch (e) {
    console.error("listMember:", e);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== STATISTICAL 2 ====================
const statistical2 = async (req, res) => {
  try {
    const datefil = req.body.today === "" ? false : req.body.today;
    const time = getCurrentDate(Date.now());
    const targetDate = !datefil ? time : datefil;

    const [[{ total: win, count: wincount }]] = [
      (await connection.query(
        "SELECT SUM(money) as total, COUNT(id) as count FROM minutes_1 WHERE status = 1 AND isdemo = 0"
      ))[0],
    ];
    const [wingo2] = await connection.query(
      "SELECT SUM(money) as total, COUNT(id) as count FROM minutes_1 WHERE status = 2 AND isdemo = 0"
    );
    const [users] = await connection.query("SELECT COUNT(id) as total FROM users WHERE status = 1");
    const [users2] = await connection.query("SELECT COUNT(id) as total FROM users WHERE status = 2");
    const [recharge] = await connection.query(
      "SELECT SUM(money) as total FROM recharge WHERE type != 'demo' AND status = 1 AND isdemo = 0"
    );
    const [pendigrecharge] = await connection.query(
      "SELECT SUM(money) as total FROM recharge WHERE type != 'demo' AND status = 0 AND isdemo = 0"
    );
    const [withdraw] = await connection.query(
      "SELECT SUM(money) as total FROM withdraw WHERE status = 1 AND isdemo = 0"
    );
    const [pendigwithdraw] = await connection.query(
      "SELECT SUM(money) as total FROM withdraw WHERE status = 0 AND isdemo = 0"
    );
    const [bet] = await connection.query("SELECT SUM(money) as total FROM minutes_1");
    const [pl] = await connection.query("SELECT SUM(money - `get`) as total FROM minutes_1");
    const [recharge_today] = await connection.query(
      "SELECT SUM(money) as total FROM recharge WHERE type != 'demo' AND status = 1 AND DATE(today) = ? AND isdemo = 0",
      [targetDate]
    );
    const [bet_today] = await connection.query(
      "SELECT SUM(money) as total FROM minutes_1 WHERE DATE(today) = ? AND isdemo = 0",
      [targetDate]
    );
    const [pl_today] = await connection.query(
      "SELECT SUM(money - `get`) as total FROM minutes_1 WHERE DATE(today) = ? AND isdemo = 0",
      [targetDate]
    );
    const [withdraw_today] = await connection.query(
      "SELECT SUM(money) as total FROM withdraw WHERE status = 1 AND DATE(today) = ? AND isdemo = 0",
      [targetDate]
    );

    return res.status(200).json({
      message: "Success",
      status: true,
      win,
      wincount,
      loss: wingo2[0].total,
      losscount: wingo2[0].count,
      usersOnline: users[0].total,
      usersOffline: users2[0].total,
      recharges: recharge[0].total,
      pendigrecharges: pendigrecharge[0].total,
      betToday: bet_today[0].total,
      bet: bet[0].total,
      withdraws: withdraw[0].total,
      pendigwithdraws: pendigwithdraw[0].total,
      rechargeToday: recharge_today[0].total,
      withdrawToday: withdraw_today[0].total,
      pltoday: pl_today[0].total,
      pl: pl[0].total,
      time,
    });
  } catch (error) {
    console.error("statistical2:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== ADMIN CHANGE GAME RESULT ====================
const changeAdmin = async (req, res) => {
  try {
    const { value, type, typeid } = req.body;
    if (!value || !type || !typeid) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const map = {
      1: { game: "wingo", bs: "bs1" },
      2: { game: "wingo3", bs: "bs3" },
      3: { game: "wingo5", bs: "bs5" },
      4: { game: "wingo10", bs: "bs10" },
      11: { game: "trx", bs: "bs1" },
      22: { game: "trx3", bs: "bs3" },
      33: { game: "trx5", bs: "bs5" },
      44: { game: "trx10", bs: "bs10" },
    };

    const entry = map[typeid];
    if (!entry) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    if (type === "change-wingo1") {
      await connection.query(`UPDATE admin SET ${entry.game} = ?`, [value]);
      return res.status(200).json({ message: "Editing results successfully", status: true, timeStamp: timeNow });
    }
    if (type === "change-win_rate") {
      await connection.query(`UPDATE admin SET ${entry.bs} = ?`, [value]);
      return res.status(200).json({ message: "Editing win rate successfully", status: true, timeStamp: timeNow });
    }

    return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
  } catch (error) {
    console.error("changeAdmin:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

const changeAdminRacing = async (req, res) => {
  try {
    const { value, type, typeid } = req.body;
    if (!value || !type || !typeid) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const map = {
      1: { game: "cargame", bs: "bs1" },
      2: { game: "cargame3", bs: "bs3" },
      3: { game: "cargame5", bs: "bs5" },
      4: { game: "cargame10", bs: "bs10" },
    };

    const entry = map[typeid];
    if (!entry) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    if (type === "change-wingo1") {
      await connection.query(`UPDATE admin SET ${entry.game} = ?`, [value]);
      return res.status(200).json({ message: "Editing results successfully", status: true, timeStamp: timeNow });
    }
    if (type === "change-win_rate") {
      await connection.query(`UPDATE admin SET ${entry.bs} = ?`, [value]);
      return res.status(200).json({ message: "Editing win rate successfully", status: true, timeStamp: timeNow });
    }

    return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
  } catch (error) {
    console.error("changeAdminRacing:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== USER INFO (admin view of member) ====================
const userInfo = async (req, res) => {
  try {
    const phone = req.body.phone;
    if (!phone) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const [user] = await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);
    if (!user.length) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const userInfo = user[0];
    const downline = await fetchDownlineTree(userInfo.code, 6);
    const f1s = downline.filter((d) => d.depth === 1);
    const f2 = downline.filter((d) => d.depth === 2).length;
    const f3 = downline.filter((d) => d.depth === 3).length;
    const f4 = downline.filter((d) => d.depth === 4).length;

    const [recharge] = await connection.query(
      "SELECT SUM(money) as total FROM recharge WHERE phone = ? AND status = 1",
      [phone]
    );
    const [withdraw] = await connection.query(
      "SELECT SUM(money) as total FROM withdraw WHERE phone = ? AND status = 1",
      [phone]
    );
    const [bank_user] = await connection.query("SELECT * FROM user_bank WHERE phone = ?", [phone]);
    const [telegram_ctv] = await connection.query(
      "SELECT telegram FROM point_list WHERE phone = ?",
      [userInfo.ctv]
    );
    const [ng_moi] = await connection.query("SELECT phone FROM users WHERE code = ?", [userInfo.invite]);

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: user,
      total_r: recharge,
      total_w: withdraw,
      f1: f1s.length,
      f2, f3, f4,
      bank_user,
      telegram: telegram_ctv[0],
      ng_moi: ng_moi[0],
      daily: userInfo.ctv,
    });
  } catch (error) {
    console.error("userInfo:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== EDIT BANK ====================
const editbank = async (req, res) => {
  try {
    const { phone: id, names: name, bank_name, stk, ifsc, upi: sdt } = req.body;
    await connection.query(
      "UPDATE user_bank SET name_bank = ?, name_user = ?, email = ?, stk = ?, sdt = ? WHERE id = ?",
      [bank_name, name, ifsc, stk, sdt, id]
    );
    res.redirect("back");
  } catch (e) {
    console.error("editbank:", e);
    res.status(500).send("Error updating bank");
  }
};

// ==================== RECHARGE LIST ====================
const recharge = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const today = req.body.todaydata;
    const wherequery = today === "true" ? ` AND DATE(today) = '${getCurrentDate(Date.now())}'` : "";

    const [pending] = await connection.query(
      "SELECT * FROM recharge WHERE status = 0 AND isdemo = 0 ORDER BY id DESC"
    );
    const [successFullRecharge] = await connection.query(
      "SELECT * FROM recharge WHERE status = 1 AND isdemo = 0 ORDER BY id DESC"
    );
    const [faileRecharge] = await connection.query(
      "SELECT * FROM recharge WHERE status = 2 AND isdemo = 0 ORDER BY id DESC"
    );
    const [allRecharge] = await connection.query(
      "SELECT * FROM recharge WHERE isdemo = 0 ORDER BY id DESC"
    );
    const [recharge2] = await connection.query(
      `SELECT * FROM recharge WHERE status != 0 AND isdemo = 0${wherequery} ORDER BY id DESC`
    );
    const [pendingWithdraw] = await connection.query(
      "SELECT * FROM withdraw WHERE status = 0 AND isdemo = 0 ORDER BY id DESC"
    );
    const [withdraw2] = await connection.query(
      `SELECT * FROM withdraw WHERE status != 0 AND isdemo = 0${wherequery} ORDER BY id DESC`
    );

    return res.status(200).json({
      todaysstatus: wherequery,
      message: "Success",
      status: true,
      datas: pending,
      datas2: recharge2,
      successFullRecharge,
      faileRecharge,
      allRecharge,
      datas3: pendingWithdraw,
      datas4: withdraw2,
    });
  } catch (error) {
    console.error("recharge:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== TURNOVER REPORT ====================
const turnover_report = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const [rows] = await connection.query(`
      SELECT users.*,
             COALESCE(total_deposit, 0) AS total_deposit,
             COALESCE(total_withdrawal, 0) AS total_withdrawal,
             COALESCE(loss, 0) AS loss,
             COALESCE(win, 0) AS win,
             COALESCE(total_bonus, 0) AS total_bonus,
             COALESCE(bets, 0) AS bets
      FROM users
      LEFT JOIN (SELECT phone, SUM(money) AS total_deposit FROM recharge WHERE status = 1 GROUP BY phone) AS recharge ON users.phone = recharge.phone
      LEFT JOIN (SELECT phone, SUM(money) AS total_withdrawal FROM withdraw WHERE status = 1 GROUP BY phone) AS withdraw ON users.phone = withdraw.phone
      LEFT JOIN (SELECT phone, SUM(money) AS bets, SUM(\`get\`) AS win, SUM(money - \`get\`) AS loss FROM minutes_1 GROUP BY phone) AS minutes_1 ON users.phone = minutes_1.phone
      LEFT JOIN (SELECT phone, SUM(money) AS total_bonus FROM transaction GROUP BY phone) AS transaction ON users.phone = transaction.phone
      ORDER BY users.id DESC
    `);

    return res.status(200).json({ message: "Success", status: true, data: rows });
  } catch (error) {
    console.error("turnover_report:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== BETTING REPORT ====================
const betting_report = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const [rows] = await connection.query(`
      SELECT * FROM (
        SELECT id, phone, status, game, money, \`get\`, today AS bet_data, 'minutes_1' AS source FROM minutes_1
        UNION ALL
        SELECT id, phone, status, game, money, \`get\`, bet_data, 'result_5d' FROM result_5d
        UNION ALL
        SELECT id, phone, status, game, money, \`get\`, bet_data, 'result_k3' FROM result_k3
        UNION ALL
        SELECT id, phone, status, game, money, \`get\`, today AS bet_data, 'cargame_result' FROM cargame_result
      ) AS combined_data
      ORDER BY id DESC LIMIT 400
    `);

    return res.status(200).json({ message: "Success", status: true, data: rows });
  } catch (error) {
    console.error("betting_report:", error);
    return res.status(500).json({ message: "Failed to fetch betting data", status: false, error: error.message });
  }
};

// ==================== TODAY REPORT ====================
const today_report = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const { date: todayDate, type } = req.body;
    if (!auth) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    if (type === "recharge") {
      const [rows] = await connection.query(
        "SELECT * FROM recharge WHERE status = ? AND DATE(today) = ? ORDER BY id DESC",
        [1, todayDate]
      );
      return res.status(200).json({ message: "Success", status: true, data: rows });
    }
    if (type === "withdraw") {
      const [rows] = await connection.query(
        "SELECT * FROM withdraw WHERE status = ? AND DATE(today) = ? ORDER BY id DESC",
        [1, todayDate]
      );
      return res.status(200).json({ message: "Success", status: true, data: rows });
    }
    if (type === "bet") {
      const [rows] = await connection.query(
        `SELECT id, id_product, phone, code, invite, stage, result, level, money, amount, fee, \`get\`, game, bet, status, today AS date, time, 'minutes_1' AS source
         FROM minutes_1 WHERE status != 0 AND DATE(today) = ?
         UNION ALL
         SELECT id, id_product, phone, code, invite, stage, result, level, money, price AS amount, fee, \`get\`, game, join_bet AS bet, status, bet_data AS date, time, 'result_5d'
         FROM result_5d WHERE status != 0 AND DATE(bet_data) = ?
         UNION ALL
         SELECT id, id_product, phone, code, invite, stage, result, level, money, price AS amount, fee, \`get\`, game, join_bet AS bet, status, bet_data AS date, time, 'result_k3'
         FROM result_k3 WHERE status != 0 AND DATE(bet_data) = ?
         ORDER BY date DESC, time DESC LIMIT 0, 100`,
        [todayDate, todayDate, todayDate]
      );
      return res.status(200).json({ message: "Success", status: true, data: rows });
    }
    if (type === "win" || type === "loss") {
      const status = type === "win" ? 1 : 2;
      const [rows] = await connection.query(
        "SELECT * FROM minutes_1 WHERE status = ? AND DATE(today) = ? ORDER BY id DESC",
        [status, todayDate]
      );
      return res.status(200).json({ message: "Success", status: true, data: rows });
    }

    return res.status(200).json({ message: "Invalid type", status: false });
  } catch (error) {
    console.error("today_report:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== SETTINGS ====================
const settingGet = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const [bank_recharge] = await connection.query("SELECT * FROM bank_recharge");
    const [settings] = await connection.query("SELECT * FROM admin");
    return res.status(200).json({ message: "Success", status: true, settings, datas: bank_recharge });
  } catch (error) {
    console.error("settingGet:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== CONFIRM RECHARGE (transaction-safe version) ====================
const ConfirmRecharge = async (id, callback) => {};
const ConfirmRechargeold = async (id, callback) => {};

const rechargeDuyet = async (req, res) => {
  const auth = req.cookies.auth;
  const id = req.body.id;
  const type = req.body.type;

  if (!auth || !id || !type) {
    return res.status(200).json({ message: "Failed", status: false, timeStamp: Date.now() });
  }

  try {
    if (type === "confirm") {
      const [info] = await connection.query("SELECT * FROM recharge WHERE id = ?", [id]);
      if (!info.length) return res.status(404).json({ message: "Recharge not found", status: false });

      const phone = info[0].phone;
      if (!phone) return res.status(400).json({ message: "Phone number not found", status: false });

      const [UserInfo] = await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);
      if (!UserInfo.length) return res.status(404).json({ message: "User not found", status: false });

      // Reject if already processed
      if (info[0].status === 1) {
        return res.status(200).json({ message: "Recharge already confirmed", status: false });
      }

      const checkTime = timerJoin2(Date.now());
      const [firstRecharge] = await connection.query(
        "SELECT id FROM recharge WHERE phone = ? AND status = 1 LIMIT 1",
        [phone]
      );

      let bonus = 0;
      if (firstRecharge.length === 0) {
        const [result] = await connection.execute("SELECT * FROM rechargeBonus ORDER BY id DESC");
        const sorted = result
          .map((r) => ({ ...r, amt: parseFloat(r.recAmount) }))
          .sort((a, b) => a.amt - b.amt);

        for (let i = 0; i < sorted.length; i++) {
          const el = sorted[i];
          const curAmt = el.amt;
          const nextAmt = sorted[i + 1]?.amt ?? Infinity;
          if (parseInt(el.is_fisrtrecharge) === 1 && info[0].money >= curAmt && info[0].money < nextAmt) {
            bonus = parseInt(el.is_persent) === 1
              ? (info[0].money * parseFloat(el.bonus)) / 100
              : parseFloat(el.bonus);
            break;
          }
        }

        await connection.execute(
          `INSERT INTO transaction (purpose, phone, money, type, status, level, today, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          ["Big Recharge Bonus", phone, bonus, "credit", 1, 1, checkTime, checkTime]
        );
        await connection.query(
          "UPDATE users SET money = money + ?, total_money = total_money + ?, recharge = recharge + ? WHERE phone = ?",
          [bonus, bonus, bonus, phone]
        );
        await connection.query(
          "INSERT INTO transaction_history (phone, detail, balance, time) VALUES (?, ?, ?, ?)",
          [phone, "First deposit bonus", bonus, checkTime]
        );

        // Referral upline bonus
        const [refUser] = await connection.query(
          "SELECT * FROM users WHERE code = ? LIMIT 1",
          [UserInfo[0].invite]
        );
        let bonus1 = 0;
        const m = info[0].money;
        if (m >= 200 && m < 500) bonus1 = 48;
        else if (m >= 500 && m < 1000) bonus1 = 108;
        else if (m >= 1000 && m < 5000) bonus1 = 188;
        else if (m >= 5000 && m < 10000) bonus1 = 288;
        else if (m >= 10000 && m < 50000) bonus1 = 488;
        else if (m >= 50000 && m < 100000) bonus1 = 2888;
        else if (m >= 100000) bonus1 = 5888;

        if (refUser.length && bonus1 > 0) {
          await connection.query(
            "UPDATE users SET money = money + ?, total_money = total_money + ?, recharge = recharge + ? WHERE phone = ?",
            [bonus1, bonus1, bonus1, refUser[0].phone]
          );
          await connection.query(
            "INSERT INTO transaction_history (phone, detail, balance, time) VALUES (?, ?, ?, ?)",
            [refUser[0].phone, "Bonus", bonus1, checkTime]
          );
        }
      }

      // USDT bonus
      let usdtBonus = 0;
      if (info[0].type === "USDT") usdtBonus = info[0].money * 0.02;

      // Spin credits
      const [spinData] = await connection.query(
        "SELECT task_amount, num_of_spin FROM spin_data ORDER BY task_amount ASC LIMIT 1"
      );
      let totalSpins = 0;
      if (spinData.length && info[0].money >= spinData[0].task_amount) {
        totalSpins = Math.floor(info[0].money / spinData[0].task_amount) * spinData[0].num_of_spin;
      }
      if (totalSpins > 0) {
        await connection.query(
          "UPDATE users SET total_spin = total_spin + ?, spin_recharge = spin_recharge + ? WHERE phone = ?",
          [totalSpins, info[0].money, phone]
        );
      }

      await connection.query("UPDATE recharge SET status = 1 WHERE id = ?", [id]);

      const totalToCredit = info[0].money + usdtBonus;
      await connection.query(
        "UPDATE users SET money = money + ?, total_money = total_money + ?, recharge = recharge + ?, totalRecharge = totalRecharge + ? WHERE phone = ?",
        [totalToCredit, totalToCredit, totalToCredit, totalToCredit, phone]
      );
      await connection.query(
        "INSERT INTO transaction_history (phone, detail, balance, time) VALUES (?, ?, ?, ?)",
        [phone, "Deposit", totalToCredit, checkTime]
      );

      return res.status(200).json({
        message: "Application confirmed successfully",
        status: true,
        datas: info,
      });
    } else if (type === "delete") {
      await connection.query("UPDATE recharge SET status = 2 WHERE id = ?", [id]);
      return res.status(200).json({ message: "Order canceled successfully", status: true });
    }

    return res.status(400).json({ message: "Invalid type", status: false });
  } catch (e) {
    console.error("rechargeDuyet:", e);
    return res.status(500).json({ message: "Internal server error", status: false, error: e.message });
  }
};

// ==================== SPIN SET ====================
const spinset = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const { taskAmount, numberofSpin } = req.body;
    if (!auth || !taskAmount || !numberofSpin) {
      return res.status(400).json({ message: "Missing required fields", status: false, timeStamp: Date.now() });
    }
    await connection.execute(
      "UPDATE spin_data SET task_amount = ?, num_of_spin = ? WHERE id = 1",
      [taskAmount, numberofSpin]
    );
    return res.status(200).json({ message: "Update successful", status: true, timeStamp: Date.now() });
  } catch (e) {
    console.error("spinset:", e);
    return res.status(500).json({ message: "Internal server error", status: false, error: e.message });
  }
};

// ==================== WITHDRAW HANDLING ====================
const handlWithdraw = async (req, res) => {
  const auth = req.cookies.auth;
  const { id, type, remark } = req.body;

  if (!auth || !id || !type) {
    return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
  }

  const checkTime = timerJoin2(Date.now());
  try {
    if (type === "confirm") {
      await connection.query("UPDATE withdraw SET status = 1 WHERE id = ?", [id]);
      const [info] = await connection.query("SELECT * FROM withdraw WHERE id = ?", [id]);
      if (!info.length) return res.status(404).json({ message: "Not found", status: false });

      await connection.query(
        "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, time = ?",
        [info[0].phone, "Withdraw", info[0].money, checkTime]
      );
      await connection.query(
        "UPDATE users SET totalWithdraw = totalWithdraw + ? WHERE phone = ?",
        [info[0].money, info[0].phone]
      );
      return res.status(200).json({ message: "Withdrawal Successful", status: true });
    }

    if (type === "delete") {
      await connection.query("UPDATE withdraw SET status = 2, remark = ? WHERE id = ?", [remark, id]);
      const [info] = await connection.query("SELECT * FROM withdraw WHERE id = ?", [id]);
      if (!info.length) return res.status(404).json({ message: "Not found", status: false });

      await connection.query("UPDATE users SET money = money + ? WHERE phone = ?", [info[0].money, info[0].phone]);
      await connection.query(
        "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, time = ?",
        [info[0].phone, "Withdrawal rejected", info[0].money, checkTime]
      );
      return res.status(200).json({ message: "Withdrawal rejected", status: true });
    }

    return res.status(400).json({ message: "Invalid type", status: false });
  } catch (e) {
    console.error("handlWithdraw:", e);
    return res.status(500).json({ message: "server error", status: false, error: e.message });
  }
};

const handlWithdraw2 = handlWithdraw; // Alias

const handlWithdrawCallback = async (req, res) => {
  const { payouts, status } = req.body;
  try {
    const checkTime = timerJoin2(Date.now());
    for (const payout of payouts) {
      const txnId = payout.transaction_id;
      const [info] = await connection.query("SELECT * FROM withdraw WHERE id_order = ?", [txnId]);
      if (!info.length) continue;

      if (status === "processed") {
        await connection.query("UPDATE withdraw SET status = 1 WHERE id_order = ?", [txnId]);
        await connection.query(
          "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, time = ?",
          [info[0].phone, "Withdraw", info[0].money, checkTime]
        );
        await connection.query(
          "UPDATE users SET totalWithdraw = totalWithdraw + ? WHERE phone = ?",
          [info[0].money, info[0].phone]
        );
      } else {
        await connection.query(
          "UPDATE withdraw SET status = 2, remark = ? WHERE id_order = ?",
          ["Due to your account security, please contact Customer service to verify. Thank you.", txnId]
        );
        await connection.query("UPDATE users SET money = money + ? WHERE phone = ?", [info[0].money, info[0].phone]);
        await connection.query(
          "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, time = ?",
          [info[0].phone, "Withdrawal rejected", info[0].money, checkTime]
        );
      }
    }
    return res.status(200).json({ message: status === "processed" ? "Withdrawal(s) Successful" : "Withdrawal(s) Rejected", status: true });
  } catch (e) {
    console.error("handlWithdrawCallback:", e);
    return res.status(500).json({ message: "server error", status: false, error: e.message });
  }
};

// ==================== SETTING BANK / CSKH / MESSAGE ====================
const settingBank = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const { bank_name, username, upi_id, upi_id2, upi_id3, usdt_wallet_address, typer } = req.body;
    if (!auth || !typer) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    if (typer === "bank") {
      await connection.query(
        "UPDATE bank_recharge SET name_bank = ?, name_user = ?, stk = ?, upi2 = ?, upi3 = ?, usdt = ? WHERE type = 'momo'",
        [bank_name, username, upi_id, upi_id2, upi_id3, usdt_wallet_address]
      );
      return res.status(200).json({ message: "Successful change", status: true });
    }
    return res.status(200).json({ message: "Unknown type", status: false });
  } catch (error) {
    console.error("settingBank:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

const settingCskh = async (req, res) => {
  try {
    const { telegram, cskh, myapp_web } = req.body;
    if (!req.cookies.auth || !cskh || !telegram) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }
    await connection.query("UPDATE admin SET telegram = ?, cskh = ?, app = ?", [telegram, cskh, myapp_web]);
    return res.status(200).json({ message: "Successful change", status: true });
  } catch (error) {
    console.error("settingCskh:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

const settingMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!req.cookies.auth || !message) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }
    await connection.query("UPDATE admin SET message = ?", [message]);
    return res.status(200).json({ message: "Success", status: true });
  } catch (error) {
    console.error("settingMessage:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== BAN / UNBLOCK ====================
const banned = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const { id, type } = req.body;
    if (!auth || !id) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    if (type === "open") await connection.query("UPDATE users SET status = 1 WHERE id_user = ?", [id]);
    if (type === "close") await connection.query("UPDATE users SET status = 2 WHERE id_user = ?", [id]);
    return res.status(200).json({ message: "Successful change", status: true });
  } catch (error) {
    console.error("banned:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

const eligaUnblockUser = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const id = req.body.id;
    if (!auth || !id) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    await connection.query("UPDATE users SET status = 1, legal_bet_score = 0 WHERE id_user = ?", [id]);
    return res.status(200).json({ message: "Successful change", status: true });
  } catch (error) {
    console.error("eligaUnblockUser:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== CREATE BONUS (gift codes) ====================
const createBonus = async (req, res) => {
  try {
    const randomStringInline = (len) => {
      const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let out = "";
      for (let i = 0; i < len; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
      return out;
    };

    const auth = req.cookies.auth;
    const { money, user: used, type, recharge, select, phone, } = req.body;

    if (!money || !auth) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const [userRows] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);
    if (!userRows.length) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const checkTime = timerJoin2(Date.now());

    if (type === "all") {
      const op = select == "1" ? "+" : "-";
      await connection.query(`UPDATE point_list SET money = money ${op} ? WHERE level = 2`, [money]);
      await connection.query(`UPDATE users SET money = money ${op} ? WHERE level = 2`, [money]);
      return res.status(200).json({ message: "successful change", status: true });
    }

    if (type === "three") {
      const [user] = await connection.query("SELECT * FROM users WHERE phone = ? AND level = 2", [phone]);
      if (!user.length) return res.status(200).json({ message: "account does not exist", status: false, timeStamp: timeNow });

      const op = select == "1" ? "+" : "-";
      await connection.query(`UPDATE point_list SET money_us = money_us ${op} ? WHERE level = 2 AND phone = ?`, [money, phone]);
      await connection.query(`UPDATE users SET money = money ${op} ? WHERE level = 2 AND phone = ?`, [money, phone]);

      if (select != "1") {
        await connection.query(
          "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, time = ?",
          [phone, "Salary", money, checkTime]
        );
      }
      return res.status(200).json({ message: "successful change", status: true });
    }

    if (!type) {
      const id_redenvelops = `${getCurrentDate(Date.now()).replace(/-/g, "")}${randomStringInline(16)}`;
      await connection.query(
        "INSERT INTO redenvelopes SET id_redenvelope = ?, phone = ?, money = ?, recharge = ?, used = ?, amount = ?, status = ?, time = ?",
        [id_redenvelops, userRows[0].phone, money, recharge, used, 1, 0, checkTime]
      );
      return res.status(200).json({ message: "Successful change", status: true, id: id_redenvelops });
    }

    return res.status(200).json({ message: "Invalid type", status: false });
  } catch (error) {
    console.error("createBonus:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

const listRedenvelops = async (req, res) => {
  try {
    const [redenvelopes] = await connection.query("SELECT * FROM redenvelopes WHERE status = 0");
    return res.status(200).json({ message: "Successful change", status: true, redenvelopes });
  } catch (error) {
    console.error("listRedenvelops:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== SETTING BUFF ====================
const settingbuff = async (req, res) => {
  try {
    const { id_user, buff_acc, money_value } = req.body;
    if (!id_user || !buff_acc || !money_value) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [user_id] = await connection.query("SELECT * FROM users WHERE id_user = ?", [id_user]);
    if (!user_id.length) return res.status(200).json({ message: "User not found", status: false });

    const sumDate = timerJoin2(Date.now());

    if (buff_acc === "1") {
      await connection.query("UPDATE users SET money = money + ? WHERE id_user = ?", [money_value, id_user]);
      await connection.query(
        "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, time = ?",
        [user_id[0].phone, "Admin Increase Amount", money_value, sumDate]
      );
    } else if (buff_acc === "2") {
      await connection.query("UPDATE users SET money = money - ? WHERE id_user = ?", [money_value, id_user]);
      await connection.query(
        "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, time = ?",
        [user_id[0].phone, "Bonus deduction", money_value, sumDate]
      );
    }
    return res.status(200).json({ message: "Successful change", status: true });
  } catch (error) {
    console.error("settingbuff:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== SUB-ADMIN MANAGEMENT ====================
const createsubadmin = async (req, res) => {
  const { phone, password, settings: permissions } = req.body;
  const auth = req.cookies.auth;

  const name_user = "Member" + randomNumber(10000, 99999);
  const code = randomNumber(10000, 99999);
  const ip = ipAddress(req);
  const time = timeCreate();

  try {
    const [user] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);
    if (!user.length) return res.status(200).json({ message: "Failed", status: false });

    if (!phone || !password) return res.status(200).json({ message: "ERROR!!!", status: false });

    const [check_u] = await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);
    if (check_u.length > 0) return res.status(200).json({ message: "register account", status: false });

    const [rows] = await connection.execute("SELECT COALESCE(MAX(id_user), 0) AS max_id FROM users");
    const id_user = Number(rows[0].max_id) + 1;

    await connection.execute(
      `INSERT INTO users (id_user, token, phone, name_user, password, plain_password, money, level, code, invite, veri, ip_address, status, time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_user, phone, phone, name_user, md5(password), password, 0, 1, code + id_user, "admin", 1, ip, 1, time]
    );

    for (const setting of permissions || []) {
      await connection.execute(
        "INSERT INTO user_permissions (user_id, permission_key, permission_value, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
        [phone, setting.name, setting.status]
      );
    }

    return res.status(200).json({ message: "registration success", status: true });
  } catch (error) {
    console.error("createsubadmin:", error);
    return res.status(500).json({ message: "Server Error", status: false, error: error.message });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const [admins] = await connection.query(
      "SELECT id_user, phone, name_user, today, level, status FROM users WHERE level IN (1)"
    );
    const formattedAdmins = admins.map((admin) => ({
      id: admin.id_user,
      name: admin.phone,
      dateCreated: admin.today,
      role: admin.level === 1 ? "Admin" : "Super Admin",
      status: admin.status === 1 ? "Active" : "Inactive",
    }));
    return res.status(200).json({ message: "Admins fetched successfully", status: true, data: formattedAdmins });
  } catch (error) {
    console.error("getAllAdmins:", error);
    return res.status(500).json({ message: "Server Error", status: false, error: error.message });
  }
};

const editUserPermissions = async (req, res) => {
  const { userId, permissions } = req.body;
  try {
    if (!userId || !permissions) {
      return res.status(400).json({ message: "User ID and permissions are required", status: false });
    }
    for (const permission of permissions) {
      await connection.query(
        "UPDATE user_permissions SET permission_value = ? WHERE user_id = ? AND permission_key = ?",
        [permission.status, userId, permission.name]
      );
    }
    return res.status(200).json({ message: "Permissions updated successfully", status: true });
  } catch (error) {
    console.error("editUserPermissions:", error);
    return res.status(500).json({ message: "Server Error", status: false, error: error.message });
  }
};

const deleteadmin_1 = async (req, res) => {
  const { id } = req.body;
  try {
    if (!id) return res.status(400).json({ message: "Admin ID is required", status: false });

    await connection.query("DELETE FROM users WHERE phone = ?", [id]);
    await connection.query("DELETE FROM user_permissions WHERE user_id = ?", [id]);

    return res.status(200).json({ message: "Admin deleted successfully", status: true });
  } catch (error) {
    console.error("deleteadmin_1:", error);
    return res.status(500).json({ message: "Server Error", status: false, error: error.message });
  }
};

const getUserPermissions = async (req, res) => {
  const { userId } = req.query;
  try {
    if (!userId) return res.status(400).json({ message: "User ID is required", status: false });

    const [permissions] = await connection.query(
      "SELECT permission_key AS name, permission_value AS status FROM user_permissions WHERE user_id = ?",
      [userId]
    );
    return res.status(200).json({ message: "Permissions fetched successfully", status: true, data: permissions });
  } catch (error) {
    console.error("getUserPermissions:", error);
    return res.status(500).json({ message: "Server Error", status: false, error: error.message });
  }
};

// ==================== REGISTER (admin/manager creation) ====================
const register = async (req, res) => {
  let { username, pwd, status, level } = req.body;
  const otp2 = randomNumber(100000, 999999);
  const name_user = "Admin" + randomNumber(10000, 99999);
  const code = randomNumber(10000, 99999);
  const ip = ipAddress(req);
  const time = timeCreate();
  const agent = req.headers["user-agent"] || "";

  if (!username || !pwd || !status) {
    return res.status(200).json({ message: "Please enter all required fields", status: false });
  }
  if (username.length < 9 || username.length > 10) {
    return res.status(200).json({ message: "Phone number must be 9-10 digits", status: false });
  }
  if (level === undefined || level === null) level = 0;

  try {
    const [check_u] = await connection.query("SELECT * FROM users WHERE phone = ?", [username]);
    if (check_u.length > 0) return res.status(200).json({ message: "Phone number already registered", status: false });

    const [rows] = await connection.execute("SELECT COALESCE(MAX(id_user), 0) AS max_id FROM users");
    const id_user = Number(rows[0].max_id) + 1;

    const accessToken = jwt.sign(
      { id: id_user, phone: username, name_user },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: "1d" }
    );
    const token = md5(accessToken);

    await connection.execute(
      `INSERT INTO users SET id_user = ?, phone = ?, token = ?, name_user = ?, password = ?, plain_password = ?,
        money = 0, recharge = 0, code = ?, invite = 'ADMIN', ctv = 'ADMIN', veri = 1, otp = ?,
        ip_address = ?, status = ?, message = 0, time = ?, level = ?`,
      [id_user, username, token, name_user, md5(pwd), pwd, code + id_user, otp2, ip, status, time, level]
    );

    await logUserAction({
      user_phone: username,
      action_type: "AdminUserCreation",
      action_id: null,
      money: 0,
      status: "success",
      ip_address: ip,
      user_agent: agent,
      info: JSON.stringify({ status, level }),
    });

    return res.status(200).json({
      message: `${status} user created successfully`,
      status: true,
      data: { username: name_user, phone: username, status, level, inviteCode: code + id_user },
    });
  } catch (error) {
    console.error("register:", error);
    await logUserAction({
      user_phone: username || "unknown",
      action_type: "AdminUserCreation",
      action_id: null,
      money: 0,
      status: "failed",
      ip_address: ip,
      user_agent: agent,
      info: JSON.stringify({ error: error.message }),
    });
    return res.status(500).json({ message: "Internal server error", status: false, error: error.message });
  }
};

// ==================== PROFILE USER / INFO CTV (bulk) ====================
const profileUser = async (req, res) => {
  try {
    const phone = req.body.phone;
    if (!phone) return res.status(200).json({ message: "Phone Error", status: false, timeStamp: timeNow });

    const [user] = await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);
    if (!user.length) return res.status(200).json({ message: "Phone Error", status: false, timeStamp: timeNow });

    const [recharge] = await connection.query("SELECT * FROM recharge WHERE phone = ? ORDER BY id DESC LIMIT 10", [phone]);
    const [withdraw] = await connection.query("SELECT * FROM withdraw WHERE phone = ? ORDER BY id DESC LIMIT 10", [phone]);

    return res.status(200).json({ message: "Success", status: true, recharge, withdraw });
  } catch (error) {
    console.error("profileUser:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

const infoCtv = async (req, res) => {
  try {
    const phone = req.body.phone;
    const [user] = await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);
    if (!user.length) return res.status(200).json({ message: "Phone Error", status: false });

    const userInfo = user[0];
    const downline = await fetchDownlineTree(userInfo.code, 6);
    const f1s = downline.filter((d) => d.depth === 1);
    const f2 = downline.filter((d) => d.depth === 2).length;
    const f3 = downline.filter((d) => d.depth === 3).length;
    const f4 = downline.filter((d) => d.depth === 4).length;

    const today = getCurrentDate(Date.now(), -24); // yesterday as before

    // Bulk query for recharge/withdraw/bets today, avoid N+1
    const phones = downline.map((u) => u.phone);
    let total_recharge = 0, total_withdraw = 0;
    let total_recharge_today = 0, total_withdraw_today = 0;
    let win = 0, loss = 0;
    let list_recharge_news = [], list_withdraw_news = [];

    if (phones.length) {
      const [rech] = await connection.query(
        "SELECT phone, money, today FROM recharge WHERE phone IN (?) AND status = 1",
        [phones]
      );
      for (const r of rech) {
        total_recharge += Number(r.money);
        if (new Date(r.today).toISOString().split("T")[0] === today) {
          total_recharge_today += Number(r.money);
          list_recharge_news.push(r);
        }
      }

      const [wd] = await connection.query(
        "SELECT phone, money, today FROM withdraw WHERE phone IN (?) AND status = 1",
        [phones]
      );
      for (const w of wd) {
        total_withdraw += Number(w.money);
        if (new Date(w.today).toISOString().split("T")[0] === today) {
          total_withdraw_today += Number(w.money);
          list_withdraw_news.push(w);
        }
      }

      const [wins] = await connection.query(
        "SELECT phone, money, today FROM minutes_1 WHERE phone IN (?) AND status = 1",
        [phones]
      );
      for (const w of wins) {
        if (new Date(w.today).toISOString().split("T")[0] === today) win += parseFloat(w.money);
      }

      const [losses] = await connection.query(
        "SELECT phone, money, today FROM minutes_1 WHERE phone IN (?) AND status = 2",
        [phones]
      );
      for (const l of losses) {
        if (new Date(l.today).toISOString().split("T")[0] === today) loss += parseFloat(l.money);
      }
    }

    const [list_mem_baned] = await connection.query(
      "SELECT * FROM users WHERE ctv = ? AND status = 2 AND veri = 1",
      [phone]
    );

    // Members registered today, level-tagged
    const list_mems = [];
    const [list_mem_today] = await connection.query(
      "SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1",
      [phone]
    );
    for (const m of list_mem_today) {
      if (new Date(m.time).toISOString().split("T")[0] === today) list_mems.push(m);
    }

    const [point_list] = await connection.query("SELECT * FROM point_list WHERE phone = ?", [phone]);
    const moneyCTV = point_list[0]?.money || 0;

    const [redenvelopes_used] = await connection.query("SELECT * FROM redenvelopes_used WHERE phone = ?", [phone]);
    const redenvelopes_used_today = redenvelopes_used.filter(
      (r) => new Date(r.time).toISOString().split("T")[0] === today
    );

    const [financial_details] = await connection.query("SELECT * FROM financial_details WHERE phone = ?", [phone]);
    const financial_details_today = financial_details.filter(
      (f) => new Date(f.time).toISOString().split("T")[0] === today
    );

    const [teamcommission] = await connection.query(
      "SELECT SUM(commission) as bonus FROM subordinatedata WHERE phone = ?",
      [phone]
    );
    const [teamcommissionT] = await connection.query(
      "SELECT SUM(commission) as bonus FROM subordinatedata WHERE phone = ? AND DATE(date) = ?",
      [phone, today]
    );

    return res.status(200).json({
      message: "Success",
      status: true,
      totalcommission: teamcommission[0]?.bonus || 0,
      todaycommission: teamcommissionT[0]?.bonus || 0,
      datas: user,
      f1: f1s.length,
      f2, f3, f4,
      list_mems,
      total_recharge,
      total_withdraw,
      total_recharge_today,
      total_withdraw_today,
      list_mem_baned: list_mem_baned.length,
      win, loss,
      list_recharge_news,
      list_withdraw_news,
      moneyCTV,
      redenvelopes_used: redenvelopes_used_today,
      financial_details_today,
    });
  } catch (error) {
    console.error("infoCtv:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

const infoCtv2 = async (req, res) => {
  try {
    const phone = req.body.phone;
    const timeDate = req.body.timeDate;

    const [user] = await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);
    if (!user.length) return res.status(200).json({ message: "Phone Error", status: false });

    const [list_mem] = await connection.query(
      "SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1",
      [phone]
    );

    const phones = list_mem.map((u) => u.phone);
    const list_mems = list_mem.filter(
      (m) => new Date(m.time).toISOString().split("T")[0] === timeDate
    );

    let list_recharge_news = [];
    let list_withdraw_news = [];
    if (phones.length) {
      const [rech] = await connection.query(
        "SELECT id, status, type, phone, money, today FROM recharge WHERE phone IN (?) AND status = 1",
        [phones]
      );
      list_recharge_news = rech.filter((r) => new Date(r.today).toISOString().split("T")[0] === timeDate);

      const [wd] = await connection.query(
        "SELECT id, status, phone, money, today FROM withdraw WHERE phone IN (?) AND status = 1",
        [phones]
      );
      list_withdraw_news = wd.filter((w) => new Date(w.today).toISOString().split("T")[0] === timeDate);
    }

    const [redenvelopes_used] = await connection.query("SELECT * FROM redenvelopes_used WHERE phone = ?", [phone]);
    const redenvelopes_used_today = redenvelopes_used.filter(
      (r) => new Date(r.time).toISOString().split("T")[0] === timeDate
    );

    const [financial_details] = await connection.query("SELECT * FROM financial_details WHERE phone = ?", [phone]);
    const financial_details_today = financial_details.filter(
      (f) => new Date(f.time).toISOString().split("T")[0] === timeDate
    );

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: user,
      list_mems,
      list_recharge_news,
      list_withdraw_news,
      redenvelopes_used: redenvelopes_used_today,
      financial_details_today,
    });
  } catch (error) {
    console.error("infoCtv2:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== GENERIC MEMBER LISTS (deduped) ====================
const makeMemberPagination = (table, whereExtra = "") => async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const phone = req.params.phone;
    const pn = Number(req.body.pageno);
    const lim = Number(req.body.limit);

    if (!phone || !Number.isFinite(pn) || !Number.isFinite(lim) || pn < 0 || lim <= 0) {
      return res.status(200).json({ code: 0, msg: "Invalid parameters", data: { gameslist: [] }, status: false });
    }

    const [user] = await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);
    const [auths] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);

    if (!user.length || !auths.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const extra = whereExtra ? ` AND ${whereExtra}` : "";
    const [rows] = await connection.query(
      `SELECT * FROM ${table} WHERE phone = ?${extra} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [phone, lim, pn]
    );
    const [total] = await connection.query(
      `SELECT COUNT(*) as total FROM ${table} WHERE phone = ?${extra}`,
      [phone]
    );

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: rows,
      page_total: Math.ceil(total[0].total / lim),
    });
  } catch (error) {
    console.error(`${table} list:`, error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

const listRechargeMem = makeMemberPagination("recharge");
const listWithdrawMem = makeMemberPagination("withdraw");
const listBet = makeMemberPagination("minutes_1", "status != 0");

const listRedenvelope = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const phone = req.params.phone;
    const pn = Number(req.body.pageno);
    const lim = Number(req.body.limit);

    if (!phone || !Number.isFinite(pn) || !Number.isFinite(lim) || pn < 0 || lim <= 0) {
      return res.status(200).json({ code: 0, msg: "Invalid parameters", data: { gameslist: [] }, status: false });
    }

    const [user] = await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);
    const [auths] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);
    if (!user.length || !auths.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [rows] = await connection.query(
      "SELECT * FROM redenvelopes_used WHERE phone_used = ? ORDER BY id DESC LIMIT ? OFFSET ?",
      [phone, lim, pn]
    );
    const [total] = await connection.query(
      "SELECT COUNT(*) as total FROM redenvelopes_used WHERE phone_used = ?",
      [phone]
    );

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: rows,
      page_total: Math.ceil(total[0].total / lim),
    });
  } catch (error) {
    console.error("listRedenvelope:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== SALARY ====================
const CreatedSalary = async (req, res) => {
  try {
    const { phone, amount, type, notes } = req.body;

    const [existingUser] = await connection.execute("SELECT * FROM users WHERE id_user = ?", [phone]);
    if (!existingUser.length) {
      return res.status(400).json({ message: "User does not exist.", status: false });
    }

    const checkTime = timerJoin2(Date.now());

    await connection.execute("UPDATE users SET money = money + ? WHERE id_user = ?", [amount, phone]);
    await connection.execute(
      "INSERT INTO salary (phone, amount, type, time) VALUES (?, ?, ?, ?)",
      [existingUser[0].phone, amount, type, checkTime]
    );
    await connection.query(
      "INSERT INTO transaction_history SET phone = ?, detail = ?, type = ?, balance = ?, time = ?",
      [existingUser[0].phone, "Bonus", notes, amount, checkTime]
    );

    return res.status(200).json({ message: "Salary record created successfully", time: checkTime });
  } catch (error) {
    console.error("CreatedSalary:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getSalary = async (req, res) => {
  try {
    const [rows] = await connection.query("SELECT * FROM salary ORDER BY id DESC");
    const [daily] = await connection.query("SELECT SUM(amount) as total FROM salary WHERE type = 'daily'");
    const [monthly] = await connection.query("SELECT SUM(amount) as total FROM salary WHERE type = 'monthly'");
    const [yearly] = await connection.query("SELECT SUM(amount) as total FROM salary WHERE type = 'yearsly'");

    return res.status(200).json({
      message: "Success",
      status: true,
      data: {},
      rows,
      totalDailySalary: daily[0].total,
      totalMonthlySalary: monthly[0].total,
      totalEarlySalary: yearly[0].total,
    });
  } catch (error) {
    console.error("getSalary:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== 5D / K3 ADMIN LISTS ====================
const listOrderOld = async (req, res) => {
  try {
    const { gameJoin } = req.body;
    const game = Number(gameJoin);
    if (![1, 3, 5, 10].includes(game)) {
      return res.status(200).json({ code: 0, msg: "Invalid game", data: { gameslist: [] }, status: false });
    }

    const joinMap = { 1: "k5d", 3: "k5d3", 5: "k5d5", 10: "k5d10" };
    const join = joinMap[game];

    const [k5d] = await connection.query(
      "SELECT * FROM 5d WHERE status != 0 AND game = ? ORDER BY id DESC LIMIT 10",
      [game]
    );
    const [period] = await connection.query(
      "SELECT period FROM 5d WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1",
      [game]
    );
    const [waiting] = await connection.query(
      "SELECT * FROM result_5d WHERE status = 0 AND game = ? ORDER BY id ASC",
      [game]
    );
    const [settings] = await connection.query(`SELECT ${join} FROM admin`);

    if (!k5d.length || !period[0]) {
      return res.status(200).json({ code: 0, msg: "No data", data: { gameslist: [] }, status: false });
    }

    return res.status(200).json({
      code: 0,
      msg: "Success",
      data: { gameslist: k5d },
      bet: waiting,
      settings,
      join,
      period: period[0].period,
      status: true,
    });
  } catch (error) {
    console.error("listOrderOld:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

const listOrderOldK3 = async (req, res) => {
  try {
    const { gameJoin } = req.body;
    const game = Number(gameJoin);
    if (![1, 3, 5, 10].includes(game)) {
      return res.status(200).json({ code: 0, msg: "Invalid game", data: { gameslist: [] }, status: false });
    }

    const joinMap = { 1: "k3d", 3: "k3d3", 5: "k3d5", 10: "k3d10" };
    const join = joinMap[game];

    const [k3] = await connection.query(
      "SELECT * FROM k3 WHERE status != 0 AND game = ? ORDER BY id DESC LIMIT 10",
      [game]
    );
    const [period] = await connection.query(
      "SELECT period FROM k3 WHERE status = 0 AND game = ? ORDER BY id DESC LIMIT 1",
      [game]
    );
    const [waiting] = await connection.query(
      "SELECT phone, money, price, typeGame, amount, bet FROM result_k3 WHERE status = 0 AND game = ? ORDER BY id ASC",
      [game]
    );
    const [settings] = await connection.query(`SELECT ${join} FROM admin`);

    if (!k3.length || !period[0]) {
      return res.status(200).json({ code: 0, msg: "No data", data: { gameslist: [] }, status: false });
    }

    return res.status(200).json({
      code: 0,
      msg: "Success",
      data: { gameslist: k3 },
      bet: waiting,
      settings,
      join,
      period: period[0].period,
      status: true,
    });
  } catch (error) {
    console.error("listOrderOldK3:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== EDIT RESULT (SQL injection fix) ====================
const editResult = async (req, res) => {
  try {
    const { game, list } = req.body;
    if (!list || !game) return res.status(200).json({ message: "ERROR!!!", status: false });

    const map = { 1: "k5d", 3: "k5d3", 5: "k5d5", 10: "k5d10" };
    const join = map[game];
    if (!join) return res.status(400).json({ message: "Invalid game", status: false });

    await connection.execute(`UPDATE admin SET ${join} = ?`, [list]);
    return res.status(200).json({ message: "Chỉnh sửa thành công", status: true });
  } catch (error) {
    console.error("editResult:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

const editResult2 = async (req, res) => {
  try {
    const { game, list } = req.body;
    if (!list || !game) return res.status(200).json({ message: "ERROR!!!", status: false });

    const map = { 1: "k3d", 3: "k3d3", 5: "k3d5", 10: "k3d10" };
    const join = map[game];
    if (!join) return res.status(400).json({ message: "Invalid game", status: false });

    await connection.execute(`UPDATE admin SET ${join} = ?`, [list]);
    return res.status(200).json({ message: "Chỉnh sửa thành công", status: true });
  } catch (error) {
    console.error("editResult2:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== EXCEL EXPORT ====================
const todayrechargeexport = async (req, res) => {
  const today = req.query.today && req.query.today !== "" ? req.query.today : timerJoin2();
  const purpose = req.query.purpose;

  const queries = {
    todayrecharge: ["SELECT * FROM recharge WHERE DATE(today) = ?", [today]],
    totalrecharge: ["SELECT * FROM recharge", []],
    totalwithdarwal: ["SELECT * FROM withdraw", []],
    todaywithdarwal: ["SELECT * FROM withdraw WHERE DATE(today) = ?", [today]],
    todaybetting: ["SELECT * FROM minutes_1 WHERE DATE(today) = ?", [today]],
    totalbetting: ["SELECT * FROM minutes_1", []],
  };

  const entry = queries[purpose];
  if (!entry) return res.status(400).json({ message: "Invalid purpose" });

  try {
    const [rows] = await connection.query(entry[0], entry[1]);
    if (!rows.length) return res.status(404).json({ message: "No data found" });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");
    worksheet.addRow(Object.keys(rows[0]));
    rows.forEach((row) => worksheet.addRow(Object.values(row)));

    const fileName = `data_${Date.now()}.xlsx`;
    const dir = "./exports";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    const filePath = path.join(dir, fileName);

    await workbook.xlsx.writeFile(filePath);

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    fileStream.on("end", () => {
      try { fs.unlinkSync(filePath); } catch {}
    });
  } catch (error) {
    console.error("todayrechargeexport:", error);
    res.status(500).json({ message: "Error exporting to Excel" });
  }
};

// ==================== NOTIFICATIONS ====================
const createNotification = async (req, res) => {
  const auth = req.cookies.auth;
  const { title, description } = req.body;
  try {
    if (!auth) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const [user] = await connection.query("SELECT phone FROM users WHERE token = ?", [auth]);
    if (!user.length) return res.status(200).json({ message: "Invalid user", status: false, timeStamp: timeNow });

    const checkTime = timerJoin2(Date.now());
    await connection.query(
      "INSERT INTO notification (phone, heading, message, date) VALUES (?, ?, ?, ?)",
      [user[0].phone, title, description, checkTime]
    );

    return res.status(200).json({ message: "notification create successful", status: true });
  } catch (error) {
    console.error("createNotification:", error);
    return res.status(500).json({ message: "internal server error", status: false });
  }
};

const updateNotification = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const { title, description, id } = req.body;
    if (!auth) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const [user] = await connection.query("SELECT phone FROM users WHERE token = ?", [auth]);
    if (!user.length) return res.status(200).json({ message: "Invalid user", status: false, timeStamp: timeNow });

    await connection.query(
      "UPDATE notification SET phone = ?, heading = ?, message = ? WHERE id = ?",
      [user[0].phone, title, description, id]
    );
    return res.status(200).json({ message: "notification update successful", status: true });
  } catch (error) {
    console.error("updateNotification:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

const singleNotificationDelete = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const id = req.params.id;
    if (!auth) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    await connection.query("DELETE FROM notification WHERE id = ?", [id]);
    return res.status(200).json({ message: "notification delete successful", status: true });
  } catch (error) {
    console.error("singleNotificationDelete:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

const getNotification = async (req, res) => {
  try {
    const [notifications] = await connection.query("SELECT * FROM notification");
    return res.status(200).json({ message: "notification recieve successful", data: notifications, status: true });
  } catch (error) {
    console.error("getNotification:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== MINIMUM RECHARGE / LEVEL INFO ====================
const minimumRecharge = async (req, res) => {
  const auth = req.cookies.auth;
  const { recharge, type, withdraw, bet } = req.body;
  try {
    if (!auth) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    if (type === "recharge") {
      await connection.query("UPDATE minimumValue SET recharge = ? WHERE type = 'check'", [recharge]);
    } else if (type === "withdraw") {
      await connection.query("UPDATE minimumValue SET withdraw = ? WHERE type = 'check'", [withdraw]);
    } else if (type === "bet") {
      await connection.query("UPDATE minimumValue SET betCommission = ? WHERE type = 'check'", [bet]);
    }

    return res.status(200).json({ message: "notification successful", status: true });
  } catch (error) {
    console.error("minimumRecharge:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

const getLevelInfo = async (req, res) => {
  try {
    const [rows] = await connection.query("SELECT * FROM level");
    return res.status(200).json({ message: "Success", status: true, data: {}, rows });
  } catch (error) {
    console.error("getLevelInfo:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== DOWNLINE RECHARGE DATA (ADMIN) ====================
const downlinerecharge_data_admin = async (req, res) => {
  const { id_user, date } = req.body;
  if (!id_user) return res.status(200).json({ message: "id undefined", status: false, timeStamp: Date.now() });

  try {
    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE id_user = ?", [id_user]);
    if (!user.length) return res.status(200).json({ message: "Invalid id_user", status: false });

    const allUsers = await fetchDownlineTree(user[0].code, 6);
    const [levelRows] = await connection.query("SELECT * FROM level");
    const commissionRatios = {
      1: (levelRows[0]?.f1 || 0) / 100,
      2: (levelRows[1]?.f1 || 0) / 100,
      3: (levelRows[2]?.f1 || 0) / 100,
      4: (levelRows[3]?.f1 || 0) / 100,
      5: (levelRows[4]?.f1 || 0) / 100,
      6: (levelRows[5]?.f1 || 0) / 100,
    };

    const rechargeData = await Promise.all(
      allUsers.map(async (u) => {
        const levelRatio = commissionRatios[u.depth] || 0;

        const [combined] = await connection.query(
          `SELECT IFNULL(SUM(m), 0) AS total, COUNT(*) AS cnt FROM (
             SELECT money AS m FROM minutes_1 WHERE phone = ? AND DATE(today) = ?
             UNION ALL SELECT money FROM result_k3 WHERE phone = ? AND DATE(bet_data) = ?
             UNION ALL SELECT money FROM result_5d WHERE phone = ? AND DATE(bet_data) = ?
           ) t`,
          [u.phone, date, u.phone, date, u.phone, date]
        );
        const [deposits] = await connection.query(
          "SELECT id FROM recharge WHERE phone = ? AND status = 1 AND DATE(today) = ?",
          [u.phone, date]
        );
        const [rechargeSum] = await connection.query(
          "SELECT IFNULL(SUM(money), 0) AS total FROM recharge WHERE phone = ? AND status = 1 AND DATE(today) = ?",
          [u.phone, date]
        );

        const betAmount = parseFloat(combined[0].total || 0);
        return {
          totalBetAmount: betAmount.toFixed(2),
          totalRechargeAmount: parseFloat(rechargeSum[0].total || 0).toFixed(2),
          totalCommsionsAmount: parseFloat((betAmount * levelRatio).toFixed(2)),
          userLevel: u.depth,
          userId: u.id_user,
          dates: new Date(date).setUTCHours(0, 0, 0, 0),
          rechargeCount: deposits.length,
          betCount: combined[0].cnt || 0,
          isBetter: betAmount > 0,
          firstRecharge: deposits.length > 0,
        };
      })
    );

    const filtered = rechargeData.filter(
      (d) => parseFloat(d.totalBetAmount) > 0 || parseFloat(d.totalRechargeAmount) > 0 || d.totalCommsionsAmount > 0
    );

    // Aggregation
    const summary = filtered.reduce(
      (acc, d) => {
        acc.total_first_recharge_count += d.firstRecharge ? 1 : 0;
        acc.total_recharge_count += d.rechargeCount;
        acc.total_recharge_amount += parseFloat(d.totalRechargeAmount);
        acc.total_bet_count += d.betCount;
        acc.total_bet_amount += parseFloat(d.totalBetAmount);
        acc.better_number += d.isBetter ? 1 : 0;
        return acc;
      },
      { total_first_recharge_count: 0, total_recharge_count: 0, total_recharge_amount: 0, total_bet_count: 0, total_bet_amount: 0, better_number: 0 }
    );

    const levelData = filtered.reduce((acc, d) => {
      const lvl = d.userLevel;
      if (!acc[lvl]) acc[lvl] = { total_first_recharge_count: 0, total_recharge_count: 0, total_recharge_amount: 0, total_bet_count: 0, total_bet_amount: 0, better_number: 0 };
      acc[lvl].total_first_recharge_count += d.firstRecharge ? 1 : 0;
      acc[lvl].total_recharge_count += d.rechargeCount;
      acc[lvl].total_recharge_amount += parseFloat(d.totalRechargeAmount);
      acc[lvl].total_bet_count += d.betCount;
      acc[lvl].total_bet_amount += parseFloat(d.totalBetAmount);
      acc[lvl].better_number += d.isBetter ? 1 : 0;
      return acc;
    }, {});

    const levelDataArray = Object.keys(levelData).map((lvl) => ({
      level: parseInt(lvl),
      total_first_recharge_count: levelData[lvl].total_first_recharge_count,
      total_recharge_count: levelData[lvl].total_recharge_count,
      total_recharge_amount: levelData[lvl].total_recharge_amount.toFixed(2),
      total_bet_count: levelData[lvl].total_bet_count,
      total_bet_amount: levelData[lvl].total_bet_amount.toFixed(2),
      better_number: levelData[lvl].better_number,
    }));

    return res.status(200).json({
      message: "Success",
      status: true,
      timeStamp: Date.now(),
      date,
      ...summary,
      total_recharge_amount: summary.total_recharge_amount.toFixed(2),
      total_bet_amount: summary.total_bet_amount.toFixed(2),
      datas: filtered,
      levelData: levelDataArray,
    });
  } catch (error) {
    console.error("downlinerecharge_data_admin:", error);
    return res.status(500).json({ message: error.message, status: false, timeStamp: Date.now() });
  }
};

// "All-time" variant — same code path but no date filter
const downlinerecharge_data_adminAll = async (req, res) => {
  const { id_user } = req.body;
  if (!id_user) return res.status(200).json({ message: "id undefined", status: false, timeStamp: Date.now() });

  try {
    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE id_user = ?", [id_user]);
    if (!user.length) return res.status(200).json({ message: "Invalid id_user", status: false });

    const allUsers = await fetchDownlineTree(user[0].code, 6);
    const [levelRows] = await connection.query("SELECT * FROM level");
    const commissionRatios = {};
    for (let i = 0; i < 6; i++) commissionRatios[i + 1] = (levelRows[i]?.f1 || 0) / 100;

    const rechargeData = await Promise.all(
      allUsers.map(async (u) => {
        const levelRatio = commissionRatios[u.depth] || 0;

        const [combined] = await connection.query(
          `SELECT IFNULL(SUM(m), 0) AS total, COUNT(*) AS cnt FROM (
             SELECT money AS m FROM minutes_1 WHERE phone = ?
             UNION ALL SELECT money FROM result_k3 WHERE phone = ?
             UNION ALL SELECT money FROM result_5d WHERE phone = ?
           ) t`,
          [u.phone, u.phone, u.phone]
        );
        const [deposits] = await connection.query(
          "SELECT id FROM recharge WHERE phone = ? AND status = 1",
          [u.phone]
        );
        const [rechargeSum] = await connection.query(
          "SELECT IFNULL(SUM(money), 0) AS total FROM recharge WHERE phone = ? AND status = 1",
          [u.phone]
        );

        const betAmount = parseFloat(combined[0].total || 0);
        return {
          totalBetAmount: betAmount.toFixed(2),
          totalRechargeAmount: parseFloat(rechargeSum[0].total || 0).toFixed(2),
          totalCommsionsAmount: parseFloat((betAmount * levelRatio).toFixed(2)),
          userLevel: u.depth,
          userId: u.id_user,
          rechargeCount: deposits.length,
          betCount: combined[0].cnt || 0,
          isBetter: betAmount > 0,
          firstRecharge: deposits.length > 0,
        };
      })
    );

    const filtered = rechargeData.filter(
      (d) => parseFloat(d.totalBetAmount) > 0 || parseFloat(d.totalRechargeAmount) > 0 || d.totalCommsionsAmount > 0
    );

    const summary = filtered.reduce(
      (acc, d) => {
        acc.total_first_recharge_count += d.firstRecharge ? 1 : 0;
        acc.total_recharge_count += d.rechargeCount;
        acc.total_recharge_amount += parseFloat(d.totalRechargeAmount);
        acc.total_bet_count += d.betCount;
        acc.total_bet_amount += parseFloat(d.totalBetAmount);
        acc.better_number += d.isBetter ? 1 : 0;
        return acc;
      },
      { total_first_recharge_count: 0, total_recharge_count: 0, total_recharge_amount: 0, total_bet_count: 0, total_bet_amount: 0, better_number: 0 }
    );

    return res.status(200).json({
      message: "Success",
      status: true,
      timeStamp: Date.now(),
      ...summary,
      total_recharge_amount: summary.total_recharge_amount.toFixed(2),
      total_bet_amount: summary.total_bet_amount.toFixed(2),
      datas: filtered,
    });
  } catch (error) {
    console.error("downlinerecharge_data_adminAll:", error);
    return res.status(500).json({ message: error.message, status: false, timeStamp: Date.now() });
  }
};

// ==================== LEVEL / BONUS / VIP / NOTIFICATION SETTINGS ====================
const updateLevel = async (req, res) => {
  try {
    const { id, f1, f2, f3, f4 } = req.body;
    await connection.query(
      "UPDATE level SET f1 = ?, f2 = ?, f3 = ?, f4 = ? WHERE id = ?",
      [f1, f2, f3, f4, id]
    );
    return res.status(200).json({ message: "Update successful", status: true });
  } catch (error) {
    console.error("updateLevel:", error);
    return res.status(500).json({ message: "Update failed", status: false, error: error.message });
  }
};

const adminaddUSDT = async (req, res) => {
  try {
    const { phone, usdt: sdt } = req.body;
    if (!sdt || !phone) return res.status(200).json({ message: "Please enter all field", status: false });

    const [user_bank] = await connection.query("SELECT * FROM user_bank WHERE phone = ?", [phone]);
    if (!user_bank.length) return res.status(200).json({ message: "Invalid phone number", status: false });

    await connection.query(
      "UPDATE user_bank SET sdt = ?, chi_nhanh = ? WHERE phone = ?",
      [sdt, sdt, phone]
    );
    return res.status(200).json({ message: "your account is updated", status: true });
  } catch (error) {
    console.error("adminaddUSDT:", error);
    return res.status(500).json({ message: "Internal server error", status: false, error: error.message });
  }
};

const getBanner = async (req, res) => {
  try {
    const [banners] = await connection.query("SELECT * FROM banner");
    const [activity] = await connection.query("SELECT * FROM banner_activity");
    const [gameall] = await connection.query("SELECT * FROM gameAll");
    const [chennal] = await connection.query("SELECT * FROM recharge_chennal");
    return res.status(200).json({
      message: "get banner successful",
      status: true,
      data: banners[0],
      activity: activity[0],
      gameall: gameall[0],
      chennal: chennal[0],
    });
  } catch (error) {
    console.error("getBanner:", error);
    return res.status(500).json({ message: "internal server error", status: false, error: error.message });
  }
};

const updateBanner = async (req, res) => {
  const { ban1, ban2, ban3, ban4, ban5, ban6, ban7, ban8, ban9, ban10 } = req.body;
  try {
    await connection.query(
      "UPDATE banner SET ban1 = ?, ban2 = ?, ban3 = ?, ban4 = ?, ban5 = ?, ban6 = ?, ban7 = ?, ban8 = ?, ban9 = ?, ban10 = ?",
      [ban1, ban2, ban3, ban4, ban5, ban6, ban7, ban8, ban9, ban10]
    );
    return res.status(200).json({ message: "banner update successful", status: true });
  } catch (error) {
    console.error("updateBanner:", error);
    return res.status(500).json({ message: "internal server error", status: false, error: error.message });
  }
};

const updateActivityBanner = async (req, res) => {
  try {
    const cols = [
      "ban1", "ban11", "ban2", "ban22", "ban3", "ban33", "ban4", "ban44",
      "ban5", "ban55", "ban6", "ban66", "ban7", "ban77", "ban8", "ban88",
      "ban888", "telelink", "telelink2", "ban9", "ban99", "ban992", "ban999",
      "ban9992", "ban9999", "ban99992", "ban101", "ban1012", "ban102", "ban103",
      "ban104", "ban105", "ban106", "ban107", "ban108", "ban109", "ban110",
    ];
    const placeholders = cols.map(() => "?").join(", ");
    const updates = cols.map((c) => `${c} = ?`).join(", ");
    const values = cols.map((c) => req.body[c]);
    await connection.query(`UPDATE banner_activity SET ${updates}`, values);
    return res.status(200).json({ message: "banner update successful", status: true });
  } catch (error) {
    console.error("updateActivityBanner:", error);
    return res.status(500).json({ message: "internal server error", status: false, error: error.message });
  }
};

const updateLogo = async (req, res) => {
  const { name, logo, logo1, loader, favicon } = req.body;
  try {
    await connection.query(
      "UPDATE gameAll SET name = ?, logo = ?, logo1 = ?, loader = ?, favicon = ?",
      [name, logo, logo1, loader, favicon]
    );
    return res.status(200).json({ message: "banner update successful", status: true });
  } catch (error) {
    console.error("updateLogo:", error);
    return res.status(500).json({ message: "internal server error", status: false, error: error.message });
  }
};

const updateChennal = async (req, res) => {
  const { chennal1, status1, chennal2, status2, chennal3, status3, apiKey } = req.body;
  try {
    await connection.query(
      "UPDATE recharge_chennal SET chennal1 = ?, status1 = ?, chennal2 = ?, status2 = ?, chennal3 = ?, status3 = ?, key_id = ?",
      [chennal1, status1, chennal2, status2, chennal3, status3, apiKey]
    );
    return res.status(200).json({ message: "chennal update successful", status: true });
  } catch (error) {
    console.error("updateChennal:", error);
    return res.status(500).json({ message: "internal server error", status: false, error: error.message });
  }
};

const getDataRecharge = async (req, res) => {
  const { id, date } = req.body;
  if (!id || !date) return res.status(400).json({ message: "id and endDate are required", status: false });

  try {
    const today = new Date().toISOString().split("T")[0];

    const [user] = await connection.query("SELECT phone FROM users WHERE id_user = ?", [id]);
    if (!user.length) return res.status(404).json({ message: "User not found", status: false });

    const [rechargeData] = await connection.execute(
      "SELECT phone, money, today FROM recharge WHERE phone = ? AND status = 1 AND DATE(today) BETWEEN ? AND ?",
      [user[0].phone, date, today]
    );
    const [withdrawData] = await connection.execute(
      "SELECT phone, money, today FROM withdraw WHERE phone = ? AND status = 1 AND DATE(today) BETWEEN ? AND ?",
      [user[0].phone, date, today]
    );

    const combinedData = [
      ...rechargeData.map((item) => ({ ...item, type: "Recharge" })),
      ...withdrawData.map((item) => ({ ...item, type: "Withdraw" })),
    ];
    if (!combinedData.length) return res.status(404).json({ message: "No data found for the given date range", status: false });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(combinedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Recharge & Withdraw Data");

    const filePath = path.join(__dirname, "RechargeWithdrawData.xlsx");
    XLSX.writeFile(workbook, filePath);
    res.download(filePath, "RechargeWithdrawData.xlsx", (err) => {
      if (err) console.error("Error sending file:", err);
      try { fs.unlinkSync(filePath); } catch {}
    });
  } catch (error) {
    console.error("getDataRecharge:", error);
    res.status(500).json({ message: "Error exporting data", status: false });
  }
};

// ==================== ATTENDANCE BONUS ====================
const attendanceBonus = async (req, res) => {
  const { days } = req.body;
  try {
    if (!days) return res.status(400).json({ message: "Invalid or incomplete days data", status: false });

    await connection.query(
      `UPDATE \`attendencs-bonus\` SET 
        day1 = ?, day1rech = ?, day2 = ?, day2rech = ?, day3 = ?, day3rech = ?,
        day4 = ?, day4rech = ?, day5 = ?, day5rech = ?, day6 = ?, day6rech = ?,
        day7 = ?, day7rech = ?
       WHERE id = 1`,
      [
        days.day1, days.day1rech, days.day2, days.day2rech, days.day3, days.day3rech,
        days.day4, days.day4rech, days.day5, days.day5rech, days.day6, days.day6rech,
        days.day7, days.day7rech,
      ]
    );

    // Batch update point_list (bulk single query using CASE)
    const [existingData] = await connection.query(
      "SELECT id, total1, total2, total3, total4, total5, total6, total7 FROM point_list"
    );
    if (!existingData.length) return res.status(404).json({ message: "No users found", status: false });

    // Update in a single statement using CASE WHEN
    const caseClauses = [];
    const params = [];
    const dayValues = [days.day1, days.day2, days.day3, days.day4, days.day5, days.day6, days.day7];

    for (let col = 1; col <= 7; col++) {
      caseClauses.push(
        `total${col} = CASE WHEN total${col} = 0 THEN 0 ELSE ? END`
      );
      params.push(dayValues[col - 1]);
    }
    await connection.query(`UPDATE point_list SET ${caseClauses.join(", ")}`, params);

    return res.status(200).json({ message: "Attendance data updated successfully", status: true });
  } catch (e) {
    console.error("attendanceBonus:", e);
    return res.status(500).json({ message: "Internal server error", status: false, error: e.message });
  }
};

const getattendanceBonus = async (req, res) => {
  try {
    const [result] = await connection.execute("SELECT * FROM `attendencs-bonus`");
    return res.status(200).json({ message: "Total rows fetched successfully", success: true, data: result[0] });
  } catch (error) {
    console.error("getattendanceBonus:", error);
    return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
  }
};

// ==================== WARNING / SIGNUP BONUS ====================
const setWarningAlert = async (req, res) => {
  const { message, phone } = req.body;
  try {
    if (!message) return res.status(400).json({ message: "Invalid or incomplete message", status: false });
    await connection.query("UPDATE users SET message = ? WHERE phone = ?", [message, phone]);
    return res.status(200).json({ message: "Message updated successfully", status: true });
  } catch (e) {
    console.error("setWarningAlert:", e);
    return res.status(500).json({ message: "Internal server error", status: false, error: e.message });
  }
};

const setSinupBonus = async (req, res) => {
  const { amount } = req.body;
  try {
    if (!amount) return res.status(400).json({ message: "Please Enter Sinup Bonus", status: false });
    await connection.query("UPDATE admin SET sinupbonus = ? WHERE id = 1", [amount]);
    return res.status(200).json({ message: "Amount updated successfully", status: true });
  } catch (e) {
    console.error("setSinupBonus:", e);
    return res.status(500).json({ message: "Internal server error", status: false, error: e.message });
  }
};

// ==================== VIP DATA / RECHARGE BONUS ====================
const vipData = async (req, res) => {
  const { id, level, amount, onetime, monthstime, sefe, rebet } = req.body;
  if (!req.cookies.auth) {
    return res.status(401).json({ message: "Authorization failed", status: false, timeStamp: new Date().toISOString() });
  }

  try {
    const [userInfo] = await connection.query("SELECT * FROM users WHERE token = ?", [req.cookies.auth]);
    if (!userInfo.length) return res.status(404).json({ message: "User not found", status: false });

    if (!id || !level || !amount || !onetime || !monthstime || !rebet) {
      return res.status(400).json({ message: "Missing required fields", status: false });
    }

    const [result] = await connection.query(
      `UPDATE vip_data SET level = ?, amount = ?, onetime = ?, monthstime = ?, sefe = ?, rebet = ? WHERE id = ?`,
      [level, amount, onetime, monthstime, sefe, rebet, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No record found", status: false });
    }
    return res.status(200).json({ message: "Data updated successfully", status: true, updatedId: id });
  } catch (e) {
    console.error("vipData:", e);
    return res.status(500).json({ message: "Internal server error", status: false, error: e.message });
  }
};

const setRechargeBonus = async (req, res) => {
  const auth = req.cookies.auth;
  const { recAmount, bonus, is_persent, is_fisrtrecharge } = req.body;
  if (!auth) return res.status(401).json({ message: "Authorization failed", status: false });

  try {
    const [userInfo] = await connection.execute("SELECT * FROM users WHERE token = ?", [auth]);
    if (!userInfo.length) return res.status(404).json({ message: "User not found", status: false });

    if (!recAmount || !bonus || is_persent === undefined || is_fisrtrecharge === undefined) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    const [result] = await connection.execute(
      "INSERT INTO rechargeBonus (recAmount, bonus, is_persent, is_fisrtrecharge) VALUES (?, ?, ?, ?)",
      [recAmount, bonus, is_persent, is_fisrtrecharge]
    );
    return res.status(201).json({
      message: "Data inserted successfully",
      success: true,
      data: { id: result.insertId, recAmount, bonus, is_persent, is_fisrtrecharge },
    });
  } catch (error) {
    console.error("setRechargeBonus:", error);
    return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
  }
};

const updateRechargeBonus = async (req, res) => {
  const { id, recAmount, bonus, is_persent, is_fisrtrecharge } = req.body;
  try {
    if (!id || !recAmount || !bonus || is_persent === undefined || is_fisrtrecharge === undefined) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    const [result] = await connection.execute(
      "UPDATE rechargeBonus SET recAmount = ?, bonus = ?, is_persent = ?, is_fisrtrecharge = ? WHERE id = ?",
      [recAmount, bonus, is_persent, is_fisrtrecharge, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "No record found", success: false });
    return res.status(200).json({ message: "Data updated successfully", success: true });
  } catch (error) {
    console.error("updateRechargeBonus:", error);
    return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
  }
};

const getRechargeBonusCount = async (req, res) => {
  try {
    const [result] = await connection.execute("SELECT * FROM rechargeBonus");
    return res.status(200).json({ message: "Total rows fetched successfully", success: true, data: result });
  } catch (error) {
    console.error("getRechargeBonusCount:", error);
    return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
  }
};

const deleteRechargeBonus = async (req, res) => {
  const auth = req.cookies.auth;
  const { id } = req.params;
  if (!auth) return res.status(401).json({ message: "Authorization failed", status: false });
  try {
    const [userInfo] = await connection.execute("SELECT * FROM users WHERE token = ?", [auth]);
    if (!userInfo.length) return res.status(404).json({ message: "User not found", status: false });

    const [existingRecord] = await connection.execute("SELECT * FROM rechargeBonus WHERE id = ?", [id]);
    if (!existingRecord.length) return res.status(404).json({ message: "Record not found", success: false });

    await connection.execute("DELETE FROM rechargeBonus WHERE id = ?", [id]);
    return res.status(200).json({ message: "Data deleted successfully", success: true });
  } catch (error) {
    console.error("deleteRechargeBonus:", error);
    return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
  }
};

// ==================== ACTIVE USER / COMMISSION / DEPOSIT SETTINGS ====================
const activeUser = async (req, res) => {
  const auth = req.cookies.auth;
  if (!auth) return res.status(401).json({ message: "Authorization failed", status: false });

  try {
    const [userInfo] = await connection.execute("SELECT * FROM users WHERE token = ?", [auth]);
    if (!userInfo.length) return res.status(404).json({ message: "User not found", status: false });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const formattedDate = oneWeekAgo.toISOString().split("T")[0];
    const todayDate = new Date().toISOString().split("T")[0];

    const [rows] = await connection.execute(
      `SELECT DISTINCT phone FROM minutes_1 WHERE isdemo != 1 AND DATE(today) >= ?
       UNION SELECT DISTINCT phone FROM result_k3 WHERE DATE(bet_data) >= ?
       UNION SELECT DISTINCT phone FROM result_5d WHERE DATE(bet_data) >= ?`,
      [formattedDate, formattedDate, formattedDate]
    );
    const [todayUaer] = await connection.execute(
      `SELECT DISTINCT phone FROM minutes_1 WHERE isdemo != 1 AND DATE(today) = ?
       UNION SELECT DISTINCT phone FROM result_k3 WHERE DATE(bet_data) = ?
       UNION SELECT DISTINCT phone FROM result_5d WHERE DATE(bet_data) = ?`,
      [todayDate, todayDate, todayDate]
    );

    const [allUser] = await connection.query("SELECT COUNT(*) as total FROM users WHERE isdemo = 0");
    const [allDemoUser] = await connection.query("SELECT COUNT(*) as total FROM users WHERE isdemo = 1");
    const [allUserAmount] = await connection.query(
      "SELECT COALESCE(SUM(money), 0) AS totalMoney FROM users WHERE isdemo = 0"
    );
    const [usertodays] = await connection.query(
      "SELECT COUNT(*) as total FROM users WHERE DATE(today) = ?",
      [todayDate]
    );

    return res.json({
      activeUsers: rows.length,
      totalUser: allUser[0].total,
      totalDemoUser: allDemoUser[0].total,
      totalMoney: allUserAmount[0].totalMoney,
      todayUser: usertodays[0].total,
    });
  } catch (error) {
    console.error("activeUser:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const setUserBetCommition = async (req, res) => {
  const { id, commitionBetAmount, betCommition } = req.body;
  if (!id || !commitionBetAmount || betCommition === undefined || isNaN(betCommition)) {
    return res.status(400).json({ message: "Invalid input", status: false });
  }

  try {
    const [result] = await connection.execute(
      "UPDATE admin SET user_bet_commition = ?, commition_Bet_Amount = ? WHERE id = ?",
      [parseFloat(betCommition), commitionBetAmount, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "No record found", status: false });
    return res.status(200).json({ message: "Bet Commission updated successfully", data: result, status: true });
  } catch (error) {
    console.error("setUserBetCommition:", error);
    return res.status(500).json({ message: "Internal server error", status: false, error: error.message });
  }
};

const setdepositerequrments = async (req, res) => {
  const { id, depositerequrments } = req.body;
  if (!id || !depositerequrments) return res.status(400).json({ message: "Invalid input", status: false });

  try {
    const [result] = await connection.execute(
      "UPDATE admin SET deposite_requre = ? WHERE id = ?",
      [depositerequrments, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "No record found", status: false });
    return res.status(200).json({ message: "Deposit Requirements updated successfully", data: result, status: true });
  } catch (error) {
    console.error("setdepositerequrments:", error);
    return res.status(500).json({ message: "Internal server error", status: false, error: error.message });
  }
};

const getdepositerequrments = async (req, res) => {
  if (!req.cookies.auth) return res.status(401).json({ message: "Authorization failed", status: false });

  try {
    const [userInfo] = await connection.execute("SELECT * FROM users WHERE token = ?", [req.cookies.auth]);
    if (!userInfo.length) return res.status(404).json({ message: "User not found", status: false });

    const [dpositReq] = await connection.execute("SELECT deposite_requre FROM admin");
    const [admin] = await connection.query("SELECT * FROM admin");
    return res.status(200).json({
      message: "Deposit Requirements updated successfully",
      data: dpositReq[0].deposite_requre,
      sinupBonus: admin[0].sinupbonus,
      status: true,
    });
  } catch (error) {
    console.error("getdepositerequrments:", error);
    return res.status(500).json({ message: "Internal server error", status: false, error: error.message });
  }
};

const setwebsiteMode = async (req, res) => {
  const { id, depositerequrments } = req.body;
  if (!id || !depositerequrments) return res.status(400).json({ message: "Invalid input", status: false });

  try {
    const [result] = await connection.execute("UPDATE admin SET website_mode = ? WHERE id = ?", [depositerequrments, id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "No record found", status: false });
    return res.status(200).json({ message: "Website Mode updated successfully", data: result, status: true });
  } catch (error) {
    console.error("setwebsiteMode:", error);
    return res.status(500).json({ message: "Internal server error", status: false, error: error.message });
  }
};

const geWebsiteMode = async (req, res) => {
  if (!req.cookies.auth) return res.status(401).json({ message: "Authorization failed", status: false });
  try {
    const [userInfo] = await connection.execute("SELECT * FROM users WHERE token = ?", [req.cookies.auth]);
    if (!userInfo.length) return res.status(404).json({ message: "User not found", status: false });

    const [websirMode] = await connection.execute("SELECT website_mode FROM admin");
    return res.status(200).json({ message: "Website Mode fetched", data: websirMode[0].website_mode, status: true });
  } catch (error) {
    console.error("geWebsiteMode:", error);
    return res.status(500).json({ message: "Internal server error", status: false, error: error.message });
  }
};

// ==================== WINNING PERCENTAGE ====================
const winningPercentage = async (req, res) => {
  try {
    const formattedToday = new Date().toISOString().split("T")[0];

    const [WinMoney] = await connection.query(
      `SELECT
        (SELECT COALESCE(SUM(\`get\`), 0) FROM minutes_1 WHERE status = 1 AND DATE(today) = ? AND isdemo = 0) +
        (SELECT COALESCE(SUM(\`get\`), 0) FROM result_k3 WHERE status = 1 AND DATE(bet_data) = ?) +
        (SELECT COALESCE(SUM(\`get\`), 0) FROM result_5d WHERE status = 1 AND DATE(bet_data) = ?) AS total_money`,
      [formattedToday, formattedToday, formattedToday]
    );
    const totalWinningMoney = WinMoney[0].total_money || 0;

    const [totalMoney] = await connection.query(
      `SELECT
        (SELECT COALESCE(SUM(money), 0) FROM minutes_1 WHERE DATE(today) = ? AND isdemo = 0) +
        (SELECT COALESCE(SUM(money), 0) FROM result_k3 WHERE DATE(bet_data) = ?) +
        (SELECT COALESCE(SUM(money), 0) FROM result_5d WHERE DATE(bet_data) = ?) AS total_money`,
      [formattedToday, formattedToday, formattedToday]
    );
    const totalBetMoney = totalMoney[0].total_money || 0;

    const [LossMoney] = await connection.query(
      `SELECT
        (SELECT COALESCE(SUM(money), 0) FROM minutes_1 WHERE status = 2 AND DATE(today) = ? AND isdemo = 0) +
        (SELECT COALESCE(SUM(money), 0) FROM result_k3 WHERE status = 2 AND DATE(bet_data) = ?) +
        (SELECT COALESCE(SUM(money), 0) FROM result_5d WHERE status = 2 AND DATE(bet_data) = ?) AS total_money`,
      [formattedToday, formattedToday, formattedToday]
    );
    const totalLossMoney = LossMoney[0].total_money || 0;

    const adminProfit = totalBetMoney - totalWinningMoney;
    const userWinningPercentage = totalBetMoney > 0 ? (totalWinningMoney / totalBetMoney) * 100 : 0;
    const adminProfitPercentage = totalBetMoney > 0 ? (adminProfit / totalBetMoney) * 100 : 0;

    return res.json({
      totalWinningMoney,
      totalLossMoney,
      totalBetMoney,
      adminProfit,
      userWinningPercentage: userWinningPercentage.toFixed(2),
      adminProfitPercentage: adminProfitPercentage.toFixed(2),
    });
  } catch (error) {
    console.error("winningPercentage:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== SPIN CONTROLLER ====================
const spinController = async (req, res) => {
  const { taskAmount, numberofSpin, sec1, sec2, sec3, sec4, sec5, sec6, sec7, sec8, id } = req.body;
  if (!taskAmount || !numberofSpin) {
    return res.status(400).json({ message: "Invalid input. All fields are required.", status: false });
  }
  try {
    await connection.execute(
      "UPDATE spin_data SET task_amount = ?, num_of_spin = ?, sec1 = ?, sec2 = ?, sec3 = ?, sec4 = ?, sec5 = ?, sec6 = ?, sec7 = ?, sec8 = ? WHERE id = ?",
      [taskAmount, numberofSpin, sec1, sec2, sec3, sec4, sec5, sec6, sec7, sec8, id]
    );
    return res.status(201).json({ message: "Data inserted successfully", status: true });
  } catch (error) {
    console.error("spinController:", error);
    return res.status(500).json({ message: "Internal server error", status: false, error: error.message });
  }
};

// ==================== LEGAL TRADE / PROFIT-LOSS ====================
const ligalTrade = async (req, res) => {
  try {
    const { user_id } = req.body;
    const userCondition = user_id ? `AND id_user = ${Number(user_id)}` : "";
    const historyCondition = user_id ? `WHERE user_id = ${Number(user_id)}` : "";

    const [illageusers] = await connection.query(
      `SELECT id_user, phone, legal_bet_score FROM users WHERE legal_bet_score > 0 ${userCondition}`
    );

    const [history] = await connection.query(
      `SELECT * FROM ligal_trade ${historyCondition} ORDER BY date DESC`
    );
    if (!history.length) {
      return res.status(404).json({ message: "No users found with illegal betting activity", status: false });
    }

    const [lastIllegalData] = await connection.query(`
      SELECT user_id, MAX(date) AS last_illegal_date
      FROM ligal_trade
      WHERE user_id IN (SELECT id_user FROM users WHERE legal_bet_score > 0)
      GROUP BY user_id
    `);
    const userLastDateMap = {};
    lastIllegalData.forEach(({ user_id, last_illegal_date }) => {
      userLastDateMap[user_id] = last_illegal_date;
    });

    const result = illageusers.map((user) => ({
      ...user,
      last_illegal_date: userLastDateMap[user.id_user] || null,
    }));

    return res.status(200).json({
      message: "Betting data retrieved successfully",
      status: true,
      data: { users: result, history },
    });
  } catch (error) {
    console.error("ligalTrade:", error);
    return res.status(500).json({ message: "Internal server error", status: false, error: error.message });
  }
};

const profitLoss = async (req, res) => {
  const { range, uid } = req.body;
  try {
    let phone = null;
    if (uid) {
      const [userResult] = await connection.query("SELECT phone FROM users WHERE id_user = ? LIMIT 1", [uid]);
      if (!userResult.length) return res.status(404).json({ status: false, message: "User not found" });
      phone = userResult[0].phone;
    }

    const dateMap = {
      yesterday: [
        "DATE(today) = CURDATE() - INTERVAL 1 DAY",
        "DATE(bet_data) = CURDATE() - INTERVAL 1 DAY",
      ],
      thisWeek: [
        "YEARWEEK(today, 1) = YEARWEEK(CURDATE(), 1)",
        "YEARWEEK(bet_data, 1) = YEARWEEK(CURDATE(), 1)",
      ],
      thisMonth: [
        "MONTH(today) = MONTH(CURDATE()) AND YEAR(today) = YEAR(CURDATE())",
        "MONTH(bet_data) = MONTH(CURDATE()) AND YEAR(bet_data) = YEAR(CURDATE())",
      ],
      lastMonth: [
        "MONTH(today) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND YEAR(today) = YEAR(CURDATE() - INTERVAL 1 MONTH)",
        "MONTH(bet_data) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND YEAR(bet_data) = YEAR(CURDATE() - INTERVAL 1 MONTH)",
      ],
      allTime: ["1=1", "1=1"],
      today: ["DATE(today) = CURDATE()", "DATE(bet_data) = CURDATE()"],
    };

    const [condMin, condK3] = dateMap[range] || dateMap.today;

    const phoneFilter = phone ? " AND phone = ? " : "";
    const params = phone ? [phone, phone, phone] : [];

    const [winRows] = await connection.query(
      `SELECT
        (SELECT COALESCE(SUM(money), 0) FROM minutes_1 WHERE status = 1 AND isdemo = 0 ${phoneFilter} AND ${condMin}) +
        (SELECT COALESCE(SUM(money), 0) FROM result_k3 WHERE status = 1 ${phoneFilter} AND ${condK3}) +
        (SELECT COALESCE(SUM(money), 0) FROM result_5d WHERE status = 1 ${phoneFilter} AND ${condK3}) AS total_money`,
      params
    );
    const totalWinnigMoney = winRows[0].total_money || 0;

    const [lossRows] = await connection.query(
      `SELECT
        (SELECT COALESCE(SUM(money), 0) FROM minutes_1 WHERE status = 2 AND isdemo = 0 ${phoneFilter} AND ${condMin}) +
        (SELECT COALESCE(SUM(money), 0) FROM result_k3 WHERE status = 2 ${phoneFilter} AND ${condK3}) +
        (SELECT COALESCE(SUM(money), 0) FROM result_5d WHERE status = 2 ${phoneFilter} AND ${condK3}) AS total_money`,
      params
    );
    const totalLossMoney = lossRows[0].total_money || 0;

    const [feeRows] = await connection.query(
      `SELECT
        (SELECT COALESCE(SUM(fee), 0) FROM minutes_1 WHERE isdemo = 0 ${phoneFilter} AND ${condMin}) +
        (SELECT COALESCE(SUM(fee), 0) FROM result_k3 ${phoneFilter} AND ${condK3}) +
        (SELECT COALESCE(SUM(fee), 0) FROM result_5d ${phoneFilter} AND ${condK3}) AS total_money`,
      params
    );
    const totalTextMoney = feeRows[0].total_money || 0;

    let winGo10Query = "SELECT * FROM minutes_1 WHERE status != 0";
    const winGo10Params = [];
    if (phone) {
      winGo10Query += " AND phone = ?";
      winGo10Params.push(phone);
    }
    winGo10Query += " ORDER BY id DESC LIMIT 10";
    const [winGo10] = await connection.execute(winGo10Query, winGo10Params);

    const totalbetMoney = Number(totalWinnigMoney) + Number(totalLossMoney);
    const winningPct = totalbetMoney > 0 ? (totalWinnigMoney / totalbetMoney) * 100 : 0;

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
      winningPercentage: winningPct.toFixed(2),
    });
  } catch (error) {
    console.error("profitLoss:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== INVITATION BONUS ====================
const setInvitationBonus = async (req, res) => {
  const { rule, amount, bonus, count } = req.body;
  try {
    if (!amount || !bonus || !count) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }
    await connection.query(
      "INSERT INTO invitation_bonus (rule, amount, bonus, count) VALUES (?, ?, ?, ?)",
      [rule, amount, bonus, count]
    );
    return res.status(201).json({ message: "Data inserted successfully", success: true });
  } catch (error) {
    console.error("setInvitationBonus:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateInvitationBonus = async (req, res) => {
  const { id, rule, amount, bonus, count } = req.body;
  try {
    if (!id || !amount || !bonus || !count) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }
    const [result] = await connection.query(
      "UPDATE invitation_bonus SET rule = ?, amount = ?, bonus = ?, count = ? WHERE id = ?",
      [rule, amount, bonus, count, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "No record found", success: false });
    return res.status(200).json({ message: "Data updated successfully", success: true });
  } catch (error) {
    console.error("updateInvitationBonus:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteInvitationBonus = async (req, res) => {
  const { id } = req.body;
  try {
    if (!id) return res.status(400).json({ message: "ID is required", success: false });
    const [result] = await connection.query("DELETE FROM invitation_bonus WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "No record found", success: false });
    return res.status(200).json({ message: "Data deleted successfully", success: true });
  } catch (error) {
    console.error("deleteInvitationBonus:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== DEMO / CONVERT AGENT / ENABLE WITHDRAW ====================
const demoUser = async (req, res) => {
  try {
    const [result] = await connection.query("SELECT * FROM users WHERE isdemo = 1");
    return res.status(200).json({ message: "demoUser successfully", success: true, data: result });
  } catch (error) {
    console.error("demoUser:", error);
    return res.status(500).json({ error: "Internal server error", err: error.message });
  }
};

const convertAgent = async (req, res) => {
  const { user_id, value } = req.body;
  try {
    await connection.query("UPDATE users SET level = ? WHERE id_user = ?", [Number(value), user_id]);
    return res.status(200).json({ message: "update successfully", status: true });
  } catch (error) {
    console.error("convertAgent:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const enableWithdraw = async (req, res) => {
  const { enable, phone } = req.body;
  try {
    await connection.execute("UPDATE users SET enableWithdraw = ? WHERE phone = ?", [enable, phone]);
    return res.status(200).json({ message: "update enableWithdraw", status: true });
  } catch (error) {
    console.error("enableWithdraw:", error);
    return res.status(500).json({ message: "Error enableWithdraw", status: false });
  }
};

// ==================== EXPORTS ====================
module.exports = {
  // pages
  todayrechargeexport, adminPage, adminPage3, adminPage5, adminPage10,
  admintrxPage, admintrxPage3, admintrxPage5, admintrxPage10,
  adminCarPage, adminCarPage3, adminCarPage5, adminCarPage10,
  membersPage, ctvPage, giftPage, settingPage: page("manage/settings.ejs"),
  rechargePage, rechargeAllPage, rechargeSuccessPage, rechargePandingPage, rechargeFailPage,
  rechargeRecord, withdrawRecord, withdraw, settings,
  ctvProfilePage, infoMember, statistical, statistical2,
  turnover, betting, todayreport, withdrawsuccess, withdrawfail,
  notificationPage, userlevelPage, userlevelAllPage, bannerPage, activitybannerPage,
  logoSettingPage, chennalSettingPage, promotionsPage,
  attendencebonesPage, SignupBonespage, agentperformancepage,
  iprecord, topperformance, apitransaction, createuser, manualwithdraw,
  vipsection, FirstDepositBonus, profitloss, createsubpanel, llegaltrade,
  Supportsection, activitysettings, spinwheel, InvitationBonus,
  CreatedSalaryRecord, levelSetting, livePage, demouser,
  depositePage, withdrawalPage, changeloginIdPass, modifyBankInfo, usdtaddress,
  activityBonus, gameProblems,

  // middleware
  middlewareAdminController,

  // game data / stats
  totalJoin, totalJoinRacing, statistical, statistical2, turnover_report, betting_report, today_report,
  recharge, rechargeCallback, rechargeDuyet, rechargeDuyetOld: rechargeDuyet,
  confirmRecharge: ConfirmRecharge, confirmRechargeOld: ConfirmRechargeold,

  // admin actions
  listMember, changeAdmin, changeAdminRacing, userInfo, editbank,
  listCTV, profileUser, infoCtv, infoCtv2,
  AgentCommission, createBonus, listRedenvelops,
  banned, eligaUnblockUser,
  listRechargeMem, listWithdrawMem, listRedenvelope, listBet,
  listOrderOld, listOrderOldK3,
  editResult, editResult2,
  CreatedSalary, getSalary,
  handlWithdraw, handlWithdraw2, handlWithdrawCallback,
  settingBank, settingGet, settingCskh, settingbuff, settingMessage, settingdemo: createsubadmin,
  settingneed: setdepositerequrments, // legacy alias
  register, adminaddUSDT,
  getBanner, updateBanner, updateActivityBanner, updateLogo, updateChennal,
  getDataRecharge,
  attendanceBonus, getattendanceBonus,
  setWarningAlert, setSinupBonus,
  vipData, setRechargeBonus, updateRechargeBonus, getRechargeBonusCount, deleteRechargeBonus,
  activeUser, setUserBetCommition, setdepositerequrments, getdepositerequrments,
  winningPercentage, spinController,
  ligalTrade, profitLoss,
  setInvitationBonus, updateInvitationBonus, deleteInvitationBonus,
  createsubadmin, getAllAdmins, editUserPermissions, deleteadmin_1, getUserPermissions,
  setwebsiteMode, geWebsiteMode,
  spinset, demoUser, convertAgent, enableWithdraw,
  downlinerecharge_data_admin, downlinerecharge_data_adminAll,
  minimumRecharge, getLevelInfo, updateLevel, getNotification,
  createNotification, updateNotification, singleNotificationDelete,
};