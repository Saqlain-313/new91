const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
import connection from "../config/connectDB";


// Configure file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../client/public/upload')); // Ensure absolute path
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});


// File filter for security
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

// Multer upload middleware
exports.upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
}).fields([
  { name: 'identity_video', maxCount: 1 },
  { name: 'identity_card', maxCount: 1 },
  { name: 'passbook', maxCount: 1 },
  { name: 'deposit_proof1', maxCount: 1 },
  { name: 'deposit_proof2', maxCount: 1 }
]);



exports.upload_Retrieve_Login = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
}).fields([
  { name: 'identity_video', maxCount: 1 },
  { name: 'identity_card', maxCount: 1 },
  { name: 'passbook_path', maxCount: 1 },
  { name: 'deposit_receipt_path', maxCount: 1 },
]);

exports.uploadGameProblem = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
  { name: 'video_path', maxCount: 1 }
]);

// Controller function for submitting game problems
exports.submitGameProblem = async (req, res) => {
  try {
    const { games_id, issue_description } = req.body;
    const files = req.files;

    const filePaths = {
      photo: files.photo?.[0]?.filename ? `/upload/${files.photo[0].filename}` : '',
      pdf: files.pdf?.[0]?.filename ? `/upload/${files.pdf[0].filename}` : '',
      video_path: files.video_path?.[0]?.filename ? `/upload/${files.video_path[0].filename}` : '',
    };

    const query = `
      INSERT INTO game_problems (
        games_id,
        issue_description,
        photo_path,
        pdf_path,
        video_path,
      ) VALUES (?, ?, ?, ?, ?)
    `;

    const [results] = await connection.execute(query, [
      tiranga_id || null,
      issue_description || null,
      filePaths.photo || null,
      filePaths.pdf || null,
      filePaths.video_path || null,
    ]);

    res.status(201).json({ message: 'Game problem submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Controller to handle form submission
exports.submit_Retrieve_Login = async (req, res) => {
  try {
    const { games_id, ifsc_code, bank_account_number, email } = req.body;
    const files = req.files;

    const filePaths = {
      identity_video: files.identity_video?.[0]?.filename ? `/upload/${files.identity_video[0].filename}` : '',
      identity_card: files.identity_card?.[0]?.filename ? `/upload/${files.identity_card[0].filename}` : '',
      passbook_path: files.passbook_path?.[0]?.filename ? `/upload/${files.passbook_path[0].filename}` : '',
      deposit_receipt_path: files.deposit_receipt_path?.[0]?.filename ? `/upload/${files.deposit_receipt_path[0].filename}` : '', 
    };

    const query = `
      INSERT INTO user_verifications_id (
        games_id,
        ifsc_code,
        bank_account_number,
        email,
        identity_video_path,
        identity_card_path,
        passbook_path, 
        deposit_receipt_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [results] = await connection.execute(query, [
      games_id || null,
      ifsc_code || null,
      bank_account_number || null,
      email || null,
      filePaths.identity_video || null,
      filePaths.identity_card || null,
      filePaths.passbook_path || null,
      filePaths.deposit_receipt_path || null,
    ]);

    res.status(201).json({ message: 'Bank verification submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Controller function to handle form submission
exports.submitVerification = async (req, res) => {
  try {
    console.log('Files:', req.files);
    console.log('Body:', req.body);

    const { games_id, password, phone_number } = req.body;
    const files = req.files;

    const filePaths = {
      identity_card: files.identity_card?.[0]?.filename ? `/upload/${files.identity_card[0].filename}` : '',
      passbook: files.passbook?.[0]?.filename ? `/upload/${files.passbook[0].filename}` : '',
      deposit_proof1: files.deposit_proof1?.[0]?.filename ? `/upload/${files.deposit_proof1[0].filename}` : '',
      deposit_proof2: files.deposit_proof2?.[0]?.filename ? `/upload/${files.deposit_proof2[0].filename}` : null,
      identity_video: files.identity_video?.[0]?.filename ? `/upload/${files.identity_video[0].filename}` : ''
    };

    
    
    //console.log("filePaths" , filePaths);
    
    const query = `
      INSERT INTO user_verifications (
        games_id, 
        password, 
        phone_number,
        identity_card_path,
        passbook_path,
        deposit_proof1_path,
        deposit_proof2_path,
        identity_video_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [results] = await connection.execute(query, [
      games_id || null,
      password || null,
      phone_number || null,
      filePaths.identity_card || null,
      filePaths.passbook || null,
      filePaths.deposit_proof1 || null,
      filePaths.deposit_proof2 || null,
      filePaths.identity_video || null
    ]);

    res.status(201).json({ message: 'Verification submitted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
