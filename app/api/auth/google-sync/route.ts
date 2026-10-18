import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import jwt from "jsonwebtoken";
import { generateReferralCode } from "../../../../lib/rewards";

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

    // Ensure columns exist in users
    try {
      await connection.query(`ALTER TABLE users ADD COLUMN referral_code VARCHAR(50) DEFAULT NULL`);
    } catch(e) {}
    try {
      await connection.query(`ALTER TABLE users ADD COLUMN referred_by VARCHAR(50) DEFAULT NULL`);
    } catch(e) {}

    // Check incoming referral code from cookie
    const cookieHeader = req.headers.get("cookie") || "";
    let incomingRefCode = "";
    const match = cookieHeader.match(/omaa_referral_code=([^;]+)/);
    if (match) {
      incomingRefCode = decodeURIComponent(match[1]).trim().toUpperCase();
    }

    let user;
    let referralCode = "";

    if (userRows.length === 0) {
      // Validate referrer code
      let validReferrer = null;
      if (incomingRefCode) {
        const [refCheck]: any = await connection.query(
          "SELECT referral_code, email FROM users WHERE referral_code = ? LIMIT 1",
          [incomingRefCode]
        );
        if (refCheck.length > 0 && refCheck[0].email !== email) {
          validReferrer = refCheck[0].referral_code;
        }
      }

      referralCode = generateReferralCode();

      // Create new user from Google Data
      await connection.query(
        `INSERT INTO users (uid, email, name, referral_code, referred_by) VALUES (?, ?, ?, ?, ?)`,
        [uid, email, displayName || email.split('@')[0], referralCode, validReferrer]
      );
      user = { uid, email, name: displayName || email.split('@')[0], referral_code: referralCode, referred_by: validReferrer };

      // Award 100 Welcome Points
      try {
        await connection.query(
          `INSERT INTO reward_points_transactions (user_email, points, type, category, description) 
           VALUES (?, 100, 'Credit', 'welcome', 'Welcome Bonus - 100 Signup Points')`,
          [email]
        );
      } catch (ptsErr) {
        console.error("Failed to credit welcome points:", ptsErr);
      }
    } else {
      user = userRows[0];
      referralCode = user.referral_code;

      if (!referralCode) {
        referralCode = generateReferralCode();
        await connection.query(
          `UPDATE users SET referral_code = ? WHERE email = ?`,
          [referralCode, email]
        );
        user.referral_code = referralCode;
      }

      // If existing user has no welcome points recorded, credit 100 points
      try {
        const [wel]: any = await connection.query(
          "SELECT id FROM reward_points_transactions WHERE user_email = ? AND category = 'welcome' LIMIT 1",
          [email]
        );
        if (wel.length === 0) {
          await connection.query(
            `INSERT INTO reward_points_transactions (user_email, points, type, category, description) 
             VALUES (?, 100, 'Credit', 'welcome', 'Welcome Bonus - 100 Signup Points')`,
            [email]
          );
        }
      } catch (ptsErr) {}
    }

    connection.release();

    // Generate JWT
    const token = jwt.sign(
      { 
        uid: user.uid, 
        email: user.email, 
        name: user.name,
        referral_code: user.referral_code,
        referral_link: `https://omaacompany.com/?ref=${user.referral_code}`
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Set HTTP-only Cookie
    const response = NextResponse.json({ 
      success: true, 
      token,
      user: {
        ...user,
        referral_code: user.referral_code,
        referral_link: `https://omaacompany.com/?ref=${user.referral_code}`
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
