import pool from "../../../lib/db";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import ExportButtons from "../components/ExportButtons";
import { deleteSubcategory } from "../../actions/subcategories";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function SubcategoriesPage() {
  let subcategories = [];

  try {
    const [rows]: any = await pool.query(`
      SELECT s.*, c.title as category_title 
      FROM subcategories s
      JOIN categories c ON s.category_id = c.id
      ORDER BY s.id ASC
    `);
    subcategories = rows;
  } catch (error) {
    console.error("Error fetching subcategories:", error);
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="p-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-[26px] font-bold text-gray-800 tracking-tight">SubCategories</h1>
          <Link 
            href="/admin/subcategories/new" 
            className="bg-[#007bff] hover:bg-[#0069d9] text-white px-5 py-2.5 rounded shadow-sm text-[15px] font-medium transition flex items-center space-x-2"
          >
            <span className="text-xl leading-none">+</span>
            <span>Add Sub Category</span>
          </Link>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-end mb-4">
          <ExportButtons tableId="subcategories-table" />
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 font-medium">Search:</span>
            <input 
              type="text" 
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 shadow-sm w-64"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table id="subcategories-table" className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#2c3e50] text-white text-[13px]">
                  <th className="px-4 py-3.5 font-semibold w-16 border-r border-gray-600 text-center">SR.No <span className="text-[10px] ml-1 text-gray-400">▲▼</span></th>
                  <th className="px-4 py-3.5 font-semibold border-r border-gray-600">Category <span className="text-[10px] ml-1 text-gray-400">▲▼</span></th>
                  <th className="px-4 py-3.5 font-semibold w-32 border-r border-gray-600 text-center">Image <span className="text-[10px] ml-1 text-gray-400">▲▼</span></th>
                  <th className="px-4 py-3.5 font-semibold border-r border-gray-600">Subcategory <span className="text-[10px] ml-1 text-gray-400">▲▼</span></th>
                  <th className="px-4 py-3.5 font-semibold w-32 text-center">Action <span className="text-[10px] ml-1 text-gray-400">▲▼</span></th>
                </tr>
              </thead>
              <tbody>
                {subcategories.map((row: any, index: number) => (
                  <tr 
                    key={row.id} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition text-sm text-gray-700"
                  >
                    <td className="px-4 py-4 border-r border-gray-200 text-center font-medium">
                      {index + 1}
                    </td>
                    
                    <td className="px-4 py-4 border-r border-gray-200">
                      {row.category_title}
                    </td>

                    <td className="px-4 py-4 border-r border-gray-200 text-center">
                      <div className="w-12 h-12 rounded bg-gray-100 border border-gray-200 mx-auto overflow-hidden flex items-center justify-center">
                        {row.image_url ? (
                          <img 
                            src={row.image_url} 
                            alt={row.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">No img</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 border-r border-gray-200">
                      {row.title}
                    </td>
                    
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Link 
                          href={`/admin/subcategories/edit/${row.id}`}
                          className="bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-3 py-1 rounded text-[13px] font-medium transition shadow-sm"
                        >
                          Edit
                        </Link>
                        
                        <form action={deleteSubcategory}>
                          <input type="hidden" name="id" value={row.id} />
                          <button 
                            type="submit"
                            className="bg-[#dc3545] hover:bg-[#c82333] text-white px-3 py-1 rounded text-[13px] font-medium transition shadow-sm"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}

                {subcategories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No subcategories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between text-sm text-gray-600">
            <div>Showing 1 to {subcategories.length} of {subcategories.length} entries</div>
            <div className="flex space-x-1">
              <button className="px-3 py-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50">Previous</button>
              <button className="px-3 py-1 border border-blue-500 bg-blue-50 text-blue-600 rounded font-medium">1</button>
              <button className="px-3 py-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
