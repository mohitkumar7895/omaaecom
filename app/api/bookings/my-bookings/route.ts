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

    // Fetch bookings independently of optional coupon schema.
    let bookings: BookingRow[] = [];
    try {
      const [rows] = await pool.query(
        `SELECT b.*, w.issued_date as warranty_start, w.expiry_date as warranty_end, w.days_valid as warranty_days_valid
         FROM bookings b
         LEFT JOIN warranties w ON b.order_id = w.order_id
         WHERE b.user_email = ?
            OR (? IS NOT NULL AND b.mobile = ?)
         ORDER BY b.created_at DESC`,
        [userEmail, userMobile, userMobile]
      ) as unknown as [BookingRow[]];
      bookings = rows || [];
    } catch (joinErr) {
      // Older databases may not have user_email yet.
      console.warn("User booking query failed, trying legacy fallback:", joinErr instanceof Error ? joinErr.message : joinErr);
      
      if (userMobile) {
        try {
        // Fallback: query bookings by mobile only (legacy approach)
        const [fallbackRows] = await pool.query(
          `SELECT b.*, w.issued_date as warranty_start, w.expiry_date as warranty_end, w.days_valid as warranty_days_valid
           FROM bookings b
           LEFT JOIN warranties w ON b.order_id = w.order_id
           WHERE b.mobile = ? 
           ORDER BY b.created_at DESC LIMIT 50`,
          [userMobile]
        ) as unknown as [BookingRow[]];
        bookings = fallbackRows || [];
        } catch (fallbackErr) {
          console.error("All booking queries failed:", fallbackErr instanceof Error ? fallbackErr.message : fallbackErr);
        }
      }
    }

    // Fetch categories and services to map and resolve category accurately
    const [allCats]: any = await pool.query(`SELECT id, title FROM categories`).catch(() => [[]]);
    const catMap = new Map<number, string>();
    if (Array.isArray(allCats)) {
      allCats.forEach((c: any) => catMap.set(c.id, c.title));
    }

    const [allSvcs]: any = await pool.query(`SELECT id, category_id, title FROM services`).catch(() => [[]]);
    const svcCatMap = new Map<number, number>();
    if (Array.isArray(allSvcs)) {
      allSvcs.forEach((s: any) => svcCatMap.set(s.id, s.category_id));
    }

    // Parse services JSON and resolve category accurately
    const parsedBookings = bookings.map((row: any) => {
      let parsedServices = row.services;
      try {
        if (typeof row.services === 'string') {
          parsedServices = JSON.parse(row.services);
        }
      } catch {}

      // Resolve category accurately
      let resolvedCategory = row.category;
      if (!resolvedCategory || resolvedCategory.toLowerCase() === 'service') {
        if (Array.isArray(parsedServices) && parsedServices.length > 0) {
          const firstSvc = parsedServices[0];
          const catId = firstSvc?.category_id || svcCatMap.get(Number(firstSvc?.id));
          if (catId && catMap.has(catId)) {
            resolvedCategory = catMap.get(catId);
          }
        }
      }
      if (!resolvedCategory || resolvedCategory.toLowerCase() === 'service') {
        resolvedCategory = row.type || 'Home Service';
      }

      return { ...row, category: resolvedCategory, services: parsedServices };
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
