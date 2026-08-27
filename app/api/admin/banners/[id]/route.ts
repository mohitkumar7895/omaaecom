import { NextResponse } from "next/server";
import pool from "../../../../../lib/db";

// GET a banner
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [rows]: any = await pool.query("SELECT * FROM banners WHERE id = ?", [id]);
    
    if (rows.length === 0) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error fetching banner:", error);
    return NextResponse.json({ error: "Failed to fetch banner" }, { status: 500 });
  }
}

// PUT (Update) a banner
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { type, title, subtitle, image_url, display_order } = await req.json();

    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

    const [result]: any = await pool.query(
      "UPDATE banners SET type = ?, title = ?, subtitle = ?, image_url = ?, display_order = ? WHERE id = ?",
      [type, title, subtitle, image_url, display_order, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Banner updated" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

// DELETE a banner
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [result]: any = await pool.query("DELETE FROM banners WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Banner deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}
