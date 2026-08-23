"use client";

import { useState } from "react";
import { saveGstSettings } from "../../../app/actions/gst-settings";
import { Download } from "lucide-react";

export default function GstSettingsForm({ settings }: { settings: any }) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [showInvoice, setShowInvoice] = useState(Boolean(settings.show_gst_on_invoice));

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setSaved(false);
    
    // We append the toggle states since normal checkboxes don't send values if unchecked
    if (showInvoice) formData.append("show_gst_on_invoice", "on");

    await saveGstSettings(formData);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  // Custom Toggle Component to match design exactly
  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
        checked ? "bg-[#2962ff]" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 max-w-lg p-6">
      <form action={handleSubmit} className="space-y-6">
        
        {/* Top Section */}
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-gray-800">GST Rate (%)</label>
            <input 
              type="number" 
              name="gst_rate" 
              defaultValue={settings.gst_rate}
              placeholder="e.g. 18"
              className="w-full border border-gray-200 rounded text-sm px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-gray-800">GST Number (Optional)</label>
            <input 
              type="text" 
              name="gst_number"
              defaultValue={settings.gst_number}
              placeholder="e.g. 27ABCDE1234F1Z5"
              className="w-full border border-gray-200 rounded text-sm px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-3 pt-2 pb-2">
            <Toggle checked={showInvoice} onChange={() => setShowInvoice(!showInvoice)} />
            <span className="text-[13px] font-bold text-gray-800">Show GST Number on Invoice</span>
          </div>
        </div>

        {/* Save Button */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#2962ff] hover:bg-[#1e4ad8] text-white font-medium px-4 py-2.5 rounded flex justify-center items-center space-x-2 text-[13px] transition disabled:opacity-70"
        >
          {loading ? (
            <span>Saving...</span>
          ) : saved ? (
            <span>Saved successfully!</span>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
