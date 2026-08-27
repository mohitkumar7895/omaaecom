import mysql from "mysql2/promise";

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  console.warn("⚠️ WARNING: Database environment variables (DB_HOST, DB_USER, DB_NAME) are missing in your .env file!");
  console.warn("Please add them and restart the server, or database queries will fail.");
}

const poolOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: process.env.NODE_ENV === "production" ? 5 : 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 3000, // 3s fast timeout so SSG / SSR never hangs
};

let pool: mysql.Pool;

if (process.env.NODE_ENV === "production") {
  pool = mysql.createPool(poolOptions);
} else {
  // In development, preserve the database connection across HMR (Hot Module Replacement) reloads
  const globalWithMysql = global as typeof globalThis & {
    _mysqlPool2?: mysql.Pool;
  };
  
  if (!globalWithMysql._mysqlPool2) {
    globalWithMysql._mysqlPool2 = mysql.createPool(poolOptions);
  }
  
  pool = globalWithMysql._mysqlPool2;
}

export default pool;
