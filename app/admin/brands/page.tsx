import pool from "../../../lib/db";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export default async function ManageBrandsPage() {
  let brands: any[] = [];

  try {
    const [rows]: any = await pool.query("SELECT * FROM brands ORDER BY id DESC");
    brands = rows;
  } catch (error) {
    console.error("Database error:", error);
  }

  async function deleteBrand(formData: FormData) {
    "use server";
    const id = formData.get("id");
    if (id) {
      await pool.query("DELETE FROM brands WHERE id = ?", [id]);
      revalidatePath("/admin/brands");
    }
  }

  return (
    <div className="p-8 font-sans bg-[#f8f9fa] min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Manage Brands</h1>
        <Link href="/admin/brands/new">
          <button className="bg-[#2962ff] hover:bg-[#1e4ad8] text-white font-medium px-4 py-2 rounded flex items-center shadow-sm text-sm transition">
            <Plus className="w-4 h-4 mr-1.5" /> Add Brand
          </button>
        </Link>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#34495e] text-white text-[12px] font-bold">
                <th className="px-6 py-3 border-r border-gray-600/30 w-16">ID</th>
                <th className="px-6 py-3 border-r border-gray-600/30 text-center w-32">Logo</th>
                <th className="px-6 py-3 border-r border-gray-600/30">Brand Name</th>
                <th className="px-6 py-3 border-r border-gray-600/30">Category</th>
                <th className="px-6 py-3 border-r border-gray-600/30">Status</th>
                <th className="px-6 py-3 w-20 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-[13px] bg-white">
              {brands.length > 0 ? (
                brands.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition align-middle">
                    <td className="px-6 py-4 text-blue-600 font-medium border-r border-gray-100">{row.id}</td>
                    
                    <td className="px-6 py-4 border-r border-gray-100 text-center">
                      {row.logo_url ? (
                        <div className="inline-block relative w-16 h-8 bg-transparent">
                          <Image src={row.logo_url} alt={row.name} fill className="object-contain" />
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[10px]">No logo</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 border-r border-gray-100 font-bold text-gray-800">
                      {row.name}
                    </td>

                    <td className="px-6 py-4 border-r border-gray-100 text-gray-600">
                      {row.category}
                    </td>
                    
                    <td className="px-6 py-4 border-r border-gray-100">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        row.status === 'Active' ? 'bg-green-100/50 text-green-600 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {row.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <form action={deleteBrand} className="inline-block">
                        <input type="hidden" name="id" value={row.id} />
                        <button type="submit" className="text-red-400 hover:text-red-600 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 bg-gray-50/50">
                    No brands found. Click "Add Brand" to create one.
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
