import request from "request";
import crypto from "crypto";
import connection from "../config/connectDB";

// ==================== CONFIG ====================
const pid = process.env.TOPBET_PID || "TBTEST";
const appKey = process.env.TOPBET_APP_KEY || "87F5E9F3BA234A9EA58444DF1D67299B";
const API_URL = "https://tsdc.topbetgame.com/api/ChessGame";

// ==================== HELPERS ====================
function curlApiInfo(url, postData) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
    body: postData,
  };

  return new Promise((resolve, reject) => {
    request(url, options, (error, response, body) => {
      if (error) {
        reject({ status: 0, data: "CURL Error String: " + error.message });
      } else {
        resolve({ status: 1, data: body, header: response.statusCode });
      }
    });
  });
}

// Encrypt with AES-128-CBC (key = IV = first 16 chars of appKey)
function encryptData(obj) {
  const cipher = crypto.createCipheriv(
    "aes-128-cbc",
    appKey.substring(0, 16),
    appKey.substring(0, 16)
  );
  let encrypted = cipher.update(JSON.stringify(obj), "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
}

function decryptData(encoded) {
  const decoded = decodeURIComponent(encoded);
  const decipher = crypto.createDecipheriv(
    "aes-128-cbc",
    appKey.substring(0, 16),
    appKey.substring(0, 16)
  );
  let decrypted = decipher.update(decoded, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
}

// Call TopBetGame API and return parsed response, or null on failure
const topbetgame = async (params, method) => {
  try {
    // Sort keys alphabetically (required by signature spec)
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});

    const encrypted = encryptData(sortedParams);

    const postData = JSON.stringify({
      pid,
      method,
      ver: "1.0.0",
      data: encodeURIComponent(encrypted),
    });

    const result = await curlApiInfo(API_URL, postData);

    if (result.status === 0) {
      console.log("CURL was not executed successfully:", result.data);
      return null;
    }
    if (result.header !== 200) {
      console.log("Server did not execute successfully:", result.data);
      return null;
    }

    return JSON.parse(result.data);
  } catch (error) {
    console.error("topbetgame error:", error);
    return null;
  }
};

// ==================== CONTROLLER ====================
const boardGame = async (req, res) => {
  try {
    const auth = req.cookies.auth;
    let app_id = req.params.app_id;

    if (!auth || !app_id) {
      return res.status(200).json({ message: "Failed", status: false });
    }

    app_id = parseInt(app_id);
    if (!Number.isFinite(app_id)) {
      return res.status(200).json({ message: "Invalid app_id", status: false });
    }

    const [rows] = await connection.query("SELECT * FROM users WHERE `token` = ?", [auth]);
    if (!rows.length) {
      return res.status(200).json({ message: "Failed", status: false });
    }

    // Extract only fields we need; never leak password/token
    const { password, token, ...safeUser } = rows[0];
    const username = safeUser.id_user;

    const ip = safeUser.ip_address || "192.168.1.123";
    const loginParams = { username, app_id, ip, lang: "en" };

    let response = await topbetgame(loginParams, "login");

    if (!response) {
      return res.status(200).json({ message: "Game service unavailable", status: false });
    }

    // If user not registered on the game side, create them and retry login
    if (response.message === "User is not created") {
      const registerParams = { username, currency: "CNY", org: 1, ip };
      const registerResponse = await topbetgame(registerParams, "register");

      if (!registerResponse) {
        return res.status(200).json({ message: "Registration failed", status: false });
      }

      if (registerResponse.message !== "User is not created") {
        // Registration succeeded — retry login
        response = await topbetgame(loginParams, "login");
        if (!response) {
          return res.status(200).json({ message: "Login after register failed", status: false });
        }
      }
    }

    // Ensure response has payload before decrypting
    if (!response.data) {
      return res.status(200).json({
        message: response.message || "Failed",
        status: false,
      });
    }

    let responseData;
    try {
      responseData = decryptData(response.data);
    } catch (decryptError) {
      console.error("Decrypt error:", decryptError);
      return res.status(200).json({ message: "Invalid response from game provider", status: false });
    }

    return res.status(200).json({
      message: "Success",
      status: true,
      data: responseData,
    });
  } catch (error) {
    console.error("boardGame error:", error);
    return res.status(500).json({ message: "Internal server error", status: false });
  }
};

module.exports = {
  boardGame,
};