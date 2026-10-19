import connection from "../config/connectDB";
import winGoController from "./winGoController";
import k5Controller from "./k5Controller";
import k3Controller from "./k3Controller";
import userController from "./userController";
import cron from "node-cron";
const cronJobGame1p = (io) => {
  
  cron.schedule("0 2 * * *", async () => {
    await userController.vipLevelEvery();
    await winGoController.tradeCommission();
  });
  
  // one month
  cron.schedule("0 0 1 * *", async () => {
    await userController.vipLevelMonthly();
  });
};

module.exports = {
  cronJobGame1p,
};
