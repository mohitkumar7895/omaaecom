"use server";

import pool from "../../lib/db";
import { revalidatePath } from "next/cache";

export async function saveGstSettings(formData: FormData) {
  const gstRate = formData.get("gst_rate") || 18;
  const onlineGstEnabled = formData.get("online_gst_enabled") === "on";
  const cashGstEnabled = formData.get("cash_gst_enabled") === "on";
  const gstNumber = formData.get("gst_number") || "";
  const showGstOnInvoice = formData.get("show_gst_on_invoice") === "on";

  try {
    const query = `
      INSERT INTO gst_settings (id, gst_rate, online_gst_enabled, cash_gst_enabled, gst_number, show_gst_on_invoice)
      VALUES (1, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        gst_rate = VALUES(gst_rate),
        online_gst_enabled = VALUES(online_gst_enabled),
        cash_gst_enabled = VALUES(cash_gst_enabled),
        gst_number = VALUES(gst_number),
        show_gst_on_invoice = VALUES(show_gst_on_invoice)
    `;
    
    await pool.query(query, [
      gstRate, 
      onlineGstEnabled, 
      cashGstEnabled, 
      gstNumber, 
      showGstOnInvoice
    ]);

  } catch (error) {
    console.error("Error saving GST settings:", error);
    return { error: "Failed to save GST settings" };
  }

  revalidatePath("/admin/gst-settings");
}
