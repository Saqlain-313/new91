import connection from "../config/connectDB";
const { uploadImage } = require("../utils/uploadImage");
const md5 = require("md5");
import request from "request";
import axios from "axios"


exports.depositNotReceived = async (req, res) => {
    try {
         console.log(req.body);
        const { UTRNumber, ReceiverUPIID, id_order,money, OrderAmount,token,uid } =   req.body;
        console.log(UTRNumber ,ReceiverUPIID,id_order,OrderAmount)

        const [results] = await connection.query("SELECT phone, id_user FROM users WHERE id_user = ?", [uid]);

        if (results.length === 0) {
            return res.status(400).json({ message: "User does not exist", success: false });
        }

        const phone = results[0].phone; 
        console.log(phone, "this is phone number");

        if (!UTRNumber || !ReceiverUPIID || !id_order || !money) {
            return res.status(400).json({ message: "All fields are required", success: false });
        }

        let proof1Url = null;
        let proof2Url = null;

        if (req.files) {
            if (req.files.proof1) {
                proof1Url = await uploadImage(req.files.proof1);
            }
            if (req.files.proof2) {
                proof2Url = await uploadImage(req.files.proof2);
            }
        }
// //console.log("ddd",req.files,proof2Url)

        const saveData  =  await connection.query(` INSERT INTO DepositNotReceived 
            (userId,UTRNumber, ReceiverUPIID, OrderNumber, OrderAmount, proof1, proof2,phone)
            VALUES (?,?, ?, ?, ?, ?, ?,?)` ,  [results[0].id_user, UTRNumber, ReceiverUPIID, id_order, money, proof1Url, proof2Url,phone])
        
          return res.status(200).json({
          success:true,
          message:"details update successfully"

        })


    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Server error", success: false, error: error.message });
    }
};

//withdrawl problems 

exports.withdrawlProblems = async(req,res)=>{
  try{
          
          const { auth, BankName, ifsccode, AccountNumber, UsdtAddress, ProblemDescription, OrderNumber, OrderAmount } = req.body;

          const [results] = await connection.query("SELECT phone FROM users WHERE token = ?", [auth]);

          if (results.length === 0) {
            return res.status(400).json({ message: "User does not exist", success: false });
          }

         const phone = results[0].phone; 
         console.log(phone, "this is phone number");


         let proof1Url = null;
        let proof2Url = null;

        if (req.files) {
            if (req.files.proof1) {
                proof1Url = await uploadImage(req.files.proof1);
            }
            if (req.files.proof2) {
                proof2Url = await uploadImage(req.files.proof2);
            }
        }


         await connection.query(`INSERT INTO withdrawlProblem (phone, BankName, ifsccode, AccountNumber, UsdtAddress, ProblemDescription, OrderNumber, OrderAmount, proof1, proof2)
          VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            
            phone || null, 
            BankName || null, 
            ifsccode || null, 
            AccountNumber || null, 
            UsdtAddress || null, 
            ProblemDescription || null, 
            OrderNumber || null, 
            OrderAmount || null, 
            proof1Url || null, 
            proof2Url || null
        ])


        return res.status(200).json({
              success:true,
              message:"Problem update successfully"
        })


        

  }
  catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Server error", success: false, error: error.message });
  }

  
}




//ifsc-modification 

exports.ifscModification = async (req, res) => {
    try {
        const {BankNumber,IFSCCode,auth} = req.body;

        const [results] = await connection.query("SELECT phone FROM users WHERE token = ?", [auth]);

        if (results.length === 0) {
            return res.status(400).json({ message: "User does not exist", success: false });
        }

        const phone = results[0].phone; 
        console.log(phone, "this is phone number");

        if (!BankNumber || !IFSCCode) {
            return res.status(400).json({ message: "Both BankNumber and IFSCCode are required", success: false });
        }
        
        const [resultss] = await connection.query("SELECT * FROM user_bank WHERE phone = ?", [results[0].phone]);

  if (resultss.length === 0) {
            return res.status(400).json({ message: "Please add bank", success: false });
        }


   await connection.query(
  "UPDATE user_bank SET stk = ?, email = ? WHERE phone = ?",
  [BankNumber, IFSCCode, results[0].phone]
);

// //console.log("jjjjj",BankNumber, IFSCCode, results[0].phone)
        const saveIfsc  =  await connection.query(`INSERT INTO IFSCModification (BankNumber, IFSCCode,phone) VALUES (?,?,?)`,[BankNumber, IFSCCode,phone])

        return res.status(200).json({
          success:true,
          message:"details update successfully"

        })


    } catch (error) {
        return res.status(500).json({ message: "Server error", success: false, error: error.message });
    }
};



//-->Bank Name 


exports.bankName = async (req, res) => {
  try {

      // const { stk, name_bank, name_user, sdt, tp, email, tinh, chi_nhanh,auth } = req.body;
      const{BankNumber ,BankName,auth } = req.body
      console.log(req.body);

      const [results] = await connection.query("SELECT phone FROM users WHERE token = ?", [auth]);

      if (results.length === 0) {
            return res.status(400).json({ message: "User does not exist", success: false });
        }

      const phone = results[0].phone; 
      console.log(phone, "this is phone number");


      // Validate required fields
     // stk-accsdt-ifsc-code
      if (!BankNumber || !BankName) {
          return res.status(400).json({ 
              message: "stk, name_bank, phone, name_user, and sdt are required", 
              success: false 
          });
      }

      const saveBank   =  await connection.query(`UPDATE user_bank SET  name_bank=? WHERE phone=? AND stk=?` , [
            BankName, phone ,BankNumber
           
        ])

      return res.status(200).json({
        success:true,
        message:"details update successfully"

      })

  } catch (error) {
      res.status(500).json({ 
          message: "Server error", 
          success: false, 
          error: error.message 
      });
  }
};




//-->Bank Modification 
exports.bankModification = async (req, res) => {
    try {
        const {
            BankName, OldBankName, OldBeneficiaryName, OldAccountNumber,
            OldIFSCCode, NewBankName, NewBeneficiaryName, NewAccountNumber, NewIFSCCode,auth
        } = req.body;

        const [results] = await connection.query("SELECT phone FROM users WHERE token = ?", [auth]);

        if (results.length === 0) {
            return res.status(400).json({ message: "User does not exist", success: false });
        }

        const phone = results[0].phone; 
        console.log(phone, "this is phone number");

        if (!BankName || !OldBankName || !OldBeneficiaryName || !OldAccountNumber || 
            !OldIFSCCode || !NewBankName || !NewBeneficiaryName || !NewAccountNumber || !NewIFSCCode) {
            return res.status(400).json({ message: "All required fields must be provided", success: false });
        }

        // Upload files using uploadImage function
        const identityCard = req.files?.IdentityCard ? await uploadImage(req.files.IdentityCard) : null;
        const oldPassbook = req.files?.OldPassbook ? await uploadImage(req.files.OldPassbook) : null;
        const newPassbook = req.files?.NewPassbook ? await uploadImage(req.files.NewPassbook) : null;
        const latestDeposit = req.files?.LatestDeposit ? await uploadImage(req.files.LatestDeposit) : null;


        const modifyBank =  await connection.query(` INSERT INTO BankModification (
                BankName, OldBankName, OldBeneficiaryName, OldAccountNumber, OldIFSCCode,
                NewBankName, NewBeneficiaryName, NewAccountNumber, NewIFSCCode,
                IdentityCard, OldPassbook, NewPassbook, LatestDeposit,phone
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?)` ,  [
              BankName, OldBankName, OldBeneficiaryName, OldAccountNumber, OldIFSCCode,
              NewBankName, NewBeneficiaryName, NewAccountNumber, NewIFSCCode,
              identityCard, oldPassbook, newPassbook, latestDeposit,phone
          ])

        return res.status(200).json({
             success:true,
             message:"modify bank details successfully"
        })

       
       
    } catch (error) {
        res.status(500).json({ message: "Server error", success: false, error: error.message });
    }
};



//USDT-Address

//Tiranga ID , USDT Address , Address Screenshot,Identity Card,Passbook ,LatestDeposit
exports.addUSDTAddress = async (req, res) => {
    try {
        const { TirangaID, USDTWalletAddress ,auth } = req.body;
        console.log(auth , "tokenddd");

        // const query1 =   `SELECT phone From  users  WHERE token = ?`

        const [results] = await connection.query("SELECT phone FROM users WHERE token = ?", [auth]);

        if (results.length === 0) {
            return res.status(400).json({ message: "User does not exist", success: false });
        }

        const phone = results[0].phone; 
        console.log(phone, "this is phone number");

        if (!TirangaID || !USDTWalletAddress) {
            return res.status(400).json({ message: "TirangaID and USDTWalletAddress are required", success: false });
        }

        // Upload images using uploadImage function
        const addressScreenshot = req.files?.AddressScreenshot ? await uploadImage(req.files.AddressScreenshot) : null;
        const identityCard = req.files?.IdentityCard ? await uploadImage(req.files.IdentityCard) : null;
        const passbook = req.files?.Passbook ? await uploadImage(req.files.Passbook) : null;
        const latestDeposit = req.files?.LatestDeposit ? await uploadImage(req.files.LatestDeposit) : null;

        // Insert into the database

         await connection.query( `
          INSERT INTO USDTAddress (
              TirangaID, USDTWalletAddress, AddressScreenshot, IdentityCard, Passbook, LatestDeposit ,phone
          ) VALUES (?, ?, ?, ?, ?, ? , ?)` , [
            TirangaID, USDTWalletAddress, addressScreenshot, identityCard, passbook, latestDeposit,phone
        ])


       

        return res.status(200).json({
             success:true,
             message:"details update successfully"

        })

    } catch (error) {
        res.status(500).json({ message: "Server error", success: false, error: error.message });
    }
};



//activity-bonus 
//content , Tiranga ID , winningrecord

exports.addBonus = async (req, res) => {
    try {
        const { TirangaID, content,auth} = req.body;
        const [results] = await connection.query("SELECT phone FROM users WHERE token = ?", [auth]);

        if (results.length === 0) {
            return res.status(400).json({ message: "User does not exist", success: false });
        }

        const phone = results[0].phone; 
        console.log(phone, "this is phone number");

        if (!TirangaID || !content) {
            return res.status(400).json({ message: "TirangaID and content are required", success: false });
        }

        if (content.length > 500) {
            return res.status(400).json({ message: "Content cannot exceed 500 characters", success: false });
        }

        // Upload winning record image
        console.log(req.files?.winningRecord)
        const winningRecord = req.files?.winningRecord ? await uploadImage(req.files.winningRecord) : null;

        
        const saveBonus  =  await connection.query(` INSERT INTO bonus (TirangaID, content, winningRecord,phone) 
            VALUES (?, ?, ?,?)` ,[TirangaID, content, winningRecord,phone])

        return res.status(200).json({
          success:true,
          message:"details update successfully"

     })



    } catch (error) {
        res.status(500).json({ message: "Server error", success: false, error: error.message });
    }
};

function timerJoin2(params = "", addHours = 0) {
  let date = params ? new Date(Number(params)) : new Date();
  if (addHours !== 0) {
    date.setHours(date.getHours() + addHours);
  }

  const options = {
    timeZone: "Asia/Kolkata", // Specify the desired time zone
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // 24-hour format
  };

  const formatter = new Intl.DateTimeFormat("en-GB", options);
  const parts = formatter.formatToParts(date);

  const getPart = (type) => parts.find((part) => part.type === type).value;

  const formattedDate = `${getPart("year")}-${getPart("month")}-${getPart(
    "day"
  )} ${getPart("hour")}:${getPart("minute")}:${getPart("second")}`;

  return formattedDate;
}



//Problems 
//Content , photo 
exports.addProblem = async (req, res) => {
    try {
        const { Content,auth } = req.body ;

        const [results] = await connection.query("SELECT phone FROM users WHERE token = ?", [auth]);

        if (results.length === 0) {
            return res.status(400).json({ message: "User does not exist", success: false });
        }

        const phone = results[0].phone; 
        // console.log(phone, "this is phone number");

        if (!Content) {
            return res.status(400).json({ message: "Content is required", success: false });
        }

        if (Content.length > 500) {
            return res.status(400).json({ message: "Content cannot exceed 500 characters", success: false });
        }

        // Upload Photo (if provided)
        console.log(req.files?.Photo )
        const Photo = req.files?.Photo ? await uploadImage(req.files.Photo) : null;


const checktime=timerJoin2(Date.now())
        // if(!Photo)
        // {
        //     return res.status(400).json({ message: "Photo is required", success: false }); 
        // }

        // Insert into database

        const saveProblem  =  await connection.query(`INSERT INTO problems (Content,Photo,phone,time) VALUES (?, ?,?,?)`,[Content, Photo,phone,checktime])
       

        return res.status(200).json({
             success:true,
             message:"add problem successsfully"
        })

      

    } catch (error) {
        res.status(500).json({ message: "Server error", success: false, error: error.message });
    }
};



// update

//sendOtp , function 
let generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
};


exports.sendOtp = async (req, res) => {              
    const { phone } = req.body;
      let now = new Date().getTime();
    let timeEnd = +new Date() + 1000 * (60 * 2 + 0) + 500;
    try {
    //   console.log(phone);
      
      if (!phone || typeof phone !== "string") {
        return res.status(400).json({
          message: "Phone number is required and must be a valid string",
        });
      }
  
      let otp = generateOTP();
  
      // Check if the user exists in the database
    const [rows]=await connection.query("SELECT * FROM users WHERE phone = ?", [phone]);
     if (rows.length == 0) {
      return res.status(200).json({
        message: "Account does not exist",
        status: false,
      });
    } else {
      let user = rows[0];
      if (user.time_otp - now <= 0) {
            const params = {
      numbers: phone,
           variables_values: otp,
      sender_id:55
    }
  
      const { data } = await axios.post("https://blacksms.in/sms", params, {
        headers: {
            'Authorization': '8f7b73d4df107001bdfc143ddcbbb0b9',
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });
   
    //console.log("ddd",data)
if(data.status===1){
  await connection.execute(
    "UPDATE users SET otp = ?, time_otp = ? WHERE phone = ? ",
    [otp, timeEnd, phone]
  );
            return res.status(200).json({
              message: "otp send successfully",
              status: true,
              timeEnd: timeEnd,
            });
            
          }else{
             return res.status(200).json({
              message: data.message,
              status: true,
              timeEnd: timeEnd,
            });
          }
      } else {
        return res.status(200).json({
          message: "Send SMS regularly",
          status: false,
        });
      }
    }
    
      
    } catch (error) {
      return res.status(500).json({
        message: "Failed to send OTP",
        error: error.message,
      });
    }
};



// - password 


exports.updatePassword = async (req, res) => {
  try {
    const { phone, otp, password } = req.body;

    if (!phone || !otp || !password) {
      return res.status(400).json({
        message: "Phone number, OTP, and password are required",
        success: false,
      });
    }

    // Check if user exists
   const [results]=await connection.query("SELECT * FROM users WHERE phone = ?", [phone])

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found", success: false });
      }

      const user = results[0];

      // Check if OTP matches
      if (user.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP", success: false });
      }

      // Hash password using md5
      const hashedPassword = md5(password);

      // Update password in the database
     await connection.query(
        "UPDATE users SET password = ?, plain_password = ? WHERE phone = ?",
        [hashedPassword, password, phone])
        
          return res.status(200).json({
            message: "Password updated successfully",
            success: true,
          });
   
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

//update password2
exports.updatePassword2 = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        message: "Phone number and password are required",
        success: false,
      });
    }

    // Check if user exists
   const [results]=await connection.query("SELECT * FROM users WHERE phone = ?", [phone])

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found", success: false });
      }

      // Hash password using md5
      const hashedPassword = md5(password);

      // Update password in the database
    await  connection.query(
        "UPDATE users SET password = ?, plain_password = ? WHERE phone = ?",
        [hashedPassword, password, phone])
          return res.status(200).json({
            message: "Password updated successfully",
            success: true
          });
    
    
    
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};




//get apis 
//deposit not received
exports.getDepositNotReceived = async (req, res) => {
  try {
      const query = `SELECT * FROM DepositNotReceived WHERE status=0 ORDER BY id DESC`;

          const [results]= await connection.query(query)
          return res.status(200).json({
              message: "Deposit records retrieved successfully",
              success: true,
              data: results
          });

  } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ 
          message: "Server error", 
          success: false, 
          error: error.message 
      });
  }
};


exports.getifscModification   = async(req,res)=>{
   try{

        const query =  `SELECT * FROM IFSCModification  WHERE status=0 ORDER BY id DESC`

      const [results]=await  connection.query(query )

           return res.status(200).json({
            message: " records retrieved successfully",
            success: true,
            data: results
          });

}
   catch(error)
   {   
      return res.status(500).json({ 
        message: "Server error", 
        success: false, 
        error: error.message 
      });  
   
   }
}






exports.getUserBank = async (req, res) => {
  try {
    const query = `SELECT * FROM user_bank WHERE status=0 ORDER BY id DESC`;
    const [results] = await connection.query(query);

    return res.status(200).json({
      message: "Records retrieved successfully",
      success: true,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

exports.getBankModification = async (req, res) => {
  try {
    const query = `SELECT * FROM BankModification WHERE status=0 ORDER BY id DESC`;
    const [results] = await connection.query(query);

    return res.status(200).json({
      message: "Records retrieved successfully",
      success: true,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

exports.bonusDetails = async (req, res) => {
  try {
    const query = `SELECT * FROM bonus WHERE status=0 ORDER BY id DESC`;
    const [results] = await connection.query(query);

    return res.status(200).json({
      message: "Records retrieved successfully",
      success: true,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

exports.problemsDetails = async (req, res) => {
  try {
    const query = `SELECT * FROM problems WHERE status=0 ORDER BY id DESC`;
    const [results] = await connection.query(query);

    return res.status(200).json({
      message: "Records retrieved successfully",
      success: true,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};


exports.getUserProblems = async (req, res) => {
       const { auth } = req.params ;

      
  try {
        const [results] = await connection.query("SELECT phone FROM users WHERE token = ?", [auth]);

        if (results.length === 0) {
            return res.status(400).json({ message: "User does not exist", success: false });
        }
        
    const query = `SELECT * FROM problems WHERE phone=? ORDER BY id DESC`;
    const [resultss] = await connection.query(query,[results[0].phone]);

    return res.status(200).json({
      message: "Records retrieved successfully",
      success: true,
      data: resultss,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};




exports.getUsdtAddress = async (req, res) => {
  try {
    const query = "SELECT * FROM USDTAddress WHERE status=0 ORDER BY id DESC";
    
    // Using async/await with connection.promise() to avoid callbacks
    const [results] = await connection.query(query);

    if (!results.length) {
      return res.status(404).json({
        message: "No USDT addresses found",
        success: false,
        data: [],
      });
    }

    return res.status(200).json({
      message: "Records retrieved successfully",
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};
























//depositAcceptOrReject
exports.depositAcceptOrReject = async (req, res) => {
  try {
    const { status, id } = req.params;

    //console.log("jjoki",id)
    const validStatuses = ["accepted", "rejected"];
    const normalizedStatus = status.toLowerCase().trim();
    
    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        message: "Invalid status. Use 'accepted' or 'rejected'",
        success: false,
      });
    }

  const [results]=await  connection.query(
      "SELECT * FROM DepositNotReceived WHERE id = ? AND status = 0",
      [id])

        if (results.length === 0) {
          return res.status(404).json({
            message: "Record not found or already processed",
            success: false,
          });
        }

        const newStatus = normalizedStatus === "accepted" ? 1 : 2;

     await   connection.query(
          "UPDATE DepositNotReceived SET status = ? WHERE id = ?",
          [newStatus, id])
          
      return res.status(200).json({
              message: `Record updated successfully to ${normalizedStatus}`,
              success: true,
            });
            
  } catch (error) {
    //console.log("dddd",error)
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};


// problems
exports.problemAcceptOrReject = async (req, res) => {
  try {
    const { status, id } = req.params;
    const {remark}=req.body
    const validStatuses = ["accepted", "rejected"];
    const normalizedStatus = status.toLowerCase().trim();
console.log("er",remark,req.body)
    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        message: "Invalid status. Use 'accepted' or 'rejected'",
        success: false,
      });
    }

    const results = await connection.query(
      "SELECT * FROM problems WHERE id = ? AND status = 0",
      [id]
    );

    if (results.length === 0) {
      return res.status(404).json({
        message: "Record not found or already processed",
        success: false,
      });
    }

    const newStatus = normalizedStatus === "accepted" ? 1 : 2;

    await connection.query(
      "UPDATE problems SET remark=?, status = ? WHERE id = ?",
      [remark,newStatus, id]
    );

    return res.status(200).json({
      message: `Record updated successfully to ${normalizedStatus}`,
      success: true,
    });
  } catch (error) {
    //console.log("Error in problemAcceptOrReject:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

// depositAcceptOrReject
exports.depositAcceptOrReject = async (req, res) => {
  try {
    const { status, id } = req.params;
    const validStatuses = ["accepted", "rejected"];
    const normalizedStatus = status.toLowerCase().trim();

    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        message: "Invalid status. Use 'accepted' or 'rejected'",
        success: false,
      });
    }

    const results = await connection.query(
      "SELECT * FROM DepositNotReceived WHERE id = ? AND status = 0",
      [id]
    );

    if (results.length === 0) {
      return res.status(404).json({
        message: "Record not found or already processed",
        success: false,
      });
    }

    const newStatus = normalizedStatus === "accepted" ? 1 : 2;

    await connection.query(
      "UPDATE DepositNotReceived SET status = ? WHERE id = ?",
      [newStatus, id]
    );

    return res.status(200).json({
      message: `Record updated successfully to ${normalizedStatus}`,
      success: true,
    });
  } catch (error) {
    //console.log("Error in depositAcceptOrReject:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

// modifyBankAcceptorReject
exports.modifyBankAcceptorReject = async (req, res) => {
  try {
    const { status, id } = req.params;
    const validStatuses = ["accepted", "rejected"];
    const normalizedStatus = status.toLowerCase().trim();

    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        message: "Invalid status. Use 'accepted' or 'rejected'",
        success: false,
      });
    }

    const results = await connection.query(
      "SELECT * FROM BankModification WHERE id = ? AND status = 0",
      [id]
    );

    if (results.length === 0) {
      return res.status(404).json({
        message: "Record not found or already processed",
        success: false,
      });
    }

    const newStatus = normalizedStatus === "accepted" ? 1 : 2;

    await connection.query(
      "UPDATE BankModification SET status = ? WHERE id = ?",
      [newStatus, id]
    );

    return res.status(200).json({
      message: `Record updated successfully to ${normalizedStatus}`,
      success: true,
    });
  } catch (error) {
    //console.log("Error in modifyBankAcceptorReject:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

// addressAcceptOrReject
exports.addressAcceptOrReject = async (req, res) => {
  try {
    const { status, id } = req.params;
    const normalizedStatus = status.toLowerCase().trim();

    const results = await connection.query(
      "SELECT * FROM USDTAddress WHERE id = ? AND status = 0",
      [id]
    );

    if (results.length === 0) {
      return res.status(404).json({
        message: "Record not found or already processed",
        success: false,
      });
    }

    const newStatus = normalizedStatus === "accepted" ? 1 : 2;

    await connection.query(
      "UPDATE USDTAddress SET status = ? WHERE id = ?",
      [newStatus, id]
    );

    return res.status(200).json({
      message: "Record updated successfully",
      success: true,
    });
  } catch (error) {
    //console.log("Error in addressAcceptOrReject:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

// bonusAcceptOrReject
exports.bonusAcceptOrReject = async (req, res) => {
  try {
    const { status, id } = req.params;
    const validStatuses = ["accepted", "rejected"];
    const normalizedStatus = status.toLowerCase().trim();

    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        message: "Invalid status. Use 'accepted' or 'rejected'",
        success: false,
      });
    }

    const results = await connection.query(
      "SELECT * FROM bonus WHERE id = ? AND status = 0",
      [id]
    );

    if (results.length === 0) {
      return res.status(404).json({
        message: "Record not found or already processed",
        success: false,
      });
    }

    const newStatus = normalizedStatus === "accepted" ? 1 : 2;

    await connection.query(
      "UPDATE bonus SET status = ? WHERE id = ?",
      [newStatus, id]
    );

    return res.status(200).json({
      message: `Record updated successfully to ${normalizedStatus}`,
      success: true,
    });
  } catch (error) {
    //console.log("Error in bonusAcceptOrReject:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};




exports.getwithdrawlProblems = async (req, res) => {
  try {
    const st = 0;
    const [problems] = await connection.query("SELECT * FROM withdrawlProblem WHERE status = ?", [st]);

    if (!problems || problems.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No withdrawal problems found",
      });
    }

    return res.status(200).json({
      success: true,
      data: problems, // Returns all matching entries
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};





// withdrawlProblemsAcceptOrReject
exports.withdrawlProblemsAcceptOrReject = async (req, res) => {
  try {
    const { status, id } = req.params;
    const validStatuses = ["accepted", "rejected"];
    const normalizedStatus = status.toLowerCase().trim();

    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        message: "Invalid status. Use 'accepted' or 'rejected'",
        success: false,
      });
    }

    // Validate ID (Ensure it's a valid number)
    if (!id || isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        message: "Invalid ID parameter.",
        success: false,
      });
    }

    const results = await connection.query(
      "SELECT * FROM withdrawlProblem WHERE id = ? AND status = 0",
      [id]
    );

    if (!results || results.length === 0) {
      return res.status(404).json({
        message: "Record not found or already processed",
        success: false,
      });
    }

    const newStatus = normalizedStatus === "accepted" ? 1 : 2;

    await connection.query("UPDATE withdrawlProblem SET status = ? WHERE id = ?", [
      newStatus,
      id,
    ]);

    return res.status(200).json({
      message: `Record updated successfully to ${normalizedStatus}`,
      success: true,
    });
  } catch (error) {
    //console.log("Error in withdrawlProblemsAcceptOrReject:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

exports.getRecharge = async (req, res) => {
  try {
    const { auth } = req.params;
    //console.log("Auth Token:", auth);

    const [results] = await connection.query(
      "SELECT phone FROM users WHERE `token` = ?",
      [auth]
    );

    if (results.length === 0) {
      return res.status(400).json({
        message: "User does not exist",
        success: false,
      });
    }

    const phone = results[0].phone;

    const [rechargeDetails] = await connection.query(
      `SELECT * FROM recharge WHERE phone = ?`,
      [phone]
    );

    if (rechargeDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No recharge records found",
      });
    }

    return res.status(200).json({
      success: true,
      data: rechargeDetails,
    });
  } catch (error) {
    console.error("Error in getRecharge:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};



exports.getwithdrawl2  = async(req,res)=>{
  try{   
        
        const {auth} = req.params ;
 
        const [results] = await connection.query("SELECT phone FROM users WHERE `token` = ?",[auth]);

        if (results.length === 0) {
            return res.status(400).json({ message: "User does not exist", success: false });
        }

        const phone = results[0].phone;

        const st = 0 ;
        const [rechargeDetails] = await connection.query(`SELECT * FROM withdraw where phone=? AND status=?`,[phone,st]) 


        if(rechargeDetails.length === 0)
        {
          return res.status(404).json({
            success: false,
            message: "No withdrawal problems found",
          });
        }


        return res.status(200).json({
          success: true,
          data: rechargeDetails, // Returns all matching entries
        });

  }
  catch(error)
  { 
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });

  }
}

