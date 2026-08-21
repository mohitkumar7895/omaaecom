import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

// GET all categories
export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM categories ORDER BY id DESC");
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST a new category
export async function POST(req: Request) {
  try {
    const { title, status } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const [result]: any = await pool.query(
      "INSERT INTO categories (title, status) VALUES (?, ?)",
      [title, status || 'Active']
    );

    return NextResponse.json({ message: "Category created", id: result.insertId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
