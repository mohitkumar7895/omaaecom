import { NextResponse } from "next/server";
import pool from "../../../../../lib/db";

// PUT (Update) a service
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { category_id, title, rating, reviews, discount } = await req.json();

    if (!category_id || !title) {
      return NextResponse.json({ error: "Category ID and Title are required" }, { status: 400 });
    }

    const [result]: any = await pool.query(
      "UPDATE services SET category_id = ?, title = ?, rating = ?, reviews = ?, discount = ? WHERE id = ?",
      [category_id, title, rating, reviews, discount, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Service updated" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

// DELETE a service
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [result]: any = await pool.query("DELETE FROM services WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Service deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
