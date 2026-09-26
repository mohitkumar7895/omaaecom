import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { mediaResponseFromStored } from "@/lib/public-media";

export async function GET(req: Request, { params }: { params: Promise<{ id: string; slot: string }> }) {
  const { id, slot } = await params;
  const bannerId = Number(id);
  const slotNum = Number(slot);
  if (!bannerId || ![1, 2, 3].includes(slotNum)) {
    return NextResponse.json({ error: "Invalid banner" }, { status: 400 });
  }
  const col = slotNum === 1 ? "banner1_url" : slotNum === 2 ? "banner2_url" : "banner3_url";
  try {
    const [rows]: any = await pool.query(`SELECT ${col} AS src FROM banners WHERE id = ? LIMIT 1`, [bannerId]);
    return mediaResponseFromStored(rows?.[0]?.src, req.url);
  } catch (error) {
    console.error("Banner media error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
