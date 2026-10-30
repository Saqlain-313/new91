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
  let orderId = null;

  try {
    const auth = req.cookies?.auth;
    const money = Number.parseFloat(req.body?.money);
    const email = req.body?.email || undefined;
    const minimumMoneyAllowed = Number.parseFloat(process.env.MINIMUM_MONEY) || 1;

    if (!Number.isFinite(money) || money < minimumMoneyAllowed) {
      return res.status(400).json({
        message: `Money is Required and it should be ₹${minimumMoneyAllowed} or above!`,
        status: false,
        timeStamp: timeNow,
      });
    }

    const user = await getUserDataByAuthToken(auth);

    // Create our local pending order FIRST. A fast webhook can now find it.
    orderId = getRechargeOrderId();
    await rechargeTable.create({
      orderId,
      transactionId: "NULL",
      utr: null,
      phone: user.phone,
      money,
      type,
      status: PaymentStatusMap.PENDING,
      today: rechargeTable.getCurrentTimeForTodayField(),
      url: "NULL",
      time: timeNow,
    });

    appendQuroLog("pending recharge created before gateway call", {
      orderId,
      phone: user.phone,
      money,
    });

    // Do not cancel existing pending orders here: a user may have paid one of them.
    const quroPayResponse = await axios.post(
      "https://quropays.com/api/v1/payin/create.php",
      {
        channel: "INR",
        amount: money,
        order_ref: orderId,
        phone: user.phone,
        email,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.QUROPAY_API_KEY}`,
        },
        timeout: 20000,
      },
    );

    const quroData = quroPayResponse?.data;
    if (!quroData?.checkout_url) {
      throw new Error("Gateway response missing checkout_url");
    }

    // Update the already-created recharge row with gateway details.
    await connection.query(
      "UPDATE recharge SET transaction_id = ?, url = ? WHERE id_order = ? AND type = ?",
      [quroData.out_trade_no || "NULL", quroData.checkout_url, orderId, type],
    );

    appendQuroLog("payin created", {
      orderId,
      gatewayResponse: quroData,
    });

    return res.status(200).json({
      message: "Payment initiated successfully",
      recharge: {
        orderId,
        transactionId: quroData.out_trade_no || "NULL",
        phone: user.phone,
        money,
        type,
        status: PaymentStatusMap.PENDING,
        url: quroData.checkout_url,
      },
      payment_url: quroData.checkout_url,
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    appendQuroLog("payin initiation error", {
      orderId,
      message: error?.response?.data || error?.message || String(error),
    });

    // Keep the order pending if gateway outcome is uncertain (e.g. timeout).
    // Never mark it cancelled automatically: gateway may have accepted payment.
    return res.status(500).json({
      status: false,
      message:
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Unable to initiate payment. If amount was debited, contact support with order ID: " + (orderId || "not-created"),
      orderId,
      timestamp: timeNow,
    });
  }
};

// Backward-compatible alias. Both callback URLs use the same verified handler.
const verifyQuroPayCallback = async (req, res) => verifyQuroPayPayment(req, res);


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
    let payload = req.body;

    // Handle raw body or express.json()
    if (Buffer.isBuffer(payload)) {
      payload = JSON.parse(payload.toString("utf8"));
    } else if (typeof payload === "string") {
      payload = JSON.parse(payload);
    }

    const { event, data } = payload || {};

    appendQuroLog("INR webhook received", payload);

    if (!data) {
      return res.status(400).send("Missing webhook data");
    }

    // Test webhook
    if (event === "test.ping") {
      return res.status(200).send("Webhook received successfully");
    }

    if (!data.order_ref) {
      return res.status(400).send("Missing order_ref");
    }

    // PAYMENT SUCCESS
    if (
      event === "channel_payment.success" &&
      data.status === "completed"
    ) {
      await handleQuroPaySuccess(data);

      appendQuroLog("INR payment success processed", data);

      return res.status(200).send("Payment processed successfully");
    }

    // PAYMENT FAILED
    if (
      event === "channel_payment.failed" ||
      data.status === "failed"
    ) {
      await handleQuroPayFailure(data);

      appendQuroLog("INR payment failure processed", data);

      return res.status(200).send("Payment failure recorded");
    }

    // PAYMENT EXPIRED (if received)
    if (
      event === "channel_payment.expired" ||
      data.status === "expired"
    ) {
      await handleQuroPayFailure(data);

      appendQuroLog("INR payment expired", data);

      return res.status(200).send("Payment expiry recorded");
    }

    // Unrelated events
    appendQuroLog("Unhandled webhook event", {
      event,
      data
    });

    return res.status(200).send("Webhook received");

  } catch (error) {
    console.error("QuroPay webhook processing error:", error);

    appendQuroLog("webhook processing error", {
      message: error.message,
      stack: error.stack
    });

    return res.status(500).send("Webhook processing failed");
  }
};;

const handleQuroPaySuccess = async (data) => {
  const orderId = String(data?.order_ref || "").trim();
  if (!orderId || data?.status !== "completed") {
    throw new Error("Invalid QuroPay success payload");
  }

  const recharge = await rechargeTable.getRechargeByOrderId({ orderId });
  if (!recharge) {
    // Return 500 from webhook so gateway retries. The local recharge is created
    // before the gateway API call in initiateQuroPayPayment.
    throw new Error(`Recharge not found for order_ref ${orderId}`);
  }

  if (recharge.type !== PaymentMethodsMap.QUROPAY) {
    throw new Error(`Recharge type mismatch for ${orderId}`);
  }

  const gatewayAmount = Number(data.amount ?? data.pay_amount);
  const rechargeAmount = Number(recharge.money);
  if (!Number.isFinite(gatewayAmount) || gatewayAmount !== rechargeAmount) {
    throw new Error(
      `Amount mismatch for ${orderId}: gateway=${data.amount}, db=${recharge.money}`,
    );
  }

  await creditQuroPayRecharge(recharge, data.out_trade_no);
};

// Wallet credit + recharge SUCCESS status are committed in one DB transaction.
// Requires connection to be a mysql2/promise pool (getConnection available).
// If a webhook is retried, SELECT ... FOR UPDATE + status check prevents double credit.
const creditQuroPayRecharge = async (recharge, outTradeNo) => {
  const orderId = recharge.orderId;
  const db = typeof connection.getConnection === "function"
    ? await connection.getConnection()
    : connection;
  const ownsConnection = db !== connection;

  try {
    await db.beginTransaction();

    const [rows] = await db.query(
      "SELECT id, id_order, phone, money, type, status FROM recharge WHERE id_order = ? FOR UPDATE",
      [orderId],
    );
    const current = rows?.[0];

    if (!current) throw new Error(`Recharge not found in transaction: ${orderId}`);
    if (current.type !== PaymentMethodsMap.QUROPAY) {
      throw new Error(`Not a QuroPay recharge: ${orderId}`);
    }

    if (Number(current.status) === PaymentStatusMap.SUCCESS) {
      await db.commit();
      return false;
    }

    if (Number(current.status) === PaymentStatusMap.CANCELLED) {
      throw new Error(`Recharge is cancelled; refusing automatic credit: ${orderId}`);
    }

    const amount = Number(current.money);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(`Invalid recharge amount for ${orderId}`);
    }

    const [users] = await db.query(
      "SELECT phone, code, invite FROM users WHERE phone = ? FOR UPDATE",
      [current.phone],
    );
    const user = users?.[0];
    if (!user) throw new Error(`User not found for recharge ${orderId}`);

    // Preserve the existing 5% user bonus and 5% inviter bonus logic.
    const userCredit = amount + (amount / 100) * 5;
    const inviterCredit = (amount / 100) * 5;

    const [userUpdate] = await db.query(
      "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?",
      [userCredit, userCredit, user.phone],
    );
    if (!userUpdate?.affectedRows) {
      throw new Error(`Wallet update failed for ${orderId}`);
    }

    if (user.invite) {
      const [inviterRows] = await db.query(
        "SELECT phone FROM users WHERE code = ? LIMIT 1 FOR UPDATE",
        [user.invite],
      );
      if (inviterRows?.[0]?.phone) {
        await db.query(
          "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE code = ? AND phone = ?",
          [inviterCredit, inviterCredit, user.invite, inviterRows[0].phone],
        );
      }
    }

    await db.query(
      "UPDATE recharge SET status = ?, utr = ? WHERE id = ? AND id_order = ?",
      [PaymentStatusMap.SUCCESS, outTradeNo || current.id_order, current.id, orderId],
    );

    await db.commit();
    appendQuroLog("wallet credited successfully", {
      orderId,
      phone: current.phone,
      amount,
      userCredit,
      outTradeNo: outTradeNo || null,
    });
    return true;
  } catch (error) {
    try { await db.rollback(); } catch (rollbackError) {
      console.error("QuroPay transaction rollback failed:", rollbackError);
    }
    throw error;
  } finally {
    if (ownsConnection && typeof db.release === "function") db.release();
  }
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

    // Wallet is credited only after a signature-verified gateway webhook.
    // Do not infer payment success from checkout-page HTML.

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
  verifyQuroPayCallback,
};