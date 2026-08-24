import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

interface DecodedToken {
  email: string;
  [key: string]: unknown;
}

interface BookingRow {
  [key: string]: unknown;
  services?: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("omaa_auth_token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    const userEmail = decoded.email;

    // Safely try to fetch user's mobile to also match guest bookings
    let userMobile: string | null = null;
    try {
      const [userRows] = await pool.query(
        `SELECT mobile FROM users WHERE email = ? LIMIT 1`,
        [userEmail]
      ) as unknown as [Array<{ mobile?: string }>];
      userMobile = userRows[0]?.mobile || null;
    } catch (err) {
      console.warn("Warning: Could not fetch user mobile:", err instanceof Error ? err.message : err);
    }

    // Try to fetch bookings with coupon join (new schema)
    let bookings: BookingRow[] = [];
    try {
      const [rows] = await pool.query(
        `SELECT b.*, c.status as coupon_status 
         FROM bookings b
         LEFT JOIN coupons c ON b.coupon_code = c.code
         WHERE b.user_email = ? 
           OR (b.user_email IS NULL AND ? IS NOT NULL AND b.mobile = ?)
         ORDER BY b.created_at DESC`,
        [userEmail, userMobile, userMobile]
      ) as unknown as [BookingRow[]];
      bookings = rows || [];
    } catch (joinErr) {
      // If the join fails (missing columns/tables), try simpler query
      console.warn("Complex query failed, trying fallback:", joinErr instanceof Error ? joinErr.message : joinErr);
      
      try {
        // Fallback: query bookings by mobile only (legacy approach)
        const [fallbackRows] = await pool.query(
          `SELECT * FROM bookings WHERE mobile = ? ORDER BY created_at DESC LIMIT 50`,
          [userMobile]
        ) as unknown as [BookingRow[]];
        bookings = fallbackRows || [];
      } catch (fallbackErr) {
        console.error("All booking queries failed:", fallbackErr instanceof Error ? fallbackErr.message : fallbackErr);
        // Return empty array if all queries fail
        bookings = [];
      }
    }

    // Parse services JSON if needed
    const parsedBookings = bookings.map((row: BookingRow) => {
      let parsedServices = row.services;
      try {
        if (typeof row.services === 'string') {
          parsedServices = JSON.parse(row.services);
        }
      } catch {}
      return { ...row, services: parsedServices };
    });

    return NextResponse.json({ success: true, bookings: parsedBookings });
  } catch (error) {
    // Distinguish auth errors vs DB errors
    if (error instanceof Error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      console.error("my-bookings error:", error.message);
      return NextResponse.json({ error: "Database Error: " + error.message }, { status: 500 });
    }
    console.error("my-bookings error:", error);
    return NextResponse.json({ error: "Database Error: Unknown" }, { status: 500 });
  }
}
