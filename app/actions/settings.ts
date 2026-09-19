"use server";

import pool from "@/lib/db";
import { revalidatePath, updateTag } from "next/cache";
import { getCachedSiteSettings } from "@/lib/site-settings";

export async function getSiteSettings() {
  return getCachedSiteSettings();
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

    updateTag("site-settings");
    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Failed to update site settings:", error);
  }
}
