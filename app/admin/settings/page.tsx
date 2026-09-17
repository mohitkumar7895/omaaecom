import { getSiteSettings, updateSiteSettings } from "@/app/actions/settings";
import { Save, BellRing, Settings as SettingsIcon } from "lucide-react";
import AdminPasswordSection from "./AdminPasswordSection";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto min-h-screen space-y-8">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gray-900 text-white rounded-xl shadow-sm">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">System Settings</h1>
          </div>
          <p className="text-gray-500 text-sm sm:text-base mt-1 ml-11">
            Manage global website configuration, announcement banners, and admin security
          </p>
        </div>
      </div>

      {/* 1. Admin Security & Password Change */}
      <AdminPasswordSection />

      {/* 2. Announcement Bar / Marquee Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Announcement Bar</h2>
              <p className="text-sm text-gray-500 mt-1">
                Display a scrolling offer line at the very top of the website
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <form action={updateSiteSettings} className="space-y-6 max-w-2xl">
            {/* Toggle Switch */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <label className="font-bold text-gray-900 block">Enable Offer Line</label>
                <span className="text-sm text-gray-500">Show or hide the marquee on the frontend</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="offer_enabled" 
                  className="sr-only peer" 
                  defaultChecked={settings.offer_enabled} 
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Offer Text Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Offer Text</label>
              <textarea
                name="offer_text"
                rows={3}
                defaultValue={settings.offer_text}
                placeholder="e.g. FLAT 20% OFF ON ALL AC SERVICES! BOOK NOW."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none font-medium text-gray-800"
              />
              <p className="text-xs text-gray-400 mt-2">Keep it short and catchy. This will loop infinitely.</p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button 
                type="submit"
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
