import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

// GET all banners
export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM banners ORDER BY display_order ASC");
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

// POST a new banner
export async function POST(req: Request) {
  try {
    const { type, title, subtitle, image_url, display_order } = await req.json();

    if (!type) {
      return NextResponse.json({ error: "Type is required (promo or image)" }, { status: 400 });
    }

    const [result]: any = await pool.query(
      "INSERT INTO banners (type, title, subtitle, image_url, display_order) VALUES (?, ?, ?, ?, ?)",
      [type, title || null, subtitle || null, image_url || null, display_order || 0]
    );

    return NextResponse.json({ message: "Banner created", id: result.insertId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}
