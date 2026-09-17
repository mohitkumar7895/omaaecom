import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { sendOTP } from "../../../../lib/mailer";
import type { RowDataPacket } from "mysql2";

type OtpRecord = RowDataPacket & {
  attempts: number;
  created_at: Date;
};

// Rate limiting settings
const RATE_LIMIT_MINUTES = 5;
const MAX_ATTEMPTS = 3;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const connection = await pool.getConnection();

    // 1. Rate Limiting Check
    const [existingRows] = await connection.query<OtpRecord[]>(
      `SELECT attempts, created_at FROM otps WHERE email = ? ORDER BY created_at DESC LIMIT 1`,
      [email]
    );

    if (existingRows.length > 0) {
      const lastAttempt = existingRows[0];
      const now = new Date();
      const diffMinutes = (now.getTime() - new Date(lastAttempt.created_at).getTime()) / 60000;

      if (diffMinutes < RATE_LIMIT_MINUTES && lastAttempt.attempts >= MAX_ATTEMPTS) {
        connection.release();
        return NextResponse.json({ 
          error: `Too many attempts. Please try again after ${Math.ceil(RATE_LIMIT_MINUTES - diffMinutes)} minutes.` 
        }, { status: 429 });
      }
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // 3. Store in DB
    const attempts = existingRows.length > 0 && 
      (new Date().getTime() - new Date(existingRows[0].created_at).getTime()) / 60000 < RATE_LIMIT_MINUTES 
      ? existingRows[0].attempts + 1 : 1;

    // Delete old OTPs for this email to keep table clean
    await connection.query(`DELETE FROM otps WHERE email = ?`, [email]);

    await connection.query(
      `INSERT INTO otps (email, otp, expires_at, attempts) VALUES (?, ?, ?, ?)`,
      [email, otp, expiresAt, attempts]
    );

    connection.release();

    // 4. Send Email
    // If SMTP is not configured, we'll log it for testing purposes (development mode)
    if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
      await sendOTP(email, otp);
    } else {
      console.warn("⚠️ SMTP credentials not found in .env. OTP is: ", otp);
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error: unknown) {
    console.error("Send OTP Error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
