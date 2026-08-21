"use client";

import { useState } from "react";
import { saveBanners } from "../../../actions/banners";

export default function AddBannerPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await saveBanners(formData);
    // Note: The server action will redirect back to /admin/banners automatically
  }

  return (
    <div className="p-8 font-sans bg-[#f8f9fa] min-h-screen">
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden max-w-4xl">
        
        {/* Form Header */}
        <div className="bg-[#2c3e50] p-4 text-white">
          <h2 className="text-[15px] font-bold tracking-wide">Add Banner</h2>
        </div>

        {/* Form Content */}
        <form action={handleSubmit} className="p-6">
          <div className="space-y-6">
            
            {/* Banner 1 */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-800">Banner 1</label>
              <div className="flex">
                <input 
                  type="file" 
                  name="banner1" 
                  accept="image/*"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:border file:border-gray-300
                    file:text-sm file:font-medium
                    file:bg-gray-50 file:text-gray-700
                    hover:file:bg-gray-100
                    border border-gray-200 rounded p-1.5"
                />
              </div>
            </div>

            {/* Banner 2 */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-800">Banner 2</label>
              <div className="flex">
                <input 
                  type="file" 
                  name="banner2" 
                  accept="image/*"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:border file:border-gray-300
                    file:text-sm file:font-medium
                    file:bg-gray-50 file:text-gray-700
                    hover:file:bg-gray-100
                    border border-gray-200 rounded p-1.5"
                />
              </div>
            </div>

            {/* Banner 3 */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-800">Banner 3</label>
              <div className="flex">
                <input 
                  type="file" 
                  name="banner3" 
                  accept="image/*"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:border file:border-gray-300
                    file:text-sm file:font-medium
                    file:bg-gray-50 file:text-gray-700
                    hover:file:bg-gray-100
                    border border-gray-200 rounded p-1.5"
                />
              </div>
            </div>

          </div>

          <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#2c3e50] hover:bg-[#1a252f] text-white font-medium px-6 py-2.5 rounded text-sm transition disabled:opacity-70"
            >
              {loading ? "Saving..." : "Save Banner"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
