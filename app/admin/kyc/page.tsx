import pool from "../../../lib/db";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { revalidatePath } from "next/cache";
import ExportButtons from "../components/ExportButtons";

export const dynamic = 'force-dynamic';

export default async function ManageKycPage() {
  let records: any[] = [];

  try {
    const [rows]: any = await pool.query("SELECT * FROM kyc_records ORDER BY created_at DESC");
    records = rows;
  } catch (error) {
    console.error("Database error:", error);
  }

  async function deleteKyc(formData: FormData) {
    "use server";
    const id = formData.get("id");
    if (id) {
      await pool.query("DELETE FROM kyc_records WHERE id = ?", [id]);
      revalidatePath("/admin/kyc");
    }
  }

  return (
    <div className="p-8 font-sans bg-white min-h-screen text-[13px]">
      
      {/* Title & Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[22px] font-bold text-gray-800 tracking-tight">KYC</h1>
        <Link href="/admin/kyc/new">
          <button className="bg-[#2962ff] hover:bg-[#1e4ad8] text-white font-medium px-4 py-1.5 rounded flex items-center shadow-sm text-[13px] transition">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add KYC
          </button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
        <div className="flex flex-col space-y-2">
          {/* Action Buttons */}
          <ExportButtons tableId="kycTable" filename="omaa-kyc" />
          
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
          <table id="kycTable" className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-[#2f3d51] text-white text-[11px] font-bold">
                <th className="px-3 py-4 border-r border-gray-600/30 w-16">SR.No</th>
                <th className="px-3 py-4 border-r border-gray-600/30">User</th>
                <th className="px-3 py-4 border-r border-gray-600/30">Pan Card</th>
                <th className="px-3 py-4 border-r border-gray-600/30">Aadhar Card</th>
                <th className="px-3 py-4 border-r border-gray-600/30">Bank Name</th>
                <th className="px-3 py-4 border-r border-gray-600/30">Branch</th>
                <th className="px-3 py-4 border-r border-gray-600/30">Bank Account</th>
                <th className="px-3 py-4 border-r border-gray-600/30">IFSC Code</th>
                <th className="px-3 py-4 border-r border-gray-600/30 text-center">Check Image</th>
                <th className="px-3 py-4 border-r border-gray-600/30">Date</th>
                <th className="px-3 py-4 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {records.length > 0 ? (
                records.map((row, index) => (
                  <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50 transition align-middle text-[12px] text-gray-700">
                    <td className="px-3 py-4 border-r border-gray-200">{index + 1}</td>
                    <td className="px-3 py-4 border-r border-gray-200 font-medium">{row.user_name}</td>
                    <td className="px-3 py-4 border-r border-gray-200">{row.pan_card}</td>
                    <td className="px-3 py-4 border-r border-gray-200">{row.aadhar_card}</td>
                    <td className="px-3 py-4 border-r border-gray-200">{row.bank_name}</td>
                    <td className="px-3 py-4 border-r border-gray-200">{row.branch}</td>
                    <td className="px-3 py-4 border-r border-gray-200">{row.account_number}</td>
                    <td className="px-3 py-4 border-r border-gray-200 font-medium text-gray-800">{row.ifsc_code}</td>
                    
                    <td className="px-3 py-4 border-r border-gray-200 text-center">
                      {row.cheque_image_url ? (
                        <a href={row.cheque_image_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-[11px]">
                          View Cheque
                        </a>
                      ) : (
                        <span className="text-gray-400 text-[10px]">No File</span>
                      )}
                    </td>

                    <td className="px-3 py-4 border-r border-gray-200 whitespace-nowrap">
                      {new Date(row.created_at).toLocaleDateString('en-GB')}
                    </td>
                    
                    <td className="px-3 py-4 text-center">
                      <form action={deleteKyc}>
                        <input type="hidden" name="id" value={row.id} />
                        <button type="submit" className="text-red-500 hover:text-red-700 transition">
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-6 py-6 text-center text-gray-500 bg-gray-50/50 text-[13px]">
                    No data available in table
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
          <button className="px-3 py-1.5 border border-gray-200 bg-gray-100 rounded text-gray-500 cursor-not-allowed">Next</button>
        </div>
      </div>

    </div>
  );
}
