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

  let url1 = null;
  let url2 = null;
  let url3 = null;

  const uploadDir = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  async function saveFile(file: File | null) {
    if (!file || file.size === 0) return null;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    return `/uploads/${fileName}`;
  }

  try {
    url1 = await saveFile(banner1);
    url2 = await saveFile(banner2);
    url3 = await saveFile(banner3);

    const query = `
      INSERT INTO banners (banner1_url, banner2_url, banner3_url)
      VALUES (?, ?, ?)
    `;
    
    await pool.query(query, [url1, url2, url3]);
  } catch (error) {
    console.error("Error saving banners:", error);
    return { error: "Failed to save banners" };
  }

  revalidatePath("/admin/banners");
  redirect("/admin/banners");
}
