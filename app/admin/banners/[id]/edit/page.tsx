"use client";

import { useState, useEffect } from "react";
import { updateBanners } from "../../../../actions/banners";
import { useParams, useRouter } from "next/navigation";
import AutoImageUpload from "../../../components/AutoImageUpload";
import AdminSubmitButton from "../../../components/AdminSubmitButton";
import { showAdminToast } from "../../../components/AdminToast";

export default function EditBannerPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [banner, setBanner] = useState<any>(null);
  const [bannerType, setBannerType] = useState<"desktop" | "mobile">("desktop");
  
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    async function fetchBanner() {
      try {
        const res = await fetch(`/api/admin/banners/${id}`);
        if (res.ok) {
          const data = await res.json();
          setBanner(data);
          if (data?.type) {
            setBannerType(data.type);
          }
        } else {
          console.error("Failed to fetch banner");
        }
      } catch (error) {
        console.error("Error fetching banner:", error);
      } finally {
        setFetching(false);
      }
    }
    fetchBanner();
  }, [id]);

  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setIsSuccess(false);

    try {
      const res = await updateBanners(id, formData);
      if (res?.error) {
        setLoading(false);
        showAdminToast(res.error, "error");
        return;
      }

      setIsSuccess(true);
      setLoading(false);
      showAdminToast("Banner updated successfully!", "success", "Promotional banners have been updated.");

      setTimeout(() => {
        router.push("/admin/banners?status=updated");
        router.refresh();
      }, 500);
    } catch (err) {
      console.error(err);
      setLoading(false);
      showAdminToast("Failed to update banner. Please try again.", "error");
    }
  }

  if (fetching) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading banner data...</div>;
  }

  if (!banner) {
    return <div className="p-8 text-center text-red-500 font-bold">Banner not found.</div>;
  }

  return (
    <div className="p-8 font-sans bg-[#f8f9fa] min-h-screen">
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden max-w-4xl">
        
        {/* Form Header */}
        <div className="bg-[#2c3e50] p-4 text-white flex justify-between items-center">
          <h2 className="text-[15px] font-bold tracking-wide">Edit Banner (ID: {id})</h2>
          <button onClick={() => router.push('/admin/banners')} className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition">
            Back to Banners
          </button>
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
              currentImageUrl={banner.banner1_url}
              defaultFit="cover"
              aspectRatioDisplay={bannerType === "desktop" ? "3:1 Landscape" : "1:1 Square"}
            />

            {/* Banner 2 */}
            <AutoImageUpload
              name="banner2"
              label="Banner 2"
              targetWidth={bannerType === "desktop" ? 1200 : 600}
              targetHeight={bannerType === "desktop" ? 400 : 600}
              currentImageUrl={banner.banner2_url}
              defaultFit="cover"
              aspectRatioDisplay={bannerType === "desktop" ? "3:1 Landscape" : "1:1 Square"}
            />

            {/* Banner 3 */}
            <AutoImageUpload
              name="banner3"
              label="Banner 3"
              targetWidth={bannerType === "desktop" ? 1200 : 600}
              targetHeight={bannerType === "desktop" ? 400 : 600}
              currentImageUrl={banner.banner3_url}
              defaultFit="cover"
              aspectRatioDisplay={bannerType === "desktop" ? "3:1 Landscape" : "1:1 Square"}
            />

          </div>

          <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
            <AdminSubmitButton 
              loading={loading} 
              success={isSuccess}
              label="Update Banner" 
              loadingLabel="Updating Banner..." 
              successLabel="✓ Banner Updated!"
            />
          </div>
        </form>

      </div>
    </div>
  );
}
