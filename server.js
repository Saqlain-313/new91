import axios from "axios";
import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import session from "express-session";
import fs from "fs";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import configViewEngine from "./config/configEngine.js";
import connection from "./config/connectDB";
import carController from "./controllers/carController";
import cronJobContronler from "./controllers/cronJobContronler";
import k3Controller from "./controllers/k3Controller";
import k5Controller from "./controllers/k5Controller";
import socketIoController from "./controllers/socketIoController";
import winGoController from "./controllers/winGoController";
import routes from "./routes/web";
const fileUpload = require("express-fileupload");

require("./instrument.js");
const cookieParser = require("cookie-parser");
const app = express();
const server = http.createServer(app);
const logFilePath = path.join(__dirname, "server.log");

// ============================================================
// PROCESS-LEVEL SAFETY NET
// Registered FIRST. Previously these handlers called process.exit(1),
// which restarted the server on any stray rejection and wiped every
// Socket.IO session -> clients got "400 Bad Request" on polling POSTs.
// Now we only log and keep the process alive.
// ============================================================
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

const corsdata = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:7805",
  "https://max-win.site",
  "http://max-win.site",
];

// Socket IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: corsdata,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  },
  // websocket first, polling kept as fallback for old cached clients
  transports: ["websocket", "polling"],
  pingInterval: 25000,
  pingTimeout: 60000,
  allowEIO3: true,
});

io.on("connection", (socket) => {
  socket.on("error", (err) => {
    console.error("Socket error:", socket.id, err?.message);
  });
  socket.on("disconnect", () => {});
});

// Middleware for logging HTTP requests
app.use((req, res, next) => {
  next();
});

// Enable CORS
app.use(
  cors({
    origin: corsdata,
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

// Middleware for static files
app.use(express.static(path.join(__dirname, "public")));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  }),
);

// Disable cache
app.options(
  "*",
  cors({
    origin: corsdata,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  }),
);
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Surrogate-Control", "no-store");
  next();
});

// Middleware setup
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.JWT_ACCESS_TOKEN,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  }),
);

cronJobContronler.cronJobGame1p(io);

// Set up view engine
configViewEngine(app);

// Set up routes
routes.initWebRouter(app);

// Log socket message for admin
socketIoController.sendMessageAdmin(io);

// Serve client-side React application
app.use(express.static(path.join(__dirname, "/client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/client/build/index.html"));
});

// ============================================================
// UPSTREAM PERIOD APIs
// Tokens now come from .env (never hardcode them). Add to .env:
//   LOTTERY7_TOKEN=...
//   BIGDADDY_TOKEN=...
//   DAMAN_TOKEN=...
//   TRX_TOKEN=...
// Tokens in the old file were exposed - rotate/refresh them.
// ============================================================
const apiUrl_lottery7_30 = "https://lottery7api.com/api/webapi/GetGameIssue";

const headers_lottery7_30 = {
  accept: "application/json, text/plain, */*",
  "content-type": "application/json;charset=UTF-8",
  authorization: `Bearer ${process.env.LOTTERY7_TOKEN || ""}`,
  referer: "https://www.lottery7j.com/",
  "user-agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
};

const requestData_lottery_30 = {
  typeId: 30,
  language: 0,
  random: "54b62524c66b4f64b7890d6a4e59ff78",
  signature: "BC7CE0CA59E69E8C5BEA6F198EBCDC3E",
  timestamp: 1737370579,
};

const requestData_lottery_1 = {
  typeId: 1,
  language: 0,
  random: "7da339925f8c449d8de871aa2a650248",
  signature: "6E4C6BC8353A49D861007900022CA13B",
  timestamp: 1737370579,
};

const apiUrl_bigdaddygame_30 =
  "https://api.bigdaddygame.cc/api/webapi/GetGameIssue";

const headers_bigdaddygame_30 = {
  accept: "application/json, text/plain, */*",
  "accept-language": "en-US,en;q=0.9,ur;q=0.8",
  "ar-origin": "https://www.bdg345.com",
  authorization: `Bearer ${process.env.BIGDADDY_TOKEN || ""}`,
  "cache-control": "no-cache",
  "content-type": "application/json;charset=UTF-8",
  origin: "https://www.bdg345.com",
  pragma: "no-cache",
  priority: "u=1, i",
  referer: "https://www.bdg345.com/",
  "sec-ch-ua":
    '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "cross-site",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
};

const bodyData_bigdaddygame_30 = {
  typeId: 30,
  language: 0,
  random: "d9c55312d6e64447a304c2f5d05637e9",
  signature: "9B587D3A0E53E3D2D6E322E6E39C5D17",
  timestamp: 1745530982,
};

const bodyData_bigdaddygame_1 = {
  typeId: 1,
  language: 0,
  random: "cf8c314ff32d4616b572c3b3fd9cd8dc",
  signature: "A4E8A353C3E1F1E19C7763468D36DB83",
  timestamp: 1745530781,
};

const apiUrl_daman_30 =
  "https://api.damanapiopawer.com/api/webapi/GetGameIssue";

const headers_daman_30 = {
  accept: "application/json, text/plain, */*",
  "accept-language": "en-US,en;q=0.9,ur;q=0.8",
  "ar-origin": "https://damangames.bet",
  authorization: `Bearer ${process.env.DAMAN_TOKEN || ""}`,
  "cache-control": "no-cache",
  "content-type": "application/json;charset=UTF-8",
  origin: "https://damangames.bet",
  pragma: "no-cache",
  priority: "u=1, i",
  referer: "https://damangames.bet/",
  "sec-ch-ua":
    '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "cross-site",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
};

const bodyData_daman_30 = {
  typeId: 30,
  language: 0,
  random: "20169793c69743f9b77a82976d80e2c9",
  signature: "D5D46E7C1DC8D0C3C75FB7DCF9117901",
  timestamp: 1745530922,
};

const bodyData_daman_1 = {
  typeId: 1,
  language: 0,
  random: "4805f24417314382ac26184c1517554b",
  signature: "64AAB3A5FD018B1B6BEA42E42C58873A",
  timestamp: 1745530895,
};

// URLs and request bodies (30 sec)
const urls = [
  {
    url: apiUrl_lottery7_30,
    headers: headers_lottery7_30,
    body: requestData_lottery_30,
    name: "Lottery7",
  },
  {
    url: apiUrl_bigdaddygame_30,
    headers: headers_bigdaddygame_30,
    body: bodyData_bigdaddygame_30,
    name: "BigDaddy",
  },
  {
    url: apiUrl_daman_30,
    headers: headers_daman_30,
    body: bodyData_daman_30,
    name: "Daman",
  },
];

// URLs and request bodies (1 min)
const urls_1 = [
  {
    url: apiUrl_lottery7_30,
    headers: headers_lottery7_30,
    body: requestData_lottery_1,
    name: "Lottery7",
  },
  {
    url: apiUrl_bigdaddygame_30,
    headers: headers_bigdaddygame_30,
    body: bodyData_bigdaddygame_1,
    name: "BigDaddy",
  },
  {
    url: apiUrl_daman_30,
    headers: headers_daman_30,
    body: bodyData_daman_1,
    name: "Daman",
  },
];

// ============================================================
// K3 HELPER  (game: 1, 3, 5, 10)
// ============================================================
async function runK3(game) {
  try {
    await k3Controller.addK3(game);
    await k3Controller.handlingK3(game);

    // [0] = new pending period, [1] = period that just finished
    const [rows] = await connection.execute(
      "SELECT * FROM `k3` WHERE `game` = ? ORDER BY `id` DESC LIMIT 2",
      [game],
    );
    io.emit("data-server-k3", { data: rows, game: Number(game) });
  } catch (error) {
    console.error(`runK3 error for game ${game}:`, error.message);
  }
}

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("API timeout")), ms),
    ),
  ]);

// ============================================================
// Shared "wait for next period" poller (replaces the 2 duplicate fns)
// Returns the API response body, or null if nothing found.
// Callers MUST handle null.
// ============================================================
async function pollNextPeriod(urlList, currentPeriod) {
  const maxAttempts = 50;
  const apiTimeout = 500;
  const retryInterval = 1000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const start = Date.now();

    try {
      const calls = urlList.map(({ url, headers, body, name }) =>
        withTimeout(
          axios
            .post(url, body, { headers })
            .then((res) => ({ name, data: res.data }))
            .catch(() => null),
          apiTimeout,
        ).catch(() => null),
      );

      const results = await Promise.allSettled(calls);

      for (const result of results) {
        if (
          result.status === "fulfilled" &&
          result.value?.data?.data?.issueNumber > currentPeriod
        ) {
          return result.value.data;
        }
      }
    } catch (err) {
      console.error(`Attempt ${attempt} failed:`, err.message);
    }

    const elapsed = Date.now() - start;
    await sleep(Math.max(retryInterval - elapsed, 0));
  }

  return null;
}

const waitForNextPeriod = (currentPeriod) => pollNextPeriod(urls, currentPeriod);
const waitForNextPeriod_1 = (currentPeriod) =>
  pollNextPeriod(urls_1, currentPeriod);

// ============================================================
// TRX
// ============================================================
const apiUrl_trx = "https://tirangaapi.com/api/webapi/GetTRXGameIssue";

const headers_trx = {
  accept: "application/json, text/plain, */*",
  "accept-language": "en-US,en;q=0.9,ur;q=0.8",
  "ar-origin": "https://www.tirangagame.top",
  authorization: `Bearer ${process.env.TRX_TOKEN || ""}`,
  "content-type": "application/json;charset=UTF-8",
  origin: "https://www.tirangagame.top",
  referer: "https://www.tirangagame.top/",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
};

const bodyData_trx = {
  typeId: 13,
  language: 0,
  random: "39392be50209437b8c310629eccab405",
  signature: "0FCBB43C3DB5407A43D20393ADA6CA3A",
  timestamp: 1744432487,
};

// ============================================================
// 3 MIN & 5 MIN COUNTDOWN (gameId = 3 / 5)
// Now fully wrapped in try/catch with auto-restart.
// ============================================================
async function startCountdown(gameId, requestData) {
  let dead = false;
  let countdownInterval = null;

  const restart = async () => {
    if (dead) return;
    dead = true;
    if (countdownInterval) clearInterval(countdownInterval);
    await sleep(2000);
    startCountdown(gameId, requestData);
  };

  try {
    // FIX: headers were passed as `{ headers_lottery7_30 }` (wrong key => no headers)
    const response = await axios.post(apiUrl_lottery7_30, requestData, {
      headers: headers_lottery7_30,
    });
    const data = response.data.data;

    let end = new Date(data.endTime);
    let service = new Date(data.serviceTime);

    if (isNaN(end.getTime()) || isNaN(service.getTime())) {
      console.error("Invalid date format GameID ", gameId);
      return restart();
    }

    let endWithOffset = end.getTime() + 2000;
    let countdown = (endWithOffset - service.getTime()) / 1000;

    let winGoTriggered = false;
    let winGoRunning = false;

    countdownInterval = setInterval(async () => {
      if (dead) return;
      try {
        const minute = Math.floor(countdown / 60);
        const secondtime1 = Math.floor((countdown % 60) / 10);
        const secondtime2 = countdown % 10;

        if (gameId == 10) {
          io.emit(`timeUpdate_30`, { minute, secondtime1, secondtime2 });
        } else if (gameId == 1) {
          io.emit(`timeUpdate_11`, { minute, secondtime1, secondtime2 });
        } else {
          io.emit(`timeUpdate_${gameId}`, { minute, secondtime1, secondtime2 });
        }

        if (countdown === 29) {
          winGoRunning = false;
        }

        if (countdown === 4 && !winGoTriggered) {
          await connection.execute(
            "UPDATE wingo SET stop = ? WHERE game = ? AND status = ?",
            [1, `wingo${gameId}`, 0],
          );

          winGoTriggered = true;

          // K3 for 3 min & 5 min
          if (gameId === 3 || gameId === 5) {
            runK3(gameId);
          }

          if (!winGoRunning) {
            winGoRunning = true;
            try {
              await winGoController[`addWinGo_${gameId}`]();
              await winGoController.handlingWinGo1P(gameId);
            } catch (error) {
              console.error(`Error in winGo logic for game ${gameId}:`, error);
            } finally {
              winGoRunning = false;
            }
          }
        }

        if (countdown == 2) {
          if (gameId == 10) {
            const [winGo1_10] = await connection.execute(
              'SELECT * FROM `wingo` WHERE `game` = "wingo10" ORDER BY `id` DESC LIMIT 2',
              [],
            );
            io.emit("data-server", { data: winGo1_10 });
          } else if (gameId == 5) {
            const [winGo1_5] = await connection.execute(
              'SELECT * FROM `wingo` WHERE `game` = "wingo5" ORDER BY `id` DESC LIMIT 2',
              [],
            );
            io.emit("data-server", { data: winGo1_5 });
          } else if (gameId == 3) {
            const [winGo1_3] = await connection.execute(
              'SELECT * FROM `wingo` WHERE `game` = "wingo3" ORDER BY `id` DESC LIMIT 2 ',
              [],
            );
            io.emit("data-server", { data: winGo1_3 });
          } else if (gameId == 1) {
            const [winGo1] = await connection.execute(
              'SELECT * FROM `wingo` WHERE `game` = "wingo" ORDER BY `id` DESC LIMIT 2',
            );
            io.emit("data-server", { data: winGo1 });
            io.emit("data-server-1", { data: winGo1 });
          }
        }

        countdown--;

        if (countdown == 1) {
          let resp, d;

          try {
            resp = await Promise.race([
              axios.post(apiUrl_lottery7_30, requestData, {
                headers: headers_lottery7_30,
              }),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout")), 900),
              ),
            ]);

            d = resp.data.data;
            end = new Date(d.endTime);
            service = new Date(d.serviceTime);

            if (isNaN(end.getTime()) || isNaN(service.getTime())) {
              console.error("Invalid date format for GameID", gameId);
              throw new Error("Invalid API response");
            }
          } catch (error) {
            console.error(
              `API delay or error for GameID ${gameId}, using fallback.`,
            );

            if (gameId == 10) {
              end = new Date(Date.now() + 30000);
              service = new Date();
            } else if (gameId == 5) {
              end = new Date(Date.now() + 300000);
              service = new Date();
            } else if (gameId == 3) {
              end = new Date(Date.now() + 180000);
              service = new Date();
            } else if (gameId == 1) {
              end = new Date(Date.now() + 60000);
              service = new Date();
            }
          }

          endWithOffset = end.getTime() + 2000;
          countdown = (endWithOffset - service.getTime()) / 1000;
          winGoTriggered = false;

          try {
            while (winGoRunning) {
              await sleep(100);
            }

            const [winGoData] = await connection.execute(
              `SELECT * FROM wingo WHERE game = ? ORDER BY id DESC LIMIT 2`,
              [`wingo${gameId}`],
            );
            io.emit("data-server", { data: winGoData });
          } catch (error) {
            console.error(`Error fetching wingo data for game ${gameId}:`, error);
          }
        }
      } catch (error) {
        console.error(`Countdown tick error (game ${gameId}):`, error.message);
        restart();
      }
    }, 1000);
  } catch (error) {
    console.error(`startCountdown(${gameId}) failed:`, error.message);
    restart();
  }
}

// Request data for different games
const requestData_30 = {
  typeId: 30,
  language: 0,
  random: "54b62524c66b4f64b7890d6a4e59ff78",
  signature: "BC7CE0CA59E69E8C5BEA6F198EBCDC3E",
  timestamp: 1737370579,
};

const requestData_1 = {
  typeId: 1,
  language: 0,
  random: "7da339925f8c449d8de871aa2a650248",
  signature: "6E4C6BC8353A49D861007900022CA13B",
  timestamp: 1737370579,
};

const requestData_1_trx = {
  language: 0,
  random: "27db983462f74d4e99a87a6454e823b3",
  signature: "DA704CEEA5A3EC9E7978E24D94463D35",
  timestamp: 1742540672,
  typeId: 13,
};

const requestData_3 = {
  typeId: 2,
  language: 0,
  random: "80dc1455763f493488f08286bf65fb6f",
  signature: "FBA6634AB477F8D7435BA0DAC9E64277",
  timestamp: 1737370579,
};

const requestData_5 = {
  typeId: 3,
  language: 0,
  random: "6931e25a1af94196a38eb9c7ffcb449b",
  signature: "CEB52D88DE5F0A638E97BBEC6CB811FD",
  timestamp: 1737370579,
};

// ============================================================
// 30 SEC COUNTDOWN (wingo 30s)
// ============================================================
async function startCountdown_30(requestData) {
  let gameId = 10;
  let dead = false;
  let countdownInterval = null;

  const restart = () => {
    if (dead) return;
    dead = true;
    if (countdownInterval) clearInterval(countdownInterval);
    restartCountdown(requestData);
  };

  try {
    let response = await axios.post(
      apiUrl_lottery7_30,
      requestData_lottery_30,
      { headers: headers_lottery7_30 },
    );
    let data = response.data.data;

    let end = new Date(data.endTime);
    let service = new Date(data.serviceTime);
    let period_id = data.issueNumber;

    if (isNaN(end.getTime()) || isNaN(service.getTime())) {
      return restart();
    }

    let endWithOffset = end.getTime() + 3000;
    let countdown_frontend =
      (endWithOffset - (service.getTime() + 2000)) / 1000;
    let countdown = (endWithOffset - service.getTime()) / 1000;

    let winGoTriggered = false;
    let winGoRunning = false;

    countdownInterval = setInterval(async () => {
      if (dead) return;
      try {
        if (countdown <= 0) {
          return restart();
        }

        let minute = Math.floor(countdown_frontend / 60);
        let secondtime1 = Math.floor(countdown_frontend / 10);
        let secondtime2 = countdown_frontend % 10;

        io.emit(`timeUpdate_30`, { minute, secondtime1, secondtime2 });

        if (countdown === 3 && !winGoTriggered) {
          winGoTriggered = true;
          winGoRunning = true;

          try {
            await connection.execute(
              "UPDATE wingo SET stop = ? WHERE game = ? AND status = ?",
              [1, `wingo${gameId}`, 0],
            );

            // FIX: waitForNextPeriod can return null -> was crashing the process
            (async () => {
              try {
                const r = await waitForNextPeriod(period_id);
                if (!r?.data) return; // keep old values
                data = r.data;
                end = new Date(data.endTime);
                service = new Date(data.serviceTime);
                period_id = data.issueNumber;
              } catch (e) {
                console.error("waitForNextPeriod (30s) failed:", e.message);
              }
            })();

            await winGoController.addWinGo_10(period_id);
            await winGoController.handlingWinGo1P(gameId);
          } catch (error) {
            console.error("Error in 30s process:", error.message);
          } finally {
            winGoRunning = false;
          }
        }

        countdown--;
        countdown_frontend--;

        if (countdown === 1) {
          try {
            const [winGo1_10] = await connection.execute(
              'SELECT * FROM `wingo` WHERE `game` = "wingo10" ORDER BY `id` DESC LIMIT 2',
            );

            io.emit("data-server", { data: winGo1_10 });
          } catch (error) {
            // silent
          }
        }

        if (countdown === 1) {
          try {
            if (isNaN(end.getTime()) || isNaN(service.getTime())) {
              throw new Error("Invalid API response");
            }
          } catch (error) {
            end = new Date(Date.now() + 30000);
            service = new Date();
          }

          endWithOffset = end.getTime() + 3000;
          countdown = (endWithOffset - service.getTime()) / 1000;
          countdown_frontend =
            (endWithOffset - (service.getTime() + 2000)) / 1000;

          winGoTriggered = false;

          try {
            while (winGoRunning) {
              await sleep(100);
            }

            const [winGoData] = await connection.execute(
              `SELECT * FROM wingo WHERE game = ? ORDER BY id DESC LIMIT 2`,
              [`wingo${gameId}`],
            );
            io.emit("data-server", { data: winGoData });
          } catch (error) {
            // silent
          }
        }
      } catch (error) {
        console.error("30s countdown tick error:", error.message);
        restart();
      }
    }, 1000);
  } catch (error) {
    console.error("startCountdown_30 failed:", error.message);
    restart();
  }
}

async function restartCountdown(requestData) {
  await sleep(2000);
  startCountdown_30(requestData);
}

// ============================================================
// TRX issue number fetcher
// FIX 1: it was called as fetchIssueNumber(apiUrl_trx, bodyData_trx, headers_trx)
//        so `delay` became a URL string -> NaN delay -> hot loop. No args now.
// FIX 2: infinite while(true) could block the 1-min countdown forever.
//        Now capped and returns null on failure.
// ============================================================
async function fetchIssueNumber(delay = 500, maxAttempts = 20) {
  const url = "https://draw.ar-lottery01.com/TrxWinGo/TrxWinGo_1M.json";
  const headers = {
    accept: "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9,ur;q=0.8",
    "cache-control": "no-cache",
    pragma: "no-cache",
    priority: "u=1, i",
    "sec-ch-ua":
      '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    referer: "https://www.tirangagame.top/",
  };

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await axios.get(url, { headers, timeout: 3000 });
      const issueNumber = response.data?.current?.issueNumber;

      if (issueNumber) {
        return issueNumber;
      }
    } catch (error) {
      console.error(`TRX issue attempt ${attempt} failed:`, error.message);
    }

    await sleep(delay);
  }

  return null;
}

// ============================================================
// 1 MIN COUNTDOWN (wingo 1m + trx + car + 5D + K3 1min)
// ============================================================
async function startCountdown_1(requestData) {
  let dead = false;
  let countdownInterval = null;

  const restart = () => {
    if (dead) return;
    dead = true;
    if (countdownInterval) clearInterval(countdownInterval);
    restartCountdown_1(requestData);
  };

  try {
    let response = await axios.post(apiUrl_lottery7_30, requestData, {
      headers: headers_lottery7_30,
    });
    let data = response.data.data;

    let end = new Date(data.endTime);
    let service = new Date(data.serviceTime);
    let period_id = data.issueNumber;

    let issueNumber_trx = await fetchIssueNumber();

    if (isNaN(end.getTime()) || isNaN(service.getTime())) {
      return restart();
    }

    let endWithOffset = end.getTime() + 3000;
    let countdown_frontend =
      (endWithOffset - (service.getTime() + 2000)) / 1000;
    let countdown = (endWithOffset - service.getTime()) / 1000;

    let winGoTriggered = false;
    let winGoRunning = false;

    countdownInterval = setInterval(async () => {
      if (dead) return;
      try {
        if (countdown <= 0) {
          return restart();
        }

        let minute = Math.floor(countdown_frontend / 60);
        let secondtime1 = Math.floor(countdown_frontend / 10);
        let secondtime2 = countdown_frontend % 10;

        io.emit(`timeUpdate_11`, { minute, secondtime1, secondtime2 });

        if (countdown === 3 && !winGoTriggered) {
          winGoTriggered = true;
          winGoRunning = true;

          try {
            await connection.execute(
              "UPDATE wingo SET stop = ? WHERE game = ? AND status = ?",
              [1, `wingo`, 0],
            );

            // FIX: null-safe (was crashing the process on null response)
            (async () => {
              try {
                const r = await waitForNextPeriod_1(period_id);
                if (!r?.data) return;
                data = r.data;
                end = new Date(data.endTime);
                service = new Date(data.serviceTime);
                period_id = data.issueNumber;
              } catch (e) {
                console.error("waitForNextPeriod_1 failed:", e.message);
              }
            })();

            await Promise.all([
              winGoController.addWinGo_1(period_id),
              issueNumber_trx
                ? winGoController.addWinGo_11(issueNumber_trx)
                : Promise.resolve(),
              carController.addcargame(1),
            ]);

            await Promise.all([
              winGoController.handlingWinGo1P(1),
              winGoController.handlingWinGo1P(11),
              carController.handlingcargame1P(1),
            ]);

            await k5Controller.add5D(1);
            await k5Controller.handling5D(1);

            // K3 1 min
            await runK3(1);
          } catch (error) {
            console.error("Error in 1 min process:", error.message);
          } finally {
            winGoRunning = false;
          }
        }
        countdown--;
        countdown_frontend--;

        if (countdown === 1) {
          try {
            const [winGo1] = await connection.execute(
              'SELECT * FROM `wingo` WHERE `game` = "wingo" ORDER BY `id` DESC LIMIT 2',
            );
            io.emit("data-server", { data: winGo1 });
            io.emit("data-server-1", { data: winGo1 });

            const [winGo11] = await connection.execute(
              'SELECT * FROM `wingo` WHERE `game` = "trx" ORDER BY `id` DESC LIMIT 2',
            );
            io.emit("data-server-trx", { data: winGo11 });
            io.emit("data-server-trx-1", { data: winGo11 });

            const [bike] = await connection.execute(
              'SELECT * FROM `cargame` WHERE `game` = "cargame" ORDER BY `id` DESC LIMIT 2',
            );
            io.emit("data-server-bike", { data: bike });
          } catch (error) {
            // silent
          }
        }

        if (countdown === 1) {
          try {
            const newTrx = await fetchIssueNumber();
            if (newTrx) issueNumber_trx = newTrx;

            if (isNaN(end.getTime()) || isNaN(service.getTime())) {
              throw new Error("Invalid API response");
            }
          } catch (error) {
            end = new Date(Date.now() + 60000);
            service = new Date();
          }

          endWithOffset = end.getTime() + 2000;
          countdown = (endWithOffset - service.getTime()) / 1000;
          countdown_frontend =
            (endWithOffset - (service.getTime() + 2000)) / 1000;
          winGoTriggered = false;

          try {
            while (winGoRunning) {
              await sleep(100);
            }

            const [winGoData] = await connection.execute(
              `SELECT * FROM wingo WHERE game = ? ORDER BY id DESC LIMIT 2`,
              [`wingo`],
            );
            io.emit("data-server", { data: winGoData });
          } catch (error) {
            // silent
          }
        }
      } catch (error) {
        console.error("1 min countdown tick error:", error.message);
        restart();
      }
    }, 1000);
  } catch (error) {
    console.error("startCountdown_1 failed:", error.message);
    restart();
  }
}

async function restartCountdown_1(requestData) {
  await sleep(2000);
  startCountdown_1(requestData);
}

// ============================================================
// 10 MINUTE COUNTDOWN  ->  frontend event: "timeUpdate_10"
// Wall-clock aligned (xx:00, xx:10, xx:20 ...), no drift.
// ============================================================
function startCountdown_10min() {
  const PERIOD = 600; // seconds
  let lastTriggeredPeriod = null;

  setInterval(async () => {
    try {
      const nowSec = Math.floor(Date.now() / 1000);
      const remaining = PERIOD - 1 - (nowSec % PERIOD);

      const minute = Math.floor(remaining / 60);
      const secondtime1 = Math.floor((remaining % 60) / 10);
      const secondtime2 = remaining % 10;

      io.emit("timeUpdate_10", { minute, secondtime1, secondtime2 });

      if (remaining === 4) {
        const periodKey = Math.floor(nowSec / PERIOD);
        if (lastTriggeredPeriod !== periodKey) {
          lastTriggeredPeriod = periodKey;
          runK3(10);
        }
      }
    } catch (error) {
      console.error("Error in 10 min countdown:", error);
    }
  }, 1000);
}

// Start countdowns for different games
startCountdown_30(requestData_30);
startCountdown_1(requestData_1);
startCountdown(3, requestData_3);
startCountdown(5, requestData_5);
startCountdown_10min();

// ============================================================
// SERVER START
// NOTE: if the port is busy this falls back to port+1. Behind nginx/PM2
// that silently breaks sockets (nginx still points at the old port).
// Make sure only ONE instance runs (pm2 fork mode, instances: 1).
// ============================================================
const DEFAULT_PORT = Number(process.env.PORT) || 7805;
const MAX_PORT_ATTEMPTS = 10;

function startServer(port, attemptsLeft = MAX_PORT_ATTEMPTS) {
  const handleListenError = (error) => {
    server.removeListener("error", handleListenError);

    if (error.code === "EADDRINUSE" && attemptsLeft > 1) {
      const nextPort = port + 1;
      console.warn(
        `Port ${port} is already in use. Trying port ${nextPort}...`,
      );
      startServer(nextPort, attemptsLeft - 1);
      return;
    }

    console.error(`Unable to start server on port ${port}:`, error);
    process.exitCode = 1;
  };

  server.once("error", handleListenError);
  server.listen(port, "0.0.0.0", () => {
    server.removeListener("error", handleListenError);
    console.log(`Server running on port ${port} - PID: ${process.pid}`);

    if (port !== DEFAULT_PORT) {
      console.warn(
        `IMPORTANT: Backend moved from configured port ${DEFAULT_PORT} to ${port}. ` +
          `Update your frontend/API and Socket.IO URLs if they use a fixed port.`,
      );
    }
  });
}

startServer(DEFAULT_PORT);

// Graceful shutdown (PM2 / Docker / Ctrl+C)
process.on("SIGINT", () => {
  server.close(() => {
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  server.close(() => {
    process.exit(0);
  });
});