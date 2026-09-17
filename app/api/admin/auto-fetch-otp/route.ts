import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function POST(req: Request) {
  try {
    const { temp_token } = await req.json();

    if (!temp_token) {
      return NextResponse.json({ error: "Session token required" }, { status: 400 });
    }

    // Lookup active OTP for this specific login session
    const [rows]: any = await pool.query(
      `SELECT otp_code, email, created_at 
       FROM admin_login_otps 
       WHERE temp_token = ? AND expires_at > NOW() 
       LIMIT 1`,
      [temp_token]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "No active OTP found or code expired." }, { status: 404 });
    }

    const otpCode = rows[0].otp_code;

    return NextResponse.json({
      success: true,
      otp: otpCode,
      target_email: "mail.omaacompany@gmail.com",
      message: "OTP successfully retrieved",
    });
  } catch (error: any) {
    console.error("Auto fetch OTP error:", error);
    return NextResponse.json({ error: "Failed to auto-fetch OTP" }, { status: 500 });
  }
}
