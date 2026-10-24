"use server";

import { unstable_cache } from "next/cache";
import pool from "../../lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

async function runMigration() {
  try {
    await pool.query("ALTER TABLE categories ADD COLUMN IF NOT EXISTS warranty_days INT DEFAULT 180");
  } catch (e) {
    try {
      await pool.query("ALTER TABLE categories ADD COLUMN warranty_days INT DEFAULT 180");
    } catch (err) {}
  }
  try {
    await pool.query("ALTER TABLE categories ADD COLUMN IF NOT EXISTS short_description TEXT DEFAULT NULL");
  } catch (e) {
    try {
      await pool.query("ALTER TABLE categories ADD COLUMN short_description TEXT DEFAULT NULL");
    } catch (err) {}
  }
}

export async function getActiveCategories() {
  return unstable_cache(
    async () => {
      try {
        const [rows]: any = await pool.query("SELECT id, title FROM categories WHERE status = 'Active'");
        return rows;
      } catch (error) {
        console.error("Failed to fetch active categories:", error);
        return [];
      }
    },
    ["nav-active-categories"],
    { revalidate: 300, tags: ["home-catalog"] }
  )();
}


async function extractImageBuffer(
  image: File | null,
  imageRaw: File | null,
  imageBase64: string | null
): Promise<{ buffer: Buffer; fileName: string } | null> {
  // 1. Check optimized file
  if (image && typeof image === "object" && "size" in image && image.size > 0) {
    const bytes = await image.arrayBuffer();
    const safeName = (image.name || "category.webp").replace(/\s+/g, "-");
    return {
      buffer: Buffer.from(bytes),
      fileName: `${Date.now()}-${safeName}`,
    };
  }

  // 2. Check raw file from file picker
  if (imageRaw && typeof imageRaw === "object" && "size" in imageRaw && imageRaw.size > 0) {
    const bytes = await imageRaw.arrayBuffer();
    const safeName = (imageRaw.name || "category.webp").replace(/\s+/g, "-");
    return {
      buffer: Buffer.from(bytes),
      fileName: `${Date.now()}-${safeName}`,
    };
  }

  // 3. Check base64 data URL
  if (imageBase64 && typeof imageBase64 === "string" && imageBase64.startsWith("data:image/")) {
    const match = imageBase64.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (match && match[2]) {
      const ext = match[1] === "jpeg" ? "jpg" : match[1];
      return {
        buffer: Buffer.from(match[2], "base64"),
        fileName: `${Date.now()}-category.${ext}`,
      };
    }
  }

  return null;
}

export async function saveCategory(formData: FormData) {
  const title = formData.get("title") as string;
  const type = formData.get("type") as string;
  const labourCharges = formData.get("labour_charges") as string;
  const zones = formData.get("zones") as string;
  const zonesLocation = formData.get("zones_location") as string;
  const image = formData.get("image") as File | null;
  const imageRaw = formData.get("image_raw") as File | null;
  const imageBase64 = formData.get("image_base64") as string | null;
  const warrantyDays = formData.get("warranty_days") as string || "180";
  const shortDescription = formData.get("short_description") as string || "";

  let imageUrl = "";

  const extracted = await extractImageBuffer(image, imageRaw, imageBase64);
  if (extracted) {
    const uploadDir = path.join(process.cwd(), "public/uploads/categories");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, extracted.fileName);
    await writeFile(filePath, extracted.buffer);
    imageUrl = `/uploads/categories/${extracted.fileName}`;
  }

  await runMigration();

  try {
    const query = `
      INSERT INTO categories (title, type, labour_charges, zones, zones_location, image_url, warranty_days, short_description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await pool.query(query, [title, type, parseInt(labourCharges), parseInt(zones), zonesLocation || '', imageUrl, parseInt(warrantyDays), shortDescription]);
  } catch (error) {
    console.error("Error saving category:", error);
    return { error: "Failed to save category" };
  }

  try {
    revalidatePath("/admin/categories");
    revalidatePath("/services");
    revalidatePath("/", "layout");
  } catch {}
  return { success: true };
}

export async function deleteCategory(formData: FormData) {
  const id = formData.get("id");
  if (id) {
    await pool.query("DELETE FROM categories WHERE id = ?", [id]);
    revalidatePath("/admin/categories");
  }
}

export async function updateCategory(formData: FormData) {
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const type = formData.get("type") as string;
  const labourCharges = formData.get("labour_charges") as string;
  const zones = formData.get("zones") as string;
  const zonesLocation = formData.get("zones_location") as string;
  const image = formData.get("image") as File | null;
  const imageRaw = formData.get("image_raw") as File | null;
  const imageBase64 = formData.get("image_base64") as string | null;
  const imageRemoved = formData.get("image_removed") as string | null;
  const warrantyDays = formData.get("warranty_days") as string || "180";
  const shortDescription = formData.get("short_description") as string || "";

  await runMigration();

  try {
    let query = `
      UPDATE categories 
      SET title = ?, type = ?, labour_charges = ?, zones = ?, zones_location = ?, warranty_days = ?, short_description = ?
    `;
    let params: any[] = [title, type, parseInt(labourCharges) || 0, parseInt(zones) || 1, zonesLocation || '', parseInt(warrantyDays), shortDescription];

    const extracted = await extractImageBuffer(image, imageRaw, imageBase64);
    if (extracted) {
      const uploadDir = path.join(process.cwd(), "public/uploads/categories");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, extracted.fileName);
      await writeFile(filePath, extracted.buffer);
      
      const imageUrl = `/uploads/categories/${extracted.fileName}`;
      query += `, image_url = ?`;
      params.push(imageUrl);
    } else if (imageRemoved === "1") {
      query += `, image_url = NULL`;
    }

    query += ` WHERE id = ?`;
    params.push(id);
    
    await pool.query(query, params);
  } catch (error) {
    console.error("Error updating category:", error);
    return { error: "Failed to update category" };
  }

  try {
    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/edit/${id}`);
    revalidatePath("/services");
    revalidatePath("/");
    revalidatePath("/", "layout");
  } catch {}
  return { success: true };
}

