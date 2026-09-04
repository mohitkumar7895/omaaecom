import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import pool from "../../../../lib/db";
import { sendAdminLoginOtpEmail } from "../../../../lib/mail";

const TARGET_ADMIN_EMAIL = "mail.omaacompany@gmail.com";

async function ensureAdminLoginOtpTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_login_otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        otp_code VARCHAR(10) NOT NULL,
        temp_token VARCHAR(255) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_temp_token (temp_token),
        INDEX idx_admin_id (admin_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.error("Error creating admin_login_otps table:", err);
  }
}

export async function POST(req: Request) {
  try {
    await ensureAdminLoginOtpTable();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // Find admin by email
    const [rows]: any = await pool.query("SELECT * FROM admins WHERE email = ?", [email.trim()]);
    const admin = rows[0];

    if (!admin) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // 1. Generate 6-digit numeric OTP and secure temporary token
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const tempToken = crypto.randomUUID();

    // 2. Clear out any previous login OTPs for this admin
    await pool.query("DELETE FROM admin_login_otps WHERE admin_id = ?", [admin.id]);

    // 3. Save OTP with 10-minute expiry (timezone-safe via MySQL DATE_ADD)
    await pool.query(
      `INSERT INTO admin_login_otps (admin_id, email, otp_code, temp_token, expires_at) 
       VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
      [admin.id, admin.email, otpCode, tempToken]
    );

    // 4. Send OTP to mail.omaacompany@gmail.com
    try {
      await sendAdminLoginOtpEmail({
        to: TARGET_ADMIN_EMAIL,
        otp: otpCode,
        adminName: admin.name || "Administrator",
      });
    } catch (mailErr: any) {
      console.error("Failed to dispatch admin login OTP email:", mailErr?.message);
    }

    // 5. Mask target email for UI display (e.g., m***y@gmail.com)
    const emailParts = TARGET_ADMIN_EMAIL.split("@");
    const maskedEmail = emailParts[0].length > 2
      ? `${emailParts[0][0]}***${emailParts[0].slice(-1)}@${emailParts[1]}`
      : TARGET_ADMIN_EMAIL;

    return NextResponse.json({
      requires_otp: true,
      temp_token: tempToken,
      target_email: maskedEmail,
      full_target_email: TARGET_ADMIN_EMAIL,
      message: `A 6-digit security OTP has been sent to ${TARGET_ADMIN_EMAIL}`,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
  }
}

