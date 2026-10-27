import crypto from "crypto";
import jwt from "jsonwebtoken";
import md5 from "md5";
import nodemailer from "nodemailer";
import request from "request";
import connection from "../config/connectDB";
const util = require("util");
const twilio = require("twilio");
require("dotenv").config();

let timeNow = Date.now();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

// async function sendSMS() {
//   try {
//     const message = await client.messages.create({
//       body: 'Hello from Node.js + Twilio! 🚀',
//       from: "+15182630792", // your Twilio number
//       to: '+919719212742' // recipient phone number
//     });

//     console.log('✅ Message sent successfully!');
//     console.log('SID:', message.sid);
//   } catch (error) {
//     console.error('❌ Error sending message:', error);
//   }
// }

// sendSMS();

const randomString = (length) => {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const randomNumber = (min, max) => {
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

const isNumber = (params) => {
  let pattern = /^[0-9]*\d$/;
  return pattern.test(params);
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

const loginPage = async (req, res) => {
  return res.render("account/login.ejs");
};

const login2Page = async (req, res) => {
  return res.render("account/login2.ejs");
};

const registerPage = async (req, res) => {
  return res.render("account/register.ejs");
};

const forgotPage = async (req, res) => {
  return res.render("account/forgot.ejs");
};

const curtainPage = async (req, res) => {
  return res.render("account/curtain.ejs");
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
    "day",
  )} ${getPart("hour")}:${getPart("minute")}:${getPart("second")}`;

  return formattedDate;
}

// timerJoin2(Date.now())

async function logUserAction({
  user_phone,
  action_type,
  action_id,
  money,
  status,
  ip_address,
  user_agent,
  info,
}) {
  // Replace all undefined with null (safe for DB)
  user_phone = typeof user_phone === "undefined" ? null : user_phone;
  action_type = typeof action_type === "undefined" ? null : action_type;
  action_id = typeof action_id === "undefined" ? null : action_id;
  money = typeof money === "undefined" ? null : money;
  status = typeof status === "undefined" ? null : status;
  ip_address = typeof ip_address === "undefined" ? null : ip_address;
  user_agent = typeof user_agent === "undefined" ? null : user_agent;
  info = typeof info === "undefined" ? null : info;

  try {
    await connection.execute(
      `INSERT INTO user_action_log (user_phone, action_type, action_id, money, status, ip_address, user_agent, info)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_phone,
        action_type,
        action_id,
        money,
        status,
        ip_address,
        user_agent,
        info,
      ],
    );
  } catch (err) {
    console.error("Log user action error:", err.message);
  }
}

const md5Async = (text) =>
  new Promise((resolve) =>
    resolve(crypto.createHash("md5").update(text).digest("hex")),
  );

const login = async (req, res) => {
  const { username, pwd } = req.body;
  const ip = ipAddress(req);
  const agent = req.headers["user-agent"] || "";

  if (!username || !pwd) {
    return res
      .status(200)
      .json({ message: "Please enter all fields", status: false });
  }

  try {
    // 1. Hash password asynchronously
    const hashedPwd = await md5Async(pwd);

    // 2. Select only necessary fields
    const [rows] = await connection.query(
      `SELECT phone, password, status, bonus_gain, token 
       FROM users WHERE phone = ? AND password = ?`,
      [username, hashedPwd],
    );

    if (!rows.length) {
      return res
        .status(200)
        .json({ message: "Incorrect Username or Password", status: false });
    }

    const user = rows[0];

    if (user.status !== 1) {
      return res
        .status(200)
        .json({ message: "Account has been locked", status: false });
    }

    // 3. Generate JWT asynchronously (offload CPU if needed)
    const payload = { user: { phone: user.phone }, timeNow: Date.now() };
    const accessToken = await util.promisify(jwt.sign)(
      payload,
      process.env.JWT_ACCESS_TOKEN,
      {
        expiresIn: "1d",
      },
    );

    // 4. Batch SQL operations
    const queries = [];

    // Insert login record
    queries.push(
      connection.execute("INSERT INTO login SET phone = ?", [user.phone]),
    );

    // Update token & login timestamp
    queries.push(
      connection.execute(
        "UPDATE users SET token = ?, login_at = CURRENT_TIMESTAMP WHERE phone = ?",
        [await md5Async(accessToken), username],
      ),
    );

    //// Bonus logic (optional: only if bonus_gain == 0)
    //if (user.bonus_gain === 0) {
    //  const checkTime = timerJoin2(Date.now());
    //  const money = 0; // your bonus logic here
    //  queries.push(
    //    connection.execute(
    //      `INSERT INTO transaction SET purpose = ?, phone = ?, money = ?, type = ?, status = ?, level = ?, today = ?, time = ?`,
    //      ["Daily Login Bonus", user.phone, money, "credit", 1, 1, checkTime, checkTime]
    //    )
    //  );
    //  queries.push(
    //    connection.execute(
    //      "UPDATE users SET money = money + ?, bonus_gain = ?, total_money = total_money + ? WHERE phone = ?",
    //      [money, money, money, user.phone]
    //    )
    //  );
    //}

    // Run all SQL in parallel
    await Promise.all(queries);

    // 5. Log user action (async, don't block response)
    logUserAction({
      user_phone: username,
      action_type: "login",
      money: 0,
      status: "success",
      ip_address: ip,
      user_agent: agent,
      info: JSON.stringify({ message: "Login successful" }),
    }).catch(console.error);

    return res.status(200).json({
      message: "Login Successful",
      status: true,
      token: accessToken,
      value: await md5Async(accessToken),
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", status: false });
  }
};

const register = async (req, res) => {
  let now = new Date().getTime();
  let { username, pwd, cpass, invitecode } = req.body;
  //  let id_user = randomNumber(10000, 99999);
  let otp2 = randomNumber(100000, 999999);
  let name_user = "Member" + randomNumber(10000, 99999);
  let code = randomNumber(10000, 99999);
  let ip = ipAddress(req);
  let time = timeCreate();

  const agent = req.headers["user-agent"] || "";

  if (!username || !pwd) {
    return res.status(200).json({
      message: "Please enter all field",
      status: false,
    });
  }

  if (username.length < 9 || username.length > 10 || !isNumber(username)) {
    return res.status(200).json({
      message: "phone error",
      status: false,
    });
  }
  if (pwd != cpass) {
    return res.status(200).json({
      message: "Invalid confirm password",
      status: false,
    });
  }

  // If invitecode not provided by request body, use default
  if (!invitecode) {
    // invitecode = "xWtUd92947";
    invitecode = "46028100038";
  }

  try {
    const [admin] = await connection.query("SELECT * FROM `admin`");
    const sinupBonus = admin[0].sinupbonus;

    //console.log("sinupBonus", sinupBonus);

    const [check_u] = await connection.query(
      "SELECT * FROM users WHERE phone = ?",
      [username],
    );
    const [attendencs_bonus] = await connection.query(
      "SELECT * FROM `attendencs-bonus`",
    );

    let attendencsDta = attendencs_bonus[0];

    // //console.log("attendencs_bonus", attendencsDta);

    const [check_i] = await connection.query(
      "SELECT * FROM users WHERE code = ? ",
      [invitecode],
    );
    const [check_ip] = await connection.query(
      "SELECT * FROM users WHERE ip_address = ? ",
      [ip],
    );

    //   if (check_ip.length >= 1) {
    //         return res.status(200).json({
    //             message: 'Ip already Registered',
    //             error:"Ip already Registered ",
    //             status: false
    //         });
    //   }

    if (check_u.length == 1 && check_u[0].veri == 1) {
      return res.status(200).json({
        message: "Registered phone number",
        error: "Registered phone number",
        status: false,
      });
    } else {
      if (check_i.length == 1) {
        let ctv = "";
        if (check_i[0].level == 2) {
          ctv = check_i[0].phone;
        } else {
          ctv = check_i[0].ctv;
        }

        const [rows] = await connection.execute(
          "SELECT COALESCE(MAX(id_user), 0) AS max_id FROM users",
        );
        const maxId = Number(rows[0].max_id); // Convert to number
        const id_user = maxId + 1; // Add 1

        const userData = { id: maxId, phone: username, name_user };
        const accessToken = jwt.sign(userData, process.env.JWT_ACCESS_TOKEN, {
          expiresIn: "1d",
        });

        const token = md5(accessToken);

        const sql =
          "INSERT INTO users SET id_user = ?,phone = ?, token = ?, name_user = ?,password = ?, plain_password = ?, money = ?, recharge = ?, code = ?,invite = ?,ctv = ?,veri = ?,otp = ?,ip_address = ?,status = ?, message = ?, time = ?";
        await connection.execute(sql, [
          id_user,
          username,
          token,
          name_user,
          md5(pwd),
          pwd,
          sinupBonus,
          sinupBonus,
          code + id_user,
          invitecode,
          ctv,
          1,
          otp2,
          ip,
          1,
          0,
          time,
        ]);
        await connection.execute(
          "INSERT INTO point_list SET total1 = ?, total2 = ?, total3 = ?, total4 = ?, total5 = ?, total6 = ?, total7 = ?, phone = ?",
          [
            attendencsDta.day1,
            attendencsDta.day2,
            attendencsDta.day3,
            attendencsDta.day4,
            attendencsDta.day5,
            attendencsDta.day6,
            attendencsDta.day7,
            username,
          ],
        );

        const datasql =
          "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
        await connection.query(datasql, [
          username,
          "Signup Bonus",
          sinupBonus,
          time,
        ]);

        let [check_code] = await connection.query(
          "SELECT * FROM users WHERE invite = ? ",
          [invitecode],
        );

        if (check_i[0].name_user !== "Admin") {
          let levels = [
            2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44,
          ];

          for (let i = 0; i < levels.length; i++) {
            if (check_code.length >= levels[i]) {
              await connection.execute(
                "UPDATE users SET user_level = ? WHERE code = ?",
                [i + 1, invitecode],
              );
            } else {
              break;
            }
          }
        }

        let sql4 = "INSERT INTO turn_over SET phone = ?, code = ?, invite = ?";
        await connection.query(sql4, [username, code, invitecode]);

        await logUserAction({
          user_phone: username,
          action_type: "Register",
          action_id: null,
          money: 0,
          status: "success",
          ip_address: ip,
          user_agent: agent,
          info: JSON.stringify({ message: "Register successful" }),
        });

        return res.status(200).json({
          message: "Registered successfully",
          status: true,
          data: token,
        });
      } else {
        return res.status(200).json({
          message: "Referrer code does not exist",
          status: false,
        });
      }
    }
  } catch (error) {
    if (error) console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      status: false,
    });
  }
};

const loginAdmin = async (req, res) => {
  const { username, pwd } = req.body;

  if (!username || !pwd) {
    return res.status(200).json({
      message: "Please enter all fields",
      status: false,
    });
  }

  try {
    const [rows] = await connection.execute(
      `SELECT * FROM users
       WHERE phone = ? AND password = ? AND level = 1
       LIMIT 1`,
      [username, md5(pwd)],
    );

    if (rows.length !== 1) {
      return res.status(200).json({
        message: "Incorrect Username or Password",
        status: false,
      });
    }

    const admin = rows[0];

    if (Number(admin.status) !== 1) {
      return res.status(200).json({
        message: "Account has been locked",
        status: false,
      });
    }

    // Generate a six-digit OTP
    const otp = String(
      Math.floor(100000 + Math.random() * 900000),
    );

    // OTP expires after five minutes
    const timeEnd = Date.now() + 5 * 60 * 1000;

    // Save OTP and expiry in MySQL
    await connection.execute(
      `UPDATE users
       SET otp = ?, time_otp = ?
       WHERE phone = ? AND level = 1`,
      [otp, String(timeEnd), username],
    );

    const recipient = admin.email || process.env.ADMIN_EMAIL;

    if (!recipient) {
      // Clear OTP if no recipient is configured
      await connection.execute(
        `UPDATE users SET otp = '', time_otp = ''
         WHERE phone = ? AND level = 1`,
        [username],
      );

      return res.status(500).json({
        message: "Admin email is not configured",
        status: false,
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient,
      subject: "Admin Login OTP",
      text: `Your admin login OTP is ${otp}. It is valid for 5 minutes. Do not share it.`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Error sending admin OTP:", emailError.message);

      // Clear OTP when email delivery fails
      await connection.execute(
        `UPDATE users SET otp = '', time_otp = ''
         WHERE phone = ? AND level = 1`,
        [username],
      );

      return res.status(500).json({
        message: "OTP send failed",
        status: false,
      });
    }

    return res.status(200).json({
      message: "OTP sent to registered email",
      status: true,
      otpRequired: true,
      phone: username,
      timeEnd,
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    return res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  }
};


const verifyAdminOTP = async (req, res) => {
  const { username, otp } = req.body;

  if (!username || otp === undefined || otp === null || otp === "") {
    return res.status(200).json({
      message: "Phone and OTP required",
      status: false,
    });
  }

  // Accept only six-digit OTPs
  if (!/^\d{6}$/.test(String(otp))) {
    return res.status(200).json({
      message: "Invalid OTP",
      status: false,
    });
  }

  let dbConnection;

  try {
    // Use a transaction to prevent simultaneous OTP verification
    dbConnection = await connection.getConnection();
    await dbConnection.beginTransaction();

    const [rows] = await dbConnection.execute(
      `SELECT * FROM users
       WHERE phone = ? AND level = 1
       LIMIT 1
       FOR UPDATE`,
      [username],
    );

    if (rows.length !== 1) {
      await dbConnection.rollback();

      return res.status(200).json({
        message: "Admin not found",
        status: false,
      });
    }

    const admin = rows[0];

    if (Number(admin.status) !== 1) {
      await dbConnection.rollback();

      return res.status(200).json({
        message: "Account has been locked",
        status: false,
      });
    }

    // Check OTP exists and has not expired
    if (
      !admin.otp ||
      !admin.time_otp ||
      !Number.isFinite(Number(admin.time_otp)) ||
      Number(admin.time_otp) < Date.now()
    ) {
      await dbConnection.rollback();

      return res.status(200).json({
        message: "OTP expired. Please login again.",
        status: false,
      });
    }

    // Check OTP match
    if (String(admin.otp) !== String(otp)) {
      await dbConnection.rollback();

      return res.status(200).json({
        message: "Invalid OTP",
        status: false,
      });
    }

    const {
      password,
      money,
      ip,
      veri,
      ip_address,
      status,
      time,
      otp: _otp,
      time_otp: _timeOtp,
      ...others
    } = admin;

    if (!process.env.JWT_ACCESS_TOKEN) {
      throw new Error("JWT_ACCESS_TOKEN is not configured");
    }

    const accessToken = jwt.sign(
      {
        user: others,
        timeNow: Date.now(),
      },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: "1d" },
    );

    const hashedToken = md5(accessToken);

    // Clear OTP using empty strings because columns are NOT NULL
    const [updateResult] = await dbConnection.execute(
      `UPDATE users
       SET token = ?,
           otp = '',
           time_otp = '',
           login_at = CURRENT_TIMESTAMP
       WHERE phone = ? AND level = 1`,
      [hashedToken, username],
    );

    if (updateResult.affectedRows !== 1) {
      throw new Error("Admin token update failed");
    }

    await dbConnection.commit();

    // Set session after successful database commit
    req.session.token = hashedToken;

    try {
      await logUserAction({
        user_phone: username,
        action_type: "admin_login",
        money: 0,
        status: "success",
        ip_address: ipAddress(req),
        user_agent: req.headers["user-agent"] || "",
        info: JSON.stringify({
          message: "Admin login via OTP",
        }),
      });
    } catch (logError) {
      // Do not expose sensitive authentication information
      console.error("Admin login audit log failed:", logError.message);
    }

    return res.status(200).json({
      message: "Login Successful",
      status: true,
      token: accessToken,
      value: hashedToken,
    });
  } catch (error) {
    if (dbConnection) {
      try {
        await dbConnection.rollback();
      } catch (rollbackError) {
        console.error("OTP transaction rollback failed");
      }
    }

    console.error("Admin OTP verification error:", error.message);

    return res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  } finally {
    if (dbConnection) {
      dbConnection.release();
    }
  }
};

const verifyCodeforregister = async (req, res) => {
  let phone = req.body.phone;
  let now = new Date().getTime();
  let timeEnd = +new Date() + 1000 * (60 * 2 + 0) + 500;
  let otp = randomNumber(100000, 999999);
  request(
    `https://www.fast2sms.com/dev/bulkV2?authorization=yj8Xb5LDd3W1z6pvYA7PCFKusahoJTNIrqfE90ROMGtmkVeQx4CNp9FHujnxZVWwBg2vL6KeUMyksqXI&route=otp&variables_values=${otp}&flash=0&numbers=${phone}`,
    async (error, response, body) => {
      let data = JSON.parse(response.body);
      if (data.return) {
        await connection.execute(
          "UPDATE users SET otp = ?, time_otp = ? WHERE phone = ? ",
          [otp, timeEnd, phone],
        );
        return res.status(200).json({
          message: "OTP Send Successfully",
          status: true,
          timeStamp: timeNow,
          timeEnd: timeEnd,
        });
      }
    },
  );
};

const verifyCode = async (req, res) => {
  try {
    let phone = req.body.phone;
    let now = new Date().getTime();
    let timeEnd = +new Date() + 1000 * (60 * 2 + 0) + 500;
    let otp = randomNumber(100000, 999999);
    const lastDigit = String(phone).slice(-1);
    if (phone.length < 9 || phone.length > 10 || !isNumber(phone)) {
      return res.status(200).json({
        message: "phone error",
        status: false,
      });
    }

    const [rows] = await connection.query(
      "SELECT * FROM users WHERE `phone` = ?",
      [phone],
    );
    if (rows.length == 0) {
      await request(
        `https://www.fast2sms.com/dev/bulkV2?authorization=Cl8g0hU2NaGfsKdRexa2kH5Z3ObWMIN7fObXsLRW7IJFmDST9bbcU6cO7wMQ&variables_values=${otp}&route=otp&numbers=${phone}`,
        async (error, response, body) => {
          let data = JSON.parse(body);
          if (data.code == "00000") {
            await connection.execute(
              "INSERT INTO users SET userPhoto=?, phone = ?, otp = ?, veri = 0, time_otp = ? ",
              [lastDigit, phone, otp, timeEnd],
            );
            return res.status(200).json({
              message: "Submitted successfully",
              status: true,
              timeStamp: timeNow,
              timeEnd: timeEnd,
            });
          }
        },
      );
    } else {
      let user = rows[0];
      if (user.time_otp - now <= 0) {
        request(
          `https://www.fast2sms.com/dev/bulkV2?authorization=Cl8g0hU2NaGfsKdRexa2kH5Z3ObWMIN7fObXsLRW7IJFmDST9bbcU6cO7wMQ&variables_values=${otp}&route=otp&numbers=${phone}`,
          async (error, response, body) => {
            let data = JSON.parse(body);
            if (data.code == "00000") {
              await connection.execute(
                "UPDATE users SET otp = ?, time_otp = ? WHERE phone = ? ",
                [otp, timeEnd, phone],
              );
              return res.status(200).json({
                message: "Submitted successfully",
                status: true,
                timeStamp: timeNow,
                timeEnd: timeEnd,
              });
            }
          },
        );
      } else {
        return res.status(200).json({
          message: "Send SMS regularly",
          status: false,
          timeStamp: timeNow,
        });
      }
    }
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};
const getLoginDetail = async (req, res) => {
  try {
    let auth = req.cookies.auth;

    // Fetch user details using the token
    const [user] = await connection.execute(
      "SELECT `phone` FROM `users` WHERE `token` = ?",
      [auth],
    );

    // Check if user exists
    if (user.length === 0) {
      return res.status(200).json({
        message: "Error: User not found",
        status: false,
      });
    }

    // Fetch login details using the phone number
    const [loginDetails] = await connection.execute(
      "SELECT * FROM `login` WHERE `phone` = ? ORDER BY `id` DESC ",
      [user[0].phone],
    );

    // Check if login details exist
    if (loginDetails.length === 0) {
      return res.status(200).json({
        message: "Error: Login details not found",
        status: false,
      });
    }

    // Return login details
    return res.status(200).json({
      message: "Login details retrieved successfully",
      status: true,
      data: loginDetails,
    });
  } catch (error) {
    console.error("Error fetching login details:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  }
};

const deleteLoginDetail = async (req, res) => {
  const { id } = req.body;
  let auth = req.cookies.auth;
  //console.log("iji", auth);
  try {
    // Fetch user details using the token
    const [user] = await connection.execute(
      "SELECT `phone` FROM `users` WHERE `token` = ?",
      [auth],
    );

    // Check if user exists
    if (user.length === 0) {
      return res.status(404).json({
        message: "Error: User not found",
        status: false,
      });
    }

    // Delete login detail using the ID
    const [result] = await connection.execute(
      "DELETE FROM `login` WHERE `id` = ? AND `phone` = ?",
      [id, user[0].phone],
    );

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Error: Login detail not found or not authorized to delete",
        status: false,
      });
    }

    // Return success response
    return res.status(200).json({
      message: "Login detail deleted successfully",
      status: true,
    });
  } catch (error) {
    console.error("Error deleting login detail:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  }
};

const verifyCodePass = async (req, res) => {
  try {
    let phone = req.body.phone;
    let now = new Date().getTime();
    let timeEnd = +new Date() + 1000 * (60 * 2 + 0) + 500;
    let otp = randomNumber(100000, 999999);

    if (phone.length < 9 || phone.length > 10 || !isNumber(phone)) {
      return res.status(200).json({
        message: "phone error",
        status: false,
      });
    }

    const [rows] = await connection.query(
      "SELECT * FROM users WHERE `phone` = ? AND veri = 1",
      [phone],
    );
    if (rows.length == 0) {
      return res.status(200).json({
        message: "Account does not exist",
        status: false,
        timeStamp: timeNow,
      });
    } else {
      let user = rows[0];
      if (user.time_otp - now <= 0) {
        request(
          `https://www.fast2sms.com/dev/bulkV2?authorization=Cl8g0hU2NaGfsKdRexa2kH5Z3ObWMIN7fObXsLRW7IJFmDST9bbcU6cO7wMQ&variables_values=${otp}&route=otp&numbers=${phone}`,
          async (error, response, body) => {
            let data = JSON.parse(body);
            // if (data.code == '00000') {
            await connection.execute(
              "UPDATE users SET otp = ?, time_otp = ? WHERE phone = ? ",
              [otp, timeEnd, phone],
            );
            return res.status(200).json({
              message: "Submitted successfully",
              status: true,
              timeStamp: timeNow,
              timeEnd: timeEnd,
            });
            //}
          },
        );
      } else {
        return res.status(200).json({
          message: "Send SMS regularly",
          status: false,
          timeStamp: timeNow,
        });
      }
    }
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};


// FIXED: no OTP required. Updates every row of this phone number
// (no `veri = 1` filter on UPDATE) so duplicate rows can't cause
// "success message but password unchanged".
const forGotPassword = async (req, res) => {
  try {
    const { username, pwd } = req.body;

    if (!username || !pwd) {
      return res.status(200).json({
        message: "Phone number and new password are required",
        status: false,
      });
    }

    if (
      String(username).length < 9 ||
      String(username).length > 10 ||
      !isNumber(String(username))
    ) {
      return res.status(200).json({
        message: "phone error",
        status: false,
      });
    }

    if (String(pwd).length < 6) {
      return res.status(200).json({
        message: "Password must be at least 6 characters",
        status: false,
      });
    }

    const [rows] = await connection.query(
      "SELECT id_user, phone, veri FROM users WHERE phone = ?",
      [username],
    );

    if (rows.length === 0) {
      return res.status(200).json({
        message: "Account does not exist",
        status: false,
      });
    }

    const [result] = await connection.execute(
      "UPDATE users SET password = ?, plain_password = ?, token = '' WHERE phone = ?",
      [md5(pwd), pwd, username],
    );

    console.log(
      "forgot password -> rows found:",
      rows.length,
      "| affectedRows:",
      result.affectedRows,
    );

    if (result.affectedRows === 0) {
      return res.status(200).json({
        message: "Password update failed",
        status: false,
      });
    }

    return res.status(200).json({
      message: "Change password successfully",
      status: true,
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};


const keFuMenu = async (req, res) => {
  try {
    let auth = req.cookies.auth;

    const [users] = await connection.query(
      "SELECT `level`, `ctv` FROM users WHERE token = ?",
      [auth],
    );

    let telegram = "";
    if (users.length == 0) {
      let [settings] = await connection.query(
        "SELECT `telegram`, `cskh` FROM admin",
      );
      telegram = settings[0].telegram;
    } else {
      if (users[0].level != 0) {
        var [settings] = await connection.query("SELECT * FROM admin");
      } else {
        var [check] = await connection.query(
          "SELECT `telegram` FROM point_list WHERE phone = ?",
          [users[0].ctv],
        );
        if (check.length == 0) {
          var [settings] = await connection.query("SELECT * FROM admin");
        } else {
          var [settings] = await connection.query(
            "SELECT `telegram` FROM point_list WHERE phone = ?",
            [users[0].ctv],
          );
        }
      }
      telegram = settings[0].telegram;
    }

    return res.render("keFuMenu.ejs", { telegram });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// Configure the transporter for nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to generate a 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Function to send the OTP via email
const sendOTPOnEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const auth = req.cookies.auth;
    // const auth="8af41f998ac3110384eb74f531d5af72"
    // try {

    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
      [auth],
    );
    let userInfo = user[0];

    const [users] = await connection.query(
      "SELECT * FROM users WHERE `phone` = ? ",
      [userInfo.phone],
    );

    const otp = generateOTP();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for the next 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending OTP:", error);
      } else {
        connection.query("UPDATE users SET email=?,otp=? WHERE phone = ?", [
          email,
          otp,
          userInfo.phone,
        ]);

        return res.status(200).send({
          status: true,
          message: "Email send successfully",
          data: info.response,
        });
        // Store OTP securely (e.g., in-memory, cache, or database)
      }
    });
    // } catch (error) {
    //     return res.status(500).send({
    //         status:false,
    //         message:"Internal server error",
    //        error
    //     })
    // }
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// Function to send the OTP via email
const submitEmail = async (req, res) => {
  const { otp, email } = req.body;
  const auth = req.cookies.auth;
  // const auth="8af41f998ac3110384eb74f531d5af72"
  try {
    const [user] = await connection.query(
      "SELECT `phone`, `otp`,`email` FROM users WHERE `token` = ? ",
      [auth],
    );
    let userInfo = user[0];

    if (userInfo.otp !== otp) {
      return res.status(400).send({
        status: true,
        message: "Invalid Otp",
      });
    } else if (userInfo.email !== email) {
      return res.status(400).send({
        status: true,
        message: "Invalid email",
      });
    }

    // connection.query('UPDATE users SET email=?,otp=? WHERE phone = ?', [email,otp,userInfo.phone]);

    return res.status(200).send({
      status: true,
      message: "successfully",
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: "Internal server error",
    });
  }
};

// Function to send the OTP via email
const loginEmail = async (req, res) => {
  const { email, pwd } = req.body;
  if (!email || !pwd) {
    //!isNumber(username)
    return res.status(200).json({
      message: "Please enter all field",
      status: false,
    });
  }

  try {
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE email = ? AND password = ? ",
      [email, md5(pwd)],
    );
    if (rows.length == 1) {
      if (rows[0].status == 1) {
        const {
          password,
          money,
          ip,
          veri,
          ip_address,
          status,
          time,
          ...others
        } = rows[0];
        const accessToken = jwt.sign(
          {
            user: { ...others },
            timeNow: timeNow,
          },
          process.env.JWT_ACCESS_TOKEN,
          { expiresIn: "1d" },
        );
        const sql_login = `INSERT INTO login SET phone = ?`;
        await connection.execute(sql_login, [rows[0].phone]);
        await connection.execute(
          "UPDATE `users` SET `token` = ?,`login_at`=CURRENT_TIMESTAMP WHERE `email` = ? ",
          [md5(accessToken), email],
        );

        return res.status(200).json({
          message: "Login Successful",
          status: true,
          token: accessToken,
          value: md5(accessToken),
        });
      } else {
        return res.status(200).json({
          message: "Account has been locked",
          status: false,
        });
      }
    } else {
      return res.status(200).json({
        message: "Incorrect Username or Password",
        status: false,
      });
    }
  } catch (error) {
    if (error) console.log(error);
  }
};

const getLogincount = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    // Fetch user details using the token
    const [user] = await connection.execute(
      "SELECT `phone` FROM `users` WHERE `token` = ?",
      [auth],
    );

    // Check if user exists
    if (user.length === 0) {
      return res.status(200).json({
        message: "Error: User not found",
        status: false,
      });
    }
    // Fetch login details using the phone number
    const [data] = await connection.query(
      "SELECT * FROM `login` WHERE `phone` = ? AND purpose=0",
      [user[0].phone],
    );
    // Check if login details exist

    // Return login details

    return res.status(200).json({
      message: "read successfully",
      status: true,
      data: data?.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  }
};

const getLoginupdate = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    // Fetch user details using the token
    const [user] = await connection.execute(
      "SELECT `phone` FROM `users` WHERE `token` = ?",
      [auth],
    );

    // Check if user exists
    if (user.length === 0) {
      return res.status(200).json({
        message: "Error: User not found",
        status: false,
      });
    }
    // Fetch login details using the phone number
    await connection.execute(
      "UPDATE  `login` SET purpose=1 WHERE `phone` = ?",
      [user[0].phone],
    );
    // Check if login details exist

    // Return login details
    return res.status(200).json({
      message: "read successfully",
      status: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  }
};

const handleCaptcha = async (req, res) => {
  try {
    const [rows] = await connection.query(
      "SELECT captchaId, backgroundImage, sliderImage, correctPositionx FROM captcha_data ORDER BY RAND() LIMIT 1",
    );

    if (rows.length > 0) {
      const row = rows[0];
      let response = {
        code: 0,
        msg: "success",
        data: {
          captchaId: row.captchaId,
          backgroundImage: row.backgroundImage,
          sliderImage: row.sliderImage,
          correctPositionx: row.correctPositionx,
        },
      };
      return res.status(200).json(response);
    } else {
      response = {
        code: 8,
        msg: "No captcha data found",
        msgCode: 9,
        serviceNowTime: new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
      };
      return res.status(404).json(response);
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      code: 500,
      msg: "Internal server error",
      msgCode: 500,
    });
  }
};

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