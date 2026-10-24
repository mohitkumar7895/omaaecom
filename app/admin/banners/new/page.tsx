"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveBanners } from "../../../actions/banners";
import AutoImageUpload from "../../components/AutoImageUpload";
import AdminSubmitButton from "../../components/AdminSubmitButton";
import { showAdminToast } from "../../components/AdminToast";

export default function AddBannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bannerType, setBannerType] = useState<"desktop" | "mobile">("desktop");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setIsSuccess(false);

    try {
      const res = await saveBanners(formData);
      if (res?.error) {
        setLoading(false);
        showAdminToast(res.error, "error");
        return;
      }

      setIsSuccess(true);
      setLoading(false);
      showAdminToast("Banner saved successfully!", "success", "Promotional banners are now live.");

      setTimeout(() => {
        router.push("/admin/banners?status=saved");
        router.refresh();
      }, 500);
    } catch (err) {
      console.error(err);
      setLoading(false);
      showAdminToast("Failed to save banner. Please try again.", "error");
    }
  }

  return (
    <div className="p-8 font-sans bg-[#f8f9fa] min-h-screen">
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden max-w-4xl">
        
        {/* Form Header */}
        <div className="bg-[#2c3e50] p-4 text-white">
          <h2 className="text-[15px] font-bold tracking-wide">Add Banner</h2>
        </div>

        {/* Form Content */}
        <form action={handleSubmit} className="p-6">
          <div className="space-y-6">
            
            {/* Banner Type */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-800">Banner Type</label>
              <select 
                name="banner_type" 
                value={bannerType}
                onChange={(e) => setBannerType(e.target.value as "desktop" | "mobile")}
                className="block w-full text-sm text-gray-700 border border-gray-200 rounded p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="desktop">Desktop Banner (Auto-sizes to 1200 × 400 px)</option>
                <option value="mobile">Mobile Banner (Auto-sizes to 600 × 600 px)</option>
              </select>
            </div>

            {/* Banner 1 */}
            <AutoImageUpload
              name="banner1"
              label="Banner 1"
              targetWidth={bannerType === "desktop" ? 1200 : 600}
              targetHeight={bannerType === "desktop" ? 400 : 600}
              defaultFit="cover"
              aspectRatioDisplay={bannerType === "desktop" ? "3:1 Landscape" : "1:1 Square"}
              required
            />

            {/* Banner 2 */}
            <AutoImageUpload
              name="banner2"
              label="Banner 2"
              targetWidth={bannerType === "desktop" ? 1200 : 600}
              targetHeight={bannerType === "desktop" ? 400 : 600}
              defaultFit="cover"
              aspectRatioDisplay={bannerType === "desktop" ? "3:1 Landscape" : "1:1 Square"}
            />

            {/* Banner 3 */}
            <AutoImageUpload
              name="banner3"
              label="Banner 3"
              targetWidth={bannerType === "desktop" ? 1200 : 600}
              targetHeight={bannerType === "desktop" ? 400 : 600}
              defaultFit="cover"
              aspectRatioDisplay={bannerType === "desktop" ? "3:1 Landscape" : "1:1 Square"}
            />

          </div>

          <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
            <AdminSubmitButton 
              loading={loading} 
              success={isSuccess}
              label="Save Banner" 
              loadingLabel="Saving Banner..." 
              successLabel="✓ Banner Saved!"
            />
          </div>
        </form>

      </div>
    </div>
  );
}
