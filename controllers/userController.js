import crypto from "crypto";
import fs from "fs";
import md5 from "md5";
import path from "path";
import QRCode from "qrcode";
import querystring from "querystring";
import request from "request";
import util from "util";
import axios from "axios";
import connection from "../config/connectDB";
import nodemailer from "nodemailer";
const moment = require("moment-timezone");

// ==================== UTILITY FUNCTIONS ====================

const timeNow = Date.now();

const randomNumber = (min, max) => {
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

const formateT = (params) => {
  return params < 10 ? "0" + params : params;
};

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
  const getPart = (type) => parts.find((part) => part.type === type).value;

  return `${getPart("year")}-${getPart("month")}-${getPart("day")} ${getPart("hour")}:${getPart("minute")}:${getPart("second")}`;
}

function timerJoin(params = "", addHours = 0) {
  let date = params ? new Date(Number(params)) : new Date();
  date.setHours(date.getHours() + addHours);

  let years = formateT(date.getFullYear());
  let months = formateT(date.getMonth() + 1);
  let days = formateT(date.getDate());
  let hours = date.getHours() % 12;
  hours = hours === 0 ? 12 : hours;
  let ampm = date.getHours() < 12 ? "AM" : "PM";
  let minutes = formateT(date.getMinutes());
  let seconds = formateT(date.getSeconds());

  return `${years}-${months}-${days} ${hours}:${minutes}:${seconds} ${ampm}`;
}

function timerJoin4(params = "", addHours = 0) {
  let date = params ? new Date(Number(params)) : new Date();
  date.setHours(date.getHours() + addHours);
  return `${formateT(date.getFullYear())}-${formateT(date.getMonth() + 1)}-${formateT(date.getDate())}`;
}

function generateOrderId() {
  const prefix = "WD";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(Math.random() * 90000000000000) + 10000000000000;
  const suffix = String.fromCharCode(97 + Math.floor(Math.random() * 26));
  return `${prefix}${date}${randomPart}${suffix}`;
}

function getRechargeOrderId() {
  const date = new Date();
  const id_time = `${date.getUTCFullYear()}${date.getUTCMonth() + 1}${date.getUTCDate()}`;
  const id_order = Math.floor(Math.random() * 90000000000000) + 10000000000000;
  return id_time + id_order;
}

function generateSign(params, secretKey) {
  const paramString = Object.keys(params)
    .sort()
    .filter((key) => key !== "sign")
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto.createHash("md5").update(`${paramString}&key=${secretKey}`).digest("hex");
}

function md5Sign2(params, key) {
  const sortedKeys = Object.keys(params).sort();
  const signStr =
    sortedKeys
      .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== "")
      .map((k) => `${k}=${params[k]}`)
      .join("&") + `&key=${key}`;
  return crypto.createHash("md5").update(signStr).digest("hex").toUpperCase();
}

const generateQRCode = async (data) => {
  try {
    return await QRCode.toDataURL(data);
  } catch (err) {
    console.error("Error generating QR code:", err);
    return null;
  }
};

async function makePostRequest(url, data) {
  try {
    const response = await axios.post(url, querystring.stringify(data), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  } catch (error) {
    throw {
      message: error.message,
      status: error.response?.status || 500,
      trexopayError: error.response?.data || null,
    };
  }
}

async function logUserAction({ user_phone, action_type, action_id, money, status, ip_address, user_agent, info }) {
  try {
    await connection.execute(
      `INSERT INTO user_action_log (user_phone, action_type, action_id, money, status, ip_address, user_agent, info) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_phone, action_type, action_id, money, status, ip_address, user_agent, info]
    );
  } catch (err) {
    console.error("Log user action error:", err.message);
  }
}

// ==================== HELPER: Get User by Token ====================
const getUserByToken = async (token, fields = "*") => {
  const [rows] = await connection.query(
    `SELECT ${fields} FROM users WHERE token = ?`,
    [token]
  );
  return rows[0] || null;
};

// ==================== CONTROLLERS ====================

const userInfo = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({ message: "Token undefined", status: false, timeStamp: timeNow });
    }

    const [users] = await connection.execute("SELECT * FROM users WHERE token = ?", [auth]);
    if (!users.length) {
      return res.status(200).json({ message: "Invalid token", status: false, timeStamp: timeNow });
    }

    const [settings] = await connection.query("SELECT telegram, cskh FROM admin");
    const telegram = settings.length ? settings[0].telegram : "";

    const {
      code, id_user, name_user, money, userPhoto, vip_level, rank, rebate, level,
      isdemo, recharge, totalRecharge, totalWithdraw, message, email,
    } = users[0];
    const phone = users[0].phone;

    const origin = req.protocol + "://" + req.get("host");
    const qrs = await generateQRCode(`${origin}/#/register?r_code=${code}`);

    return res.status(200).json({
      message: "User Details Successful",
      status: true,
      money: parseFloat(money),
      data: {
        code, id_user, name_user, phone_user: phone, money_user: parseFloat(money),
        userPhoto, rebate, isdemo, rank, level, vip_level, recharge, telegram,
        totalRecharge, totalWithdraw, betAmount: 0, message, email, qrs,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message, status: false });
  }
};

const addutr = async (req, res) => {
  try {
    const { utr, id } = req.body;
    await connection.execute("UPDATE recharge SET utr=? WHERE id=?", [utr, id]);

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: "666damangame91@gmail.com", pass: "Delhi@123" },
    });

    transporter.sendMail(
      {
        from: "damangame91@gmail.com",
        to: "adarshpushpendra@gmail.com",
        subject: "Test Email",
        text: "This is a test email sent from Node.js using nodemailer.",
      },
      (error) => { if (error) console.log(error); }
    );

    return res.status(200).json({ message: "Recharge Successfully!", status: true, timeStamp: timeNow });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

const verifyCode = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const now = new Date().getTime();
    const timeEnd = +new Date() + 1000 * (60 * 2 + 0) + 500;
    const otp = randomNumber(100000, 999999);

    const [rows] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);
    if (!rows.length) {
      return res.status(200).json({ message: "Account does not exist", status: false, timeStamp: timeNow });
    }

    const user = rows[0];
    if (user.time_otp - now <= 0) {
      request(
        `http://47.243.168.18:9090/sms/batch/v2?appkey=NFJKdK&appsecret=brwkTw&phone=84${user.phone}&msg=Your verification code is ${otp}&extend=${now}`,
        async (error, response, body) => {
          const data = JSON.parse(body);
          if (data.code == "00000") {
            await connection.execute("UPDATE users SET otp = ?, time_otp = ? WHERE phone = ?", [otp, timeEnd, user.phone]);
            return res.status(200).json({ message: "Submitted successfully", status: true, timeStamp: timeNow, timeEnd });
          }
        }
      );
    } else {
      return res.status(200).json({ message: "Send SMS regularly.", status: false, timeStamp: timeNow });
    }
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const aviator = async (req, res) => {
  const auth = req.cookies.auth;
  res.redirect(`https://avi.bdg-club.com/theninja/src/api/userapi.php?action=loginandregisterbyauth&token=${auth}`);
};

const changeUser = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const name = req.body.name;

    const [rows] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);
    if (!rows.length || !name) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    await connection.query("UPDATE users SET name_user = ? WHERE token = ?", [name, auth]);
    return res.status(200).json({ message: "Username modification successful", status: true, timeStamp: timeNow });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const changeUserPhoto = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const photo = req.body.photo;

    const [rows] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);
    if (!rows.length || !photo) {
      return res.status(200).json({ message: "Invalid photo", status: false, timeStamp: timeNow });
    }

    await connection.query("UPDATE users SET userPhoto = ? WHERE token = ?", [photo, auth]);
    return res.status(200).json({ message: "User profile modification successful", status: true, timeStamp: timeNow });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const changePassword = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const { password, newPassWord, cPassWord } = req.body;

    if (!password || !newPassWord) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [rows] = await connection.query("SELECT * FROM users WHERE token = ? AND password = ?", [auth, md5(password)]);
    if (rows.length == 0) {
      return res.status(200).json({ message: "Incorrect password", status: false, timeStamp: timeNow });
    }

    if (newPassWord !== cPassWord) {
      return res.status(200).json({ message: "Incorrect confirm password", status: false });
    }

    await connection.query(
      "UPDATE users SET otp = ?, password = ?, plain_password = ? WHERE token = ?",
      [randomNumber(100000, 999999), md5(newPassWord), newPassWord, auth]
    );

    return res.status(200).json({ message: "Password modification successful", status: true, timeStamp: timeNow });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== CHECK-IN HANDLING (REFACTORED) ====================
const checkInHandling = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const data = req.body.data;

    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [rows] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);
    if (!rows.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [attendencs_bonus] = await connection.query("SELECT * FROM `attendencs-bonus`");
    const attendencsDta = attendencs_bonus[0];
    const userPhone = rows[0].phone;

    const [point_list] = await connection.query("SELECT * FROM point_list WHERE phone = ?", [userPhone]);
    const [historys] = await connection.query("SELECT * FROM attendance_history WHERE phone = ?", [userPhone]);

    if (!data) {
      return res.status(200).json({
        messages: "No More Data",
        datas: point_list[0],
        data: historys,
        status: true,
        timeStamp: timeNow,
      });
    }

    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    if (formattedDate === point_list[0]?.today) {
      return res.status(200).json({ message: "You have already received this gift", status: false, timeStamp: timeNow });
    }

    const dayKey = `day${data}rech`;
    const totalKey = `total${data}`;
    const get = Number(attendencsDta[dayKey]);
    const pointValue = point_list[0]?.[totalKey];

    if (pointValue == 0) {
      return res.status(200).json({ message: "You have already received this gift", status: false, timeStamp: timeNow });
    }

    const [recharge] = await connection.query(
      "SELECT SUM(money) AS totalMoney FROM recharge WHERE phone = ? AND status=1 AND DATE(today) = ?",
      [userPhone, formattedDate]
    );

    const check = Number(recharge[0].totalMoney) || 0;

    if (check < get) {
      return res.status(200).json({
        message: `Please Recharge ₹ ${get} to claim gift.`,
        status: false,
        timeStamp: timeNow,
      });
    }

    // Process reward
    await connection.query("UPDATE users SET money = money + ? WHERE phone = ?", [pointValue, userPhone]);
    await connection.query(`UPDATE point_list SET ${totalKey} = ?, today = ? WHERE phone = ?`, [0, formattedDate, userPhone]);
    await connection.query("INSERT INTO attendance_history SET phone = ?,amount=?,status=?,date=?", [userPhone, pointValue, 1, formattedDate]);
    await connection.query(
      "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?",
      [userPhone, "Attendance bonus", pointValue, formattedDate]
    );

    return res.status(200).json({ message: `You just received ₹ ${pointValue}.00`, status: true, timeStamp: timeNow });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== REBATE ====================
const rebateCreate = async (req, res) => {
  try {
    const { amount } = req.body;
    const auth = req.cookies.auth;

    if (amount <= 0) {
      return res.status(200).json({ message: "Amount is not", status: false, timeStamp: timeNow });
    }

    const [rows] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);
    if (!rows.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const sumdate = timerJoin2(Date.now());
    const commission = (amount * parseFloat(rows[0].rebetRet)) / 100;

    await connection.query(
      "INSERT INTO rebate SET phone = ?,amount=?,rate=?,commission=?,type=?, status=?,today=?",
      [rows[0].phone, amount, parseFloat(rows[0].rebetRet) / 100, commission, "Slotes", 1, sumdate]
    );

    await connection.execute(
      "UPDATE users SET money = money + ?, rebate = rebate - ? WHERE token = ?",
      [commission, amount, auth]
    );

    return res.status(200).json({ message: `You just received successful`, status: true, timeStamp: timeNow });
  } catch (error) {
    return res.status(500).json({ message: "internal server error", status: false, timeStamp: timeNow });
  }
};

const getRebate = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const [rows] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);
    if (!rows.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const data = await connection.query("SELECT * FROM rebate WHERE phone = ?", [rows[0].phone]);
    return res.status(200).json({ message: "You just received successful", status: true, data: data[0] });
  } catch (error) {
    return res.status(500).json({ message: "internal server error", status: false, timeStamp: timeNow });
  }
};

// ==================== PROMOTION ====================
const promotion = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [user] = await connection.query(
      "SELECT phone, code, invite, roses_f, roses_f1, roses_today FROM users WHERE token = ?",
      [auth]
    );
    const [level] = await connection.query("SELECT * FROM level");

    if (!user.length) {
      return res.status(200).json({ message: "Invalid user", status: false, timeStamp: timeNow });
    }

    const userInfo = user[0];

    const [f1s] = await connection.query(
      "SELECT phone, code, invite, time FROM users WHERE invite = ?",
      [userInfo.code]
    );

    let f1_today = 0;
    let f_all_today = 0;

    for (const f1 of f1s) {
      if (timerJoin(f1.time) === timerJoin()) {
        f1_today++;
        f_all_today++;
      }
      const [f2s] = await connection.query("SELECT phone, code, invite, time FROM users WHERE invite = ?", [f1.code]);
      for (const f2 of f2s) {
        if (timerJoin(f2.time) === timerJoin()) f_all_today++;
        const [f3s] = await connection.query("SELECT phone, code, invite, time FROM users WHERE invite = ?", [f2.code]);
        for (const f3 of f3s) {
          if (timerJoin(f3.time) === timerJoin()) f_all_today++;
          const [f4s] = await connection.query("SELECT phone, code, invite, time FROM users WHERE invite = ?", [f3.code]);
          for (const f4 of f4s) {
            if (timerJoin(f4.time) === timerJoin()) f_all_today++;
          }
        }
      }
    }

    let f2 = 0, f3 = 0, f4 = 0;
    for (const f1 of f1s) {
      const [f2s] = await connection.query("SELECT phone, code, invite FROM users WHERE invite = ?", [f1.code]);
      f2 += f2s.length;
      for (const f2u of f2s) {
        const [f3s] = await connection.query("SELECT phone, code, invite FROM users WHERE invite = ?", [f2u.code]);
        f3 += f3s.length;
        for (const f3u of f3s) {
          const [f4s] = await connection.query("SELECT phone, code, invite FROM users WHERE invite = ?", [f3u.code]);
          f4 += f4s.length;
        }
      }
    }

    let selectedData = [];
    let level2to6activeuser = 0;
    const previousDate = new Date();
    previousDate.setDate(previousDate.getDate() - 1);
    const currentDate = previousDate.toISOString().slice(0, 10);

    async function fetchInvitesByCode(code, depth = 1) {
      if (depth > 10) return;
      const [inviteData] = await connection.query(
        "SELECT id_user,name_user,phone, code, invite, rank, user_level, total_money FROM users WHERE invite = ?",
        [code]
      );
      const [level2to6activeuser_today] = await connection.query(
        "SELECT phone, code, invite, time FROM users WHERE invite = ? AND DATE(today) = ?",
        [code, currentDate]
      );
      if (level2to6activeuser_today.length > 0) level2to6activeuser += level2to6activeuser_today.length;
      for (const invite of inviteData) {
        selectedData.push(invite);
        await fetchInvitesByCode(invite.code, depth + 1);
      }
    }

    const [level1_today_rows] = await connection.query(
      "SELECT phone, code, invite, time FROM users WHERE invite = ?",
      [userInfo.code]
    );
    const [level1_today_rows_today] = await connection.query(
      "SELECT phone, code, invite, time FROM users WHERE invite = ? AND DATE(today) = ?",
      [userInfo.code, currentDate]
    );

    let totalDepositCount = 0, totalDepositAmount = 0, firstDepositCount = 0;

    for (const u of level1_today_rows) {
      await fetchInvitesByCode(u.code);
      const [deposits] = await connection.query(
        "SELECT id,id_order,transaction_id,utr,phone,money,type,status,today,url,time FROM recharge WHERE phone = ? AND DATE(today) = ? AND status = 1",
        [u.phone, currentDate]
      );
      totalDepositCount += deposits.length;
      deposits.forEach((d) => { totalDepositAmount += parseFloat(d.money); });
      if (deposits.length > 0) firstDepositCount++;
    }

    let level2_to_level6totalDepositCount = 0;
    let level2_to_level6totalDepositAmount = 0;
    let level2_to_level6firstDepositCount = 0;
    let level2_to_level6count = 0;

    for (const u of selectedData) {
      const [deposits] = await connection.query(
        "SELECT id,id_order,transaction_id,utr,phone,money,type,status,today,url,time FROM recharge WHERE phone = ? AND DATE(today) = ? AND status = 1",
        [u.phone, currentDate]
      );
      level2_to_level6count++;
      deposits.forEach((d) => { level2_to_level6totalDepositAmount += parseFloat(d.money); });
      if (deposits.length > 0) level2_to_level6firstDepositCount++;
      level2_to_level6totalDepositCount += deposits.length;
    }

    const [level1CountResult] = await connection.query(
      "SELECT COUNT(*) AS count FROM users WHERE invite = ?",
      [userInfo.code]
    );
    const level1Count = level1CountResult[0].count;

    // Count downline recursive
    async function countDownline(code, depth, end, visited) {
      if (depth > end || visited.has(code)) return 0;
      visited.add(code);
      let totalUsers = 1;
      const [inviteData] = await connection.query("SELECT DISTINCT code FROM users WHERE invite = ?", [code]);
      for (const invite of inviteData) {
        totalUsers += await countDownline(invite.code, depth + 1, end, visited);
      }
      return totalUsers;
    }

    const downlineCount = await countDownline(userInfo.code, 1, 10, new Set());

    const total_today_count = level2_to_level6count + level1_today_rows.length;
    const rosesF1 = parseFloat(userInfo.roses_f) || 0;
    const rosesAll = parseFloat(userInfo.roses_f1) || 0;

    return res.status(200).json({
      message: "Receive success",
      info: user,
      level1Count,
      status: true,
      total_today_count,
      level1_count: level1_today_rows_today.length,
      level1_today_rows,
      totalDepositCount,
      currentDate,
      totalDepositAmount,
      firstDepositCount,
      level2_to_level6count: level2to6activeuser,
      level2_to_level6totalDepositCount,
      level2_to_level6totalDepositAmount,
      level2_to_level6firstDepositCount,
      total_downline_count: downlineCount - 1,
      invite: {
        f1: f1s.length,
        total_f: selectedData.length,
        f1_today,
        f_all_today,
        roses_f1: userInfo.roses_f1,
        roses_f: userInfo.roses_f,
        roses_all: rosesF1 + rosesAll,
        roses_today: userInfo.roses_today,
      },
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(200).json({ message: error.message, status: false, timeStamp: timeNow });
  }
};

// ==================== TRANSACTION HISTORY ====================
const transactionHistory = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [user] = await connection.query("SELECT phone FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const limit = parseInt(req.query.limit) || 300;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const [data] = await connection.query(
      "SELECT * FROM transaction_history WHERE phone = ? ORDER BY id DESC LIMIT ? OFFSET ?",
      [user[0].phone, limit, offset]
    );

    // Cleanup old data
    await connection.query(
      "DELETE FROM transaction WHERE phone = ? AND today < DATE_SUB(NOW(), INTERVAL 1 MONTH)",
      [user[0].phone]
    );
    const sevenDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    await connection.query("DELETE FROM roses WHERE phone = ? AND time < ?", [user[0].phone, sevenDaysAgo]);

    return res.status(200).send({
      success: true,
      message: "Get transaction history successfully",
      data,
      page,
      limit,
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: "Server error" });
  }
};

// ==================== TOTAL COMMISSION ====================
const totalCommission = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [user] = await connection.query(
      "SELECT phone, code, invite, roses_f, roses_f1, roses_today FROM users WHERE token = ?",
      [auth]
    );
    if (!user.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const formattedToday = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedDate = yesterday.toISOString().split("T")[0];
    const sevenDaysBeforeYesterday = new Date();
    sevenDaysBeforeYesterday.setDate(sevenDaysBeforeYesterday.getDate() - 7);
    const formattedSevenDaysAgo = sevenDaysBeforeYesterday.toISOString().split("T")[0];

    const [totalCommissionBeforeToday] = await connection.execute(
      `SELECT SUM(commission) AS total FROM subordinatedata WHERE phone = ? AND type = "bet commission" AND DATE(date) < ?`,
      [user[0].phone, formattedToday]
    );

    const [datas] = await connection.execute(
      `SELECT commission FROM subordinatedata WHERE phone = ? AND DATE(date) = ? AND type = "bet commission"`,
      [user[0].phone, formattedDate]
    );

    const [weeks] = await connection.execute(
      `SELECT commission FROM subordinatedata WHERE phone = ? AND DATE(date) BETWEEN ? AND ? AND type = "bet commission"`,
      [user[0].phone, formattedSevenDaysAgo, formattedDate]
    );

    return res.status(200).send({
      success: true,
      message: "Transaction commissions retrieved successfully",
      totalBalance: totalCommissionBeforeToday[0]?.total || 0,
      yesterdayBalance: datas.reduce((sum, r) => sum + (parseFloat(r.commission) || 0), 0),
      weekBalance: weeks.reduce((sum, r) => sum + (parseFloat(r.commission) || 0), 0),
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: "Server error" });
  }
};

// ==================== MY TEAM ====================
const myTeam = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }
    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE token = ?", [auth]);
    const [level] = await connection.query("SELECT * FROM level");
    if (!user.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }
    return res.status(200).json({ message: "Receive success", level, info: user, status: true, timeStamp: timeNow });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== LIST MY TEAM ====================
const listMyTeam = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const userInfo = user[0];
    const [f1] = await connection.query(
      "SELECT id_user, phone, code, invite, roses_f, rank, name_user, status, total_money, time FROM users WHERE invite = ? ORDER BY id DESC",
      [userInfo.code]
    );
    const [mem] = await connection.query(
      "SELECT id_user, phone, time FROM users WHERE invite = ? ORDER BY id DESC LIMIT 100",
      [userInfo.code]
    );
    const [total_roses] = await connection.query(
      "SELECT f1, invite, code, phone, time FROM roses WHERE invite = ? ORDER BY id DESC LIMIT 100",
      [userInfo.code]
    );

    const selectedData = [];
    async function fetchUserDataByCode(code, depth = 1) {
      if (depth > 6) return;
      const [userData] = await connection.query(
        "SELECT id_user, name_user, phone, code, invite, rank, total_money FROM users WHERE invite = ?",
        [code]
      );
      for (const u of userData) {
        const [turnoverData] = await connection.query(
          "SELECT phone, daily_turn_over, total_turn_over FROM turn_over WHERE phone = ?",
          [u.phone]
        );
        const [inviteCountData] = await connection.query(
          "SELECT COUNT(*) as invite_count FROM users WHERE invite = ?",
          [u.code]
        );
        selectedData.push({
          ...u,
          invite_count: inviteCountData[0].invite_count,
          user_level: depth,
          daily_turn_over: turnoverData[0]?.daily_turn_over || 0,
          total_turn_over: turnoverData[0]?.total_turn_over || 0,
        });
        await fetchUserDataByCode(u.code, depth + 1);
      }
    }

    await fetchUserDataByCode(userInfo.code);

    const newMem = mem.map((data) => ({
      id_user: data.id_user,
      phone: "91" + data.phone.slice(0, 1) + "****" + String(data.phone.slice(-4)),
      time: data.time,
    }));

    return res.status(200).json({
      message: "Receive success",
      f1: selectedData,
      f1_direct: f1,
      mem: newMem,
      total_roses,
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== RECHARGE ====================
const recharge = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const { amount: money, type, typeid, utr } = req.body;

    if (type !== "cancel" && type !== "submit" && type !== "submitauto") {
      if (!auth || !money || money <= 299) {
        return res.status(200).json({ message: "Minimum recharge 300", status: false, timeStamp: timeNow });
      }
    }

    const [user] = await connection.query("SELECT phone, code, invite, isdemo FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const userInfo = user[0];
    const checkTime = timerJoin2(Date.now());
    const date = new Date();
    const id_time = `${date.getUTCFullYear()}${date.getUTCMonth() + 1}${date.getUTCDate()}`;
    const id_order = Math.floor(Math.random() * 90000000000000) + 10000000000000;
    const client_transaction_id = id_time + id_order;
    const moneyNum = Number(money);

    if (userInfo.isdemo === 1) {
      await connection.execute(
        "INSERT INTO recharge SET id_order=?, transaction_id=?, phone=?, money=?, type=?, status=?, today=?, url=?, time=?, isdemo=?",
        [client_transaction_id, "0", userInfo.phone, moneyNum, type, 1, checkTime, "1", timerJoin2(Date.now()), 1]
      );
      await connection.execute("UPDATE users SET money = money + ? WHERE phone = ?", [moneyNum, userInfo.phone]);
      return res.status(200).json({ message: "Demo Amount is added", status: false, timeStamp: timeNow });
    }

    if (type === "bank") {
      return res.status(200).json({
        message: "Order creation successful",
        pay: true,
        phone: userInfo.phone,
        orderid: client_transaction_id,
        status: true,
        timeStamp: timeNow,
      });
    }

    if (type === "submit") {
      const [utrcount] = await connection.query("SELECT * FROM recharge WHERE utr = ?", [utr]);
      if (utrcount.length === 0) {
        await connection.query(
          "UPDATE recharge SET utr = ?, userStatus=1 WHERE phone = ? AND id_order = ? AND status = ?",
          [utr, userInfo.phone, typeid, 0]
        );
        return res.status(200).json({ message: "Submit successful", status: true, timeStamp: timeNow });
      }
      return res.status(200).json({ message: "UTR already submitted", status: true, timeStamp: timeNow });
    }

    await connection.execute(
      "INSERT INTO recharge SET id_order=?, transaction_id=?, phone=?, money=?, type=?, status=?, today=?, url=?, time=?, userStatus=?",
      [client_transaction_id, "0", userInfo.phone, moneyNum, type, 0, checkTime, "0", timerJoin2(Date.now()), 0]
    );

    return res.status(200).json({
      message: "Order creation successful",
      pay: true,
      orderid: client_transaction_id,
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== HANDLE CALLBACK ====================
const handleCallback = async (req, res) => {
  const { order_id, status } = req.body;

  if (!order_id || !status) {
    return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
  }

  try {
    if (status === "success") {
      const [checkRecharge] = await connection.query(
        "SELECT * FROM recharge WHERE id_order = ? AND status = 1",
        [order_id]
      );

      if (checkRecharge.length >= 1) {
        return res.status(400).json({ message: "Recharge already succeeded", status: false });
      }

      const [info] = await connection.query("SELECT * FROM recharge WHERE id_order = ?", [order_id]);
      if (info.length === 0) {
        return res.status(404).json({ message: "Recharge not found", status: false });
      }

      const [user] = await connection.query("SELECT * FROM users WHERE phone = ?", [info[0].phone]);
      const userInfo = user[0];
      const checkTime = timerJoin2(Date.now());

      const [Firstrecharge] = await connection.query(
        "SELECT * FROM recharge WHERE phone = ? AND status = ?",
        [info[0].phone, 1]
      );

      const [result] = await connection.execute("SELECT * FROM rechargeBonus ORDER BY id DESC");

      if (Firstrecharge.length === 0) {
        let bonus = 0;
        for (const element of result) {
          if (parseInt(element.is_fisrtrecharge) === 1) {
            if (info[0].money === parseFloat(element.recAmount)) {
              bonus = parseFloat(element.bonus);
              break;
            }
          } else if (parseInt(element.is_persent) === 1) {
            bonus = (info[0].money * parseFloat(element.bonus)) / 100;
            break;
          }
        }

        await connection.execute(
          "INSERT INTO transaction SET purpose=?, phone=?, money=?, type=?, status=?, level=?, today=?, time=?",
          ["Big Recharge Bonus", info[0].phone, bonus, "credit", 1, 1, checkTime, checkTime]
        );
        await connection.query(
          "UPDATE users SET money = money + ?, total_money = total_money + ?, recharge=recharge+? WHERE phone = ?",
          [bonus, bonus, bonus, info[0].phone]
        );
        await connection.query(
          "INSERT INTO transaction_history SET phone=?, detail=?, balance=?, time=?",
          [info[0].phone, "First deposit bonus", bonus, checkTime]
        );

        // Upline referral bonus
        const refferal = userInfo.invite;
        if (refferal) {
          const [refferaluser] = await connection.query("SELECT * FROM users WHERE code = ? LIMIT 1", [refferal]);
          if (refferaluser.length && refferaluser[0].phone) {
            const refBonus = info[0].money * 0.2;
            await connection.query(
              "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?",
              [refBonus, refBonus, refferaluser[0].phone]
            );
            await connection.query(
              "INSERT INTO transaction_history SET phone=?, detail=?, balance=?, time=?",
              [refferaluser[0].phone, "Bonus", refBonus, checkTime]
            );
          }
        }

        await connection.query("UPDATE recharge SET status = 1 WHERE id_order = ?", [order_id]);
      } else {
        await connection.query("UPDATE recharge SET status = 1 WHERE id_order = ?", [order_id]);
        await connection.query(
          "UPDATE users SET money = money + ?, total_money = total_money + ?, recharge=recharge+? WHERE phone = ?",
          [info[0].money, info[0].money, info[0].money, info[0].phone]
        );
        await connection.query(
          "INSERT INTO transaction_history SET phone=?, detail=?, balance=?, time=?",
          [info[0].phone, "Deposit", info[0].money, checkTime]
        );
      }

      return res.status(200).json({ message: "Application confirmed successfully", status: true, datas: info });
    }

    return res.status(400).json({ message: "Invalid type", status: false });
  } catch (e) {
    return res.status(500).json({ message: "Internal server error", status: false, error: e.message });
  }
};

// ==================== ONLINE RECHARGE ====================
const onlineRecharge = async (req, res) => {
  try {
    const token = req.cookies.auth;
    const money = Number(req.body.amount);
    const type = req.body.type;

    if (!token || !money || money <= 299) {
      return res.status(200).json({ message: "Minimum recharge 300", status: false, timeStamp: timeNow });
    }

    const [users] = await connection.query("SELECT phone, code, invite, isdemo FROM users WHERE token = ?", [token]);
    if (!users.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const userInfo = users[0];
    const checkTime = timerJoin2(Date.now());
    const time = timerJoin2(Date.now());

    if (userInfo.isdemo === 1) {
      const date = new Date();
      const id_time = `${date.getUTCFullYear()}${date.getUTCMonth() + 1}${date.getUTCDate()}`;
      const id_order = Math.floor(Math.random() * 90000000000000) + 10000000000000;
      const client_transaction_id = id_time + id_order;

      await connection.execute(
        "INSERT INTO recharge SET id_order=?, transaction_id=?, phone=?, money=?, type=?, status=?, today=?, url=?, time=?, isdemo=?",
        [client_transaction_id, "0", userInfo.phone, money, "demo", 1, checkTime, "1", time, 1]
      );
      await connection.execute("UPDATE users SET money = money + ? WHERE phone = ?", [money, userInfo.phone]);
      return res.status(200).json({ message: "Demo Amount is added", status: false, timeStamp: timeNow });
    }

    const domain = req.headers.host;
    const [rows] = await connection.execute("SELECT key_id FROM recharge_chennal");
    const channelKey = rows[0].key_id;

    const postData = {
      amount: money,
      user: userInfo.phone,
      auth: channelKey,
      callback: `${domain}/api/webapi/bhatclub_callback`,
      redirect_url: `${domain}/wallet/rechargerecord`,
    };

    const response = await axios.post("https://api.quikpay.live/api/payin2", postData, {
      headers: { "Content-Type": "application/json" },
    });

    const cleanResponse = response.data.substring(response.data.indexOf("{"));
    const jsonResponse = JSON.parse(cleanResponse);

    if (jsonResponse.status === "success") {
      const { url, order_id } = jsonResponse;
      await connection.execute(
        "INSERT INTO recharge SET id_order=?, transaction_id=?, phone=?, money=?, type=?, status=?, today=?, url=?, time=?, userStatus=?",
        [order_id, "0", userInfo.phone, money, type, 0, checkTime, url, time, 0]
      );
      return res.status(200).json({ success: true, message: "Recharge initiated successfully", data: jsonResponse });
    }

    return res.status(400).json({ success: false, message: jsonResponse.message || "Failed to initiate recharge" });
  } catch (error) {
    console.error("Error in recharge controller:", error.message);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

// ==================== CANCEL RECHARGE ====================
const cancelRecharge = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({ message: "Authorization is required!", status: false, timeStamp: timeNow });
    }

    const [user] = await connection.query("SELECT phone, code, name_user, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "Authorization is required!", status: false, timeStamp: timeNow });
    }

    const result = await connection.query("DELETE FROM recharge WHERE phone = ? AND status = ?", [user[0].phone, 0]);

    return res.status(200).json({
      message: result.affectedRows > 0
        ? "All the pending recharges has been deleted successfully!"
        : "There was no pending recharges for this user or delete operation has been failed!",
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("API error: ", error);
    return res.status(500).json({ message: "API Request failed!", status: false, timeStamp: timeNow });
  }
};

// ==================== ADD BANK ====================
const addBank = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const { name_bank, name_user, stk, ifsc: email, sdt, tinh, usdt: chi_nhanh } = req.body;
    const time = timerJoin2(Date.now());

    if (!auth || !name_bank || !name_user || !stk || !tinh) {
      return res.status(200).json({ message: "Please enter all field", status: false, timeStamp: timeNow });
    }

    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "Invalid user", status: false, timeStamp: timeNow });
    }

    const userInfo = user[0];
    const [user_bank] = await connection.query("SELECT * FROM user_bank WHERE tinh = ?", [tinh]);
    const [user_bank2] = await connection.query("SELECT * FROM user_bank WHERE phone = ?", [userInfo.phone]);

    if (tinh !== userInfo.phone) {
      return res.status(200).json({ message: "Invalid phone number", status: false });
    }

    if (user_bank2[0]?.stk >= 5) {
      return res.status(200).json({ message: "Bank Already updated", status: false });
    }

    if (user_bank.length == 0 && user_bank2.length == 0) {
      await connection.execute(
        "INSERT INTO user_bank SET phone=?, name_bank=?, name_user=?, stk=?, email=?, sdt=?, tinh=?, chi_nhanh=?, time=?",
        [userInfo.phone, name_bank, name_user, stk, email, "0", tinh, "0", time]
      );
      return res.status(200).json({ message: "Successfully added bank", status: true, timeStamp: timeNow });
    } else if (user_bank2.length > 0) {
      await connection.query(
        "UPDATE user_bank SET name_bank=?, name_user=?, stk=?, email=?, sdt=?, tinh=?, chi_nhanh=?, time=? WHERE phone=?",
        [name_bank, name_user, stk, email, "0", tinh, "0", time, userInfo.phone]
      );
      return res.status(200).json({ message: "your account is updated", status: true, timeStamp: timeNow });
    }
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== ADD USDT ====================
const addUSDT = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const { remarkType, sdt } = req.body;
    const time = timerJoin2(Date.now());

    if (!auth || !sdt || !remarkType) {
      return res.status(200).json({ message: "Please enter all field", status: false, timeStamp: timeNow });
    }

    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "Invalid user", status: false, timeStamp: timeNow });
    }

    const userInfo = user[0];
    const [user_bank2] = await connection.query("SELECT * FROM user_bank WHERE phone = ?", [userInfo.phone]);

    if (sdt.length == 0 && user_bank2.length == 0) {
      await connection.execute(
        "INSERT INTO user_bank SET phone=?, name_bank=?, name_user=?, stk=?, email=?, sdt=?, tinh=?, chi_nhanh=?, remarkType=?, time=?",
        [userInfo.phone, "0", "0", "0", "0", sdt, "0", "0", remarkType, time]
      );
      return res.status(200).json({ message: "Successfully added bank", status: true, timeStamp: timeNow });
    } else if (user_bank2.length > 0) {
      await connection.query("UPDATE user_bank SET sdt=?, remarkType=? WHERE phone=?", [sdt, remarkType, userInfo.phone]);
      return res.status(200).json({ message: "your account is updated", status: true, timeStamp: timeNow });
    }
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== INFO USER BANK (FIXED) ====================
const infoUserBank = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [user] = await connection.query("SELECT phone, code, invite, money FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const userInfo = user[0];
    const [recharge] = await connection.query("SELECT * FROM recharge WHERE phone = ? AND status = 1", [userInfo.phone]);
    const [minutes_1] = await connection.query("SELECT * FROM minutes_1 WHERE phone = ?", [userInfo.phone]);

    let total = 0, total2 = 0, fee = 0;
    recharge.forEach((data) => { total += parseFloat(data.money); });
    minutes_1.forEach((data) => { total2 += parseFloat(data.money); fee += parseFloat(data.fee); });

    let result = 0;
    if (total - total2 > 0) result = total - total2 - fee;
    result = Math.max(result, 0);

    const [userBank] = await connection.query("SELECT * FROM user_bank WHERE phone = ?", [userInfo.phone]);

    return res.status(200).json({
      message: "Received successfully",
      datas: userBank,
      userInfo: user,
      result,
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== WITHDRAWAL ====================
const withdrawal3 = async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress || "";
  const agent = req.headers["user-agent"] || "";
  let user_phone = null;
  const action_id = "1234567890";
  let action_status = "fail";
  let info = "";
  const money = req.body.money || null;

  try {
    const auth = req.cookies.auth;
    const { type, password } = req.body;
    const nowTime = Date.now();

    if (type === "USDT" && money < 850) {
      info = JSON.stringify({ reason: "usdt_below_min" });
      return res.status(200).json({ message: "withdraw amount $10 to $500", status: false, timeStamp: nowTime });
    }

    if (!auth || !money || money < 109) {
      info = JSON.stringify({ reason: "below_minimum" });
      return res.status(200).json({ message: "Minimum amount 110", status: false, timeStamp: nowTime });
    }

    const [user] = await connection.query(
      "SELECT * FROM users WHERE token = ? AND password = ?",
      [auth, md5(password)]
    );

    if (type === "BANK CARD" && money > 50000) {
      user_phone = user[0]?.phone || null;
      info = JSON.stringify({ reason: "bankcard_above_max" });
      return res.status(200).json({ message: "withdraw amount 110 to 50000", status: false, timeStamp: nowTime });
    }

    if (user.length == 0) {
      info = JSON.stringify({ reason: "invalid_user" });
      return res.status(200).json({ message: "Invalid user", status: false, timeStamp: nowTime });
    }

    const userInfo = user[0];
    user_phone = userInfo.phone;

    if (userInfo.enableWithdraw === 0) {
      info = JSON.stringify({ reason: "enableWithdraw_blocked" });
      return res.status(200).json({
        message: "Withdrawals are currently disabled. Please contact customer support.",
        status: false,
      });
    }

    const checkTime = timerJoin2(Date.now());
    const checkTime4 = timerJoin4(Date.now());
    const dates = timerJoin2(Date.now());

    const [recharge] = await connection.query("SELECT * FROM recharge WHERE phone = ? AND status = 1", [userInfo.phone]);
    const [minutes_1] = await connection.query("SELECT * FROM minutes_1 WHERE phone = ?", [userInfo.phone]);

    let total = 0, total2 = 0;
    recharge.forEach((d) => { total += parseFloat(d.money); });
    minutes_1.forEach((d) => { total2 += parseFloat(d.money); });

    let result = 0;
    if (total - total2 > 0) result = total - total2;
    result = Math.max(result, 0);

    const [user_bank] = await connection.query("SELECT * FROM user_bank WHERE phone = ?", [userInfo.phone]);
    const needbet = userInfo.recharge;
    const [withdraw] = await connection.query(
      "SELECT * FROM withdraw WHERE phone = ? AND DATE(today)=?",
      [userInfo.phone, checkTime4]
    );

    const [rowss] = await connection.query(
      "SELECT SUM(money) AS total_recharge FROM recharge WHERE phone = ? AND status = 1",
      [userInfo.phone]
    );

    if (!rowss[0].total_recharge || rowss[0].total_recharge < 200) {
      info = JSON.stringify({ reason: "insufficient_recharge" });
      return res.status(200).json({ message: "Need at least ₹200 recharge", status: false });
    }

    if (userInfo.isdemo === 1) {
      await connection.execute(
        "INSERT INTO withdraw SET id_order=?, phone=?, money=?, stk=?, sdt=?, type=?, usdt=?, name_bank=?, ifsc=?, name_user=?, status=?, today=?, time=?, isdemo=?",
        [action_id, userInfo.phone, money, "demo", "demo", "demo", "demo", "demo", "demo", "demo", "1", checkTime, dates, 1]
      );
      await connection.execute("UPDATE users SET money = money - ? WHERE phone = ?", [money, userInfo.phone]);
      action_status = "success";
      info = JSON.stringify({ type: "demo" });
      return res.status(200).json({
        message: "Withdrawal successful",
        status: true,
        money: userInfo.money - money,
        timeStamp: nowTime,
      });
    }

    if (user_bank.length === 0) {
      info = JSON.stringify({ reason: "no_bank_linked" });
      return res.status(200).json({ message: "Please link your bank first", status: false, timeStamp: nowTime });
    }

    if (withdraw.length >= 3) {
      info = JSON.stringify({ reason: "max_daily_withdraw" });
      return res.status(200).json({ message: "You can only make 2 withdrawals request per day", status: false, timeStamp: nowTime });
    }

    if (userInfo.money - money < 0) {
      info = JSON.stringify({ reason: "insufficient_balance" });
      return res.status(200).json({ message: "The balance is not enough to fulfill the request", status: false, timeStamp: nowTime });
    }

    if (needbet != 0) {
      info = JSON.stringify({ reason: "need_bet", result });
      return res.status(200).json({
        message: "The total bet is not enough to fulfill the request",
        status: false,
        result,
        timeStamp: nowTime,
      });
    }

    const infoBank = user_bank[0];
    await connection.execute(
      "INSERT INTO withdraw SET id_order=?, phone=?, money=?, stk=?, sdt=?, type=?, usdt=?, name_bank=?, ifsc=?, name_user=?, status=?, today=?, time=?",
      [action_id, userInfo.phone, money, infoBank.stk, infoBank.sdt, type, infoBank.chi_nhanh, infoBank.name_bank, infoBank.email, infoBank.name_user, 0, checkTime, dates]
    );
    await connection.execute("UPDATE users SET money = money - ? WHERE phone = ?", [money, userInfo.phone]);
    action_status = "success";
    info = JSON.stringify({ type });

    return res.status(200).json({
      message: "Withdrawal successful",
      status: true,
      money: userInfo.money - money,
      timeStamp: nowTime,
    });
  } catch (error) {
    info = JSON.stringify({ error: error.message });
    return res.status(500).json({ message: "Internal server error", status: false });
  } finally {
    if (user_phone || money) {
      await logUserAction({
        user_phone,
        action_type: "withdraw",
        action_id,
        money,
        status: action_status,
        ip_address: ip,
        user_agent: agent,
        info,
      });
    }
  }
};

// ==================== TRANSFER ====================
const transfer = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const amount = Number(req.body.amount);
    const receiver_phone = req.body.phone;
    const id_order = Math.floor(Math.random() * 90000000000000) + 10000000000000;
    const time = timerJoin2(Date.now());
    const client_transaction_id = id_order;

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(200).json({ message: "Invalid amount", status: false, timeStamp: timeNow });
    }

    const [user] = await connection.query("SELECT phone, money, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const userInfo = user[0];
    const sender_phone = userInfo.phone;
    const sender_money = parseInt(userInfo.money);

    const [recharge] = await connection.query("SELECT * FROM recharge WHERE phone = ? AND status = 1", [sender_phone]);
    const [minutes_1] = await connection.query("SELECT * FROM minutes_1 WHERE phone = ?", [sender_phone]);

    let total = 0, total2 = 0;
    recharge.forEach((d) => { total += Number(d.money); });
    minutes_1.forEach((d) => { total2 += Number(d.money); });

    let result = 0;
    if (total - total2 > 0) result = total - total2;

    if (result !== 0) {
      return res.status(200).json({ message: "The total bet is not enough to fulfill the request", status: false, timeStamp: timeNow });
    }

    if (sender_money < amount) {
      return res.status(200).json({ message: "Your balance is not enough", status: false, timeStamp: timeNow });
    }

    const [receiver] = await connection.query("SELECT * FROM users WHERE phone = ?", [receiver_phone]);
    if (receiver.length !== 1 || sender_phone === receiver_phone) {
      return res.status(200).json({ message: `${receiver_phone} is not a valid user mobile number`, status: false, timeStamp: timeNow });
    }

    await connection.execute("INSERT INTO balance_transfer (sender_phone, receiver_phone, amount) VALUES (?, ?, ?)", [sender_phone, receiver_phone, amount]);
    await connection.execute(
      "INSERT INTO recharge (id_order, transaction_id, phone, money, type, status, today, url, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [client_transaction_id, 0, receiver_phone, amount, "wallet", 0, timerJoin2(Date.now()), 0, time]
    );

    return res.status(200).json({ message: `Requested ${amount} sent successfully`, status: true, timeStamp: timeNow });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== TRANSFER HISTORY ====================
const transferHistory = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const [user] = await connection.query("SELECT phone, money, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const userInfo = user[0];
    const [history] = await connection.query("SELECT * FROM balance_transfer WHERE sender_phone = ?", [userInfo.phone]);
    const [receive] = await connection.query("SELECT * FROM balance_transfer WHERE receiver_phone = ?", [userInfo.phone]);

    return res.status(200).json({
      message: "Success",
      receive,
      datas: history,
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== RECHARGE 2 ====================
const recharge2 = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const money = req.body.money;

    if (!auth || money) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const userInfo = user[0];
    const [recharge] = await connection.query(
      "SELECT * FROM recharge WHERE phone = ? AND status = ? ORDER BY id DESC LIMIT 1",
      [userInfo.phone, 0]
    );

    if (recharge.length == 0) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [bank_recharge] = await connection.query("SELECT * FROM bank_recharge");

    const qrcode1 = await generateQRCode(`upi://pay?pa=${bank_recharge[0]?.stk}&pn="bdg"&am=${recharge[0]?.money}`);
    const qrcode2 = await generateQRCode(`upi://pay?pa=${bank_recharge[0]?.upi2}&pn="bdg"&am=${recharge[0]?.money}`);
    const qrcode3 = await generateQRCode(`upi://pay?pa=${bank_recharge[0]?.upi3}&pn="bdg"&am=${recharge[0]?.money}`);

    return res.status(200).json({
      message: "Received successfully",
      datas: recharge[0],
      infoBank: bank_recharge,
      qrcode1,
      qrcode2,
      qrcode3,
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== LIST RECHARGE ====================
const listRecharge = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [admindata] = await connection.execute("SELECT deposite_requre FROM admin");
    const depositRequre = admindata[0].deposite_requre;

    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [recharge] = await connection.query("SELECT * FROM recharge WHERE phone = ? ORDER BY id DESC", [user[0].phone]);

    return res.status(200).json({
      message: "Receive success",
      datas: { recharge, depositRequre },
      depositRequre,
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const listRecharge2 = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [recharge2] = await connection.query(
      "SELECT * FROM recharge WHERE phone = ? AND status = 1 ORDER BY id DESC LIMIT 1",
      [user[0].phone]
    );
    const [dpositReq] = await connection.execute("SELECT deposite_requre FROM admin");

    if (dpositReq[0].deposite_requre == 1) {
      return res.status(200).json({ message: "Receive success", data2: recharge2, status: true, timeStamp: timeNow });
    }
    return res.status(200).json({ message: "Receive success", status: true, timeStamp: timeNow });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== SEARCH ====================
const search = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const phone = req.body.phone;

    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [user] = await connection.query("SELECT phone, code, invite, level FROM users WHERE token = ?", [auth]);
    if (user.length == 0) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const userInfo = user[0];
    if (userInfo.level == 1) {
      const [users] = await connection.query("SELECT * FROM users WHERE phone = ? ORDER BY id DESC", [phone]);
      return res.status(200).json({ message: "Receive success", datas: users, status: true, timeStamp: timeNow });
    } else if (userInfo.level == 2) {
      const [users] = await connection.query("SELECT * FROM users WHERE phone = ? ORDER BY id DESC", [phone]);
      if (users.length == 0) {
        return res.status(200).json({ message: "Receive success", datas: [], status: true, timeStamp: timeNow });
      }
      if (users[0].ctv === userInfo.phone) {
        return res.status(200).json({ message: "Receive success", datas: users, status: true, timeStamp: timeNow });
      }
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }
    return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== DOWNLINE RECHARGE ====================
const downlinerecharge = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const date = new Date().toISOString().slice(0, 10);

    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: Date.now() });
    }

    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: Date.now() });
    }

    const userInfo = user[0];

    const [allUsers] = await connection.query(
      `WITH RECURSIVE InviteCTE AS (
        SELECT id_user, name_user, phone, code, invite, rank, total_money, time, 1 AS depth
        FROM users WHERE invite = ?
        UNION ALL
        SELECT u.id_user, u.name_user, u.phone, u.code, u.invite, u.rank, u.total_money, u.time, c.depth + 1
        FROM users u INNER JOIN InviteCTE c ON u.invite = c.code WHERE c.depth < 6
      ) SELECT * FROM InviteCTE`,
      [userInfo.code]
    );

    let total_recharge_count = 0, total_recharge_amount = 0, total_bet_count = 0;
    let total_bet_amount = 0, total_first_recharge_count = 0, better_number = 0;
    const rechargeData_record = [];

    for (const u of allUsers) {
      const [userCombinedTotal] = await connection.query(
        `SELECT IFNULL(SUM(overall_total_money), 0) as grand_total_money FROM (
          SELECT SUM(money) as overall_total_money FROM minutes_1 WHERE phone = ? AND DATE(today) = ?
          UNION ALL SELECT SUM(money) FROM result_k3 WHERE phone = ? AND DATE(bet_data) = ?
          UNION ALL SELECT SUM(money) FROM result_5d WHERE phone = ? AND DATE(bet_data) = ?
        ) combined_table`,
        [u.phone, date, u.phone, date, u.phone, date]
      );

      const [rechargeRecord] = await connection.query(
        "SELECT IFNULL(SUM(money), 0) as grand_total_money FROM recharge WHERE phone = ? AND status = 1 AND DATE(today) = ?",
        [u.phone, date]
      );

      const [deposits] = await connection.query(
        "SELECT id,id_order,transaction_id,utr,phone,money,type,status,today,url,time FROM recharge WHERE phone = ? AND status = 1 AND DATE(today) = ?",
        [u.phone, date]
      );

      const [userCombinedTotal_count] = await connection.query(
        `SELECT COUNT(*) AS row_count FROM (
          SELECT phone FROM minutes_1 WHERE phone = ? AND DATE(today) = ?
          UNION ALL SELECT phone FROM result_k3 WHERE phone = ? AND DATE(bet_data) = ?
          UNION ALL SELECT phone FROM result_5d WHERE phone = ? AND DATE(bet_data) = ?
        ) AS combined_table`,
        [u.phone, date, u.phone, date, u.phone, date]
      );

      const [commsions] = await connection.query(
        "SELECT SUM(commission) AS total_subordinatedata_amount, date FROM subordinatedata WHERE phone = ? AND DATE(date) = ?",
        [u.phone, date]
      );

      const totalCommsionsAmount = commsions[0].total_subordinatedata_amount !== null ? commsions[0].total_subordinatedata_amount : 0;
      const rowCount = userCombinedTotal_count[0].row_count;

      total_bet_count += rowCount;
      deposits.forEach((d) => { total_recharge_amount += parseFloat(d.money); });
      if (deposits.length > 0) total_first_recharge_count += 1;

      const grandTotalMoney = userCombinedTotal[0].grand_total_money;
      const grandRechargeTotalMoney = rechargeRecord[0].grand_total_money;

      if (grandTotalMoney > 0) better_number += 1;
      total_recharge_count += deposits.length;
      total_bet_amount += parseFloat(grandTotalMoney);

      rechargeData_record.push({
        totalBetAmount: grandTotalMoney,
        totalRechargeAmount: grandRechargeTotalMoney,
        totalCommsionsAmount,
        userLevel: u.depth,
        userId: u.id_user,
        dates: u.time,
      });
    }

    return res.status(200).json({
      message: "Success",
      status: true,
      timeStamp: Date.now(),
      total_first_recharge_count,
      total_recharge_count,
      total_recharge_amount,
      total_bet_count,
      total_bet_amount,
      better_number,
      datas: rechargeData_record,
    });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== DOWNLINE RECHARGE DATA ====================
const downlinerecharge_data = async (req, res) => {
  const auth = req.cookies.auth;
  const { date } = req.body;

  if (!auth) {
    return res.status(200).json({ message: "Failed", status: false, timeStamp: Date.now() });
  }

  try {
    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: Date.now() });
    }

    const userInfo = user[0];

    const [allUsers] = await connection.query(
      `WITH RECURSIVE InviteCTE AS (
        SELECT id_user, name_user, phone, code, invite, rank, total_money, 1 AS depth
        FROM users WHERE invite = ?
        UNION ALL
        SELECT u.id_user, u.name_user, u.phone, u.code, u.invite, u.rank, u.total_money, c.depth + 1
        FROM users u INNER JOIN InviteCTE c ON u.invite = c.code WHERE c.depth < 6
      ) SELECT * FROM InviteCTE`,
      [userInfo.code]
    );

    const [level] = await connection.query("SELECT * FROM level");
    const commissionRatios = {
      1: (level[0]?.f1 || 0) / 100,
      2: (level[1]?.f1 || 0) / 100,
      3: (level[2]?.f1 || 0) / 100,
      4: (level[3]?.f1 || 0) / 100,
      5: (level[4]?.f1 || 0) / 100,
      6: (level[5]?.f1 || 0) / 100,
    };

    let rechargeData = await Promise.all(
      allUsers.map(async (u) => {
        const levelRatio = commissionRatios[u.depth] || 0;

        const [userCombinedTotal] = await connection.query(
          `SELECT IFNULL(SUM(overall_total_money), 0) as grand_total_money FROM (
            SELECT SUM(money) as overall_total_money FROM minutes_1 WHERE phone = ? AND DATE(today) = ?
            UNION ALL SELECT SUM(money) FROM result_k3 WHERE phone = ? AND DATE(bet_data) = ?
            UNION ALL SELECT SUM(money) FROM result_5d WHERE phone = ? AND DATE(bet_data) = ?
          ) combined_table`,
          [u.phone, date, u.phone, date, u.phone, date]
        );

        const [rechargeRecord] = await connection.query(
          "SELECT IFNULL(SUM(money), 0) as grand_total_money FROM recharge WHERE phone = ? AND status = 1 AND DATE(today) = ?",
          [u.phone, date]
        );

        const [deposits] = await connection.query(
          "SELECT id,id_order,transaction_id,utr,phone,money,type,status,today,url,time FROM recharge WHERE phone = ? AND status = 1 AND DATE(today) = ?",
          [u.phone, date]
        );

        const [userCombinedTotalCount] = await connection.query(
          `SELECT COUNT(*) AS row_count FROM (
            SELECT phone FROM minutes_1 WHERE phone = ? AND DATE(today) = ?
            UNION ALL SELECT phone FROM result_k3 WHERE phone = ? AND DATE(bet_data) = ?
            UNION ALL SELECT phone FROM result_5d WHERE phone = ? AND DATE(bet_data) = ?
          ) AS combined_table`,
          [u.phone, date, u.phone, date, u.phone, date]
        );

        const rowCount = userCombinedTotalCount[0]?.row_count || 0;
        const betAmount = parseFloat(userCombinedTotal[0]?.grand_total_money || 0);
        const isBetter = betAmount > 0;
        const totalCommissionsAmount = parseFloat((betAmount * levelRatio).toFixed(2));

        const date1 = new Date(date);
        date1.setUTCHours(0, 0, 0, 0);

        return {
          totalBetAmount: betAmount.toFixed(2),
          totalRechargeAmount: parseFloat(rechargeRecord[0]?.grand_total_money || 0).toFixed(2),
          totalCommsionsAmount: totalCommissionsAmount,
          userLevel: u.depth,
          userId: u.id_user,
          dates: date1.getTime(),
          rechargeCount: deposits.length,
          betCount: rowCount,
          isBetter,
          firstRecharge: deposits.length > 0,
        };
      })
    );

    rechargeData = rechargeData.filter(
      (d) => parseFloat(d.totalBetAmount) > 0 || parseFloat(d.totalRechargeAmount) > 0 || d.totalCommsionsAmount > 0
    );

    const levelData = rechargeData.reduce((acc, d) => {
      if (!acc[d.userLevel]) {
        acc[d.userLevel] = {
          total_first_recharge_count: 0,
          total_recharge_count: 0,
          total_recharge_amount: 0,
          total_bet_count: 0,
          total_bet_amount: 0,
          better_number: 0,
        };
      }
      acc[d.userLevel].total_first_recharge_count += d.firstRecharge ? 1 : 0;
      acc[d.userLevel].total_recharge_count += d.rechargeCount;
      acc[d.userLevel].total_recharge_amount += parseFloat(d.totalRechargeAmount);
      acc[d.userLevel].total_bet_count += d.betCount;
      acc[d.userLevel].total_bet_amount += parseFloat(d.totalBetAmount);
      acc[d.userLevel].better_number += d.isBetter ? 1 : 0;
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
      total_first_recharge_count: rechargeData.filter((d) => d.firstRecharge).length,
      total_recharge_count: rechargeData.reduce((sum, d) => sum + d.rechargeCount, 0),
      total_recharge_amount: rechargeData.reduce((sum, d) => sum + parseFloat(d.totalRechargeAmount), 0).toFixed(2),
      date,
      total_bet_count: rechargeData.reduce((sum, d) => sum + d.betCount, 0),
      total_bet_amount: rechargeData.reduce((sum, d) => sum + parseFloat(d.totalBetAmount), 0).toFixed(2),
      better_number: rechargeData.filter((d) => d.isBetter).length,
      datas: rechargeData,
      levelData: levelDataArray,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({ message: error.message, status: false, timeStamp: Date.now() });
  }
};

// ==================== SUBORDINATE DATA ====================
const subordinatedata = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const [user] = await connection.query(
      "SELECT phone, money, code, invite, user_level FROM users WHERE token = ?",
      [auth]
    );
    if (!user.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const userInfo = user[0];
    const selectedData = [];

    async function fetchInvitesByCode(code, depth = 1) {
      if (depth > 6) return;
      const [inviteData] = await connection.query(
        "SELECT id_user, name_user, phone, code, invite, rank, user_level, total_money FROM users WHERE invite = ?",
        [code]
      );
      for (const invite of inviteData) {
        selectedData.push({ ...invite, user_level: depth });
        await fetchInvitesByCode(invite.code, depth + 1);
      }
    }

    await fetchInvitesByCode(userInfo.code);

    const downlineUsers = [userInfo, ...selectedData];
    const results = [];

    for (const u of downlineUsers) {
      const [recharges] = await connection.query(
        "SELECT SUM(money) as total_recharge_amount FROM recharge WHERE phone = ? AND status = 1",
        [u.phone]
      );
      const totalRechargeAmount = recharges[0].total_recharge_amount || 0;

      const [commsions] = await connection.query(
        "SELECT SUM(commission) as total_subordinatedata_amount, date FROM subordinatedata WHERE phone = ? AND bonusby = ?",
        [userInfo.phone, u.phone]
      );
      const totalCommsionsAmount = commsions[0].total_subordinatedata_amount || 0;
      const dates = commsions[0].date || 0;

      const [userCombinedTotal] = await connection.query(
        `SELECT SUM(overall_total_money) as total_bet_amount FROM (
          SELECT SUM(money) as overall_total_money FROM minutes_1 WHERE phone = ?
          UNION SELECT SUM(money) FROM result_k3 WHERE phone = ?
          UNION SELECT SUM(money) FROM result_5d WHERE phone = ?
        ) combined_table`,
        [u.phone, u.phone, u.phone]
      );
      const totalBetAmount = userCombinedTotal[0].total_bet_amount || 0;

      results.push({
        phone: u.phone,
        name: u.name_user,
        userLevel: u.user_level,
        userId: u.id_user,
        totalRechargeAmount,
        totalBetAmount,
        totalCommsionsAmount,
        dates,
      });
    }

    return res.status(200).json({ message: "Success", datas: results, success: true, timeStamp: timeNow });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== COMMISSION DATA ====================
const commissiondata = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const [user] = await connection.query(
      "SELECT phone, money, code, invite, user_level FROM users WHERE token = ?",
      [auth]
    );
    if (!user.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [commsions] = await connection.query("SELECT * FROM subordinatedata WHERE phone = ?", [user[0].phone]);
    return res.status(200).json({ message: "Success", datas: commsions, success: true, timeStamp: timeNow });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// ==================== VIP LEVEL ====================
const vipLevel = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const [user] = await connection.query(
      "SELECT phone, money, code, invite, user_level FROM users WHERE token = ?",
      [auth]
    );
    if (!user.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const userInfo = user[0];
    const [userTotalMoney] = await connection.query(
      `SELECT SUM(total_money) as total_money_sum FROM (
        SELECT SUM(money) as total_money FROM minutes_1 WHERE phone = ?
        UNION ALL SELECT SUM(money) FROM result_k3 WHERE phone = ?
        UNION ALL SELECT SUM(money) FROM result_5d WHERE phone = ?
      ) combined_table`,
      [userInfo.phone, userInfo.phone, userInfo.phone]
    );

    const validDepositsCount = userTotalMoney[0]?.total_money_sum;
    const [data] = await connection.query("SELECT * FROM vip_record WHERE phone = ?", [userInfo.phone]);

    return res.status(200).json({
      message: "Success",
      data,
      levels: validDepositsCount,
      success: true,
      timeStamp: timeNow,
    });
  } catch (err) {
    return res.status(500).json({ message: "internal server error", success: true, timeStamp: timeNow });
  }
};

// ==================== VIP LEVEL EVERY (REFACTORED) ====================
const vipLevelEvery = async () => {
  try {
    // Use single aggregated query instead of loading all tables
    const [totals] = await connection.execute(
      `SELECT phone, SUM(money) AS total_money FROM (
        SELECT phone, money FROM minutes_1
        UNION ALL SELECT phone, money FROM result_k3
        UNION ALL SELECT phone, money FROM result_5d
      ) t GROUP BY phone`
    );

    const [vipdata] = await connection.execute("SELECT * FROM vip_data");
    const sumdate = timerJoin2(Date.now());

    for (const record of totals) {
      const { phone, total_money } = record;
      const totalAmount = parseInt(total_money);

      let bonusAmount = 0, level = 0, rebetRet = 0;

      // Loop through vipdata in descending order
      for (let i = vipdata.length - 1; i >= 0; i--) {
        if (totalAmount >= vipdata[i].amount) {
          bonusAmount = vipdata[i].onetime;
          rebetRet = vipdata[i].rebet;
          level = i + 1;
          break;
        }
      }

      if (bonusAmount <= 0) continue;

      const [user] = await connection.execute("SELECT * FROM users WHERE phone = ?", [phone]);
      const userInfo = user[0];
      if (!userInfo) continue;

      // Only upgrade if user's level is lower than the calculated level
      if (userInfo.vip_level < level) {
        await connection.execute(
          "UPDATE users SET money = money + ?, vip_level = ?, needbet = needbet + ?, rebetRet = ? WHERE phone = ?",
          [bonusAmount, level, bonusAmount, rebetRet, phone]
        );
        await connection.execute(
          "INSERT INTO vip_record (phone, amount, level, date) VALUES (?, ?, ?, ?)",
          [phone, bonusAmount, level, sumdate]
        );
        await connection.query(
          "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, time = ?",
          [phone, `vip level${userInfo.vip_level} bonus`, bonusAmount, sumdate]
        );
      }
    }
  } catch (err) {
    console.error("VIP level every error:", err);
  }
};

// ==================== VIP LEVEL MONTHLY ====================
const vipLevelMonthly = async (req, res) => {
  try {
    const [vipdata] = await connection.execute("SELECT * FROM vip_data");
    const sumdate = timerJoin2(Date.now());
    const [userData] = await connection.query("SELECT * FROM users WHERE vip_level >= 1");

    const bonusAmounts = vipdata.map((v) => v.monthstime);

    for (const userInfo of userData) {
      const level = userInfo.vip_level;
      if (level >= 1 && level <= 10) {
        const bonusAmount = bonusAmounts[level - 1];
        await connection.query("UPDATE users SET money = money + ? WHERE phone = ?", [bonusAmount, userInfo.phone]);
        await connection.query(
          "INSERT INTO vip_record SET phone=?, amount=?, level=?, type=?, date=?",
          [userInfo.phone, bonusAmount, level, "Month", sumdate]
        );
      }
    }

    res.send({ message: "VIP monthly bonuses processed successfully." });
  } catch (err) {
    console.error("Error processing VIP bonuses:", err);
    res.status(500).send({ error: "An error occurred while processing VIP bonuses." });
  }
};

// ==================== NEW SUBORDINATE DATA ====================
const newSubordinateData = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const [user] = await connection.query("SELECT phone, money, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [data] = await connection.query("SELECT * FROM users WHERE invite = ? ORDER BY id DESC", [user[0].code]);
    return res.status(200).json({ message: "new subordinate Successfull", datas: data, success: true, timeStamp: timeNow });
  } catch (error) {
    return res.status(500).json({ message: "internal server", success: false });
  }
};

// ==================== INVITATION BONUS ====================
const getInvitationBonus = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: Date.now() });
    }

    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: Date.now() });
    }

    const userinfo = user[0];
    const [downlineUsers] = await connection.query("SELECT id, phone, invite FROM users WHERE invite = ?", [userinfo.code]);
    const [result] = await connection.query("SELECT * FROM invitation_bonus ORDER BY id DESC");

    const getTotalDeposits = async (phone) => {
      const [firstDeposit] = await connection.query(
        "SELECT money FROM recharge WHERE phone = ? AND status = 1 ORDER BY id ASC LIMIT 1",
        [phone]
      );
      return firstDeposit[0] ? firstDeposit[0].money : null;
    };

    let validDepositsCount = 0;
    for (const downlineUser of downlineUsers) {
      const totalDeposits = await getTotalDeposits(downlineUser.phone);
      if (totalDeposits >= result[0].amount) validDepositsCount++;
    }

    const [highBonus] = await connection.query(
      "SELECT * FROM invitation_bonus ORDER BY CAST(bonus AS UNSIGNED) DESC LIMIT 1"
    );

    return res.status(200).json({
      message: "Data fetched successfully",
      success: true,
      data: result,
      totalRules: result.length,
      hightBonus: highBonus[0].bonus,
      AvgDeposit: highBonus[0].amount,
      validDepositsCount,
      downline: downlineUsers.length,
    });
  } catch (error) {
    console.error("Error fetching active users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== CALCULATE DOWNLINE BONUSES ====================
const calculateDownlineBonuses = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: Date.now() });
    }

    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: Date.now() });
    }

    const userinfo = user[0];
    const [downlineUsers] = await connection.query("SELECT phone FROM users WHERE invite = ?", [userinfo.code]);

    if (!downlineUsers.length) {
      return res.status(200).json({ message: "No downline users found", status: false, timeStamp: Date.now() });
    }

    const userDeposits = [];
    for (const downlineUser of downlineUsers) {
      const [depositResult] = await connection.query(
        "SELECT SUM(money) AS totalmoney FROM recharge WHERE phone = ?",
        [downlineUser.phone]
      );
      userDeposits.push({ phone: downlineUser.phone, totalmoney: depositResult[0]?.totalmoney || 0 });
    }

    const [bonusLevels] = await connection.query(
      "SELECT id, rule, amount, bonus, count FROM invitation_bonus ORDER BY amount DESC"
    );

    const validCounts = [];
    const bonusesToGive = [];

    for (const tier of bonusLevels) {
      const validDepositsCount = userDeposits.filter((u) => u.totalmoney >= tier.amount).length;
      validCounts.push({ tierId: tier.id, validCount: validDepositsCount });
      if (validDepositsCount >= tier.count) bonusesToGive.push(tier);
    }

    for (const tier of bonusesToGive) {
      const [existingBonus] = await connection.query(
        "SELECT * FROM activity_bonus WHERE phone = ? AND invitation_bonusid = ?",
        [userinfo.phone, tier.id]
      );
      if (!existingBonus.length) {
        await connection.query(
          "INSERT INTO activity_bonus (phone, invitation_bonusid, amount, description, type, status, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [userinfo.phone, tier.id, tier.bonus, "Invitation bonus received", "credit", 1, new Date()]
        );
        await connection.query("UPDATE users SET money = money + ? WHERE phone = ?", [tier.bonus, userinfo.phone]);
        await connection.query(
          "INSERT INTO transaction_history (phone, detail, balance, time) VALUES (?, ?, ?, ?)",
          [userinfo.phone, "Invitation Bonus", tier.bonus, timerJoin2(Date.now())]
        );
      }
    }

    const [bonusRecordAll] = await connection.query("SELECT * FROM activity_bonus WHERE phone = ?", [userinfo.phone]);

    return res.status(200).json({
      message: "Success",
      status: true,
      timeStamp: Date.now(),
      userDeposits,
      downline: downlineUsers.length,
      validCounts,
      earnedBonuses: bonusesToGive.map((tier) => ({ tierId: tier.id, amount: tier.bonus })),
      data: bonusRecordAll,
    });
  } catch (error) {
    console.error("Error in calculateDownlineBonuses:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      status: false,
      error: error.message,
      timeStamp: Date.now(),
    });
  }
};

// ==================== FEEDBACK ====================
const feedback = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const { title } = req.body;

    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "Invalid user", status: false, timeStamp: timeNow });
    }

    const sumdate = timerJoin2(Date.now());
    const [feedback] = await connection.query(
      "INSERT INTO feedback SET phone = ?, title = ?, date = ?",
      [user[0].phone, title, sumdate]
    );

    return res.status(200).json({ message: "Feedback successful", data: feedback, status: true });
  } catch (error) {
    return res.status(500).json({ message: "internal server error", status: false });
  }
};

// ==================== LIST WITHDRAW ====================
const listWithdraw = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [recharge] = await connection.query("SELECT * FROM withdraw WHERE phone = ? ORDER BY id DESC", [user[0].phone]);
    return res.status(200).json({ message: "Receive success", datas: recharge, status: true, timeStamp: timeNow });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== RED ENVELOPE ====================
const useRedenvelope = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const code = req.body.code;
    const now = new Date();

    if (!auth || !code) {
      return res.status(400).json({ message: "Failed", status: false, timeStamp: now });
    }

    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(404).json({ message: "User not found", status: false, timeStamp: now });
    }

    const userInfo = user[0];
    const [redenvelopes_usedbyuser] = await connection.query(
      "SELECT * FROM redenvelopes_used WHERE id_redenvelops = ? AND phone_used = ?",
      [code, userInfo.phone]
    );

    if (redenvelopes_usedbyuser.length >= 1) {
      return res.status(200).json({ message: "Gift code already used on your id", status: true, timeStamp: now });
    }

    const [redenvelopes] = await connection.query("SELECT * FROM redenvelopes WHERE id_redenvelope = ?", [code]);
    if (redenvelopes.length === 0) {
      return res.status(200).json({ message: "Red envelope not found", status: true, timeStamp: now });
    }

    const currentTime = timerJoin2(Date.now());
    const checkTime2 = timerJoin4(Date.now());

    if (redenvelopes[0].recharge > 10) {
      const [recharge] = await connection.query(
        "SELECT * FROM recharge WHERE phone = ? AND money >= ? AND status = 1 AND DATE(today) = ?",
        [userInfo.phone, redenvelopes[0].recharge, checkTime2]
      );
      if (recharge.length === 0) {
        return res.status(200).json({
          message: `You need to recharge ${redenvelopes[0].recharge} today`,
          status: true,
          timeStamp: currentTime,
          data: recharge,
        });
      }
    }

    if (redenvelopes[0].used == 0) {
      return res.status(200).json({ message: "Red envelope already used", status: true, timeStamp: now });
    }

    const infoRe = redenvelopes[0];
    await connection.query(
      "UPDATE redenvelopes SET used = used - ?, status = 0 WHERE id_redenvelope = ?",
      [1, infoRe.id_redenvelope]
    );
    await connection.query("UPDATE users SET money = money + ? WHERE phone = ?", [infoRe.money, userInfo.phone]);
    await connection.query(
      "INSERT INTO redenvelopes_used SET phone = ?, phone_used = ?, id_redenvelops = ?, money = ?, time = ?",
      [infoRe.phone, userInfo.phone, infoRe.id_redenvelope, infoRe.money, currentTime]
    );
    await connection.query(
      "INSERT INTO transaction_history SET phone=?, detail=?, balance=?, time = NOW()",
      [userInfo.phone, "Red envelope", infoRe.money]
    );

    return res.status(200).json({ message: `Successfully received +${infoRe.money}`, status: true, timeStamp: now });
  } catch (error) {
    console.error("Error in useRedenvelope:", error);
    return res.status(200).json({ message: "Internal Server Error", error, status: false, timeStamp: timeNow });
  }
};

const getRedenvelope = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({ message: "Invalid token", status: false, timeStamp: timeNow });
    }

    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "Invalid user", status: false, timeStamp: timeNow });
    }

    const [redenvelopes] = await connection.query(
      "SELECT * FROM redenvelopes_used WHERE phone_used = ?",
      [user[0].phone]
    );

    return res.status(200).json({ message: "get redenvelopes_used successfull", datas: redenvelopes, status: true });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== CALLBACK BANK ====================
const callback_bank = async (req, res) => {
  try {
    const { transaction_id, client_transaction_id, amount, requested_datetime, expired_datetime, payment_datetime, status } = req.body;

    if (!transaction_id) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    if (status == 2) {
      await connection.query("UPDATE recharge SET status = 1 WHERE id_order = ?", [client_transaction_id]);
      const [info] = await connection.query("SELECT * FROM recharge WHERE id_order = ?", [client_transaction_id]);
      return res.status(200).json({ message: "Payment success", status: true, data: info });
    } else {
      // Fix: use client_transaction_id instead of undefined 'id'
      await connection.query("UPDATE recharge SET status = 2 WHERE id_order = ?", [client_transaction_id]);
      return res.status(200).json({ message: "Cancellation successful", status: true });
    }
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== CONFIRM RECHARGE ====================
const confirmRecharge = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const client_txn_id = req.body?.client_txn_id;

    if (!client_txn_id) {
      return res.status(200).json({ message: "client_txn_id is required", status: false, timeStamp: timeNow });
    }

    if (!auth) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const [recharge] = await connection.query(
      "SELECT * FROM recharge WHERE phone = ? AND status = ?",
      [user[0].phone, 0]
    );

    if (recharge.length == 0) {
      return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });
    }

    const rechargeData = recharge[0];
    const date = new Date(rechargeData.today);
    const formattedDate = `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;

    const apiData = {
      key: "0c79da69-fdc1-4a07-a8b4-7135a0168385",
      client_txn_id,
      txn_date: formattedDate,
    };

    const apiResponse = await axios.post("https://api.ekqr.in/api/check_order_status", apiData);
    const apiRecord = apiResponse.data.data;

    if (apiRecord.status === "scanning") {
      return res.status(200).json({ message: "Waiting for confirmation", status: false, timeStamp: timeNow });
    }

    if (
      apiRecord.client_txn_id === rechargeData.id_order &&
      apiRecord.customer_mobile === rechargeData.phone &&
      apiRecord.amount === rechargeData.money
    ) {
      if (apiRecord.status === "success") {
        await connection.query(
          "UPDATE recharge SET status = 1 WHERE id = ? AND id_order = ? AND phone = ? AND money = ?",
          [rechargeData.id, apiRecord.client_txn_id, apiRecord.customer_mobile, apiRecord.amount]
        );
        const money = apiRecord.amount;
        await connection.query(
          "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?",
          [money, money, apiRecord.customer_mobile]
        );
        return res.status(200).json({ message: "Successful application confirmation", status: true, datas: recharge });
      } else if (apiRecord.status === "failure" || apiRecord.status === "close") {
        await connection.query(
          "UPDATE recharge SET status = 2 WHERE id = ? AND id_order = ? AND phone = ? AND money = ?",
          [rechargeData.id, apiRecord.client_txn_id, apiRecord.customer_mobile, apiRecord.amount]
        );
        return res.status(200).json({ message: "Payment failure", status: true, timeStamp: timeNow });
      }
    }

    return res.status(200).json({ message: "Mismtach data", status: true, timeStamp: timeNow });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const confirmUSDTRecharge = async (req, res) => {
  console.log(res?.body);
  console.log(res?.query);
  console.log(res?.cookies);
};

// ==================== UPDATE RECHARGE ====================
const updateRecharge = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const { money, id_order: order_id, inputData: data } = req.body;

    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "user not found", status: false, timeStamp: timeNow });
    }

    const [utr] = await connection.query("SELECT * FROM recharge WHERE utr = ?", [data]);

    if (!utr[0]) {
      await connection.query(
        "UPDATE recharge SET utr = ? WHERE phone = ? AND id_order = ?",
        [data, user[0].phone, order_id]
      );
      return res.status(200).json({ message: "UTR updated", status: true, timeStamp: timeNow });
    }

    return res.status(200).json({ message: "UTR is already in use", status: false, timeStamp: timeNow });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== USER PROBLEM ====================
const userProblem = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    let { gameId, orderNo, amount, issue, utr } = req.body;

    if (orderNo == "") orderNo = 0;
    else if (utr == "") utr = 0;

    if (!auth) {
      return res.status(200).json({ message: "user Not found", status: false });
    }

    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) {
      return res.status(200).json({ message: "user not found", status: false, timeStamp: timeNow });
    }

    const data = await connection.query(
      "INSERT INTO user_problem SET phone=?, user_id=?, issue=?, amount=?, orderNo=?, utr=?, today=NOW()",
      [user[0].phone, gameId, issue, amount, orderNo, utr]
    );

    return res.status(200).json({ message: "Requst submited successfull", status: true, data });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const userProblemGet = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const { id, issue } = req.body;

    if (!auth) return res.status(200).json({ message: "user Not found", status: false });

    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) return res.status(200).json({ message: "user not found", status: false });

    const datas = await connection.execute(
      "SELECT * FROM user_problem WHERE user_id=? AND issue=?",
      [id, issue]
    );

    return res.status(200).json({ message: "Requst submited successfull", success: true, data: datas[0] });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const adminProblemGet = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) return res.status(200).json({ message: "user Not found", status: false });

    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) return res.status(200).json({ message: "user not found", status: false });

    const datas = await connection.execute("SELECT * FROM user_problem WHERE status=0");
    return res.status(200).json({ message: "Requst submited successfull", success: true, data: datas[0] });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const adminProblemSubmit = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const { type, remark, id } = req.body;

    if (!auth) return res.status(200).json({ message: "user Not found", status: false });

    const [user] = await connection.query("SELECT phone, code, invite FROM users WHERE token = ?", [auth]);
    if (!user.length) return res.status(200).json({ message: "user not found", status: false });

    if (type === "confirm") {
      await connection.execute("UPDATE user_problem SET status=1 WHERE id=?", [id]);
      return res.status(200).json({ message: "Requst submited successful", success: true });
    }

    if (type === "delete") {
      await connection.execute("UPDATE user_problem SET status=2, remark=? WHERE id=?", [remark, id]);
      return res.status(200).json({ message: "Requst submited successful", success: true });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// ==================== PROMOTION DATA ====================
const getpromotiondata = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) return res.status(200).json({ message: "user Not found", status: false });

    const [user] = await connection.query("SELECT phone FROM users WHERE token = ?", [auth]);
    if (!user.length) return res.status(200).json({ message: "user not found", status: false });

    const [rows] = await connection.query("SELECT * FROM promotion WHERE phone = ?", [user[0].phone]);
    if (!rows.length) return res.status(200).json({ message: "user not found", status: false });

    return res.status(200).json({ message: "get promotion", success: true, data: rows[0] });
  } catch (error) {
    return res.status(200).json({ message: "internal server error", success: false, error: error.message });
  }
};

const updateRandomPromotion = async (req, res) => {
  try {
    const {
      phone, dregister, damount, ddeposit, dfirst, tregister, tamount,
      tdeposit, tfirst, type, commission, weekBalance, totalBalance, direct, team,
    } = req.body;

    const [rows] = await connection.query("SELECT * FROM promotion WHERE phone = ?", [phone]);
    const checkTime = timerJoin2(Date.now());

    if (rows.length === 0) {
      await connection.query(
        "INSERT INTO promotion SET phone=?, dregister=?, damount=?, ddeposit=?, dfirst=?, tregister=?, tamount=?, tdeposit=?, tfirst=?, commission=?, weekBalance=?, totalBalance=?, direct=?, team=?, time=?",
        [phone, dregister, damount, ddeposit, dfirst, tregister, tamount, tdeposit, tfirst, commission, weekBalance, totalBalance, direct, team, checkTime]
      );
      return res.status(200).json({ message: "promotion update success", success: true });
    }

    await connection.query(
      "UPDATE promotion SET dregister=?, damount=?, ddeposit=?, dfirst=?, tregister=?, tamount=?, tdeposit=?, tfirst=?, commission=?, weekBalance=?, totalBalance=?, direct=?, team=? WHERE phone=?",
      [dregister, damount, ddeposit, dfirst, tregister, tamount, tdeposit, tfirst, commission, weekBalance, totalBalance, direct, team, phone]
    );

    return res.status(200).json({ message: "promotion update success", success: true });
  } catch (error) {
    return res.status(200).json({ message: "internal server error", success: false, error: error.message });
  }
};

const makePromotion = async (req, res) => {
  try {
    const { phone, rank } = req.body;
    const [rows] = await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);
    if (!rows.length) return res.status(200).json({ message: "user not found", success: false });

    await connection.query("UPDATE users SET rank=? WHERE phone=?", [rank, phone]);
    return res.status(200).json({ message: "promotion update success", success: true });
  } catch (error) {
    return res.status(200).json({ message: "internal server error", success: false, error: error.message });
  }
};

// ==================== VIP DATA ====================
const getVipData = async (req, res) => {
  try {
    const [vipdata] = await connection.execute("SELECT * FROM vip_data");
    if (!vipdata) return res.status(200).json({ message: "user not found", status: false });

    return res.status(200).json({ message: "get promotion", success: true, data: vipdata });
  } catch (error) {
    return res.status(200).json({ message: "internal server error", success: false, error: error.message });
  }
};

// ==================== DAILY ACTIVITY REWARD ====================
const getdailyactivyreward = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) return res.status(200).json({ message: "User not found", status: false });

    const [user] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);
    if (user.length === 0) return res.status(200).json({ message: "User not found", status: false });

    const userInfo = user[0];
    const phone = userInfo.phone;

    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];
    const formattedWeekStart = new Date();
    formattedWeekStart.setDate(today.getDate() - 6);
    const weekStartDate = formattedWeekStart.toISOString().split("T")[0];

    const [betResults] = await connection.query(
      `SELECT 
        (SELECT COALESCE(SUM(money), 0) FROM minutes_1 WHERE phone = ? AND DATE(today) = ?) +
        (SELECT COALESCE(SUM(money), 0) FROM result_k3 WHERE phone = ? AND DATE(bet_data) = ?) +
        (SELECT COALESCE(SUM(money), 0) FROM result_5d WHERE phone = ? AND DATE(bet_data) = ?) AS total_daily,
        (SELECT COALESCE(SUM(money), 0) FROM minutes_1 WHERE phone = ? AND DATE(today) BETWEEN ? AND ?) +
        (SELECT COALESCE(SUM(money), 0) FROM result_k3 WHERE phone = ? AND DATE(bet_data) BETWEEN ? AND ?) +
        (SELECT COALESCE(SUM(money), 0) FROM result_5d WHERE phone = ? AND DATE(bet_data) BETWEEN ? AND ?) AS total_weekly`,
      [
        phone, formattedToday, phone, formattedToday, phone, formattedToday,
        phone, weekStartDate, formattedToday, phone, weekStartDate, formattedToday, phone, weekStartDate, formattedToday,
      ]
    );

    const totalDailyBet = betResults[0].total_daily || 0;
    const totalWeeklyBet = betResults[0].total_weekly || 0;

    const [bonusSettings] = await connection.query("SELECT id, betrequriment, bonus, type FROM bonus_settings");
    const [receivedBonuses] = await connection.query(
      "SELECT bonus_setting_id FROM user_bonus_history WHERE phone = ? AND received_date = ?",
      [phone, formattedToday]
    );

    const receivedBonusIds = new Set(receivedBonuses.map((r) => r.bonus_setting_id));

    for (const setting of bonusSettings) {
      if (!receivedBonusIds.has(setting.id)) {
        if (setting.type === 1 && totalDailyBet >= setting.betrequriment) {
          await connection.query(
            "INSERT INTO user_bonus_history (user_id, phone, bonus, type, received_date, bonus_setting_id) VALUES (?, ?, ?, 1, ?, ?)",
            [userInfo.id, phone, setting.bonus, formattedToday, setting.id]
          );
        }
        if (setting.type === 2 && totalWeeklyBet >= setting.betrequriment) {
          await connection.query(
            "INSERT INTO user_bonus_history (user_id, phone, bonus, type, received_date, bonus_setting_id) VALUES (?, ?, ?, 2, ?, ?)",
            [userInfo.id, phone, setting.bonus, formattedToday, setting.id]
          );
        }
      }
    }

    const [receivedBonuses_history] = await connection.query(
      "SELECT bonus_setting_id FROM user_bonus_history WHERE phone = ? AND received_date = ?",
      [phone, formattedToday]
    );

    return res.status(200).json({
      message: "Get daily and weekly bet commission",
      success: true,
      totalDailyBet,
      totalWeeklyBet,
      receivedBonuses_history,
      bonusSettings,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
  }
};

// ==================== DAILY BET COMMISSION ====================
const dailyBetCommition = async (req, res) => {
  try {
    const phone = "0147852369";
    const formattedToday = new Date().toISOString().split("T")[0];

    const [totalMoneyResult] = await connection.query(
      `SELECT
        (SELECT COALESCE(SUM(money), 0) FROM minutes_1 WHERE phone = ? AND DATE(today) = ?) +
        (SELECT COALESCE(SUM(money), 0) FROM result_k3 WHERE phone = ? AND DATE(bet_data) = ?) +
        (SELECT COALESCE(SUM(money), 0) FROM result_5d WHERE phone = ? AND DATE(bet_data) = ?) AS total_money`,
      [phone, "2024-12-04", phone, "2024-12-04", phone, "2024-12-04"]
    );

    const totalMoney = totalMoneyResult[0].total_money || 0;
    const commission = totalMoney * 0.12;

    const [admindata] = await connection.execute("SELECT * FROM admin");
    if (admindata.length === 0) {
      return res.status(200).json({ message: "Admin data not found", status: false });
    }

    return res.status(200).json({
      message: "Get daily bet commission",
      success: true,
      totalMoney,
      commission,
      userBetCommission: admindata[0].user_bet_commition,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
  }
};

// ==================== SPIN ====================
const getSpinData = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const { id } = req.params;

    if (!auth) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const [user] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);
    if (user.length == 0) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const userInfo = user[0];
    const formattedToday = new Date().toISOString().split("T")[0];

    const [todayRecharge] = await connection.query(
      "SELECT SUM(money) AS total_money FROM recharge WHERE phone = ? AND status = 1 AND DATE(today) = ?",
      [userInfo.phone, formattedToday]
    );

    const totalTodayRecharge = todayRecharge[0].total_money || 0;

    let sql = "SELECT * FROM spin_data";
    let values = [];
    if (id) {
      sql = "SELECT * FROM spin_data WHERE id = ?";
      values = [id];
    }

    const [rows] = await connection.execute(sql, values);
    if (rows.length === 0) return res.status(404).json({ message: "No data found", status: false });

    return res.status(200).json({
      message: "Spin data retrieved successfully",
      status: true,
      data: { rows, totalTodayRecharge },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({ message: "Internal server error", status: false, error: error.message });
  }
};

const claimSpin = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const [user] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);
    if (user.length === 0) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const userInfo = user[0];
    if (userInfo.redeem_spin >= userInfo.total_spin) {
      return res.status(200).json({ message: "Your have redeem all spin", success: false });
    }

    const [rows] = await connection.query(`
      SELECT sec_value, sec_column FROM (
        SELECT sec1 AS sec_value, 1 AS sec_column FROM spin_data UNION ALL
        SELECT sec4, 4 FROM spin_data UNION ALL
        SELECT sec3, 3 FROM spin_data
      ) AS sec_values ORDER BY sec_value ASC LIMIT 8;
    `);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No spin values found", success: false, data: [] });
    }

    const allowedValues = [0, 1];
    const randomIndex = allowedValues[Math.floor(Math.random() * allowedValues.length)];
    const randomSelection = rows[randomIndex];

    await connection.query(
      "UPDATE users SET money = money + ?, redeem_spin = redeem_spin + 1 WHERE phone = ?",
      [randomSelection.sec_value, userInfo.phone]
    );

    const checkTime = timerJoin2(Date.now());
    await connection.query(
      "INSERT INTO transaction_history SET phone=?, detail=?, balance=?, time=?",
      [userInfo.phone, "Spin Weel Winning", randomSelection.sec_value, checkTime]
    );
    await connection.query(
      "INSERT INTO wheel_spine SET phone=?, amount=?, type=?, time=?",
      [userInfo.phone, randomSelection.sec_value, "Spin Weel Winning", checkTime]
    );

    return res.status(200).json({
      message: "Get daily bet commission",
      success: true,
      data: { value: randomSelection.sec_value, index: randomSelection.sec_column - 1 },
    });
  } catch (error) {
    console.error("Error fetching minimum values:", error);
    return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
  }
};

const redeemSpin = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const [user] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);
    if (user.length == 0) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const userInfo = user[0];
    return res.status(200).json({
      message: "Spin data retrieved successfully",
      status: true,
      data: {
        totalrecharge: userInfo.spin_recharge,
        redeamspin: userInfo.redeem_spin,
        totalspin: userInfo.total_spin,
      },
    });
  } catch (error) {
    console.error("Error fetching minimum values:", error);
    return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
  }
};

const spineHistory = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const [user] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);
    if (user.length == 0) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const [history] = await connection.query("SELECT * FROM wheel_spine WHERE phone = ?", [user[0].phone]);
    return res.status(200).json({ message: "Spin data retrieved successfully", status: true, data: history });
  } catch (error) {
    console.error("Error fetching minimum values:", error);
    return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
  }
};

// ==================== SEARCH USER ====================
const searchUser = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const [userns] = await connection.query("SELECT * FROM users WHERE token = ? AND veri = 1 LIMIT 1", [auth]);
    if (!userns.length) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    const { id_user = null, page = 1 } = req.query;
    const limit = 20;
    const offset = (page - 1) * limit;
    const phone = userns[0].phone;

    const [users] = await connection.query("SELECT code FROM users WHERE phone = ?", [phone]);
    if (users.length === 0) {
      return res.status(404).json({ status: false, message: "Root user not found" });
    }

    const rootCode = users[0].code;

    let query = `
      WITH RECURSIVE downline_tree AS (
        SELECT id_user, phone, name_user, money, totalRecharge, totalWithdraw, code, invite, 1 AS user_level
        FROM users WHERE invite = ?
        UNION ALL
        SELECT u.id_user, u.phone, u.name_user, u.money, u.totalRecharge, u.totalWithdraw, u.code, u.invite, dt.user_level + 1
        FROM users u INNER JOIN downline_tree dt ON u.invite = dt.code WHERE dt.user_level < 6
      ) SELECT * FROM downline_tree
    `;

    const params = [rootCode];

    if (id_user) {
      query += " WHERE id_user = ?";
      params.push(id_user);
    } else {
      query += " LIMIT ? OFFSET ?";
      params.push(limit, offset);
    }

    const [rows] = await connection.query(query, params);

    if (id_user && rows.length === 0) {
      return res.status(404).json({ status: false, message: "User not found in downline" });
    }

    return res.status(200).json({
      status: true,
      message: "Downline fetched successfully",
      page: Number(page),
      results: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching downline users:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
  }
};

// ==================== PROMOTION NEW ====================
const promotionNew = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    if (!auth) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const [user] = await connection.query(
      "SELECT phone, code, invite, roses_f, roses_f1, roses_today FROM users WHERE token = ?",
      [auth]
    );
    if (!user.length) return res.status(200).json({ message: "Invalid user", status: false, timeStamp: timeNow });

    const userInfo = user[0];
    const previousDate = new Date();
    previousDate.setDate(previousDate.getDate() - 1);
    const currentDate = previousDate.toISOString().slice(0, 10);

    const [promotion_data] = await connection.query(
      "SELECT * FROM promotion_data WHERE phone = ? AND date(date) = ?",
      [userInfo.phone, currentDate]
    );

    const data = promotion_data[0] || {};

    return res.status(200).json({
      message: "Receive success",
      info: user,
      status: true,
      level1_count: data.direct_register || 0,
      totalDepositCount: data.direct_deposit_num || 0,
      totalDepositAmount: data.direct_deposit_amount || 0,
      firstDepositCount: data.direct_deposit_first || 0,
      level2_to_level6count: data.indirect_register || 0,
      level2_to_level6totalDepositCount: data.indirect_deposit_num || 0,
      level2_to_level6totalDepositAmount: data.indirect_deposit_amount || 0,
      level2_to_level6firstDepositCount: data.indirect_deposit_first || 0,
      total_downline_count: data.level2to6alltimeactive || 0,
      invite: {
        f1: data.levelonealltimeactive || 0,
        total_f: data.level2to6alltimeactive || 0,
      },
      currentDate,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("An error ommkk:", error);
    return res.status(200).json({ message: error.message, status: false, timeStamp: timeNow });
  }
};

// ==================== ZILPAY ====================
const zilpay = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const money = req.body.amount;
    const type = req.body.type;

    if (!auth || !money || money <= 99) {
      return res.status(200).json({ message: "Minimum recharge 100", status: false, timeStamp: timeNow });
    }

    const [user] = await connection.query("SELECT phone, code, invite, isdemo FROM users WHERE token = ?", [auth]);
    if (!user.length) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

    const userInfo = user[0];
    const checkTime = timerJoin2(Date.now());

    if (userInfo.isdemo === 1) {
      const date = new Date();
      const id_time = `${date.getUTCFullYear()}${date.getUTCMonth() + 1}${date.getUTCDate()}`;
      const id_order = Math.floor(Math.random() * 90000000000000) + 10000000000000;
      const client_transaction_id = id_time + id_order;

      await connection.execute(
        "INSERT INTO recharge SET id_order=?, transaction_id=?, phone=?, money=?, type=?, status=?, today=?, url=?, time=?, isdemo=?",
        [client_transaction_id, "0", userInfo.phone, Number(money), type, 1, checkTime, "1", checkTime, 1]
      );
      await connection.execute("UPDATE users SET money = money + ? WHERE phone = ?", [Number(money), userInfo.phone]);
      return res.status(200).json({ message: "Demo Amount is added", status: false, timeStamp: timeNow });
    }

    const params = {
      amount: Number(money),
      auth: "TSFHEYY8UH2FLCVCNFGT",
      callback: "https://yaarclub.co/api/webapi/zilpayCallback",
      redirect_url: "https://jackpotjunctionexpress.click",
      user: userInfo.phone,
    };

    const data = await axios.post("https://api.zilpay.live/api/payin2", params);

    if (data.data.status === "success") {
      await connection.execute(
        "INSERT INTO recharge SET id_order=?, transaction_id=?, phone=?, money=?, type=?, status=?, today=?, url=?, time=?, userStatus=?",
        [data.data.order_id, data.data.order_id, userInfo.phone, money, type, 0, checkTime, "0", checkTime, 0]
      );
      return res.status(200).json({ message: "", status: true, data: data.data });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
  }
};

const zilpayCallback = async (req, res) => {
  const { request_user, amount, merchanttransid, status } = req.body;

  try {
    const [info] = await connection.query("SELECT * FROM recharge WHERE id_order = ?", [merchanttransid]);

    if (!info.length) {
      return res.status(404).json({ message: "Transaction not found", success: false });
    }

    if (info[0].status === 1) {
      return res.json("success");
    }

    const checkTime = timerJoin2(Date.now());
    const [Firstrecharge] = await connection.query(
      "SELECT * FROM recharge WHERE phone = ? AND status = ?",
      [info[0].phone, 1]
    );
    const [result] = await connection.execute("SELECT * FROM rechargeBonus ORDER BY id DESC");

    let bonus = 0;
    if (Firstrecharge.length === 0) {
      for (let i = 0; i < result.length; i++) {
        const element = result[i];
        const currentAmount = parseFloat(element.recAmount);
        const nextAmount = result[i + 1] ? parseFloat(result[i + 1].recAmount) : Infinity;

        if (parseInt(element.is_fisrtrecharge) === 1 && info[0].money >= currentAmount && info[0].money < nextAmount) {
          bonus = parseInt(element.is_persent) === 1
            ? (info[0].money * parseFloat(element.bonus)) / 100
            : parseFloat(element.bonus);
          break;
        }
      }

      await connection.query(
        "UPDATE users SET money = money + ?, total_money = total_money + ?, recharge=recharge+? WHERE phone = ?",
        [bonus, bonus, bonus, info[0].phone]
      );
      await connection.query(
        "INSERT INTO transaction_history SET phone=?, detail=?, balance=?, time=?",
        [info[0].phone, "First deposit bonus", bonus, checkTime]
      );

      const [infos] = await connection.query("SELECT invite, code FROM users WHERE phone = ?", [info[0].phone]);
      const refferal = infos[0]?.invite;

      if (refferal !== undefined) {
        const [refferaluser] = await connection.query("SELECT * FROM users WHERE code = ? LIMIT 1", [refferal]);
        if (refferaluser.length && refferaluser[0]?.phone) {
          await connection.query(
            "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?",
            [bonus, bonus, refferaluser[0].phone]
          );
          await connection.query(
            "INSERT INTO transaction_history SET phone=?, detail=?, balance=?, time=?",
            [refferaluser[0].phone, "Bonus", bonus, checkTime]
          );
        }
      }
    }

    await connection.query("UPDATE recharge SET status = 1 WHERE id_order = ?", [merchanttransid]);
    await connection.query(
      "UPDATE users SET money = money + ?, total_money = total_money + ?, recharge=recharge+?, totalRecharge=totalRecharge+? WHERE phone = ?",
      [info[0].money, info[0].money, info[0].money, info[0].money, info[0].phone]
    );
    await connection.query(
      "INSERT INTO transaction_history SET phone=?, detail=?, balance=?, time=?",
      [info[0].phone, "Deposit", info[0].money, checkTime]
    );

    const [spinData] = await connection.query(
      "SELECT task_amount, num_of_spin FROM spin_data ORDER BY task_amount ASC LIMIT 1"
    );

    let totalSpins = 0;
    if (spinData.length > 0 && info[0].money >= spinData[0].task_amount) {
      totalSpins = Math.floor(info[0].money / spinData[0].task_amount) * spinData[0].num_of_spin;
    }

    if (totalSpins > 0) {
      // Fix: use info[0].phone instead of undefined `phone`
      await connection.query(
        "UPDATE users SET total_spin = total_spin + ?, spin_recharge = spin_recharge + ? WHERE phone = ?",
        [totalSpins, info[0].money, info[0].phone]
      );
    }

    return res.json("success");
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", success: false, error: error.message });
  }
};

// ==================== RECHARGE 3 (Sunpay) ====================
const recharge3 = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const { amount: money, type, typeid, utr } = req.body;

    if (type !== "cancel" && type !== "submit" && type !== "submitauto") {
      if (!auth || !money || money <= 199) {
        return res.status(200).json({ message: "Minimum recharge 200", status: false, timeStamp: timeNow });
      }
    }

    const [user] = await connection.query("SELECT phone, code, invite, isdemo FROM users WHERE token = ?", [auth]);
    if (!user.length) return res.status(200).json({ message: "Invalid user", status: false, timeStamp: timeNow });

    const userInfo = user[0];
    const checkTime = timerJoin2(Date.now());
    const time = timerJoin2(Date.now());

    if (type === "UPI") {
      const callbackurl = "https://yaarclub.co/api/webapi/recharge-callback";
      const OrderIds = `WP${Date.now()}${Math.floor(Math.random() * 100000)}`;
      const params = {
        version: "1.0",
        mch_id: "100225570",
        mch_order_no: OrderIds,
        pay_type: "101",
        trade_amount: `${Number(money)}`,
        order_date: new Date().toISOString().slice(0, 19).replace("T", " "),
        goods_name: "user goods_name",
        notify_url: callbackurl,
        mch_return_msg: "big7club.com",
      };

      const secretKey = "IGMWSWIAT1D26ZZ0Y1H2KSJ3E32RQJGY";
      params.sign = generateSign(params, secretKey);
      params.sign_type = "MD5";

      const sunpayResponse = await axios.post(
        "https://api.watchglbpay.com/pay/web",
        new URLSearchParams(params).toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      if (sunpayResponse.data.respCode === "SUCCESS") {
        await connection.execute(
          "INSERT INTO recharge SET id_order=?, transaction_id=?, phone=?, money=?, type=?, status=?, today=?, url=?, time=?, userStatus=?",
          [OrderIds, "0", userInfo.phone, Number(money), type, 0, checkTime, "0", time, 0]
        );
        return res.status(200).json({
          message: "Order creation successful",
          pay: true,
          orderid: getRechargeOrderId(),
          status: true,
          data: sunpayResponse.data,
          timeStamp: timeNow,
        });
      }

      return res.status(500).json({ message: "failed", status: false });
    }

    return res.status(200).json({ message: "This gateway not working", status: true });
  } catch (error) {
    console.error("Error in recharge3:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== CALLBACK DATA ====================
const callbackdata = async (req, res) => {
  try {
    const { mchId, mchOrderNo, orderDate, oriAmount, tradeResult, signType, sign, merRetMsg, orderNo } = req.body;

    const [info] = await connection.query("SELECT * FROM recharge WHERE id_order = ?", [mchOrderNo]);
    if (!info.length) return console.log("Transaction not found.");

    if (info[0].status === 1) {
      return console.log("Recharge status is already completed. Skipping user money update.");
    }

    const checkTime = timerJoin2(Date.now());
    const [Firstrecharge] = await connection.query(
      "SELECT * FROM recharge WHERE phone = ? AND status = ?",
      [info[0].phone, 1]
    );

    let bonus = 0;
    if (info[0].money == 300) bonus = 48;
    else if (info[0].money == 500) bonus = 108;
    else if (info[0].money == 1000) bonus = 188;
    else if (info[0].money == 5000) bonus = 288;
    else if (info[0].money == 10000) bonus = 488;
    else if (info[0].money == 50000) bonus = 5000;
    else if (info[0].money == 100000) bonus = 12000;
    else bonus = info[0].money * 0.03;

    if (Firstrecharge.length === 0) {
      await connection.execute(
        "INSERT INTO transaction SET purpose=?, phone=?, money=?, type=?, status=?, level=?, today=?, time=?",
        ["Big Recharge Bonus", info[0].phone, bonus, "credit", 1, 1, checkTime, checkTime]
      );
      await connection.query(
        "UPDATE users SET money = money + ?, total_money = total_money + ?, recharge=recharge+? WHERE phone = ?",
        [bonus, bonus, bonus, info[0].phone]
      );
      await connection.query(
        "INSERT INTO transaction_history SET phone=?, detail=?, balance=?, time=?",
        [info[0].phone, "First deposit bonus", bonus, checkTime]
      );

      const refferal = info[0]?.invite;
      if (refferal !== undefined) {
        const [refferaluser] = await connection.query("SELECT * FROM users WHERE code = ? LIMIT 1", [refferal]);
        if (refferaluser.length && refferaluser[0]?.phone) {
          await connection.query(
            "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?",
            [18, 18, refferaluser[0].phone]
          );
          await connection.query(
            "INSERT INTO transaction_history SET phone=?, detail=?, balance=?, time=?",
            [refferaluser[0].phone, "Active member", 18, checkTime]
          );
        }
      }
    } else {
      await connection.query(
        "UPDATE users SET money = money + ?, total_money = total_money + ?, recharge=recharge+? WHERE phone = ?",
        [bonus, bonus, bonus, info[0].phone]
      );
    }

    await connection.query("UPDATE recharge SET status = 1 WHERE id_order = ?", [mchOrderNo]);
    await connection.query(
      "UPDATE users SET money = money + ?, total_money = total_money + ?, recharge=recharge+?, totalRecharge=totalRecharge+? WHERE phone = ?",
      [info[0].money, info[0].money, info[0].money, info[0].money, info[0].phone]
    );
    await connection.query(
      "INSERT INTO transaction_history SET phone=?, detail=?, balance=?, time=?",
      [info[0].phone, "Deposit", info[0].money, checkTime]
    );
  } catch (error) {
    console.log(error);
  }
};

// ==================== TREXO PAY ====================
const initiateTrexoPayPayment = async (req, res) => {
  const auth = req.cookies.auth;
  const am = req.body.amount;
  const money = req.body.amount;
  const type = req.body.type;

  if (!auth || !money || money <= 99) {
    return res.status(200).json({ message: "Minimum recharge 100", status: false, timeStamp: timeNow });
  }

  const [user] = await connection.query("SELECT phone, code, invite, isdemo FROM users WHERE token = ?", [auth]);
  if (!user.length) return res.status(200).json({ message: "Failed", status: false, timeStamp: timeNow });

  const userInfo = user[0];
  const checkTime = timerJoin2(Date.now());

  try {
    const user_token = "79bf6a0f993ae54510d819a092c51905";
    const orderId = getRechargeOrderId();
    const redirect_url = "https://yaarclub.co/api/webapi/verifyTrexoPayPayment";

    const params = {
      customer_mobile: userInfo.phone,
      user_token,
      amount: am,
      order_id: orderId,
      redirect_url,
      remark1: "recharge",
      remark2: "wallet",
      route: 2,
    };

    const response = await makePostRequest("https://merchant.trexopayment.com/api/create-order", params);

    if (!response || typeof response.status !== "boolean") {
      return res.status(500).json({ message: "Invalid response from TrexoPay API", status: false, timeStamp: timeNow });
    }

    if (response.status === true) {
      await connection.execute(
        "INSERT INTO recharge SET id_order=?, transaction_id=?, phone=?, money=?, type=?, status=?, today=?, url=?, time=?, userStatus=?",
        [orderId, orderId, userInfo.phone, am, type, 0, checkTime, "0", checkTime, 0]
      );
      return res.status(200).json({ message: "TrexoPay payment URL successful", status: true, data: response.result });
    }

    return res.status(400).json({ message: "TrexoPay rejected the order", status: false, data: response });
  } catch (error) {
    return res.status(500).json({
      message: `Payment initiation failed: ${error.message}`,
      status: false,
      error: error.message,
      trexopayError: error.response?.data || null,
      timeStamp: timeNow,
    });
  }
};

const verifyTrexoPayPayment = async (req, res) => {
  const { status, order_id, customer_mobile, amount } = req.body;

  try {
    const [info] = await connection.query("SELECT * FROM recharge WHERE id_order = ?", [order_id]);
    if (!info.length) return res.status(404).json({ message: "Transaction not found", success: false });

    if (info[0].status === 1) return res.json("success");

    const checkTime = timerJoin2(Date.now());
    const [Firstrecharge] = await connection.query(
      "SELECT * FROM recharge WHERE phone = ? AND status = ?",
      [info[0].phone, 1]
    );
    const [infos] = await connection.query("SELECT invite, code FROM users WHERE phone = ?", [info[0].phone]);

    let bonus = 0;
    const bonus2 = info[0].money * 0.02;
    if (info[0].money > 99 && info[0].money <= 1000) {
      bonus = info[0].money * 0.05;
    } else {
      bonus = info[0].money * 0.1;
    }

    if (Firstrecharge.length === 0) {
      await connection.query(
        "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?",
        [bonus, bonus, info[0].phone]
      );
      await connection.query(
        "INSERT INTO transaction_history SET phone=?, detail=?, balance=?, time=?",
        [info[0].phone, "First deposit bonus", bonus, checkTime]
      );

      const refferal = infos[0]?.invite;
      if (refferal !== undefined) {
        const [refferaluser] = await connection.query("SELECT * FROM users WHERE code = ? LIMIT 1", [refferal]);
        if (refferaluser.length && refferaluser[0]?.phone) {
          await connection.query(
            "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?",
            [10, 10, refferaluser[0].phone]
          );
          await connection.query(
            "INSERT INTO transaction_history SET phone=?, detail=?, balance=?, time=?",
            [refferaluser[0].phone, "Bonus", 10, checkTime]
          );
        }
      }
    } else {
      await connection.query(
        "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?",
        [bonus, bonus, info[0].phone]
      );
      const refferals = infos[0]?.invite;
      if (refferals !== undefined) {
        const [refferalusers] = await connection.query("SELECT * FROM users WHERE code = ? LIMIT 1", [refferals]);
        if (refferalusers.length && refferalusers[0]?.phone) {
          await connection.query(
            "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?",
            [bonus2, bonus2, refferalusers[0].phone]
          );
          await connection.query(
            "INSERT INTO transaction_history SET phone=?, detail=?, balance=?, time=?",
            [refferalusers[0].phone, "Bonus", bonus2, checkTime]
          );
        }
      }
    }

    await connection.query("UPDATE recharge SET status = 1 WHERE id_order = ?", [order_id]);
    await connection.query(
      "UPDATE users SET money = money + ?, total_money = total_money + ?, totalRecharge=totalRecharge+? WHERE phone = ?",
      [info[0].money, info[0].money, info[0].money, info[0].phone]
    );
    await connection.query(
      "INSERT INTO transaction_history SET phone=?, detail=?, balance=?, time=?",
      [info[0].phone, "Deposit", info[0].money, checkTime]
    );

    return res.json("success");
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      message: `Payment verification failed: ${error.message}`,
      status: false,
      error: error.message,
      timeStamp: new Date().toISOString(),
    });
  }
};

// ==================== PPAY ====================
const handleRechargeppay = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const money = req.body.amount;
    const type = req.body.type;

    if (!auth || !money || money <= 99) {
      return res.status(200).json({ message: "Minimum recharge 100", status: false, timeStamp: timeNow });
    }

    const [user] = await connection.query("SELECT phone, code, invite, isdemo FROM users WHERE token = ?", [auth]);
    if (!user.length) return res.status(200).json({ message: "User not found", status: false, timeStamp: timeNow });

    const userInfo = user[0];
    const checkTime = timerJoin2(Date.now());
    const time = timerJoin2(Date.now());

    if (userInfo.isdemo === 1) {
      const date = new Date();
      const id_time = `${date.getUTCFullYear()}${date.getUTCMonth() + 1}${date.getUTCDate()}`;
      const id_order = Math.floor(Math.random() * 90000000000000) + 10000000000000;
      const client_transaction_id = id_time + id_order;

      await connection.execute(
        "INSERT INTO recharge SET id_order=?, transaction_id=?, phone=?, money=?, type=?, status=?, today=?, url=?, time=?, isdemo=?",
        [client_transaction_id, "0", userInfo.phone, Number(money), type, 1, checkTime, "1", checkTime, 1]
      );
      await connection.execute("UPDATE users SET money = money + ? WHERE phone = ?", [Number(money), userInfo.phone]);
      return res.status(200).json({ message: "Demo Amount is added", status: false, timeStamp: timeNow });
    }

    const merchantId = "M514039";
    const appId = "69816d78559c22f8bbeac1e3";
    const orderId = `PP${Date.now()}`;
    const notify_url = "https://yaarclub.co/api/webapi/callbackdatappay";
    const return_url = "https://yaarclub.co";

    const params = {
      mchNo: merchantId,
      appId,
      mchOrderNo: orderId,
      amount: money * 100,
      customerName: "ZhanSan",
      customerEmail: "zhangn@gmail.com",
      customerPhone: "7867986679",
      notifyUrl: notify_url,
    };

    const key = "7xlnLgAsXTymRqIVQE7eUmEuOKSvLDKpDk7sxhf3a6VqCRl4tDqoLCZrALzJ4HtebJ2QgXHYFPVML9Hfz8kM4C4VGvb3z5h1BRR5Ij5irkONjnDOuYw98oQ6BRFnG6YY";
    params.sign = md5Sign2(params, key);

    const response = await axios.post("https://pay.ppaypros.com/api/pay/pay", params, {
      headers: { "Content-Type": "application/json" },
    });

    if (response?.data?.code === 0) {
      await connection.execute(
        "INSERT INTO recharge SET id_order=?, transaction_id=?, phone=?, money=?, type=?, status=?, today=?, url=?, time=?, userStatus=?",
        [orderId, "0", userInfo.phone, money, type, 0, checkTime, "0", time, 0]
      );
      return res.status(200).json({ message: "Payment Initiated successfully", data: response.data?.data, status: true });
    }

    return res.status(200).json({ message: "Payment failed", data: response.data?.data, status: false });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.response?.data || error.message,
    });
  }
};

const callbackdatappay = async (req, res) => {
  const { payOrderId, mchOrderNo } = req.body;

  try {
    const merchantId = "M514039";
    const appId = "69816d78559c22f8bbeac1e3";

    const params = { mchNo: merchantId, appId, payOrderId, mchOrderNo };
    const key = "7xlnLgAsXTymRqIVQE7eUmEuOKSvLDKpDk7sxhf3a6VqCRl4tDqoLCZrALzJ4HtebJ2QgXHYFPVML9Hfz8kM4C4VGvb3z5h1BRR5Ij5irkONjnDOuYw98oQ6BRFnG6YY";
    params.sign = md5Sign2(params, key);

    const response = await axios.post("https://pay.ppaypros.com/api/pay/query", params, {
      headers: { "Content-Type": "application/json" },
    });

    if (response?.data?.code === 0) {
      const [info] = await connection.query("SELECT * FROM recharge WHERE id_order = ?", [mchOrderNo]);
      if (!info.length) return console.log("Transaction not found.");

      if (info[0].status === 1) {
        return console.log("Recharge status is already completed. Skipping user money update.");
      }

      const checkTime = timerJoin2(Date.now());
      const [Firstrecharge] = await connection.query(
        "SELECT * FROM recharge WHERE phone = ? AND status = ?",
        [info[0].phone, 1]
      );

      let bonus = 0;
      if (info[0].money == 300) bonus = 48;
      else if (info[0].money == 500) bonus = 108;
      else if (info[0].money == 1000) bonus = 188;
      else if (info[0].money == 5000) bonus = 288;
      else if (info[0].money == 10000) bonus = 488;
      else if (info[0].money == 50000) bonus = 5000;
      else if (info[0].money == 100000) bonus = 12000;
      else bonus = info[0].money * 0.03;

      if (Firstrecharge.length === 0) {
        await connection.execute(
          "INSERT INTO transaction SET purpose=?, phone=?, money=?, type=?, status=?, level=?, today=?, time=?",
          ["Big Recharge Bonus", info[0].phone, bonus, "credit", 1, 1, checkTime, checkTime]
        );
        await connection.query(
          "UPDATE users SET money = money + ?, total_money = total_money + ?, recharge=recharge+? WHERE phone = ?",
          [bonus, bonus, bonus, info[0].phone]
        );
        await connection.query(
          "INSERT INTO transaction_history SET phone=?, detail=?, balance=?, time=?",
          [info[0].phone, "First deposit bonus", bonus, checkTime]
        );

        const refferal = info[0]?.invite;
        if (refferal !== undefined) {
          const [refferaluser] = await connection.query("SELECT * FROM users WHERE code = ? LIMIT 1", [refferal]);
          if (refferaluser.length && refferaluser[0]?.phone) {
            await connection.query(
              "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?",
              [18, 18, refferaluser[0].phone]
            );
            await connection.query(
              "INSERT INTO transaction_history SET phone=?, detail=?, balance=?, time=?",
              [refferaluser[0].phone, "Active member", 18, checkTime]
            );
          }
        }
      } else {
        await connection.query(
          "UPDATE users SET money = money + ?, total_money = total_money + ?, recharge=recharge+? WHERE phone = ?",
          [bonus, bonus, bonus, info[0].phone]
        );
      }

      await connection.query("UPDATE recharge SET status = 1 WHERE id_order = ?", [mchOrderNo]);
      await connection.query(
        "UPDATE users SET money = money + ?, total_money = total_money + ?, recharge=recharge+?, totalRecharge=totalRecharge+? WHERE phone = ?",
        [info[0].money, info[0].money, info[0].money, info[0].money, info[0].phone]
      );
      await connection.query(
        "INSERT INTO transaction_history SET phone=?, detail=?, balance=?, time=?",
        [info[0].phone, "Deposit", info[0].money, checkTime]
      );
    }

    return res.json("success");
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.response?.data || error.message,
    });
  }
};

const wowpay = async (req, res) => {
  // Placeholder - implement as needed
};

// ==================== EXPORTS ====================
module.exports = {
  zilpayCallback, zilpay,
  verifyTrexoPayPayment, initiateTrexoPayPayment,
  callbackdata, recharge3, handleRechargeppay, callbackdatappay,
  userInfo, searchUser, changeUser, changePassword, changeUserPhoto,
  promotion, myTeam, wowpay, recharge, onlineRecharge, handleCallback,
  recharge2, listRecharge, listWithdraw, checkInHandling,
  infoUserBank, addBank, withdrawal3, transfer, transferHistory,
  callback_bank, listMyTeam, verifyCode, aviator, useRedenvelope,
  getRedenvelope, search, updateRecharge, confirmRecharge, addutr,
  cancelRecharge, downlinerecharge, downlinerecharge_data, confirmUSDTRecharge,
  totalCommission, transactionHistory, subordinatedata, newSubordinateData,
  calculateDownlineBonuses, getRebate, rebateCreate, feedback,
  vipLevel, vipLevelEvery, vipLevelMonthly, commissiondata,
  userProblem, userProblemGet, adminProblemGet, adminProblemSubmit,
  getpromotiondata, updateRandomPromotion, makePromotion, getVipData,
  dailyBetCommition, getInvitationBonus, getSpinData, claimSpin,
  redeemSpin, getdailyactivyreward, spineHistory, listRecharge2, addUSDT,
};