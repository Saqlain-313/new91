// YaarClub DB
// const mysql = require("mysql2/promise");

// const connection = mysql.createPool({
//   host: "72.61.238.64",
//   user: "yarwin",
//   password: "eR7cj35ks4882HJy",
//   database: "yarwin",
// });

// export default connection;

const mysql = require("mysql2/promise");

const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "mydb",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
export default connection;
