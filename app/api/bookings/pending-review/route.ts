import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

interface DecodedToken {
  email: string;
  [key: string]: unknown;
}

export async function GET() {
  try {
    // Ensure rating columns exist in bookings table
    try {
      await pool.query("ALTER TABLE bookings ADD COLUMN rating INT DEFAULT NULL");
    } catch (_) {}
    try {
      await pool.query("ALTER TABLE bookings ADD COLUMN review TEXT DEFAULT NULL");
    } catch (_) {}
    try {
      await pool.query("ALTER TABLE bookings ADD COLUMN review_tags VARCHAR(255) DEFAULT NULL");
    } catch (_) {}
    try {
      await pool.query("ALTER TABLE bookings ADD COLUMN reviewed_at TIMESTAMP NULL DEFAULT NULL");
    } catch (_) {}

    const cookieStore = await cookies();
    const token = cookieStore.get("omaa_auth_token")?.value;

    if (!token) {
      return NextResponse.json({ pendingBooking: null });
    }

    let userEmail = "";
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      userEmail = decoded.email;
    } catch (_) {
      return NextResponse.json({ pendingBooking: null });
    }

    if (!userEmail) {
      return NextResponse.json({ pendingBooking: null });
    }

    // Safely fetch user mobile
    let userMobile: string | null = null;
    try {
      const [userRows]: any = await pool.query(
        "SELECT mobile FROM users WHERE email = ? LIMIT 1",
        [userEmail]
      );
      userMobile = userRows[0]?.mobile || null;
    } catch (_) {}

    // Find the latest completed booking where rating is missing or null
    let query = `
      SELECT id, order_id, customer_name, mobile, category, services, total, booking_date, time_slot, working_status, created_at
      FROM bookings
      WHERE (LOWER(TRIM(working_status)) IN ('complete', 'completed'))
        AND (rating IS NULL OR rating = 0)
        AND (user_email = ? OR (? IS NOT NULL AND mobile = ?))
      ORDER BY id DESC
      LIMIT 1
    `;

    const [rows]: any = await pool.query(query, [userEmail, userMobile, userMobile]);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ pendingBooking: null });
    }

    const booking = rows[0];

    // Parse services if stringified
    let parsedServices = [];
    if (typeof booking.services === "string") {
      try {
        parsedServices = JSON.parse(booking.services);
      } catch (_) {
        parsedServices = [{ title: booking.services }];
      }
    } else if (Array.isArray(booking.services)) {
      parsedServices = booking.services;
    }

    return NextResponse.json({
      pendingBooking: {
        id: booking.id,
        order_id: booking.order_id,
        customer_name: booking.customer_name,
        category: booking.category,
        services: parsedServices,
        total: booking.total,
        booking_date: booking.booking_date,
        time_slot: booking.time_slot,
      },
    });
  } catch (error: any) {
    console.error("Error in pending-review API:", error);
    return NextResponse.json({ pendingBooking: null });
  }
}
