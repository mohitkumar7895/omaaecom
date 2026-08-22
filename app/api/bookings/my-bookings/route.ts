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

    const [rows]: any = await pool.query(
      `SELECT * FROM bookings WHERE user_email = ? ORDER BY created_at DESC`,
      [userEmail]
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
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized or Database Error" }, { status: 401 });
  }
}
