"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getSiteSettings() {
  try {
    // Create the table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INT PRIMARY KEY DEFAULT 1,
        offer_text text,
        offer_enabled BOOLEAN DEFAULT false,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Fetch settings
    const [rows]: any = await pool.query("SELECT * FROM site_settings WHERE id = 1");

    if (rows.length === 0) {
      // Initialize if empty
      await pool.query("INSERT INTO site_settings (id, offer_text, offer_enabled) VALUES (1, '', false)");
      return { offer_text: "", offer_enabled: false };
    }

    return {
      offer_text: rows[0].offer_text,
      offer_enabled: rows[0].offer_enabled === 1,
    };
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return { offer_text: "", offer_enabled: false };
  }
}

export async function updateSiteSettings(formData: FormData) {
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
    return { success: true };
  } catch (error) {
    console.error("Failed to update site settings:", error);
    return { error: "Failed to update settings" };
  }
}
