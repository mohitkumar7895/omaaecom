"use server";

import pool from "../../lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import path from "path";
import fs from "fs";

async function extractImageBuffer(
  image: File | null,
  imageRaw: File | null,
  imageBase64: string | null
): Promise<{ buffer: Buffer; fileName: string } | null> {
  if (image && typeof image === "object" && "size" in image && image.size > 0) {
    const bytes = await image.arrayBuffer();
    const safeName = (image.name || "subcategory.webp").replace(/\s+/g, "-");
    return {
      buffer: Buffer.from(bytes),
      fileName: `${Date.now()}-${safeName}`,
    };
  }

  if (imageRaw && typeof imageRaw === "object" && "size" in imageRaw && imageRaw.size > 0) {
    const bytes = await imageRaw.arrayBuffer();
    const safeName = (imageRaw.name || "subcategory.webp").replace(/\s+/g, "-");
    return {
      buffer: Buffer.from(bytes),
      fileName: `${Date.now()}-${safeName}`,
    };
  }

  if (imageBase64 && typeof imageBase64 === "string" && imageBase64.startsWith("data:image/")) {
    const match = imageBase64.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (match && match[2]) {
      const ext = match[1] === "jpeg" ? "jpg" : match[1];
      return {
        buffer: Buffer.from(match[2], "base64"),
        fileName: `${Date.now()}-subcategory.${ext}`,
      };
    }
  }

  return null;
}

export async function saveSubcategory(formData: FormData) {
  const categoryId = formData.get("category_id") as string;
  const title = formData.get("title") as string;
  const image = formData.get("image") as File | null;
  const imageRaw = formData.get("image_raw") as File | null;
  const imageBase64 = formData.get("image_base64") as string | null;

  let imageUrl = "";

  const extracted = await extractImageBuffer(image, imageRaw, imageBase64);
  if (extracted) {
    const uploadDir = path.join(process.cwd(), "public/uploads/subcategories");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, extracted.fileName);
    fs.writeFileSync(filePath, extracted.buffer);
    imageUrl = `/uploads/subcategories/${extracted.fileName}`;
  }

  try {
    const query = `
      INSERT INTO subcategories (category_id, title, image_url)
      VALUES (?, ?, ?)
    `;
    
    await pool.query(query, [parseInt(categoryId), title, imageUrl]);
  } catch (error) {
    console.error("Error saving subcategory:", error);
    return { error: "Failed to save subcategory" };
  }

  try {
    revalidatePath("/admin/subcategories");
    revalidatePath("/", "layout");
  } catch {}
  return { success: true };
}

export async function updateSubcategory(formData: FormData) {
  const id = formData.get("id") as string;
  const categoryId = formData.get("category_id") as string;
  const title = formData.get("title") as string;
  const image = formData.get("image") as File | null;
  const imageRaw = formData.get("image_raw") as File | null;
  const imageBase64 = formData.get("image_base64") as string | null;
  const imageRemoved = formData.get("image_removed") as string | null;

  try {
    let query = `
      UPDATE subcategories 
      SET category_id = ?, title = ?
    `;
    let params: any[] = [parseInt(categoryId), title];

    const extracted = await extractImageBuffer(image, imageRaw, imageBase64);
    if (extracted) {
      const uploadDir = path.join(process.cwd(), "public/uploads/subcategories");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, extracted.fileName);
      fs.writeFileSync(filePath, extracted.buffer);

      const imageUrl = `/uploads/subcategories/${extracted.fileName}`;
      query += `, image_url = ?`;
      params.push(imageUrl);
    } else if (imageRemoved === "1") {
      query += `, image_url = NULL`;
    }

    query += ` WHERE id = ?`;
    params.push(id);

    await pool.query(query, params);
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return { error: "Failed to update subcategory" };
  }

  try {
    revalidatePath("/admin/subcategories");
    revalidatePath("/", "layout");
  } catch {}
  return { success: true };
}

export async function deleteSubcategory(formData: FormData) {
  const id = formData.get("id") as string;

  try {
    // Optionally fetch image_url and delete the file here if desired
    await pool.query("DELETE FROM subcategories WHERE id = ?", [id]);
  } catch (error) {
    console.error("Error deleting subcategory:", error);
  }

  revalidatePath("/admin/subcategories");
}
