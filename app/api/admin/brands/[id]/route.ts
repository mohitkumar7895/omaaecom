import { NextResponse } from "next/server";
import pool from "../../../../../lib/db";

// PUT (Update) a brand
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, logo_text, logo_color, category, status } = await req.json();

    if (!name || !category) {
      return NextResponse.json({ error: "Name and Category are required" }, { status: 400 });
    }

    const [result]: any = await pool.query(
      "UPDATE brands SET name = ?, logo_text = ?, logo_color = ?, category = ?, status = ? WHERE id = ?",
      [name, logo_text, logo_color, category, status, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Brand updated" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}

// DELETE a brand
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [result]: any = await pool.query("DELETE FROM brands WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Brand deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}
