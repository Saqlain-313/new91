import connection from "../config/connectDB";
import jwt from "jsonwebtoken";
import md5 from "md5";

require("dotenv").config();

const timeNow = Date.now();

// ==================== HELPERS ====================
function formateT(params) {
  return params < 10 ? "0" + params : params;
}

function timerJoin(params = "", addHours = 0) {
  const date = params ? new Date(Number(params)) : new Date();
  date.setHours(date.getHours() + addHours);

  const years = formateT(date.getFullYear());
  const months = formateT(date.getMonth() + 1);
  const days = formateT(date.getDate());
  let hours = date.getHours() % 12;
  hours = hours === 0 ? 12 : hours;
  const ampm = date.getHours() < 12 ? "AM" : "PM";
  const minutes = formateT(date.getMinutes());
  const seconds = formateT(date.getSeconds());

  return `${years}-${months}-${days} ${hours}:${minutes}:${seconds} ${ampm}`;
}

// Fetch user by auth token
async function getUserByToken(auth) {
  if (!auth) return null;
  const [rows] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);
  return rows.length ? rows[0] : null;
}

// Count downline users up to `maxDepth` levels using a recursive CTE (single query, no N+1)
async function countDownlineByDepth(rootCode, maxDepth = 4) {
  const [rows] = await connection.query(
    `WITH RECURSIVE tree AS (
       SELECT code, invite, time, 1 AS depth FROM users WHERE invite = ?
       UNION ALL
       SELECT u.code, u.invite, u.time, t.depth + 1
       FROM users u INNER JOIN tree t ON u.invite = t.code
       WHERE t.depth < ?
     )
     SELECT depth, COUNT(*) AS cnt FROM tree GROUP BY depth`,
    [rootCode, maxDepth]
  );
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const row of rows) counts[row.depth] = row.cnt;
  return counts;
}

// Count downline users created today (up to 4 levels)
async function countDownlineToday(rootCode, maxDepth = 4) {
  const [rows] = await connection.query(
    `WITH RECURSIVE tree AS (
       SELECT code, invite, time, 1 AS depth FROM users WHERE invite = ?
       UNION ALL
       SELECT u.code, u.invite, u.time, t.depth + 1
       FROM users u INNER JOIN tree t ON u.invite = t.code
       WHERE t.depth < ?
     )
     SELECT COUNT(*) AS cnt FROM tree WHERE DATE(FROM_UNIXTIME(time / 1000)) = CURDATE()`,
    [rootCode, maxDepth]
  );
  return rows[0]?.cnt || 0;
}

// ==================== PAGE RENDERERS ====================
const dailyPage = async (req, res) => res.render("daily/statistical.ejs");
const salary = async (req, res) => res.render("daily/salary.ejs");
const listMeber = async (req, res) => res.render("daily/members.ejs");
const profileMember = async (req, res) => res.render("daily/profileMember.ejs");
const settingPage = async (req, res) => res.render("daily/settings.ejs");
const listRecharge = async (req, res) => res.render("daily/listRecharge.ejs");
const listWithdraw = async (req, res) => res.render("daily/listWithdraw.ejs");
const getAgentPerformance = async (req, res) => res.render("daily/Agentperformance.ejs");
const support = async (req, res) => res.render("daily/support.ejs");

const pageInfo = async (req, res) => {
  const phone = req.params.phone;
  return res.render("daily/profileMember.ejs", { phone });
};

// ==================== GIFT PAGE ====================
const giftPage = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const [rows] = await connection.execute(
      "SELECT `phone` FROM `users` WHERE `token` = ? AND veri = 1",
      [auth]
    );

    let money = 0;
    let money2 = 0;
    if (rows.length) {
      const [point_list] = await connection.execute(
        "SELECT `money`, `money_us` FROM `point_list` WHERE `phone` = ?",
        [rows[0].phone]
      );
      money = point_list[0]?.money || 0;
      money2 = point_list[0]?.money_us || 0;
    }

    return res.render("daily/giftPage.ejs", { money, money2 });
  } catch (error) {
    console.error("giftPage error:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== SETTINGS ====================
const settings = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const { type, value } = req.body;

    const [rows] = await connection.execute(
      "SELECT `phone` FROM `users` WHERE `token` = ? AND veri = 1",
      [auth]
    );
    if (!rows.length) {
      return res.status(200).json({ message: "Error", status: false });
    }

    if (!type) {
      const [point_list] = await connection.execute(
        "SELECT `telegram` FROM `point_list` WHERE phone = ?",
        [rows[0].phone]
      );
      const [settingsRows] = await connection.execute("SELECT `telegram` FROM `admin`");

      return res.status(200).json({
        message: "Get success",
        status: true,
        telegram: settingsRows[0]?.telegram,
        telegram2: point_list[0]?.telegram,
      });
    }

    await connection.execute(
      "UPDATE `point_list` SET telegram = ? WHERE phone = ?",
      [value, rows[0].phone]
    );

    return res.status(200).json({ message: "Successfully edited", status: true });
  } catch (error) {
    console.error("settings error:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== MIDDLEWARE ====================
const middlewareDailyController = async (req, res, next) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) return res.redirect("/login");

    const [rows] = await connection.execute(
      "SELECT `token`, `level`, `status` FROM `users` WHERE `token` = ? AND `veri` = 1",
      [auth]
    );
    if (!rows.length) return res.redirect("/login");

    if (rows[0].status != 1) return res.redirect("/login");
    if (rows[0].level != 2) return res.redirect("/home");

    return next();
  } catch (error) {
    console.error("middlewareDailyController error:", error.message);
    return res.redirect("/login");
  }
};

// ==================== STATISTICAL ====================
const statistical = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const userInfo = await getUserByToken(auth);

    if (!userInfo) {
      return res.status(200).json({ message: "Failed", status: false });
    }

    const [f1Rows] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `time` FROM users WHERE `invite` = ?",
      [userInfo.code]
    );

    const counts = await countDownlineByDepth(userInfo.code, 4);
    const fAllToday = await countDownlineToday(userInfo.code, 4);

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: [userInfo],
      f1: counts[1],
      f2: counts[2],
      f3: counts[3],
      f4: counts[4],
      f_all_today: fAllToday,
    });
  } catch (error) {
    console.error("statistical error:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== USER INFO (admin view of a member) ====================
const userInfo = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const phone = req.params.phone;

    if (!phone) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [user] = await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);
    const authInfo = await getUserByToken(auth);

    if (!user.length || !authInfo) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const { token, password, otp, level, ...safeUserInfo } = user[0];

    if (authInfo.phone !== safeUserInfo.ctv) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const counts = await countDownlineByDepth(safeUserInfo.code, 4);

    const [recharge] = await connection.query(
      "SELECT SUM(`money`) as total FROM recharge WHERE phone = ? AND status = 1",
      [phone]
    );
    const [withdraw] = await connection.query(
      "SELECT SUM(`money`) as total FROM withdraw WHERE phone = ? AND status = 1",
      [phone]
    );
    const [bank_user] = await connection.query("SELECT * FROM user_bank WHERE phone = ?", [phone]);

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: safeUserInfo,
      total_r: recharge,
      total_w: withdraw,
      f1: counts[1],
      f2: counts[2],
      f3: counts[3],
      f4: counts[4],
      bank_user,
    });
  } catch (error) {
    console.error("userInfo error:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== CTV INFO ====================
const infoCtv = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const authInfo = await getUserByToken(auth);

    if (!authInfo) {
      return res.status(200).json({ message: "Phone Error", status: false });
    }

    const phone = authInfo.phone;
    const counts = await countDownlineByDepth(authInfo.code, 4);

    const [list_mem] = await connection.query(
      "SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1",
      [phone]
    );
    const [list_mem_baned] = await connection.query(
      "SELECT * FROM users WHERE ctv = ? AND status = 2 AND veri = 1",
      [phone]
    );

    // Aggregate totals in bulk (avoids N+1)
    const phones = list_mem.map((u) => u.phone);
    let total_recharge = 0;
    let total_withdraw = 0;
    let total_recharge_today = 0;
    let total_withdraw_today = 0;
    let win = 0;
    let loss = 0;
    let list_recharge_news = [];
    let list_withdraw_news = [];

    if (phones.length) {
      const today = timerJoin();

      const [recharges] = await connection.query(
        "SELECT id, status, type, phone, money, time FROM recharge WHERE phone IN (?) AND status = 1",
        [phones]
      );
      for (const r of recharges) {
        total_recharge += Number(r.money || 0);
        if (timerJoin(r.time) === today) {
          total_recharge_today += Number(r.money || 0);
          list_recharge_news.push(r);
        }
      }

      const [withdraws] = await connection.query(
        "SELECT id, status, phone, money, time FROM withdraw WHERE phone IN (?) AND status = 1",
        [phones]
      );
      for (const w of withdraws) {
        total_withdraw += Number(w.money || 0);
        if (timerJoin(w.time) === today) {
          total_withdraw_today += Number(w.money || 0);
          list_withdraw_news.push(w);
        }
      }

      const [wins] = await connection.query(
        "SELECT money, time FROM minutes_1 WHERE phone IN (?) AND status = 1",
        [phones]
      );
      for (const w of wins) {
        if (timerJoin(w.time) === today) win += Number(w.money || 0);
      }

      const [losses] = await connection.query(
        "SELECT money, time FROM minutes_1 WHERE phone IN (?) AND status = 2",
        [phones]
      );
      for (const l of losses) {
        if (timerJoin(l.time) === today) loss += Number(l.money || 0);
      }
    }

    // Members registered today
    const today = timerJoin();
    const [list_mem_today] = await connection.query(
      "SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1",
      [phone]
    );
    const list_mems = [];
    for (const m of list_mem_today) {
      if (timerJoin(m.time) !== today) continue;
      const [phone_invites] = await connection.query("SELECT phone FROM users WHERE code = ?", [m.invite]);
      list_mems.push({ ...m, phone_invite: phone_invites[0]?.phone || null });
    }

    const [point_list] = await connection.query("SELECT * FROM point_list WHERE phone = ?", [phone]);
    const moneyCTV = point_list[0]?.money || 0;

    // Red envelopes used today
    const [redenvelopes_used] = await connection.query(
      "SELECT * FROM redenvelopes_used WHERE phone = ?",
      [phone]
    );
    const redenvelopes_used_today = redenvelopes_used.filter((r) => timerJoin(r.time) === today);

    // Financial details today
    const [financial_details] = await connection.query(
      "SELECT * FROM financial_details WHERE phone = ?",
      [phone]
    );
    const financial_details_today = financial_details.filter((f) => timerJoin(f.time) === today);

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: [authInfo],
      f1: counts[1],
      f2: counts[2],
      f3: counts[3],
      f4: counts[4],
      list_mems,
      total_recharge,
      total_withdraw,
      total_recharge_today,
      total_withdraw_today,
      list_mem_baned: list_mem_baned.length,
      win,
      loss,
      list_recharge_news,
      list_withdraw_news,
      moneyCTV,
      redenvelopes_used: redenvelopes_used_today,
      financial_details_today,
    });
  } catch (error) {
    console.error("infoCtv error:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== CTV INFO 2 (date filter) ====================
const infoCtv2 = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const timeDate = req.body.timeDate;
    const authInfo = await getUserByToken(auth);

    if (!authInfo) {
      return res.status(200).json({ message: "Phone Error", status: false });
    }

    const phone = authInfo.phone;

    const [list_mem] = await connection.query(
      "SELECT * FROM users WHERE ctv = ? AND status = 1 AND veri = 1",
      [phone]
    );

    const list_mems = [];
    for (const m of list_mem) {
      if (timerJoin(m.time) !== timeDate) continue;
      const [phone_invites] = await connection.query("SELECT phone FROM users WHERE code = ?", [m.invite]);
      list_mems.push({ ...m, phone_invite: phone_invites[0]?.phone || null });
    }

    const phones = list_mem.map((u) => u.phone);
    const list_recharge_news = [];
    const list_withdraw_news = [];

    if (phones.length) {
      const [recharges] = await connection.query(
        "SELECT id, status, type, phone, money, time FROM recharge WHERE phone IN (?) AND status = 1",
        [phones]
      );
      for (const r of recharges) {
        if (timerJoin(r.time) === timeDate) list_recharge_news.push(r);
      }

      const [withdraws] = await connection.query(
        "SELECT id, status, phone, money, time FROM withdraw WHERE phone IN (?) AND status = 1",
        [phones]
      );
      for (const w of withdraws) {
        if (timerJoin(w.time) === timeDate) list_withdraw_news.push(w);
      }
    }

    const [redenvelopes_used] = await connection.query(
      "SELECT * FROM redenvelopes_used WHERE phone = ?",
      [phone]
    );
    const redenvelopes_used_today = redenvelopes_used.filter((r) => timerJoin(r.time) === timeDate);

    const [financial_details] = await connection.query(
      "SELECT * FROM financial_details WHERE phone = ?",
      [phone]
    );
    const financial_details_today = financial_details.filter((f) => timerJoin(f.time) === timeDate);

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: [authInfo],
      list_mems,
      list_recharge_news,
      list_withdraw_news,
      redenvelopes_used: redenvelopes_used_today,
      financial_details_today,
    });
  } catch (error) {
    console.error("infoCtv2 error:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== CREATE BONUS (red envelope) ====================
const createBonus = async (req, res) => {
  try {
    const randomString = (length) => {
      const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const auth = req.cookies.auth;
    const money = Number(req.body.money);

    if (!money || !auth) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const userInfo = await getUserByToken(auth);
    if (!userInfo) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [point_list] = await connection.query("SELECT * FROM point_list WHERE phone = ?", [userInfo.phone]);
    if (!point_list.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }
    const ctv = point_list[0];

    if (Number(ctv.money) - money < 0) {
      return res.status(200).json({ message: "The balance is not enough to create gifts", status: false });
    }

    const id_redenvelops = randomString(16);
    const time = Date.now();

    await connection.execute("UPDATE `point_list` SET money = money - ? WHERE phone = ?", [money, ctv.phone]);
    await connection.query(
      "INSERT INTO redenvelopes SET id_redenvelope = ?, phone = ?, money = ?, used = ?, amount = ?, status = ?, time = ?",
      [id_redenvelops, userInfo.phone, money, 1, 1, 0, time]
    );

    const [updated] = await connection.query("SELECT `money` FROM point_list WHERE phone = ?", [userInfo.phone]);

    return res.status(200).json({
      message: "Successful gift creation",
      status: true,
      id: id_redenvelops,
      money: updated[0]?.money,
    });
  } catch (error) {
    console.error("createBonus error:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== LIST RED ENVELOPES ====================
const listRedenvelops = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const userInfo = await getUserByToken(auth);
    if (!userInfo) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [redenvelopes] = await connection.query(
      "SELECT * FROM redenvelopes WHERE phone = ? ORDER BY id DESC",
      [userInfo.phone]
    );

    return res.status(200).json({
      message: "Successful change",
      status: true,
      redenvelopes,
    });
  } catch (error) {
    console.error("listRedenvelops error:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== LIST MEMBER (paginated) ====================
const listMember = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const { pageno, limit } = req.body;

    const userInfo = await getUserByToken(auth);
    if (!userInfo) {
      return res.status(200).json({ code: 0, msg: "No more data", data: { gameslist: [] }, status: false });
    }

    const pageNum = Number(pageno);
    const lim = Number(limit);
    if (!Number.isFinite(pageNum) || !Number.isFinite(lim) || pageNum < 0 || lim <= 0) {
      return res.status(200).json({ code: 0, msg: "No more data", data: { gameslist: [] }, status: false });
    }

    const [users] = await connection.query(
      "SELECT id_user, phone, money, total_money, status, time FROM users WHERE veri = 1 AND level = 0 AND ctv = ? ORDER BY id DESC LIMIT ? OFFSET ?",
      [userInfo.phone, lim, pageNum]
    );
    const [total_users] = await connection.query(
      "SELECT id FROM users WHERE veri = 1 AND level = 0 AND ctv = ?",
      [userInfo.phone]
    );

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: users,
      page_total: Math.ceil(total_users.length / lim),
    });
  } catch (error) {
    console.error("listMember error:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== LIST RECHARGE / WITHDRAW (CTV's members, bulk) ====================
const listRechargeP = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const userInfo = await getUserByToken(auth);
    if (!userInfo) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [list_mem] = await connection.query(
      "SELECT phone FROM users WHERE ctv = ? AND status = 1 AND veri = 1",
      [userInfo.phone]
    );

    let list_recharge_news = [];
    if (list_mem.length) {
      const phones = list_mem.map((u) => u.phone);
      const [recharges] = await connection.query(
        "SELECT * FROM recharge WHERE phone IN (?) ORDER BY id DESC LIMIT 100",
        [phones]
      );
      list_recharge_news = recharges;
    }

    return res.status(200).json({
      message: "Success",
      status: true,
      list_recharge_news,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("listRechargeP error:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

const listWithdrawP = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const userInfo = await getUserByToken(auth);
    if (!userInfo) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [list_mem] = await connection.query(
      "SELECT phone FROM users WHERE ctv = ? AND status = 1 AND veri = 1",
      [userInfo.phone]
    );

    let list_withdraw_news = [];
    if (list_mem.length) {
      const phones = list_mem.map((u) => u.phone);
      const [withdraws] = await connection.query(
        "SELECT * FROM withdraw WHERE phone IN (?) ORDER BY id DESC LIMIT 100",
        [phones]
      );
      list_withdraw_news = withdraws;
    }

    return res.status(200).json({
      message: "Success",
      status: true,
      list_withdraw_news,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("listWithdrawP error:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== GENERIC MEMBER PAGINATION ====================
const makeListByPhoneTable = (table, extraFilter = "") => async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const phone = req.params.phone;
    const { pageno, limit } = req.body;

    const pageNum = Number(pageno);
    const lim = Number(limit);
    if (!Number.isFinite(pageNum) || !Number.isFinite(lim) || pageNum < 0 || lim <= 0) {
      return res.status(200).json({ code: 0, msg: "No more data", data: { gameslist: [] }, status: false });
    }
    if (!phone) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [user] = await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);
    const authInfo = await getUserByToken(auth);

    if (!user.length || !authInfo) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const { token, password, otp, level, ...safeUserInfo } = user[0];
    if (authInfo.phone !== safeUserInfo.ctv) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const whereExtra = extraFilter ? ` AND ${extraFilter}` : "";
    const [rows] = await connection.query(
      `SELECT * FROM ${table} WHERE phone = ?${whereExtra} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [phone, lim, pageNum]
    );
    const [totalRows] = await connection.query(
      `SELECT id FROM ${table} WHERE phone = ?${whereExtra}`,
      [phone]
    );

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: rows,
      page_total: Math.ceil(totalRows.length / lim),
    });
  } catch (error) {
    console.error(`${table} list error:`, error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

const listRechargeMem = makeListByPhoneTable("recharge");
const listWithdrawMem = makeListByPhoneTable("withdraw");
const listBet = makeListByPhoneTable("minutes_1", "status != 0");

// ==================== LIST RED ENVELOPE (paginated) ====================
const listRedenvelope = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const phone = req.params.phone;
    const { pageno, limit } = req.body;

    const pageNum = Number(pageno);
    const lim = Number(limit);
    if (!Number.isFinite(pageNum) || !Number.isFinite(lim) || pageNum < 0 || lim <= 0) {
      return res.status(200).json({ code: 0, msg: "No more data", data: { gameslist: [] }, status: false });
    }
    if (!phone) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [user] = await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);
    const authInfo = await getUserByToken(auth);

    if (!user.length || !authInfo) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const { token, password, otp, level, ...safeUserInfo } = user[0];
    if (authInfo.phone !== safeUserInfo.ctv) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [redenvelopes_used] = await connection.query(
      "SELECT * FROM redenvelopes_used WHERE phone_used = ? ORDER BY id DESC LIMIT ? OFFSET ?",
      [phone, lim, pageNum]
    );
    const [total_users] = await connection.query(
      "SELECT id FROM redenvelopes_used WHERE phone_used = ?",
      [phone]
    );

    return res.status(200).json({
      message: "Success",
      status: true,
      datas: redenvelopes_used,
      page_total: Math.ceil(total_users.length / lim),
    });
  } catch (error) {
    console.error("listRedenvelope error:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== BUFF MONEY (CTV balance transfer) ====================
const buffMoney = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const { username: id_user, select, money: rawMoney } = req.body;
    const money = Number(rawMoney);

    if (!id_user || !select || !Number.isFinite(money) || money <= 0) {
      return res.status(200).json({ message: "Fail", status: false });
    }

    const [users] = await connection.query("SELECT * FROM users WHERE id_user = ?", [id_user]);
    const authInfo = await getUserByToken(auth);

    if (!users.length || !authInfo) {
      return res.status(200).json({ message: "Account does not exist", status: false });
    }
    const userInfo = users[0];

    const [point_list] = await connection.query(
      "SELECT `money_us`, `money` FROM point_list WHERE phone = ?",
      [authInfo.phone]
    );
    const check = Number(point_list[0]?.money_us || 0);

    const time = Date.now();

    if (select == "1") {
      if (check - money < 0) {
        return res.status(200).json({ message: "Insufficient balance", status: false });
      }

      await connection.query("UPDATE users SET money = money + ? WHERE phone = ?", [money, userInfo.phone]);
      await connection.query("UPDATE point_list SET money_us = money_us - ? WHERE phone = ?", [money, authInfo.phone]);
      await connection.query(
        "INSERT INTO financial_details SET phone = ?, phone_used = ?, money = ?, type = ?, time = ?",
        [authInfo.phone, userInfo.phone, money, "1", time]
      );

      const [moneyN] = await connection.query("SELECT `money_us` FROM point_list WHERE phone = ?", [authInfo.phone]);
      return res.status(200).json({
        message: "Success",
        status: true,
        money: moneyN[0].money_us,
      });
    }

    // select == 2: pull from member's wallet into CTV's point_list
    await connection.query("UPDATE users SET money = money - ? WHERE phone = ?", [money, userInfo.phone]);
    await connection.query("UPDATE point_list SET money = money + ? WHERE phone = ?", [money, authInfo.phone]);
    await connection.query(
      "INSERT INTO financial_details SET phone = ?, phone_used = ?, money = ?, type = ?, time = ?",
      [authInfo.phone, userInfo.phone, money, "2", time]
    );

    return res.status(200).json({ message: "Success", status: true });
  } catch (error) {
    console.error("buffMoney error:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== EXPORTS ====================
module.exports = {
  buffMoney,
  dailyPage,
  middlewareDailyController,
  userInfo,
  statistical,
  listMeber,
  profileMember,
  infoCtv,
  infoCtv2,
  settingPage,
  giftPage,
  support,
  settings,
  createBonus,
  listRedenvelops,
  listMember,
  listRecharge,
  listWithdraw,
  listRechargeP,
  listWithdrawP,
  pageInfo,
  listRechargeMem,
  listWithdrawMem,
  listRedenvelope,
  listBet,
  getAgentPerformance,
  salary,
};