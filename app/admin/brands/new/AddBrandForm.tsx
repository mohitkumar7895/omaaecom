"use client";

import { useState } from "react";
import { saveBrand } from "../../../actions/brands";
import { Check } from "lucide-react";
import Link from "next/link";

export default function AddBrandForm({ categories }: { categories: any[] }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await saveBrand(formData);
  }

  return (
    <div className="p-8 font-sans bg-[#f8f9fa] min-h-screen flex justify-center">
      <div className="bg-white rounded-lg shadow-[0_2px_12px_rgb(0,0,0,0.06)] border border-gray-100 overflow-hidden w-full max-w-4xl h-fit">
        
        {/* Form Header */}
        <div className="bg-[#2c3e50] p-4 text-white text-center">
          <h2 className="text-[16px] font-bold tracking-wide">Add New Brand</h2>
        </div>

        {/* Form Content */}
        <form action={handleSubmit} className="p-8">
          <div className="space-y-6">
            
            {/* Brand Name */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-gray-800">Brand Name</label>
              <input 
                type="text" 
                name="name" 
                required
                placeholder="e.g. LG, Samsung, Voltas"
                className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            {/* Select Category */}
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-gray-800">Select Category</label>
              <select 
                name="category"
                className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition bg-white"
              >
                <option value="Global / All Categories">Global / All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.title}>{cat.title}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">This brand will show up for services in this category.</p>
            </div>

            {/* Brand Logo */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[14px] font-bold text-gray-800">Brand Logo</label>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Recommended: 300 × 300 px (Square 1:1) / PNG
                </span>
              </div>
              <div className="flex">
                <input 
                  type="file" 
                  name="logo" 
                  accept="image/*"
                  required
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2.5 file:px-4
                    file:border-0 file:border-r file:border-gray-200
                    file:text-sm file:font-medium
                    file:bg-gray-50 file:text-gray-700
                    hover:file:bg-gray-100
                    border border-gray-200 rounded bg-white transition"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Recommended size: 300 × 300 px (1:1 ratio), transparent PNG for best display.</p>
            </div>

            {/* Status */}
            <div className="space-y-2 pt-2">
              <label className="text-[14px] font-bold text-gray-800 block">Status</label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" name="status" value="Active" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                  <span>Active</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                  <input type="radio" name="status" value="Inactive" className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                  <span>Inactive</span>
                </label>
              </div>
            </div>

          </div>

          <div className="mt-10 flex justify-between items-center pt-6">
            <Link href="/admin/brands">
              <button 
                type="button" 
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-6 py-2.5 rounded text-sm transition"
              >
                Cancel
              </button>
            </Link>
            
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#2962ff] hover:bg-[#1e4ad8] text-white font-medium px-6 py-2.5 rounded flex items-center space-x-2 text-sm transition disabled:opacity-70"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? "Saving..." : "Save Brand"}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
