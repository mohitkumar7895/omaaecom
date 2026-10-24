import { NextResponse } from "next/server";
import pool from "../../../../../lib/db";

// PUT (Update) a category
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, status, image_url, type, labour_charges, zones, zones_location, warranty_days, short_description } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    let query = "UPDATE categories SET title = ?, status = ?";
    const queryParams: any[] = [title, status || 'Active'];

    if (image_url !== undefined) {
      query += ", image_url = ?";
      queryParams.push(image_url);
    }
    if (type !== undefined) {
      query += ", type = ?";
      queryParams.push(type);
    }
    if (labour_charges !== undefined) {
      query += ", labour_charges = ?";
      queryParams.push(labour_charges);
    }
    if (zones !== undefined) {
      query += ", zones = ?";
      queryParams.push(zones);
    }
    if (zones_location !== undefined) {
      query += ", zones_location = ?";
      queryParams.push(zones_location);
    }
    if (warranty_days !== undefined) {
      query += ", warranty_days = ?";
      queryParams.push(warranty_days);
    }
    if (short_description !== undefined) {
      query += ", short_description = ?";
      queryParams.push(short_description);
    }

    query += " WHERE id = ?";
    queryParams.push(id);

    const [result]: any = await pool.query(query, queryParams);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category updated" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE a category
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [result]: any = await pool.query("DELETE FROM categories WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
