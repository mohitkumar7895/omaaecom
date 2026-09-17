import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const connection = await pool.getConnection();

    // 1. Verify OTP
    const [rows]: any = await connection.query(
      `SELECT * FROM otps WHERE email = ? AND otp = ?`,
      [email, otp]
    );

    if (rows.length === 0) {
      connection.release();
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    const otpRecord = rows[0];

    // Check expiration
    if (new Date() > new Date(otpRecord.expires_at)) {
      await connection.query(`DELETE FROM otps WHERE email = ?`, [email]);
      connection.release();
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    // OTP is valid. Delete it so it can't be reused.
    await connection.query(`DELETE FROM otps WHERE email = ?`, [email]);

    // 2. Check if user exists, else create
    const [userRows]: any = await connection.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );

    // Ensure referral_code column exists in users
    try {
      await connection.query(`ALTER TABLE users ADD COLUMN referral_code VARCHAR(50) DEFAULT NULL`);
    } catch(e) {}

    let user;
    let referralCode = "";

    if (userRows.length === 0) {
      // Generate new OC + 6-digit referral code (e.g. OC133461)
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      referralCode = `OC${randomNum}`;

      const uid = `email-${Date.now()}`;
      await connection.query(
        `INSERT INTO users (uid, email, name, referral_code) VALUES (?, ?, ?, ?)`,
        [uid, email, email.split('@')[0], referralCode]
      );
      user = { uid, email, name: email.split('@')[0], referral_code: referralCode };
    } else {
      user = userRows[0];
      referralCode = user.referral_code;

      if (!referralCode) {
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        referralCode = `OC${randomNum}`;
        await connection.query(
          `UPDATE users SET referral_code = ? WHERE email = ?`,
          [referralCode, email]
        );
        user.referral_code = referralCode;
      }
    }

    connection.release();

    // 3. Generate JWT with referral code
    const token = jwt.sign(
      { 
        uid: user.uid, 
        email: user.email, 
        name: user.name,
        referral_code: user.referral_code,
        referral_link: `https://omaacompany.in/?ref=${user.referral_code}`
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 4. Set HTTP-only Cookie
    const response = NextResponse.json({ 
      success: true, 
      user: {
        ...user,
        referral_code: user.referral_code,
        referral_link: `https://omaacompany.in/?ref=${user.referral_code}`
      } 
    });
    
    response.cookies.set("omaa_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
