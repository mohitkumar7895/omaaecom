import pool from "../../../lib/db";
import GstSettingsForm from "./GstSettingsForm";

export const dynamic = 'force-dynamic';

export default async function GstSettingsPage() {
  let settings = null;

  try {
    const [rows]: any = await pool.query("SELECT * FROM gst_settings WHERE id = 1");
    if (rows && rows.length > 0) {
      settings = rows[0];
    }
  } catch (error) {
    console.error("Database error:", error);
  }

  // Provide defaults if no settings found
  const defaultSettings = settings || {
    gst_rate: 18,
    online_gst_enabled: 0,
    cash_gst_enabled: 0,
    gst_number: "",
    show_gst_on_invoice: 0
  };

  return (
    <div className="p-8 font-sans bg-[#f8f9fa] min-h-screen">
      <h1 className="text-[22px] font-bold text-gray-800 tracking-tight mb-6">GST Settings</h1>
      <GstSettingsForm settings={defaultSettings} />
    </div>
  );
}
