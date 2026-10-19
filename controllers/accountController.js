import crypto from "crypto";
import jwt from "jsonwebtoken";
import md5 from "md5";
import nodemailer from "nodemailer";
import request from "request";
import connection from "../config/connectDB";
const util = require("util");
require("dotenv").config();

const timeNow = Date.now();

// ==================== CONFIG ====================
const FAST2SMS_AUTH = process.env.FAST2SMS_AUTH || "Cl8g0hU2NaGfsKdRexa2kH5Z3ObWMIN7fObXsLRW7IJFmDST9bbcU6cO7wMQ";
const DEFAULT_INVITE_CODE = process.env.DEFAULT_INVITE_CODE || "xWtUd92947";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ==================== HELPERS ====================
const randomString = (length) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const randomNumber = (min, max) => String(Math.floor(Math.random() * (max - min + 1)) + min);

const isNumber = (params) => /^[0-9]+$/.test(String(params));

const ipAddress = (req) => {
  if (req.headers["x-forwarded-for"]) return req.headers["x-forwarded-for"].split(",")[0].trim();
  if (req.connection?.remoteAddress) return req.connection.remoteAddress;
  return req.ip || "";
};

const timeCreate = () => Date.now();

const md5Async = (text) => Promise.resolve(md5(text));

function timerJoin2(params = "", addHours = 0) {
  const date = params ? new Date(Number(params)) : new Date();
  if (addHours !== 0) date.setHours(date.getHours() + addHours);

  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  };
  const formatter = new Intl.DateTimeFormat("en-GB", options);
  const parts = formatter.formatToParts(date);
  const getPart = (type) => parts.find((p) => p.type === type).value;

  return `${getPart("year")}-${getPart("month")}-${getPart("day")} ${getPart("hour")}:${getPart("minute")}:${getPart("second")}`;
}

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

async function logUserAction({ user_phone, action_type, action_id, money, status, ip_address, user_agent, info }) {
  try {
    await connection.execute(
      `INSERT INTO user_action_log (user_phone, action_type, action_id, money, status, ip_address, user_agent, info)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_phone ?? null, action_type ?? null, action_id ?? null, money ?? null,
        status ?? null, ip_address ?? null, user_agent ?? null, info ?? null,
      ]
    );
  } catch (err) {
    console.error("Log user action error:", err.message);
  }
}

// Send SMS via Fast2SMS — returns true if accepted
const sendSMS = (phone, otp) =>
  new Promise((resolve) => {
    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_AUTH}&variables_values=${otp}&route=otp&numbers=${phone}`;
    request(url, (error, response, body) => {
      if (error) return resolve(false);
      try {
        const data = JSON.parse(body);
        resolve(data.return === true || data.code === "00000");
      } catch {
        resolve(false);
      }
    });
  });

// ==================== PAGE RENDERERS ====================
const loginPage = async (req, res) => res.render("account/login.ejs");
const login2Page = async (req, res) => res.render("account/login2.ejs");
const registerPage = async (req, res) => res.render("account/register.ejs");
const forgotPage = async (req, res) => res.render("account/forgot.ejs");
const curtainPage = async (req, res) => res.render("account/curtain.ejs");

// ==================== LOGIN ====================
const login = async (req, res) => {
  const { username, pwd } = req.body;
  const ip = ipAddress(req);
  const agent = req.headers["user-agent"] || "";

  if (!username || !pwd) {
    return res.status(200).json({ message: "Please enter all fields", status: false });
  }

  try {
    const hashedPwd = md5(pwd);

    const [rows] = await connection.query(
      "SELECT phone, status, bonus_gain FROM users WHERE phone = ? AND password = ?",
      [username, hashedPwd]
    );

    if (!rows.length) {
      return res.status(200).json({ message: "Incorrect Username or Password", status: false });
    }

    const user = rows[0];
    if (user.status !== 1) {
      return res.status(200).json({ message: "Account has been locked", status: false });
    }

    const payload = { user: { phone: user.phone }, timeNow: Date.now() };
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN, { expiresIn: "1d" });
    const hashedToken = md5(accessToken);

    await Promise.all([
      connection.execute("INSERT INTO login SET phone = ?", [user.phone]),
      connection.execute(
        "UPDATE users SET token = ?, login_at = CURRENT_TIMESTAMP WHERE phone = ?",
        [hashedToken, username]
      ),
    ]);

    logUserAction({
      user_phone: username, action_type: "login", money: 0, status: "success",
      ip_address: ip, user_agent: agent, info: JSON.stringify({ message: "Login successful" }),
    }).catch(console.error);

    return res.status(200).json({
      message: "Login Successful",
      status: true,
      token: accessToken,
      value: hashedToken,
    });
  } catch (error) {
    console.error("login:", error);
    return res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

// ==================== REGISTER ====================
const register = async (req, res) => {
  const { username, pwd, cpass, invitecode: rawInvite } = req.body;
  const otp2 = randomNumber(100000, 999999);
  const name_user = "Member" + randomNumber(10000, 99999);
  const code = randomNumber(10000, 99999);
  const ip = ipAddress(req);
  const time = timeCreate();
  const agent = req.headers["user-agent"] || "";
  const invitecode = rawInvite || DEFAULT_INVITE_CODE;

  if (!username || !pwd) {
    return res.status(200).json({ message: "Please enter all field", status: false });
  }
  if (username.length < 9 || username.length > 10 || !isNumber(username)) {
    return res.status(200).json({ message: "phone error", status: false });
  }
  if (pwd !== cpass) {
    return res.status(200).json({ message: "Invalid confirm password", status: false });
  }

  try {
    const [adminRows] = await connection.query("SELECT sinupbonus FROM admin");
    const sinupBonus = adminRows[0]?.sinupbonus || 0;

    const [check_u] = await connection.query("SELECT * FROM users WHERE phone = ?", [username]);
    if (check_u.length === 1 && check_u[0].veri === 1) {
      return res.status(200).json({
        message: "Registered phone number",
        error: "Registered phone number",
        status: false,
      });
    }

    const [check_i] = await connection.query("SELECT * FROM users WHERE code = ?", [invitecode]);
    if (check_i.length !== 1) {
      return res.status(200).json({ message: "Referrer code does not exist", status: false });
    }

    const [attendencs_bonus] = await connection.query("SELECT * FROM `attendencs-bonus`");
    const attendencsDta = attendencs_bonus[0] || {};

    let ctv = "";
    if (check_i[0].level === 2) ctv = check_i[0].phone;
    else ctv = check_i[0].ctv;

    const [maxIdRows] = await connection.execute(
      "SELECT COALESCE(MAX(id_user), 0) AS max_id FROM users"
    );
    const id_user = Number(maxIdRows[0].max_id) + 1;

    const accessToken = jwt.sign(
      { id: id_user, phone: username, name_user },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: "1d" }
    );
    const token = md5(accessToken);

    await connection.execute(
      `INSERT INTO users SET 
        id_user = ?, phone = ?, token = ?, name_user = ?, password = ?, plain_password = ?,
        money = ?, recharge = ?, code = ?, invite = ?, ctv = ?, veri = ?, otp = ?,
        ip_address = ?, status = ?, message = ?, time = ?`,
      [
        id_user, username, token, name_user, md5(pwd), pwd,
        sinupBonus, sinupBonus, code + id_user, invitecode, ctv,
        1, otp2, ip, 1, 0, time,
      ]
    );

    await connection.execute(
      "INSERT INTO point_list SET total1 = ?, total2 = ?, total3 = ?, total4 = ?, total5 = ?, total6 = ?, total7 = ?, phone = ?",
      [
        attendencsDta.day1 || 0, attendencsDta.day2 || 0, attendencsDta.day3 || 0,
        attendencsDta.day4 || 0, attendencsDta.day5 || 0, attendencsDta.day6 || 0,
        attendencsDta.day7 || 0, username,
      ]
    );

    await connection.query(
      "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, time = ?",
      [username, "Signup Bonus", sinupBonus, time]
    );

    // Update upline user_level
    const [check_code] = await connection.query("SELECT * FROM users WHERE invite = ?", [invitecode]);
    if (check_i[0].name_user !== "Admin") {
      const thresholds = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44];
      for (let i = 0; i < thresholds.length; i++) {
        if (check_code.length >= thresholds[i]) {
          await connection.execute(
            "UPDATE users SET user_level = ? WHERE code = ?",
            [i + 1, invitecode]
          );
        } else break;
      }
    }

    await connection.query(
      "INSERT INTO turn_over SET phone = ?, code = ?, invite = ?",
      [username, code, invitecode]
    );

    await logUserAction({
      user_phone: username, action_type: "Register", action_id: null, money: 0,
      status: "success", ip_address: ip, user_agent: agent,
      info: JSON.stringify({ message: "Register successful" }),
    });

    return res.status(200).json({
      message: "Registered successfully",
      status: true,
      data: token,
    });
  } catch (error) {
    console.error("register:", error);
    return res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

// ==================== ADMIN LOGIN (with OTP) ====================
const loginAdmin = async (req, res) => {
  const { username, pwd } = req.body;
  if (!username || !pwd) {
    return res.status(200).json({ message: "Please enter all field", status: false });
  }

  try {
    const [rows] = await connection.query(
      "SELECT phone, status, email, level FROM users WHERE phone = ? AND password = ? AND level = 1",
      [username, md5(pwd)]
    );

    if (rows.length !== 1) {
      return res.status(200).json({ message: "Incorrect Username or Password", status: false });
    }

    const admin = rows[0];
    if (admin.status !== 1) {
      return res.status(200).json({ message: "Account has been locked", status: false });
    }

    const otp = randomNumber(100000, 999999);
    const timeEnd = Date.now() + 1000 * 60 * 5;

    await connection.execute(
      "UPDATE users SET otp = ?, time_otp = ? WHERE phone = ?",
      [otp, timeEnd, username]
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: admin.email || process.env.ADMIN_EMAIL,
      subject: "Admin Login OTP",
      text: `Your admin login OTP is ${otp}. Valid for 5 minutes. Do not share.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending OTP:", error);
        return res.status(500).json({ message: "OTP send failed", status: false });
      }
      return res.status(200).json({
        message: "OTP sent to registered email",
        status: true,
        otpRequired: true,
        phone: username,
        timeEnd,
      });
    });
  } catch (error) {
    console.error("loginAdmin:", error);
    return res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

const verifyAdminOTP = async (req, res) => {
  const { username, otp } = req.body;
  if (!username || !otp) {
    return res.status(200).json({ message: "Phone and OTP required", status: false });
  }

  try {
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE phone = ? AND level = 1",
      [username]
    );
    if (rows.length !== 1) {
      return res.status(200).json({ message: "Admin not found", status: false });
    }

    const admin = rows[0];

    if (!admin.time_otp || Number(admin.time_otp) < Date.now()) {
      return res.status(200).json({ message: "OTP expired. Please login again.", status: false });
    }
    if (String(admin.otp) !== String(otp)) {
      return res.status(200).json({ message: "Invalid OTP", status: false });
    }

    const {
      password, money, ip, veri, ip_address, status, time,
      otp: _otp, time_otp, ...others
    } = admin;

    const accessToken = jwt.sign(
      { user: { ...others }, timeNow: Date.now() },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: "1d" }
    );
    const hashedToken = md5(accessToken);

    await connection.execute(
      "UPDATE users SET token = ?, otp = NULL, time_otp = NULL, login_at = CURRENT_TIMESTAMP WHERE phone = ?",
      [hashedToken, username]
    );

    if (req.session) req.session.token = hashedToken;

    await logUserAction({
      user_phone: username, action_type: "admin_login", money: 0, status: "success",
      ip_address: ipAddress(req), user_agent: req.headers["user-agent"] || "",
      info: JSON.stringify({ message: "Admin login via OTP" }),
    });

    return res.status(200).json({
      message: "Login Successful",
      status: true,
      token: accessToken,
      value: hashedToken,
    });
  } catch (error) {
    console.error("verifyAdminOTP:", error);
    return res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

// ==================== VERIFY CODE (for registration) ====================
const verifyCodeforregister = async (req, res) => {
  try {
    const phone = req.body.phone;
    const timeEnd = Date.now() + 1000 * 120 + 500;
    const otp = randomNumber(100000, 999999);

    if (!phone || !isNumber(phone)) {
      return res.status(200).json({ message: "phone error", status: false });
    }

    const ok = await sendSMS(phone, otp);
    if (!ok) {
      return res.status(200).json({ message: "Failed to send OTP", status: false });
    }

    await connection.execute(
      "UPDATE users SET otp = ?, time_otp = ? WHERE phone = ?",
      [otp, timeEnd, phone]
    );

    return res.status(200).json({
      message: "OTP Send Successfully",
      status: true,
      timeStamp: timeNow,
      timeEnd,
    });
  } catch (error) {
    console.error("verifyCodeforregister:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== VERIFY CODE (universal) ====================
const verifyCode = async (req, res) => {
  try {
    const phone = req.body.phone;
    const now = Date.now();
    const timeEnd = now + 1000 * 120 + 500;
    const otp = randomNumber(100000, 999999);
    const lastDigit = String(phone).slice(-1);

    if (!phone || phone.length < 9 || phone.length > 10 || !isNumber(phone)) {
      return res.status(200).json({ message: "phone error", status: false });
    }

    const [rows] = await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);

    if (rows.length === 0) {
      // New user — send SMS then create
      const ok = await sendSMS(phone, otp);
      if (!ok) {
        return res.status(200).json({ message: "Failed to send OTP", status: false });
      }
      await connection.execute(
        "INSERT INTO users SET userPhoto = ?, phone = ?, otp = ?, veri = 0, time_otp = ?",
        [lastDigit, phone, otp, timeEnd]
      );
      return res.status(200).json({
        message: "Submitted successfully",
        status: true,
        timeStamp: timeNow,
        timeEnd,
      });
    }

    const user = rows[0];
    if (user.time_otp - now > 0) {
      return res.status(200).json({
        message: "Send SMS regularly",
        status: false,
        timeStamp: timeNow,
      });
    }

    const ok = await sendSMS(phone, otp);
    if (!ok) {
      return res.status(200).json({ message: "Failed to send OTP", status: false });
    }

    await connection.execute(
      "UPDATE users SET otp = ?, time_otp = ? WHERE phone = ?",
      [otp, timeEnd, phone]
    );

    return res.status(200).json({
      message: "Submitted successfully",
      status: true,
      timeStamp: timeNow,
      timeEnd,
    });
  } catch (error) {
    console.error("verifyCode:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== GET LOGIN DETAILS ====================
const getLoginDetail = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const [user] = await connection.execute(
      "SELECT phone FROM users WHERE token = ?",
      [auth]
    );
    if (!user.length) {
      return res.status(200).json({ message: "Error: User not found", status: false });
    }

    const [loginDetails] = await connection.execute(
      "SELECT * FROM login WHERE phone = ? ORDER BY id DESC",
      [user[0].phone]
    );

    if (!loginDetails.length) {
      return res.status(200).json({ message: "Error: Login details not found", status: false });
    }

    return res.status(200).json({
      message: "Login details retrieved successfully",
      status: true,
      data: loginDetails,
    });
  } catch (error) {
    console.error("getLoginDetail:", error);
    return res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

const deleteLoginDetail = async (req, res) => {
  const { id } = req.body;
  const auth = req.cookies.auth;
  try {
    const [user] = await connection.execute(
      "SELECT phone FROM users WHERE token = ?",
      [auth]
    );
    if (!user.length) {
      return res.status(404).json({ message: "Error: User not found", status: false });
    }

    const [result] = await connection.execute(
      "DELETE FROM login WHERE id = ? AND phone = ?",
      [id, user[0].phone]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Error: Login detail not found or not authorized to delete",
        status: false,
      });
    }

    return res.status(200).json({ message: "Login detail deleted successfully", status: true });
  } catch (error) {
    console.error("deleteLoginDetail:", error);
    return res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

// ==================== VERIFY CODE FOR PASSWORD RESET ====================
const verifyCodePass = async (req, res) => {
  try {
    const phone = req.body.phone;
    const now = Date.now();
    const timeEnd = now + 1000 * 120 + 500;
    const otp = randomNumber(100000, 999999);

    if (!phone || phone.length < 9 || phone.length > 10 || !isNumber(phone)) {
      return res.status(200).json({ message: "phone error", status: false });
    }

    const [rows] = await connection.query(
      "SELECT * FROM users WHERE phone = ? AND veri = 1",
      [phone]
    );
    if (!rows.length) {
      return res.status(200).json({ message: "Account does not exist", status: false, timeStamp: timeNow });
    }

    const user = rows[0];
    if (user.time_otp - now > 0) {
      return res.status(200).json({
        message: "Send SMS regularly",
        status: false,
        timeStamp: timeNow,
      });
    }

    const ok = await sendSMS(phone, otp);
    if (!ok) {
      return res.status(200).json({ message: "Failed to send OTP", status: false });
    }

    await connection.execute(
      "UPDATE users SET otp = ?, time_otp = ? WHERE phone = ?",
      [otp, timeEnd, phone]
    );

    return res.status(200).json({
      message: "Submitted successfully",
      status: true,
      timeStamp: timeNow,
      timeEnd,
    });
  } catch (error) {
    console.error("verifyCodePass:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== FORGOT PASSWORD ====================
const forGotPassword = async (req, res) => {
  try {
    const { username, otp, pwd } = req.body;
    const now = Date.now();
    const timeEnd = now + 1000 * 120 + 500;
    const otp2 = randomNumber(100000, 999999);

    if (!username || username.length < 9 || username.length > 10 || !isNumber(username)) {
      return res.status(200).json({ message: "phone error", status: false });
    }

    const [rows] = await connection.query(
      "SELECT * FROM users WHERE phone = ? AND veri = 1",
      [username]
    );
    if (!rows.length) {
      return res.status(200).json({ message: "Account does not exist", status: false, timeStamp: timeNow });
    }

    const user = rows[0];

    if (user.time_otp - now <= 0) {
      return res.status(200).json({ message: "OTP code has expired", status: false, timeStamp: timeNow });
    }
    if (String(user.otp) !== String(otp)) {
      return res.status(200).json({ message: "OTP code is incorrect", status: false, timeStamp: timeNow });
    }

    await connection.execute(
      "UPDATE users SET password = ?, otp = ?, time_otp = ? WHERE phone = ?",
      [md5(pwd), otp2, timeEnd, username]
    );

    return res.status(200).json({
      message: "Change password successfully",
      status: true,
      timeStamp: timeNow,
      timeEnd,
    });
  } catch (error) {
    console.error("forGotPassword:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== SUPPORT MENU ====================
const keFuMenu = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const [users] = await connection.query(
      "SELECT level, ctv FROM users WHERE token = ?",
      [auth]
    );

    let telegram = "";
    if (!users.length) {
      const [settings] = await connection.query("SELECT telegram, cskh FROM admin");
      telegram = settings[0]?.telegram || "";
    } else if (users[0].level !== 0) {
      const [settings] = await connection.query("SELECT telegram FROM admin");
      telegram = settings[0]?.telegram || "";
    } else {
      const [check] = await connection.query(
        "SELECT telegram FROM point_list WHERE phone = ?",
        [users[0].ctv]
      );
      if (!check.length) {
        const [settings] = await connection.query("SELECT telegram FROM admin");
        telegram = settings[0]?.telegram || "";
      } else {
        telegram = check[0].telegram || "";
      }
    }

    return res.render("keFuMenu.ejs", { telegram });
  } catch (error) {
    console.error("keFuMenu:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== EMAIL OTP ====================
const sendOTPOnEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const auth = req.cookies.auth;

    const [user] = await connection.query(
      "SELECT phone FROM users WHERE token = ?",
      [auth]
    );
    if (!user.length) {
      return res.status(401).json({ message: "Unauthorized", status: false });
    }

    const otp = generateOTP();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for the next 10 minutes.`,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error("Error sending OTP:", error);
        return res.status(500).json({ message: "Email send failed", status: false });
      }
      await connection.query(
        "UPDATE users SET email = ?, otp = ? WHERE phone = ?",
        [email, otp, user[0].phone]
      );
      return res.status(200).json({
        status: true,
        message: "Email send successfully",
        data: info.response,
      });
    });
  } catch (error) {
    console.error("sendOTPOnEmail:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

const submitEmail = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const auth = req.cookies.auth;

    const [user] = await connection.query(
      "SELECT phone, otp, email FROM users WHERE token = ?",
      [auth]
    );
    if (!user.length) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    const userInfo = user[0];
    if (String(userInfo.otp) !== String(otp)) {
      return res.status(400).json({ status: false, message: "Invalid Otp" });
    }
    if (userInfo.email !== email) {
      return res.status(400).json({ status: false, message: "Invalid email" });
    }

    return res.status(200).json({ status: true, message: "successfully" });
  } catch (error) {
    console.error("submitEmail:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

// ==================== EMAIL LOGIN ====================
const loginEmail = async (req, res) => {
  const { email, pwd } = req.body;
  if (!email || !pwd) {
    return res.status(200).json({ message: "Please enter all field", status: false });
  }

  try {
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, md5(pwd)]
    );
    if (rows.length !== 1) {
      return res.status(200).json({ message: "Incorrect Username or Password", status: false });
    }

    if (rows[0].status !== 1) {
      return res.status(200).json({ message: "Account has been locked", status: false });
    }

    const { password, money, ip, veri, ip_address, status, time, ...others } = rows[0];
    const accessToken = jwt.sign(
      { user: { ...others }, timeNow: Date.now() },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: "1d" }
    );
    const hashedToken = md5(accessToken);

    await connection.execute("INSERT INTO login SET phone = ?", [rows[0].phone]);
    await connection.execute(
      "UPDATE users SET token = ?, login_at = CURRENT_TIMESTAMP WHERE email = ?",
      [hashedToken, email]
    );

    return res.status(200).json({
      message: "Login Successful",
      status: true,
      token: accessToken,
      value: hashedToken,
    });
  } catch (error) {
    console.error("loginEmail:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== LOGIN COUNTERS ====================
const getLogincount = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const [user] = await connection.execute(
      "SELECT phone FROM users WHERE token = ?",
      [auth]
    );
    if (!user.length) {
      return res.status(200).json({ message: "Error: User not found", status: false });
    }

    const [data] = await connection.query(
      "SELECT * FROM login WHERE phone = ? AND purpose = 0",
      [user[0].phone]
    );

    return res.status(200).json({
      message: "read successfully",
      status: true,
      data: data.length,
    });
  } catch (error) {
    console.error("getLogincount:", error);
    return res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

const getLoginupdate = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const [user] = await connection.execute(
      "SELECT phone FROM users WHERE token = ?",
      [auth]
    );
    if (!user.length) {
      return res.status(200).json({ message: "Error: User not found", status: false });
    }

    await connection.execute(
      "UPDATE login SET purpose = 1 WHERE phone = ?",
      [user[0].phone]
    );

    return res.status(200).json({ message: "read successfully", status: true });
  } catch (error) {
    console.error("getLoginupdate:", error);
    return res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

// ==================== CAPTCHA ====================
const handleCaptcha = async (req, res) => {
  try {
    const [rows] = await connection.query(
      "SELECT captchaId, backgroundImage, sliderImage, correctPositionx FROM captcha_data ORDER BY RAND() LIMIT 1"
    );

    if (!rows.length) {
      return res.status(404).json({
        code: 8,
        msg: "No captcha data found",
        msgCode: 9,
        serviceNowTime: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      });
    }

    const row = rows[0];
    return res.status(200).json({
      code: 0,
      msg: "success",
      data: {
        captchaId: row.captchaId,
        backgroundImage: row.backgroundImage,
        sliderImage: row.sliderImage,
        correctPositionx: row.correctPositionx,
      },
    });
  } catch (err) {
    console.error("handleCaptcha:", err);
    return res.status(500).json({ code: 500, msg: "Internal server error", msgCode: 500 });
  }
};

// ==================== EXPORTS ====================
module.exports = {
  login,
  register,
  getLogincount,
  getLoginupdate,
  verifyAdminOTP,
  loginPage,
  registerPage,
  forgotPage,
  curtainPage,
  verifyCode,
  verifyCodePass,
  forGotPassword,
  keFuMenu,
  verifyCodeforregister,
  getLoginDetail,
  deleteLoginDetail,
  sendOTPOnEmail,
  submitEmail,
  loginEmail,
  login2Page,
  loginAdmin,
  handleCaptcha,
};