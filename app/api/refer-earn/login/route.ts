import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // 1. Verify credentials in referral_registrations
      const [rows]: any = await connection.query(
        "SELECT * FROM referral_registrations WHERE email = ?",
        [email]
      );

      if (rows.length === 0) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      const referralUser = rows[0];

      // Compare password
      const isMatch = await bcrypt.compare(password, referralUser.password_hash);
      if (!isMatch) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      // 2. Sync with main users table so they can use standard features (like Wallet)
      const [userRows]: any = await connection.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      let user;
      if (userRows.length === 0) {
        const uid = `email-${Date.now()}`;
        await connection.query(
          "INSERT INTO users (uid, email, name) VALUES (?, ?, ?)",
          [uid, email, referralUser.name]
        );
        user = { uid, email, name: referralUser.name };
      } else {
        user = userRows[0];
      }

      // 3. Generate JWT
      const token = jwt.sign(
        { uid: user.uid, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: "30d" }
      );

      // 4. Set Cookie
      const response = NextResponse.json({ success: true, user });
      response.cookies.set("omaa_auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });

      return response;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error("Refer-Earn Login Error:", error);
    return NextResponse.json({ error: "Failed to login. Please try again." }, { status: 500 });
  }
}
