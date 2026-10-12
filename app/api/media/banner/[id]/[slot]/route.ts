import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { mediaResponseFromStored } from "@/lib/public-media";

export async function GET(req: Request, { params }: { params: Promise<{ id: string; slot: string }> }) {
  const { id, slot } = await params;
  const bannerId = Number(id);
  const slotNum = Number(slot);

  const fallbackBanners = [
    "/banners/Banner2-RO-Service.jpg",
    "/banners/Banner3-Home-Services-Doorstep.jpg",
    "/banners/Banner3-Premium-Package.jpg"
  ];
  const fallbackUrl = fallbackBanners[slotNum - 1] || fallbackBanners[0];

  if (!bannerId || ![1, 2, 3].includes(slotNum)) {
    return Response.redirect(new URL(fallbackUrl, req.url).toString(), 302);
  }
  const col = slotNum === 1 ? "banner1_url" : slotNum === 2 ? "banner2_url" : "banner3_url";
  try {
    const [rows]: any = await pool.query(`SELECT ${col} AS src FROM banners WHERE id = ? LIMIT 1`, [bannerId]);
    const src = rows?.[0]?.src;
    if (!src || !String(src).trim()) {
      return Response.redirect(new URL(fallbackUrl, req.url).toString(), 302);
    }
    const res = mediaResponseFromStored(src, req.url);
    if (res.status === 404 || res.status === 500) {
      return Response.redirect(new URL(fallbackUrl, req.url).toString(), 302);
    }
    return res;
  } catch (error) {
    console.error("Banner media error, serving fallback:", error);
    return Response.redirect(new URL(fallbackUrl, req.url).toString(), 302);
  }
}
