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

  let logoUrl = null;

  const uploadDir = path.join(process.cwd(), "public/uploads/brands");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  if (logo && logo.size > 0) {
    const bytes = await logo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${logo.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    logoUrl = `/uploads/brands/${fileName}`;
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

  revalidatePath("/admin/brands");
  redirect("/admin/brands");
}
