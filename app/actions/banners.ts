"use server";

import pool from "../../lib/db";
import { revalidatePath } from "next/cache";
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

  async function saveFile(file: File | null) {
    if (!file || file.size === 0) return null;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    // Convert directly to base64 to avoid local filesystem dependency on Vercel
    const mimeType = file.type || "image/jpeg";
    const base64Data = buffer.toString("base64");
    return `data:${mimeType};base64,${base64Data}`;
  }

  try {
    url1 = await saveFile(banner1);
    url2 = await saveFile(banner2);
    url3 = await saveFile(banner3);

    const query = `
      INSERT INTO banners (banner1_url, banner2_url, banner3_url, type)
      VALUES (?, ?, ?, ?)
    `;
    
    await pool.query(query, [url1, url2, url3, banner_type]);
  } catch (error) {
    console.error("Error saving banners:", error);
    return { error: "Failed to save banners" };
  }

  revalidatePath("/admin/banners");
  redirect("/admin/banners");
}

export async function updateBanners(id: string, formData: FormData) {
  const banner1 = formData.get("banner1") as File | null;
  const banner2 = formData.get("banner2") as File | null;
  const banner3 = formData.get("banner3") as File | null;
  const banner_type = (formData.get("banner_type") as string) || "desktop";

  async function saveFile(file: File | null) {
    if (!file || file.size === 0) return null;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "image/jpeg";
    const base64Data = buffer.toString("base64");
    return `data:${mimeType};base64,${base64Data}`;
  }

  try {
    const url1 = await saveFile(banner1);
    const url2 = await saveFile(banner2);
    const url3 = await saveFile(banner3);

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

  revalidatePath("/admin/banners");
  redirect("/admin/banners");
}
