import connection from "../config/connectDB";
// import jwt from 'jsonwebtoken'
// import md5 from "md5";
import axios from "axios";
import path from 'path';
import fs from 'fs';
// import e from "express";
require('dotenv').config();





const promotion = async (req, res) => {
    try {
        const [allUsers] = await connection.query('SELECT `id` FROM users');
        
        // const [allUsers] = await connection.query('SELECT `id` FROM users WHERE DATE(login_at) BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 MONTH) AND CURDATE()');
        

        for (let ui of allUsers) {
            try {
                let auth = ui.id;
                // let auth = 12906// 12950; 
                //console.log("auth ji", auth);

                if (!auth) {
                    console.warn(`Skipping user with missing auth token`);
                    continue;
                }

                const [user] = await connection.query('SELECT `phone`, `code`, `invite`, `roses_f`, `roses_f1`, `roses_today` FROM users WHERE `id` = ?', [auth]);

                if (!user || user.length === 0) {
                    console.warn(`User not found for token: ${auth}`);
                    continue;
                }

                let userInfo = user[0];
                let selectedData = [];
                let level2to6activeuser = 0;

                let currentDate = timerJoin2(Date.now() - 24 * 60 * 60 * 1000);
                

                async function fetchInvitesByCode(code, depth = 1) {
                    if (depth > 6) return;

                    const [inviteData] = await connection.query('SELECT `id_user`,`name_user`,`phone`, `code`, `invite`, `rank`, `user_level`, `total_money` FROM users WHERE `invite` = ?', [code]);
                    const [activeToday] = await connection.query('SELECT `phone`, `code`, `invite`, `time` FROM users WHERE `invite` = ? AND DATE(`today`) = ?', [code, currentDate]);

                    level2to6activeuser += activeToday.length;

                    for (const invite of inviteData) {
                        selectedData.push(invite);
                        await fetchInvitesByCode(invite.code, depth + 1);
                    }
                }

                const [level1_today_rows] = await connection.query('SELECT `phone`, `code`, `invite`, `time` FROM users WHERE `invite` = ?', [userInfo.code]);
                const [level1_today_rows_today] = await connection.query('SELECT `phone`, `code`, `invite`, `time` FROM users WHERE `invite` = ? AND DATE(`today`) = ?', [userInfo.code, currentDate]);

                let totalDepositCount = 0;
                let totalDepositAmount = 0;
                let firstDepositCount = 0;

                for (const user of level1_today_rows) {
                    await fetchInvitesByCode(user.code);
                    const [deposits] = await connection.query('SELECT `money` FROM `recharge` WHERE `phone` = ? AND DATE(`today`) = ? AND `status` = 1', [user.phone, currentDate]);

                    totalDepositCount += deposits.length;
                    totalDepositAmount += deposits.reduce((sum, dep) => sum + parseFloat(dep.money), 0);
                    if (deposits.length > 0) firstDepositCount++;
                }

                const level2_to_level6_today_rows = selectedData;
                let level2_to_level6totalDepositCount = 0;
                let level2_to_level6totalDepositAmount = 0;
                let level2_to_level6firstDepositCount = 0;

                for (const user of level2_to_level6_today_rows) {
                    const [deposits] = await connection.query('SELECT `money` FROM `recharge` WHERE `phone` = ? AND DATE(`today`) = ? AND `status` = 1', [user.phone, currentDate]);

                    level2_to_level6totalDepositCount += deposits.length;
                    level2_to_level6totalDepositAmount += deposits.reduce((sum, dep) => sum + parseFloat(dep.money), 0);
                    if (deposits.length > 0) level2_to_level6firstDepositCount++;
                }

                const formattedNextDate = new Date().toISOString().split('T')[0];
                const [existingUser] = await connection.query('SELECT `id` FROM `promotion_data` WHERE `phone` = ? AND date(`date`) = ?', [userInfo.phone, currentDate]);

                if (existingUser.length > 0) {
                    await connection.query('UPDATE `promotion_data` SET `direct_register` = ?, `direct_deposit_num` = ?, `direct_deposit_amount` = ?, `direct_deposit_first` = ?, `indirect_register` = ?, `indirect_deposit_num` = ?, `indirect_deposit_amount` = ?, `indirect_deposit_first` = ?, `levelonealltimeactive` = ?, `level2to6alltimeactive` = ? WHERE `phone` = ? AND date(`date`) = ?', [
                        level1_today_rows_today.length, totalDepositCount, totalDepositAmount, firstDepositCount,
                        level2to6activeuser, level2_to_level6totalDepositCount, level2_to_level6totalDepositAmount, level2_to_level6firstDepositCount,
                        level1_today_rows.length, selectedData.length,
                        userInfo.phone, currentDate
                    ]);
                } else {
                    await connection.query('INSERT INTO `promotion_data` (`phone`, `direct_register`, `direct_deposit_num`, `direct_deposit_amount`, `direct_deposit_first`, `indirect_register`, `indirect_deposit_num`, `indirect_deposit_amount`, `indirect_deposit_first`, `levelonealltimeactive`, `level2to6alltimeactive`, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                        userInfo.phone, level1_today_rows_today.length, totalDepositCount, totalDepositAmount, firstDepositCount,
                        level2to6activeuser, level2_to_level6totalDepositCount, level2_to_level6totalDepositAmount, level2_to_level6firstDepositCount,
                        level1_today_rows.length, selectedData.length, currentDate
                    ]);
                }
            } catch (innerError) {
                console.error(`Error processing user token: ${ui.token}`, innerError);
                continue;
            }
        }

        //console.log("All done every thing okay done promo");
        
        return "All done"
    } catch (error) {
        console.error("An error occurred:", error);
    }
};




function timerJoin2(params = '', addHours = 0) {
    let date = params ? new Date(Number(params)) : new Date();
    if (addHours !== 0) {
        date.setHours(date.getHours() + addHours);
    }

    const options = {
        timeZone: 'Asia/Kolkata', // Specify the desired time zone
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // 24-hour format
    };

    const formatter = new Intl.DateTimeFormat('en-GB', options);
    const parts = formatter.formatToParts(date);

    const getPart = (type) => parts.find(part => part.type === type).value;

    const formattedDate = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;

    return formattedDate;
}


const downlinerecharge_new = async (req, res) => {

    const date = timerJoin2(Date.now() - 24 * 60 * 60 * 1000);
    
    
    //  const [allUsers] = await connection.query('SELECT `id` FROM users');  
    const [allUsers] = await connection.query('SELECT `id` FROM users WHERE DATE(login_at) BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 MONTH) AND CURDATE()');
    
    
  
    for (let ui of allUsers) {
      try {
        let auth = ui.id;
        //  let auth= 12906;
        //console.log("auth ui", auth);
      
        if (!auth) {
          return res.status(401).json({
            message: "Unauthorized",
            status: false,
            timeStamp: new Date().getTime(),
          });
        }
      
        const [user] = await connection.query(
          "SELECT `phone`, `code`, `invite` FROM users WHERE `id` = ?",
          [auth]
        );
      
        if (!user.length) {
          return res.status(404).json({
            message: "User not found",
            status: false,
            timeStamp: new Date().getTime(),
          });
        }
      
        const userInfo = user[0];
      
        const [selectedData] = await connection.query(
          `WITH RECURSIVE downline AS (
             SELECT id_user, name_user, phone, code, invite, time, 1 AS level
             FROM users
             WHERE invite = ?
             UNION ALL
             SELECT u.id_user, u.name_user, u.phone, u.code, u.invite, u.time, d.level + 1
             FROM users u
             INNER JOIN downline d ON u.invite = d.code
             WHERE d.level < 6
           )
           SELECT * FROM downline`,
          [userInfo.code]
        );
  
        // Skip if no downline users are found
        if (!selectedData.length) {
          console.log(`No downline users found for invite code: ${userInfo.code}. Skipping...`);
          continue; // Skip to the next user
        }
  
        const userIds = selectedData.map(user => user.id_user);
        const [existingRecords] = userIds.length > 0 
          ? await connection.query(
              `SELECT userId, totalBetAmount, totalRechargeAmount, deposits_count, bet_count, first_deposit_amount
               FROM downline_recharges
               WHERE userId IN (?) AND date(dates) = ?`,
              [userIds, date]
            )
          : [];
      
        const existingMap = new Map(existingRecords.map(record => [record.userId, record]));
      
        let total_first_recharge_count = 0;
        let total_first_recharge_amount = 0;
        let total_recharge_count = 0;
        let total_recharge_amount = 0;
        let total_bet_count = 0;
        let total_bet_amount = 0;
        let better_number = 0;
      
        const rechargeData_record = [];
        const downline_user = selectedData.map(user => ({ userId: user.id_user, level: user.level }));
      
        const newRecords = [];
      
        for (const user of selectedData) {
          const existingRecord = existingMap.get(user.id_user);
      
          if (existingRecord) {
            total_bet_count += existingRecord.bet_count;
            total_recharge_amount += parseFloat(existingRecord.totalRechargeAmount);
            if (existingRecord.deposits_count > 0) total_first_recharge_count++;
            if (existingRecord.totalBetAmount > 0) better_number++;
            total_recharge_count += existingRecord.deposits_count;
            total_bet_amount += parseFloat(existingRecord.totalBetAmount);
            total_first_recharge_amount += parseFloat(existingRecord.first_deposit_amount);
              
              
            //await commissions_send(user.id_user, parseFloat(existingRecord.totalBetAmount));
            
            rechargeData_record.push({
              totalBetAmount: existingRecord.totalBetAmount,
              totalRechargeAmount: existingRecord.totalRechargeAmount,
              userId: user.id_user,
              dates: date,
              level: user.level,
            });
          } else if (!newRecords.some(record => record.id_user === user.id_user)) {
            newRecords.push(user);
          }
        }
      
        if (newRecords.length) {
          const phones = newRecords.map(user => user.phone);
      
          const [combinedData] = await connection.query(
            `SELECT phone,
                    SUM(IFNULL(money, 0)) AS grand_total_money,
                    COUNT(*) AS row_count
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
      
          const phoneMap = new Map(combinedData.map(record => [record.phone, record]));
      
          for (const user of newRecords) {
            const record = phoneMap.get(user.phone) || { grand_total_money: 0, row_count: 0 };
      
            const [rechargeRecord] = await connection.query(
              `SELECT IFNULL(SUM(money), 0) AS grand_total_money
               FROM recharge
               WHERE phone = ? AND status = 1 AND DATE(today) = ? AND isdemo = 0`,
              [user.phone, date]
            );
            
            const [deposits] = await connection.query(
                `
                SELECT COUNT(*) AS row_count
                FROM \`recharge\` 
                WHERE \`phone\` = ? AND \`status\` = 1 AND DATE(\`today\`) = ? AND isdemo = 0
                `,
                [user.phone, date]
            );
      
            const rechargeAmount = parseFloat(rechargeRecord[0].grand_total_money || 0);

            // Fetch the first successful recharge amount
           const [firstRecharge] = await connection.query(
  `SELECT money 
   FROM recharge 
   WHERE phone = ? AND status = 1 AND isdemo = 0 AND DATE(today) = ? 
   ORDER BY id ASC 
   LIMIT 1`,
  [user.phone, date]
);
            
            const first_deposit_amount = firstRecharge.length ? parseFloat(firstRecharge[0].money) : 0;

            
      
            total_bet_count += record.row_count;
            total_recharge_amount += rechargeAmount;
            if (rechargeAmount > 0) total_first_recharge_count++;
            if (record.grand_total_money > 0) better_number++;
            total_recharge_count += deposits[0].row_count;
            total_bet_amount += parseFloat(record.grand_total_money);
            total_first_recharge_amount += first_deposit_amount;
      
            await connection.query(
              `INSERT INTO downline_recharges (userId, totalBetAmount, totalRechargeAmount, deposits_count, bet_count, dates, first_deposit_amount)
              VALUES (?, ?, ?, ?, ?, ?,?)` ,
              [user.id_user, record.grand_total_money, rechargeAmount, deposits[0].row_count, record.row_count, date, first_deposit_amount]
            );
           
            //await commissions_send(user.id_user, parseFloat(record.grand_total_money));
            
            rechargeData_record.push({
              totalBetAmount: record.grand_total_money,
              totalRechargeAmount: rechargeAmount,
              userId: user.id_user,
              dates: user.time,
              level: user.level,
            });
          }
        }
      
        // First, check if the record with the given phone exists
        const [existingRecord] = await connection.query(
          `SELECT * FROM downline_summary WHERE phone = ? AND DATE(date) = ?`,
          [userInfo.phone, date]
        );
        
        // Now check if the record exists
        if (existingRecord.length > 0) {
          // If the record exists, perform the update
          await connection.query(
              `UPDATE downline_summary
               SET 
                 total_first_recharge_count = ?, 
                 total_recharge_count = ?, 
                 total_recharge_amount = ?, 
                 total_bet_count = ?, 
                 total_bet_amount = ?, 
                 better_number = ?, 
                 downline_user = ?, 
                 date = ?,
                 first_deposit_amount = ?
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
                total_first_recharge_amount, //e
                userInfo.phone,
                date
              ]
            );

        } else {
          // If the record doesn't exist, perform the insert
          await connection.query(
              `INSERT INTO downline_summary 
                (phone, total_first_recharge_count, total_recharge_count, total_recharge_amount, total_bet_count, total_bet_amount, better_number, downline_user, date, first_deposit_amount)
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
                total_first_recharge_amount 
              ]
            );

        }
          
          
        
      } catch (error) {
        console.error("Error fetching data:", error);
        return res.status(500).json({
          message: error.message,
          status: false,
          timeStamp: new Date().getTime(),
        });
      }
    }
    
    
    //console.log("All done evryting fine subordinatedata");
    
       await connection.query(`DELETE FROM downline_summary
WHERE id NOT IN (
    SELECT * FROM (
        SELECT MIN(id)
        FROM downline_summary
        WHERE DATE(date) = ?
        GROUP BY phone
    ) AS temp
) AND DATE(date) = ?`,[date,date]);

    
    
  };

module.exports = {
    promotion,
    downlinerecharge_new,
}

