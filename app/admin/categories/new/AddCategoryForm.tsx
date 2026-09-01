"use client";

import { useState } from "react";
import { saveCategory } from "../../../../app/actions/categories";
import CategoryZonePicker from "../../components/CategoryZonePicker";

export default function AddCategoryForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await saveCategory(formData);
  }

  return (
    <div className="p-8 font-sans bg-[#f8f9fa] min-h-screen">
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden w-full max-w-[1200px] mx-auto">
        
        {/* Form Header */}
        <div className="bg-[#2c3e50] px-6 py-3 text-white text-center">
          <h2 className="text-[15px] font-semibold tracking-wide">Add Category</h2>
        </div>

        {/* Form Content */}
        <form action={handleSubmit} className="p-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-800">Category Name</label>
              <input 
                type="text" 
                name="title"
                required
                placeholder="Enter category name"
                className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-800">Category Type</label>
              <select 
                name="type"
                required
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
                placeholder="Enter Labour Charges"
                className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-bold text-gray-800">Category Image</label>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Recommended: 500 × 500 px (Square 1:1)
                </span>
              </div>
              <input 
                type="file" 
                name="image"
                accept="image/*"
                required
                className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 outline-none focus:border-blue-500 bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-800">Warranty (days)</label>
              <input 
                type="number" 
                name="warranty_days"
                required
                defaultValue="180"
                placeholder="Enter Warranty Days"
                className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[13px] font-bold text-gray-800">Short Description (Points - separate with | )</label>
              <textarea 
                name="short_description"
                rows={3}
                placeholder="e.g. Valid on parts | Experienced staff | 100% Satisfaction Guarantee"
                className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            {/* Interactive Multiple Zones & Google Map */}
            <div className="md:col-span-2 mt-2 pt-2 border-t border-gray-100">
              <CategoryZonePicker initialZonesLocation="Noida, Delhi" />
            </div>

          </div>

          <div className="mt-8 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#2c3e50] hover:bg-[#1a252f] text-white font-medium px-8 py-2.5 rounded text-[13px] shadow-sm transition disabled:opacity-70"
            >
              {loading ? "Saving..." : "Add Category"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
