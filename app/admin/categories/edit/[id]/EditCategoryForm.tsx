"use client";

import { useState } from "react";
import { updateCategory } from "../../../../../app/actions/categories";

export default function EditCategoryForm({ category }: { category: any }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await updateCategory(formData);
  }

  return (
    <div className="p-8 font-sans bg-[#f8f9fa] min-h-screen">
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden w-full max-w-300 mx-auto">
        
        {/* Form Header */}
        <div className="bg-[#2c3e50] px-6 py-3 text-white text-center">
          <h2 className="text-[15px] font-semibold tracking-wide">Edit Category</h2>
        </div>

        {/* Form Content */}
        <form action={handleSubmit} className="p-8">
          <input type="hidden" name="id" value={category.id} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-800">Category Name</label>
              <input 
                type="text" 
                name="title"
                required
                defaultValue={category.title}
                className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-800">Category Type</label>
              <select 
                name="type"
                required
                defaultValue={category.type || "Service"}
                className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 outline-none focus:border-blue-500 bg-white"
              >
                <option value="Normal Service">Normal Service</option>
                <option value="New Product">New Product</option>
                <option value="AMC/ Annual Maintenance">AMC/ Annual Maintenance</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-800">Labour Charges</label>
              <input 
                type="number" 
                name="labour_charges"
                required
                defaultValue={category.labour_charges}
                className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-800">Current Image</label>
              <div className="w-20 h-20 border border-gray-200 bg-gray-50 flex items-center justify-center p-2 rounded">
                {category.image_url ? (
                  <img src={category.image_url} alt="Current" className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-gray-400 text-xs">None</span>
                )}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2 mt-2">
              <label className="text-[13px] font-bold text-gray-800">New Image (optional)</label>
              <input 
                type="file" 
                name="image"
                accept="image/*"
                className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 outline-none focus:border-blue-500 bg-white"
              />
            </div>

            <div className="space-y-2 md:col-span-2 mt-2">
              <label className="text-[13px] font-bold text-gray-800">Zones (Draw Areas on Map)</label>
              <input 
                type="text" 
                name="zones_location"
                placeholder="Type location (Example: Noida, Delhi)"
                className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 outline-none focus:border-blue-500"
              />
              <input type="hidden" name="zones" value={category.zones || 1} />
            </div>
            
            <div className="md:col-span-2">
              <button type="button" className="bg-[#212529] hover:bg-black text-white text-xs px-4 py-2 rounded shadow-sm transition">
                Search Location
              </button>
            </div>

            {/* Google Map Placeholder */}
            <div className="w-full h-112.5 border border-gray-200 rounded overflow-hidden mt-2 md:col-span-2">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112030.702434524!2d77.10657999806461!3d28.660142839958172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x52c2b7494e204dce!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1708890000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

          </div>

          <div className="mt-8 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#2c3e50] hover:bg-[#1a252f] text-white font-medium px-8 py-2.5 rounded text-[13px] shadow-sm transition disabled:opacity-70"
            >
              {loading ? "Updating..." : "Update Category"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
