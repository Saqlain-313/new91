
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 7000;

const logFile = path.join(__dirname, "callback.txt");

// Capture raw body for every content type
app.use(express.raw({
  type: "*/*",
  limit: "50mb"
}));

app.post("/callback", (req, res) => {
  try {
    const timestamp = new Date().toISOString();

    const payload = {
      timestamp,
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: Buffer.isBuffer(req.body)
        ? req.body.toString("utf8")
        : req.body ?? null
    };

    fs.appendFileSync(
      logFile,
      "\n\n========================================\n" +
      JSON.stringify(payload, null, 2) +
      "\n========================================\n",
      "utf8"
    );

    console.log("Callback received:", timestamp);
    console.log("Payload:", payload.body);

    res.status(200).json({
      success: true,
      message: "Callback received and logged"
    });

  } catch (error) {
    console.error("Callback error:", error);

    res.status(500).json({
      success: false,
      message: "Logging failed"
    });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("Callback server is running!");
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Callback server running on http://127.0.0.1:${PORT}`);
});
