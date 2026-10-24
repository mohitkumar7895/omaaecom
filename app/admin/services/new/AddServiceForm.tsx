"use client";

import { saveService } from "@/app/actions/services";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import AutoImageUpload from "@/app/admin/components/AutoImageUpload";
import AdminSubmitButton from "@/app/admin/components/AdminSubmitButton";
import { showAdminToast } from "@/app/admin/components/AdminToast";

export default function AddServiceForm({ categories, subcategories }: { categories: any[], subcategories: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // Prefetch services list for instant transition
  useEffect(() => {
    router.prefetch("/admin/services");
  }, [router]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const res = await saveService(formData);
      if (res?.error) {
        setIsSubmitting(false);
        showAdminToast(res.error, "error");
        return;
      }

      setIsSuccess(true);
      setIsSubmitting(false);
      showAdminToast("Service created successfully!", "success", "New service has been added to catalog.");

      setTimeout(() => {
        router.push("/admin/services?status=saved");
      }, 600);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      showAdminToast("Failed to save service. Please try again.", "error");
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
        <form action={handleSubmit} className="p-8">
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
            <AutoImageUpload
              name="image"
              label="Service Image"
              targetWidth={600}
              targetHeight={400}
              defaultFit="contain"
              aspectRatioDisplay="3:2 Standard"
            />

          </div>

          {/* Inline Success Notice */}
          {isSuccess && (
            <div className="mt-6 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 animate-bounce" />
              <div>
                <p className="font-bold text-sm">Service Created Successfully!</p>
                <p className="text-xs text-emerald-700">New service has been added to catalog. Redirecting to services list...</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8 flex justify-between items-center pt-4 border-t border-gray-100">
            <Link 
              href="/admin/services"
              className="text-gray-500 hover:text-gray-800 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              ← Back to Services
            </Link>

            <AdminSubmitButton 
              loading={isSubmitting} 
              success={isSuccess}
              label="Add Service" 
              loadingLabel="Saving Service..." 
              successLabel="✓ Service Added!"
            />
          </div>
        </form>

      </div>
    </div>
  );
}
