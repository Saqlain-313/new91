import connection from "../config/connectDB";
import axios from "axios";
import path from "path";
import fs from "fs";
require("dotenv").config();

// ==================== HELPERS ====================
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

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}

// Fetch full downline tree via a single recursive CTE (up to 6 levels)
async function fetchDownlineTree(rootCode, maxDepth = 6) {
  const [rows] = await connection.query(
    `WITH RECURSIVE downline AS (
       SELECT id_user, name_user, phone, code, invite, time, 1 AS level
       FROM users WHERE invite = ?
       UNION ALL
       SELECT u.id_user, u.name_user, u.phone, u.code, u.invite, u.time, d.level + 1
       FROM users u INNER JOIN downline d ON u.invite = d.code
       WHERE d.level < ?
     )
     SELECT * FROM downline`,
    [rootCode, maxDepth]
  );
  return rows;
}

// ==================== PROMOTION ====================
const promotion = async (req, res) => {
  try {
    const [allUsers] = await connection.query("SELECT `id` FROM users");
    const currentDate = timerJoin2(Date.now() - 24 * 60 * 60 * 1000);

    for (const ui of allUsers) {
      const auth = ui.id;
      if (!auth) {
        console.warn("Skipping user with missing id");
        continue;
      }

      try {
        const [user] = await connection.query(
          "SELECT `phone`, `code`, `invite`, `roses_f`, `roses_f1`, `roses_today` FROM users WHERE `id` = ?",
          [auth]
        );
        if (!user.length) {
          console.warn(`User not found for id: ${auth}`);
          continue;
        }

        const userInfo = user[0];
        const selectedData = [];

        // Recursive CTE for full downline tree
        const downline = await fetchDownlineTree(userInfo.code, 6);
        selectedData.push(...downline);

        // Active-today count (level 2..6): query all downline codes in one shot
        let level2to6activeuser = 0;
        if (selectedData.length) {
          const codes = selectedData.map((d) => d.code);
          const [activeToday] = await connection.query(
            "SELECT `phone` FROM users WHERE `invite` IN (?) AND DATE(`today`) = ?",
            [codes, currentDate]
          );
          level2to6activeuser = activeToday.length;
        }

        const [level1_today_rows] = await connection.query(
          "SELECT `phone`, `code`, `invite`, `time` FROM users WHERE `invite` = ?",
          [userInfo.code]
        );
        const [level1_today_rows_today] = await connection.query(
          "SELECT `phone`, `code`, `invite`, `time` FROM users WHERE `invite` = ? AND DATE(`today`) = ?",
          [userInfo.code, currentDate]
        );

        let totalDepositCount = 0;
        let totalDepositAmount = 0;
        let firstDepositCount = 0;

        // Level 1 deposits
        if (level1_today_rows.length) {
          const l1Phones = level1_today_rows.map((u) => u.phone);
          const [deposits] = await connection.query(
            "SELECT `phone`, `money` FROM `recharge` WHERE `phone` IN (?) AND DATE(`today`) = ? AND `status` = 1",
            [l1Phones, currentDate]
          );
          totalDepositCount += deposits.length;
          totalDepositAmount += deposits.reduce((sum, d) => sum + parseFloat(d.money || 0), 0);
          const phonesWithDeposit = new Set(deposits.map((d) => d.phone));
          firstDepositCount += phonesWithDeposit.size;
        }

        // Level 2..6 deposits
        let level2_to_level6totalDepositCount = 0;
        let level2_to_level6totalDepositAmount = 0;
        let level2_to_level6firstDepositCount = 0;

        if (selectedData.length) {
          const l2Phones = selectedData.map((u) => u.phone);
          const [deposits] = await connection.query(
            "SELECT `phone`, `money` FROM `recharge` WHERE `phone` IN (?) AND DATE(`today`) = ? AND `status` = 1",
            [l2Phones, currentDate]
          );
          level2_to_level6totalDepositCount += deposits.length;
          level2_to_level6totalDepositAmount += deposits.reduce((sum, d) => sum + parseFloat(d.money || 0), 0);
          const phonesWithDeposit = new Set(deposits.map((d) => d.phone));
          level2_to_level6firstDepositCount += phonesWithDeposit.size;
        }

        const [existingUser] = await connection.query(
          "SELECT `id` FROM `promotion_data` WHERE `phone` = ? AND DATE(`date`) = ?",
          [userInfo.phone, currentDate]
        );

        if (existingUser.length > 0) {
          await connection.query(
            `UPDATE promotion_data SET 
               direct_register = ?, direct_deposit_num = ?, direct_deposit_amount = ?, direct_deposit_first = ?,
               indirect_register = ?, indirect_deposit_num = ?, indirect_deposit_amount = ?, indirect_deposit_first = ?,
               levelonealltimeactive = ?, level2to6alltimeactive = ?
             WHERE phone = ? AND DATE(date) = ?`,
            [
              level1_today_rows_today.length,
              totalDepositCount,
              totalDepositAmount,
              firstDepositCount,
              level2to6activeuser,
              level2_to_level6totalDepositCount,
              level2_to_level6totalDepositAmount,
              level2_to_level6firstDepositCount,
              level1_today_rows.length,
              selectedData.length,
              userInfo.phone,
              currentDate,
            ]
          );
        } else {
          await connection.query(
            `INSERT INTO promotion_data 
               (phone, direct_register, direct_deposit_num, direct_deposit_amount, direct_deposit_first,
                indirect_register, indirect_deposit_num, indirect_deposit_amount, indirect_deposit_first,
                levelonealltimeactive, level2to6alltimeactive, date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              userInfo.phone,
              level1_today_rows_today.length,
              totalDepositCount,
              totalDepositAmount,
              firstDepositCount,
              level2to6activeuser,
              level2_to_level6totalDepositCount,
              level2_to_level6totalDepositAmount,
              level2_to_level6firstDepositCount,
              level1_today_rows.length,
              selectedData.length,
              currentDate,
            ]
          );
        }
      } catch (innerError) {
        console.error(`Error processing user id: ${ui.id}`, innerError);
        continue;
      }
    }

    return "All done";
  } catch (error) {
    console.error("promotion error:", error);
    return "Failed";
  }
};

// ==================== DOWNLINE RECHARGE AGGREGATION ====================
const downlinerecharge_new = async (req, res) => {
  const date = timerJoin2(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const [allUsers] = await connection.query(
      "SELECT `id` FROM users WHERE DATE(login_at) BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 MONTH) AND CURDATE()"
    );

    for (const ui of allUsers) {
      const auth = ui.id;
      if (!auth) {
        console.warn("Skipping user with missing id");
        continue;
      }

      try {
        const [user] = await connection.query(
          "SELECT `phone`, `code`, `invite` FROM users WHERE `id` = ?",
          [auth]
        );
        if (!user.length) {
          console.warn(`User not found for id: ${auth}`);
          continue;
        }
        const userInfo = user[0];

        // Recursive CTE: full downline tree
        const selectedData = await fetchDownlineTree(userInfo.code, 6);

        if (!selectedData.length) {
          console.log(`No downline users found for invite code: ${userInfo.code}. Skipping...`);
          continue;
        }

        const userIds = selectedData.map((u) => u.id_user);

        // Existing records for this date
        const [existingRecords] = await connection.query(
          `SELECT userId, totalBetAmount, totalRechargeAmount, deposits_count, bet_count, first_deposit_amount
           FROM downline_recharges WHERE userId IN (?) AND DATE(dates) = ?`,
          [userIds, date]
        );
        const existingMap = new Map(existingRecords.map((r) => [r.userId, r]));

        let total_first_recharge_count = 0;
        let total_first_recharge_amount = 0;
        let total_recharge_count = 0;
        let total_recharge_amount = 0;
        let total_bet_count = 0;
        let total_bet_amount = 0;
        let better_number = 0;

        const rechargeData_record = [];
        const downline_user = selectedData.map((u) => ({ userId: u.id_user, level: u.level }));
        const newRecords = [];

        // Aggregate existing records
        for (const u of selectedData) {
          const existing = existingMap.get(u.id_user);
          if (existing) {
            total_bet_count += existing.bet_count;
            total_recharge_amount += parseFloat(existing.totalRechargeAmount || 0);
            if (existing.deposits_count > 0) total_first_recharge_count++;
            if (existing.totalBetAmount > 0) better_number++;
            total_recharge_count += existing.deposits_count;
            total_bet_amount += parseFloat(existing.totalBetAmount || 0);
            total_first_recharge_amount += parseFloat(existing.first_deposit_amount || 0);

            rechargeData_record.push({
              totalBetAmount: existing.totalBetAmount,
              totalRechargeAmount: existing.totalRechargeAmount,
              userId: u.id_user,
              dates: date,
              level: u.level,
            });
          } else if (!newRecords.some((r) => r.id_user === u.id_user)) {
            newRecords.push(u);
          }
        }

        // Compute new records in bulk
        if (newRecords.length) {
          const phones = newRecords.map((u) => u.phone);

          const [combinedData] = await connection.query(
            `SELECT phone, SUM(IFNULL(money, 0)) AS grand_total_money, COUNT(*) AS row_count
             FROM (
               SELECT phone, money, today AS date FROM minutes_1 WHERE phone IN (?) AND DATE(today) = ? AND isdemo = 0
               UNION ALL
               SELECT phone, money, bet_data AS date FROM result_k3 WHERE phone IN (?) AND DATE(bet_data) = ?
               UNION ALL
               SELECT phone, money, bet_data AS date FROM result_5d WHERE phone IN (?) AND DATE(bet_data) = ?
             ) combined_table
             GROUP BY phone`,
            [phones, date, phones, date, phones, date]
          );
          const phoneBetMap = new Map(combinedData.map((r) => [r.phone, r]));

          // Bulk fetch recharge aggregates
          const [rechargeRows] = await connection.query(
            `SELECT phone, SUM(money) AS total_money, COUNT(*) AS deposits_count
             FROM recharge
             WHERE phone IN (?) AND status = 1 AND DATE(today) = ? AND isdemo = 0
             GROUP BY phone`,
            [phones, date]
          );
          const phoneRechargeMap = new Map(rechargeRows.map((r) => [r.phone, r]));

          // Bulk fetch first deposit per phone (single query, no N+1)
          const [firstDeposits] = await connection.query(
            `SELECT phone, money FROM (
               SELECT phone, money, ROW_NUMBER() OVER (PARTITION BY phone ORDER BY id ASC) AS rn
               FROM recharge
               WHERE phone IN (?) AND status = 1 AND isdemo = 0 AND DATE(today) = ?
             ) t WHERE rn = 1`,
            [phones, date]
          );
          const phoneFirstDepositMap = new Map(firstDeposits.map((r) => [r.phone, parseFloat(r.money || 0)]));

          for (const u of newRecords) {
            const betRec = phoneBetMap.get(u.phone) || { grand_total_money: 0, row_count: 0 };
            const rechargeRec = phoneRechargeMap.get(u.phone) || { total_money: 0, deposits_count: 0 };
            const rechargeAmount = parseFloat(rechargeRec.total_money || 0);
            const first_deposit_amount = phoneFirstDepositMap.get(u.phone) || 0;

            total_bet_count += betRec.row_count;
            total_recharge_amount += rechargeAmount;
            if (rechargeAmount > 0) total_first_recharge_count++;
            if (betRec.grand_total_money > 0) better_number++;
            total_recharge_count += rechargeRec.deposits_count;
            total_bet_amount += parseFloat(betRec.grand_total_money || 0);
            total_first_recharge_amount += first_deposit_amount;

            await connection.query(
              `INSERT INTO downline_recharges 
                 (userId, totalBetAmount, totalRechargeAmount, deposits_count, bet_count, dates, first_deposit_amount)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                u.id_user,
                betRec.grand_total_money,
                rechargeAmount,
                rechargeRec.deposits_count,
                betRec.row_count,
                date,
                first_deposit_amount,
              ]
            );

            rechargeData_record.push({
              totalBetAmount: betRec.grand_total_money,
              totalRechargeAmount: rechargeAmount,
              userId: u.id_user,
              dates: u.time,
              level: u.level,
            });
          }
        }

        // Upsert downline_summary
        const [existingSummary] = await connection.query(
          "SELECT id FROM downline_summary WHERE phone = ? AND DATE(date) = ?",
          [userInfo.phone, date]
        );

        if (existingSummary.length > 0) {
          await connection.query(
            `UPDATE downline_summary SET
               total_first_recharge_count = ?, total_recharge_count = ?, total_recharge_amount = ?,
               total_bet_count = ?, total_bet_amount = ?, better_number = ?, downline_user = ?,
               date = ?, first_deposit_amount = ?
             WHERE phone = ? AND DATE(date) = ?`,
            [
              total_first_recharge_count,
              total_recharge_count,
              total_recharge_amount,
              total_bet_count,
              total_bet_amount,
              better_number,
              JSON.stringify(downline_user),
              date,
              total_first_recharge_amount,
              userInfo.phone,
              date,
            ]
          );
        } else {
          await connection.query(
            `INSERT INTO downline_summary 
               (phone, total_first_recharge_count, total_recharge_count, total_recharge_amount,
                total_bet_count, total_bet_amount, better_number, downline_user, date, first_deposit_amount)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              userInfo.phone,
              total_first_recharge_count,
              total_recharge_count,
              total_recharge_amount,
              total_bet_count,
              total_bet_amount,
              better_number,
              JSON.stringify(downline_user),
              date,
              total_first_recharge_amount,
            ]
          );
        }
      } catch (error) {
        console.error(`Error processing user id: ${ui.id}`, error);
        // Continue to next user instead of aborting the whole batch
      }
    }

    // Dedup summary rows for this date
    await connection.query(
      `DELETE FROM downline_summary
       WHERE id NOT IN (
         SELECT * FROM (
           SELECT MIN(id) FROM downline_summary WHERE DATE(date) = ? GROUP BY phone
         ) AS temp
       ) AND DATE(date) = ?`,
      [date, date]
    );

    return res.status(200).json({
      message: "Downline aggregation completed",
      status: true,
      timeStamp: Date.now(),
    });
  } catch (error) {
    console.error("downlinerecharge_new error:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        message: error.message,
        status: false,
        timeStamp: Date.now(),
      });
    }
  }
};

module.exports = {
  promotion,
  downlinerecharge_new,
};