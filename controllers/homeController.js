import connection from "../config/connectDB";
import jwt from "jsonwebtoken";
import md5 from "md5";

// ==================== HOME ====================
const homePage = async (req, res) => {
  try {
    const [settings] = await connection.query("SELECT `app`, `message` FROM admin");
    const app = settings?.[0]?.app || "";
    const message = settings?.[0]?.message || "";

    const auth = req.cookies.auth;
    let bonus = 0;
    let fist_time = 1;
    let user = null;
    let showPopUp = false;

    if (auth) {
      const [users] = await connection.query(
        "SELECT `bonus_gain`, `bonus` FROM users WHERE token = ?",
        [auth]
      );
      if (users.length) {
        showPopUp = true;
        bonus = users[0].bonus;
        fist_time = users[0].bonus_gain;
      }
    }

    return res.render("home/index.ejs", {
      app,
      message,
      bonus,
      fist_time,
      auth,
      showPopUp,
    });
  } catch (error) {
    console.error("homePage error:", error.message);
    return res.status(500).send("Internal server error");
  }
};

// ==================== STATIC PAGES ====================
const betrecordPage = async (req, res) => res.render("wallet/betrecordPage.ejs");
const slotjiliPage = async (req, res) => res.render("home/slot.ejs");
const lotteryPage = async (req, res) => res.render("home/lottery.ejs");
const casinoPage = async (req, res) => res.render("home/casino.ejs");
const fishingPage = async (req, res) => res.render("home/fishing.ejs");
const crashPage = async (req, res) => res.render("home/crash.ejs");
const rummyPage = async (req, res) => res.render("home/rummy.ejs");

const activityPage = async (req, res) => res.render("checkIn/activity.ejs");
const rebatePage = async (req, res) => res.render("checkIn/rebate.ejs");
const vipPage = async (req, res) => res.render("checkIn/vip.ejs");
const jackpotPage = async (req, res) => res.render("checkIn/jackpot.ejs");
const dailytaskPage = async (req, res) => res.render("checkIn/dailytask.ejs");
const invibonusPage = async (req, res) => res.render("checkIn/invibonus.ejs");
const checkInPage = async (req, res) => res.render("checkIn/checkIn.ejs");
const checkDes = async (req, res) => res.render("checkIn/checkDes.ejs");
const checkRecord = async (req, res) => res.render("checkIn/checkRecord.ejs");

const homeAdminPage = async (req, res) => res.render("manage/Home.ejs");

const addBank = async (req, res) => res.render("wallet/addbank.ejs");

// ==================== PROMOTION ====================
const promotionPage = async (req, res) => res.render("promotion/promotion.ejs");
const promotion1Page = async (req, res) => res.render("promotion/promotion1.ejs");
const promotionmyTeamPage = async (req, res) => res.render("promotion/myTeam.ejs");
const promotionDesPage = async (req, res) => res.render("promotion/promotionDes.ejs");
const comhistoryPage = async (req, res) => res.render("promotion/comhistory.ejs");
const tutorialPage = async (req, res) => res.render("promotion/tutorial.ejs");
const bonusRecordPage = async (req, res) => res.render("promotion/bonusrecord.ejs");

// ==================== WALLET ====================
const transactionhistoryPage = async (req, res) => res.render("wallet/transactionhistory.ejs");
const walletPage = async (req, res) => res.render("wallet/index.ejs");

const rechargePage = async (req, res) =>
  res.render("wallet/recharge.ejs", {
    MinimumMoney: process.env.MINIMUM_MONEY,
  });

const rechargerecordPage = async (req, res) => res.render("wallet/rechargerecord.ejs");
const downlinerechargePage = async (req, res) => res.render("wallet/downlinerecharge.ejs");
const withdrawalPage = async (req, res) => res.render("wallet/withdrawal.ejs");
const withdrawalrecordPage = async (req, res) => res.render("wallet/withdrawalrecord.ejs");

// ==================== MEMBER ====================
const mianPage = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const [user] = await connection.query(
      "SELECT `level` FROM users WHERE `token` = ?",
      [auth]
    );
    const [settings] = await connection.query("SELECT `cskh` FROM admin");

    const cskh = settings?.[0]?.cskh || "";
    const level = user?.[0]?.level || 0;

    return res.render("member/index.ejs", { level, cskh });
  } catch (error) {
    console.error("mianPage error:", error.message);
    return res.status(500).send("Internal server error");
  }
};

const aboutPage = async (req, res) => res.render("member/about/index.ejs");
const recordsalary = async (req, res) => res.render("member/about/recordsalary.ejs");
const privacyPolicy = async (req, res) => res.render("member/about/privacyPolicy.ejs");
const newtutorial = async (req, res) => res.render("member/newtutorial.ejs");
const redenvelopes = async (req, res) => res.render("member/redenvelopes.ejs");
const riskAgreement = async (req, res) => res.render("member/about/riskAgreement.ejs");
const myProfilePage = async (req, res) => res.render("member/myProfile.ejs");

const forgot = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    const [user] = await connection.query(
      "SELECT `time_otp` FROM users WHERE token = ?",
      [auth]
    );
    const time = user?.[0]?.time_otp || 0;
    return res.render("member/forgot.ejs", { time });
  } catch (error) {
    console.error("forgot error:", error.message);
    return res.status(500).send("Internal server error");
  }
};

// ==================== SALARY RECORDS ====================
const getSalaryRecord = async (req, res) => {
  try {
    const auth = req.cookies.auth;

    const [rows] = await connection.query("SELECT * FROM users WHERE token = ?", [auth]);
    if (!rows.length) {
      return res.status(200).json({ message: "Failed", status: false });
    }

    const rowstr = rows[0];
    const [getPhone] = await connection.query(
      "SELECT * FROM salary WHERE phone = ? ORDER BY time DESC",
      [rowstr.phone]
    );

    return res.status(200).json({
      message: "Success",
      status: true,
      data: {},
      rows: getPhone,
    });
  } catch (error) {
    console.error("getSalaryRecord error:", error.message);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

// ==================== EXPORTS ====================
module.exports = {
  homePage,
  checkInPage,
  invibonusPage,
  rebatePage,
  jackpotPage,
  vipPage,
  activityPage,
  dailytaskPage,
  promotionPage,
  promotion1Page,
  walletPage,
  mianPage,
  myProfilePage,
  promotionmyTeamPage,
  promotionDesPage,
  comhistoryPage,
  tutorialPage,
  bonusRecordPage,
  rechargePage,
  rechargerecordPage,
  withdrawalPage,
  withdrawalrecordPage,
  aboutPage,
  privacyPolicy,
  riskAgreement,
  newtutorial,
  redenvelopes,
  forgot,
  checkDes,
  checkRecord,
  addBank,
  recordsalary,
  getSalaryRecord,
  crashPage,
  rummyPage,
  fishingPage,
  casinoPage,
  lotteryPage,
  slotjiliPage,
  downlinerechargePage,
  transactionhistoryPage,
  betrecordPage,
  homeAdminPage,
};