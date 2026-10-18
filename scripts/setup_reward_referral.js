require('dotenv').config();
const mysql = require('mysql2/promise');

async function setup() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306
  });

  console.log("Connected to MySQL database:", process.env.DB_NAME);

  // 1. Ensure columns on users table
  try {
    const [cols] = await connection.query("SHOW COLUMNS FROM users LIKE 'referred_by'");
    if (cols.length === 0) {
      await connection.query("ALTER TABLE users ADD COLUMN referred_by VARCHAR(50) DEFAULT NULL");
      console.log("Added 'referred_by' column to users table.");
    } else {
      console.log("'referred_by' column already exists in users.");
    }
  } catch (e) {
    console.warn("Could not check/add referred_by to users:", e.message);
  }

  // 2. Create reward_points_transactions table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS reward_points_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_email VARCHAR(255) NOT NULL,
      points INT NOT NULL,
      type ENUM('Credit', 'Debit') NOT NULL,
      category ENUM('welcome', 'purchase_reward', 'redemption') NOT NULL,
      order_id VARCHAR(100) DEFAULT NULL,
      description VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_rpt_email (user_email),
      INDEX idx_rpt_order (order_id)
    )
  `);
  console.log("Table 'reward_points_transactions' verified/created.");

  // 3. Create referral_money_transactions table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS referral_money_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_email VARCHAR(255) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      type ENUM('Credit', 'Debit') NOT NULL,
      category ENUM('referral_bonus', 'withdrawal', 'purchase_deduction') NOT NULL,
      level INT DEFAULT 1,
      buyer_email VARCHAR(255) DEFAULT NULL,
      buyer_name VARCHAR(255) DEFAULT NULL,
      order_id VARCHAR(100) DEFAULT NULL,
      description VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_rmt_email (user_email),
      INDEX idx_rmt_order (order_id)
    )
  `);
  console.log("Table 'referral_money_transactions' verified/created.");

  // 4. Create referral_withdrawals table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS referral_withdrawals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      withdrawal_id VARCHAR(50) NOT NULL UNIQUE,
      user_email VARCHAR(255) NOT NULL,
      user_name VARCHAR(255) DEFAULT NULL,
      user_phone VARCHAR(20) DEFAULT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      payment_method ENUM('UPI', 'Bank') DEFAULT 'UPI',
      upi_id VARCHAR(100) DEFAULT NULL,
      bank_name VARCHAR(150) DEFAULT NULL,
      account_number VARCHAR(100) DEFAULT NULL,
      ifsc_code VARCHAR(50) DEFAULT NULL,
      account_holder_name VARCHAR(150) DEFAULT NULL,
      status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
      admin_notes TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_rw_email (user_email),
      INDEX idx_rw_status (status)
    )
  `);
  console.log("Table 'referral_withdrawals' verified/created.");

  // 5. Ensure bookings table has columns for points_redeemed and referral_money_used
  try {
    const [ptsCol] = await connection.query("SHOW COLUMNS FROM bookings LIKE 'points_redeemed'");
    if (ptsCol.length === 0) {
      await connection.query("ALTER TABLE bookings ADD COLUMN points_redeemed INT DEFAULT 0");
      console.log("Added 'points_redeemed' column to bookings table.");
    }
  } catch (e) {
    console.warn("points_redeemed check:", e.message);
  }

  try {
    const [refCol] = await connection.query("SHOW COLUMNS FROM bookings LIKE 'referral_money_used'");
    if (refCol.length === 0) {
      await connection.query("ALTER TABLE bookings ADD COLUMN referral_money_used DECIMAL(10, 2) DEFAULT 0.00");
      console.log("Added 'referral_money_used' column to bookings table.");
    }
  } catch (e) {
    console.warn("referral_money_used check:", e.message);
  }

  // 6. Provide 100 Welcome Points to all existing users who don't have them yet
  const [users] = await connection.query("SELECT email, referral_code FROM users");
  for (const u of users) {
    if (!u.email) continue;

    // Check if welcome points already credited
    const [wel] = await connection.query(
      "SELECT id FROM reward_points_transactions WHERE user_email = ? AND category = 'welcome' LIMIT 1",
      [u.email]
    );
    if (wel.length === 0) {
      await connection.query(
        "INSERT INTO reward_points_transactions (user_email, points, type, category, description) VALUES (?, 100, 'Credit', 'welcome', 'Welcome Bonus - 100 Signup Points')",
        [u.email]
      );
      console.log(`Credited 100 Welcome Points to existing user: ${u.email}`);
    }

    // Ensure referral_code exists
    if (!u.referral_code) {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const digits = "0123456789";
      let code = "";
      for (let i = 0; i < 3; i++) code += letters.charAt(Math.floor(Math.random() * letters.length));
      for (let i = 0; i < 3; i++) code += digits.charAt(Math.floor(Math.random() * digits.length));
      await connection.query("UPDATE users SET referral_code = ? WHERE email = ?", [code, u.email]);
      console.log(`Generated referral code ${code} for user ${u.email}`);
    }
  }

  console.log("Reward & Referral setup completed successfully!");
  await connection.end();
}

setup().catch(err => {
  console.error("Setup error:", err);
  process.exit(1);
});
