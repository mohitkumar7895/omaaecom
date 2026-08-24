import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("omaa_auth_token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userEmail = decoded.email;

    // Safely try to fetch user's mobile to also match guest bookings
    let userMobile: string | null = null;
    try {
      const [userRows]: any = await pool.query(
        `SELECT mobile FROM users WHERE email = ? LIMIT 1`,
        [userEmail]
      );
      userMobile = userRows[0]?.mobile || null;
    } catch (_) {
      // mobile column might not exist, that's ok
    }

    const [rows]: any = await pool.query(
      `SELECT b.*, c.status as coupon_status 
       FROM bookings b
       LEFT JOIN coupons c ON b.coupon_code = c.code
       WHERE b.user_email = ? 
         OR (b.user_email IS NULL AND ? IS NOT NULL AND b.mobile = ?)
       ORDER BY b.created_at DESC`,
      [userEmail, userMobile, userMobile]
    );

    const bookings = rows.map((row: any) => {
      let parsedServices = row.services;
      try {
        if (typeof row.services === 'string') {
          parsedServices = JSON.parse(row.services);
        }
      } catch {}
      return { ...row, services: parsedServices };
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    // Distinguish auth errors vs DB errors
    if (error?.name === 'JsonWebTokenError' || error?.name === 'TokenExpiredError') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("my-bookings error:", error?.message || error);
    return NextResponse.json({ error: "Database Error: " + (error?.message || "Unknown") }, { status: 500 });
  }
}
