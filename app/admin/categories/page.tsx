import pool from "../../../lib/db";
import { Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import ExportButtons from "../components/ExportButtons";
import ZonesModalButton from "./components/ZonesModalButton";
import { deleteCategory } from "../../../app/actions/categories";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function ManageCategoriesPage() {
  let records: any[] = [];

  try {
    const [rows]: any = await pool.query("SELECT * FROM categories ORDER BY created_at DESC");
    records = rows;
  } catch (error) {
    console.error("Database error:", error);
  }

  return (
    <div className="p-8 font-sans bg-white min-h-screen text-[13px]">
      
      {/* Title & Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[22px] font-bold text-gray-800 tracking-tight">Categories</h1>
        <div className="flex space-x-2">
          <button className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium px-4 py-1.5 rounded flex items-center shadow-sm text-[13px] transition">
            Categories
          </button>
          <Link href="/admin/categories/new">
            <button className="bg-[#2962ff] hover:bg-[#1e4ad8] text-white font-medium px-4 py-1.5 rounded flex items-center shadow-sm text-[13px] transition">
              + Add Category
            </button>
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
        <div className="flex flex-col space-y-2">
          {/* Action Buttons */}
          <ExportButtons tableId="categoryTable" filename="omaa-categories" />
          
          {/* Show entries */}
          <div className="flex items-center space-x-2 text-gray-600 text-sm">
            <span>Show</span>
            <select className="border border-gray-300 rounded px-2 py-0.5 outline-none focus:border-blue-500 bg-white">
              <option>50</option>
              <option>100</option>
            </select>
            <span>entries</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-600">Search:</span>
          <input type="text" className="border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 w-48" />
        </div>
      </div>

      {/* Data Table */}
      <div className="border border-gray-200 overflow-hidden shadow-sm mt-2">
        <div className="overflow-x-auto">
          <table id="categoryTable" className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#212529] text-white text-[12px] font-bold">
                <th className="px-4 py-3 border-r border-gray-600/30 w-16">Sr. No</th>
                <th className="px-4 py-3 border-r border-gray-600/30 w-24">Image</th>
                <th className="px-4 py-3 border-r border-gray-600/30">Category</th>
                <th className="px-4 py-3 border-r border-gray-600/30 w-28">Type</th>
                <th className="px-4 py-3 border-r border-gray-600/30 w-32">Labour Charges</th>
                <th className="px-4 py-3 border-r border-gray-600/30 w-16 text-center">Zones</th>
                <th className="px-4 py-3 text-left w-32">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {records.length > 0 ? (
                records.map((row, index) => (
                  <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50 transition align-middle text-[12px] text-gray-700">
                    <td className="px-4 py-3 border-r border-gray-200">{index + 1}</td>
                    
                    <td className="px-4 py-2 border-r border-gray-200">
                      {row.image_url ? (
                        <div className="w-10 h-10 bg-gray-50 flex items-center justify-center p-1 border border-gray-200 rounded">
                          {/* We use standard img for dummy external data, or Next Image if local */}
                          <img src={row.image_url} alt={row.title} className="max-w-full max-h-full object-contain" />
                        </div>
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </td>

                    <td className="px-4 py-3 border-r border-gray-200 text-gray-900">{row.title}</td>
                    
                    <td className="px-4 py-3 border-r border-gray-200">
                      <span className="bg-gray-500 text-white text-[10px] font-bold px-3 py-1 rounded-full inline-block">
                        {row.type}
                      </span>
                    </td>
                    
                    <td className="px-4 py-3 border-r border-gray-200 text-gray-900">
                      {row.labour_charges}
                    </td>

                    <td className="px-4 py-3 border-r border-gray-200 text-center">
                      <ZonesModalButton 
                        categoryId={row.id} 
                        zonesLocation={row.zones_location} 
                        zonesCount={row.zones} 
                      />
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        <Link href={`/admin/categories/edit/${row.id}`}>
                          <button className="bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-3 py-1 rounded font-medium shadow-sm transition text-xs">
                            Edit
                          </button>
                        </Link>
                        <form action={deleteCategory}>
                          <input type="hidden" name="id" value={row.id} />
                          <button type="submit" className="bg-[#dc3545] hover:bg-[#c82333] text-white px-3 py-1 rounded font-medium shadow-sm transition text-xs">
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-6 text-center text-gray-500 bg-gray-50/50 text-[13px]">
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex justify-between items-center mt-4 text-[13px] text-gray-600">
        <span>Showing {records.length > 0 ? 1 : 0} to {records.length} of {records.length} entries</span>
        <div className="flex items-center space-x-1">
          <button className="px-3 py-1.5 border border-gray-200 bg-gray-100 rounded text-gray-500 cursor-not-allowed">Previous</button>
          <button className="px-3 py-1.5 bg-[#2962ff] text-white rounded">1</button>
          <button className="px-3 py-1.5 border border-gray-200 bg-gray-100 rounded text-gray-500 cursor-not-allowed">Next</button>
        </div>
      </div>

    </div>
  );
}
