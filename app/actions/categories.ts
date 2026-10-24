"use server";

import { unstable_cache } from "next/cache";
import pool from "../../lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadImageToSupabase } from "../../lib/supabase";

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
  // 1. Check base64 data URL (from AutoImageUpload canvas)
  if (imageBase64 && typeof imageBase64 === "string" && imageBase64.startsWith("data:image/")) {
    const commaIdx = imageBase64.indexOf(",");
    if (commaIdx !== -1) {
      const header = imageBase64.substring(0, commaIdx);
      const data = imageBase64.substring(commaIdx + 1);
      const match = header.match(/^data:image\/([a-zA-Z0-9+.-]+);base64$/);
      const ext = match ? (match[1] === "jpeg" ? "jpg" : match[1]) : "webp";
      return {
        buffer: Buffer.from(data, "base64"),
        fileName: `${Date.now()}-category.${ext}`,
      };
    }
  }

  // 2. Check optimized file
  if (image && typeof image === "object" && "size" in image && image.size > 0) {
    try {
      const bytes = await image.arrayBuffer();
      const safeName = (image.name || "category.webp").replace(/[^a-zA-Z0-9._-]/g, "-");
      return {
        buffer: Buffer.from(bytes),
        fileName: `${Date.now()}-${safeName}`,
      };
    } catch (e) {
      console.warn("Could not read image arrayBuffer:", e);
    }
  }

  // 3. Check raw file from file picker
  if (imageRaw && typeof imageRaw === "object" && "size" in imageRaw && imageRaw.size > 0) {
    try {
      const bytes = await imageRaw.arrayBuffer();
      const safeName = (imageRaw.name || "category.webp").replace(/[^a-zA-Z0-9._-]/g, "-");
      return {
        buffer: Buffer.from(bytes),
        fileName: `${Date.now()}-${safeName}`,
      };
    } catch (e) {
      console.warn("Could not read imageRaw arrayBuffer:", e);
    }
  }

  return null;
}

export async function saveCategory(formData: FormData) {
  try {
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
      imageUrl = await uploadImageToSupabase(extracted.buffer, extracted.fileName, "categories", "image/webp");
    }

    try {
      await runMigration();
    } catch (e) {}

    const query = `
      INSERT INTO categories (title, type, labour_charges, zones, zones_location, image_url, warranty_days, short_description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await pool.query(query, [
      title || "",
      type || "Normal Service",
      parseInt(labourCharges) || 0,
      parseInt(zones) || 1,
      zonesLocation || "",
      imageUrl,
      parseInt(warrantyDays) || 180,
      shortDescription || ""
    ]);

    try {
      revalidatePath("/admin/categories");
      revalidatePath("/services");
      revalidatePath("/", "layout");
    } catch {}

    return { success: true };
  } catch (error: any) {
    console.error("Error saving category:", error);
    return { error: error?.message || "Failed to save category" };
  }
}

export async function deleteCategory(formData: FormData) {
  const id = formData.get("id");
  if (id) {
    await pool.query("DELETE FROM categories WHERE id = ?", [id]);
    revalidatePath("/admin/categories");
  }
}

export async function updateCategory(formData: FormData) {
  try {
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

    if (!id) {
      return { error: "Category ID is required" };
    }

    try {
      await runMigration();
    } catch (e) {}

    let query = `
      UPDATE categories 
      SET title = ?, type = ?, labour_charges = ?, zones = ?, zones_location = ?, warranty_days = ?, short_description = ?
    `;
    let params: any[] = [
      title || "",
      type || "Normal Service",
      parseInt(labourCharges) || 0,
      parseInt(zones) || 1,
      zonesLocation || "",
      parseInt(warrantyDays) || 180,
      shortDescription || ""
    ];

    const extracted = await extractImageBuffer(image, imageRaw, imageBase64);
    if (extracted) {
      const imageUrl = await uploadImageToSupabase(extracted.buffer, extracted.fileName, "categories", "image/webp");
      query += `, image_url = ?`;
      params.push(imageUrl);
    } else if (imageRemoved === "1") {
      query += `, image_url = NULL`;
    }

    query += ` WHERE id = ?`;
    params.push(parseInt(id) || id);
    
    await pool.query(query, params);

    try {
      revalidatePath("/admin/categories");
      revalidatePath(`/admin/categories/edit/${id}`);
      revalidatePath("/services");
      revalidatePath("/");
      revalidatePath("/", "layout");
    } catch {}

    return { success: true };
  } catch (error: any) {
    console.error("Error updating category:", error);
    return { error: error?.message || "Failed to update category" };
  }
}

