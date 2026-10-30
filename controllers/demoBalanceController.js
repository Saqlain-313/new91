import connection from "../config/connectDB";

const DEMO_MIN_BALANCE = 2000;
const DEMO_REFILL_AMOUNT = 10000;

/**
 * POST /api/webapi/demo/refill-balance
 *
 * - Auth cookie (`auth`) se user nikalta hai
 * - Agar user demo hai (isdemo = 1) aur money < 2000 hai
 *   to +10000 add karta hai (atomic UPDATE, race-safe)
 * - Non-demo users ko 403 deta hai
 */
const refillDemoBalance = async (req, res) => {
  const timeNow = Date.now();
  try {
    const auth = req.cookies.auth;
    if (!auth) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
        timeStamp: timeNow,
      });
    }

    // 1. User fetch
    const [rows] = await connection.query(
      "SELECT `phone`, `money`, `isdemo` FROM users WHERE `token` = ? LIMIT 1",
      [auth],
    );
    const user = rows?.[0];

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
        timeStamp: timeNow,
      });
    }

    // 2. Demo check
    if (Number(user.isdemo) !== 1) {
      return res.status(403).json({
        status: false,
        message: "This feature is only for demo accounts",
        timeStamp: timeNow,
      });
    }

    const currentBalance = Number(user.money) || 0;

    // 3. Balance already above threshold — nothing to do
    if (currentBalance >= DEMO_MIN_BALANCE) {
      return res.status(200).json({
        status: true,
        refilled: false,
        message: `Balance is already ₹${currentBalance.toFixed(
          2,
        )}. Minimum ₹${DEMO_MIN_BALANCE} required for refill.`,
        balance: currentBalance,
        timeStamp: timeNow,
      });
    }

    // 4. Atomic conditional UPDATE — agar kisi doosre request ne
    //    beech me balance badha diya to ye update 0 rows affect karega.
    const [result] = await connection.query(
      "UPDATE users SET money = money + ?, total_money = total_money + ? WHERE `phone` = ? AND `isdemo` = 1 AND money < ?",
      [DEMO_REFILL_AMOUNT, DEMO_REFILL_AMOUNT, user.phone, DEMO_MIN_BALANCE],
    );

    if (!result || result.affectedRows === 0) {
      // Kisi aur concurrent request ne pehle hi refill kar diya
      const [fresh] = await connection.query(
        "SELECT `money` FROM users WHERE `phone` = ? LIMIT 1",
        [user.phone],
      );
      const freshBalance = Number(fresh?.[0]?.money) || currentBalance;
      return res.status(200).json({
        status: true,
        refilled: false,
        message: "Balance already refilled by another request.",
        balance: freshBalance,
        timeStamp: timeNow,
      });
    }

    // 5. Naya balance fetch
    const [after] = await connection.query(
      "SELECT `money` FROM users WHERE `phone` = ? LIMIT 1",
      [user.phone],
    );
    const newBalance = Number(after?.[0]?.money) || 0;

    console.log(
      `[DemoRefill] phone=${user.phone} old=${currentBalance} new=${newBalance} added=${DEMO_REFILL_AMOUNT}`,
    );

    return res.status(200).json({
      status: true,
      refilled: true,
      message: `₹${DEMO_REFILL_AMOUNT} added to your demo account`,
      added: DEMO_REFILL_AMOUNT,
      balance: newBalance,
      timeStamp: timeNow,
    });
  } catch (err) {
    console.error("refillDemoBalance error:", err);
    return res.status(500).json({
      status: false,
      message: "Something went wrong!",
      timeStamp: timeNow,
    });
  }
};

/**
 * GET /api/webapi/demo/check-balance
 * Sirf read-only status — frontend ko batata hai ki refill
 * ki zaroorat hai ya nahi (auto-trigger ke liye useful).
 */
const checkDemoBalance = async (req, res) => {
  const timeNow = Date.now();
  try {
    const auth = req.cookies.auth;
    if (!auth) {
      return res
        .status(401)
        .json({ status: false, message: "Unauthorized", timeStamp: timeNow });
    }

    const [rows] = await connection.query(
      "SELECT `money`, `isdemo` FROM users WHERE `token` = ? LIMIT 1",
      [auth],
    );
    const user = rows?.[0];
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "User not found", timeStamp: timeNow });
    }

    const balance = Number(user.money) || 0;
    const isDemo = Number(user.isdemo) === 1;
    const needsRefill = isDemo && balance < DEMO_MIN_BALANCE;

    return res.status(200).json({
      status: true,
      isDemo,
      balance,
      minBalance: DEMO_MIN_BALANCE,
      refillAmount: DEMO_REFILL_AMOUNT,
      needsRefill,
      timeStamp: timeNow,
    });
  } catch (err) {
    console.error("checkDemoBalance error:", err);
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong!", timeStamp: timeNow });
  }
};

export { refillDemoBalance, checkDemoBalance };

export default { refillDemoBalance, checkDemoBalance };