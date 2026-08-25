"use server";

import pool from "../../lib/db";
import { revalidatePath } from "next/cache";

export async function saveGstSettings(formData: FormData) {
  const gstRate = formData.get("gst_rate") || 18;
  const onlineGstEnabled = formData.get("online_gst_enabled") === "on" ? 1 : 0;
  const cashGstEnabled = formData.get("cash_gst_enabled") === "on" ? 1 : 0;
  const gstNumber = formData.get("gst_number") || "";
  const showGstOnInvoice = formData.get("show_gst_on_invoice") === "on" ? 1 : 0;

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

export async function getGstSettings() {
  try {
    const [rows]: any = await pool.query("SELECT * FROM gst_settings WHERE id = 1");
    if (rows && rows.length > 0) {
      return {
        gst_rate: Number(rows[0].gst_rate || 0),
        online_gst_enabled: Number(rows[0].online_gst_enabled || 0),
        cash_gst_enabled: Number(rows[0].cash_gst_enabled || 0),
        gst_number: rows[0].gst_number || "",
        show_gst_on_invoice: Number(rows[0].show_gst_on_invoice || 0)
      };
    }
  } catch (error) {
    console.error("Failed to fetch GST settings:", error);
  }
  return {
    gst_rate: 18,
    online_gst_enabled: 0,
    cash_gst_enabled: 0,
    gst_number: "",
    show_gst_on_invoice: 0
  };
}
