"use client";

import { updateService } from "@/app/actions/services";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import AutoImageUpload from "@/app/admin/components/AutoImageUpload";
import AdminSubmitButton from "@/app/admin/components/AdminSubmitButton";
import { showAdminToast } from "@/app/admin/components/AdminToast";

export default function EditServiceForm({ service, categories, subcategories }: { service: any, categories: any[], subcategories: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(service.category_id.toString());
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(service.subcategory_id.toString());

  // Prefetch services list for instant transition
  useEffect(() => {
    router.prefetch("/admin/services");
  }, [router]);

  // Reset subcategory if category changes manually
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoryId(e.target.value);
    setSelectedSubcategoryId(""); 
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const res = await updateService(formData);
      if (res?.error) {
        setIsSubmitting(false);
        showAdminToast(res.error, "error");
        return;
      }
      
      // Instant clear feedback
      setIsSuccess(true);
      setIsSubmitting(false);
      showAdminToast("Service Updated Successfully!", "success", "All changes & prices saved.");

      // Smooth transition after showing green status
      setTimeout(() => {
        router.push("/admin/services?status=updated");
      }, 600);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      showAdminToast("Failed to update service. Please try again.", "error");
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
        <form action={handleSubmit} className="p-8">
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

            {/* Auto Image Upload */}
            <AutoImageUpload
              name="image"
              label="Service Image"
              currentImageUrl={service.image_url}
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
                <p className="font-bold text-sm">Service Updated Successfully!</p>
                <p className="text-xs text-emerald-700">All changes and prices have been saved. Taking you back to services list...</p>
              </div>
            </div>
          )}

          {/* Submit Button & Cancel */}
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
              label="Update Service" 
              loadingLabel="Updating Service..." 
              successLabel="✓ Service Updated!"
            />
          </div>
        </form>

      </div>
    </div>
  );
}
