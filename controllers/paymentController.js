import connection from "../config/connectDB";
import axios from "axios";
import moment from "moment";

const PaymentStatusMap = {
    PENDING: 0,
    SUCCESS: 1,
    CANCELLED: 2
}

const PaymentMethodsMap = {
    UPI_MANUAL: "upi_manual",
    KWIK_PAY: "kwik_pay"
}

// ============================================
// MANUAL UPI PAYMENT
// ============================================
const initiateManualUPIPayment = async (req, res) => {
  try {
    const [bank_recharge_momo] = await connection.query(
      "SELECT * FROM bank_recharge WHERE type = 'momo'"
    );

    const row = bank_recharge_momo?.[0];

    console.log(row)

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
      usdt_wallet_address: row.qr_code_image || "",
    });
  } catch (err) {
    console.error("initiateManualUPIPayment error:", err);
    return res.status(500).json({
      status: false,
      message: "Server error while fetching UPI details",
    });
  }
};

const addManualUPIPaymentRequest = async (req, res) => {
    try {
        const data = req.body;
        let auth = req.cookies.auth;
        let money = parseInt(data.money);
        let utr = parseInt(data.utr);
        const minimumMoneyAllowed = parseInt(process.env.MINIMUM_MONEY);
        let timeNow = Date.now();

        if (!money || !(money >= 100)) {
            return res.status(400).json({
                message: `Money is Required and it should be ₹${minimumMoneyAllowed} or above!`,
                status: false,
                timeStamp: timeNow,
            })
        }

        if (!utr && utr?.length != 12) {
            return res.status(400).json({
                message: `UPI Ref No. or UTR is Required And it should be 12 digit long`,
                status: false,
                timeStamp: timeNow,
            })
        }

        const user = await getUserDataByAuthToken(auth);

        const pendingRechargeList = await rechargeTable.getRecordByPhoneAndStatus({
            phone: user.phone,
            status: PaymentStatusMap.PENDING,
            type: PaymentMethodsMap.UPI_MANUAL
        });

        if (pendingRechargeList.length !== 0) {
            const deleteRechargeQueries = pendingRechargeList.map(recharge => {
                return rechargeTable.cancelById(recharge.id)
            });
            await Promise.all(deleteRechargeQueries);
        }

        const orderId = getRechargeOrderId();

        const newRecharge = {
            orderId: orderId,
            transactionId: 'NULL',
            utr: utr,
            phone: user.phone,
            money: money,
            type: PaymentMethodsMap.UPI_MANUAL,
            status: 0,
            today: rechargeTable.getCurrentTimeForTodayField(),
            url: "NULL",
            time: Date.now(),
        };

        const recharge = await rechargeTable.create(newRecharge);

        return res.status(200).json({
            message: 'Payment Requested successfully Your Balance will update shortly!',
            recharge: recharge,
            status: true,
            timeStamp: timeNow,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: false,
            message: "Something went wrong!",
            timestamp: Date.now()
        })
    }
}

// ============================================
// KWIK PAY GATEWAY
// ============================================
const initiateKwikPayPayment = async (req, res) => {
    let timeNow = Date.now();
    const type = PaymentMethodsMap.KWIK_PAY;
    let auth = req.cookies.auth;
    let money = parseInt(req.body.money);

    const minimumMoneyAllowed = parseInt(process.env.MINIMUM_MONEY);

    if (!money || !(money >= minimumMoneyAllowed)) {
        return res.status(400).json({
            message: `Money is Required and it should be ₹${minimumMoneyAllowed} or above!`,
            status: false,
            timeStamp: timeNow,
        });
    }

    try {
        const user = await getUserDataByAuthToken(auth);

        // Cancel any pending KwikPay recharges
        const pendingRechargeList = await rechargeTable.getRecordByPhoneAndStatus({
            phone: user.phone,
            status: PaymentStatusMap.PENDING,
            type: PaymentMethodsMap.KWIK_PAY
        });

        if (pendingRechargeList.length !== 0) {
            const deleteRechargeQueries = pendingRechargeList.map(recharge =>
                rechargeTable.cancelById(recharge.id)
            );
            await Promise.all(deleteRechargeQueries);
        }

        const orderId = getRechargeOrderId();

        // Create payment request on KwikPay
        const kwikPayResponse = await axios.post(
            'https://kwikpay.tech/api/payments/create',
            {
                amount: money,
                orderId: orderId,
                customerName: user.username,
                customerPhone: user.phone,
                callbackUrl: `${process.env.APP_BASE_URL}/wallet/verify/kwikpay`,
                returnUrl: `${process.env.APP_BASE_URL}/wallet/rechargerecord`
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Secret-Key': process.env.KWIKPAY_SECRET_KEY
                }
            }
        );

        const kwikData = kwikPayResponse?.data;

        if (!kwikData || !kwikData.paymentUrl) {
            throw Error("Gateway error from KwikPay!");
        }

        const newRecharge = {
            orderId: orderId,
            transactionId: kwikData.transactionId || 'NULL',
            utr: null,
            phone: user.phone,
            money: money,
            type: type,
            status: PaymentStatusMap.PENDING,
            today: rechargeTable.getCurrentTimeForTodayField(),
            url: kwikData.paymentUrl,
            time: timeNow,
        };

        const recharge = await rechargeTable.create(newRecharge);

        return res.status(200).json({
            message: 'Payment Initiated successfully',
            recharge: recharge,
            payment_url: kwikData.paymentUrl,
            status: true,
            timeStamp: timeNow,
        });

    } catch (error) {
        console.log(error?.response?.data || error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong!",
            timestamp: timeNow
        });
    }
};

// ============================================
// KwikPay Callback (Bank/Admin Approval)
// ============================================
const verifyKwikPayPayment = async (req, res) => {
    let timeNow = Date.now();
    try {
        const { event, status, orderId, amount, utr } = req.body;

        console.log("KwikPay Callback:", { event, status, orderId, amount, utr });

        if (event === 'payment.approved' && status === 'approved') {
            const recharge = await rechargeTable.getRechargeByOrderId({ orderId });

            if (!recharge) {
                console.log(`Recharge not found for orderId: ${orderId}`);
                return res.status(200).json({ status: 'ok' });
            }

            // Idempotency — skip if already successful
            if (recharge.status === PaymentStatusMap.SUCCESS) {
                console.log(`Recharge already success for orderId: ${orderId}`);
                return res.status(200).json({ status: 'ok' });
            }

            await rechargeTable.setStatusToSuccessByIdAndOrderId({
                id: recharge.id,
                orderId: recharge.orderId
            });

            if (utr) {
                await connection.query(
                    'UPDATE recharge SET utr = ? WHERE id_order = ?',
                    [utr, orderId]
                );
            }

            const [users] = await connection.query(
                'SELECT phone, code, name_user, invite FROM users WHERE phone = ?',
                [recharge.phone]
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

            console.log(`Payment approved for ${orderId}, UTR: ${utr}`);
        }

        // Always 200 so gateway stops retrying
        return res.status(200).json({ status: 'ok' });

    } catch (error) {
        console.log(error);
        return res.status(200).json({ status: 'ok' });
    }
};

// ============================================
// Optional: Check KwikPay status on user return
// ============================================
const checkKwikPayStatus = async (req, res) => {
    let timeNow = Date.now();
    try {
        const auth = req.cookies.auth;
        const { orderId } = req.query;

        if (!auth || !orderId) {
            return res.status(400).json({
                message: `orderId is Required!`,
                status: false,
                timeStamp: timeNow,
            });
        }

        const recharge = await rechargeTable.getRechargeByOrderId({ orderId });

        if (!recharge) {
            return res.status(400).json({
                message: `Unable to find recharge with this order id!`,
                status: false,
                timeStamp: timeNow,
            });
        }

        if (recharge.status === PaymentStatusMap.SUCCESS) {
            return res.redirect("/wallet/rechargerecord");
        }

        return res.status(200).json({
            message: 'Payment is still pending confirmation',
            status: false,
            timeStamp: timeNow,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong!",
            timestamp: timeNow
        });
    }
};

// ============================================
// Helpers
// ============================================
const getUserDataByAuthToken = async (authToken) => {
    let [users] = await connection.query(
        'SELECT `phone`, `code`, `name_user`, `invite` FROM users WHERE `token` = ? ',
        [authToken]
    );
    const user = users?.[0];

    if (user === undefined || user === null) {
        throw Error("Unable to get user data!");
    }

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
        'UPDATE users SET money = money + ?, total_money = total_money + ? WHERE `phone` = ?',
        [user_money, user_money, phone]
    );

    const [inviter] = await connection.query(
        'SELECT phone FROM users WHERE `code` = ?',
        [invite]
    );

    if (inviter.length) {
        await connection.query(
            'UPDATE users SET money = money + ?, total_money = total_money + ? WHERE `code` = ? AND `phone` = ?',
            [inviter_money, inviter_money, invite, inviter?.[0].phone]
        );
    }
};

const getRechargeOrderId = () => {
    const date = new Date();
    let id_time = date.getUTCFullYear() + '' + (date.getUTCMonth() + 1) + '' + date.getUTCDate();
    let id_order = Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) + 10000000000000;
    return 'ORD' + id_time + id_order;
};

const rechargeTable = {
    getRecordByPhoneAndStatus: async ({ phone, status, type }) => {
        if (![PaymentStatusMap.SUCCESS, PaymentStatusMap.CANCELLED, PaymentStatusMap.PENDING].includes(status)) {
            throw Error("Invalid Payment Status!");
        }

        let recharge;

        if (type) {
            [recharge] = await connection.query(
                'SELECT * FROM recharge WHERE phone = ? AND status = ? AND type = ?',
                [phone, status, type]
            );
        } else {
            [recharge] = await connection.query(
                'SELECT * FROM recharge WHERE phone = ? AND status = ?',
                [phone, status]
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
            'SELECT * FROM recharge WHERE id_order = ?',
            [orderId]
        );

        if (recharge.length === 0) {
            return null;
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
        }))?.[0];
    },

    cancelById: async (id) => {
        if (typeof id !== "number") {
            throw Error("Invalid Recharge 'id' expected a number!");
        }
        await connection.query('UPDATE recharge SET status = 2 WHERE id = ?', [id]);
    },

    setStatusToSuccessByIdAndOrderId: async ({ id, orderId }) => {
        if (typeof id !== "number") {
            throw Error("Invalid Recharge 'id' expected a number!");
        }
        await connection.query(
            'UPDATE recharge SET status = 1 WHERE id = ? AND id_order = ?',
            [id, orderId]
        );
    },

    getCurrentTimeForTodayField: () => {
        return moment().format("YYYY-DD-MM h:mm:ss A");
    },

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
                newRecharge?.utr || "NULL"
            ]
        );

        const [recharge] = await connection.query(
            'SELECT * FROM recharge WHERE id_order = ?',
            [newRecharge.orderId]
        );

        if (recharge.length === 0) {
            throw Error("Unable to create recharge!");
        }

        return recharge[0];
    }
};

module.exports = {
    // Manual UPI
    initiateManualUPIPayment,
    addManualUPIPaymentRequest,
    // KwikPay
    initiateKwikPayPayment,
    verifyKwikPayPayment,
    checkKwikPayStatus,
};