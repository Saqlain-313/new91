const path = require('path');
const multer = require('multer');
import connection from "../config/connectDB";

// ==================== STORAGE CONFIG ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../client/public/upload'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const uploadLimits = { fileSize: 50 * 1024 * 1024 }; // 50MB

// ==================== MULTER MIDDLEWARE ====================
exports.upload = multer({ storage, fileFilter, limits: uploadLimits }).fields([
  { name: 'identity_video', maxCount: 1 },
  { name: 'identity_card', maxCount: 1 },
  { name: 'passbook', maxCount: 1 },
  { name: 'deposit_proof1', maxCount: 1 },
  { name: 'deposit_proof2', maxCount: 1 },
]);

exports.upload_Retrieve_Login = multer({ storage, fileFilter, limits: uploadLimits }).fields([
  { name: 'identity_video', maxCount: 1 },
  { name: 'identity_card', maxCount: 1 },
  { name: 'passbook_path', maxCount: 1 },
  { name: 'deposit_receipt_path', maxCount: 1 },
]);

exports.uploadGameProblem = multer({ storage, fileFilter, limits: uploadLimits }).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
  { name: 'video_path', maxCount: 1 },
]);

// ==================== HELPERS ====================
const fileUrl = (files, field) =>
  files?.[field]?.[0]?.filename ? `/upload/${files[field][0].filename}` : null;

// ==================== CONTROLLERS ====================

// Submit game problem
exports.submitGameProblem = async (req, res) => {
  try {
    const { games_id, issue_description } = req.body;
    const files = req.files || {};

    const query = `
      INSERT INTO game_problems (
        games_id,
        issue_description,
        photo_path,
        pdf_path,
        video_path
      ) VALUES (?, ?, ?, ?, ?)
    `;

    await connection.execute(query, [
      games_id || null,
      issue_description || null,
      fileUrl(files, 'photo'),
      fileUrl(files, 'pdf'),
      fileUrl(files, 'video_path'),
    ]);

    return res.status(201).json({ message: 'Game problem submitted successfully' });
  } catch (error) {
    console.error('submitGameProblem error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Submit bank/retrieve login verification
exports.submit_Retrieve_Login = async (req, res) => {
  try {
    const { games_id, ifsc_code, bank_account_number, email } = req.body;
    const files = req.files || {};

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

    await connection.execute(query, [
      games_id || null,
      ifsc_code || null,
      bank_account_number || null,
      email || null,
      fileUrl(files, 'identity_video'),
      fileUrl(files, 'identity_card'),
      fileUrl(files, 'passbook_path'),
      fileUrl(files, 'deposit_receipt_path'),
    ]);

    return res.status(201).json({ message: 'Bank verification submitted successfully' });
  } catch (error) {
    console.error('submit_Retrieve_Login error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Submit general verification
exports.submitVerification = async (req, res) => {
  try {
    const { games_id, password, phone_number } = req.body;
    const files = req.files || {};

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

    await connection.execute(query, [
      games_id || null,
      password || null,
      phone_number || null,
      fileUrl(files, 'identity_card'),
      fileUrl(files, 'passbook'),
      fileUrl(files, 'deposit_proof1'),
      fileUrl(files, 'deposit_proof2'),
      fileUrl(files, 'identity_video'),
    ]);

    return res.status(201).json({ message: 'Verification submitted successfully' });
  } catch (error) {
    console.error('submitVerification error:', error);
    return res.status(500).json({ error: error.message });
  }
};