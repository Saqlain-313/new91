import axios from "axios";
import moment from "moment";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import connection from "../config/connectDB";

const PaymentStatusMap = {
  PENDING: 0,
  SUCCESS: 1,
  CANCELLED: 2,
};

const PaymentMethodsMap = {
  UPI_MANUAL: "upi_manual",
  QUROPAY: "quropay",
};

// Safe logger: console + quropay-logs.txt. File error kabhi payment flow nahi todega.
// Yahan kabhi poora axios response / headers mat daalo (usme API key hoti hai).
const appendQuroLog = (label, data) => {
  try {
    console.log(`[QuroPay] ${label}:`, data);
    fs.appendFileSync(
      path.join(process.cwd(), "quropay-logs.txt"),
      `${JSON.stringify({ timestamp: new Date().toISOString(), label, data }, null, 2)}\n\n`,
      "utf8",
    );
  } catch (e) {
    console.log("QuroPay log write failed:", e.message);
  }
};

// ============================================
// NORMAL / MANUAL UPI
// ============================================

// GET — return UPI details for the user to pay manually
const initiateManualUPIPayment = async (req, res) => {
  try {
    const [bank_recharge_momo] = await connection.query(
      "SELECT * FROM bank_recharge WHERE type = 'momo'",
    );

    const row = bank_recharge_momo?.[0];

    if (!row) {
      return res.status(404).json({
        status: false,
        message: "UPI details not configured. Please contact support.",
        upi_id: null,
      });
    }

    return res.status(200).json({
      status: true,
      upi_id: row.stk || "",
      bank_name: row.name_bank || "",
      username: row.name_user || "",
      qr_code_image: row.qr_code_image || "",
    });
  } catch (err) {
    console.error("initiateManualUPIPayment error:", err);
    return res.status(500).json({
      status: false,
      message: "Server error while fetching UPI details",
    });
  }
};

// POST — user submits amount + 12-digit UTR after paying
const addManualUPIPaymentRequest = async (req, res) => {
  const timeNow = Date.now();
  try {
    const auth = req.cookies.auth;
    const money = parseInt(req.body.money);
    const utr = (req.body.utr ?? "").toString().trim();
    const minimumMoneyAllowed = parseInt(process.env.MINIMUM_MONEY) || 100;

    if (!money || !(money >= minimumMoneyAllowed)) {
      return res.status(400).json({
        message: `Money is Required and it should be ₹${minimumMoneyAllowed} or above!`,
        status: false,
        timeStamp: timeNow,
      });
    }

    if (!utr || utr.length !== 12) {
      return res.status(400).json({
        message: "UPI Ref No. or UTR is Required and it should be 12 digits long",
        status: false,
        timeStamp: timeNow,
      });
    }

    const user = await getUserDataByAuthToken(auth);

    // Cancel any pending manual UPI recharges
    const pendingRechargeList = await rechargeTable.getRecordByPhoneAndStatus({
      phone: user.phone,
      status: PaymentStatusMap.PENDING,
      type: PaymentMethodsMap.UPI_MANUAL,
    });

    if (pendingRechargeList.length !== 0) {
      await Promise.all(
        pendingRechargeList.map((r) => rechargeTable.cancelById(r.id)),
      );
    }

    const orderId = getRechargeOrderId();

    const recharge = await rechargeTable.create({
      orderId,
      transactionId: "NULL",
      utr,
      phone: user.phone,
      money,
      type: PaymentMethodsMap.UPI_MANUAL,
      status: PaymentStatusMap.PENDING,
      today: rechargeTable.getCurrentTimeForTodayField(),
      url: "NULL",
      time: timeNow,
    });

    return res.status(200).json({
      message:
        "Payment requested successfully. Your balance will update shortly!",
      recharge,
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.log("addManualUPIPaymentRequest error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      timestamp: timeNow,
    });
  }
};

// ============================================
// QUROPAY (INR CHANNEL)
// ============================================

// POST — create an INR payin and return the checkout_url
const initiateQuroPayPayment = async (req, res) => {
  const timeNow = Date.now();
  const type = PaymentMethodsMap.QUROPAY;
  const auth = req.cookies.auth;
  const money = parseInt(req.body.money);
  const email = req.body.email || undefined;

  const minimumMoneyAllowed = parseInt(process.env.MINIMUM_MONEY) || 1;

  if (!money || !(money >= minimumMoneyAllowed)) {
    return res.status(400).json({
      message: `Money is Required and it should be ₹${minimumMoneyAllowed} or above!`,
      status: false,
      timeStamp: timeNow,
    });
  }

  try {
    const user = await getUserDataByAuthToken(auth);

    // Cancel any pending QuroPay recharges
    const pendingRechargeList = await rechargeTable.getRecordByPhoneAndStatus({
      phone: user.phone,
      status: PaymentStatusMap.PENDING,
      type,
    });

    if (pendingRechargeList.length !== 0) {
      await Promise.all(
        pendingRechargeList.map((r) => rechargeTable.cancelById(r.id)),
      );
    }

    const orderId = getRechargeOrderId();

    // Create INR payin on QuroPay
    // Docs ke hisaab se request mein callback URL field nahi hai. Webhook URL
    // QuroPay merchant dashboard mein set hota hai (https://max-win.site/api/wallet/verify/quropay).
    const quroPayResponse = await axios.post(
      "https://quropays.com/api/v1/payin/create.php",
      {
        channel: "INR",
        amount: money,
        order_ref: orderId,
        phone: user.phone, // optional — placeholder generated if omitted
        email, // optional — placeholder generated if omitted
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.QUROPAY_API_KEY}`,
        },
        timeout: 15000,
      },
    );

    const quroData = quroPayResponse?.data;

    // Response: { channel, out_trade_no, order_ref, amount, status, checkout_url, created_at }
    if (!quroData || !quroData.checkout_url) {
      throw Error("Gateway error from QuroPay: missing checkout_url");
    }

    const recharge = await rechargeTable.create({
      orderId,
      transactionId: quroData.out_trade_no || "NULL",
      utr: null,
      phone: user.phone,
      money,
      type,
      status: PaymentStatusMap.PENDING,
      today: rechargeTable.getCurrentTimeForTodayField(),
      url: quroData.checkout_url,
      time: timeNow,
    });

    appendQuroLog("payin created", {
      recharge,
      gatewayResponse: quroData, // sirf response body, headers/config nahi
    });

    return res.status(200).json({
      message: "Payment initiated successfully",
      recharge,
      payment_url: quroData.checkout_url,
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.log("QuroPay initiate error:", error?.response?.data || error);
    return res.status(500).json({
      status: false,
      message:
        error?.response?.data?.error?.message || "Something went wrong!",
      timestamp: timeNow,
    });
  }
};

// POST — QuroPay webhook (HMAC verified over RAW body)
// MUST be mounted with express.raw({ type: "application/json" }) BEFORE express.json():
//
//   app.post(
//     "/api/wallet/verify/quropay",
//     express.raw({ type: "application/json" }),
//     verifyQuroPayPayment,
//   );
//
// Route public hona chahiye (auth/cookie/CSRF middleware nahi).
const verifyQuroPayPayment = async (req, res) => {
  try {
    const signatureHeader = req.get("X-Webhook-Signature") || "";
    // QuroPay docs example webhook signature ke liye account ka API secret use karta hai
    // (USDT_GATEWAY_API_SECRET). Dashboard mein jo webhook/API secret dikhe wahi .env mein daalo.
    const secret =
      process.env.QUROPAY_WEBHOOK_SECRET || process.env.USDT_GATEWAY_API_SECRET;

    console.log("QuroPay webhook hit"); // agar ye log nahi aata to request server tak pahunchi hi nahi

    if (!secret) {
      console.log("QuroPay webhook secret not configured");
      return res.sendStatus(500);
    }

    // req.body is a raw Buffer (express.raw was applied on this route)
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(
          typeof req.body === "string" ? req.body : JSON.stringify(req.body || {}),
        );

    if (!Buffer.isBuffer(req.body)) {
      console.log(
        "QuroPay webhook: req.body raw Buffer nahi hai. express.raw() route par express.json() se PEHLE lagao, warna signature match nahi hoga.",
      );
    }

    const expected =
      "sha256=" +
      crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    const expectedBuf = Buffer.from(expected);
    const sigBuf = Buffer.from(signatureHeader);

    if (
      expectedBuf.length !== sigBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, sigBuf)
    ) {
      console.log("QuroPay webhook: bad signature");
      return res.status(401).send("bad signature");
    }

    const payload = JSON.parse(rawBody.toString("utf8"));
    const { event, data } = payload || {};

    appendQuroLog("webhook received", payload);

    try {
      if (event === "channel_payment.success") {
        await handleQuroPaySuccess(data);
      } else if (event === "channel_payment.failed") {
        await handleQuroPayFailure(data);
      } else {
        console.log("QuroPay webhook: unhandled event", event);
      }
    } catch (processingError) {
      // Signature valid thi par processing fail hui -> 500 do taaki gateway retry kare.
      // Success handler idempotent hai, retry se double credit nahi hoga.
      console.log("QuroPay webhook processing error:", processingError);
      return res.sendStatus(500);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.log("QuroPay webhook error:", error);
    return res.sendStatus(200);
  }
};

const handleQuroPaySuccess = async (data) => {
  const orderId = data?.order_ref;
  if (!orderId) {
    console.log("QuroPay success webhook missing order_ref");
    return;
  }

  const recharge = await rechargeTable.getRechargeByOrderId({ orderId });

  if (!recharge) {
    console.log(`QuroPay: recharge not found for orderId ${orderId}`);
    return;
  }

  // Quick idempotency check
  if (recharge.status === PaymentStatusMap.SUCCESS) {
    console.log(`QuroPay: already success for orderId ${orderId}`);
    return;
  }

  // Sirf log: gateway amount vs DB amount (credit DB ke recharge.money par hi hota hai)
  if (data?.amount && Number(data.amount) !== Number(recharge.money)) {
    console.log(
      `QuroPay: amount mismatch for ${orderId} gateway=${data.amount} db=${recharge.money}`,
    );
  }

  await creditQuroPayRecharge(recharge, data?.out_trade_no);
};

// Webhook, checkout-page check aur sweeper, teeno yahi use karte hain.
// Atomic hai: sirf ek hi caller status 1 kar payega, to double credit nahi hoga.
const creditQuroPayRecharge = async (recharge, outTradeNo) => {
  const orderId = recharge.orderId;

  const updated = await rechargeTable.setStatusToSuccessByIdAndOrderId({
    id: recharge.id,
    orderId,
  });

  if (!updated) {
    console.log(`QuroPay: already processed for orderId ${orderId}`);
    return false;
  }

  if (outTradeNo) {
    await connection.query(
      "UPDATE recharge SET utr = ? WHERE id_order = ?",
      [outTradeNo, orderId],
    );
  }

  const [users] = await connection.query(
    "SELECT phone, code, name_user, invite FROM users WHERE phone = ?",
    [recharge.phone],
  );
  const user = users?.[0];

  if (user) {
    await addUserAccountBalance({
      phone: user.phone,
      money: recharge.money,
      code: user.code,
      invite: user.invite,
    });
  } else {
    console.log(`QuroPay: user not found for phone ${recharge.phone}`);
  }

  console.log(`QuroPay: payment approved for ${orderId}`);
  return true;
};

const handleQuroPayFailure = async (data) => {
  const orderId = data?.order_ref;
  if (!orderId) return;

  const recharge = await rechargeTable.getRechargeByOrderId({ orderId });
  if (!recharge) return;

  // Don't downgrade a successful recharge
  if (recharge.status === PaymentStatusMap.SUCCESS) return;

  await rechargeTable.cancelById(recharge.id);
  console.log(`QuroPay: payment failed for ${orderId}`);
};

// Fallback: FreePay ka hosted checkout page server se kholkar dekhta hai ki
// "Payment Successful" dikh raha hai ya nahi. Ye QuroPay ka documented API nahi hai,
// isliye webhook hi main tareeka hai, ye sirf backup hai.
const checkQuroPayCheckoutPage = async (url) => {
  if (!url || !/^https:\/\//i.test(url)) return false;
  try {
    const r = await axios.get(url, {
      timeout: 10000,
      validateStatus: (s) => s < 500,
    });
    const html = typeof r.data === "string" ? r.data : "";
    return /<title>[^<]*payment successful[^<]*<\/title>/i.test(html);
  } catch (e) {
    console.log("QuroPay checkout page check failed:", e.message);
    return false;
  }
};

// Server start par ek baar call karo: pending QuroPay orders (last 30 min) ko
// har 30 sec mein check karke success hone par balance add karta hai.
let quroPaySweeperTimer = null;
const startQuroPayPendingChecker = (intervalMs = 30000) => {
  if (quroPaySweeperTimer) return;
  quroPaySweeperTimer = setInterval(async () => {
    try {
      const since = Date.now() - 30 * 60 * 1000;
      const [rows] = await connection.query(
        "SELECT * FROM recharge WHERE type = ? AND status = ? AND CAST(`time` AS UNSIGNED) > ?",
        [PaymentMethodsMap.QUROPAY, PaymentStatusMap.PENDING, since],
      );
      for (const row of rows) {
        if (await checkQuroPayCheckoutPage(row.url)) {
          await creditQuroPayRecharge(
            {
              id: row.id,
              orderId: row.id_order,
              phone: row.phone,
              money: row.money,
            },
            row.transaction_id,
          );
        }
      }
    } catch (e) {
      console.log("QuroPay pending checker error:", e.message);
    }
  }, intervalMs);
};

// GET — user returns from checkout; check status
const checkQuroPayStatus = async (req, res) => {
  const timeNow = Date.now();
  try {
    const auth = req.cookies.auth;
    const { orderId } = req.query;

    if (!auth || !orderId) {
      return res.status(400).json({
        message: "orderId is Required!",
        status: false,
        timeStamp: timeNow,
      });
    }

    const recharge = await rechargeTable.getRechargeByOrderId({ orderId });

    if (!recharge) {
      return res.status(400).json({
        message: "Unable to find recharge with this order id!",
        status: false,
        timeStamp: timeNow,
      });
    }

    // Sirf apna order check ho sakta hai
    const user = await getUserDataByAuthToken(auth);
    if (String(recharge.phone) !== String(user.phone)) {
      return res.status(403).json({
        message: "Not allowed!",
        status: false,
        timeStamp: timeNow,
      });
    }

    // Webhook abhi tak nahi aaya? Checkout page se confirm karke balance add karo.
    if (
      recharge.status === PaymentStatusMap.PENDING &&
      recharge.type === PaymentMethodsMap.QUROPAY &&
      (await checkQuroPayCheckoutPage(recharge.url))
    ) {
      await creditQuroPayRecharge(recharge, recharge.transactionId);
      recharge.status = PaymentStatusMap.SUCCESS;
    }

    if (recharge.status === PaymentStatusMap.SUCCESS) {
      return res.redirect("/wallet/rechargerecord");
    }

    return res.status(200).json({
      message: "Payment is still pending confirmation",
      status: false,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.log("checkQuroPayStatus error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      timestamp: timeNow,
    });
  }
};

// ============================================
// Helpers
// ============================================
const getUserDataByAuthToken = async (authToken) => {
  const [users] = await connection.query(
    "SELECT `phone`, `code`, `name_user`, `invite` FROM users WHERE `token` = ?",
    [authToken],
  );
  const user = users?.[0];

  if (!user) throw Error("Unable to get user data!");

  return {
    phone: user.phone,
    code: user.code,
    username: user.name_user,
    invite: user.invite,
  };
};

const addUserAccountBalance = async ({ money, phone, invite }) => {
  const user_money = money + (money / 100) * 5;
  const inviter_money = (money / 100) * 5;

  await connection.query(
    "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE `phone` = ?",
    [user_money, user_money, phone],
  );

  const [inviter] = await connection.query(
    "SELECT phone FROM users WHERE `code` = ?",
    [invite],
  );

  if (inviter.length) {
    await connection.query(
      "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE `code` = ? AND `phone` = ?",
      [inviter_money, inviter_money, invite, inviter[0].phone],
    );
  }
};

const getRechargeOrderId = () => {
  const date = new Date();
  const id_time =
    date.getUTCFullYear() +
    "" +
    (date.getUTCMonth() + 1) +
    "" +
    date.getUTCDate();
  const id_order =
    Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) +
    10000000000000;
  return "ORD" + id_time + id_order;
};

const rechargeTable = {
  getRecordByPhoneAndStatus: async ({ phone, status, type }) => {
    if (
      ![
        PaymentStatusMap.SUCCESS,
        PaymentStatusMap.CANCELLED,
        PaymentStatusMap.PENDING,
      ].includes(status)
    ) {
      throw Error("Invalid Payment Status!");
    }

    let recharge;

    if (type) {
      [recharge] = await connection.query(
        "SELECT * FROM recharge WHERE phone = ? AND status = ? AND type = ?",
        [phone, status, type],
      );
    } else {
      [recharge] = await connection.query(
        "SELECT * FROM recharge WHERE phone = ? AND status = ?",
        [phone, status],
      );
    }

    return recharge.map((item) => ({
      id: item.id,
      orderId: item.id_order,
      transactionId: item.transaction_id,
      utr: item.utr,
      phone: item.phone,
      money: item.money,
      type: item.type,
      status: item.status,
      today: item.today,
      url: item.url,
      time: item.time,
    }));
  },

  getRechargeByOrderId: async ({ orderId }) => {
    const [recharge] = await connection.query(
      "SELECT * FROM recharge WHERE id_order = ?",
      [orderId],
    );

    if (recharge.length === 0) return null;

    const item = recharge[0];
    return {
      id: item.id,
      orderId: item.id_order,
      transactionId: item.transaction_id,
      utr: item.utr,
      phone: item.phone,
      money: item.money,
      type: item.type,
      status: item.status,
      today: item.today,
      url: item.url,
      time: item.time,
    };
  },

  cancelById: async (id) => {
    if (typeof id !== "number") {
      throw Error("Invalid Recharge 'id' expected a number!");
    }
    await connection.query("UPDATE recharge SET status = 2 WHERE id = ?", [id]);
  },

  // Returns true only if THIS call changed the status (atomic, prevents double credit)
  setStatusToSuccessByIdAndOrderId: async ({ id, orderId }) => {
    if (typeof id !== "number") {
      throw Error("Invalid Recharge 'id' expected a number!");
    }
    const [result] = await connection.query(
      "UPDATE recharge SET status = 1 WHERE id = ? AND id_order = ? AND status != 1",
      [id, orderId],
    );
    return (result?.affectedRows || 0) > 0;
  },

  getCurrentTimeForTodayField: () =>
    moment().format("YYYY-DD-MM h:mm:ss A"),

  create: async (newRecharge) => {
    if (newRecharge.url === undefined || newRecharge.url === null) {
      newRecharge.url = "0";
    }

    await connection.query(
      `INSERT INTO recharge SET id_order = ?, transaction_id = ?, phone = ?, money = ?, type = ?, status = ?, today = ?, url = ?, time = ?, utr = ?`,
      [
        newRecharge.orderId,
        newRecharge.transactionId,
        newRecharge.phone,
        newRecharge.money,
        newRecharge.type,
        newRecharge.status,
        newRecharge.today,
        newRecharge.url,
        newRecharge.time,
        newRecharge?.utr || "NULL",
      ],
    );

    const [recharge] = await connection.query(
      "SELECT * FROM recharge WHERE id_order = ?",
      [newRecharge.orderId],
    );

    if (recharge.length === 0) throw Error("Unable to create recharge!");

    return recharge[0];
  },
};

export {
  // Manual UPI
  initiateManualUPIPayment,
  addManualUPIPaymentRequest,
  // QuroPay
  initiateQuroPayPayment,
  verifyQuroPayPayment,
  checkQuroPayStatus,
  startQuroPayPendingChecker,
};

export default {
  initiateManualUPIPayment,
  addManualUPIPaymentRequest,
  initiateQuroPayPayment,
  verifyQuroPayPayment,
  checkQuroPayStatus,
  startQuroPayPendingChecker,
};