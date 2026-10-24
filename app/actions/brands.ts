"use server";

import pool from "../../lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function saveBrand(formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const status = formData.get("status") as string;
  const logo = formData.get("logo") as File | null;
  const logoRaw = formData.get("logo_raw") as File | null;
  const logoBase64 = formData.get("logo_base64") as string | null;

  let logoUrl = null;

  const uploadDir = path.join(process.cwd(), "public/uploads/brands");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  let logoBuffer: Buffer | null = null;
  let logoFileName = "";

  if (logo && typeof logo === "object" && "size" in logo && logo.size > 0) {
    logoBuffer = Buffer.from(await logo.arrayBuffer());
    logoFileName = `${Date.now()}-${(logo.name || "logo.webp").replace(/\s+/g, '-')}`;
  } else if (logoRaw && typeof logoRaw === "object" && "size" in logoRaw && logoRaw.size > 0) {
    logoBuffer = Buffer.from(await logoRaw.arrayBuffer());
    logoFileName = `${Date.now()}-${(logoRaw.name || "logo.webp").replace(/\s+/g, '-')}`;
  } else if (logoBase64 && typeof logoBase64 === "string" && logoBase64.startsWith("data:image/")) {
    const match = logoBase64.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (match && match[2]) {
      const ext = match[1] === "jpeg" ? "jpg" : match[1];
      logoBuffer = Buffer.from(match[2], "base64");
      logoFileName = `${Date.now()}-brand.${ext}`;
    }
  }

  if (logoBuffer && logoFileName) {
    const filePath = path.join(uploadDir, logoFileName);
    await writeFile(filePath, logoBuffer);
    logoUrl = `/uploads/brands/${logoFileName}`;
  }

  try {
    const query = `
      INSERT INTO brands (name, category, logo_url, status)
      VALUES (?, ?, ?, ?)
    `;
    
    await pool.query(query, [name, category, logoUrl, status]);
  } catch (error) {
    console.error("Error saving brand:", error);
    return { error: "Failed to save brand" };
  }

  try {
    revalidatePath("/admin/brands");
    revalidatePath("/", "layout");
  } catch {}
  return { success: true };
}
