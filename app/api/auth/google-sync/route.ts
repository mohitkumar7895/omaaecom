import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

export async function POST(req: Request) {
  try {
    const { uid, email, displayName } = await req.json();

    if (!email || !uid) {
      return NextResponse.json({ error: "Missing user data" }, { status: 400 });
    }

    const connection = await pool.getConnection();

    // Check if user exists
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
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      referralCode = `OC${randomNum}`;

      // Create new user from Google Data
      await connection.query(
        `INSERT INTO users (uid, email, name, referral_code) VALUES (?, ?, ?, ?)`,
        [uid, email, displayName || email.split('@')[0], referralCode]
      );
      user = { uid, email, name: displayName || email.split('@')[0], referral_code: referralCode };
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

    // Generate JWT
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

    // Set HTTP-only Cookie
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
    console.error("Google Sync Error:", error);
    return NextResponse.json({ error: "Failed to sync Google login" }, { status: 500 });
  }
}
