import pool from "../../../lib/db";
import { Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import ExportButtons from "../components/ExportButtons";
import { deleteRegistration } from "../../../app/actions/registration";

export const dynamic = 'force-dynamic';

export default async function ManageRegistrationPage() {
  let records: any[] = [];

  try {
    const [rows]: any = await pool.query("SELECT * FROM registration_records ORDER BY created_at DESC");
    records = rows;
  } catch (error) {
    console.error("Database error:", error);
  }

  // Helper to format date like '28 Feb 2026, 07:11 PM'
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ", " + 
           d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-8 font-sans bg-white min-h-screen text-[13px]">
      
      {/* Title & Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[22px] font-bold text-gray-800 tracking-tight">Professional Registration Records</h1>
        <Link href="/admin/registration-records/new">
          <button className="bg-[#2962ff] hover:bg-[#1e4ad8] text-white font-medium px-4 py-1.5 rounded flex items-center shadow-sm text-[13px] transition">
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Open Form
          </button>
        </Link>
      </div>

      {/* Top Search Bar */}
      <div className="flex items-center space-x-2 mb-6">
        <input 
          type="text" 
          placeholder="Search name, mobile, work, location..." 
          className="border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 w-[350px] text-sm"
        />
        <button className="bg-gray-800 hover:bg-black text-white px-4 py-1.5 rounded text-sm flex items-center shadow-sm transition">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          Search
        </button>
        <div className="ml-auto text-gray-600 text-sm">
          Total: {records.length}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
        <div className="flex flex-col space-y-2">
          {/* Action Buttons */}
          <ExportButtons tableId="registrationTable" filename="omaa-registrations" />
          
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
          <input type="text" placeholder="Search registrations..." className="border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 w-48" />
        </div>
      </div>

      {/* Data Table */}
      <div className="border border-gray-200 overflow-hidden shadow-sm mt-2">
        <div className="overflow-x-auto">
          <table id="registrationTable" className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#2f3d51] text-white text-[12px] font-bold">
                <th className="px-4 py-3 border-r border-gray-600/30 w-16">ID</th>
                <th className="px-4 py-3 border-r border-gray-600/30">Name</th>
                <th className="px-4 py-3 border-r border-gray-600/30">Mobile</th>
                <th className="px-4 py-3 border-r border-gray-600/30">Work / Company</th>
                <th className="px-4 py-3 border-r border-gray-600/30">Location</th>
                <th className="px-4 py-3 border-r border-gray-600/30">Experience</th>
                <th className="px-4 py-3 border-r border-gray-600/30">Registered On</th>
                <th className="px-4 py-3 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {records.length > 0 ? (
                records.map((row) => (
                  <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50 transition align-middle text-[12px] text-gray-700">
                    <td className="px-4 py-3 border-r border-gray-200">#{row.id}</td>
                    <td className="px-4 py-3 border-r border-gray-200 font-bold">{row.name}</td>
                    <td className="px-4 py-3 border-r border-gray-200 flex items-center">
                      {row.mobile}
                      <svg viewBox="0 0 24 24" fill="#25D366" className="w-4 h-4 ml-1.5" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.031 0C5.393 0 .007 5.378.007 12c0 2.115.551 4.18 1.6 6.002L.03 24l6.16-1.61c1.761.968 3.75 1.48 5.839 1.48 6.634 0 12.016-5.38 12.016-12S18.666 0 12.031 0zm6.541 17.262c-.27.76-1.547 1.417-2.137 1.465-.544.045-1.25.132-3.666-.82-2.9-1.139-4.757-4.11-4.9-4.301-.143-.191-1.171-1.558-1.171-2.971 0-1.414.733-2.11 1.002-2.396.269-.286.586-.358.78-.358.195 0 .39.001.56.008.18.007.42-.072.639.454.225.539.732 1.79.795 1.916.064.127.106.275.034.42-.071.144-.106.234-.213.36-.107.127-.225.267-.321.374-.106.118-.219.248-.1.455.118.206.526.87 1.127 1.405.776.69 1.42 .894 1.626 1.01.206.117.324.098.444-.04.12-.137.518-.601.657-.808.139-.206.278-.171.463-.102.185.069 1.17.551 1.37.649.199.098.332.147.38.228.048.081.048.471-.222 1.231z"/>
                      </svg>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200">{row.work_company}</td>
                    <td className="px-4 py-3 border-r border-gray-200">{row.location}</td>
                    <td className="px-4 py-3 border-r border-gray-200">
                      <span className="bg-cyan-400 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block">
                        {row.experience}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 text-gray-500 whitespace-nowrap">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <form action={deleteRegistration}>
                        <input type="hidden" name="id" value={row.id} />
                        <button type="submit" className="border border-red-300 text-red-500 hover:bg-red-50 px-2 py-1.5 rounded flex mx-auto items-center justify-center transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-6 text-center text-gray-500 bg-gray-50/50 text-[13px]">
                    No registrations found
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
