"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getSiteSettings() {
  try {
    // Fetch settings directly, no DDL queries on every request!
    const [rows]: any = await pool.query("SELECT * FROM site_settings WHERE id = 1");

    if (!rows || rows.length === 0) {
      return { offer_text: "", offer_enabled: false };
    }

    return {
      offer_text: rows[0].offer_text,
      offer_enabled: rows[0].offer_enabled === 1,
    };
  } catch (error: any) {
    // If the table doesn't exist yet, we just return default empty settings silently.
    if (error.code !== 'ER_NO_SUCH_TABLE') {
      console.error("Failed to fetch site settings:", error);
    }
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
