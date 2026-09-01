"use client";

import { updateService } from "@/app/actions/services";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditServiceForm({ service, categories, subcategories }: { service: any, categories: any[], subcategories: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(service.category_id.toString());
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(service.subcategory_id.toString());

  // Reset subcategory if category changes manually
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoryId(e.target.value);
    setSelectedSubcategoryId(""); 
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await updateService(formData);
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
        <div className="bg-[#2c3e50] px-6 py-3 text-center">
          <h2 className="text-white text-[15px] font-semibold tracking-wide">
            Edit Service
          </h2>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8">
          <input type="hidden" name="id" value={service.id} />
          
          <div className="space-y-6">
            
            {/* Categories & Subcategories */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-gray-700 text-sm mb-1">
                  Select Category
                </label>
                <select 
                  name="category_id"
                  required
                  value={selectedCategoryId}
                  onChange={handleCategoryChange}
                  className="w-full border border-gray-300 rounded text-sm px-3 py-2 outline-none focus:border-[#2c3e50] bg-white appearance-none cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm mb-1">
                  Select Subcategory
                </label>
                <select 
                  name="subcategory_id"
                  required
                  value={selectedSubcategoryId}
                  onChange={(e) => setSelectedSubcategoryId(e.target.value)}
                  disabled={!selectedCategoryId}
                  className="w-full border border-gray-300 rounded text-sm px-3 py-2 outline-none focus:border-[#2c3e50] bg-white appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
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
              <label className="block text-gray-700 text-sm mb-1">
                Service Name
              </label>
              <input 
                type="text" 
                name="title"
                defaultValue={service.title}
                required
                className="w-full border border-gray-300 rounded text-sm px-3 py-2 outline-none focus:border-[#2c3e50]"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">
                Price
              </label>
              <input 
                type="number" 
                name="selling_price"
                defaultValue={service.selling_price}
                required
                placeholder="499"
                className="w-full border border-gray-300 rounded text-sm px-3 py-2 outline-none focus:border-[#2c3e50]"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">
                Rating
              </label>
              <input 
                type="text" 
                name="rating"
                defaultValue={service.rating}
                placeholder="4.8"
                className="w-full border border-gray-300 rounded text-sm px-3 py-2 outline-none focus:border-[#2c3e50]"
              />
            </div>



            {/* Long Description */}
            <div>
              <label className="block text-gray-700 text-sm mb-1">
                Long Description (Detailed View)
              </label>
              <textarea 
                name="long_description"
                rows={4}
                defaultValue={service.long_description || ""}
                placeholder="Detailed information for View Details modal..."
                className="w-full border border-gray-300 rounded text-sm px-3 py-2 outline-none focus:border-[#2c3e50]"
              />
            </div>

            {/* Current Image Preview */}
            {service.image_url && (
              <div>
                <label className="block text-gray-700 text-sm mb-1">
                  Current Image
                </label>
                <div className="w-32 h-32 rounded border border-gray-200 overflow-hidden shadow-sm">
                  <img 
                    src={service.image_url} 
                    alt={service.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
            )}

            {/* Upload New Image */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-gray-700 text-sm font-semibold">
                  New Image (optional)
                </label>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Recommended: 600 × 400 px (3:2) / 500 × 500 px (1:1)
                </span>
              </div>
              <input 
                type="file" 
                name="image"
                accept="image/*"
                className="w-full border border-gray-300 rounded text-sm px-3 py-2 outline-none focus:border-[#2c3e50] bg-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer"
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
              {isSubmitting ? "Updating..." : "Update Service"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
