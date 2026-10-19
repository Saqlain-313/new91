import connection from "../config/connectDB";
import axios from "axios";
import moment from "moment";
import crypto from "crypto";
import request from "request";
import querystring from "querystring";

// ==================== CONSTANTS ====================
const PaymentStatusMap = {
  PENDING: 0,
  SUCCESS: 1,
  CANCELLED: 2,
};

const PaymentMethodsMap = {
  UPI_GATEWAY: "upi_gateway",
  UPI_MANUAL: "upi_manual",
  USDT_MANUAL: "usdt_manual",
  WOW_PAY: "wow_pay",
  USDT: "usdt",
  SUNPAY: "sun_pay",
};

const DEFAULT_MINIMUM_MONEY = 100;

const getMinimumMoney = () => {
  const val = parseInt(process.env.MINIMUM_MONEY);
  return Number.isFinite(val) && val > 0 ? val : DEFAULT_MINIMUM_MONEY;
};

// ==================== SIGN HELPERS ====================
/**
 * Sorts params alphabetically (excluding `sign`), joins as key=value&...,
 * appends &key=secret and returns lowercase MD5 hex.
 * Used by Sunpay, WowPay, and other MD5-signed gateways.
 */
const generateMd5Sign = (params, secretKey) => {
  const signStr =
    Object.keys(params)
      .sort()
      .filter((key) => key !== "sign" && params[key] !== undefined && params[key] !== null)
      .map((key) => `${key}=${params[key]}`)
      .join("&") + `&key=${secretKey}`;
  return crypto.createHash("md5").update(signStr).digest("hex");
};

const validateMd5Sign = (signStr, secretKey, receivedSign) => {
  const expected = crypto
    .createHash("md5")
    .update(`${signStr}&key=${secretKey}`)
    .digest("hex")
    .toUpperCase();
  return expected === String(receivedSign || "").toUpperCase();
};

// ==================== HELPERS ====================
const getUserDataByAuthToken = async (authToken) => {
  const [users] = await connection.query(
    "SELECT `phone`, `code`, `name_user`, `invite` FROM users WHERE `token` = ?",
    [authToken]
  );
  const user = users?.[0];
  if (!user) {
    throw new Error("Unable to get user data!");
  }
  return {
    phone: user.phone,
    code: user.code,
    username: user.name_user,
    invite: user.invite,
  };
};

const addUserAccountBalance = async ({ money, phone, invite }) => {
  const moneyNum = Number(money) || 0;
  const bonus = (moneyNum / 100) * 5;
  const user_money = moneyNum + bonus;
  const inviter_money = bonus;

  await connection.query(
    "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE `phone` = ?",
    [user_money, user_money, phone]
  );

  if (!invite) return;

  const [inviter] = await connection.query("SELECT phone FROM users WHERE `code` = ?", [invite]);
  if (inviter.length && inviter[0]?.phone) {
    await connection.query(
      "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE `code` = ? AND `phone` = ?",
      [inviter_money, inviter_money, invite, inviter[0].phone]
    );
  }
};

/**
 * Builds a uniquely-ordered recharge ID.
 * Format: YYYY{M+1}{D} + 14-digit random. Note: month/day are NOT zero-padded
 * to preserve existing DB behavior — see note in summary.
 */
const getRechargeOrderId = () => {
  const date = new Date();
  const id_time = `${date.getUTCFullYear()}${date.getUTCMonth() + 1}${date.getUTCDate()}`;
  const id_order = Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) + 10000000000000;
  return id_time + id_order;
};

const mapRechargeRow = (item) => ({
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
});

// ==================== RECHARGE TABLE ====================
const rechargeTable = {
  getRecordByPhoneAndStatus: async ({ phone, status, type }) => {
    if (![PaymentStatusMap.SUCCESS, PaymentStatusMap.CANCELLED, PaymentStatusMap.PENDING].includes(status)) {
      throw new Error("Invalid Payment Status!");
    }

    let recharge;
    if (type) {
      [recharge] = await connection.query(
        "SELECT * FROM recharge WHERE phone = ? AND status = ? AND type = ?",
        [phone, status, type]
      );
    } else {
      [recharge] = await connection.query(
        "SELECT * FROM recharge WHERE phone = ? AND status = ?",
        [phone, status]
      );
    }
    return recharge.map(mapRechargeRow);
  },

  getRechargeByOrderId: async ({ orderId }) => {
    const [recharge] = await connection.query("SELECT * FROM recharge WHERE id_order = ?", [orderId]);
    return recharge.length === 0 ? null : mapRechargeRow(recharge[0]);
  },

  cancelById: async (id) => {
    if (typeof id !== "number") {
      throw new Error("Invalid Recharge 'id' expected a number!");
    }
    await connection.query("UPDATE recharge SET status = 2 WHERE id = ?", [id]);
  },

  setStatusToSuccessByIdAndOrderId: async ({ id, orderId }) => {
    if (typeof id !== "number") {
      throw new Error("Invalid Recharge 'id' expected a number!");
    }
    await connection.query("UPDATE recharge SET status = 1 WHERE id = ? AND id_order = ?", [id, orderId]);
  },

  getCurrentTimeForTodayField: () => moment().format("YYYY-DD-MM h:mm:ss A"),

  getDMYDateOfTodayFiled: (today) => moment(today, "YYYY-DD-MM h:mm:ss A").format("DD-MM-YYYY"),

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
      ]
    );

    const [recharge] = await connection.query("SELECT * FROM recharge WHERE id_order = ?", [newRecharge.orderId]);
    if (recharge.length === 0) {
      throw new Error("Unable to create recharge!");
    }
    return recharge[0];
  },
};

// ==================== SHARED RECHARGE HELPERS ====================
const cancelPendingRecharges = async ({ phone, type }) => {
  const pendingRechargeList = await rechargeTable.getRecordByPhoneAndStatus({
    phone,
    status: PaymentStatusMap.PENDING,
    type,
  });
  if (pendingRechargeList.length !== 0) {
    await Promise.all(pendingRechargeList.map((r) => rechargeTable.cancelById(r.id)));
  }
};

const createGatewayRecharge = ({ orderId, user, money, type, url, transactionId = "NULL", utr = null }) =>
  rechargeTable.create({
    orderId,
    transactionId,
    utr,
    phone: user.phone,
    money,
    type,
    status: PaymentStatusMap.PENDING,
    today: rechargeTable.getCurrentTimeForTodayField(),
    url,
    time: Date.now(),
  });

// ==================== MANUAL UPI ====================
const initiateManualUPIPayment = async (req, res) => {
  try {
    const query = req.query;
    const [rows] = await connection.query("SELECT * FROM bank_recharge WHERE type = 'momo'");
    const momoData = rows?.[0];

    return res.render("wallet/manual_payment.ejs", {
      Amount: query?.am,
      UpiId: momoData?.stk || "",
    });
  } catch (error) {
    console.error("initiateManualUPIPayment:", error);
    return res.status(500).send("Internal server error");
  }
};

const addManualUPIPaymentRequest = async (req, res) => {
  const timeNow = Date.now();
  try {
    const { money: rawMoney, utr: rawUtr } = req.body;
    const auth = req.cookies.auth;

    const money = parseInt(rawMoney);
    const utr = rawUtr ? String(rawUtr).trim() : "";
    const minMoney = getMinimumMoney();

    if (!money || money < minMoney) {
      return res.status(400).json({
        message: `Money is Required and it should be ₹${minMoney} or above!`,
        status: false,
        timeStamp: timeNow,
      });
    }

    if (!utr || utr.length !== 12) {
      return res.status(400).json({
        message: `UPI Ref No. or UTR is Required And it should be 12 digit long`,
        status: false,
        timeStamp: timeNow,
      });
    }

    const user = await getUserDataByAuthToken(auth);
    await cancelPendingRecharges({ phone: user.phone, type: PaymentMethodsMap.UPI_GATEWAY });

    const recharge = await createGatewayRecharge({
      orderId: getRechargeOrderId(),
      user,
      money,
      type: PaymentMethodsMap.UPI_MANUAL,
      url: "NULL",
      utr,
    });

    return res.status(200).json({
      message: "Payment Requested successfully Your Balance will update shortly!",
      recharge,
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("addManualUPIPaymentRequest:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      timestamp: timeNow,
    });
  }
};

// ==================== MANUAL USDT ====================
const initiateManualUSDTPayment = async (req, res) => {
  try {
    const query = req.query;
    const [rows] = await connection.query("SELECT * FROM bank_recharge WHERE type = 'momo'");
    const momoData = rows?.[0];

    return res.render("wallet/usdt_manual_payment.ejs", {
      Amount: query?.am,
      UsdtWalletAddress: momoData?.qr_code_image || "",
    });
  } catch (error) {
    console.error("initiateManualUSDTPayment:", error);
    return res.status(500).send("Internal server error");
  }
};

const addManualUSDTPaymentRequest = async (req, res) => {
  const timeNow = Date.now();
  try {
    const { money: rawMoney, utr } = req.body;
    const auth = req.cookies.auth;

    const money = parseInt(rawMoney);
    const minMoney = getMinimumMoney();

    if (!money || money < minMoney) {
      return res.status(400).json({
        message: `Money is Required and it should be ₹${minMoney} or above!`,
        status: false,
        timeStamp: timeNow,
      });
    }

    if (!utr) {
      return res.status(400).json({
        message: `Ref No. or UTR is Required`,
        status: false,
        timeStamp: timeNow,
      });
    }

    const user = await getUserDataByAuthToken(auth);
    await cancelPendingRecharges({ phone: user.phone, type: PaymentMethodsMap.USDT_MANUAL });

    const recharge = await createGatewayRecharge({
      orderId: getRechargeOrderId(),
      user,
      money,
      type: PaymentMethodsMap.USDT_MANUAL,
      url: "NULL",
      utr,
    });

    return res.status(200).json({
      message: "Payment Requested successfully Your Balance will update shortly!",
      recharge,
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("addManualUSDTPaymentRequest:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      timestamp: timeNow,
    });
  }
};

// ==================== UPI GATEWAY (EKQR) ====================
const initiateUPIPayment = async (req, res) => {
  const timeNow = Date.now();
  const type = PaymentMethodsMap.UPI_GATEWAY;
  const auth = req.cookies.auth;
  const money = parseInt(req.body.money);
  const minMoney = getMinimumMoney();

  if (!money || money < minMoney) {
    return res.status(400).json({
      message: `Money is Required and it should be ₹${minMoney} or above!`,
      status: false,
      timeStamp: timeNow,
    });
  }

  try {
    const user = await getUserDataByAuthToken(auth);
    await cancelPendingRecharges({ phone: user.phone, type });

    const orderId = getRechargeOrderId();

    const ekqrResponse = await axios.post("https://api.ekqr.in/api/create_order", {
      key: process.env.UPI_GATEWAY_PAYMENT_KEY,
      client_txn_id: orderId,
      amount: String(money),
      p_info: process.env.PAYMENT_INFO,
      customer_name: user.username,
      customer_email: process.env.PAYMENT_EMAIL,
      customer_mobile: user.phone,
      redirect_url: `${process.env.APP_BASE_URL}/wallet/verify/upi`,
      udf1: process.env.APP_NAME,
    });

    const ekqrData = ekqrResponse?.data;

    if (ekqrData === undefined || ekqrData.status === false) {
      throw new Error("Gateway error from ekqr!");
    }

    const recharge = await createGatewayRecharge({
      orderId,
      user,
      money,
      type,
      url: ekqrData.data.payment_url,
    });

    return res.status(200).json({
      message: "Payment Initiated successfully",
      recharge,
      urls: {
        web_url: ekqrData.data.payment_url,
        bhim_link: ekqrData.data?.upi_intent?.bhim_link || "",
        phonepe_link: ekqrData.data?.upi_intent?.phonepe_link || "",
        paytm_link: ekqrData.data?.upi_intent?.paytm_link || "",
        gpay_link: ekqrData.data?.upi_intent?.gpay_link || "",
      },
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("initiateUPIPayment:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      timestamp: timeNow,
    });
  }
};

const verifyUPIPayment = async (req, res) => {
  const timeNow = Date.now();
  const auth = req.cookies.auth;
  const orderId = req.query.client_txn_id;

  if (!auth || !orderId) {
    return res.status(400).json({
      message: "orderId is Required!",
      status: false,
      timeStamp: timeNow,
    });
  }

  try {
    const user = await getUserDataByAuthToken(auth);
    const recharge = await rechargeTable.getRechargeByOrderId({ orderId });

    if (!recharge) {
      return res.status(400).json({
        message: "Unable to find recharge with this order id!",
        status: false,
        timeStamp: timeNow,
      });
    }

    const ekqrResponse = await axios.post("https://api.ekqr.in/api/check_order_status", {
      key: process.env.UPI_GATEWAY_PAYMENT_KEY,
      client_txn_id: orderId,
      txn_date: rechargeTable.getDMYDateOfTodayFiled(recharge.today),
    });

    const ekqrData = ekqrResponse?.data;
    if (ekqrData === undefined || ekqrData.status === false) {
      throw new Error("Gateway error from ekqr!");
    }

    if (ekqrData.data.status === "created") {
      return res.status(200).json({
        message: "Your payment request is just created",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (ekqrData.data.status === "scanning") {
      return res.status(200).json({
        message: "Waiting for confirmation",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (ekqrData.data.status === "success") {
      if (recharge.status === PaymentStatusMap.PENDING || recharge.status === PaymentStatusMap.CANCELLED) {
        await rechargeTable.setStatusToSuccessByIdAndOrderId({
          id: recharge.id,
          orderId: recharge.orderId,
        });
        await addUserAccountBalance({
          phone: user.phone,
          money: recharge.money,
          code: user.code,
          invite: user.invite,
        });
      }
      return res.redirect("/wallet/rechargerecord");
    }

    return res.status(200).json({
      message: `Payment status: ${ekqrData.data.status}`,
      status: false,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("verifyUPIPayment:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      timestamp: timeNow,
    });
  }
};

// ==================== SUNPAY ====================
const initiateSunpayPayment = async (req, res) => {
  const timeNow = Date.now();
  const type = PaymentMethodsMap.SUNPAY;
  const auth = req.cookies.auth;
  const inputAmount = parseInt(req.body.money);
  const minMoney = getMinimumMoney();

  if (!inputAmount || inputAmount < minMoney) {
    return res.status(400).json({
      message: `Money is Required and it should be ₹${minMoney} or above!`,
      status: false,
      timeStamp: timeNow,
    });
  }

  try {
    const user = await getUserDataByAuthToken(auth);

    // NOTE: pending cancellation disabled in original — kept same behavior.
    // If you want to cancel prior pending UPI_GATEWAY recharges, uncomment:
    // await cancelPendingRecharges({ phone: user.phone, type: PaymentMethodsMap.UPI_GATEWAY });

    const order_id = getRechargeOrderId();
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    const callbackurl = `${process.env.APP_BASE_URL || "https://bdgclub.games"}/wallet/paynow/verify-sunpay`;

    const params = {
      version: "1.0",
      mch_id: process.env.SUNPAY_MERCHANT_ID || "888168897",
      mch_order_no: order_id,
      pay_type: "102",
      trade_amount: inputAmount,
      order_date: date,
      goods_name: "user goods_name",
      notify_url: callbackurl,
      mch_return_msg: "user mch_return_msg",
    };

    params.sign = generateMd5Sign(params, process.env.SUNPAY_MERCHANT_KEY || "d60cd81fe0694f48ae64847839b68e53");
    params.sign_type = "MD5";

    const sunpayResponse = await new Promise((resolve, reject) => {
      request({ url: "https://pay.sunpayonline.xyz/pay/web", method: "POST", form: params }, (error, response, body) => {
        if (error) return reject(error);
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    if (!sunpayResponse || sunpayResponse.tradeMsg !== "request success") {
      throw new Error("Gateway error from sunpay!");
    }

    const recharge = await rechargeTable.create({
      orderId: order_id,
      transactionId: sunpayResponse.mchOrderNo,
      utr: 1,
      phone: user.phone,
      money: inputAmount,
      type,
      status: PaymentStatusMap.PENDING,
      today: rechargeTable.getCurrentTimeForTodayField(),
      url: sunpayResponse.payInfo,
      time: timeNow,
    });

    return res.status(200).json({
      message: "Payment Initiated successfully",
      recharge,
      url: sunpayResponse.payInfo,
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("initiateSunpayPayment:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      timestamp: timeNow,
    });
  }
};

const verifySunpayPayment = async (req, res) => {
  try {
    const { mchOrderNo } = req.body;
    const [results] = await connection.query("SELECT * FROM recharge WHERE id_order = ?", [mchOrderNo]);

    if (results.length === 0) {
      console.log("Sunpay callback: transaction not found:", mchOrderNo);
      return res.status(404).send("not found");
    }

    if (results[0].status === PaymentStatusMap.SUCCESS) {
      console.log("Sunpay callback: already processed:", mchOrderNo);
      return res.send("success");
    }

    await connection.query("UPDATE recharge SET status = 1 WHERE id_order = ?", [mchOrderNo]);
    await connection.query(
      "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?",
      [results[0].money, results[0].money, results[0].phone]
    );

    console.log("Sunpay callback: user money updated:", mchOrderNo);
    return res.send("success");
  } catch (error) {
    console.error("verifySunpayPayment:", error);
    return res.status(500).send("error");
  }
};

// ==================== WOWPAY ====================
const initiateWowPayPayment = async (req, res) => {
  const timeNow = Date.now();
  const type = PaymentMethodsMap.WOW_PAY;
  const auth = req.cookies.auth;
  const money = parseInt(req.query.money);
  const minMoney = getMinimumMoney();

  if (!money || money < minMoney) {
    return res.status(400).json({
      message: `Money is Required and it should be ₹${minMoney} or above!`,
      status: false,
      timeStamp: timeNow,
    });
  }

  try {
    const user = await getUserDataByAuthToken(auth);
    await cancelPendingRecharges({ phone: user.phone, type: PaymentMethodsMap.UPI_GATEWAY });

    const orderId = getRechargeOrderId();
    const date = moment().format("YYYY-MM-DD HH:mm:ss");

    const params = {
      version: "1.0",
      mch_id: process.env.WOWPAY_MERCHANT_ID,
      mch_order_no: orderId,
      pay_type: "151",
      trade_amount: money,
      order_date: date,
      goods_name: user.phone,
      notify_url: `${process.env.APP_BASE_URL || "https://247cashwin.cloud"}/wallet/verify/wowpay`,
      mch_return_msg: user.phone,
    };

    params.page_url = `${process.env.APP_BASE_URL || "https://247cashwin.cloud"}/wallet/verify/wowpay`;
    params.sign = generateMd5Sign(params, process.env.WOWPAY_MERCHANT_KEY);
    params.sign_type = "MD5";

    const response = await axios({
      method: "post",
      url: "https://pay6de1c7.wowpayglb.com/pay/web",
      data: querystring.stringify(params),
    });

    if (response.data.respCode === "SUCCESS" && response.data.payInfo) {
      // Persist the pending recharge so callbacks can find it
      const recharge = await createGatewayRecharge({
        orderId,
        user,
        money,
        type,
        url: response.data.payInfo,
      });

      return res.status(200).json({
        message: "Payment requested Successfully",
        payment_url: response.data.payInfo,
        recharge,
        status: true,
        timeStamp: timeNow,
      });
    }

    return res.status(400).json({
      message: "Payment request failed. Please try again Or Wrong Details.",
      status: false,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.error("initiateWowPayPayment:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      timestamp: timeNow,
    });
  }
};

const verifyWowPayPayment = async (req, res) => {
  const timeNow = Date.now();
  try {
    const type = PaymentMethodsMap.WOW_PAY;
    const data = req.body && Object.keys(req.body).length ? req.body : req.query;

    const params = {
      mchId: process.env.WOWPAY_MERCHANT_ID,
      amount: data.amount || "",
      mchOrderNo: data.mchOrderNo || "",
      merRetMsg: data.merRetMsg || "",
      orderDate: data.orderDate || "",
      orderNo: data.orderNo || "",
      oriAmount: data.oriAmount || "",
      tradeResult: data.tradeResult || "",
      signType: data.signType || "",
      sign: data.sign || "",
    };

    const signStr =
      `amount=${params.amount}&` +
      `mchId=${params.mchId}&` +
      `mchOrderNo=${params.mchOrderNo}&` +
      `merRetMsg=${params.merRetMsg}&` +
      `orderDate=${params.orderDate}&` +
      `orderNo=${params.orderNo}&` +
      `oriAmount=${params.oriAmount}&` +
      `tradeResult=${params.tradeResult}`;

    const flag = validateMd5Sign(signStr, process.env.WOWPAY_MERCHANT_KEY, params.sign);

    if (!flag) {
      console.log("verifyWowPayPayment: invalid sign", { mchOrderNo: params.mchOrderNo });
      return res.status(400).json({ status: false, message: "Invalid signature", timestamp: timeNow });
    }

    // Idempotency: skip if we already have this recharge in any state
    const existing = await rechargeTable.getRechargeByOrderId({ orderId: params.mchOrderNo });
    if (existing) {
      // If already processed successfully, don't credit again
      if (existing.status === PaymentStatusMap.SUCCESS) {
        return res.status(200).json({
          message: "Recharge already verified!",
          status: true,
          timeStamp: timeNow,
        });
      }
      // If pending (our initiate flow persisted it), flip to success and credit
      await rechargeTable.setStatusToSuccessByIdAndOrderId({
        id: existing.id,
        orderId: existing.orderId,
      });
      await addUserAccountBalance({
        phone: existing.phone,
        money: existing.money,
        invite: (await getUserDataByAuthToken ? null : null) || undefined, // see note
      });
      return res.redirect("/wallet/rechargerecord");
    }

    // No record exists — create it and credit (fallback for legacy flows)
    const phone = params.merRetMsg;
    const [userRows] = await connection.query(
      "SELECT phone, code, invite FROM users WHERE phone = ?",
      [phone]
    );
    if (!userRows.length) {
      console.log("verifyWowPayPayment: user not found for phone", phone);
      return res.status(400).json({ status: false, message: "User not found", timestamp: timeNow });
    }
    const user = userRows[0];

    await rechargeTable.create({
      orderId: params.mchOrderNo,
      transactionId: "NULL",
      utr: null,
      phone: user.phone,
      money: params.amount,
      type,
      status: PaymentStatusMap.SUCCESS,
      today: rechargeTable.getCurrentTimeForTodayField(),
      url: "NULL",
      time: timeNow,
    });

    await addUserAccountBalance({
      phone: user.phone,
      money: params.amount,
      code: user.code,
      invite: user.invite,
    });

    return res.redirect("/wallet/rechargerecord");
  } catch (error) {
    console.error("verifyWowPayPayment:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      timestamp: timeNow,
    });
  }
};

// ==================== EXPORTS ====================
module.exports = {
  initiateUPIPayment,
  initiateSunpayPayment,
  verifyUPIPayment,
  initiateWowPayPayment,
  verifyWowPayPayment,
  initiateManualUPIPayment,
  addManualUPIPaymentRequest,
  verifySunpayPayment,
  addManualUSDTPaymentRequest,
  initiateManualUSDTPayment,
};