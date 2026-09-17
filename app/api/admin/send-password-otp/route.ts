import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";
import { sendPasswordOtpEmail, getAdminNotificationEmail } from "@/lib/mail";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_please_change_in_env";

async function ensureOtpTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_password_otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT NOT NULL,
        otp_code VARCHAR(10) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.error("Error creating admin_password_otps table:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureOtpTable();

    // 1. Identify logged-in admin
    let adminId: number | null = null;
    const token = req.cookies.get("admin_token")?.value;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id?: number; email?: string };
        if (decoded?.id) {
          adminId = decoded.id;
        }
      } catch (err) {
        console.warn("Invalid admin token:", err);
      }
    }

    let admin: any = null;
    if (adminId) {
      const [rows]: any = await pool.query("SELECT * FROM admins WHERE id = ?", [adminId]);
      admin = rows[0];
    } else {
      const [rows]: any = await pool.query("SELECT * FROM admins ORDER BY id ASC LIMIT 1");
      admin = rows[0];
    }

    if (!admin) {
      return NextResponse.json(
        { error: "Admin account not found in database." },
        { status: 404 }
      );
    }

    // 2. Generate 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any old OTPs for this admin
    await pool.query("DELETE FROM admin_password_otps WHERE admin_id = ?", [admin.id]);

    // Insert fresh OTP using MySQL server time + 10 minutes (timezone safe)
    await pool.query(
      "INSERT INTO admin_password_otps (admin_id, otp_code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))",
      [admin.id, otpCode]
    );

    const targetEmail = await getAdminNotificationEmail();

    // 3. Send OTP Email
    const mailResult = await sendPasswordOtpEmail({
      to: targetEmail,
      otp: otpCode,
    });

    // Obfuscate email for UI display (e.g. p***t@gmail.com)
    const emailParts = targetEmail.split("@");
    const maskedEmail = emailParts[0].length > 2
      ? `${emailParts[0][0]}***${emailParts[0].slice(-1)}@${emailParts[1]}`
      : targetEmail;

    return NextResponse.json({
      success: true,
      email: maskedEmail,
      message: `A 6-digit security OTP has been sent to ${targetEmail}`,
      simulated: mailResult.simulated || false,
    });
  } catch (error: any) {
    console.error("Error sending password OTP:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
