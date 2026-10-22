import crypto from "crypto";
import fs from "fs";
import md5 from "md5";
import path from "path";
import QRCode from "qrcode";
import querystring from "querystring";
import request from "request";
import util from "util";
import connection from "../config/connectDB";
const moment = require("moment-timezone");

function md5Sign2(params, key) {
  const sortedKeys = Object.keys(params).sort();

  const signStr =
    sortedKeys
      .filter(
        (k) =>
          params[k] !== undefined && params[k] !== null && params[k] !== "",
      )
      .map((k) => `${k}=${params[k]}`)
      .join("&") + `&key=${key}`;

  return crypto.createHash("md5").update(signStr).digest("hex").toUpperCase();
}

const logsDirectory = path.join(path.resolve(), "logs");
if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory);
}

// Define the path for the log file in the logs directorycons
const logFilePath = path.join(logsDirectory, "performance_log.txt");

// Promisify the appendFile function to write logs asynchronously
const writeLog = util.promisify(fs.appendFile);

const axios = require("axios");
let timeNow = Date.now();

const randomNumber = (min, max) => {
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

// const generateQRCode = async (data) => {
//   try {
//     let qrCodeDataURL = await QRCode.toDataURL(data);
//   //   //console.log("QR Code generated successfully.");
//      return qrCodeDataURL;
//   } catch (err) {
//     console.error("Error generating QR code:", err);
//   }
// };

const userInfo = async (req, res) => {
  const startTime = Date.now(); // Start time in milliseconds

  try {
    const timeNow = new Date();
    const auth = req.cookies.auth;

    if (!auth) {
      return res.status(200).json({
        message: "Token undefined",
        status: false,
        timeStamp: timeNow,
      });
    }

    // Query user information using the token
    const [users] = await connection.execute(
      "SELECT * FROM users WHERE `token` = ?",
      [auth],
    );

    if (!users.length) {
      return res.status(200).json({
        message: "Invalid token",
        status: false,
        timeStamp: timeNow,
      });
    }

    // Query for admin settings (e.g., telegram)
    const [settings] = await connection.query(
      "SELECT `telegram`, `cskh` FROM admin",
    );

    const telegram = settings.length ? settings[0].telegram : "";
    const {
      code,
      id_user,
      name_user,
      money,
      userPhoto,
      vip_level,
      rank,
      rebate,
      level,
      isdemo,
      recharge,
      totalRecharge,
      totalWithdraw,
      message,
      email,
    } = users[0];
    const phone = users[0].phone;

    const origin = req.protocol + "://" + req.get("host"); // Get the origin dynamically
    const qrs = await generateQRCode(`${origin}/#/register?r_code=${code}`);

    // const balanceResponse = await axios.get(`https://allapi.codehello.site/api/checkBalance?playerId=${phone}`);

    const response = res.status(200).json({
      message: "User Details Successful",
      status: true,
      money: parseFloat(money),
      data: {
        code,
        id_user,
        name_user,
        phone_user: phone,
        money_user: parseFloat(money),
        userPhoto,
        rebate,
        isdemo,
        rank,
        level,
        vip_level,
        recharge,
        telegram,
        totalRecharge,
        totalWithdraw,
        betAmount: 0,
        message,
        email,
        qrs,
        //  betAmount: balanceResponse?.data?.data?.amount,
      },
    });

    return response;
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
      status: false,
    });
  }
};

const addutr = async (req, res) => {
  let utr = req.body.utr;
  let id = req.body.id;
  const sql = `UPDATE recharge SET utr=? WHERE id=?`;
  await connection.execute(sql, [utr, id]);
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "666damangame91@gmail.com",
      pass: "Delhi@123",
    },
  });

  // Email content
  let mailOptions = {
    from: "damangame91@gmail.com",
    to: "adarshpushpendra@gmail.com",
    subject: "Test Email",
    text: "This is a test email sent from Node.js using nodemailer.",
  };

  // Send email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      //console.log("Email sent: " + info.response);
    }
  });
  return res.status(200).json({
    message: "Recharge Successfully!",
    status: true,
    timeStamp: timeNow,
  });
  // res.redirect('/');
};

const verifyCode = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let now = new Date().getTime();
    let timeEnd = +new Date() + 1000 * (60 * 2 + 0) + 500;
    let otp = randomNumber(100000, 999999);

    conswit[rows] = await connection.query(
      "SELECT * FROM users WHERE `token` = ? ",
      [auth],
    );
    if (!rows) {
      return res.status(200).json({
        message: "Account does not exist",
        status: false,
        timeStamp: timeNow,
      });
    }
    let user = rows[0];
    if (user.time_otp - now <= 0) {
      request(
        `http://47.243.168.18:9090/sms/batch/v2?appkey=NFJKdK&appsecret=brwkTw&phone=84${user.phone}&msg=Your verification code is ${otp}&extend=${now}`,
        async (error, response, body) => {
          let data = JSON.parse(body);
          if (data.code == "00000") {
            await connection.execute(
              "UPDATE users SET otp = ?, time_otp = ? WHERE phone = ? ",
              [otp, timeEnd, user.phone],
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
        message: "Send SMS regularly.",
        status: false,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const aviator = async (req, res) => {
  let auth = req.cookies.auth;
  res.redirect(
    `https://avi.bdg-club.com/theninja/src/api/userapi.php?action=loginandregisterbyauth&token=${auth}`,
  );
  //res.redirect(`https://jetx.asia/#/jet/loginbyauth/${auth}`);
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

const changeUser = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let name = req.body.name;

    const [rows] = await connection.query(
      "SELECT * FROM users WHERE `token` = ? ",
      [auth],
    );
    if (!rows || !name)
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    await connection.query(
      "UPDATE users SET name_user = ? WHERE `token` = ? ",
      [name, auth],
    );
    return res.status(200).json({
      message: "Username modification successful",
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const changeUserPhoto = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let photo = req.body.photo;

    const [rows] = await connection.query(
      "SELECT * FROM users WHERE `token` = ? ",
      [auth],
    );
    if (!rows || !photo)
      return res.status(200).json({
        message: "Invalid photo",
        status: false,
        timeStamp: timeNow,
      });
    await connection.query(
      "UPDATE users SET userPhoto = ? WHERE `token` = ? ",
      [photo, auth],
    );
    return res.status(200).json({
      message: "User profile modification successful",
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const changePassword = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let password = req.body.password;
    let newPassWord = req.body.newPassWord;
    let cPassWord = req.body.cPassWord;
    // let otp = req.body.otp;

    if (!password || !newPassWord)
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE `token` = ? AND `password` = ? ",
      [auth, md5(password)],
    );
    if (rows.length == 0)
      return res.status(200).json({
        message: "Incorrect password",
        status: false,
        timeStamp: timeNow,
      });

    if (newPassWord !== cPassWord) {
      return res.status(200).json({
        message: "Incorrect confirm password ",
        status: false,
      });
    }
    await connection.query(
      "UPDATE users SET otp = ?, password = ?, plain_password = ? WHERE `token` = ? ",
      [randomNumber(100000, 999999), md5(newPassWord), newPassWord, auth],
    );
    return res.status(200).json({
      message: "Password modification successful",
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const checkInHandling = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let data = req.body.data;

    if (!auth)
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE `token` = ? ",
      [auth],
    );

    const [attendencs_bonus] = await connection.query(
      "SELECT * FROM `attendencs-bonus`",
    );

    let attendencsDta = attendencs_bonus[0];

    // //console.log("attendencsDta", attendencsDta);

    if (!rows)
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    if (!data) {
      const [point_list] = await connection.query(
        "SELECT * FROM point_list WHERE `phone` = ? ",
        [rows[0].phone],
      );
      const [historys] = await connection.query(
        "SELECT * FROM attendance_history WHERE `phone` = ? ",
        [rows[0].phone],
      );

      // //console.log("point_list[0]", point_list[0]);
      return res.status(200).json({
        messages: "No More Data",
        datas: point_list[0],
        data: historys,
        status: true,
        timeStamp: timeNow,
      });
    }

    const [point_listss] = await connection.query(
      "SELECT * FROM point_list WHERE `phone` = ? ",
      [rows[0].phone],
    );
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const day = String(today.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;

    if (data && formattedDate !== point_listss[0].today) {
      if (data == 1) {
        const [point_lists] = await connection.query(
          "SELECT * FROM point_list WHERE `phone` = ? ",
          [rows[0].phone],
        );

        const [recharge] = await connection.query(
          "SELECT SUM(money) AS totalMoney FROM recharge WHERE `phone` = ? AND status=1 AND DATE(today) = ?",
          [rows[0].phone, formattedDate],
        );

        let check = Number(recharge[0].totalMoney) || 0; // Ensure it's a number and handle null values

        let point_list = point_lists[0];
        let get = Number(attendencsDta.day1rech);
        if (check >= data && point_list.total1 != 0) {
          await connection.query(
            "UPDATE users SET money = money + ? WHERE phone = ? ",
            [point_list.total1, rows[0].phone],
          );
          await connection.query(
            "UPDATE point_list SET total1 = ?, today = ? WHERE phone = ? ",
            [0, formattedDate, rows[0].phone],
          );
          await connection.query(
            "INSERT INTO attendance_history SET phone = ?,amount=?,status=?,date=? ",
            [rows[0].phone, point_list.total1, 1, formattedDate],
          );

          const datasql =
            "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
          await connection.query(datasql, [
            rows[0].phone,
            "Attendance bonus",
            point_list.total1,
            formattedDate,
          ]);
          return res.status(200).json({
            message: `You just received ₹ ${point_list.total1}.00`,
            status: true,
            timeStamp: timeNow,
          });
        } else if (check < get && point_list.total1 != 0) {
          return res.status(200).json({
            message: `Please Recharge ₹ ${attendencsDta.day1rech} to claim gift.`,
            status: false,
            timeStamp: timeNow,
          });
        } else if (point_list.total1 == 0) {
          return res.status(200).json({
            message: "You have already received this gift",
            status: false,
            timeStamp: timeNow,
          });
        }
      }
      if (data == 2) {
        const [point_lists] = await connection.query(
          "SELECT * FROM point_list WHERE `phone` = ? ",
          [rows[0].phone],
        );
        const [recharge] = await connection.query(
          "SELECT SUM(money) AS totalMoney FROM recharge WHERE `phone` = ? AND status=1 AND DATE(today) = ?",
          [rows[0].phone, formattedDate],
        );

        let check = Number(recharge[0].totalMoney) || 0; // Ensure it's a number and handle null values
        let point_list = point_lists[0];
        let get = Number(attendencsDta.day2rech);
        if (check >= get && point_list.total2 != 0) {
          await connection.query(
            "UPDATE users SET money = money + ? WHERE phone = ? ",
            [point_list.total2, rows[0].phone],
          );
          await connection.query(
            "UPDATE point_list SET total2 = ?, today = ? WHERE phone = ? ",
            [0, formattedDate, rows[0].phone],
          );
          await connection.query(
            "INSERT INTO attendance_history SET phone = ?,amount=?,status=?,date=? ",
            [rows[0].phone, point_list.total2, 1, formattedDate],
          );
          const datasql =
            "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
          await connection.query(datasql, [
            rows[0].phone,
            "Attendance bonus",
            point_list.total2,
            formattedDate,
          ]);
          return res.status(200).json({
            message: `You just received ₹ ${point_list.total2}.00`,
            status: true,
            timeStamp: timeNow,
          });
        } else if (check < get && point_list.total2 != 0) {
          return res.status(200).json({
            message: `Please Recharge ₹ ${attendencsDta.day2rech} to claim gift.`,
            status: false,
            timeStamp: timeNow,
          });
        } else if (point_list.total2 == 0) {
          return res.status(200).json({
            message: "You have already received this gift",
            status: false,
            timeStamp: timeNow,
          });
        }
      }
      if (data == 3) {
        const [point_lists] = await connection.query(
          "SELECT * FROM point_list WHERE `phone` = ? ",
          [rows[0].phone],
        );
        const [recharge] = await connection.query(
          "SELECT SUM(money) AS totalMoney FROM recharge WHERE `phone` = ? AND status=1 AND DATE(today) = ?",
          [rows[0].phone, formattedDate],
        );

        let check = Number(recharge[0].totalMoney) || 0; // Ensure it's a number and handle null values
        let point_list = point_lists[0];
        let get = Number(attendencsDta.day3rech);
        if (check >= get && point_list.total3 != 0) {
          await connection.query(
            "UPDATE users SET money = money + ? WHERE phone = ? ",
            [point_list.total3, rows[0].phone],
          );
          await connection.query(
            "UPDATE point_list SET total3 = ?, today = ? WHERE phone = ? ",
            [0, formattedDate, rows[0].phone],
          );
          await connection.query(
            "INSERT INTO attendance_history SET phone = ?,amount=?,status=?,date=? ",
            [rows[0].phone, point_list.total3, 1, formattedDate],
          );
          const datasql =
            "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
          await connection.query(datasql, [
            rows[0].phone,
            "Attendance bonus",
            point_list.total3,
            formattedDate,
          ]);
          return res.status(200).json({
            message: `You just received ₹ ${point_list.total3}.00`,
            status: true,
            timeStamp: timeNow,
          });
        } else if (check < get && point_list.total3 != 0) {
          return res.status(200).json({
            message: `Please Recharge ₹ ${attendencsDta.day3rech} to claim gift.`,
            status: false,
            timeStamp: timeNow,
          });
        } else if (point_list.total3 == 0) {
          return res.status(200).json({
            message: "You have already received this gift",
            status: false,
            timeStamp: timeNow,
          });
        }
      }
      if (data == 4) {
        const [point_lists] = await connection.query(
          "SELECT * FROM point_list WHERE `phone` = ? ",
          [rows[0].phone],
        );
        const [recharge] = await connection.query(
          "SELECT SUM(money) AS totalMoney FROM recharge WHERE `phone` = ? AND status=1 AND DATE(today) = ?",
          [rows[0].phone, formattedDate],
        );

        let check = Number(recharge[0].totalMoney) || 0; // Ensure it's a number and handle null values
        let point_list = point_lists[0];
        let get = Number(attendencsDta.day4rech);
        if (check >= get && point_list.total4 != 0) {
          await connection.query(
            "UPDATE users SET money = money + ? WHERE phone = ? ",
            [point_list.total4, rows[0].phone],
          );
          await connection.query(
            "UPDATE point_list SET total4 = ?, today = ? WHERE phone = ? ",
            [0, formattedDate, rows[0].phone],
          );
          await connection.query(
            "INSERT INTO attendance_history SET phone = ?,amount=?,status=?,date=? ",
            [rows[0].phone, point_list.total4, 1, formattedDate],
          );
          const datasql =
            "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
          await connection.query(datasql, [
            rows[0].phone,
            "Attendance bonus",
            point_list.total4,
            formattedDate,
          ]);
          return res.status(200).json({
            message: `You just received ₹ ${point_list.total4}.00`,
            status: true,
            timeStamp: timeNow,
          });
        } else if (check < get && point_list.total4 != 0) {
          return res.status(200).json({
            message: `Please Recharge ₹ ${attendencsDta.day4rech} to claim gift.`,
            status: false,
            timeStamp: timeNow,
          });
        } else if (point_list.total4 == 0) {
          return res.status(200).json({
            message: "You have already received this gift",
            status: false,
            timeStamp: timeNow,
          });
        }
      }
      if (data == 5) {
        const [point_lists] = await connection.query(
          "SELECT * FROM point_list WHERE `phone` = ? ",
          [rows[0].phone],
        );
        const [recharge] = await connection.query(
          "SELECT SUM(money) AS totalMoney FROM recharge WHERE `phone` = ? AND status=1 AND DATE(today) = ?",
          [rows[0].phone, formattedDate],
        );

        let check = Number(recharge[0].totalMoney) || 0; // Ensure it's a number and handle null values
        let point_list = point_lists[0];
        let get = Number(attendencsDta.day5rech);
        if (check >= get && point_list.total5 != 0) {
          await connection.query(
            "UPDATE users SET money = money + ? WHERE phone = ? ",
            [point_list.total5, rows[0].phone],
          );
          await connection.query(
            "UPDATE point_list SET total5 = ?, today = ? WHERE phone = ? ",
            [0, formattedDate, rows[0].phone],
          );
          await connection.query(
            "INSERT INTO attendance_history SET phone = ?,amount=?,status=?,date=? ",
            [rows[0].phone, point_list.total5, 1, formattedDate],
          );
          const datasql =
            "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
          await connection.query(datasql, [
            rows[0].phone,
            "Attendance bonus",
            point_list.total5,
            formattedDate,
          ]);
          return res.status(200).json({
            message: `You just received ₹ ${point_list.total5}.00`,
            status: true,
            timeStamp: timeNow,
          });
        } else if (check < get && point_list.total5 != 0) {
          return res.status(200).json({
            message: `Please Recharge ₹ ${attendencsDta.day5rech} to claim gift.`,
            status: false,
            timeStamp: timeNow,
          });
        } else if (point_list.total5 == 0) {
          return res.status(200).json({
            message: "You have already received this gift",
            status: false,
            timeStamp: timeNow,
          });
        }
      }
      if (data == 6) {
        const [point_lists] = await connection.query(
          "SELECT * FROM point_list WHERE `phone` = ? ",
          [rows[0].phone],
        );
        const [recharge] = await connection.query(
          "SELECT SUM(money) AS totalMoney FROM recharge WHERE `phone` = ? AND status=1 AND DATE(today) = ?",
          [rows[0].phone, formattedDate],
        );

        let check = Number(recharge[0].totalMoney) || 0; // Ensure it's a number and handle null values
        let point_list = point_lists[0];
        let get = Number(attendencsDta.day6rech);
        if (check >= get && point_list.total6 != 0) {
          await connection.query(
            "UPDATE users SET money = money + ? WHERE phone = ? ",
            [point_list.total6, rows[0].phone],
          );
          await connection.query(
            "UPDATE point_list SET total6 = ?, today = ? WHERE phone = ? ",
            [0, formattedDate, rows[0].phone],
          );
          await connection.query(
            "INSERT INTO attendance_history SET phone = ?,amount=?,status=?,date=? ",
            [rows[0].phone, point_list.total6, 1, formattedDate],
          );
          const datasql =
            "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
          await connection.query(datasql, [
            rows[0].phone,
            "Attendance bonus",
            point_list.total6,
            formattedDate,
          ]);
          return res.status(200).json({
            message: `You just received ₹ ${point_list.total6}.00`,
            status: true,
            timeStamp: timeNow,
          });
        } else if (check < get && point_list.total6 != 0) {
          return res.status(200).json({
            message: `Please Recharge ₹ ${attendencsDta.day6rech} to claim gift.`,
            status: false,
            timeStamp: timeNow,
          });
        } else if (point_list.total6 == 0) {
          return res.status(200).json({
            message: "You have already received this gift",
            status: false,
            timeStamp: timeNow,
          });
        }
      }
      if (data == 7) {
        const [point_lists] = await connection.query(
          "SELECT * FROM point_list WHERE `phone` = ? ",
          [rows[0].phone],
        );
        const [recharge] = await connection.query(
          "SELECT SUM(money) AS totalMoney FROM recharge WHERE `phone` = ? AND status=1 AND DATE(today) = ?",
          [rows[0].phone, formattedDate],
        );

        let check = Number(recharge[0].totalMoney) || 0; // Ensure it's a number and handle null values
        let point_list = point_lists[0];
        let get = Number(attendencsDta.day7rech);
        if (check >= get && point_list.total7 != 0) {
          await connection.query(
            "UPDATE users SET money = money + ? WHERE phone = ? ",
            [point_list.total7, rows[0].phone],
          );
          await connection.query(
            "UPDATE point_list SET total7 = ?, today = ? WHERE phone = ? ",
            [0, formattedDate, rows[0].phone],
          );
          const datasql =
            "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
          await connection.query(datasql, [
            rows[0].phone,
            "Attendance bonus",
            point_list.total7,
            formattedDate,
          ]);
          return res.status(200).json({
            message: `You just received ₹ ${point_list.total7}.00`,
            status: true,
            timeStamp: timeNow,
          });
        } else if (check < get && point_list.total7 != 0) {
          return res.status(200).json({
            message: `Please Recharge ₹ ${attendencsDta.day7rech} to claim gift.`,
            status: false,
            timeStamp: timeNow,
          });
        } else if (point_list.total7 == 0) {
          return res.status(200).json({
            message: "You have already received this gift",
            status: false,
            timeStamp: timeNow,
          });
        }
      }
    } else {
      return res.status(200).json({
        message: "You have already received this gift",
        status: false,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const rebateCreate = async (req, res) => {
  const { amount } = req.body;
  let auth = req.cookies.auth;
  try {
    if (amount <= 0)
      return res.status(200).json({
        message: "Amount is not",
        status: false,
        timeStamp: timeNow,
      });

    const [rows] = await connection.query(
      "SELECT * FROM users WHERE `token` = ? ",
      [auth],
    );
    if (!rows)
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });

    const sumdate = timerJoin2(Date.now());

    await connection.query(
      "INSERT INTO rebate SET phone = ?,amount=?,rate=?,commission=?,type=?, status=?,today=? ",
      [
        rows[0].phone,
        amount,
        parseFloat(rows[0].rebetRet) / 100,
        (amount * parseFloat(rows[0].rebetRet)) / 100,
        "Slotes",
        1,
        sumdate,
      ],
    );

    await connection.execute(
      "UPDATE `users` SET `money` = `money` + ?,`rebate`=`rebate`-? WHERE `token` = ? ",
      [(amount * parseFloat(rows[0].rebetRet)) / 100, amount, auth],
    );

    return res.status(200).json({
      message: `You just received successful`,
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    return res.status(500).json({
      message: `internal server error`,
      status: false,
      timeStamp: timeNow,
    });
  }
};

const getRebate = async (req, res) => {
  let auth = req.cookies.auth;
  try {
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE `token` = ? ",
      [auth],
    );
    if (!rows)
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });

    const data = await connection.query(
      "SELECT * FROM rebate WHERE phone = ?",
      [rows[0].phone],
    );
    return res.status(200).json({
      message: `You just received successful`,
      status: true,
      data: data[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: `internal server error`,
      status: false,
      timeStamp: timeNow,
    });
  }
};

function formateT(params) {
  let result = params < 10 ? "0" + params : params;
  return result;
}

function timerJoin(params = "", addHours = 0) {
  let date = "";
  if (params) {
    date = new Date(Number(params));
  } else {
    date = new Date();
  }

  date.setHours(date.getHours() + addHours);

  let years = formateT(date.getFullYear());
  let months = formateT(date.getMonth() + 1);
  let days = formateT(date.getDate());

  let hours = date.getHours() % 12;
  hours = hours === 0 ? 12 : hours;
  let ampm = date.getHours() < 12 ? "AM" : "PM";

  let minutes = formateT(date.getMinutes());
  let seconds = formateT(date.getSeconds());

  return (
    years +
    "-" +
    months +
    "-" +
    days +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds +
    " " +
    ampm
  );
}

const promotion = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite`, `roses_f`, `roses_f1`, `roses_today` FROM users WHERE `token` = ? ",
      [auth],
    );
    const [level] = await connection.query("SELECT * FROM level");

    if (!user) {
      return res.status(200).json({
        message: "Invalid user",
        status: false,
        timeStamp: timeNow,
      });
    }

    let userInfo = user[0];

    // Directly referred level-1 users
    const [f1s] = await connection.query(
      "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
      [userInfo.code],
    );

    // Directly referred users today
    let f1_today = 0;
    for (let i = 0; i < f1s.length; i++) {
      const f1_time = f1s[i].time;
      let check = timerJoin(f1_time) == timerJoin() ? true : false;
      if (check) {
        f1_today += 1;
      }
    }

    // All direct referrals today
    let f_all_today = 0;
    for (let i = 0; i < f1s.length; i++) {
      const f1_code = f1s[i].code;
      const f1_time = f1s[i].time;
      let check_f1 = timerJoin(f1_time) == timerJoin() ? true : false;
      if (check_f1) f_all_today += 1;

      // Total level-2 referrals today
      const [f2s] = await connection.query(
        "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
        [f1_code],
      );
      for (let i = 0; i < f2s.length; i++) {
        const f2_code = f2s[i].code;
        const f2_time = f2s[i].time;
        let check_f2 = timerJoin(f2_time) == timerJoin() ? true : false;
        if (check_f2) f_all_today += 1;

        // Total level-3 referrals today
        const [f3s] = await connection.query(
          "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
          [f2_code],
        );
        for (let i = 0; i < f3s.length; i++) {
          const f3_code = f3s[i].code;
          const f3_time = f3s[i].time;
          let check_f3 = timerJoin(f3_time) == timerJoin() ? true : false;
          if (check_f3) f_all_today += 1;

          // Total level-4 referrals today
          const [f4s] = await connection.query(
            "SELECT `phone`, `code`,`invite`, `time` FROM users WHERE `invite` = ? ",
            [f3_code],
          );
          for (let i = 0; i < f4s.length; i++) {
            const f4_code = f4s[i].code;
            const f4_time = f4s[i].time;
            let check_f4 = timerJoin(f4_time) == timerJoin() ? true : false;
            if (check_f4) f_all_today += 1;
          }
        }
      }
    }

    // Total level-2 referrals
    let f2 = 0;
    for (let i = 0; i < f1s.length; i++) {
      const f1_code = f1s[i].code;
      const [f2s] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
        [f1_code],
      );
      f2 += f2s.length;
    }

    // Total level-3 referrals
    let f3 = 0;
    for (let i = 0; i < f1s.length; i++) {
      const f1_code = f1s[i].code;
      const [f2s] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
        [f1_code],
      );
      for (let i = 0; i < f2s.length; i++) {
        const f2_code = f2s[i].code;
        const [f3s] = await connection.query(
          "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
          [f2_code],
        );
        if (f3s.length > 0) f3 += f3s.length;
      }
    }

    // Total level-4 referrals
    let f4 = 0;
    for (let i = 0; i < f1s.length; i++) {
      const f1_code = f1s[i].code;
      const [f2s] = await connection.query(
        "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
        [f1_code],
      );
      for (let i = 0; i < f2s.length; i++) {
        const f2_code = f2s[i].code;
        const [f3s] = await connection.query(
          "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
          [f2_code],
        );
        for (let i = 0; i < f3s.length; i++) {
          const f3_code = f3s[i].code;
          const [f4s] = await connection.query(
            "SELECT `phone`, `code`,`invite` FROM users WHERE `invite` = ? ",
            [f3_code],
          );
          if (f4s.length > 0) f4 += f4s.length;
        }
      }
    }

    let selectedData = [];
    let level2to6activeuser = 0;
    let currentDate = new Date();

    // Subtract one day
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 1);

    // Format the date as YYYY-MM-DD
    currentDate = previousDate.toISOString().slice(0, 10);

    async function fetchInvitesByCode(code, depth = 1) {
      if (depth > 10) {
        return;
      }

      const [inviteData] = await connection.query(
        "SELECT `id_user`,`name_user`,`phone`, `code`, `invite`, `rank`, `user_level`, `total_money` FROM users WHERE `invite` = ?",
        [code],
      );

      const [level2to6activeuser_today] = await connection.query(
        "SELECT `phone`, `code`, `invite`, `time` FROM users WHERE `invite` = ? AND DATE(`today`) = ?",
        [code, currentDate],
      );

      if (level2to6activeuser_today.length > 0) {
        level2to6activeuser += level2to6activeuser_today.length;
      }
      if (inviteData.length > 0) {
        for (const invite of inviteData) {
          selectedData.push(invite);
          await fetchInvitesByCode(invite.code, depth + 1);
        }
      }
    }

    // Query to select today's deposits for each user
    const [level1_today_rows] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `time` FROM users WHERE `invite` = ?",
      [userInfo.code],
    );

    const [level1_today_rows_today] = await connection.query(
      "SELECT `phone`, `code`, `invite`, `time` FROM users WHERE `invite` = ? AND DATE(`today`) = ?",
      [userInfo.code, currentDate],
    );

    let totalDepositCount = 0;
    let totalDepositAmount = 0;
    let firstDepositCount = 0;

    for (const user of level1_today_rows) {
      await fetchInvitesByCode(user.code);
      // Query to select deposits for the current user for today
      const [deposits] = await connection.query(
        "SELECT `id`, `id_order`, `transaction_id`, `utr`, `phone`, `money`, `type`, `status`, `today`, `url`, `time` FROM `recharge` WHERE `phone` = ? AND DATE(`today`) = ? AND `status` = 1",
        [user.phone, currentDate],
      );

      totalDepositCount += deposits.length;

      deposits.forEach((deposit) => {
        totalDepositAmount += parseFloat(deposit.money);
      });

      if (deposits.length > 0) {
        firstDepositCount++;
      }
    }

    const level2_to_level6_today_rows = selectedData;

    let level2_to_level6totalDepositCount = 0;
    let level2_to_level6totalDepositAmount = 0;
    let level2_to_level6firstDepositCount = 0;

    let level2_to_level6count = 0;

    for (const user of level2_to_level6_today_rows) {
      const [deposits] = await connection.query(
        "SELECT `id`, `id_order`, `transaction_id`, `utr`, `phone`, `money`, `type`, `status`, `today`, `url`, `time` FROM `recharge` WHERE `phone` = ? AND DATE(`today`) = ? AND `status` = 1",
        [user.phone, currentDate],
      );

      level2_to_level6count++;

      deposits.forEach((deposit) => {
        level2_to_level6totalDepositAmount += parseFloat(deposit.money);
      });

      if (deposits.length > 0) {
        level2_to_level6firstDepositCount++;
      }
      level2_to_level6totalDepositCount += deposits.length;
    }

    async function countLevelOneUsers(code) {
      const [inviteData] = await connection.query(
        "SELECT COUNT(*) AS count FROM users WHERE `invite` = ?",
        [code],
      );
      return inviteData[0].count;
    }

    async function countDownlineUsers(code, end = 10, visited = new Set()) {
      return countDownline(code, 1, end, visited);
    }

    async function countDownline(code, depth, end, visited) {
      if (depth > end || visited.has(code)) {
        return 0;
      }

      visited.add(code);

      let totalUsers = 1; // Count the current user

      const [inviteData] = await connection.query(
        "SELECT DISTINCT `code` FROM users WHERE `invite` = ?",
        [code],
      );

      if (inviteData.length > 0) {
        for (const invite of inviteData) {
          totalUsers += await countDownline(
            invite.code,
            depth + 1,
            end,
            visited,
          );
        }
      }

      return totalUsers;
    }

    // Usage examples:

    // Count level 1 users
    const level1Count = await countLevelOneUsers(userInfo.code);
    // //console.log("Total level 1 users:", level1Count);

    // Count downline users up to level 6
    const downlineCount = await countDownlineUsers(userInfo.code);
    // //console.log("Total downline users up to level 6:", downlineCount);

    const total_today_count = level2_to_level6count + level1_today_rows.length;
    const rosesF1 = parseFloat(userInfo.roses_f);
    const rosesAll = parseFloat(userInfo.roses_f1);
    let rosesAdd = rosesF1 + rosesAll;

    return res.status(200).json({
      message: "Receive success",

      info: user,
      level1Count: level1Count,
      status: true,
      total_today_count: total_today_count,
      level1_count: level1_today_rows_today.length, // Use length directly instead of counting in l
      level1_today_rows: level1_today_rows,
      totalDepositCount: totalDepositCount,
      currentDate: currentDate,
      totalDepositAmount: totalDepositAmount,
      firstDepositCount: firstDepositCount,
      //   selectedData: selectedData,
      level2_to_level6count: level2to6activeuser,
      level2_to_level6totalDepositCount: level2_to_level6totalDepositCount,
      level2_to_level6totalDepositAmount: level2_to_level6totalDepositAmount,
      level2_to_level6firstDepositCount: level2_to_level6firstDepositCount,
      total_downline_count: downlineCount - 1,
      invite: {
        f1: f1s.length,
        total_f: selectedData.length,
        f1_today: f1_today,
        f_all_today: f_all_today,
        roses_f1: userInfo.roses_f1,
        roses_f: userInfo.roses_f,
        roses_all: rosesAdd,
        roses_today: userInfo.roses_today,
      },
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    // You can handle the error here, such as logging it or throwing it further
    return res.status(200).json({
      message: error.message,
      status: false,
      timeStamp: timeNow,
    });
  }
};

const transactionHistory = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [user] = await connection.query(
      "SELECT `phone` FROM users WHERE `token` = ? ",
      [auth],
    );

    // Implement pagination
    const limit = parseInt(req.query.limit) || 300; // Number of records per page
    const page = parseInt(req.query.page) || 1; // Current page number
    const offset = (page - 1) * limit;

    const data = await connection.query(
      "SELECT * FROM transaction_history WHERE phone = ? ORDER BY id DESC LIMIT ? OFFSET ?",
      [user[0].phone, limit, offset],
    );

    const phone = user[0].phone;

    // await connection.query(
    //  "DELETE FROM `transaction_history` WHERE `phone` = ? AND `time` < DATE_SUB(NOW(), INTERVAL 1 MONTH)",
    //   [user[0].phone]
    // );

    await connection.query(
      "DELETE FROM `transaction` WHERE `phone` = ? AND `today` <  DATE_SUB(NOW(), INTERVAL 1 MONTH)",
      [user[0].phone],
    );
    const sevenDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    await connection.query(
      "DELETE FROM `roses` WHERE `phone` = ? AND time < ?",
      [user[0].phone, sevenDaysAgo],
    );

    return res.status(200).send({
      success: true,
      message: "Get transaction history successfully",
      data: data[0],
      page: page,
      limit: limit,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Server error",
    });
  }
};

const totalCommission = async (req, res) => {
  let auth = req.cookies.auth;
  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }
  try {
    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite`, `roses_f`, `roses_f1`, `roses_today` FROM users WHERE `token` = ? ",
      [auth],
    );
    // Query for total balance
    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];

    // Get total commission before today (i.e., exclude today)
    const [totalCommissionBeforeToday] = await connection.execute(
      `SELECT SUM(commission) AS total FROM subordinatedata 
   WHERE phone = ? 
   AND type = "bet commission" 
   AND DATE(date) < ?`,
      [user[0].phone, formattedToday],
    );

    const totalBalance = totalCommissionBeforeToday[0]?.total || 0;

    // Query for yesterday's balance
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedDate = yesterday.toISOString().split("T")[0];

    const [datas] = await connection.execute(
      `SELECT commission FROM subordinatedata WHERE phone = ? AND DATE(date) = ? AND type = "bet commission"`,
      [user[0].phone, formattedDate],
    );

    const yesterdayBalance = datas.reduce((sum, record) => {
      return sum + parseFloat(record.commission);
    }, 0);

    // Query for last 7 days' balance
    const sevenDaysBeforeYesterday = new Date();
    sevenDaysBeforeYesterday.setDate(sevenDaysBeforeYesterday.getDate() - 7);
    const formattedSevenDaysAgo = sevenDaysBeforeYesterday
      .toISOString()
      .split("T")[0];

    // Query data between 7 days before yesterday and yesterday
    const [weeks] = await connection.execute(
      `SELECT commission FROM subordinatedata 
   WHERE phone = ? 
   AND DATE(date) BETWEEN ? AND ? 
   AND type = "bet commission"`,
      [user[0].phone, formattedSevenDaysAgo, formattedDate],
    );

    const weekBalance = weeks.reduce((sum, record) => {
      const balance = parseFloat(record.commission);
      return sum + (isNaN(balance) ? 0 : balance);
    }, 0);

    return res.status(200).send({
      success: true,
      message: "Transaction commissions retrieved successfully",
      totalBalance,
      yesterdayBalance,
      weekBalance,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Server error",
    });
  }
};

const myTeam = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
      [auth],
    );
    const [level] = await connection.query("SELECT * FROM level");
    if (!user) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    return res.status(200).json({
      message: "Receive success",
      level: level,
      info: user,
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const listMyTeam = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
      [auth],
    );
    if (!user) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    let userInfo = user[0];
    const [f1] = await connection.query(
      "SELECT `id_user`, `phone`, `code`, `invite`,`roses_f`, `rank`, `name_user`,`status`,`total_money`, `time` FROM users WHERE `invite` = ? ORDER BY id DESC",
      [userInfo.code],
    );
    const [mem] = await connection.query(
      "SELECT `id_user`, `phone`, `time` FROM users WHERE `invite` = ? ORDER BY id DESC LIMIT 100",
      [userInfo.code],
    );
    const [total_roses] = await connection.query(
      "SELECT `f1`,`invite`, `code`,`phone`,`time` FROM roses WHERE `invite` = ? ORDER BY id DESC LIMIT 100",
      [userInfo.code],
    );

    const selectedData = [];

    async function fetchUserDataByCode(code, depth = 1) {
      if (depth > 6) {
        return;
      }

      const [userData] = await connection.query(
        "SELECT `id_user`, `name_user`, `phone`, `code`, `invite`, `rank`, `total_money` FROM users WHERE `invite` = ?",
        [code],
      );
      if (userData.length > 0) {
        for (const user of userData) {
          const [turnoverData] = await connection.query(
            "SELECT `phone`, `daily_turn_over`, `total_turn_over` FROM turn_over WHERE `phone` = ?",
            [user.phone],
          );
          const [inviteCountData] = await connection.query(
            "SELECT COUNT(*) as invite_count FROM users WHERE `invite` = ?",
            [user.code],
          );
          const inviteCount = inviteCountData[0].invite_count;

          const userObject = {
            ...user,
            invite_count: inviteCount,
            user_level: depth,
            daily_turn_over: turnoverData[0]?.daily_turn_over || 0,
            total_turn_over: turnoverData[0]?.total_turn_over || 0,
          };

          selectedData.push(userObject);
          await fetchUserDataByCode(user.code, depth + 1);
        }
      }
    }

    await fetchUserDataByCode(userInfo.code);

    let newMem = [];
    mem.map((data) => {
      let objectMem = {
        id_user: data.id_user,
        phone:
          "91" + data.phone.slice(0, 1) + "****" + String(data.phone.slice(-4)),
        time: data.time,
      };

      return newMem.push(objectMem);
    });
    return res.status(200).json({
      message: "Receive success",
      f1: selectedData,
      f1_direct: f1,
      mem: newMem,
      total_roses: total_roses,
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};
const wowpay = async (req, res) => {
  let auth = req.cookies.auth;
  let money = req.body.money;

  // Fetching the user's mobile number from the database using auth token

  // Your existing controller code here
};

const recharge = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let rechid = req.cookies.orderid;
    let money = req.body.amount;
    let type = req.body.type;
    let typeid = req.body.typeid;
    let utr = req.body.utr;
    if (type != "cancel" && type != "submit" && type != "submitauto") {
      if (!auth || !money || money <= 299) {
        return res.status(200).json({
          message: "Minimum recharge 300",
          status: false,
          timeStamp: timeNow,
        });
      }
    }
    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite`,`isdemo` FROM users WHERE `token` = ?",
      [auth],
    );
    let userInfo = user[0];
    if (!user) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    if (userInfo.isdemo == 1) {
      let time = timerJoin2(Date.now());
      const date = new Date();

      let checkTime = timerJoin2(Date.now());
      let id_time =
        date.getUTCFullYear() +
        "" +
        date.getUTCMonth() +
        1 +
        "" +
        date.getUTCDate();
      let id_order =
        Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) +
        10000000000000;
      // let vat = Math.floor(Math.random() * (2000 - 0 + 1) ) + 0;

      money = Number(money);
      let client_transaction_id = id_time + id_order;

      const sql = `INSERT INTO recharge SET
            id_order = ?,
            transaction_id = ?,
            phone = ?,
            money = ?,
            type = ?,
            status = ?,
            today = ?,
            url = ?,
            time = ?,
            isdemo=?
            
            `;
      await connection.execute(sql, [
        client_transaction_id,
        "0",
        userInfo.phone,
        money,
        type,
        1,
        checkTime,
        "1",
        time,
        1,
      ]);

      await connection.execute(
        "UPDATE users SET money = money + ? WHERE phone = ? ",
        [money, userInfo.phone],
      );
      return res.status(200).json({
        message: "Demo Amount is added",
        status: false,
        timeStamp: timeNow,
      });
    }
    if (type == "bank") {
      return res.status(200).json({
        message: "Order creation successful",
        pay: true,
        phone: userInfo.phone,
        orderid: client_transaction_id,
        status: true,
        timeStamp: timeNow,
      });
    }

    if (type == "submit") {
      const [utrcount] = await connection.query(
        "SELECT * FROM recharge WHERE utr = ? ",
        [utr],
      );
      if (utrcount.length == 0) {
        await connection.query(
          "UPDATE recharge SET utr = ?, userStatus=1 WHERE phone = ? AND id_order = ? AND status = ? ",
          [utr, userInfo.phone, typeid, 0],
        );
        return res.status(200).json({
          message: "Submit successful",
          status: true,
          timeStamp: timeNow,
        });
      } else {
        return res.status(200).json({
          message: "UTR already submitted",
          status: true,
          timeStamp: timeNow,
        });
      }
    }

    let time = timerJoin2(Date.now());
    const date = new Date();

    let checkTime = timerJoin2(Date.now());
    let id_time =
      date.getUTCFullYear() +
      "" +
      date.getUTCMonth() +
      1 +
      "" +
      date.getUTCDate();
    let id_order =
      Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) +
      10000000000000;
    // let vat = Math.floor(Math.random() * (2000 - 0 + 1) ) + 0;

    money = Number(money);
    let client_transaction_id = id_time + id_order;

    const sql = `INSERT INTO recharge SET
        id_order = ?,
        transaction_id = ?,
        phone = ?,
        money = ?,
        type = ?,
        status = ?,
        today = ?,
        url = ?,
        time = ?,
  userStatus=?
        
        `;
    await connection.execute(sql, [
      client_transaction_id,
      "0",
      userInfo.phone,
      money,
      type,
      0,
      checkTime,
      "0",
      time,
      0,
    ]);
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

const handleCallback = async (req, res) => {
  const { order_id, status } = req.body;

  if ((!order_id, !status)) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  try {
    if (status == "success") {
      const [checkRecharge] = await connection.query(
        `SELECT * FROM recharge WHERE id_order = ? AND status = 1`,
        [order_id],
      );

      if (checkRecharge >= 1) {
        return res.status(400).json({
          message: "Recharge are successed",
          status: false,
        });
      }

      const [info] = await connection.query(
        `SELECT * FROM recharge WHERE id_order = ?`,
        [order_id],
      );

      // //console.log("info", info[0].phone);

      const [user] = await connection.query(
        `SELECT * FROM users WHERE phone = ?`,
        [info[0].phone],
      );
      let userInfo = user[0];

      // //console.log("user", userInfo);

      if (info.length === 0) {
        return res.status(404).json({
          message: "Recharge not found",
          status: false,
        });
      }

      let checkTime = timerJoin2(Date.now());

      // const [UserInfo] = await connection.query(
      //   `SELECT * FROM users WHERE phone = ?`,
      //   [info[0].phone]
      // );
      const [Firstrecharge] = await connection.query(
        "SELECT * FROM recharge WHERE phone = ? AND status = ?",
        [info[0].phone, 1],
      );

      const [result] = await connection.execute(
        `SELECT * FROM rechargeBonus ORDER BY id DESC`,
      );

      if (Firstrecharge.length === 0) {
        let bonus = 0;
        for (const element of result) {
          // Check if it's the first recharge
          if (parseInt(element.is_fisrtrecharge) === 1) {
            if (info[0].money === parseFloat(element.recAmount)) {
              bonus = parseFloat(element.bonus);
              break; // Exit the loop once a match is found
            }
          } else if (parseInt(element.is_persent) === 1) {
            bonus = (info[0].money * parseFloat(element.bonus)) / 100;
            break; // Exit the loop after calculating the percentage-based bonus
          }
        }

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
          "Big Recharge Bonus",
          info[0].phone,
          bonus,
          "credit",
          1,
          1,
          checkTime,
          checkTime,
        ]);
        await connection.query(
          "UPDATE users SET money = money + ?, total_money = total_money + ?,recharge=recharge+? WHERE phone = ?",
          [bonus, bonus, bonus, info[0].phone],
        );
        const datasqll =
          "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
        await connection.query(datasqll, [
          info[0].phone,
          "First deposit bonus",
          bonus,
          checkTime,
        ]);

        // upline
        let refferal = userInfo.invite;
        let [refferaluser] = await connection.query(
          "SELECT * FROM users WHERE `code` = ? LIMIT 1",
          [refferal],
        );
        await connection.query(
          "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?",
          [info[0].money * 0.2, info[0].money * 0.2, refferaluser[0].phone],
        );

        const datasql =
          "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
        await connection.query(datasql, [
          refferaluser[0].phone,
          "Bonus",
          info[0].money * 0.2,
          checkTime,
        ]);
        await connection.query(
          `UPDATE recharge SET status = 1 WHERE id_order = ?`,
          [order_id],
        );
      } else {
        await connection.query(
          `UPDATE recharge SET status = 1 WHERE id_order = ?`,
          [order_id],
        );
        await connection.query(
          "UPDATE users SET money = money + ?, total_money = total_money + ?,recharge=recharge+? WHERE phone = ?",
          [info[0].money, info[0].money, info[0].money, info[0].phone],
        );
        const datasqls =
          "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
        await connection.query(datasqls, [
          info[0].phone,
          "Deposit",
          info[0].money,
          checkTime,
        ]);
      }

      return res.status(200).json({
        message: "Application confirmed successfully",
        status: true,
        datas: info,
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

const onlineRecharge = async (req, res) => {
  // //console.log("yugyugtygytgyt");

  try {
    const token = req.cookies.auth;
    const money = Number(req.body.amount);
    const type = req.body.type;

    if (!token || !money || money <= 299) {
      return res.status(200).json({
        message: "Minimum recharge 300",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [users] = await connection.query(
      "SELECT `phone`, `code`,`invite`,`isdemo` FROM users WHERE `token` = ?",
      [token],
    );
    let userInfo = users[0];

    // //console.log("userinfo", userInfo);
    if (!users) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    let checkTime = timerJoin2(Date.now());
    let time = timerJoin2(Date.now());
    if (userInfo.isdemo == 1) {
      const date = new Date();

      let id_time =
        date.getUTCFullYear() +
        "" +
        date.getUTCMonth() +
        1 +
        "" +
        date.getUTCDate();
      let id_order =
        Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) +
        10000000000000;
      // let vat = Math.floor(Math.random() * (2000 - 0 + 1) ) + 0;

      money = Number(money);
      let client_transaction_id = id_time + id_order;

      const sql = `INSERT INTO recharge SET
            id_order = ?,
            transaction_id = ?,
            phone = ?,
            money = ?,
            type = ?,
            status = ?,
            today = ?,
            url = ?,
            time = ?,
            isdemo=?
            
            `;
      await connection.execute(sql, [
        client_transaction_id,
        "0",
        userInfo.phone,
        money,
        "demo",
        1,
        checkTime,
        "1",
        time,
        1,
      ]);

      await connection.execute(
        "UPDATE users SET money = money + ? WHERE phone = ? ",
        [money, userInfo.phone],
      );
      return res.status(200).json({
        message: "Demo Amount is added",
        status: false,
        timeStamp: timeNow,
      });
    }

    // const domain = window.location.origin;
    const domain = req.headers.host;
    const [rows] = await connection.execute(
      "SELECT key_id FROM recharge_chennal",
    );

    let channelKey = rows[0].key_id;

    // //console.log("rows", rows[0].key_id);

    const postData = {
      amount: money,
      user: userInfo.phone,
      auth: channelKey,
      callback: `${domain}/api/webapi/bhatclub_callback`, // Uses the dynamic domain
      redirect_url: `${domain}/wallet/rechargerecord`, // Uses the dynamic domain
    };

    const response = await axios.post(
      "https://api.quikpay.live/api/payin2",
      postData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const cleanResponse = response.data.substring(response.data.indexOf("{"));

    // Parse the JSON string into an object
    const jsonResponse = JSON.parse(cleanResponse);

    // Decode the URL
    const decodedUrl = jsonResponse.url.replace(/\\/g, ""); // Remove backslashes
    const data = jsonResponse; // Parse JSON

    //console.log("Response:", jsonResponse);

    if (data.status == "success") {
      const { url, order_id } = data;

      await connection.execute(
        "INSERT INTO recharge SET id_order = ?, transaction_id = ?, phone = ?, money = ?, type = ?, status = ?, today = ?, url = ?, time = ?, userStatus = ?",
        [
          order_id,
          "0",
          userInfo.phone,
          money,
          type,
          0,
          checkTime,
          url,
          time,
          0,
        ],
      );

      return res.status(200).json({
        success: true,
        message: "Recharge initiated successfully",
        data: jsonResponse,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: data.message || "Failed to initiate recharge",
      });
    }
  } catch (error) {
    console.error("Error in recharge controller:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const cancelRecharge = async (req, res) => {
  try {
    let auth = req.cookies.auth;

    if (!auth) {
      return res.status(200).json({
        message: "Authorization is required to access this API!",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [user] = await connection.query(
      "SELECT `phone`, `code`,`name_user`,`invite` FROM users WHERE `token` = ? ",
      [auth],
    );

    if (!user) {
      return res.status(200).json({
        message: "Authorization is required to access this API!",
        status: false,
        timeStamp: timeNow,
      });
    }

    let userInfo = user[0];

    const result = await connection.query(
      "DELETE FROM recharge WHERE phone = ? AND status = ?",
      [userInfo.phone, 0],
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({
        message: "All the pending recharges has been deleted successfully!",
        status: true,
        timeStamp: timeNow,
      });
    } else {
      return res.status(200).json({
        message:
          "There was no pending recharges for this user or delete operation has been failed!",
        status: true,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    console.error("API error: ", error);
    return res.status(500).json({
      message: "API Request failed!",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const addBank = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let name_bank = req.body.name_bank;
    let name_user = req.body.name_user;
    let stk = req.body.stk;
    let email = req.body.ifsc;
    let sdt = req.body.sdt;
    let tinh = req.body.tinh;
    let chi_nhanh = req.body.usdt;

    let time = timerJoin2(Date.now());

    if (!auth || !name_bank || !name_user || !stk || !tinh) {
      return res.status(200).json({
        message: "Please enter all field",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
      [auth],
    );
    let userInfo = user[0];
    if (!user) {
      return res.status(200).json({
        message: "Invalid user",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [user_bank] = await connection.query(
      "SELECT * FROM user_bank WHERE tinh = ? ",
      [tinh],
    );
    const [user_bank2] = await connection.query(
      "SELECT * FROM user_bank WHERE phone = ? ",
      [userInfo.phone],
    );

    if (tinh != userInfo.phone) {
      return res.status(200).json({
        message: "Invalid phone number",
        status: false,
      });
    }

    if (user_bank2[0]?.stk >= 5) {
      return res.status(200).json({
        message: "Bank Already updated",
        status: false,
      });
    }

    if (user_bank.length == 0 && user_bank2.length == 0) {
      const sql = `INSERT INTO user_bank SET 
        phone = ?,
        name_bank = ?,
        name_user = ?,
        stk = ?,
        email = ?,
        sdt = ?,
        tinh = ?,
        chi_nhanh=?,
        time = ?`;
      await connection.execute(sql, [
        userInfo.phone,
        name_bank,
        name_user,
        stk,
        email,
        "0",
        tinh,
        "0",
        time,
      ]);

      return res.status(200).json({
        message: "Successfully added bank",
        status: true,
        timeStamp: timeNow,
      });
      // } else if (user_bank.length == 0) {
      //     await connection.query('UPDATE user_bank SET tinh = ? WHERE phone = ? ', [tinh, userInfo.phone]);
      //     return res.status(200).json({
      //         message: 'KYC Already Done',
      //         status: false,
      //         timeStamp: timeNow,
      //     });
    } else if (user_bank2.length > 0) {
      await connection.query(
        "UPDATE user_bank SET name_bank = ?, name_user = ?, stk = ?, email = ?, sdt = ?, tinh = ?,chi_nhanh=?, time = ? WHERE phone = ?",
        [
          name_bank,
          name_user,
          stk,
          email,
          "0",
          tinh,
          "0",
          time,
          userInfo.phone,
        ],
      );
      return res.status(200).json({
        message: "your account is updated",
        status: true,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const addUSDT = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let remarkType = req.body.remarkType;
    let sdt = req.body.sdt;

    let time = timerJoin2(Date.now());

    if (!auth || !sdt || !remarkType) {
      return res.status(200).json({
        message: "Please enter all field",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
      [auth],
    );
    let userInfo = user[0];
    if (!user) {
      return res.status(200).json({
        message: "Invalid user",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [user_bank2] = await connection.query(
      "SELECT * FROM user_bank WHERE phone = ? ",
      [userInfo.phone],
    );

    if (sdt.length == 0 && user_bank2.length == 0) {
      const sql = `INSERT INTO user_bank SET 
        phone = ?,
        name_bank = ?,
        name_user = ?,
        stk = ?,
        email = ?,
        sdt = ?,
        tinh = ?,
        chi_nhanh=?,
        remarkType=?,
        time = ?`;
      await connection.execute(sql, [
        userInfo.phone,
        "0",
        "0",
        "0",
        "0",
        sdt,
        "0",
        "0",
        remarkType,
        time,
      ]);

      return res.status(200).json({
        message: "Successfully added bank",
        status: true,
        timeStamp: timeNow,
      });
      // } else if (user_bank.length == 0) {
      //     await connection.query('UPDATE user_bank SET tinh = ? WHERE phone = ? ', [tinh, userInfo.phone]);
      //     return res.status(200).json({
      //         message: 'KYC Already Done',
      //         status: false,
      //         timeStamp: timeNow,
      //     });
    } else if (user_bank2.length > 0) {
      await connection.query(
        "UPDATE user_bank SET sdt = ?,remarkType=? WHERE phone = ?",
        [sdt, remarkType, userInfo.phone],
      );
      return res.status(200).json({
        message: "your account is updated",
        status: true,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const infoUserBank = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite`, `money` FROM users WHERE `token` = ? ",
      [auth],
    );
    let userInfo = user[0];
    if (!user) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    function formateT(params) {
      let result = params < 10 ? "0" + params : params;
      return result;
    }

    function timerJoin(params = "", addHours = 0) {
      let date = "";
      if (params) {
        date = new Date(Number(params));
      } else {
        date = new Date();
      }

      date.setHours(date.getHours() + addHours);

      let years = formateT(date.getFullYear());
      let months = formateT(date.getMonth() + 1);
      let days = formateT(date.getDate());

      let hours = date.getHours() % 12;
      hours = hours === 0 ? 12 : hours;
      let ampm = date.getHours() < 12 ? "AM" : "PM";

      let minutes = formateT(date.getMinutes());
      let seconds = formateT(date.getSeconds());

      return (
        years +
        "-" +
        months +
        "-" +
        days +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds +
        " " +
        ampm
      );
    }
    let date = new Date().getTime();
    let checkTime = timerJoin(date);
    const [recharge] = await connection.query(
      "SELECT * FROM recharge WHERE phone = ? AND status = 1",
      [userInfo.phone],
    );
    const [minutes_1] = await connection.query(
      "SELECT * FROM minutes_1 WHERE phone = ?",
      [userInfo.phone],
    );
    let total = 0;
    recharge.forEach((data) => {
      total += parseFloat(data.money);
    });
    let total2 = 0;
    minutes_1.forEach((data) => {
      total2 += parseFloat(data.money);
    });
    let fee = 0;
    minutes_1.forEach((data) => {
      fee += parseFloat(data.fee);
    });

    result = Math.max(result, 0);
    let result = 0;
    if (total - total2 > 0) result = total - total2 - fee;

    const [userBank] = await connection.query(
      "SELECT * FROM user_bank WHERE phone = ? ",
      [userInfo.phone],
    );
    return res.status(200).json({
      message: "Received successfully",
      datas: userBank,
      userInfo: user,
      result: result,
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

function timerJoin4(params = "", addHours = 0) {
  let date = "";
  if (params) {
    date = new Date(Number(params));
  } else {
    date = new Date();
  }

  date.setHours(date.getHours() + addHours);

  let years = formateT(date.getFullYear());
  let months = formateT(date.getMonth() + 1);
  let days = formateT(date.getDate());

  let hours = date.getHours() % 12;
  hours = hours === 0 ? 12 : hours;

  let minutes = formateT(date.getMinutes());
  let seconds = formateT(date.getSeconds());

  return years + "-" + months + "-" + days;
}

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

function generateOrderId() {
  const prefix = "WD"; // can change if needed
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const randomPart =
    Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) +
    10000000000000; // 14-digit random number
  const suffix = String.fromCharCode(97 + Math.floor(Math.random() * 26)); // random a-z letter

  const id_order = `${prefix}${date}${randomPart}${suffix}`;
  return id_order;
}

const withdrawal3 = async (req, res) => {
  const ip =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress || "";
  const agent = req.headers["user-agent"] || "";
  let user_phone = null;
  let action_id = "1234567890";
  let action_status = "fail";
  let info = "";
  let money = req.body.money || null;

  try {
    let auth = req.cookies.auth;
    let type = req.body.type;
    let password = req.body.password;
    let timeNow = Date.now(); // Or your own time logic

    if (type === "USDT" && money < 850) {
      info = JSON.stringify({ reason: "usdt_below_min" });
      return res.status(200).json({
        message: "withdraw amount $10 to $500",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (!auth || !money || money < 109) {
      info = JSON.stringify({ reason: "below_minimum" });
      return res.status(200).json({
        message: "Minimum amount 110",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [user] = await connection.query(
      "SELECT * FROM users WHERE `token` = ? AND password = ?",
      [auth, md5(password)],
    );

    if (type === "BANK CARD" && money > 50000) {
      user_phone = user[0]?.phone || null;
      info = JSON.stringify({ reason: "bankcard_above_max" });
      return res.status(200).json({
        message: "withdraw amount 110 to 50000",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (user.length == 0) {
      info = JSON.stringify({ reason: "invalid_user" });
      return res.status(200).json({
        message: "Invalid user",
        status: false,
        timeStamp: timeNow,
      });
    }
    let userInfo = user[0];
    user_phone = userInfo.phone;

    if (userInfo.enableWithdraw === 0) {
      info = JSON.stringify({ reason: "enableWithdraw_blocked" });
      return res.status(200).json({
        message:
          "Withdrawals are currently disabled. Please contact customer support.",
        status: false,
      });
    }

    const date = new Date();
    let id_time =
      date.getUTCFullYear() +
      "" +
      (date.getUTCMonth() + 1) +
      "" +
      date.getUTCDate();
    let id_order = generateOrderId();

    let dates = timerJoin2(Date.now());
    let checkTime = timerJoin2(Date.now());
    let checkTime4 = timerJoin4(Date.now());

    const [recharge] = await connection.query(
      "SELECT * FROM recharge WHERE phone = ? AND status = 1",
      [userInfo.phone],
    );
    const [minutes_1] = await connection.query(
      "SELECT * FROM minutes_1 WHERE phone = ?",
      [userInfo.phone],
    );
    let total = 0;
    recharge.forEach((data) => {
      total += parseFloat(data.money);
    });
    let total2 = 0;
    minutes_1.forEach((data) => {
      total2 += parseFloat(data.money);
    });
    let result = 0;
    if (total - total2 > 0) result = total - total2;
    result = Math.max(result, 0);

    const [user_bank] = await connection.query(
      "SELECT * FROM user_bank WHERE `phone` = ?",
      [userInfo.phone],
    );
    let needbet = userInfo.recharge;

    const [withdraw] = await connection.query(
      "SELECT * FROM withdraw WHERE `phone` = ? AND DATE(today)=?",
      [userInfo.phone, checkTime4],
    );

    const [rowss] = await connection.query(
      "SELECT SUM(money) AS total_recharge FROM recharge WHERE phone = ? AND status = 1",
      [userInfo.phone],
    );

    // Agar recharge hi nahi hua
    if (!rowss[0].total_recharge || rowss[0].total_recharge < 200) {
      const info = JSON.stringify({ reason: "insufficient_recharge" });
      return res.status(200).json({
        message: "Need at least ₹200 recharge",
        status: false,
      });
    }

    if (userInfo.isdemo == 1) {
      // DEMO MODE
      const sql = `INSERT INTO withdraw SET 
        id_order = ?, phone = ?, money = ?, stk = ?, sdt = ?, type=?, usdt=?, name_bank = ?, ifsc = ?, name_user = ?, status = ?, today = ?, time = ?, isdemo=?`;
      await connection.execute(sql, [
        action_id,
        userInfo.phone,
        money,
        "demo",
        "demo",
        "demo",
        "demo",
        "demo",
        "demo",
        "demo",
        "1",
        checkTime,
        dates,
        1,
      ]);
      await connection.execute(
        "UPDATE users SET money = money - ? WHERE phone = ? ",
        [money, userInfo.phone],
      );
      action_status = "success";
      info = JSON.stringify({ type: "demo" });
      return res.status(200).json({
        message: "Withdrawal successful",
        status: true,
        money: userInfo.money - money,
        timeStamp: timeNow,
      });
    }

    // Normal withdrawal
    if (user_bank.length != 0) {
      if (withdraw.length < 3) {
        if (userInfo.money - money >= 0) {
          if (needbet == 0) {
            let infoBank = user_bank[0];
            const sql = `INSERT INTO withdraw SET 
              id_order = ?, phone = ?, money = ?, stk = ?, sdt = ?, type=?, usdt=?, name_bank = ?, ifsc = ?, name_user = ?, status = ?, today = ?, time = ?`;
            await connection.execute(sql, [
              action_id,
              userInfo.phone,
              money,
              infoBank.stk,
              infoBank.sdt,
              type,
              infoBank.chi_nhanh,
              infoBank.name_bank,
              infoBank.email,
              infoBank.name_user,
              0,
              checkTime,
              dates,
            ]);
            await connection.execute(
              "UPDATE users SET money = money - ? WHERE phone = ? ",
              [money, userInfo.phone],
            );
            action_status = "success";
            info = JSON.stringify({ type });
            return res.status(200).json({
              message: "Withdrawal successful",
              status: true,
              money: userInfo.money - money,
              timeStamp: timeNow,
            });
          } else {
            info = JSON.stringify({ reason: "need_bet", result });
            return res.status(200).json({
              message: "The total bet is not enough to fulfill the request",
              status: false,
              result: result,
              timeStamp: timeNow,
            });
          }
        } else {
          info = JSON.stringify({ reason: "insufficient_balance" });
          return res.status(200).json({
            message: "The balance is not enough to fulfill the request",
            status: false,
            timeStamp: timeNow,
          });
        }
      } else {
        info = JSON.stringify({ reason: "max_daily_withdraw" });
        return res.status(200).json({
          message: "You can only make 2 withdrawals  request per day",
          status: false,
          timeStamp: timeNow,
        });
      }
    } else {
      info = JSON.stringify({ reason: "no_bank_linked" });
      return res.status(200).json({
        message: "Please link your bank first",
        status: false,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    info = JSON.stringify({ error: error.message });
    //console.log("errrorrr",error.message)
    return res
      .status(500)
      .json({ message: "Internal server error", status: false });
  } finally {
    // Final log, always called before function ends
    // Only log if there's some meaningful user_phone or money or status context
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

const transfer = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let amount = req.body.amount;
    let receiver_phone = req.body.phone;
    const date = new Date();
    // let id_time = date.getUTCFullYear() + '' + (date.getUTCMonth() + 1) + '' + date.getUTCDate();
    let id_order =
      Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) +
      10000000000000;
    let time = timerJoin2(Date.now());
    let client_transaction_id = id_order;

    const [user] = await connection.query(
      "SELECT `phone`,`money`, `code`,`invite` FROM users WHERE `token` = ? ",
      [auth],
    );
    let userInfo = user[0];
    let sender_phone = userInfo.phone;
    let sender_money = parseInt(userInfo.money);
    if (!user) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }

    function formateT(params) {
      let result = params < 10 ? "0" + params : params;
      return result;
    }

    function timerJoin(params = "", addHours = 0) {
      let date = "";
      if (params) {
        date = new Date(Number(params));
      } else {
        date = new Date();
      }

      date.setHours(date.getHours() + addHours);

      let years = formateT(date.getFullYear());
      let months = formateT(date.getMonth() + 1);
      let days = formateT(date.getDate());

      let hours = date.getHours() % 12;
      hours = hours === 0 ? 12 : hours;
      let ampm = date.getHours() < 12 ? "AM" : "PM";

      let minutes = formateT(date.getMinutes());
      let seconds = formateT(date.getSeconds());

      return (
        years +
        "-" +
        months +
        "-" +
        days +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds +
        " " +
        ampm
      );
    }

    let dates = new Date().getTime();
    let checkTime = timerJoin(dates);
    const [recharge] = await connection.query(
      "SELECT * FROM recharge WHERE phone = ? AND status = 1 ",
      [userInfo.phone],
    );
    const [minutes_1] = await connection.query(
      "SELECT * FROM minutes_1 WHERE phone = ? ",
      [userInfo.phone],
    );
    let total = 0;
    recharge.forEach((data) => {
      total += data.money;
    });
    let total2 = 0;
    minutes_1.forEach((data) => {
      total2 += data.money;
    });

    let result = 0;
    if (total - total2 > 0) result = total - total2;

    // console.log('date:', result);
    if (result == 0) {
      if (sender_money >= amount) {
        let [receiver] = await connection.query(
          "SELECT * FROM users WHERE `phone` = ?",
          [receiver_phone],
        );
        if (receiver.length === 1 && sender_phone !== receiver_phone) {
          let money = sender_money - amount;
          let total_money = amount + receiver[0].total_money;
          // await connection.query('UPDATE users SET money = ? WHERE phone = ?', [money, sender_phone]);
          // await connection.query(`UPDATE users SET money = money + ? WHERE phone = ?`, [amount, receiver_phone]);
          const sql =
            "INSERT INTO balance_transfer (sender_phone, receiver_phone, amount) VALUES (?, ?, ?)";
          await connection.execute(sql, [sender_phone, receiver_phone, amount]);
          const sql_recharge =
            "INSERT INTO recharge (id_order, transaction_id, phone, money, type, status, today, url, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
          await connection.execute(sql_recharge, [
            client_transaction_id,
            0,
            receiver_phone,
            amount,
            "wallet",
            0,
            checkTime,
            0,
            time,
          ]);

          return res.status(200).json({
            message: `Requested ${amount} sent successfully`,
            status: true,
            timeStamp: timeNow,
          });
        } else {
          return res.status(200).json({
            message: `${receiver_phone} is not a valid user mobile number`,
            status: false,
            timeStamp: timeNow,
          });
        }
      } else {
        return res.status(200).json({
          message: "Your balance is not enough",
          status: false,
          timeStamp: timeNow,
        });
      }
    } else {
      return res.status(200).json({
        message: "The total bet is not enough to fulfill the request",
        status: false,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// get transfer balance data
const transferHistory = async (req, res) => {
  try {
    let auth = req.cookies.auth;

    const [user] = await connection.query(
      "SELECT `phone`,`money`, `code`,`invite` FROM users WHERE `token` = ? ",
      [auth],
    );
    let userInfo = user[0];
    if (!user) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [history] = await connection.query(
      "SELECT * FROM balance_transfer WHERE sender_phone = ?",
      [userInfo.phone],
    );
    const [receive] = await connection.query(
      "SELECT * FROM balance_transfer WHERE receiver_phone = ?",
      [userInfo.phone],
    );
    if (receive.length > 0 || history.length > 0) {
      return res.status(200).json({
        message: "Success",
        receive: receive,
        datas: history,
        status: true,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const generateQRCode = async (data) => {
  try {
    let qrCodeDataURL = await QRCode.toDataURL(data);
    //   //console.log("QR Code generated successfully.");
    return qrCodeDataURL;
  } catch (err) {
    console.error("Error generating QR code:", err);
  }
};

const recharge2 = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let money = req.body.money;
    if (!auth || money) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
      [auth],
    );
    let userInfo = user[0];
    if (!user) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [recharge] = await connection.query(
      "SELECT * FROM recharge WHERE phone = ? AND status = ? ORDER BY id DESC LIMIT 1",
      [userInfo.phone, 0],
    );

    const [bank_recharge] = await connection.query(
      "SELECT * FROM bank_recharge",
    );

    const upiUrl1 = `upi://pay?pa=${bank_recharge[0]?.stk}&pn="bdg"&am=${recharge[0]?.money}`;
    const qrcode1 = await generateQRCode(upiUrl1);

    const upiUrl2 = `upi://pay?pa=${bank_recharge[0]?.upi2}&pn="bdg"&am=${recharge[0]?.money}`;
    const qrcode2 = await generateQRCode(upiUrl2);
    const upiUrl3 = `upi://pay?pa=${bank_recharge[0]?.upi3}&pn="bdg"&am=${recharge[0]?.money}`;
    const qrcode3 = await generateQRCode(upiUrl3);

    if (recharge.length != 0) {
      return res.status(200).json({
        message: "Received successfully",
        datas: recharge[0],
        infoBank: bank_recharge,
        qrcode1: qrcode1,
        qrcode2: qrcode2,
        qrcode3: qrcode3,
        status: true,
        timeStamp: timeNow,
      });
    } else {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const listRecharge = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [admindata] = await connection.execute(
      "SELECT deposite_requre FROM admin",
    );

    const depositRequre = admindata[0].deposite_requre;

    // //console.log("admindata", admindata[0].deposite_requre);
    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
      [auth],
    );
    let userInfo = user[0];
    if (!user) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [recharge] = await connection.query(
      "SELECT * FROM recharge WHERE phone = ? ORDER BY id DESC ",
      [userInfo.phone],
    );
    return res.status(200).json({
      message: "Receive success",
      datas: { recharge, depositRequre },
      depositRequre: depositRequre,
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
    let auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }

    // //console.log("admindata", admindata[0].deposite_requre);
    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
      [auth],
    );
    let userInfo = user[0];
    if (!user) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [recharge2] = await connection.query(
      "SELECT * FROM recharge WHERE phone = ? AND status = 1 ORDER BY id DESC LIMIT 1",
      [userInfo.phone],
    );

    const [dpositReq] = await connection.execute(
      `SELECT deposite_requre FROM admin`,
    );

    if (dpositReq[0].deposite_requre == 1) {
      return res.status(200).json({
        message: "Receive success",
        data2: recharge2,
        status: true,
        timeStamp: timeNow,
      });
    } else {
      return res.status(200).json({
        message: "Receive success",
        status: true,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const search = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let phone = req.body.phone;
    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite`, `level` FROM users WHERE `token` = ? ",
      [auth],
    );
    if (user.length == 0) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    let userInfo = user[0];
    if (userInfo.level == 1) {
      const [users] = await connection.query(
        `SELECT * FROM users WHERE phone = ? ORDER BY id DESC `,
        [phone],
      );
      return res.status(200).json({
        message: "Receive success",
        datas: users,
        status: true,
        timeStamp: timeNow,
      });
    } else if (userInfo.level == 2) {
      const [users] = await connection.query(
        `SELECT * FROM users WHERE phone = ? ORDER BY id DESC `,
        [phone],
      );
      if (users.length == 0) {
        return res.status(200).json({
          message: "Receive success",
          datas: [],
          status: true,
          timeStamp: timeNow,
        });
      } else {
        if (users[0].ctv == userInfo.phone) {
          return res.status(200).json({
            message: "Receive success",
            datas: users,
            status: true,
            timeStamp: timeNow,
          });
        } else {
          return res.status(200).json({
            message: "Failed",
            status: false,
            timeStamp: timeNow,
          });
        }
      }
    } else {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const downlinerecharge = async (req, res) => {
  try {
    let auth = req.cookies.auth;

    const date = new Date().toISOString().slice(0, 10);

    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: new Date().getTime(),
      });
    }

    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ?",
      [auth],
    );
    if (!user) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: new Date().getTime(),
      });
    }

    let userInfo = user[0];

    const selectedData = [];

    async function fetchUserDataByCode(code, depth = 1) {
      if (depth > 6) {
        return;
      }

      const [userData] = await connection.query(
        "SELECT `id_user`, `name_user`, `phone`, `code`, `invite`, `rank`, `total_money`, `time` FROM users WHERE `invite` = ?",
        [code],
      );
      if (userData.length > 0) {
        for (const user of userData) {
          const userObject = {
            ...user,
            level: depth,
          };

          selectedData.push(userObject);
          await fetchUserDataByCode(user.code, depth + 1);
        }
      }
    }

    await fetchUserDataByCode(userInfo.code);

    const rechargeData_record = [];
    let total_recharge_count = 0;
    let total_recharge_amount = 0;
    let total_bet_count = 0;
    let total_bet_amount = 0;
    let total_first_recharge_count = 0;
    let better_number = 0;
    let totalCommsionsAmount = 0;

    async function fetchUserRechargeByCode(date) {
      for (let i = 0; i < selectedData.length; i++) {
        try {
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
            [
              selectedData[i].phone,
              date,
              selectedData[i].phone,
              date,
              selectedData[i].phone,
              date,
            ],
          );

          const [rechargeRecord] = await connection.query(
            `
                      SELECT IFNULL(SUM(\`money\`), 0) as grand_total_money 
                      FROM \`recharge\` 
                      WHERE \`phone\` = ? AND \`status\` = 1 AND DATE(\`today\`) = ?
                      `,
            [selectedData[i].phone, date],
          );

          const [deposits] = await connection.query(
            `
                      SELECT \`id\`, \`id_order\`, \`transaction_id\`, \`utr\`, \`phone\`, \`money\`, \`type\`, \`status\`, \`today\`, \`url\`, \`time\` 
                      FROM \`recharge\` 
                      WHERE \`phone\` = ? AND \`status\` = 1 AND DATE(\`today\`) = ?
                      `,
            [selectedData[i].phone, date],
          );

          const [userCombinedTotal_count] = await connection.query(
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
            [
              selectedData[i].phone,
              date,
              selectedData[i].phone,
              date,
              selectedData[i].phone,
              date,
            ],
          );

          const [commsions] = await connection.query(
            "SELECT SUM(`commission`) AS total_subordinatedata_amount, `date` FROM `subordinatedata` WHERE `phone` = ? AND DATE(`date`) = ?",
            [selectedData[i].phone, date],
          );

          const totalCommsionsAmount =
            commsions[0].total_subordinatedata_amount !== null
              ? commsions[0].total_subordinatedata_amount
              : 0;

          const rowCount = userCombinedTotal_count[0].row_count;
          total_bet_count += rowCount;
          deposits.forEach((deposit) => {
            total_recharge_amount += parseFloat(deposit.money);
          });

          if (deposits.length > 0) {
            total_first_recharge_count += 1;
          }

          const grandTotalMoney = userCombinedTotal[0].grand_total_money;
          const grandRechargeTotalMoney = rechargeRecord[0].grand_total_money;

          if (grandTotalMoney > 0) {
            better_number += 1;
          }

          total_recharge_count += deposits.length;
          total_bet_amount += parseFloat(grandTotalMoney);

          //   const date = new Date(String(selectedData[i].time));

          //   // Format the date as 'YYYY-MM-DDTHH:mm:ss.sssZ'
          //   const formattedDate = date.toISOString();

          const userObject = {
            totalBetAmount: grandTotalMoney,
            totalRechargeAmount: grandRechargeTotalMoney,
            totalCommsionsAmount: totalCommsionsAmount,
            userLevel: selectedData[i].level,
            userId: selectedData[i].id_user,
            dates: selectedData[i]?.time,
          };

          rechargeData_record.push(userObject);
        } catch (error) {
          console.error("Error fetching data:", error);
          return res.status(500).json({
            message: error.message,
            status: true,
            timeStamp: new Date().getTime(),
          });
        }
      }
    }

    // Function to mask phone number
    function maskPhoneNumber(phone) {
      // Assuming the phone number has 10 digits
      if (phone.length === 10) {
        // Masking logic: Keeping first four digits, masking rest, and keeping last three digits
        return phone.substring(0, 4) + "****" + phone.substring(7);
      } else {
        // If phone number doesn't match expected format, return as it is
        return phone;
      }
    }

    await fetchUserRechargeByCode(date);

    return res.status(200).json({
      message: "Success",
      status: true,
      timeStamp: new Date().getTime(),
      total_first_recharge_count: total_first_recharge_count,
      total_recharge_count: total_recharge_count,
      total_recharge_amount: total_recharge_amount,
      total_bet_count: total_bet_count,
      total_bet_amount: total_bet_amount,
      better_number: better_number,
      datas: rechargeData_record,
    });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

// subord
const downlinerecharge_data = async (req, res) => {
  let auth = req.cookies.auth;
  const { date } = req.body;

  if (!auth) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: new Date().getTime(),
    });
  }

  try {
    // Fetch user information based on the provided token
    const [user] = await connection.query(
      "SELECT `phone`, `code`, `invite` FROM users WHERE `token` = ?",
      [auth],
    );

    if (!user.length) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: new Date().getTime(),
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
      [userInfo.code],
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
        [user.phone, date, user.phone, date, user.phone, date],
      );

      const [rechargeRecord] = await connection.query(
        `
        SELECT IFNULL(SUM(\`money\`), 0) as grand_total_money 
        FROM \`recharge\` 
        WHERE \`phone\` = ? AND \`status\` = 1 AND DATE(\`today\`) = ?
        `,
        [user.phone, date],
      );

      const [deposits] = await connection.query(
        `
        SELECT \`id\`, \`id_order\`, \`transaction_id\`, \`utr\`, \`phone\`, \`money\`, \`type\`, \`status\`, \`today\`, \`url\`, \`time\` 
        FROM \`recharge\` 
        WHERE \`phone\` = ? AND \`status\` = 1 AND DATE(\`today\`) = ?
        `,
        [user.phone, date],
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
        [user.phone, date, user.phone, date, user.phone, date],
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
        ).toFixed(2),
      );
      let date1 = new Date(date);
      date1.setUTCHours(0, 0, 0, 0); // Set time to midnight UTC

      let timestamp = date1.getTime();

      //console.log(timestamp);
      return {
        totalBetAmount: parseFloat(
          userCombinedTotal[0]?.grand_total_money || 0,
        ).toFixed(2),
        totalRechargeAmount: parseFloat(
          rechargeRecord[0]?.grand_total_money || 0,
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
        data.totalCommissionsAmount > 0,
    );

    // Calculate totals
    const total_first_recharge_count = rechargeData.filter(
      (data) => data.firstRecharge,
    ).length;
    const total_recharge_count = rechargeData.reduce(
      (sum, data) => sum + data.rechargeCount,
      0,
    );
    const total_recharge_amount = rechargeData
      .reduce((sum, data) => sum + parseFloat(data.totalRechargeAmount), 0)
      .toFixed(2);
    const total_bet_count = rechargeData.reduce(
      (sum, data) => sum + data.betCount,
      0,
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

// subordinate data
const subordinatedata = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    // try {
    // Fetch user info based on token
    const [user] = await connection.query(
      "SELECT `phone`, `money`, `code`, `invite`, `user_level` FROM users WHERE `token` = ?",
      [auth],
    );
    let userInfo = user[0];
    if (!userInfo) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }

    let selectedData = [];
    const currentDate = new Date().toISOString().slice(0, 10);

    // Function to fetch invites recursively up to 6 levels
    async function fetchInvitesByCode(code, depth = 1) {
      if (depth > 6) {
        return;
      }

      const [inviteData] = await connection.query(
        "SELECT `id_user`, `name_user`, `phone`, `code`, `invite`, `rank`, `user_level`, `total_money` FROM users WHERE `invite` = ?",
        [code],
      );

      if (inviteData.length > 0) {
        for (const invite of inviteData) {
          // Push the invite data along with the user level into the selectedData array
          selectedData.push({
            id_user: invite.id_user,
            name_user: invite.name_user,
            phone: invite.phone,
            code: invite.code,
            invite: invite.invite,
            rank: invite.rank,
            user_level: depth, // Include user level
            total_money: invite.total_money,
          });

          // Recursively fetch invites for the next level
          await fetchInvitesByCode(invite.code, depth + 1);
        }
      }
    }

    // Fetch downline users from level 1 to 6
    await fetchInvitesByCode(userInfo.code);

    // Initialize variables for results
    let downlineUsers = [userInfo]; // Start with the main user
    downlineUsers = downlineUsers.concat(selectedData); // Include all downline users

    // To store results
    let results = [];

    // Iterate over each user (main user + downline users)
    for (const user of downlineUsers) {
      let totalRechargeAmount = 0;
      let totalBetAmount = 0;
      let totalCommsionsAmount = 0;
      let dates = 0;
      // Calculate total recharge amount for the current user
      const [recharges] = await connection.query(
        "SELECT SUM(`money`) as total_recharge_amount FROM `recharge` WHERE `phone` = ? AND `status` = 1",
        [user.phone],
      );
      totalRechargeAmount =
        recharges[0].total_recharge_amount !== null
          ? recharges[0].total_recharge_amount
          : 0;

      const [commsions] = await connection.query(
        "SELECT SUM(`commission`) as total_subordinatedata_amount,`date` FROM `subordinatedata` WHERE `phone` = ? AND `bonusby`=?",
        [userInfo.phone, user.phone],
      );

      totalCommsionsAmount =
        commsions[0].total_subordinatedata_amount !== null
          ? commsions[0].total_subordinatedata_amount
          : 0;
      dates = commsions[0].date !== null ? commsions[0].date : 0;

      // Calculate total bet amount for the current user
      const [userCombinedTotal] = await connection.query(
        `SELECT SUM(overall_total_money) as total_bet_amount
                 FROM (
                     SELECT SUM(\`money\`) as overall_total_money FROM minutes_1 WHERE \`phone\` = ? 
                     UNION 
                     SELECT SUM(\`money\`) as overall_total_money FROM result_k3 WHERE \`phone\` = ?
                     UNION 
                     SELECT SUM(\`money\`) as overall_total_money FROM result_5d WHERE \`phone\` = ?
                 ) combined_table`,
        [user.phone, user.phone, user.phone],
      );
      totalBetAmount =
        userCombinedTotal[0].total_bet_amount !== null
          ? userCombinedTotal[0].total_bet_amount
          : 0;

      // Collect the results for each user
      results.push({
        phone: user.phone,
        name: user.name_user,
        userLevel: user.user_level, // Include user level
        userId: user.id_user,
        totalRechargeAmount,
        totalBetAmount,
        totalCommsionsAmount,
        dates,
      });

      // Optionally, update the user's total money in the database
      // await connection.query('UPDATE users SET `total_money` = ? WHERE `phone` = ?', [totalBetAmount, user.phone]);
    }

    // Return the results
    return res.status(200).json({
      message: "Success",
      datas: results,
      success: true,
      timeStamp: timeNow,
    });

    // } catch (error) {
    //     return res.status(500).json({
    //         message: "Internal server error",
    //         success: false,
    //     });
    // }
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};
// subordinate data
const commissiondata = async (req, res) => {
  let auth = req.cookies.auth;
  try {
    // Fetch user info based on token
    const [user] = await connection.query(
      "SELECT `phone`, `money`, `code`, `invite`, `user_level` FROM users WHERE `token` = ?",
      [auth],
    );
    let userInfo = user[0];
    if (!userInfo) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [commsions] = await connection.query(
      "SELECT * FROM `subordinatedata` WHERE `phone` = ?",
      [userInfo.phone],
    );
    // Return the results
    return res.status(200).json({
      message: "Success",
      datas: commsions,
      success: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

const vipLevel = async (req, res) => {
  let auth = req.cookies.auth;
  try {
    // Fetch user info based on token
    const [user] = await connection.query(
      "SELECT `phone`, `money`, `code`, `invite`, `user_level` FROM users WHERE `token` = ?",
      [auth],
    );
    let userInfo = user[0];

    if (!userInfo) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    // Calculate total bet amount for the current user
    // const [userCombinedTotal] = await connection.query(
    //   `SELECT SUM(total_rows) as total_row_count
    //      FROM (
    //          SELECT COUNT(*) as total_rows FROM minutes_1 WHERE \`phone\` = ?
    //          UNION ALL
    //          SELECT COUNT(*) as total_rows FROM result_k3 WHERE \`phone\` = ?
    //          UNION ALL
    //          SELECT COUNT(*) as total_rows FROM result_5d WHERE \`phone\` = ?
    //      ) combined_table`,
    //   [userInfo.phone, userInfo.phone, userInfo.phone]
    // );

    // Calculate total money amount for the current user
    const [userTotalMoney] = await connection.query(
      `SELECT SUM(total_money) as total_money_sum
   FROM (
       SELECT SUM(money) as total_money FROM minutes_1 WHERE \`phone\` = ? 
       UNION ALL
       SELECT SUM(money) as total_money FROM result_k3 WHERE \`phone\` = ?
       UNION ALL
       SELECT SUM(money) as total_money FROM result_5d WHERE \`phone\` = ?
   ) combined_table`,
      [userInfo.phone, userInfo.phone, userInfo.phone],
    );

    // //console.log("userTotalMoney", userTotalMoney[0].total_money_sum);

    let validDepositsCount = userTotalMoney[0]?.total_money_sum;
    // //console.log("validDepositsCount", validDepositsCount);

    const [data] = await connection.query(
      "SELECT * FROM vip_record WHERE `phone` = ?",
      [userInfo.phone],
    );
    return res.status(200).json({
      message: "Success",
      data: data,
      levels: validDepositsCount,
      success: true,
      timeStamp: timeNow,
    });
  } catch (err) {
    return res.status(500).json({
      message: "internal server error",

      success: true,
      timeStamp: timeNow,
    });
  }
};

const vipLevelEvery = async () => {
  // //console.log("rrrrrrrrrrrrrrrr");
  try {
    // Fetch data from tables
    const [minutesData] = await connection.execute(
      "SELECT phone, money FROM minutes_1",
    );
    const [resultK3Data] = await connection.execute(
      "SELECT phone, money FROM result_k3",
    );
    const [result5DData] = await connection.execute(
      "SELECT phone, money FROM result_5d",
    );

    const [vipdata] = await connection.execute("SELECT * FROM vip_data");

    // //console.log("Processing data...", vipdata);
    const alldata = [...minutesData, ...resultK3Data, ...result5DData];

    let validDepositsCount = {}; // Total money per person
    let phoneCount = {}; // Count of records per phone

    // Process all data
    for (const item of alldata) {
      const { phone, money } = item;
      // //console.log("phone", validDepositsCount[phone]);

      const moneyValue = parseInt(money); // Convert money to a float number

      // If phone already exists in validDepositsCount, add the money value
      if (validDepositsCount[phone]) {
        validDepositsCount[phone] += moneyValue;
        phoneCount[phone] += 1; // Increment the count for that phone number
      } else {
        // Otherwise, initialize the money value and count for that phone number
        validDepositsCount[phone] = moneyValue;
        phoneCount[phone] = 1; // Initialize the count for that phone number
      }
    }

    // Get the current date and time
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const sumdate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    // Update user's money and insert bonus record if eligible and not already given
    for (const phone in validDepositsCount) {
      const totalAmount = validDepositsCount[phone]; // Get the total amount for this phone number
      let bonusAmount = 0;
      let level = 0;
      let rebetRet = 0;

      // Determine bonus amount based on the total amount for this phone number
      if (totalAmount >= vipdata[9].amount) {
        bonusAmount = vipdata[9].onetime;
        rebetRet = vipdata[9].rebet;
        level = 10;
      } else if (totalAmount >= vipdata[8].amount) {
        bonusAmount = vipdata[8].onetime;
        rebetRet = vipdata[8].rebet;
        level = 9;
      } else if (totalAmount >= vipdata[7].amount) {
        bonusAmount = vipdata[7].onetime;
        rebetRet = vipdata[7].rebet;
        level = 8;
      } else if (totalAmount >= vipdata[6].amount) {
        bonusAmount = vipdata[6].onetime;
        rebetRet = vipdata[6].rebet;
        level = 7;
      } else if (totalAmount >= vipdata[5].amount) {
        bonusAmount = vipdata[5].onetime;
        rebetRet = vipdata[5].rebet;
        level = 6;
      } else if (totalAmount >= vipdata[4].amount) {
        bonusAmount = vipdata[4].onetime;
        rebetRet = vipdata[4].rebet;
        level = 5;
      } else if (totalAmount >= vipdata[3].amount) {
        bonusAmount = vipdata[3].onetime;
        rebetRet = vipdata[3].rebet;
        level = 4;
      } else if (totalAmount >= vipdata[2].amount) {
        bonusAmount = vipdata[2].onetime;
        rebetRet = vipdata[2].rebet;
        level = 3;
      } else if (totalAmount >= vipdata[1].amount) {
        bonusAmount = vipdata[1].onetime;
        rebetRet = vipdata[1].rebet;
        level = 2;
      } else if (totalAmount >= vipdata[0].amount) {
        bonusAmount = vipdata[0].onetime;
        rebetRet = vipdata[0].rebet;
        level = 1;
      }

      if (bonusAmount > 0) {
        const [user] = await connection.execute(
          "SELECT * FROM users WHERE phone = ?",
          [phone],
        );

        let userInfo = user[0];

        if (userInfo) {
          if (userInfo.vip_level === 0 && totalAmount >= vipdata[0].amount) {
            const usedata = await connection.execute(
              "UPDATE users SET money = money + ?, vip_level = ?, needbet = needbet + ?, rebetRet = ? WHERE phone = ?",
              [bonusAmount, level, bonusAmount, rebetRet, phone],
            );
            // //console.log("usedata", usedata);
            await connection.execute(
              "INSERT INTO vip_record (phone, amount, level, date) VALUES (?, ?, ?, ?)",
              [phone, bonusAmount, level, sumdate],
            );
            await connection.query(
              "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, time = ?",
              [phone, "vip level0 bonus", bonusAmount, sumdate],
            );
          } else if (
            userInfo.vip_level === 1 &&
            totalAmount >= vipdata[1].amount
          ) {
            await connection.execute(
              "UPDATE users SET money = money + ?, vip_level = ?, needbet = needbet + ? WHERE phone = ?",
              [bonusAmount, level, bonusAmount, phone],
            );
            await connection.execute(
              "INSERT INTO vip_record (phone, amount, level, date) VALUES (?, ?, ?, ?)",
              [phone, bonusAmount, level, sumdate],
            );
            await connection.query(
              "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, time = ?",
              [phone, "vip level1 bonus", bonusAmount, sumdate],
            );
          } else if (
            userInfo.vip_level === 2 &&
            totalAmount >= vipdata[2].amount
          ) {
            await connection.execute(
              "UPDATE users SET money = money + ?, vip_level = ?, needbet = needbet + ? WHERE phone = ?",
              [bonusAmount, level, bonusAmount, phone],
            );

            await connection.execute(
              "INSERT INTO vip_record (phone, amount, level, date) VALUES (?, ?, ?, ?)",
              [phone, bonusAmount, level, sumdate],
            );
            await connection.query(
              "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, time = ?",
              [phone, "vip level2 bonus", bonusAmount, sumdate],
            );
          } else if (
            userInfo.vip_level === 3 &&
            totalAmount >= vipdata[3].amount
          ) {
            await connection.execute(
              "UPDATE users SET money = money + ?, vip_level = ?, needbet = needbet + ? WHERE phone = ?",
              [bonusAmount, level, bonusAmount, phone],
            );

            await connection.execute(
              "INSERT INTO vip_record (phone, amount, level, date) VALUES (?, ?, ?, ?)",
              [phone, bonusAmount, level, sumdate],
            );
            await connection.query(
              "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, time = ?",
              [phone, "vip level3 bonus", bonusAmount, sumdate],
            );
          } else if (
            userInfo.vip_level === 4 &&
            totalAmount >= vipdata[4].amount
          ) {
            await connection.execute(
              "UPDATE users SET money = money + ?, vip_level = ?, needbet = needbet + ? WHERE phone = ?",
              [bonusAmount, level, bonusAmount, phone],
            );

            await connection.execute(
              "INSERT INTO vip_record (phone, amount, level, date) VALUES (?, ?, ?, ?)",
              [phone, bonusAmount, level, sumdate],
            );
            await connection.query(
              "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, time = ?",
              [phone, "vip level4 bonus", bonusAmount, sumdate],
            );
          } else if (
            userInfo.vip_level === 5 &&
            totalAmount >= vipdata[5].amount
          ) {
            await connection.execute(
              "UPDATE users SET money = money + ?, vip_level = ?, needbet = needbet + ? WHERE phone = ?",
              [bonusAmount, level, bonusAmount, phone],
            );

            await connection.execute(
              "INSERT INTO vip_record (phone, amount, level, date) VALUES (?, ?, ?, ?)",
              [phone, bonusAmount, level, sumdate],
            );
            await connection.query(
              "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, time = ?",
              [phone, "vip level5 bonus", bonusAmount, sumdate],
            );
          } else if (
            userInfo.vip_level === 6 &&
            totalAmount >= vipdata[6].amount
          ) {
            await connection.execute(
              "UPDATE users SET money = money + ?, vip_level = ?, needbet = needbet + ? WHERE phone = ?",
              [bonusAmount, level, bonusAmount, phone],
            );
            A;
            await connection.execute(
              "INSERT INTO vip_record (phone, amount, level, date) VALUES (?, ?, ?, ?)",
              [phone, bonusAmount, level, sumdate],
            );
            await connection.query(
              "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, time = ?",
              [phone, "vip level6 bonus", bonusAmount, sumdate],
            );
          } else if (
            userInfo.vip_level === 7 &&
            totalAmount >= vipdata[7].amount
          ) {
            await connection.execute(
              "UPDATE users SET money = money + ?, vip_level = ?, needbet = needbet + ? WHERE phone = ?",
              [bonusAmount, level, bonusAmount, phone],
            );

            await connection.execute(
              "INSERT INTO vip_record (phone, amount, level, date) VALUES (?, ?, ?, ?)",
              [phone, bonusAmount, level, sumdate],
            );
            await connection.query(
              "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, time = ?",
              [phone, "vip level7 bonus", bonusAmount, sumdate],
            );
          } else if (
            userInfo.vip_level === 8 &&
            totalAmount >= vipdata[8].amount
          ) {
            await connection.execute(
              "UPDATE users SET money = money + ?, vip_level = ?, needbet = needbet + ? WHERE phone = ?",
              [bonusAmount, level, bonusAmount, phone],
            );

            await connection.execute(
              "INSERT INTO vip_record (phone, amount, level, date) VALUES (?, ?, ?, ?)",
              [phone, bonusAmount, level, sumdate],
            );
            await connection.query(
              "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, time = ?",
              [phone, "vip level8 bonus", bonusAmount, sumdate],
            );
          } else if (
            userInfo.vip_level === 9 &&
            totalAmount >= vipdata[9].amount
          ) {
            await connection.execute(
              "UPDATE users SET money = money + ?, vip_level = ?, needbet = needbet + ? WHERE phone = ?",
              [bonusAmount, level, bonusAmount, phone],
            );

            await connection.execute(
              "INSERT INTO vip_record (phone, amount, level, date) VALUES (?, ?, ?, ?)",
              [phone, bonusAmount, level, sumdate],
            );
            await connection.query(
              "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, time = ?",
              [phone, "vip level9 bonus", bonusAmount, sumdate],
            );
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
};

//vipLevelEvery();

const vipLevelMonthly = async (req, res) => {
  try {
    // Fetch user info based on token
    const now = new Date();
    const [vipdata] = await connection.execute("SELECT * FROM vip_data");

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const sumdate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    // Fetch users with vip_level >= 1
    const [userData] = await connection.query(
      "SELECT * FROM users WHERE vip_level >= 1",
    );

    // Bonus amounts corresponding to VIP levels 1-10
    const bonusAmounts = [
      vipdata[0].monthstime,
      vipdata[1].monthstime,
      vipdata[2].monthstime,
      vipdata[3].monthstime,
      vipdata[4].monthstime,
      vipdata[5].monthstime,
      vipdata[6].monthstime,
      vipdata[7].monthstime,
      vipdata[8].monthstime,
      vipdata[9].monthstime,
    ];

    // Iterate through the fetched user data
    for (const userInfo of userData) {
      const level = userInfo.vip_level;

      // Ensure level is between 1 and 10
      if (level >= 1 && level <= 10) {
        const bonusAmount = bonusAmounts[level - 1]; // Get corresponding bonus amount

        // Update user's money
        await connection.query(
          "UPDATE `users` SET `money` = `money` + ? WHERE `phone` = ?",
          [bonusAmount, userInfo.phone],
        );

        // Insert bonus record
        await connection.query(
          "INSERT INTO vip_record SET phone=?, amount=?, level=?, type=?, date=?",
          [userInfo.phone, bonusAmount, level, "Month", sumdate],
        );
      }
    }

    res.send({ message: "VIP monthly bonuses processed successfully." });
  } catch (err) {
    console.error("Error processing VIP bonuses:", err);
    res
      .status(500)
      .send({ error: "An error occurred while processing VIP bonuses." });
  }
};

// subordinate data
const newSubordinateData = async (req, res) => {
  let auth = req.cookies.auth;
  try {
    const [user] = await connection.query(
      "SELECT `phone`,`money`, `code`,`invite` FROM users WHERE `token` = ? ",
      [auth],
    );
    let userInfo = user[0];
    if (!user) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }

    let [data] = await connection.query(
      "SELECT * FROM users WHERE invite = ?  ORDER BY id DESC ",
      [userInfo.code],
    );
    return res.status(200).json({
      message: "new subordinate Successfull",
      datas: data,
      success: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server",

      success: false,
    });
  }
};

const getInvitationBonus = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: new Date().getTime(),
      });
    }

    // Fetch user details based on token
    const [user] = await connection.query(
      "SELECT `phone`, `code`, `invite` FROM `users` WHERE `token` = ?",
      [auth],
    );

    if (!user || !user.length) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: new Date().getTime(),
      });
    }

    const userinfo = user[0];

    const [downlineUsers] = await connection.query(
      "SELECT `id`, `phone`, `invite` FROM `users` WHERE `invite` = ?",
      [userinfo.code],
    );

    const [result] = await connection.query(
      `SELECT * FROM invitation_bonus ORDER BY id DESC`,
    );

    // Function to get total deposits for a given user phone
    const getTotalDeposits = async (phone) => {
      const [firstDeposit] = await connection.query(
        "SELECT money FROM recharge WHERE phone = ? AND status = 1 ORDER BY id ASC LIMIT 1",
        [phone],
      );
      return firstDeposit[0] ? firstDeposit[0].money : null;
    };

    // Function to check if a bonus has already been given
    const hasBonusBeenGiven = async (userPhone, bonusAmount) => {
      const [bonusRecord] = await connection.query(
        "SELECT COUNT(*) as count FROM `activity_bonus` WHERE `phone` = ? AND `amount` = ?",
        [userPhone, bonusAmount],
      );
      return bonusRecord[0].count > 0;
    };

    var validDepositsCount = 0;

    // Calculate the valid deposits count for downline users
    for (const downlineUser of downlineUsers) {
      const totalDeposits = await getTotalDeposits(downlineUser.phone);
      if (totalDeposits >= result[0].amount) {
        validDepositsCount++;
      }
    }

    // Define bonus tiers
    // const bonusTiers = [
    //   { count: 50000, amount: 3555555 },
    //   { count: 20000, amount: 1555555 },
    //   { count: 10000, amount: 755555 },
    //   { count: 5000, amount: 355555 },
    //   { count: 1000, amount: 48555 },
    //   { count: 500, amount: 25555 },
    //   { count: 200, amount: 10955 },
    //   { count: 70, amount: 3355 },
    //   { count: 30, amount: 1555 },
    //   { count: 10, amount: 555 },
    //   { count: 3, amount: 155 },
    //   { count: result[0].count, amount: result[0].bonus },
    // ];

    const now = new Date();
    const sumDate = timerJoin2(now.getTime());

    // Process each bonus tier in order

    const [bonusRecordAll] = await connection.query(
      "SELECT * FROM `activity_bonus` WHERE `phone` = ?",
      [userinfo.phone],
    );
    //const [result] = await connection.query(`SELECT * FROM invitation_bonus`);
    const [highBonus] = await connection.query(`
      SELECT * FROM invitation_bonus ORDER BY CAST(bonus AS UNSIGNED) DESC LIMIT 1
    `);
    const totalRules = result.length;
    const HighestBonus = highBonus[0].bonus;
    const AvgDeposit = highBonus[0].amount;

    //console.log("`hightBonus`", HighestBonus);
    //
    return res.status(200).json({
      message: "Data fetched successfully",
      success: true,
      data: result,
      totalRules: totalRules,
      hightBonus: HighestBonus,
      AvgDeposit: AvgDeposit,
      validDepositsCount: validDepositsCount,
      downline: downlineUsers.length,
    });
  } catch (error) {
    console.error("Error fetching active users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const calculateDownlineBonuses = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: new Date().getTime(),
      });
    }

    // Fetch user details based on token
    const [user] = await connection.query(
      "SELECT `phone`, `code`, `invite` FROM `users` WHERE `token` = ?",
      [auth],
    );

    if (!user || !user.length) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: new Date().getTime(),
      });
    }

    const userinfo = user[0];

    // Fetch all downline users for the given invite code
    const [downlineUsers] = await connection.query(
      "SELECT phone FROM `users` WHERE `invite` = ?",
      [userinfo.code],
    );

    if (!downlineUsers.length) {
      return res.status(200).json({
        message: "No downline users found",
        status: false,
        timeStamp: new Date().getTime(),
      });
    }

    // Fetch deposit amount for each downline user
    let userDeposits = [];
    for (const downlineUser of downlineUsers) {
      const [depositResult] = await connection.query(
        "SELECT SUM(money) AS totalmoney FROM recharge WHERE phone = ?",
        [downlineUser.phone],
      );
      userDeposits.push({
        phone: downlineUser.phone,
        totalmoney: depositResult[0]?.totalmoney || 0,
      });
    }

    // Fetch bonus levels sorted by `amount DESC`
    const [bonusLevels] = await connection.query(
      "SELECT `id`, `rule`, `amount`, `bonus`, `count` FROM `invitation_bonus` ORDER BY amount DESC",
    );

    let validCounts = [];
    let bonusesToGive = [];

    // Check all valid bonuses
    for (const tier of bonusLevels) {
      let validDepositsCount = userDeposits.filter(
        (user) => user.totalmoney >= tier.amount,
      ).length;
      validCounts.push({ tierId: tier.id, validCount: validDepositsCount });

      if (validDepositsCount >= tier.count) {
        bonusesToGive.push(tier);
      }
    }

    // Grant all eligible bonuses
    for (const tier of bonusesToGive) {
      const [existingBonus] = await connection.query(
        "SELECT * FROM `activity_bonus` WHERE `phone` = ? AND `invitation_bonusid` = ?",
        [userinfo.phone, tier.id],
      );

      if (!existingBonus.length) {
        // Insert into `activity_bonus`
        await connection.query(
          "INSERT INTO `activity_bonus` (`phone`, `invitation_bonusid`, `amount`, `description`, `type`, `status`, `date`) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            userinfo.phone,
            tier.id,
            tier.bonus,
            "Invitation bonus received",
            "credit",
            1,
            new Date(),
          ],
        );

        // Update user balance
        await connection.query(
          "UPDATE users SET money = money + ? WHERE `phone` = ? ",
          [tier.bonus, userinfo.phone],
        );

        // Insert into `transaction_history`
        let checkTime = timerJoin2(Date.now());
        await connection.query(
          "INSERT INTO transaction_history (phone, detail, balance, `time`) VALUES (?, ?, ?, ?)",
          [userinfo.phone, `Invitation Bonus`, tier.bonus, checkTime],
        );
      }
    }

    // Fetch user's total earned bonuses
    const [bonusRecordAll] = await connection.query(
      "SELECT * FROM `activity_bonus` WHERE `phone` = ?",
      [userinfo.phone],
    );

    return res.status(200).json({
      message: "Success",
      status: true,
      timeStamp: new Date().getTime(),
      userDeposits,
      downline: downlineUsers.length,
      validCounts,
      earnedBonuses: bonusesToGive.map((tier) => ({
        tierId: tier.id,
        amount: tier.bonus,
      })),
      data: bonusRecordAll,
    });
  } catch (error) {
    console.error("Error in calculateDownlineBonuses function:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      status: false,
      error: error.message,
      timeStamp: new Date().getTime(),
    });
  }
};

// calculateDownlineBonuses()

const feedback = async (req, res) => {
  let auth = req.cookies.auth;
  const { title } = req.body;
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
      [auth],
    );
    let userInfo = user[0];
    if (!user) {
      return res.status(200).json({
        message: "Invalid user",
        status: false,
        timeStamp: timeNow,
      });
    }

    const sumdate = timerJoin2(Date.now());
    const [feedback] = await connection.query(
      "INSERT INTO  feedback SET phone = ?,title=?,date=?",
      [userInfo.phone, title, sumdate],
    );
    return res.status(200).json({
      message: "Feedback successful",
      data: feedback,
      status: true,
    });
  } catch (error) {
    //console.log("ddd",error)
    return res.status(500).json({
      message: "internal server error",
      status: false,
    });
  }
};

const listWithdraw = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
      [auth],
    );
    let userInfo = user[0];
    if (!user) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [recharge] = await connection.query(
      "SELECT * FROM withdraw WHERE phone = ? ORDER BY id DESC ",
      [userInfo.phone],
    );
    return res.status(200).json({
      message: "Receive success",
      datas: recharge,
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const useRedenvelope = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let code = req.body.code;
    const timeNow = new Date();

    if (!auth || !code) {
      return res.status(400).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ?",
      [auth],
    );
    if (!user.length) {
      return res.status(404).json({
        message: "User not found",
        status: false,
        timeStamp: timeNow,
      });
    }
    let userInfo = user[0];

    const [redenvelopes_usedbyuser] = await connection.query(
      "SELECT * FROM redenvelopes_used WHERE id_redenvelops = ? AND phone_used = ?",
      [code, userInfo.phone],
    );
    if (redenvelopes_usedbyuser.length >= 1) {
      return res.status(200).json({
        message: "Gift code already used on your id",
        status: true,
        timeStamp: timeNow,
      });
    }

    const [redenvelopes] = await connection.query(
      "SELECT * FROM redenvelopes WHERE id_redenvelope = ?",
      [code],
    );
    if (redenvelopes.length === 0) {
      return res.status(200).json({
        message: "Red envelope not found",
        status: true,
        timeStamp: timeNow,
      });
    }

    const currentTime = timerJoin2(Date.now());
    const checkTime2 = timerJoin4(Date.now());

    if (redenvelopes[0].recharge > 10) {
      const [recharge] = await connection.query(
        "SELECT * FROM recharge WHERE phone = ? AND money >=? AND status=1 AND DATE(today)=?",
        [userInfo.phone, redenvelopes[0].recharge, checkTime2],
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
      return res.status(200).json({
        message: "Red envelope already used",
        status: true,
        timeStamp: timeNow,
      });
    }

    const infoRe = redenvelopes[0];

    // Combine date and time components into the desired format

    if (infoRe.used !== 0 && infoRe.used >= 0) {
      await connection.query(
        "UPDATE redenvelopes SET used=used-?, status = 0 WHERE `id_redenvelope` = ? ",
        [1, infoRe.id_redenvelope],
      );
      await connection.query(
        "UPDATE users SET money = money + ? WHERE `phone` = ? ",
        [infoRe.money, userInfo.phone],
      );

      const sql =
        "INSERT INTO redenvelopes_used SET phone = ?, phone_used = ?, id_redenvelops = ?, money = ?, `time` = ? ";
      await connection.query(sql, [
        infoRe.phone,
        userInfo.phone,
        infoRe.id_redenvelope,
        infoRe.money,
        currentTime,
      ]);

      await connection.query(
        `INSERT INTO transaction_history SET phone=?, detail=?,balance=?, time = NOW()`,
        [userInfo.phone, "Red envelope", infoRe.money],
      );
      return res.status(200).json({
        message: `Successfully received +${infoRe.money}`,
        status: true,
        timeStamp: timeNow,
      });
    } else {
      return res.status(200).json({
        message: "Gift code already used",
        status: false,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    console.error("Error in useRedenvelope:", error);
    return res.status(200).json({
      message: "Internal Server Error",
      error: error,
      status: false,
      timeStamp: timeNow,
    });
  }
};

const getRedenvelope = async (req, res) => {
  try {
    let auth = req.cookies.auth;

    if (!auth) {
      return res.status(200).json({
        message: "Invalid token ",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
      [auth],
    );
    let userInfo = user[0];
    if (!user) {
      return res.status(200).json({
        message: "Invalid user",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [redenvelopes] = await connection.query(
      "SELECT * FROM redenvelopes_used WHERE phone_used = ?",
      [userInfo?.phone],
    );

    return res.status(200).json({
      message: "get redenvelopes_used successfull",
      datas: redenvelopes,
      status: true,
    });
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const callback_bank = async (req, res) => {
  try {
    let transaction_id = req.body.transaction_id;
    let client_transaction_id = req.body.client_transaction_id;
    let amount = req.body.amount;
    let requested_datetime = req.body.requested_datetime;
    let expired_datetime = req.body.expired_datetime;
    let payment_datetime = req.body.payment_datetime;
    let status = req.body.status;
    if (!transaction_id) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    if (status == 2) {
      await connection.query(
        `UPDATE recharge SET status = 1 WHERE id_order = ?`,
        [client_transaction_id],
      );
      const [info] = await connection.query(
        `SELECT * FROM recharge WHERE id_order = ?`,
        [client_transaction_id],
      );
      // await connection.query('UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ? ', [info[0].money, info[0].money, info[0].phone]);
      // return res.status(200).json({
      //     message: 0,
      //     status: true,
      // });
    } else {
      await connection.query(`UPDATE recharge SET status = 2 WHERE id = ?`, [
        id,
      ]);

      return res.status(200).json({
        message: "Cancellation successful",
        status: true,
        datas: recharge,
      });
    }
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const confirmRecharge = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    //let money = req.body.money;
    //let paymentUrl = req.body.payment_url;
    let client_txn_id = req.body?.client_txn_id;

    if (!client_txn_id) {
      return res.status(200).json({
        message: "client_txn_id is required",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
      [auth],
    );
    let userInfo = user[0];

    if (!user) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [recharge] = await connection.query(
      "SELECT * FROM recharge WHERE phone = ? AND status = ? ",
      [userInfo.phone, 0],
    );

    if (recharge.length != 0) {
      const rechargeData = recharge[0];
      const date = new Date(rechargeData.today);
      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yyyy = date.getFullYear();
      const formattedDate = `${dd}-${mm}-${yyyy}`;
      const apiData = {
        key: "0c79da69-fdc1-4a07-a8b4-7135a0168385",
        client_txn_id: client_txn_id,
        txn_date: formattedDate,
      };
      try {
        const apiResponse = await axios.post(
          "https://api.ekqr.in/api/check_order_status",
          apiData,
        );
        console.log(apiResponse.data);
        const apiRecord = apiResponse.data.data;
        if (apiRecord.status === "scanning") {
          return res.status(200).json({
            message: "Waiting for confirmation",
            status: false,
            timeStamp: timeNow,
          });
        }
        if (
          apiRecord.client_txn_id === rechargeData.id_order &&
          apiRecord.customer_mobile === rechargeData.phone &&
          apiRecord.amount === rechargeData.money
        ) {
          if (apiRecord.status === "success") {
            await connection.query(
              `UPDATE recharge SET status = 1 WHERE id = ? AND id_order = ? AND phone = ? AND money = ?`,
              [
                rechargeData.id,
                apiRecord.client_txn_id,
                apiRecord.customer_mobile,
                apiRecord.amount,
              ],
            );
            // const [code] = await connection.query(`SELECT invite, total_money from users WHERE phone = ?`, [apiRecord.customer_mobile]);
            // const [data] = await connection.query('SELECT recharge_bonus_2, recharge_bonus FROM admin WHERE id = 1');
            // let selfBonus = info[0].money * (data[0].recharge_bonus_2 / 100);
            // let money = info[0].money + selfBonus;
            let money = apiRecord.amount;
            await connection.query(
              "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ? ",
              [money, money, apiRecord.customer_mobile],
            );
            // let rechargeBonus;
            // if (code[0].total_money <= 0) {
            //     rechargeBonus = apiRecord.customer_mobile * (data[0].recharge_bonus / 100);
            // }
            // else {
            //     rechargeBonus = apiRecord.customer_mobile * (data[0].recharge_bonus_2 / 100);
            // }
            // const percent = rechargeBonus;
            // await connection.query('UPDATE users SET money = money + ?, total_money = total_money + ? WHERE code = ?', [money, money, code[0].invite]);

            return res.status(200).json({
              message: "Successful application confirmation",
              status: true,
              datas: recharge,
            });
          } else if (
            apiRecord.status === "failure" ||
            apiRecord.status === "close"
          ) {
            console.log(apiRecord.status);
            await connection.query(
              `UPDATE recharge SET status = 2 WHERE id = ? AND id_order = ? AND phone = ? AND money = ?`,
              [
                rechargeData.id,
                apiRecord.client_txn_id,
                apiRecord.customer_mobile,
                apiRecord.amount,
              ],
            );
            return res.status(200).json({
              message: "Payment failure",
              status: true,
              timeStamp: timeNow,
            });
          }
        } else {
          return res.status(200).json({
            message: "Mismtach data",
            status: true,
            timeStamp: timeNow,
          });
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const confirmUSDTRecharge = async (req, res) => {
  console.log(res?.body);
  console.log(res?.query);
  console.log(res?.cookies);
  // let auth = req.cookies.auth;
  // //let money = req.body.money;
  // //let paymentUrl = req.body.payment_url;
  // let client_txn_id = req.body?.client_txn_id;

  // if (!client_txn_id) {
  //     return res.status(200).json({
  //         message: 'client_txn_id is required',
  //         status: false,
  //         timeStamp: timeNow,
  //     })
  // }

  // if (!auth) {
  //     return res.status(200).json({
  //         message: 'Failed',
  //         status: false,
  //         timeStamp: timeNow,
  //     })
  // }

  // const [user] = await connection.query('SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ', [auth]);
  // let userInfo = user[0];

  // if (!user) {
  //     return res.status(200).json({
  //         message: 'Failed',
  //         status: false,
  //         timeStamp: timeNow,
  //     });
  // };

  // const [recharge] = await connection.query('SELECT * FROM recharge WHERE phone = ? AND status = ? ', [userInfo.phone, 0]);

  // if (recharge.length != 0) {
  //     const rechargeData = recharge[0];
  //     const date = new Date(rechargeData.today);
  //     const dd = String(date.getDate()).padStart(2, '0');
  //     const mm = String(date.getMonth() + 1).padStart(2, '0');
  //     const yyyy = date.getFullYear();
  //     const formattedDate = `${dd}-${mm}-${yyyy}`;
  //     const apiData = {
  //         key: process.env.PAYMENT_KEY,
  //         client_txn_id: client_txn_id,
  //         txn_date: formattedDate,
  //     };
  //     try {
  //         const apiResponse = await axios.post('https://api.ekqr.in/api/check_order_status', apiData);
  //         const apiRecord = apiResponse.data.data;
  //         if (apiRecord.status === "scanning") {
  //             return res.status(200).json({
  //                 message: 'Waiting for confirmation',
  //                 status: false,
  //                 timeStamp: timeNow,
  //             });
  //         }
  //         if (apiRecord.client_txn_id === rechargeData.id_order && apiRecord.customer_mobile === rechargeData.phone && apiRecord.amount === rechargeData.money) {
  //             if (apiRecord.status === 'success') {
  //                 await connection.query(`UPDATE recharge SET status = 1 WHERE id = ? AND id_order = ? AND phone = ? AND money = ?`, [rechargeData.id, apiRecord.client_txn_id, apiRecord.customer_mobile, apiRecord.amount]);
  //                 // const [code] = await connection.query(`SELECT invite, total_money from users WHERE phone = ?`, [apiRecord.customer_mobile]);
  //                 // const [data] = await connection.query('SELECT recharge_bonus_2, recharge_bonus FROM admin WHERE id = 1');
  //                 // let selfBonus = info[0].money * (data[0].recharge_bonus_2 / 100);
  //                 // let money = info[0].money + selfBonus;
  //                 let money = apiRecord.amount;
  //                 await connection.query('UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ? ', [money, money, apiRecord.customer_mobile]);
  //                 // let rechargeBonus;
  //                 // if (code[0].total_money <= 0) {
  //                 //     rechargeBonus = apiRecord.customer_mobile * (data[0].recharge_bonus / 100);
  //                 // }
  //                 // else {
  //                 //     rechargeBonus = apiRecord.customer_mobile * (data[0].recharge_bonus_2 / 100);
  //                 // }
  //                 // const percent = rechargeBonus;
  //                 // await connection.query('UPDATE users SET money = money + ?, total_money = total_money + ? WHERE code = ?', [money, money, code[0].invite]);

  //                 return res.status(200).json({
  //                     message: 'Successful application confirmation',
  //                     status: true,
  //                     datas: recharge,
  //                 });
  //             } else if (apiRecord.status === 'failure' || apiRecord.status === 'close') {
  //                 console.log(apiRecord.status)
  //                 await connection.query(`UPDATE recharge SET status = 2 WHERE id = ? AND id_order = ? AND phone = ? AND money = ?`, [rechargeData.id, apiRecord.client_txn_id, apiRecord.customer_mobile, apiRecord.amount]);
  //                 return res.status(200).json({
  //                     message: 'Payment failure',
  //                     status: true,
  //                     timeStamp: timeNow,
  //                 });
  //             }
  //         } else {
  //             return res.status(200).json({
  //                 message: 'Mismtach data',
  //                 status: true,
  //                 timeStamp: timeNow,
  //             });
  //         }
  //     } catch (error) {
  //         console.error(error);
  //     }
  // } else {
  //     return res.status(200).json({
  //         message: 'Failed',
  //         status: false,
  //         timeStamp: timeNow,
  //     });
  // }
};

const updateRecharge = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    let money = req.body.money;
    let order_id = req.body.id_order;
    let data = req.body.inputData;

    // if (type != 'upi') {
    //     if (!auth || !money || money < 300) {
    //         return res.status(200).json({
    //             message: 'upi failed',
    //             status: false,
    //             timeStamp: timeNow,
    //         })
    //     }
    // }
    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
      [auth],
    );
    let userInfo = user[0];
    if (!user) {
      return res.status(200).json({
        message: "user not found",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [utr] = await connection.query(
      "SELECT * FROM recharge WHERE `utr` = ? ",
      [data],
    );
    let utrInfo = utr[0];

    if (!utrInfo) {
      await connection.query(
        "UPDATE recharge SET utr = ? WHERE phone = ? AND id_order = ?",
        [data, userInfo.phone, order_id],
      );
      return res.status(200).json({
        message: "UTR updated",
        status: true,
        timeStamp: timeNow,
      });
    } else {
      return res.status(200).json({
        message: "UTR is already in use",
        status: false,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const userProblem = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    var { gameId, orderNo, amount, issue, utr } = req.body;

    if (orderNo == "") {
      orderNo = 0;
    } else if (utr == "") {
      utr = 0;
    }
    // try {

    if (!auth) {
      return res.status(200).json({
        message: "user Not found",
        status: false,
      });
    }
    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
      [auth],
    );
    let userInfo = user[0];
    if (!user) {
      return res.status(200).json({
        message: "user not found",
        status: false,
        timeStamp: timeNow,
      });
    }

    const data = await connection.query(
      "INSERT INTO user_problem SET phone=?,user_id=?,issue=?,	amount=?,orderNo=?,utr=?,today=NOW()",
      [userInfo.phone, gameId, issue, amount, orderNo, utr],
    );
    return res.status(200).json({
      message: "Requst submited successfull",
      status: true,
      data: data,
    });
    // } catch (error) {

    // }
  } catch (error) {
    console.error("Error :", error.message);
    res.status(500).json({ message: "Internal server error", status: false });
  }
};

const userProblemGet = async (req, res) => {
  let auth = req.cookies.auth;
  var { id, issue } = req.body;

  try {
    if (!auth) {
      return res.status(200).json({
        message: "user Not found",
        status: false,
      });
    }
    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
      [auth],
    );

    if (!user) {
      return res.status(200).json({
        message: "user not found",
        status: false,
      });
    }

    const datas = await connection.execute(
      "SELECT * FROM user_problem WHERE user_id=? AND issue=?",
      [id, issue],
    );
    return res.status(200).json({
      message: "Requst submited successfull",
      success: true,
      data: datas[0],
    });
  } catch (error) {}
};

const adminProblemGet = async (req, res) => {
  let auth = req.cookies.auth;
  try {
    if (!auth) {
      return res.status(200).json({
        message: "user Not found",
        status: false,
      });
    }
    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
      [auth],
    );

    if (!user) {
      return res.status(200).json({
        message: "user not found",
        status: false,
      });
    }

    const datas = await connection.execute(
      "SELECT * FROM user_problem WHERE status=0",
    );
    return res.status(200).json({
      message: "Requst submited successfull",
      success: true,
      data: datas[0],
    });
  } catch (error) {}
};

const adminProblemSubmit = async (req, res) => {
  let auth = req.cookies.auth;
  const { type, remark, id } = req.body;
  try {
    if (!auth) {
      return res.status(200).json({
        message: "user Not found",
        status: false,
      });
    }
    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite` FROM users WHERE `token` = ? ",
      [auth],
    );

    if (!user) {
      return res.status(200).json({
        message: "user not found",
        status: false,
      });
    }

    if (type === "confirm") {
      await connection.execute("UPDATE user_problem SET status=1 WHERE id=?", [
        id,
      ]);
      return res.status(200).json({
        message: "Requst submited successful",
        success: true,
      });
    }

    if (type === "delete") {
      await connection.execute(
        "UPDATE user_problem SET status=2,remark=? WHERE id=?",
        [remark, id],
      );
      return res.status(200).json({
        message: "Requst submited successful",
        success: true,
      });
    }
  } catch (error) {}
};

const getpromotiondata = async (req, res) => {
  try {
    let auth = req.cookies.auth;

    if (!auth) {
      return res.status(200).json({
        message: "user Not found",
        status: false,
      });
    }
    const [user] = await connection.query(
      "SELECT `phone` FROM users WHERE `token` = ? ",
      [auth],
    );

    if (!user) {
      return res.status(200).json({
        message: "user not found",
        status: false,
      });
    }

    const [rows] = await connection.query(
      "SELECT * FROM promotion WHERE phone = ?",
      [user[0].phone],
    );

    if (!rows) {
      return res.status(200).json({
        message: "user not found",
        status: false,
      });
    }
    return res.status(200).json({
      message: "get promotion ",
      success: true,
      data: rows[0],
    });
  } catch (error) {
    return res.status(200).json({
      message: "internal server error",
      success: false,
      error: error.message,
    });
  }
};

const updateRandomPromotion = async (req, res) => {
  try {
    const {
      phone,
      dregister,
      damount,
      ddeposit,
      dfirst,
      tregister,
      tamount,
      tdeposit,
      tfirst,
      type,
      commission,
      weekBalance,
      totalBalance,
      direct,
      team,
    } = req.body;
    const [rows] = await connection.query(
      "SELECT * FROM promotion WHERE phone = ?",
      [phone],
    );
    const checkTime = timerJoin2(Date.now());

    if (rows?.length === 0) {
      await connection.query(
        "INSERT INTO promotion SET phone = ?,dregister=?,damount=?,ddeposit=?,dfirst=?,tregister=?,tamount=?,tdeposit=?,tfirst=?,commission=?,weekBalance=?,totalBalance=?,direct=?,team=?,time=? ",
        [
          phone,
          dregister,
          damount,
          ddeposit,
          dfirst,
          tregister,
          tamount,
          tdeposit,
          tfirst,
          commission,
          weekBalance,
          totalBalance,
          direct,
          team,
          checkTime,
        ],
      );

      return res.status(200).json({
        message: "promotion update success",
        success: true,
      });
    }

    await connection.query(
      "UPDATE promotion SET dregister=?,damount=?,ddeposit=?,dfirst=?,tregister=?,tamount=?,tdeposit=?,tfirst=?,commission=?,weekBalance=?,totalBalance=?,direct=?,team=? WHERE phone=? ",
      [
        dregister,
        damount,
        ddeposit,
        dfirst,
        tregister,
        tamount,
        tdeposit,
        tfirst,
        commission,
        weekBalance,
        totalBalance,
        direct,
        team,
        phone,
      ],
    );

    return res.status(200).json({
      message: "promotion update success",
      success: true,
    });
  } catch (error) {
    return res.status(200).json({
      message: "internal server error",
      success: false,
      error: error.message,
    });
  }
};

const makePromotion = async (req, res) => {
  try {
    const { phone, rank } = req.body;
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE phone = ?",
      [phone],
    );

    if (!rows) {
      return res.status(200).json({
        message: "user not found",
        success: false,
      });
    }

    await connection.query("UPDATE users SET rank=? WHERE  phone=?", [
      rank,
      phone,
    ]);

    return res.status(200).json({
      message: "promotion update success",
      success: true,
    });
  } catch (error) {
    return res.status(200).json({
      message: "internal server error",
      success: false,
      error: error.message,
    });
  }
};

const getVipData = async (req, res) => {
  try {
    // let auth = req.cookies.auth;

    // if (!auth) {
    //   return res.status(200).json({
    //     message: "user Not found",
    //     status: false,
    //   });
    // }
    // const [user] = await connection.query(
    //   "SELECT `phone` FROM users WHERE `token` = ? ",
    //   [auth]
    // );

    // if (!user) {
    //   return res.status(200).json({
    //     message: "user not found",
    //     status: false,
    //   });
    // }

    const [vipdata] = await connection.execute("SELECT * FROM vip_data");

    // //console.log("vipdata", vipdata);

    if (!vipdata) {
      return res.status(200).json({
        message: "user not found",
        status: false,
      });
    }
    return res.status(200).json({
      message: "get promotion ",
      success: true,
      data: vipdata,
    });
  } catch (error) {
    return res.status(200).json({
      message: "internal server error",
      success: false,
      error: error.message,
    });
  }
};

const getdailyactivyreward = async (req, res) => {
  let auth = req.cookies.auth;

  try {
    if (!auth) {
      return res.status(200).json({
        message: "User not found",
        status: false,
      });
    }

    // Fetch user info
    const [user] = await connection.query(
      "SELECT * FROM users WHERE `token` = ?",
      [auth],
    );

    if (user.length === 0) {
      return res.status(200).json({
        message: "User not found",
        status: false,
      });
    }

    const userInfo = user[0];
    const phone = userInfo.phone;

    // Get today's and week's date
    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];
    const formattedWeekStart = new Date();
    formattedWeekStart.setDate(today.getDate() - 6);
    const weekStartDate = formattedWeekStart.toISOString().split("T")[0];

    //console.log("Today:", formattedToday, "Week Start:", weekStartDate);

    // Get total bets for today & this week
    const [betResults] = await connection.query(
      `SELECT 
          (SELECT COALESCE(SUM(money), 0) FROM minutes_1 WHERE phone = ? AND DATE(today) = ?) +
          (SELECT COALESCE(SUM(money), 0) FROM result_k3 WHERE phone = ? AND DATE(bet_data) = ?) +
          (SELECT COALESCE(SUM(money), 0) FROM result_5d WHERE phone = ? AND DATE(bet_data) = ?) 
          AS total_daily,
          
          (SELECT COALESCE(SUM(money), 0) FROM minutes_1 WHERE phone = ? AND DATE(today) BETWEEN ? AND ?) +
          (SELECT COALESCE(SUM(money), 0) FROM result_k3 WHERE phone = ? AND DATE(bet_data) BETWEEN ? AND ?) +
          (SELECT COALESCE(SUM(money), 0) FROM result_5d WHERE phone = ? AND DATE(bet_data) BETWEEN ? AND ?)
          AS total_weekly`,
      [
        phone,
        formattedToday,
        phone,
        formattedToday,
        phone,
        formattedToday, // Daily
        phone,
        weekStartDate,
        formattedToday,
        phone,
        weekStartDate,
        formattedToday,
        phone,
        weekStartDate,
        formattedToday, // Weekly
      ],
    );

    const totalDailyBet = betResults[0].total_daily || 0;
    const totalWeeklyBet = betResults[0].total_weekly || 0;
    //console.log("Total Daily Bet:", totalDailyBet, "Total Weekly Bet:", totalWeeklyBet);

    // Fetch admin bonus settings
    const [bonusSettings] = await connection.query(
      "SELECT `id`, `betrequriment`, `bonus`, `type` FROM bonus_settings",
    );

    // Fetch bonus history to check if the user already received each bonus
    const [receivedBonuses] = await connection.query(
      `SELECT bonus_setting_id FROM user_bonus_history WHERE phone = ? AND received_date = ?`,
      [phone, formattedToday],
    );

    const receivedBonusIds = new Set(
      receivedBonuses.map((row) => row.bonus_setting_id),
    );

    //console.log("Already Received Bonus IDs:", receivedBonusIds);

    let dailyBonusGiven = [];
    let weeklyBonusGiven = [];

    for (const setting of bonusSettings) {
      if (!receivedBonusIds.has(setting.id)) {
        // Check if user already received this bonus
        if (setting.type === 1 && totalDailyBet >= setting.betrequriment) {
          // Give Daily Bonus
          await connection.query(
            `INSERT INTO user_bonus_history (user_id, phone, bonus, type, received_date, bonus_setting_id) 
             VALUES (?, ?, ?, 1, ?, ?)`,
            [userInfo.id, phone, setting.bonus, formattedToday, setting.id],
          );
          dailyBonusGiven.push(setting.bonus);
        }
        if (setting.type === 2 && totalWeeklyBet >= setting.betrequriment) {
          // Give Weekly Bonus
          await connection.query(
            `INSERT INTO user_bonus_history (user_id, phone, bonus, type, received_date, bonus_setting_id) 
             VALUES (?, ?, ?, 2, ?, ?)`,
            [userInfo.id, phone, setting.bonus, formattedToday, setting.id],
          );
          weeklyBonusGiven.push(setting.bonus);
        }
      }
    }

    const [receivedBonuses_history] = await connection.query(
      `SELECT bonus_setting_id FROM user_bonus_history WHERE phone = ? AND received_date = ?`,
      [phone, formattedToday],
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
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

const dailyBetCommition = async (req, res) => {
  // let auth = req.cookies.auth;

  try {
    // if (!auth) {
    //   return res.status(200).json({
    //     message: "User not found",
    //     status: false,
    //   });
    // }

    // Fetch user info
    // const [user] = await connection.query(
    //   "SELECT * FROM users WHERE `token` = ? ",
    //   [auth]
    // );

    // if (user.length === 0) {
    //   return res.status(200).json({
    //     message: "User not found",
    //     status: false,
    //   });
    // }

    const phone = "0147852369";

    // const userInfo = user[0];

    // Get yesterday's date in YYYY-MM-DD format
    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];

    //console.log("formattedToday", formattedToday);

    // Fetch sum of money from all tables for yesterda

    // const [debugMinutes] = await connection.query(
    //   `SELECT SUM(money) AS total FROM minutes_1 WHERE phone = ? AND DATE(today) = ?`,
    //   [phone, "2024-12-04"]
    // );
    // //console.log("Debug minutes_1:", debugMinutes);

    // const [debugK3] = await connection.query(
    //   `SELECT SUM(money) AS total FROM result_k3 WHERE phone = ? AND DATE(bet_data) = ?`,
    //   [phone, formattedYesterday]
    // );
    // //console.log("Debug result_k3:", debugK3);

    // const [debug5D] = await connection.query(
    //   `SELECT SUM(money) AS total FROM result_5d WHERE phone = ? AND DATE(bet_data) = ?`,
    //   [phone, formattedYesterday]
    // );
    // //console.log("Debug result_5d:", debug5D);

    const [totalMoneyResult] = await connection.query(
      `SELECT
          (SELECT COALESCE(SUM(money), 0) FROM minutes_1 WHERE phone = ? AND DATE(today) = ?) +
          (SELECT COALESCE(SUM(money), 0) FROM result_k3 WHERE phone = ? AND DATE(bet_data) = ?) +
          (SELECT COALESCE(SUM(money), 0) FROM result_5d WHERE phone = ? AND DATE(bet_data) = ?)
          AS total_money`,
      [phone, "2024-12-04", phone, "2024-12-04", phone, "2024-12-04"],
    );

    //console.log("totalMoneyResult", totalMoneyResult);

    const totalMoney = totalMoneyResult[0].total_money || 0;
    //console.log("totalMoney", totalMoney);
    const commission = totalMoney * 0.12; // 12% commission

    //console.log("commission", commission);

    // Fetch admin data
    const [admindata] = await connection.execute("SELECT * FROM admin");

    if (admindata.length === 0) {
      return res.status(200).json({
        message: "Admin data not found",
        status: false,
      });
    }

    return res.status(200).json({
      message: "Get daily bet commission",
      success: true,
      totalMoney,
      commission, // 12% of total money
      userBetCommission: admindata[0].user_bet_commition,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

const getSpinData = async (req, res) => {
  let auth = req.cookies.auth;
  const { id } = req.params; // Get 'id' from request params
  // //console.log("auth", auth);
  try {
    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [user] = await connection.query(
      "SELECT * FROM users WHERE `token` = ? ",
      [auth],
    );
    if (user.length == 0) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    let userInfo = user[0];

    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];

    //console.log("formattedToday", formattedToday);

    const [todayRecharge] = await connection.query(
      "SELECT SUM(money) AS total_money FROM recharge WHERE phone = ? AND status = 1 AND DATE(today) = ?",
      [userInfo.phone, formattedToday],
    );

    const totalTodayRecharge = todayRecharge[0].total_money || 0; // Default to 0 if no result

    let sql;
    let values = [];

    if (id) {
      sql = "SELECT * FROM spin_data WHERE id = ?";
      values = [id];
    } else {
      sql = "SELECT * FROM spin_data";
    }

    const [rows] = await connection.execute(sql, values);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "No data found",
        status: false,
      });
    }

    return res.status(200).json({
      message: "Spin data retrieved successfully",
      status: true,
      data: { rows, totalTodayRecharge },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

const claimSpin = async (req, res) => {
  let auth = req.cookies.auth;
  try {
    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [user] = await connection.query(
      "SELECT * FROM users WHERE `token` = ? ",
      [auth],
    );
    if (user.length === 0) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    let userInfo = user[0];

    if (userInfo.redeem_spin >= userInfo.total_spin) {
      return res.status(200).json({
        message: "Your have redeem all spin",
        success: false,
      });
    }

    // Select the three lowest values from sec1 to sec8
    const [rows] = await connection.query(`
      SELECT sec_value, sec_column FROM (
          SELECT sec1 AS sec_value, 1 AS sec_column FROM spin_data UNION ALL
            SELECT sec4, 4 FROM spin_data UNION ALL
          SELECT sec3, 3 FROM spin_data 
      ) AS sec_values
      ORDER BY sec_value ASC
      LIMIT 8;
    `);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "No spin values found",
        success: false,
        data: [],
      });
    }

    // Function to get a random spin value from the retrieved data
    const getRandomSpinValue = (spinData) => {
      const allowedValues = [0, 1];
      const randomIndex =
        allowedValues[Math.floor(Math.random() * allowedValues.length)];

      //console.log("ddd", randomIndex);
      return spinData[randomIndex];
    };

    // Pick a random value from the selected lowest three
    const randomSelection = getRandomSpinValue(rows);

    //console.log("randiom", randomSelection, rows);

    await connection.query(
      "UPDATE users SET money = money + ?, redeem_spin = redeem_spin + 1 WHERE phone = ?",
      [randomSelection.sec_value, userInfo.phone],
    );

    let checkTime = timerJoin2(Date.now());
    const datasql =
      "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
    await connection.query(datasql, [
      userInfo.phone,
      "Spin Weel Winning",
      randomSelection.sec_value,
      checkTime,
    ]);

    const datasql2 =
      "INSERT INTO wheel_spine SET phone = ?,  amount = ?,type=?, `time` = ?";
    await connection.query(datasql2, [
      userInfo.phone,
      randomSelection.sec_value,
      "Spin Weel Winning",
      checkTime,
    ]);

    return res.status(200).json({
      message: "Get daily bet commission",
      success: true,
      data: {
        value: randomSelection.sec_value, // Randomly selected value
        index: randomSelection.sec_column - 1, // Randomly selected index
      },
    });
  } catch (error) {
    console.error("Error fetching minimum values:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

const redeemSpin = async (req, res) => {
  let auth = req.cookies.auth;
  try {
    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [user] = await connection.query(
      "SELECT * FROM users WHERE `token` = ? ",
      [auth],
    );
    if (user.length == 0) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    let userInfo = user[0];

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
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

const spineHistory = async (req, res) => {
  let auth = req.cookies.auth;
  try {
    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    const [user] = await connection.query(
      "SELECT * FROM users WHERE `token` = ? ",
      [auth],
    );
    if (user.length == 0) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }
    let userInfo = user[0];

    const [history] = await connection.query(
      "SELECT * FROM wheel_spine WHERE phone = ? ",
      [userInfo.phone],
    );

    return res.status(200).json({
      message: "Spin data retrieved successfully",
      status: true,
      data: history,
    });
  } catch (error) {
    console.error("Error fetching minimum values:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

// Get paginated downline users or search a specific user in downline
const searchUser = async (req, res) => {
  let auth = req.cookies.auth;
  try {
    const [userns] = await connection.query(
      "SELECT * FROM users WHERE token = ? AND veri = 1 LIMIT 1",
      [auth],
    );

    const { id_user = null, page = 1 } = req.query;
    const limit = 20;
    const offset = (page - 1) * limit;

    const phone = userns[0].phone;
    // 1. Get root user code
    const [users] = await connection.query(
      "SELECT code FROM users WHERE phone = ?",
      [phone],
    );

    if (users.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Root user not found",
      });
    }

    const rootCode = users[0].code;

    // 2. Recursive query with explicit columns
    let query = `
      WITH RECURSIVE downline_tree AS (
        SELECT 
          id_user, phone, name_user, money, totalRecharge, totalWithdraw, code, invite,
          1 AS user_level
        FROM users
        WHERE invite = ?

        UNION ALL

        SELECT 
          u.id_user, u.phone, u.name_user, u.money, u.totalRecharge, u.totalWithdraw, u.code, u.invite,
          dt.user_level + 1
        FROM users u
        INNER JOIN downline_tree dt ON u.invite = dt.code
        WHERE dt.user_level < 6
      )
      SELECT * FROM downline_tree
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
      return res.status(404).json({
        status: false,
        message: "User not found in downline",
      });
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
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const promotionNew = async (req, res) => {
  try {
    let auth = req.cookies.auth;
    if (!auth) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite`, `roses_f`, `roses_f1`, `roses_today` FROM users WHERE `token` = ? ",
      [auth],
    );
    const [level] = await connection.query("SELECT * FROM level");

    if (!user) {
      return res.status(200).json({
        message: "Invalid user",
        status: false,
        timeStamp: timeNow,
      });
    }

    let userInfo = user[0];

    // Directly referred level-1 users

    let selectedData = [];
    let level2to6activeuser = 0;
    // let currentDate = new Date();

    // Subtract one day
    const previousDate = new Date();
    previousDate.setDate(previousDate.getDate() - 1);

    // Format the date as YYYY-MM-DD
    const currentDate = previousDate.toISOString().slice(0, 10);

    // Query to select today's deposits for each user
    const [promotion_data] = await connection.query(
      "SELECT * FROM `promotion_data` WHERE phone = ? AND date(date) = ? ",
      [userInfo.phone, currentDate],
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
      currentDate: currentDate,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("An error ommkk:", error);
    // You can handle the error here, such as logging it or throwing it further
    return res.status(200).json({
      message: error.message,
      status: false,
      timeStamp: timeNow,
    });
  }
};

const zilpay = async (req, res) => {
  try {
    let auth = req.cookies.auth;

    //   let money = 2;
    let money = req.body.amount;
    let type = req.body.type;

    if (!auth || !money || money <= 99) {
      return res.status(200).json({
        message: "Minimum recharge 100",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [user] = await connection.query(
      "SELECT `phone`, `code`,`invite`,`isdemo` FROM users WHERE `token` = ?",
      [auth],
    );
    let userInfo = user[0];
    if (!user) {
      return res.status(200).json({
        message: "Failed",
        status: false,
        timeStamp: timeNow,
      });
    }

    let checkTime = timerJoin2(Date.now());
    if (userInfo.isdemo == 1) {
      const date = new Date();

      let id_time =
        date.getUTCFullYear() +
        "" +
        date.getUTCMonth() +
        1 +
        "" +
        date.getUTCDate();
      let id_order =
        Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) +
        10000000000000;
      // let vat = Math.floor(Math.random() * (2000 - 0 + 1) ) + 0;

      money = Number(money);
      let client_transaction_id = id_time + id_order;

      const sql = `INSERT INTO recharge SET
            id_order = ?,
            transaction_id = ?,
            phone = ?,
            money = ?,
            type = ?,
            status = ?,
            today = ?,
            url = ?,
            time = ?,
            isdemo=?
            
            `;
      await connection.execute(sql, [
        client_transaction_id,
        "0",
        userInfo.phone,
        money,
        type,
        1,
        checkTime,
        "1",
        checkTime,
        1,
      ]);

      await connection.execute(
        "UPDATE users SET money = money + ? WHERE phone = ? ",
        [money, userInfo.phone],
      );
      return res.status(200).json({
        message: "Demo Amount is added",
        status: false,
        timeStamp: timeNow,
      });
    }

    const params = {
      amount: Number(money),
      auth: "TSFHEYY8UH2FLCVCNFGT",
      callback: "https://yaarclub.co/api/webapi/zilpayCallback",
      redirect_url: "https://jackpotjunctionexpress.click",
      user: userInfo.phone,
    };

    const data = await axios.post("https://api.zilpay.live/api/payin2", params);
    // //console.log("sss",data.data)
    if (data.data.status === "success") {
      const sql = `INSERT INTO recharge SET
        id_order = ?,
        transaction_id = ?,
        phone = ?,
        money = ?,
        type = ?,
        status = ?,
        today = ?,
        url = ?,
        time = ?,
  userStatus=?
        `;
      await connection.execute(sql, [
        data.data.order_id,
        data.data.order_id,
        userInfo.phone,
        money,
        type,
        0,
        checkTime,
        "0",
        checkTime,
        0,
      ]);

      return res.status(200).json({
        message: "",
        status: true,
        data: data.data,
      });
    }
  } catch (error) {
    //console.log("hh", error);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

const zilpayCallback = async (req, res) => {
  const { request_user, amount, merchanttransid, status } = req.body;

  //console.log("ddd", req.body);
  try {
    const [info] = await connection.query(
      "SELECT * FROM recharge WHERE id_order = ?",
      [merchanttransid],
    );

    if (info.length > 0) {
      if (info[0].status === 1) {
        console.log(
          "Recharge status is already completed. Skipping user money update.",
        );
      } else {
        const checkTime = timerJoin2(Date.now());
        const [Firstrecharge] = await connection.query(
          "SELECT * FROM recharge WHERE phone = ? AND status = ?",
          [info[0].phone, 1],
        );

        const [result] = await connection.execute(
          `SELECT * FROM rechargeBonus ORDER BY id DESC`,
        );

        let bonus = 0;

        if (Firstrecharge.length === 0) {
          for (let i = 0; i < result.length; i++) {
            const element = result[i];
            const currentAmount = parseFloat(element.recAmount);
            const nextAmount = result[i + 1]
              ? parseFloat(result[i + 1].recAmount)
              : Infinity;

            if (parseInt(element.is_fisrtrecharge) === 1) {
              if (
                info[0].money >= currentAmount &&
                info[0].money < nextAmount
              ) {
                if (parseInt(element.is_persent) === 1) {
                  bonus = (info[0].money * parseFloat(element.bonus)) / 100;
                } else {
                  bonus = parseFloat(element.bonus);
                }
                break;
              }
            }
          }

          await connection.query(
            "UPDATE users SET money = money + ?, total_money = total_money + ?,recharge=recharge+? WHERE phone = ?",
            [bonus, bonus, bonus, info[0].phone],
          );
          const datasqll =
            "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
          await connection.query(datasqll, [
            info[0].phone,
            "First deposit bonus",
            bonus,
            checkTime,
          ]);
          let [infos] = await connection.query(
            "SELECT `invite`,`code` FROM users WHERE `phone` = ?",
            [info[0].phone],
          );
          // upline
          let refferal = infos[0]?.invite;
          if (refferal !== undefined) {
            let [refferaluser] = await connection.query(
              "SELECT * FROM users WHERE `code` = ? LIMIT 1",
              [refferal],
            );
            if (refferaluser[0]?.phone) {
              await connection.query(
                "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?",
                [bonus, bonus, refferaluser[0]?.phone],
              );

              const datasql =
                "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
              await connection.query(datasql, [
                refferaluser[0]?.phone,
                "Bonus",
                bonus,
                checkTime,
              ]);
            }
          }
        }

        await connection.query(
          "UPDATE recharge SET status = 1 WHERE id_order = ?",
          [merchanttransid],
        );
        await connection.query(
          "UPDATE users SET money = money + ?, total_money = total_money + ?,recharge=recharge+? ,totalRecharge=totalRecharge+? WHERE phone = ?",
          [
            info[0].money,
            info[0].money,
            info[0].money,
            info[0].money,
            info[0].phone,
          ],
        );

        const datasqls =
          "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
        await connection.query(datasqls, [
          info[0].phone,
          "Deposit",
          info[0].money,
          checkTime,
        ]);

        const [spinData] = await connection.query(
          "SELECT task_amount, num_of_spin FROM spin_data ORDER BY task_amount ASC LIMIT 1",
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
            [totalSpins, info[0].money, phone],
          );
        }

        return res.json("success");
      }
    } else {
      //console.log("Transaction not found.");
      return res.status(404).json({
        message: "Transaction not found",
        success: false,
      });
    }
  } catch (error) {
    //console.log("hh", error);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};

const recharge3 = async (req, res) => {
  let auth = req.cookies.auth;
  let rechid = req.cookies.orderid;
  let money = req.body.amount;
  let type = req.body.type;
  let typeid = req.body.typeid;
  let utr = req.body.utr;
  if (type != "cancel" && type != "submit" && type != "submitauto") {
    if (!auth || !money || money <= 199) {
      return res.status(200).json({
        message: "Minimum recharge 200",
        status: false,
        timeStamp: timeNow,
      });
    }
  }
  const [user] = await connection.query(
    "SELECT `phone`, `code`,`invite`,`isdemo` FROM users WHERE `token` = ?",
    [auth],
  );
  let userInfo = user[0];
  if (!user) {
    return res.status(200).json({
      message: "Invalid user",
      status: false,
      timeStamp: timeNow,
    });
  }

  let time = timerJoin2(Date.now());
  const date = new Date();

  let checkTime = timerJoin2(Date.now());
  let id_time =
    date.getUTCFullYear() +
    "" +
    date.getUTCMonth() +
    1 +
    "" +
    date.getUTCDate();
  let id_order =
    Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) +
    10000000000000;
  // let vat = Math.floor(Math.random() * (2000 - 0 + 1) ) + 0;

  money = Number(money);
  let client_transaction_id = id_time + id_order;

  function generateSign(params, secretKey) {
    const paramString = Object.keys(params)
      .sort()
      .filter((key) => key !== "sign") // Exclude 'sign' from the string
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    const signString = `${paramString}&key=${secretKey}`;
    return crypto.createHash("md5").update(signString).digest("hex");
  }

  // Validate required input parameters

  const callbackurl = `https://yaarclub.co/api/webapi/recharge-callback`;
  const OrderIds = `WP${Date.now()}${Math.floor(Math.random() * 100000)}`;
  // Sunpay request parameters
  if (type === "UPI") {
    const params = {
      version: "1.0",
      mch_id: "100225570",
      mch_order_no: OrderIds,
      pay_type: "101",
      trade_amount: `${money}`,
      order_date: new Date().toISOString().slice(0, 19).replace("T", " "),
      goods_name: "user goods_name",
      notify_url: callbackurl,
      mch_return_msg: "big7club.com",
    };

    const secretKey = "IGMWSWIAT1D26ZZ0Y1H2KSJ3E32RQJGY";
    params.sign = generateSign(params, secretKey);
    params.sign_type = "MD5";

    // Sunpay API request
    const sunpayResponse = await axios.post(
      "https://api.watchglbpay.com/pay/web",
      new URLSearchParams(params).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    if (sunpayResponse.data.respCode === "SUCCESS") {
      const sql = `INSERT INTO recharge SET
        id_order = ?,
        transaction_id = ?,
        phone = ?,
        money = ?,
        type = ?,
        status = ?,
        today = ?,
        url = ?,
        time = ?,
  userStatus=?
        `;
      await connection.execute(sql, [
        OrderIds,
        "0",
        userInfo.phone,
        money,
        type,
        0,
        checkTime,
        "0",
        time,
        0,
      ]);
      return res.status(200).json({
        message: "Order creation successful",
        pay: true,
        orderid: client_transaction_id,
        status: true,
        data: sunpayResponse.data,
        timeStamp: timeNow,
      });
    } else {
      return res.status(500).json({
        message: "failed ",

        status: false,
      });
    }
  }

  return res.status(200).json({
    message: "This gateway not working",

    status: true,
  });
};

const callbackdata = async (req, res) => {
  try {
    const {
      mchId,
      mchOrderNo,
      orderDate,
      oriAmount,
      tradeResult,
      signType,
      sign,
      merRetMsg,
      orderNo,
    } = req.body;
    //  //console.log("watch",req.body)
    const [info] = await connection.query(
      "SELECT * FROM recharge WHERE id_order = ?",
      [mchOrderNo],
    );

    if (info.length > 0) {
      if (info[0].status === 1) {
        console.log(
          "Recharge status is already completed. Skipping user money update.",
        );
      } else {
        const checkTime = timerJoin2(Date.now());
        const [Firstrecharge] = await connection.query(
          "SELECT * FROM recharge WHERE phone = ? AND status = ?",
          [info[0].phone, 1],
        );

        let bonus = 0;
        if (info[0].money == 300) {
          bonus = 48;
        } else if (info[0].money == 500) {
          bonus = 108;
        } else if (info[0].money == 1000) {
          bonus = 188;
        } else if (info[0].money == 5000) {
          bonus = 288;
        } else if (info[0].money == 10000) {
          bonus = 488;
        } else if (info[0].money == 50000) {
          bonus = 5000;
        } else if (info[0].money == 100000) {
          bonus = 12000;
        } else {
          bonus = info[0].money * 0.03;
        }
        if (Firstrecharge.length === 0) {
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
            "Big Recharge Bonus",
            info[0].phone,
            bonus,
            "credit",
            1,
            1,
            checkTime,
            checkTime,
          ]);
          await connection.query(
            "UPDATE users SET money = money + ?, total_money = total_money + ?,recharge=recharge+? WHERE phone = ?",
            [bonus, bonus, bonus, info[0].phone],
          );
          const datasqll =
            "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
          await connection.query(datasqll, [
            info[0].phone,
            "First deposit bonus",
            bonus,
            checkTime,
          ]);

          let refferal = info[0]?.invite;
          if (refferal !== undefined) {
            let [refferaluser] = await connection.query(
              "SELECT * FROM users WHERE `code` = ? LIMIT 1",
              [refferal],
            );
            await connection.query(
              "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?",
              [18, 18, refferaluser[0]?.phone],
            );

            const datasql =
              "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
            await connection.query(datasql, [
              refferaluser[0]?.phone,
              "Active member",
              18,
              checkTime,
            ]);
          }
        } else {
          await connection.query(
            "UPDATE users SET money = money + ?, total_money = total_money + ?,recharge=recharge+? WHERE phone = ?",
            [bonus, bonus, bonus, info[0].phone],
          );
        }

        await connection.query(
          "UPDATE recharge SET status = 1 WHERE id_order = ?",
          [mchOrderNo],
        );
        await connection.query(
          "UPDATE users SET money = money + ?, total_money = total_money + ?,recharge=recharge+? ,totalRecharge=totalRecharge+? WHERE phone = ?",
          [
            info[0].money,
            info[0].money,
            info[0].money,
            info[0].money,
            info[0].phone,
          ],
        );

        const datasqls =
          "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
        await connection.query(datasqls, [
          info[0].phone,
          "Deposit",
          info[0].money,
          checkTime,
        ]);
      }
    } else {
      console.log("Transaction not found.");
    }
  } catch (error) {
    console.log(error);
  }
};

const getRechargeOrderId = () => {
  const date = new Date();
  let id_time =
    date.getUTCFullYear() +
    "" +
    (date.getUTCMonth() + 1) + // Month starts from 0
    "" +
    date.getUTCDate();
  let id_order =
    Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) +
    10000000000000;

  return id_time + id_order;
};

async function makePostRequest(url, data) {
  try {
    const response = await axios.post(url, querystring.stringify(data), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    //console.log("makePostRequest response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "TrexoPay API request failed:",
      error.response?.data || error.message,
    );

    // Throw error back to controller
    throw {
      message: error.message,
      status: error.response?.status || 500,
      trexopayError: error.response?.data || null,
    };
  }
}

const initiateTrexoPayPayment = async (req, res) => {
  const auth = req.cookies.auth;
  const am = req.body.amount;
  const money = req.body.amount;
  const type = req.body.type;

  if (!auth || !money || money <= 99) {
    return res.status(200).json({
      message: "Minimum recharge 100",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [user] = await connection.query(
    "SELECT `phone`, `code`,`invite`,`isdemo` FROM users WHERE `token` = ?",
    [auth],
  );
  let userInfo = user[0];
  if (!user) {
    return res.status(200).json({
      message: "Failed",
      status: false,
      timeStamp: timeNow,
    });
  }

  let checkTime = timerJoin2(Date.now());

  try {
    const user_token = "79bf6a0f993ae54510d819a092c51905";

    const orderId = getRechargeOrderId();
    const redirect_url = "https://yaarclub.co/api/webapi/verifyTrexoPayPayment";

    const params = {
      customer_mobile: userInfo.phone,
      user_token: user_token,
      amount: am,
      order_id: orderId,
      redirect_url: redirect_url,
      remark1: "recharge",
      remark2: "wallet",
      route: 2,
    };

    const url = "https://merchant.trexopayment.com/api/create-order";

    // FIX: Do NOT pass res here
    const response = await makePostRequest(url, params);

    if (!response || typeof response.status !== "boolean") {
      return res.status(500).json({
        message: "Invalid response from TrexoPay API",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (response.status === true) {
      const sql = `INSERT INTO recharge 
                SET id_order=?, transaction_id=?, phone=?, money=?, type=?, 
                    status=?, today=?, url=?, time=?, userStatus=?`;

      await connection.execute(sql, [
        orderId,
        orderId,
        userInfo.phone,
        am,
        type,
        0,
        checkTime,
        "0",
        checkTime,
        0,
      ]);

      return res.status(200).json({
        message: "TrexoPay payment URL successful",
        status: true,
        data: response.result,
      });
    }

    // If response.status === false
    return res.status(400).json({
      message: "TrexoPay rejected the order",
      status: false,
      data: response,
    });
  } catch (error) {
    //console.log("error",error)
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
  const rawPostData = req.body;
  let { status, order_id, customer_mobile, amount } = rawPostData;
  //console.log("verifyTrexoPayPayment - rawPostData:", rawPostData);
  // order_id="2025080182704184500608"
  try {
    const [info] = await connection.query(
      "SELECT * FROM recharge WHERE id_order = ?",
      [order_id],
    );

    if (info.length > 0) {
      if (info[0].status === 1) {
        console.log(
          "Recharge status is already completed. Skipping user money update.",
        );
      } else {
        const checkTime = timerJoin2(Date.now());
        const [Firstrecharge] = await connection.query(
          "SELECT * FROM recharge WHERE phone = ? AND status = ?",
          [info[0].phone, 1],
        );
        const [infos] = await connection.query(
          "SELECT `invite`,`code` FROM users WHERE phone = ?",
          [info[0].phone],
        );

        let bonus = 0;
        let bonus2 = info[0].money * 0.02;
        if (info[0].money > 99 && info[0].money <= 1000) {
          bonus = info[0].money * 0.05;
        } else {
          bonus = info[0].money * 0.1;
        }
        if (Firstrecharge.length === 0) {
          await connection.query(
            "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?",
            [bonus, bonus, info[0].phone],
          );
          const datasqll =
            "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
          await connection.query(datasqll, [
            info[0].phone,
            "First deposit bonus",
            bonus,
            checkTime,
          ]);

          // upline
          let refferal = infos[0]?.invite;
          //console.log("reff", refferal)

          if (refferal !== undefined) {
            let [refferaluser] = await connection.query(
              "SELECT * FROM users WHERE `code` = ? LIMIT 1",
              [refferal],
            );
            if (refferaluser[0]?.phone) {
              await connection.query(
                "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?",
                [10, 10, refferaluser[0]?.phone],
              );
              const datasqll =
                "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
              await connection.query(datasqll, [
                refferaluser[0]?.phone,
                "Bonus",
                10,
                checkTime,
              ]);
            }
          }
        } else {
          await connection.query(
            "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?",
            [bonus, bonus, info[0].phone],
          );
          // upline
          let refferals = infos[0]?.invite;
          if (refferals !== undefined) {
            let [refferalusers] = await connection.query(
              "SELECT * FROM users WHERE `code` = ? LIMIT 1",
              [refferals],
            );
            if (refferalusers[0]?.phone) {
              if (refferalusers[0]?.phone) {
                await connection.query(
                  "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?",
                  [bonus2, bonus2, refferalusers[0]?.phone],
                );

                const datasqls =
                  "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
                await connection.query(datasqls, [
                  refferalusers[0]?.phone,
                  "Bonus",
                  bonus2,
                  checkTime,
                ]);
              }
            }
          }
        }

        await connection.query(
          "UPDATE recharge SET status = 1 WHERE id_order = ?",
          [order_id],
        );
        await connection.query(
          "UPDATE users SET money = money + ?, total_money = total_money + ?,totalRecharge=totalRecharge+? WHERE phone = ?",
          [info[0].money, info[0].money, info[0].money, info[0].phone],
        );

        const datasqls =
          "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
        await connection.query(datasqls, [
          info[0].phone,
          "Deposit",
          info[0].money,
          checkTime,
        ]);

        return res.json("success");
      }
    } else {
      console.log("Transaction not found.");
      return res.status(404).json({
        message: "Transaction not found",
        success: false,
      });
    }
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

const handleRechargeppay = async (req, res) => {
  let auth = req.cookies.auth;
  let rechid = req.cookies.orderid;
  let money = req.body.amount;
  let type = req.body.type;
  let typeid = req.body.typeid;
  let utr = req.body.utr;

  const timeNow = new Date().getTime();

  if (!auth || !money || money <= 99) {
    return res.status(200).json({
      message: "Minimum recharge 100",
      status: false,
      timeStamp: timeNow,
    });
  }

  const [user] = await connection.query(
    "SELECT `phone`, `code`,`invite`,`isdemo` FROM users WHERE `token` = ?",
    [auth],
  );
  let userInfo = user[0];
  if (!userInfo) {
    return res.status(200).json({
      message: "User not found",
      status: false,
      timeStamp: timeNow,
    });
  }

  let checkTime = timerJoin2(Date.now());
  let time = timerJoin2(Date.now());
  try {
    if (userInfo.isdemo == 1) {
      const date = new Date();

      let id_time =
        date.getUTCFullYear() +
        "" +
        date.getUTCMonth() +
        1 +
        "" +
        date.getUTCDate();
      let id_order =
        Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) +
        10000000000000;
      // let vat = Math.floor(Math.random() * (2000 - 0 + 1) ) + 0;

      money = Number(money);
      let client_transaction_id = id_time + id_order;

      const sql = `INSERT INTO recharge SET
            id_order = ?,
            transaction_id = ?,
            phone = ?,
            money = ?,
            type = ?,
            status = ?,
            today = ?,
            url = ?,
            time = ?,
            isdemo=?
            
            `;
      await connection.execute(sql, [
        client_transaction_id,
        "0",
        userInfo.phone,
        money,
        type,
        1,
        checkTime,
        "1",
        checkTime,
        1,
      ]);

      await connection.execute(
        "UPDATE users SET money = money + ? WHERE phone = ? ",
        [money, userInfo.phone],
      );
      return res.status(200).json({
        message: "Demo Amount is added",
        status: false,
        timeStamp: timeNow,
      });
    }

    const merchantId = "M514039"; // Replace with your actual Merchant ID
    const appId = "69816d78559c22f8bbeac1e3"; // Replace with your actual App ID
    const orderId = `PP${Date.now()}`; // Unique order number
    const notify_url = `https://yaarclub.co/api/webapi/callbackdatappay`; // Replace with your actual notification URL
    const return_url = `https://yaarclub.co`; // Replace with your actual return URL

    // Prepare parameters
    const params = {
      mchNo: merchantId,
      appId: appId,
      mchOrderNo: orderId,
      amount: money * 100,
      customerName: "ZhanSan",
      customerEmail: "zhangn@gmail.com",
      customerPhone: "7867986679",
      notifyUrl: notify_url,
    };
    const key =
      "7xlnLgAsXTymRqIVQE7eUmEuOKSvLDKpDk7sxhf3a6VqCRl4tDqoLCZrALzJ4HtebJ2QgXHYFPVML9Hfz8kM4C4VGvb3z5h1BRR5Ij5irkONjnDOuYw98oQ6BRFnG6YY";
    // Generate the MD5 signature
    const sign = md5Sign2(params, key);
    console.log("sign", sign);
    params.sign = sign;

    // Prepare the request payload
    const postData = JSON.stringify(params);

    // Collection interface URL
    const url = "https://pay.ppaypros.com/api/pay/pay";

    // Make the POST request
    const response = await axios.post(url, params, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(JSON.stringify(response.data, null, 2), "hgfdsa");

    function verifySign(responseData, key) {
      const { sign, ...rest } = responseData;

      const sortedKeys = Object.keys(rest).sort();

      const str =
        sortedKeys.map((k) => `${k}=${rest[k]}`).join("&") + `&key=${key}`;

      const newSign = crypto
        .createHash("md5")
        .update(str)
        .digest("hex")
        .toUpperCase();

      return newSign === sign;
    }

    if (response?.data?.code === 0) {
      const sql = `INSERT INTO recharge SET
        id_order = ?,
        transaction_id = ?,
        phone = ?,
        money = ?,
        type = ?,
        status = ?,
        today = ?,
        url = ?,
        time = ?,
  userStatus=?
        
        `;
      await connection.execute(sql, [
        orderId,
        "0",
        userInfo.phone,
        money,
        type,
        0,
        checkTime,
        "0",
        time,
        0,
      ]);
      return res.status(200).json({
        message: "Payment Initiated successfully",
        data: response.data?.data,
        status: true,
      });
    } else {
      return res.status(200).json({
        message: "Payment failed",
        data: response.data?.data,
        status: false,
      });
    }

    // Return the success response
  } catch (error) {
    console.error("Error:", error.response?.data || error.message); // Debugging the error
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.response?.data || error.message,
    });
  }
};

const callbackdatappay = async (req, res) => {
  // console.log("req",req.body)
  const { payOrderId, mchOrderNo } = req.body;

  try {
    const merchantId = "M514039"; // Replace with your actual Merchant ID
    const appId = "69816d78559c22f8bbeac1e3";
    // Prepare parameters
    const params = {
      mchNo: merchantId,
      appId: appId,
      payOrderId: payOrderId,
      mchOrderNo: mchOrderNo,
    };
    const key =
      "7xlnLgAsXTymRqIVQE7eUmEuOKSvLDKpDk7sxhf3a6VqCRl4tDqoLCZrALzJ4HtebJ2QgXHYFPVML9Hfz8kM4C4VGvb3z5h1BRR5Ij5irkONjnDOuYw98oQ6BRFnG6YY";
    // Generate the MD5 signature
    const sign = md5Sign2(params, key);
    params.sign = sign;

    // Prepare the request payload
    const postData = JSON.stringify(params);

    // Collection interface URL
    const url = "https://pay.ppaypros.com/api/pay/query";

    // Make the POST request
    const response = await axios.post(url, params, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    //   console.log("res",response)

    if (response?.data?.code === 0) {
      const [info] = await connection.query(
        "SELECT * FROM recharge WHERE id_order = ?",
        [mchOrderNo],
      );

      if (info.length > 0) {
        if (info[0].status === 1) {
          console.log(
            "Recharge status is already completed. Skipping user money update.",
          );
        } else {
          const checkTime = timerJoin2(Date.now());
          const [Firstrecharge] = await connection.query(
            "SELECT * FROM recharge WHERE phone = ? AND status = ?",
            [info[0].phone, 1],
          );

          let bonus = 0;
          if (info[0].money == 300) {
            bonus = 48;
          } else if (info[0].money == 500) {
            bonus = 108;
          } else if (info[0].money == 1000) {
            bonus = 188;
          } else if (info[0].money == 5000) {
            bonus = 288;
          } else if (info[0].money == 10000) {
            bonus = 488;
          } else if (info[0].money == 50000) {
            bonus = 5000;
          } else if (info[0].money == 100000) {
            bonus = 12000;
          } else {
            bonus = info[0].money * 0.03;
          }

          if (Firstrecharge.length === 0) {
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
              "Big Recharge Bonus",
              info[0].phone,
              bonus,
              "credit",
              1,
              1,
              checkTime,
              checkTime,
            ]);
            await connection.query(
              "UPDATE users SET money = money + ?, total_money = total_money + ?,recharge=recharge+? WHERE phone = ?",
              [bonus, bonus, bonus, info[0].phone],
            );
            const datasqll =
              "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
            await connection.query(datasqll, [
              info[0].phone,
              "First deposit bonus",
              bonus,
              checkTime,
            ]);

            // upline
            let refferal = info[0]?.invite;
            if (refferal !== undefined) {
              let [refferaluser] = await connection.query(
                "SELECT * FROM users WHERE `code` = ? LIMIT 1",
                [refferal],
              );
              await connection.query(
                "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?",
                [18, 18, refferaluser[0]?.phone],
              );

              const datasql =
                "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
              await connection.query(datasql, [
                refferaluser[0]?.phone,
                "Active member",
                18,
                checkTime,
              ]);
            }
          } else {
            await connection.query(
              "UPDATE users SET money = money + ?, total_money = total_money + ?,recharge=recharge+? WHERE phone = ?",
              [bonus, bonus, bonus, info[0].phone],
            );
          }

          await connection.query(
            "UPDATE recharge SET status = 1 WHERE id_order = ?",
            [mchOrderNo],
          );
          await connection.query(
            "UPDATE users SET money = money + ?, total_money = total_money + ?,recharge=recharge+? ,totalRecharge=totalRecharge+? WHERE phone = ?",
            [
              info[0].money,
              info[0].money,
              info[0].money,
              info[0].money,
              info[0].phone,
            ],
          );

          const datasqls =
            "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
          await connection.query(datasqls, [
            info[0].phone,
            "Deposit",
            info[0].money,
            checkTime,
          ]);
        }
      } else {
        console.log("Transaction not found.");
      }
    }
  } catch (error) {
    console.error("Error:", error.response?.data || error.message); // Debugging the error
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.response?.data || error.message,
    });
  }
};

module.exports = {
  zilpayCallback,
  zilpay,
  verifyTrexoPayPayment,
  initiateTrexoPayPayment,
  callbackdata,
  recharge3,
  handleRechargeppay,
  callbackdatappay,
  userInfo,
  searchUser,
  changeUser,
  changePassword,
  changeUserPhoto,
  promotion,
  myTeam,
  wowpay,
  recharge,
  onlineRecharge,
  handleCallback,
  recharge2,
  listRecharge,
  listWithdraw,
  checkInHandling,
  infoUserBank,
  addBank,
  withdrawal3,
  transfer,
  transferHistory,
  callback_bank,
  listMyTeam,
  verifyCode,
  aviator,
  useRedenvelope,
  getRedenvelope,
  search,
  updateRecharge,
  confirmRecharge,
  addutr,
  cancelRecharge,
  downlinerecharge,
  downlinerecharge_data,
  confirmUSDTRecharge,
  totalCommission,
  transactionHistory,
  subordinatedata,
  newSubordinateData,
  calculateDownlineBonuses,
  getRebate,
  rebateCreate,
  feedback,
  vipLevel,
  vipLevelEvery,
  totalCommission,
  vipLevelMonthly,
  aviator,
  commissiondata,
  userProblem,
  userProblemGet,
  adminProblemGet,
  adminProblemSubmit,
  getpromotiondata,
  updateRandomPromotion,
  makePromotion,
  getVipData,
  dailyBetCommition,
  getInvitationBonus,
  getSpinData,
  claimSpin,
  redeemSpin,
  getdailyactivyreward,
  spineHistory,
  listRecharge2,
  addUSDT,
};
