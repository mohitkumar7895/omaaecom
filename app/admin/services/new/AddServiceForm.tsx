"use client";

import { saveService } from "@/app/actions/services";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddServiceForm({ categories, subcategories }: { categories: any[], subcategories: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await saveService(formData);
    } catch (error) {
      console.error("Error saving:", error);
      setIsSubmitting(false);
    }
  };

  const filteredSubcategories = subcategories.filter(sub => sub.category_id === parseInt(selectedCategoryId));

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-8 font-sans">
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden max-w-5xl mx-auto mb-10">
        
        {/* Header */}
        <div className="bg-[#2c3e50] px-6 py-4">
          <h2 className="text-white text-[17px] font-semibold tracking-wide">
            Add Service
          </h2>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-6">
            
            {/* Categories & Subcategories */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-[#2c3e50] text-[15px] font-bold mb-2">
                  Select Category
                </label>
                <select 
                  name="category_id"
                  required
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full border border-gray-200 rounded text-[15px] px-4 py-2.5 outline-none focus:border-blue-500 bg-white shadow-sm appearance-none cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#2c3e50] text-[15px] font-bold mb-2">
                  Select Subcategory
                </label>
                <select 
                  name="subcategory_id"
                  required
                  disabled={!selectedCategoryId}
                  className="w-full border border-gray-200 rounded text-[15px] px-4 py-2.5 outline-none focus:border-blue-500 bg-white shadow-sm appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Subcategory</option>
                  {filteredSubcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Service Name */}
            <div>
              <label className="block text-[#2c3e50] text-[15px] font-bold mb-2">
                Service Name
              </label>
              <input 
                type="text" 
                name="title"
                required
                className="w-full border border-gray-200 rounded text-[15px] px-4 py-2.5 outline-none focus:border-blue-500 shadow-sm"
              />
            </div>

            {/* Pricing Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[#2c3e50] text-[15px] font-bold mb-2">
                  Original Price (₹)
                </label>
                <input 
                  type="number" 
                  name="original_price"
                  placeholder="1198"
                  className="w-full border border-gray-200 rounded text-[15px] px-4 py-2.5 outline-none focus:border-blue-500 shadow-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty if no discount</p>
              </div>
              <div>
                <label className="block text-[#2c3e50] text-[15px] font-bold mb-2">
                  Selling Price (₹) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  name="selling_price"
                  required
                  placeholder="100"
                  className="w-full border border-gray-200 rounded text-[15px] px-4 py-2.5 outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-[#2c3e50] text-[15px] font-bold mb-2">
                Rating (1 to 5)
              </label>
              <input 
                type="text" 
                name="rating"
                placeholder="4.8"
                defaultValue="0.0"
                className="w-full border border-gray-200 rounded text-[15px] px-4 py-2.5 outline-none focus:border-blue-500 shadow-sm"
              />
            </div>



            {/* Long Description */}
            <div>
              <label className="block text-[#2c3e50] text-[15px] font-bold mb-2">
                Long Description (Detailed View)
              </label>
              <textarea 
                name="long_description"
                rows={4}
                placeholder="Detailed information for View Details modal..."
                className="w-full border border-gray-200 rounded text-[15px] px-4 py-2.5 outline-none focus:border-blue-500 shadow-sm"
              />
              <p className="text-xs text-gray-500 mt-1">This will appear in the "View Details" section.</p>
            </div>

            {/* Upload Image */}
            <div>
              <label className="block text-[#2c3e50] text-[15px] font-bold mb-2">
                Service Image
              </label>
              <input 
                type="file" 
                name="image"
                accept="image/*"
                className="w-full border border-gray-200 rounded text-[15px] px-4 py-2 outline-none focus:border-blue-500 shadow-sm bg-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
              />
            </div>

          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#2c3e50] hover:bg-[#1a252f] text-white px-6 py-2.5 rounded text-[15px] font-medium transition shadow-sm disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Add Service"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
