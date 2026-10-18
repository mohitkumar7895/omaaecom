import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import pool from "../../../../lib/db";

import { getAuthToken } from "../../../../lib/auth";
import { generateReferralCode } from "../../../../lib/rewards";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

export async function GET(req: Request) {
  try {
    const token = await getAuthToken(req);

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    let referralCode = "";

    if (decoded.email) {
      try {
        const [rows]: any = await pool.query(
          "SELECT referral_code FROM users WHERE email = ? LIMIT 1",
          [decoded.email]
        );
        if (rows.length > 0 && rows[0].referral_code) {
          referralCode = rows[0].referral_code;
        }
      } catch(e) {}
    }

    if (!referralCode || referralCode.startsWith("OC") || referralCode.length !== 6) {
      referralCode = generateReferralCode();
      if (decoded.email) {
        try {
          await pool.query(
            "UPDATE users SET referral_code = ? WHERE email = ?",
            [referralCode, decoded.email]
          );
        } catch(e) {}
      }
    }

    const updatedUser = {
      ...decoded,
      referral_code: referralCode,
      referral_link: `https://omaacompany.com/?ref=${referralCode}`
    };

    const newToken = jwt.sign(updatedUser, JWT_SECRET, { expiresIn: "30d" });
    const response = NextResponse.json({ 
      user: updatedUser,
      token: newToken
    });
    response.cookies.set("omaa_auth_token", newToken, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: false,
    });
    return response;
  } catch (error) {
    // Token invalid or expired
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
