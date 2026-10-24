"use client";

import { saveSubcategory } from "@/app/actions/subcategories";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AutoImageUpload from "@/app/admin/components/AutoImageUpload";
import AdminSubmitButton from "@/app/admin/components/AdminSubmitButton";
import { showAdminToast } from "@/app/admin/components/AdminToast";

export default function AddSubcategoryForm({ categories }: { categories: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const res = await saveSubcategory(formData);
      if (res?.error) {
        setIsSubmitting(false);
        showAdminToast(res.error, "error");
        return;
      }

      setIsSuccess(true);
      setIsSubmitting(false);
      showAdminToast("Subcategory created successfully!", "success", "New subcategory added to catalog.");

      setTimeout(() => {
        router.push("/admin/subcategories?status=saved");
        router.refresh();
      }, 500);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      showAdminToast("Failed to save subcategory. Please try again.", "error");
    }
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-8 font-sans">
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="bg-[#2c3e50] px-6 py-4">
          <h2 className="text-white text-[17px] font-semibold tracking-wide">
            Add Subcategory
          </h2>
        </div>

        {/* Form Body */}
        <form action={handleSubmit} className="p-8">
          <div className="space-y-6">
            
            {/* Select Category */}
            <div>
              <label className="block text-[#2c3e50] text-[15px] font-bold mb-2">
                Select Category
              </label>
              <select 
                name="category_id"
                required
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
                placeholder="Enter subcategory name"
                required
                className="w-full border border-gray-200 rounded text-[15px] px-4 py-2.5 outline-none focus:border-blue-500 shadow-sm"
              />
            </div>

            {/* Upload Image */}
            <AutoImageUpload
              name="image"
              label="Subcategory Image"
              targetWidth={500}
              targetHeight={500}
              defaultFit="contain"
              aspectRatioDisplay="1:1 Square"
            />

          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <AdminSubmitButton 
              loading={isSubmitting} 
              success={isSuccess}
              label="Add Subcategory" 
              loadingLabel="Saving Subcategory..." 
              successLabel="✓ Subcategory Added!"
            />
          </div>
        </form>

      </div>
    </div>
  );
}
