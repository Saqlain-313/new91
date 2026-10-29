import axios from "axios";
import moment from "moment";
import crypto from "crypto";
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

  const minimumMoneyAllowed = parseInt(process.env.MINIMUM_MONEY) || 100;

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
    const quroPayResponse = await axios.post(
      "https://quropays.com/api/v1/payin/create.php",
      {
        channel: "INR",
        amount: money,
        order_ref: orderId,
        phone: user.phone, // optional — placeholder generated if omitted
        email,             // optional — placeholder generated if omitted
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
// MUST be mounted with express.raw({ type: "application/json" }) BEFORE express.json().
const verifyQuroPayPayment = async (req, res) => {
  try {
    const signatureHeader = req.get("X-Webhook-Signature") || "";
    const secret = process.env.QUROPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.log("QuroPay webhook secret not configured");
      return res.sendStatus(500);
    }

    // req.body is a raw Buffer (express.raw was applied on this route)
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(req.body || "");

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

    console.log("QuroPay webhook:", event, "order_ref:", data?.order_ref);

    if (event === "channel_payment.success") {
      await handleQuroPaySuccess(data);
    } else if (event === "channel_payment.failed") {
      await handleQuroPayFailure(data);
    }

    return res.sendStatus(200); // always 200 so gateway stops retrying
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

  // Idempotency — already credited?
  if (recharge.status === PaymentStatusMap.SUCCESS) {
    console.log(`QuroPay: already success for orderId ${orderId}`);
    return;
  }

  await rechargeTable.setStatusToSuccessByIdAndOrderId({
    id: recharge.id,
    orderId: recharge.orderId,
  });

  if (data?.out_trade_no) {
    await connection.query(
      "UPDATE recharge SET utr = ? WHERE id_order = ?",
      [data.out_trade_no, orderId],
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
  }

  console.log(`QuroPay: payment approved for ${orderId}`);
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

  setStatusToSuccessByIdAndOrderId: async ({ id, orderId }) => {
    if (typeof id !== "number") {
      throw Error("Invalid Recharge 'id' expected a number!");
    }
    await connection.query(
      "UPDATE recharge SET status = 1 WHERE id = ? AND id_order = ?",
      [id, orderId],
    );
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
};

export default {
  initiateManualUPIPayment,
  addManualUPIPaymentRequest,
  initiateQuroPayPayment,
  verifyQuroPayPayment,
  checkQuroPayStatus,
};