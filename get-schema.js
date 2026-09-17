const mysql = require("mysql2/promise");
require("dotenv").config();

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "omaa",
  });

  const [rows] = await connection.query("DESCRIBE bookings");
  console.log("Bookings table schema:");
  console.table(rows);

  const [tables] = await connection.query("SHOW TABLES");
  console.log("All tables:");
  console.table(tables);

  connection.end();
}
main();
