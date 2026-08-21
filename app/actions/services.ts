"use server";

import pool from "../../lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import path from "path";
import fs from "fs";

export async function saveService(formData: FormData) {
  const category_id = formData.get("category_id") as string;
  const subcategory_id = formData.get("subcategory_id") as string;
  const title = formData.get("title") as string;
  const original_price = formData.get("original_price") as string;
  const selling_price = formData.get("selling_price") as string;
  const rating = formData.get("rating") as string || "0.0";
  const warranty_days = formData.get("warranty_days") as string || "180";
  const warranty_description = formData.get("warranty_description") as string || "";
  const short_description = formData.get("short_description") as string || "";
  const long_description = formData.get("long_description") as string || "";
  
  const image = formData.get("image") as File | null;
  let imageUrl = "";

  if (image && image.size > 0) {
    const uploadDir = path.join(process.cwd(), "public/uploads/services");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const fileName = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await image.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    imageUrl = `/uploads/services/${fileName}`;
  }

  try {
    const query = `
      INSERT INTO services (
        category_id, subcategory_id, title, original_price, selling_price, 
        rating, warranty_days, warranty_description, short_description, long_description, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await pool.query(query, [
      parseInt(category_id),
      parseInt(subcategory_id),
      title,
      original_price ? parseFloat(original_price) : null,
      parseFloat(selling_price),
      rating,
      parseInt(warranty_days),
      warranty_description,
      short_description,
      long_description,
      imageUrl || null
    ]);
  } catch (error) {
    console.error("Error saving service:", error);
    return { error: "Failed to save service" };
  }

  revalidatePath("/admin/services");
  redirect("/admin/services");
}

export async function updateService(formData: FormData) {
  const id = formData.get("id") as string;
  const category_id = formData.get("category_id") as string;
  const subcategory_id = formData.get("subcategory_id") as string;
  const title = formData.get("title") as string;
  const original_price = formData.get("original_price") as string;
  const selling_price = formData.get("selling_price") as string;
  const rating = formData.get("rating") as string || "0.0";
  const warranty_days = formData.get("warranty_days") as string || "180";
  const warranty_description = formData.get("warranty_description") as string || "";
  const short_description = formData.get("short_description") as string || "";
  const long_description = formData.get("long_description") as string || "";
  
  const image = formData.get("image") as File | null;

  try {
    let query = `
      UPDATE services SET 
        category_id = ?, subcategory_id = ?, title = ?, original_price = ?, selling_price = ?, 
        rating = ?, warranty_days = ?, warranty_description = ?, short_description = ?, long_description = ?
    `;
    
    let params: any[] = [
      parseInt(category_id), parseInt(subcategory_id), title, 
      original_price ? parseFloat(original_price) : null, parseFloat(selling_price), 
      rating, parseInt(warranty_days), warranty_description, short_description, long_description
    ];

    if (image && image.size > 0) {
      const uploadDir = path.join(process.cwd(), "public/uploads/services");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const fileName = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`;
      const filePath = path.join(uploadDir, fileName);
      const buffer = Buffer.from(await image.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      
      query += `, image_url = ?`;
      params.push(`/uploads/services/${fileName}`);
    }

    query += ` WHERE id = ?`;
    params.push(id);

    await pool.query(query, params);
  } catch (error) {
    console.error("Error updating service:", error);
    return { error: "Failed to update service" };
  }

  revalidatePath("/admin/services");
  redirect("/admin/services");
}

export async function deleteService(formData: FormData) {
  const id = formData.get("id") as string;

  try {
    await pool.query("DELETE FROM services WHERE id = ?", [id]);
  } catch (error) {
    console.error("Error deleting service:", error);
  }

  revalidatePath("/admin/services");
}
