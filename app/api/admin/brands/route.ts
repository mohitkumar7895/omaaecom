import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

// GET all brands
export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM brands ORDER BY id DESC");
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

// POST a new brand
export async function POST(req: Request) {
  try {
    const { name, logo_text, logo_color, category, status } = await req.json();

    if (!name || !category) {
      return NextResponse.json({ error: "Name and Category are required" }, { status: 400 });
    }

    const [result]: any = await pool.query(
      "INSERT INTO brands (name, logo_text, logo_color, category, status) VALUES (?, ?, ?, ?, ?)",
      [name, logo_text || null, logo_color || null, category, status || 'Active']
    );

    return NextResponse.json({ message: "Brand created", id: result.insertId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
}
