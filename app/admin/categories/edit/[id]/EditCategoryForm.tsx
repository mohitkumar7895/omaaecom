"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCategory } from "../../../../../app/actions/categories";
import CategoryZonePicker from "../../../components/CategoryZonePicker";
import AutoImageUpload from "../../../components/AutoImageUpload";
import AdminSubmitButton from "../../../components/AdminSubmitButton";
import { showAdminToast } from "../../../components/AdminToast";

export default function EditCategoryForm({ category }: { category: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setIsSuccess(false);

    try {
      const res = await updateCategory(formData);
      if (res?.error) {
        setLoading(false);
        showAdminToast(res.error, "error");
        return;
      }

      setIsSuccess(true);
      setLoading(false);
      showAdminToast("Category updated successfully!", "success", "All category changes have been saved.");

      setTimeout(() => {
        router.push("/admin/categories?status=updated");
        router.refresh();
      }, 500);
    } catch (err) {
      console.error(err);
      setLoading(false);
      showAdminToast("Failed to update category. Please try again.", "error");
    }
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

            <div className="md:col-span-2">
              <AutoImageUpload
                name="image"
                label="Category Image"
                currentImageUrl={category.image_url}
                targetWidth={400}
                targetHeight={300}
                defaultFit="cover"
                aspectRatioDisplay="4:3 Card Fit"
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
            <AdminSubmitButton 
              loading={loading} 
              success={isSuccess}
              label="Update Category" 
              loadingLabel="Updating Category..." 
              successLabel="✓ Category Updated!"
            />
          </div>
        </form>

      </div>
    </div>
  );
}
