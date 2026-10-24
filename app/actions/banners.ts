"use server";

import pool from "../../lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function saveBanners(formData: FormData) {
  const banner1 = formData.get("banner1") as File | null;
  const banner2 = formData.get("banner2") as File | null;
  const banner3 = formData.get("banner3") as File | null;
  const banner_type = (formData.get("banner_type") as string) || "desktop";

  let url1 = null;
  let url2 = null;
  let url3 = null;

  async function resolveBannerUrl(fieldName: string) {
    const file = formData.get(fieldName) as File | null;
    const fileRaw = formData.get(`${fieldName}_raw`) as File | null;
    const base64Str = formData.get(`${fieldName}_base64`) as string | null;

    if (file && typeof file === "object" && "size" in file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || "image/webp";
      return `data:${mimeType};base64,${buffer.toString("base64")}`;
    }
    if (fileRaw && typeof fileRaw === "object" && "size" in fileRaw && fileRaw.size > 0) {
      const bytes = await fileRaw.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = fileRaw.type || "image/jpeg";
      return `data:${mimeType};base64,${buffer.toString("base64")}`;
    }
    if (base64Str && typeof base64Str === "string" && base64Str.startsWith("data:image/")) {
      return base64Str;
    }
    return null;
  }

  try {
    url1 = await resolveBannerUrl("banner1");
    url2 = await resolveBannerUrl("banner2");
    url3 = await resolveBannerUrl("banner3");

    const query = `
      INSERT INTO banners (banner1_url, banner2_url, banner3_url, type)
      VALUES (?, ?, ?, ?)
    `;
    
    await pool.query(query, [url1, url2, url3, banner_type]);
  } catch (error) {
    console.error("Error saving banners:", error);
    return { error: "Failed to save banners" };
  }

  try {
    revalidateTag("home-catalog", "max");
    revalidatePath("/", "layout");
    revalidatePath("/admin/banners");
  } catch {}
  return { success: true };
}

export async function updateBanners(id: string, formData: FormData) {
  const banner_type = (formData.get("banner_type") as string) || "desktop";

  async function resolveBannerUrl(fieldName: string) {
    const file = formData.get(fieldName) as File | null;
    const fileRaw = formData.get(`${fieldName}_raw`) as File | null;
    const base64Str = formData.get(`${fieldName}_base64`) as string | null;

    if (file && typeof file === "object" && "size" in file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || "image/webp";
      return `data:${mimeType};base64,${buffer.toString("base64")}`;
    }
    if (fileRaw && typeof fileRaw === "object" && "size" in fileRaw && fileRaw.size > 0) {
      const bytes = await fileRaw.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = fileRaw.type || "image/jpeg";
      return `data:${mimeType};base64,${buffer.toString("base64")}`;
    }
    if (base64Str && typeof base64Str === "string" && base64Str.startsWith("data:image/")) {
      return base64Str;
    }
    return null;
  }

  try {
    const url1 = await resolveBannerUrl("banner1");
    const url2 = await resolveBannerUrl("banner2");
    const url3 = await resolveBannerUrl("banner3");

    // Fetch existing
    const [existingRows]: any = await pool.query("SELECT * FROM banners WHERE id = ?", [id]);
    if (existingRows.length > 0) {
      const existing = existingRows[0];
      const finalUrl1 = url1 || existing.banner1_url;
      const finalUrl2 = url2 || existing.banner2_url;
      const finalUrl3 = url3 || existing.banner3_url;

      await pool.query(
        "UPDATE banners SET banner1_url = ?, banner2_url = ?, banner3_url = ?, type = ? WHERE id = ?",
        [finalUrl1, finalUrl2, finalUrl3, banner_type, id]
      );
    }
  } catch (error) {
    console.error("Error updating banners:", error);
    return { error: "Failed to update banners" };
  }

  try {
    revalidateTag("home-catalog", "max");
    revalidatePath("/", "layout");
    revalidatePath("/admin/banners");
  } catch {}
  return { success: true };
}
