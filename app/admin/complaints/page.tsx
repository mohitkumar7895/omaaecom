import pool from "../../../lib/db";
import { Headset, Plus, Check, Trash2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export default async function AdminComplaintsPage() {
  let complaints: any[] = [];
  let stats = { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 };

  try {
    const [rows]: any = await pool.query("SELECT * FROM complaints ORDER BY created_at DESC");
    complaints = rows;
    
    stats.total = complaints.length;
    stats.open = complaints.filter(c => c.status === 'Open').length;
    stats.inProgress = complaints.filter(c => c.status === 'In Progress').length;
    stats.resolved = complaints.filter(c => c.status === 'Resolved').length;
    stats.closed = complaints.filter(c => c.status === 'Closed').length;
  } catch (error) {
    console.error("Database error:", error);
  }

  // Inline Server Action to delete complaint
  async function deleteComplaint(formData: FormData) {
    "use server";
    const id = formData.get("id");
    if (id) {
      await pool.query("DELETE FROM complaints WHERE id = ?", [id]);
      revalidatePath("/admin/complaints");
    }
  }

  // Inline Server Action to update status
  async function updateStatus(formData: FormData) {
    "use server";
    const id = formData.get("id");
    const status = formData.get("status");
    if (id && status) {
      await pool.query("UPDATE complaints SET status = ? WHERE id = ?", [status, id]);
      revalidatePath("/admin/complaints");
    }
  }

  return (
    <div className="p-8 font-sans bg-[#f8f9fa] min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <Headset className="w-7 h-7 text-gray-800 stroke-[2]" />
          <h1 className="text-[26px] font-bold text-gray-800 tracking-tight">Complaints</h1>
        </div>
        <Link href="/complaint" target="_blank">
          <button className="bg-[#2962ff] hover:bg-[#1e4ad8] text-white font-medium px-4 py-2 rounded flex items-center shadow-sm text-sm transition">
            <Plus className="w-4 h-4 mr-1.5" /> Open Complaint Form
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-gray-400 text-[11px] font-medium uppercase mb-1">Total</p>
          <h3 className="text-xl font-bold text-gray-800">{stats.total}</h3>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-gray-400 text-[11px] font-medium uppercase mb-1">Open</p>
          <h3 className="text-xl font-bold text-yellow-500">{stats.open}</h3>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-gray-400 text-[11px] font-medium uppercase mb-1">In Progress</p>
          <h3 className="text-xl font-bold text-blue-500">{stats.inProgress}</h3>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-gray-400 text-[11px] font-medium uppercase mb-1">Resolved</p>
          <h3 className="text-xl font-bold text-green-500">{stats.resolved}</h3>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-gray-400 text-[11px] font-medium uppercase mb-1">Closed</p>
          <h3 className="text-xl font-bold text-gray-600">{stats.closed}</h3>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-gray-400 text-[11px] font-medium uppercase mb-1">All</p>
          <h3 className="text-xl font-bold text-gray-800">{stats.total}</h3>
        </div>

      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#34495e] text-white text-[11px] font-bold tracking-wider uppercase">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">Message</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="text-[13px] bg-white">
              {complaints.length > 0 ? (
                complaints.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition align-top">
                    <td className="px-6 py-4 text-gray-800 font-medium">#{row.id}</td>
                    
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{row.name}</div>
                      <div className="text-gray-400 text-[11px] mt-0.5 flex items-center">
                        {row.phone} <span className="ml-1 text-green-500 font-bold text-[10px]">WA</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-gray-600 font-medium">{row.order_id || "-"}</span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-800">{row.subject}</span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-gray-500 max-w-xs truncate">{row.message}</p>
                    </td>

                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(row.created_at).toLocaleString('en-US', { 
                        day: '2-digit', month: 'short', year: 'numeric', 
                        hour: '2-digit', minute: '2-digit', hour12: true 
                      })}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        row.status === 'Open' ? 'bg-yellow-100 text-yellow-700' :
                        row.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        row.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        
                        {/* Status Update Form */}
                        <form action={updateStatus} className="flex items-center space-x-1">
                          <input type="hidden" name="id" value={row.id} />
                          <div className="relative border border-gray-200 rounded text-xs bg-white flex items-center pr-2">
                            <select 
                              name="status" 
                              defaultValue={row.status}
                              className="appearance-none bg-transparent pl-2 pr-6 py-1 focus:outline-none text-gray-700 font-medium"
                            >
                              <option value="Open">Open</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                              <option value="Closed">Closed</option>
                            </select>
                            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 pointer-events-none" />
                          </div>
                          <button type="submit" className="bg-[#34495e] text-white p-1 rounded hover:bg-[#2c3e50] transition">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        </form>

                        {/* Delete Form */}
                        <form action={deleteComplaint}>
                          <input type="hidden" name="id" value={row.id} />
                          <button type="submit" className="border border-red-200 text-red-500 bg-red-50 p-1 rounded hover:bg-red-100 transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </form>

                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 bg-gray-50/50">
                    No complaints found.
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
