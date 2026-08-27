import pool from "@/lib/db";
import { Mail, Phone, MessageSquare, Trash2, CheckCircle2, Clock, User } from "lucide-react";
import { deleteContact } from "@/app/actions/contacts";
import StatusSelect from "./StatusSelect";

export const dynamic = "force-dynamic";

export default async function AdminContactsPage() {
  let contacts: any[] = [];
  const stats = { total: 0, new: 0, contacted: 0, closed: 0 };

  try {
    // Ensure table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NULL,
        phone VARCHAR(50) NULL,
        subject VARCHAR(255) NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'New',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const [rows]: any = await pool.query("SELECT * FROM contacts ORDER BY created_at DESC");
    contacts = rows || [];

    stats.total = contacts.length;
    stats.new = contacts.filter((c) => c.status === "New" || !c.status).length;
    stats.contacted = contacts.filter((c) => c.status === "Contacted").length;
    stats.closed = contacts.filter((c) => c.status === "Closed" || c.status === "Resolved").length;
  } catch (error) {
    console.error("Database error loading contacts:", error);
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 font-sans bg-[#f8f9fa] min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600 shadow-sm">
            <Mail className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Contact Inquiries</h1>
            <p className="text-xs text-gray-500 mt-0.5">Messages and inquiries submitted via the Contact Us page</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col justify-between">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Inquiries</p>
          <h3 className="text-2xl font-black text-gray-900 leading-none">{stats.total}</h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col justify-between">
          <p className="text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">New / Unread</p>
          <h3 className="text-2xl font-black text-indigo-600 leading-none">{stats.new}</h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col justify-between">
          <p className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">Contacted</p>
          <h3 className="text-2xl font-black text-amber-600 leading-none">{stats.contacted}</h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col justify-between">
          <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">Closed / Resolved</p>
          <h3 className="text-2xl font-black text-emerald-600 leading-none">{stats.closed}</h3>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">All Inquiries ({contacts.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead className="bg-gray-50/80 text-gray-500 uppercase text-[11px] font-bold border-b border-gray-100">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-5 py-3.5">Subject & Message</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {contacts.length > 0 ? (
                contacts.map((row: any) => (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* ID */}
                    <td className="px-5 py-4 font-bold text-gray-900 text-xs">
                      #{row.id}
                    </td>

                    {/* Customer Name */}
                    <td className="px-5 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {row.name ? row.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <span className="font-bold text-gray-800">{row.name}</span>
                      </div>
                    </td>

                    {/* Phone & Email */}
                    <td className="px-5 py-4">
                      {row.phone && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 mb-1">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <a href={`tel:${row.phone}`} className="hover:text-indigo-600">{row.phone}</a>
                          <a 
                            href={`https://wa.me/91${row.phone.replace(/\D/g, '')}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 text-[10px] font-bold bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-200 hover:bg-green-100"
                          >
                            WhatsApp
                          </a>
                        </div>
                      )}
                      {row.email && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <a href={`mailto:${row.email}`} className="hover:text-indigo-600">{row.email}</a>
                        </div>
                      )}
                      {!row.phone && !row.email && <span className="text-xs text-gray-400">N/A</span>}
                    </td>

                    {/* Subject & Message */}
                    <td className="px-5 py-4 max-w-xs">
                      {row.subject && (
                        <p className="font-bold text-xs text-gray-900 mb-1">{row.subject}</p>
                      )}
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        {row.message}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {row.created_at ? new Date(row.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      }) : "N/A"}
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-5 py-4 text-center">
                      <StatusSelect id={row.id} currentStatus={row.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <form action={deleteContact} className="inline-block">
                        <input type="hidden" name="id" value={row.id} />
                        <button
                          type="submit"
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                    <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No contact inquiries submitted yet.
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
