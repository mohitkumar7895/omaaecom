import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("omaa_auth_token")?.value;
    
    let userEmail = "";
    let userMobile = "";
    let userName = "Valued Customer";

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userEmail = decoded.email || "";
        userMobile = decoded.mobile || "";
        userName = decoded.name || "Valued Customer";
      } catch (e) {}
    }

    let couponCode = "";

    // 1. Check bookings table for user's latest coupon code
    if (userEmail || userMobile) {
      const [bookingRows]: any = await pool.query(
        "SELECT coupon_code, customer_name FROM bookings WHERE (user_email = ? OR mobile = ?) AND coupon_code IS NOT NULL AND coupon_code != '' ORDER BY id DESC LIMIT 1",
        [userEmail || "", userMobile || ""]
      );

      if (bookingRows && bookingRows.length > 0 && bookingRows[0].coupon_code) {
        couponCode = bookingRows[0].coupon_code;
        userName = bookingRows[0].customer_name || userName;
      }
    }

    // 2. Check coupons table
    if (!couponCode && userMobile) {
      const [couponRows]: any = await pool.query(
        "SELECT code FROM coupons WHERE mobile = ? LIMIT 1",
        [userMobile]
      );
      if (couponRows && couponRows.length > 0 && couponRows[0].code) {
        couponCode = couponRows[0].code;
      }
    }

    // 3. Fallback: generate dynamic OC + 6-digit code
    if (!couponCode) {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      couponCode = `OC${randomNum}`;
    }

    const referralLink = `https://omaacompany.in/?ref=${couponCode}`;

    // Get total referral earnings
    let totalEarnings = 0;
    if (userEmail) {
      try {
        const [walletTxs]: any = await pool.query(
          "SELECT SUM(amount) as totalEarnings FROM wallet_transactions WHERE user_email = ? AND type = 'Credit' AND description LIKE '%Referral%'",
          [userEmail]
        );
        totalEarnings = Number(walletTxs[0]?.totalEarnings || 0);
      } catch(e) {}
    }

    return NextResponse.json({ 
      authenticated: Boolean(token),
      couponCode,
      referralLink,
      user: {
        email: userEmail,
        name: userName
      },
      totalEarnings
    });
  } catch (error: any) {
    console.error("Fetch referral user error:", error);
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const fallbackCode = `OC${randomNum}`;
    return NextResponse.json({ 
      authenticated: false,
      couponCode: fallbackCode,
      referralLink: `https://omaacompany.in/?ref=${fallbackCode}`,
      totalEarnings: 0
    });
  }
}
