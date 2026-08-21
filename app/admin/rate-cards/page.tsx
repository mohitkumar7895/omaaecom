import pool from "../../../lib/db";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import ExportButtons from "../components/ExportButtons";
import { deleteRateCard } from "../../actions/rateCards";

export const dynamic = 'force-dynamic';

export default async function RateCardsPage() {
  let rateCards = [];

  try {
    const [rows]: any = await pool.query(`
      SELECT 
        rc.*, 
        c.title as category_title, 
        h.title as heading_title 
      FROM rate_cards rc
      JOIN categories c ON rc.category_id = c.id
      JOIN rate_headings h ON rc.heading_id = h.id
      ORDER BY rc.id DESC
    `);
    rateCards = rows;
  } catch (error) {
    console.error("Error fetching rate cards:", error);
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="p-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-[26px] font-bold text-gray-800 tracking-tight">Rate Card</h1>
          <Link 
            href="/admin/rate-cards/new" 
            className="bg-[#007bff] hover:bg-[#0069d9] text-white px-5 py-2.5 rounded shadow-sm text-[15px] font-medium transition flex items-center space-x-2"
          >
            <span className="text-xl leading-none">+</span>
            <span>Add Rate Card</span>
          </Link>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-end mb-4">
          <ExportButtons tableId="rate-cards-table" />
          
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
            <table id="rate-cards-table" className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#2c3e50] text-white text-[13px]">
                  <th className="px-4 py-3.5 font-semibold w-16 border-r border-gray-600 text-center">SR No. <span className="text-[10px] ml-1 text-gray-400">▲▼</span></th>
                  <th className="px-4 py-3.5 font-semibold border-r border-gray-600">Category <span className="text-[10px] ml-1 text-gray-400">▲▼</span></th>
                  <th className="px-4 py-3.5 font-semibold border-r border-gray-600">Heading <span className="text-[10px] ml-1 text-gray-400">▲▼</span></th>
                  <th className="px-4 py-3.5 font-semibold border-r border-gray-600">Part Name <span className="text-[10px] ml-1 text-gray-400">▲▼</span></th>
                  <th className="px-4 py-3.5 font-semibold border-r border-gray-600">Amount <span className="text-[10px] ml-1 text-gray-400">▲▼</span></th>
                  <th className="px-4 py-3.5 font-semibold border-r border-gray-600">Labour Charges <span className="text-[10px] ml-1 text-gray-400">▲▼</span></th>
                  <th className="px-4 py-3.5 font-semibold w-28 text-center">Action <span className="text-[10px] ml-1 text-gray-400">▲▼</span></th>
                </tr>
              </thead>
              <tbody>
                {rateCards.map((row: any, index: number) => (
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

                    <td className="px-4 py-4 border-r border-gray-200">
                      {row.heading_title}
                    </td>

                    <td className="px-4 py-4 border-r border-gray-200">
                      {row.part_name}
                    </td>

                    <td className="px-4 py-4 border-r border-gray-200">
                      {row.price}
                    </td>
                    
                    <td className="px-4 py-4 border-r border-gray-200">
                      {row.labour_charges}
                    </td>
                    
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Link 
                          href={`/admin/rate-cards/edit/${row.id}`}
                          className="bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-2.5 py-1.5 rounded text-[13px] font-medium transition shadow-sm flex items-center justify-center"
                          title="Edit"
                        >
                          Edit
                        </Link>
                        
                        <form action={deleteRateCard}>
                          <input type="hidden" name="id" value={row.id} />
                          <button 
                            type="submit"
                            className="bg-[#dc3545] hover:bg-[#c82333] text-white px-2.5 py-1.5 rounded text-[13px] font-medium transition shadow-sm flex items-center justify-center"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}

                {rateCards.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No rate cards found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between text-sm text-gray-600">
            <div>Showing 1 to {rateCards.length} of {rateCards.length} entries</div>
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
