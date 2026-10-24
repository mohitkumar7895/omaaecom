"use server";

import pool from "../../lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadImageToSupabase } from "../../lib/supabase";

export async function saveBrand(formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const status = formData.get("status") as string;
  const logo = formData.get("logo") as File | null;
  const logoRaw = formData.get("logo_raw") as File | null;
  const logoBase64 = formData.get("logo_base64") as string | null;

  let logoUrl = null;

  let logoBuffer: Buffer | null = null;
  let logoFileName = "";

  if (logo && typeof logo === "object" && "size" in logo && logo.size > 0) {
    logoBuffer = Buffer.from(await logo.arrayBuffer());
    logoFileName = `${Date.now()}-${(logo.name || "logo.webp").replace(/[^a-zA-Z0-9._-]/g, '-')}`;
  } else if (logoRaw && typeof logoRaw === "object" && "size" in logoRaw && logoRaw.size > 0) {
    logoBuffer = Buffer.from(await logoRaw.arrayBuffer());
    logoFileName = `${Date.now()}-${(logoRaw.name || "logo.webp").replace(/[^a-zA-Z0-9._-]/g, '-')}`;
  } else if (logoBase64 && typeof logoBase64 === "string" && logoBase64.startsWith("data:image/")) {
    const commaIdx = logoBase64.indexOf(",");
    if (commaIdx !== -1) {
      const header = logoBase64.substring(0, commaIdx);
      const data = logoBase64.substring(commaIdx + 1);
      const match = header.match(/^data:image\/([a-zA-Z0-9+.-]+);base64$/);
      const ext = match ? (match[1] === "jpeg" ? "jpg" : match[1]) : "webp";
      logoBuffer = Buffer.from(data, "base64");
      logoFileName = `${Date.now()}-brand.${ext}`;
    }
  }

  if (logoBuffer && logoFileName) {
    logoUrl = await uploadImageToSupabase(logoBuffer, logoFileName, "brands", "image/webp");
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
