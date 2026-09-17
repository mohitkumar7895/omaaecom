"use server";

import pool from "../../lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import path from "path";
import fs from "fs";

export async function saveSubcategory(formData: FormData) {
  const categoryId = formData.get("category_id") as string;
  const title = formData.get("title") as string;
  const image = formData.get("image") as File | null;

  let imageUrl = "";

  if (image && image.size > 0) {
    const uploadDir = path.join(process.cwd(), "public/uploads/subcategories");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${image.name}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await image.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    imageUrl = `/uploads/subcategories/${fileName}`;
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

  revalidatePath("/admin/subcategories");
  redirect("/admin/subcategories");
}

export async function updateSubcategory(formData: FormData) {
  const id = formData.get("id") as string;
  const categoryId = formData.get("category_id") as string;
  const title = formData.get("title") as string;
  const image = formData.get("image") as File | null;

  try {
    let query = `
      UPDATE subcategories 
      SET category_id = ?, title = ?
    `;
    let params: any[] = [parseInt(categoryId), title];

    if (image && image.size > 0) {
      const uploadDir = path.join(process.cwd(), "public/uploads/subcategories");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${image.name}`;
      const filePath = path.join(uploadDir, fileName);

      const buffer = Buffer.from(await image.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      const imageUrl = `/uploads/subcategories/${fileName}`;
      query += `, image_url = ?`;
      params.push(imageUrl);
    }

    query += ` WHERE id = ?`;
    params.push(id);

    await pool.query(query, params);
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return { error: "Failed to update subcategory" };
  }

  revalidatePath("/admin/subcategories");
  redirect("/admin/subcategories");
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
