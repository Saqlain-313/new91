import connection from "../config/connectDB";

const middlewareController = async (req, res, next) => {
  try {
    // Get auth token from cookies
    const auth = req.cookies?.auth; // Ensure req.cookies is defined
// //console.log("dd",auth)
    if (!auth) {
      return res.status(400).send({
        message: "Please login",
        status: false,
      });
    }

    // //console.log("Auth Token:", auth); // Debugging line

    const [rows] = await connection.execute(
      "SELECT `token`, `status` FROM `users` WHERE `token` = ? AND `veri` = 1",
      [auth]
    );

    if (!rows || rows.length === 0) {
      res.clearCookie("auth");
      return res.end();
    }

    if (rows[0].status == 1) {
      next();
    } else {
      return res.status(400).send({
        message: "Login user access this step",
        status: false,
      });
    }
  } catch (error) {
    console.error("Middleware Error:", error);
    return res.status(500).send({
      message: "Internal Server Error",
      status: false,
    });
  }
};

export default middlewareController;
