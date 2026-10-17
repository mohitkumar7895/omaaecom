import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import pool from "../../../../lib/db";

import { getAuthToken } from "../../../../lib/auth";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

export async function GET(req: Request) {
  try {
    const token = await getAuthToken(req);

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    let referralCode = decoded.referral_code;

    if (!referralCode && decoded.email) {
      try {
        const [rows]: any = await pool.query(
          "SELECT referral_code FROM users WHERE email = ? LIMIT 1",
          [decoded.email]
        );
        if (rows.length > 0 && rows[0].referral_code) {
          referralCode = rows[0].referral_code;
        } else {
          const randomNum = Math.floor(100000 + Math.random() * 900000);
          referralCode = `OC${randomNum}`;
          await pool.query(
            "UPDATE users SET referral_code = ? WHERE email = ?",
            [referralCode, decoded.email]
          );
        }
      } catch(e) {}
    }

    if (!referralCode) {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      referralCode = `OC${randomNum}`;
    }

    return NextResponse.json({ 
      user: {
        ...decoded,
        referral_code: referralCode,
        referral_link: `https://omaacompany.com/wallet?ref=${referralCode}`
      },
      token
    });
  } catch (error) {
    // Token invalid or expired
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
