// YaarClub DB
const mysql = require("mysql2/promise");

const connection = mysql.createPool({
  host: "31.97.233.100",
  user: "new91",
  password: "NTMMmLEkwpTDaG7y",
  database: "new91",
});

export default connection;

// const mysql = require("mysql2/promise");

// const connection = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "mydb",
//   port: 3306,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });
// export default connection;
