import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

// GET all services
export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT services.*, categories.title as category_title 
      FROM services 
      LEFT JOIN categories ON services.category_id = categories.id 
      ORDER BY services.id DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

// POST a new service
export async function POST(req: Request) {
  try {
    const { category_id, title, rating, reviews, discount } = await req.json();

    if (!category_id || !title) {
      return NextResponse.json({ error: "Category ID and Title are required" }, { status: 400 });
    }

    const [result]: any = await pool.query(
      "INSERT INTO services (category_id, title, rating, reviews, discount) VALUES (?, ?, ?, ?, ?)",
      [category_id, title, rating || '0.0', reviews || '0', discount || null]
    );

    return NextResponse.json({ message: "Service created", id: result.insertId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
