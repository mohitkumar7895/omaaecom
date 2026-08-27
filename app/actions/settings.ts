"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getSiteSettings() {
  try {
    const queryPromise = pool.query("SELECT * FROM site_settings WHERE id = 1");
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000));
    
    const [rows]: any = await Promise.race([queryPromise, timeoutPromise]);

    if (!rows || rows.length === 0) {
      return { offer_text: "", offer_enabled: false };
    }

    return {
      offer_text: rows[0].offer_text,
      offer_enabled: rows[0].offer_enabled === 1,
    };
  } catch {
    // Fail silently with default fallback during build/unreachable DB
    return { offer_text: "", offer_enabled: false };
  }
}

export async function updateSiteSettings(formData: FormData): Promise<void> {
  const offer_text = formData.get("offer_text") as string;
  const offer_enabled = formData.get("offer_enabled") === "on";

  try {
    // Check if row exists
    const [rows]: any = await pool.query("SELECT id FROM site_settings WHERE id = 1");

    if (rows.length === 0) {
      await pool.query(
        "INSERT INTO site_settings (id, offer_text, offer_enabled) VALUES (1, ?, ?)",
        [offer_text, offer_enabled]
      );
    } else {
      await pool.query(
        "UPDATE site_settings SET offer_text = ?, offer_enabled = ? WHERE id = 1",
        [offer_text, offer_enabled]
      );
    }

    revalidatePath("/", "layout"); // Revalidate entire app to reflect marquee changes
  } catch (error) {
    console.error("Failed to update site settings:", error);
  }
}
