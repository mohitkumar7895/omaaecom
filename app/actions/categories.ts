"use server";

import pool from "../../lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function getActiveCategories() {
  try {
    const [rows]: any = await pool.query("SELECT id, title FROM categories WHERE status = 'Active'");
    return rows;
  } catch (error) {
    console.error("Failed to fetch active categories:", error);
    return [];
  }
}


export async function saveCategory(formData: FormData) {
  const title = formData.get("title") as string;
  const type = formData.get("type") as string;
  const labourCharges = formData.get("labour_charges") as string;
  const zones = formData.get("zones") as string;
  const zonesLocation = formData.get("zones_location") as string;
  const image = formData.get("image") as File | null;

  let imageUrl = "";

  const uploadDir = path.join(process.cwd(), "public/uploads/categories");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  if (image && image.size > 0) {
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    imageUrl = `/uploads/categories/${fileName}`;
  }

  try {
    const query = `
      INSERT INTO categories (title, type, labour_charges, zones, zones_location, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await pool.query(query, [title, type, parseInt(labourCharges), parseInt(zones), zonesLocation || '', imageUrl]);
  } catch (error) {
    console.error("Error saving category:", error);
    return { error: "Failed to save category" };
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
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

  try {
    let query = `
      UPDATE categories 
      SET title = ?, type = ?, labour_charges = ?, zones = ?, zones_location = ?
    `;
    let params: any[] = [title, type, parseInt(labourCharges) || 0, parseInt(zones) || 1, zonesLocation || ''];

    if (image && image.size > 0) {
      const uploadDir = path.join(process.cwd(), "public/uploads/categories");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`;
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      
      const imageUrl = `/uploads/categories/${fileName}`;
      query += `, image_url = ?`;
      params.push(imageUrl);
    }

    query += ` WHERE id = ?`;
    params.push(id);
    
    await pool.query(query, params);
  } catch (error) {
    console.error("Error updating category:", error);
    return { error: "Failed to update category" };
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

