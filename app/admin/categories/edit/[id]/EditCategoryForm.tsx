"use client";

import { useState } from "react";
import { updateCategory } from "../../../../../app/actions/categories";
import CategoryZonePicker from "../../../components/CategoryZonePicker";

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

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-800">Warranty (days)</label>
              <input 
                type="number" 
                name="warranty_days"
                required
                defaultValue={category.warranty_days || "180"}
                placeholder="Enter Warranty Days"
                className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[13px] font-bold text-gray-800">Short Description (Points - separate with | )</label>
              <textarea 
                name="short_description"
                rows={3}
                defaultValue={category.short_description || ""}
                placeholder="e.g. Valid on parts | Experienced staff | 100% Satisfaction Guarantee"
                className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            {/* Interactive Multiple Zones & Google Map */}
            <div className="md:col-span-2 mt-2 pt-2 border-t border-gray-100">
              <CategoryZonePicker initialZonesLocation={category.zones_location || "Noida, Delhi"} />
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
