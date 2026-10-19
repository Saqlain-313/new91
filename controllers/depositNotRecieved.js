import connection from "../config/connectDB";
import request from "request";
import axios from "axios";

const { uploadImage } = require("../utils/uploadImage");
const md5 = require("md5");

// ==================== HELPERS ====================
const MAX_CONTENT_LENGTH = 500;

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

// Look up phone from auth token; returns null if not found
async function getPhoneByToken(token) {
  if (!token) return null;
  const [rows] = await connection.query("SELECT phone FROM users WHERE token = ?", [token]);
  return rows.length ? rows[0].phone : null;
}

// Validate admin-provided status param
function parseStatus(status) {
  const normalized = String(status || "").toLowerCase().trim();
  if (!["accepted", "rejected"].includes(normalized)) return null;
  return normalized === "accepted" ? 1 : 2;
}

// ==================== USER-SIDE SUBMISSIONS ====================

// Deposit not received report
exports.depositNotReceived = async (req, res) => {
  try {
    const { UTRNumber, ReceiverUPIID, id_order, money, OrderAmount, token, uid } = req.body;

    if (!UTRNumber || !ReceiverUPIID || !id_order || !money) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    const [results] = await connection.query(
      "SELECT phone, id_user FROM users WHERE id_user = ?",
      [uid]
    );
    if (results.length === 0) {
      return res.status(400).json({ message: "User does not exist", success: false });
    }

    const phone = results[0].phone;

    let proof1Url = null;
    let proof2Url = null;
    if (req.files?.proof1) proof1Url = await uploadImage(req.files.proof1);
    if (req.files?.proof2) proof2Url = await uploadImage(req.files.proof2);

    await connection.query(
      `INSERT INTO DepositNotReceived 
        (userId, UTRNumber, ReceiverUPIID, OrderNumber, OrderAmount, proof1, proof2, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [results[0].id_user, UTRNumber, ReceiverUPIID, id_order, money, proof1Url, proof2Url, phone]
    );

    return res.status(200).json({
      success: true,
      message: "details update successfully",
    });
  } catch (error) {
    console.error("depositNotReceived error:", error);
    return res.status(500).json({ message: "Server error", success: false, error: error.message });
  }
};

// Withdrawal problem report
exports.withdrawlProblems = async (req, res) => {
  try {
    const { auth, BankName, ifsccode, AccountNumber, UsdtAddress, ProblemDescription, OrderNumber, OrderAmount } = req.body;

    const phone = await getPhoneByToken(auth);
    if (!phone) {
      return res.status(400).json({ message: "User does not exist", success: false });
    }

    let proof1Url = null;
    let proof2Url = null;
    if (req.files?.proof1) proof1Url = await uploadImage(req.files.proof1);
    if (req.files?.proof2) proof2Url = await uploadImage(req.files.proof2);

    await connection.query(
      `INSERT INTO withdrawlProblem 
        (phone, BankName, ifsccode, AccountNumber, UsdtAddress, ProblemDescription, OrderNumber, OrderAmount, proof1, proof2)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        phone,
        BankName || null,
        ifsccode || null,
        AccountNumber || null,
        UsdtAddress || null,
        ProblemDescription || null,
        OrderNumber || null,
        OrderAmount || null,
        proof1Url,
        proof2Url,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Problem update successfully",
    });
  } catch (error) {
    console.error("withdrawlProblems error:", error);
    return res.status(500).json({ message: "Server error", success: false, error: error.message });
  }
};

// IFSC modification
exports.ifscModification = async (req, res) => {
  try {
    const { BankNumber, IFSCCode, auth } = req.body;

    if (!BankNumber || !IFSCCode) {
      return res.status(400).json({ message: "Both BankNumber and IFSCCode are required", success: false });
    }

    const phone = await getPhoneByToken(auth);
    if (!phone) {
      return res.status(400).json({ message: "User does not exist", success: false });
    }

    const [bankRows] = await connection.query("SELECT * FROM user_bank WHERE phone = ?", [phone]);
    if (bankRows.length === 0) {
      return res.status(400).json({ message: "Please add bank", success: false });
    }

    await connection.query(
      "UPDATE user_bank SET stk = ?, email = ? WHERE phone = ?",
      [BankNumber, IFSCCode, phone]
    );

    await connection.query(
      "INSERT INTO IFSCModification (BankNumber, IFSCCode, phone) VALUES (?, ?, ?)",
      [BankNumber, IFSCCode, phone]
    );

    return res.status(200).json({
      success: true,
      message: "details update successfully",
    });
  } catch (error) {
    console.error("ifscModification error:", error);
    return res.status(500).json({ message: "Server error", success: false, error: error.message });
  }
};

// Bank name update
exports.bankName = async (req, res) => {
  try {
    const { BankNumber, BankName, auth } = req.body;

    const phone = await getPhoneByToken(auth);
    if (!phone) {
      return res.status(400).json({ message: "User does not exist", success: false });
    }

    if (!BankNumber || !BankName) {
      return res.status(400).json({ message: "BankNumber and BankName are required", success: false });
    }

    await connection.query(
      "UPDATE user_bank SET name_bank = ? WHERE phone = ? AND stk = ?",
      [BankName, phone, BankNumber]
    );

    return res.status(200).json({
      success: true,
      message: "details update successfully",
    });
  } catch (error) {
    console.error("bankName error:", error);
    return res.status(500).json({ message: "Server error", success: false, error: error.message });
  }
};

// Full bank modification
exports.bankModification = async (req, res) => {
  try {
    const {
      BankName, OldBankName, OldBeneficiaryName, OldAccountNumber,
      OldIFSCCode, NewBankName, NewBeneficiaryName, NewAccountNumber, NewIFSCCode, auth,
    } = req.body;

    const phone = await getPhoneByToken(auth);
    if (!phone) {
      return res.status(400).json({ message: "User does not exist", success: false });
    }

    if (
      !BankName || !OldBankName || !OldBeneficiaryName || !OldAccountNumber ||
      !OldIFSCCode || !NewBankName || !NewBeneficiaryName || !NewAccountNumber || !NewIFSCCode
    ) {
      return res.status(400).json({ message: "All required fields must be provided", success: false });
    }

    const identityCard = req.files?.IdentityCard ? await uploadImage(req.files.IdentityCard) : null;
    const oldPassbook = req.files?.OldPassbook ? await uploadImage(req.files.OldPassbook) : null;
    const newPassbook = req.files?.NewPassbook ? await uploadImage(req.files.NewPassbook) : null;
    const latestDeposit = req.files?.LatestDeposit ? await uploadImage(req.files.LatestDeposit) : null;

    await connection.query(
      `INSERT INTO BankModification (
        BankName, OldBankName, OldBeneficiaryName, OldAccountNumber, OldIFSCCode,
        NewBankName, NewBeneficiaryName, NewAccountNumber, NewIFSCCode,
        IdentityCard, OldPassbook, NewPassbook, LatestDeposit, phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        BankName, OldBankName, OldBeneficiaryName, OldAccountNumber, OldIFSCCode,
        NewBankName, NewBeneficiaryName, NewAccountNumber, NewIFSCCode,
        identityCard, oldPassbook, newPassbook, latestDeposit, phone,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "modify bank details successfully",
    });
  } catch (error) {
    console.error("bankModification error:", error);
    return res.status(500).json({ message: "Server error", success: false, error: error.message });
  }
};

// USDT address registration
exports.addUSDTAddress = async (req, res) => {
  try {
    const { TirangaID, USDTWalletAddress, auth } = req.body;

    const phone = await getPhoneByToken(auth);
    if (!phone) {
      return res.status(400).json({ message: "User does not exist", success: false });
    }

    if (!TirangaID || !USDTWalletAddress) {
      return res.status(400).json({ message: "TirangaID and USDTWalletAddress are required", success: false });
    }

    const addressScreenshot = req.files?.AddressScreenshot ? await uploadImage(req.files.AddressScreenshot) : null;
    const identityCard = req.files?.IdentityCard ? await uploadImage(req.files.IdentityCard) : null;
    const passbook = req.files?.Passbook ? await uploadImage(req.files.Passbook) : null;
    const latestDeposit = req.files?.LatestDeposit ? await uploadImage(req.files.LatestDeposit) : null;

    await connection.query(
      `INSERT INTO USDTAddress 
        (TirangaID, USDTWalletAddress, AddressScreenshot, IdentityCard, Passbook, LatestDeposit, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [TirangaID, USDTWalletAddress, addressScreenshot, identityCard, passbook, latestDeposit, phone]
    );

    return res.status(200).json({
      success: true,
      message: "details update successfully",
    });
  } catch (error) {
    console.error("addUSDTAddress error:", error);
    return res.status(500).json({ message: "Server error", success: false, error: error.message });
  }
};

// Activity bonus claim
exports.addBonus = async (req, res) => {
  try {
    const { TirangaID, content, auth } = req.body;

    const phone = await getPhoneByToken(auth);
    if (!phone) {
      return res.status(400).json({ message: "User does not exist", success: false });
    }

    if (!TirangaID || !content) {
      return res.status(400).json({ message: "TirangaID and content are required", success: false });
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      return res.status(400).json({ message: `Content cannot exceed ${MAX_CONTENT_LENGTH} characters`, success: false });
    }

    const winningRecord = req.files?.winningRecord ? await uploadImage(req.files.winningRecord) : null;

    await connection.query(
      "INSERT INTO bonus (TirangaID, content, winningRecord, phone) VALUES (?, ?, ?, ?)",
      [TirangaID, content, winningRecord, phone]
    );

    return res.status(200).json({
      success: true,
      message: "details update successfully",
    });
  } catch (error) {
    console.error("addBonus error:", error);
    return res.status(500).json({ message: "Server error", success: false, error: error.message });
  }
};

// Problem report
exports.addProblem = async (req, res) => {
  try {
    const { Content, auth } = req.body;

    const phone = await getPhoneByToken(auth);
    if (!phone) {
      return res.status(400).json({ message: "User does not exist", success: false });
    }

    if (!Content) {
      return res.status(400).json({ message: "Content is required", success: false });
    }

    if (Content.length > MAX_CONTENT_LENGTH) {
      return res.status(400).json({ message: `Content cannot exceed ${MAX_CONTENT_LENGTH} characters`, success: false });
    }

    const Photo = req.files?.Photo ? await uploadImage(req.files.Photo) : null;
    const checktime = timerJoin2(Date.now());

    await connection.query(
      "INSERT INTO problems (Content, Photo, phone, time) VALUES (?, ?, ?, ?)",
      [Content, Photo, phone, checktime]
    );

    return res.status(200).json({
      success: true,
      message: "add problem successsfully",
    });
  } catch (error) {
    console.error("addProblem error:", error);
    return res.status(500).json({ message: "Server error", success: false, error: error.message });
  }
};

// ==================== OTP / PASSWORD ====================
const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const now = Date.now();
    const timeEnd = now + 1000 * 120 + 500;

    if (!phone || typeof phone !== "string") {
      return res.status(400).json({ message: "Phone number is required and must be a valid string" });
    }

    const otp = generateOTP();
    const [rows] = await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);

    if (rows.length === 0) {
      return res.status(200).json({ message: "Account does not exist", status: false });
    }

    const user = rows[0];
    if (user.time_otp - now > 0) {
      return res.status(200).json({ message: "Send SMS regularly", status: false });
    }

    const params = { numbers: phone, variables_values: otp, sender_id: 55 };
    const { data } = await axios.post("https://blacksms.in/sms", params, {
      headers: {
        Authorization: process.env.BLACKSMS_AUTH || "8f7b73d4df107001bdfc143ddcbbb0b9",
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    if (data.status === 1) {
      await connection.execute(
        "UPDATE users SET otp = ?, time_otp = ? WHERE phone = ?",
        [otp, timeEnd, phone]
      );
      return res.status(200).json({
        message: "otp send successfully",
        status: true,
        timeEnd,
      });
    }

    return res.status(200).json({ message: data.message, status: true, timeEnd });
  } catch (error) {
    console.error("sendOtp error:", error);
    return res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { phone, otp, password } = req.body;

    if (!phone || !otp || !password) {
      return res.status(400).json({
        message: "Phone number, OTP, and password are required",
        success: false,
      });
    }

    const [results] = await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const user = results[0];
    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP", success: false });
    }

    const hashedPassword = md5(password);
    await connection.query(
      "UPDATE users SET password = ?, plain_password = ? WHERE phone = ?",
      [hashedPassword, password, phone]
    );

    return res.status(200).json({
      message: "Password updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("updatePassword error:", error);
    return res.status(500).json({ message: "Server error", success: false, error: error.message });
  }
};

exports.updatePassword2 = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Phone number and password are required", success: false });
    }

    const [results] = await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const hashedPassword = md5(password);
    await connection.query(
      "UPDATE users SET password = ?, plain_password = ? WHERE phone = ?",
      [hashedPassword, password, phone]
    );

    return res.status(200).json({ message: "Password updated successfully", success: true });
  } catch (error) {
    console.error("updatePassword2 error:", error);
    return res.status(500).json({ message: "Server error", success: false, error: error.message });
  }
};

// ==================== ADMIN GET LISTS ====================
const getListByTable = (table, filter = "status = 0") =>
  async (req, res) => {
    try {
      const [results] = await connection.query(`SELECT * FROM ${table} WHERE ${filter} ORDER BY id DESC`);
      return res.status(200).json({
        message: "Records retrieved successfully",
        success: true,
        data: results,
      });
    } catch (error) {
      console.error(`getList(${table}) error:`, error);
      return res.status(500).json({ message: "Server error", success: false, error: error.message });
    }
  };

exports.getDepositNotReceived = getListByTable("DepositNotReceived");
exports.getifscModification = getListByTable("IFSCModification");
exports.getUserBank = getListByTable("user_bank");
exports.getBankModification = getListByTable("BankModification");
exports.bonusDetails = getListByTable("bonus");
exports.problemsDetails = getListByTable("problems");
exports.getUsdtAddress = getListByTable("USDTAddress");

exports.getwithdrawlProblems = async (req, res) => {
  try {
    const [problems] = await connection.query("SELECT * FROM withdrawlProblem WHERE status = 0");
    if (!problems.length) {
      return res.status(404).json({ success: false, message: "No withdrawal problems found" });
    }
    return res.status(200).json({ success: true, data: problems });
  } catch (error) {
    console.error("getwithdrawlProblems error:", error);
    return res.status(500).json({ message: "Server error", success: false, error: error.message });
  }
};

// ==================== USER-SCOPED GET ====================
exports.getUserProblems = async (req, res) => {
  try {
    const { auth } = req.params;
    const phone = await getPhoneByToken(auth);
    if (!phone) {
      return res.status(400).json({ message: "User does not exist", success: false });
    }

    const [resultss] = await connection.query(
      "SELECT * FROM problems WHERE phone = ? ORDER BY id DESC",
      [phone]
    );

    return res.status(200).json({
      message: "Records retrieved successfully",
      success: true,
      data: resultss,
    });
  } catch (error) {
    console.error("getUserProblems error:", error);
    return res.status(500).json({ message: "Server error", success: false, error: error.message });
  }
};

exports.getRecharge = async (req, res) => {
  try {
    const { auth } = req.params;
    const phone = await getPhoneByToken(auth);
    if (!phone) {
      return res.status(400).json({ message: "User does not exist", success: false });
    }

    const [rechargeDetails] = await connection.query(
      "SELECT * FROM recharge WHERE phone = ?",
      [phone]
    );
    if (rechargeDetails.length === 0) {
      return res.status(404).json({ success: false, message: "No recharge records found" });
    }

    return res.status(200).json({ success: true, data: rechargeDetails });
  } catch (error) {
    console.error("getRecharge error:", error);
    return res.status(500).json({ message: "Server error", success: false, error: error.message });
  }
};

exports.getwithdrawl2 = async (req, res) => {
  try {
    const { auth } = req.params;
    const phone = await getPhoneByToken(auth);
    if (!phone) {
      return res.status(400).json({ message: "User does not exist", success: false });
    }

    const [rechargeDetails] = await connection.query(
      "SELECT * FROM withdraw WHERE phone = ? AND status = 0",
      [phone]
    );
    if (rechargeDetails.length === 0) {
      return res.status(404).json({ success: false, message: "No withdrawal problems found" });
    }

    return res.status(200).json({ success: true, data: rechargeDetails });
  } catch (error) {
    console.error("getwithdrawl2 error:", error);
    return res.status(500).json({ message: "Server error", success: false, error: error.message });
  }
};

// ==================== ADMIN ACCEPT/REJECT ====================
// Generic accept/reject factory
const makeAcceptReject = (table, options = {}) => async (req, res) => {
  const { status, id } = req.params;
  const { remark } = req.body || {};
  const newStatus = parseStatus(status);

  if (newStatus === null) {
    return res.status(400).json({ message: "Invalid status. Use 'accepted' or 'rejected'", success: false });
  }

  try {
    const [rows] = await connection.query(
      `SELECT * FROM ${table} WHERE id = ? AND status = 0`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Record not found or already processed", success: false });
    }

    if (options.setRemark) {
      await connection.query(
        `UPDATE ${table} SET remark = ?, status = ? WHERE id = ?`,
        [remark || null, newStatus, id]
      );
    } else {
      await connection.query(
        `UPDATE ${table} SET status = ? WHERE id = ?`,
        [newStatus, id]
      );
    }

    return res.status(200).json({
      message: `Record updated successfully to ${newStatus === 1 ? "accepted" : "rejected"}`,
      success: true,
    });
  } catch (error) {
    console.error(`${table} accept/reject error:`, error);
    return res.status(500).json({ message: "Server error", success: false, error: error.message });
  }
};

exports.depositAcceptOrReject = makeAcceptReject("DepositNotReceived");
exports.problemAcceptOrReject = makeAcceptReject("problems", { setRemark: true });
exports.modifyBankAcceptorReject = makeAcceptReject("BankModification");
exports.addressAcceptOrReject = makeAcceptReject("USDTAddress");
exports.bonusAcceptOrReject = makeAcceptReject("bonus");
exports.withdrawlProblemsAcceptOrReject = makeAcceptReject("withdrawlProblem");