import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

interface DecodedToken {
  email: string;
  [key: string]: unknown;
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("omaa_auth_token")?.value;

    const body = await req.json();
    const { order_id, rating, review, tags } = body;

    if (!order_id || !rating) {
      return NextResponse.json({ error: "Order ID and Rating are required" }, { status: 400 });
    }

    const ratingVal = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));
    const reviewText = (review || "").trim();
    const reviewTags = Array.isArray(tags) ? tags.join(", ") : (tags || "");

    // Ensure columns exist
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

    // Update booking record
    const [result]: any = await pool.query(
      `UPDATE bookings 
       SET rating = ?, review = ?, review_tags = ?, reviewed_at = NOW() 
       WHERE order_id = ?`,
      [ratingVal, reviewText, reviewTags, order_id]
    );

    return NextResponse.json({
      success: true,
      message: "Thank you for your rating & review!",
    });
  } catch (error: any) {
    console.error("Error submitting rating review:", error);
    return NextResponse.json({ error: "Failed to submit rating. Please try again." }, { status: 500 });
  }
}
