"use server";

import pool from "../../lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadImageToSupabase } from "../../lib/supabase";

async function extractImageBuffer(
  image: File | null,
  imageRaw: File | null,
  imageBase64: string | null
): Promise<{ buffer: Buffer; fileName: string } | null> {
  if (image && typeof image === "object" && "size" in image && image.size > 0) {
    const bytes = await image.arrayBuffer();
    const safeName = (image.name || "service.webp").replace(/\s+/g, "-");
    return {
      buffer: Buffer.from(bytes),
      fileName: `${Date.now()}-${safeName}`,
    };
  }

  if (imageRaw && typeof imageRaw === "object" && "size" in imageRaw && imageRaw.size > 0) {
    const bytes = await imageRaw.arrayBuffer();
    const safeName = (imageRaw.name || "service.webp").replace(/\s+/g, "-");
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
        fileName: `${Date.now()}-service.${ext}`,
      };
    }
  }

  return null;
}

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
  const imageRaw = formData.get("image_raw") as File | null;
  const imageBase64 = formData.get("image_base64") as string | null;
  let imageUrl = "";

  const extracted = await extractImageBuffer(image, imageRaw, imageBase64);
  if (extracted) {
    imageUrl = await uploadImageToSupabase(extracted.buffer, extracted.fileName, "services", "image/webp");
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

  try {
    revalidatePath("/admin/services");
    revalidatePath("/services");
    revalidatePath("/");
  } catch {}
  return { success: true };
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
  const imageRaw = formData.get("image_raw") as File | null;
  const imageBase64 = formData.get("image_base64") as string | null;
  const imageRemoved = formData.get("image_removed") as string | null;

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

    const extracted = await extractImageBuffer(image, imageRaw, imageBase64);
    if (extracted) {
      const imageUrl = await uploadImageToSupabase(extracted.buffer, extracted.fileName, "services", "image/webp");
      query += `, image_url = ?`;
      params.push(imageUrl);
    } else if (imageRemoved === "1") {
      query += `, image_url = NULL`;
    }

    query += ` WHERE id = ?`;
    params.push(id);

    await pool.query(query, params);
  } catch (error) {
    console.error("Error updating service:", error);
    return { error: "Failed to update service" };
  }

  try {
    revalidatePath("/admin/services");
    revalidatePath(`/admin/services/edit/${id}`);
    revalidatePath("/services");
    revalidatePath("/");
  } catch {}
  return { success: true };
}

export async function deleteService(formData: FormData) {
  const id = formData.get("id") as string;

  try {
    await pool.query("DELETE FROM services WHERE id = ?", [id]);
  } catch (error) {
    console.error("Error deleting service:", error);
  }

  revalidatePath("/admin/services");
  redirect("/admin/services?status=deleted");
}
