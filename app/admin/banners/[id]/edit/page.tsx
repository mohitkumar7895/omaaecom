"use client";

import { useState, useEffect } from "react";
import { updateBanners } from "../../../../actions/banners";
import { useParams, useRouter } from "next/navigation";

export default function EditBannerPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [banner, setBanner] = useState<any>(null);
  
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

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await updateBanners(id, formData);
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
                defaultValue={banner.type || "desktop"}
                className="block w-full text-sm text-gray-700 border border-gray-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="desktop">Desktop Banner</option>
                <option value="mobile">Mobile Banner</option>
              </select>
            </div>

            {/* Banner 1 */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-800">Banner 1 (Leave empty to keep current)</label>
              <div className="flex flex-col space-y-2">
                {banner.banner1_url && (
                  <div className="h-16 w-32 bg-gray-100 rounded overflow-hidden relative shadow-sm border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={banner.banner1_url} alt="Current Banner 1" className="w-full h-full object-contain" />
                  </div>
                )}
                <input 
                  type="file" 
                  name="banner1" 
                  accept="image/*"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:border file:border-gray-300
                    file:text-sm file:font-medium
                    file:bg-gray-50 file:text-gray-700
                    hover:file:bg-gray-100
                    border border-gray-200 rounded p-1.5"
                />
              </div>
            </div>

            {/* Banner 2 */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-800">Banner 2 (Leave empty to keep current)</label>
              <div className="flex flex-col space-y-2">
                {banner.banner2_url && (
                  <div className="h-16 w-32 bg-gray-100 rounded overflow-hidden relative shadow-sm border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={banner.banner2_url} alt="Current Banner 2" className="w-full h-full object-contain" />
                  </div>
                )}
                <input 
                  type="file" 
                  name="banner2" 
                  accept="image/*"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:border file:border-gray-300
                    file:text-sm file:font-medium
                    file:bg-gray-50 file:text-gray-700
                    hover:file:bg-gray-100
                    border border-gray-200 rounded p-1.5"
                />
              </div>
            </div>

            {/* Banner 3 */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-800">Banner 3 (Leave empty to keep current)</label>
              <div className="flex flex-col space-y-2">
                {banner.banner3_url && (
                  <div className="h-16 w-32 bg-gray-100 rounded overflow-hidden relative shadow-sm border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={banner.banner3_url} alt="Current Banner 3" className="w-full h-full object-contain" />
                  </div>
                )}
                <input 
                  type="file" 
                  name="banner3" 
                  accept="image/*"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:border file:border-gray-300
                    file:text-sm file:font-medium
                    file:bg-gray-50 file:text-gray-700
                    hover:file:bg-gray-100
                    border border-gray-200 rounded p-1.5"
                />
              </div>
            </div>

          </div>

          <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#2c3e50] hover:bg-[#1a252f] text-white font-medium px-6 py-2.5 rounded text-sm transition disabled:opacity-70"
            >
              {loading ? "Updating..." : "Update Banner"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
