"use client";

import { updateSubcategory } from "@/app/actions/subcategories";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function EditSubcategoryForm({ subcategory, categories }: { subcategory: any, categories: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await updateSubcategory(formData);
    } catch (error) {
      console.error("Error saving:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-8 font-sans">
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="bg-[#2c3e50] px-6 py-4">
          <h2 className="text-white text-[17px] font-semibold tracking-wide">
            Edit Subcategory
          </h2>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8">
          <input type="hidden" name="id" value={subcategory.id} />
          
          <div className="space-y-6">
            
            {/* Select Category */}
            <div>
              <label className="block text-[#2c3e50] text-[15px] font-bold mb-2">
                Select Category
              </label>
              <select 
                name="category_id"
                required
                defaultValue={subcategory.category_id}
                className="w-full border border-gray-200 rounded text-[15px] px-4 py-2.5 outline-none focus:border-blue-500 bg-white shadow-sm appearance-none cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory Name */}
            <div>
              <label className="block text-[#2c3e50] text-[15px] font-bold mb-2">
                Subcategory Name
              </label>
              <input 
                type="text" 
                name="title"
                defaultValue={subcategory.title}
                placeholder="Enter subcategory name"
                required
                className="w-full border border-gray-200 rounded text-[15px] px-4 py-2.5 outline-none focus:border-blue-500 shadow-sm"
              />
            </div>

            {/* Current Image Preview */}
            {subcategory.image_url && (
              <div>
                <label className="block text-[#2c3e50] text-[15px] font-bold mb-2">
                  Current Image
                </label>
                <div className="w-32 h-32 rounded border border-gray-200 overflow-hidden shadow-sm">
                  <img 
                    src={subcategory.image_url} 
                    alt={subcategory.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
            )}

            {/* Upload New Image */}
            <div>
              <label className="block text-[#2c3e50] text-[15px] font-bold mb-2">
                Upload New Image <span className="text-gray-400 font-normal text-xs ml-2">(Optional)</span>
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
              {isSubmitting ? "Updating..." : "Update Subcategory"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
