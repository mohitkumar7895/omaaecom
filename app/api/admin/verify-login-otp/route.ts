import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "../../../../lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_please_change_in_env";

export async function POST(req: Request) {
  try {
    const { temp_token, otp } = await req.json();

    if (!temp_token || !otp) {
      return NextResponse.json({ error: "Temporary token and OTP are required." }, { status: 400 });
    }

    const cleanOtp = otp.toString().trim();

    // 1. Verify OTP against database and ensure it has not expired
    const [otpRows]: any = await pool.query(
      `SELECT * FROM admin_login_otps 
       WHERE temp_token = ? AND otp_code = ? AND expires_at > NOW() 
       LIMIT 1`,
      [temp_token, cleanOtp]
    );

    if (!otpRows || otpRows.length === 0) {
      // Check if expired or wrong
      const [anyOtpRows]: any = await pool.query(
        "SELECT * FROM admin_login_otps WHERE temp_token = ? LIMIT 1",
        [temp_token]
      );

      if (anyOtpRows && anyOtpRows.length > 0) {
        const isExpired = new Date(anyOtpRows[0].expires_at) < new Date();
        if (isExpired) {
          return NextResponse.json({ error: "The OTP code has expired. Please click Resend OTP." }, { status: 400 });
        }
      }

      return NextResponse.json({ error: "Invalid OTP code. Please check your email and enter the 6-digit code." }, { status: 400 });
    }

    const otpRecord = otpRows[0];

    // 2. Fetch admin user record
    const [adminRows]: any = await pool.query("SELECT * FROM admins WHERE id = ?", [otpRecord.admin_id]);
    const admin = adminRows[0];

    if (!admin) {
      return NextResponse.json({ error: "Admin account not found." }, { status: 404 });
    }

    // 3. Delete used OTP
    await pool.query("DELETE FROM admin_login_otps WHERE id = ?", [otpRecord.id]);

    // 4. Generate Long-Lived JWT Token (30 Days)
    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    // 5. Set persistent cookie (30 Days) so admin stays logged in unless they explicitly logout
    const response = NextResponse.json({
      success: true,
      message: "Authentication successful. Welcome back!",
      redirect: "/admin",
    }, { status: 200 });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Verify login OTP error:", error);
    return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
  }
}
