import connection from "../config/connectDB";

const middlewareController = async (req, res, next) => {
  try {
    const auth = req.cookies?.auth;

    if (!auth) {
      return res.status(401).json({
        message: "Please login",
        status: false,
      });
    }

    const [rows] = await connection.execute(
      "SELECT `token`, `status` FROM `users` WHERE `token` = ? AND `veri` = 1",
      [auth]
    );

    if (!rows || rows.length === 0) {
      res.clearCookie("auth");
      return res.status(401).json({
        message: "Session expired, please login again",
        status: false,
      });
    }

    if (rows[0].status == 1) {
      // Attach user to request so downstream controllers don't re-query
      req.user = rows[0];
      return next();
    }

    return res.status(403).json({
      message: "Login user access this step",
      status: false,
    });
  } catch (error) {
    console.error("Middleware Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  }
};

export default middlewareController;