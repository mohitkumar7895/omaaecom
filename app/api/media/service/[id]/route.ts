import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { mediaResponseFromStored } from "@/lib/public-media";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!id) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  try {
    const [rows]: any = await pool.query("SELECT image_url FROM services WHERE id = ? LIMIT 1", [id]);
    return mediaResponseFromStored(rows?.[0]?.image_url, req.url);
  } catch (error) {
    console.error("Service media error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
