import pool from "../../../lib/db";
import { Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export default async function ManageBannersPage() {
  let banners: any[] = [];

  try {
    const [rows]: any = await pool.query("SELECT * FROM banners ORDER BY created_at DESC");
    banners = rows;
  } catch (error) {
    console.error("Database error:", error);
  }

  async function deleteBanner(formData: FormData) {
    "use server";
    const id = formData.get("id");
    if (id) {
      await pool.query("DELETE FROM banners WHERE id = ?", [id]);
      revalidatePath("/admin/banners");
    }
  }

  return (
    <div className="p-8 font-sans bg-[#f8f9fa] min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Manage Banner</h1>
        <Link href="/admin/banners/new">
          <button className="bg-[#2962ff] hover:bg-[#1e4ad8] text-white font-medium px-4 py-2 rounded flex items-center shadow-sm text-sm transition">
            <Plus className="w-4 h-4 mr-1.5" /> Add Banner
          </button>
        </Link>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#34495e] text-white text-[12px] font-bold">
                <th className="px-6 py-3 border-r border-gray-600/30">ID</th>
                <th className="px-6 py-3 border-r border-gray-600/30 text-center">Type</th>
                <th className="px-6 py-3 border-r border-gray-600/30 text-center">Banner1</th>
                <th className="px-6 py-3 border-r border-gray-600/30 text-center">Banner2</th>
                <th className="px-6 py-3 border-r border-gray-600/30 text-center">Banner3</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="text-[13px] bg-white">
              {banners.length > 0 ? (
                banners.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition align-middle">
                    <td className="px-6 py-4 text-gray-800 font-medium border-r border-gray-100">{row.id}</td>
                    
                    <td className="px-6 py-4 border-r border-gray-100 text-center font-bold uppercase text-[11px] text-gray-600">
                      {row.type || 'DESKTOP'}
                    </td>

                    <td className="px-6 py-4 border-r border-gray-100 text-center">
                      {row.banner1_url ? (
                        <div className="inline-block relative w-32 h-16 bg-gray-100 rounded overflow-hidden">
                          <Image src={row.banner1_url} alt="Banner 1" fill className="object-contain" />
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No image</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 border-r border-gray-100 text-center">
                      {row.banner2_url ? (
                        <div className="inline-block relative w-32 h-16 bg-gray-100 rounded overflow-hidden">
                          <Image src={row.banner2_url} alt="Banner 2" fill className="object-contain" />
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No image</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 border-r border-gray-100 text-center">
                      {row.banner3_url ? (
                        <div className="inline-block relative w-32 h-16 bg-gray-100 rounded overflow-hidden">
                          <Image src={row.banner3_url} alt="Banner 3" fill className="object-contain" />
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No image</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 font-bold px-3 py-1 rounded text-[11px] transition">
                          Edit
                        </button>
                        <form action={deleteBanner}>
                          <input type="hidden" name="id" value={row.id} />
                          <button type="submit" className="bg-[#dc3545] hover:bg-[#c82333] text-white font-bold px-3 py-1 rounded text-[11px] transition">
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 bg-gray-50/50">
                    No banners found. Click "Add Banner" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
