"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveBrand } from "../../../actions/brands";
import { Check } from "lucide-react";
import Link from "next/link";
import AutoImageUpload from "../../components/AutoImageUpload";
import AdminSubmitButton from "../../components/AdminSubmitButton";
import { showAdminToast } from "../../components/AdminToast";

export default function AddBrandForm({ categories }: { categories: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setIsSuccess(false);

    try {
      const res = await saveBrand(formData);
      if (res?.error) {
        setLoading(false);
        showAdminToast(res.error, "error");
        return;
      }

      setIsSuccess(true);
      setLoading(false);
      showAdminToast("Brand saved successfully!", "success", "Brand has been added to catalog.");

      setTimeout(() => {
        router.push("/admin/brands?status=saved");
        router.refresh();
      }, 500);
    } catch (err) {
      console.error(err);
      setLoading(false);
      showAdminToast("Failed to save brand. Please try again.", "error");
    }
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
            <AutoImageUpload
              name="logo"
              label="Brand Logo"
              targetWidth={300}
              targetHeight={300}
              defaultFit="contain"
              aspectRatioDisplay="1:1 Square"
              required
            />

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
            
            <AdminSubmitButton 
              loading={loading} 
              success={isSuccess}
              label="Save Brand" 
              loadingLabel="Saving Brand..." 
              successLabel="✓ Brand Saved!"
            />
          </div>
        </form>

      </div>
    </div>
  );
}
