import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { sendAdminLoginOtpEmail } from "../../../../lib/mail";

const TARGET_ADMIN_EMAIL = "mail.omaacompany@gmail.com";

export async function POST(req: Request) {
  try {
    const { temp_token } = await req.json();

    if (!temp_token) {
      return NextResponse.json({ error: "Temporary session token is required." }, { status: 400 });
    }

    // 1. Locate existing login OTP session
    const [rows]: any = await pool.query(
      "SELECT * FROM admin_login_otps WHERE temp_token = ? LIMIT 1",
      [temp_token]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Session expired. Please start login again." }, { status: 400 });
    }

    const otpRecord = rows[0];

    // Rate limit: Check if OTP was generated in the last 20 seconds
    const createdAt = new Date(otpRecord.created_at).getTime();
    const now = Date.now();
    if (now - createdAt < 20 * 1000) {
      return NextResponse.json({ error: "Please wait a moment before requesting another code." }, { status: 429 });
    }

    // 2. Fetch admin name
    const [adminRows]: any = await pool.query("SELECT name FROM admins WHERE id = ?", [otpRecord.admin_id]);
    const adminName = adminRows[0]?.name || "Administrator";

    // 3. Generate fresh 6-digit OTP
    const freshOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Update database record with fresh OTP and renewed 10-minute expiry
    await pool.query(
      "UPDATE admin_login_otps SET otp_code = ?, expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE), created_at = NOW() WHERE id = ?",
      [freshOtp, otpRecord.id]
    );

    // 5. Send Email to mail.omaacompany@gmail.com
    await sendAdminLoginOtpEmail({
      to: TARGET_ADMIN_EMAIL,
      otp: freshOtp,
      adminName,
    });

    return NextResponse.json({
      success: true,
      message: `A fresh OTP code has been sent to ${TARGET_ADMIN_EMAIL}`,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Resend login OTP error:", error);
    return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
  }
}
