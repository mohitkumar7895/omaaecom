import pool from "../../../lib/db";
import { Copy, FileSpreadsheet, FileIcon as FilePdf, Printer, MessageCircle } from "lucide-react";
import Link from "next/link";
import ExportButtons from "../components/ExportButtons";
import WorkingStatusSelect from "./components/WorkingStatusSelect";
import { updateWorkingStatus, updateTotal } from "./actions";

export const dynamic = 'force-dynamic';

export default async function ManageBookingPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const filter = resolvedSearchParams.filter || "All";
  
  let bookings: any[] = [];

  try {
    let query = `SELECT * FROM bookings WHERE working_status = 'Pendi' ORDER BY created_at DESC`;
    if (filter !== "All") {
      query = `SELECT * FROM bookings WHERE type = '${filter}' AND working_status = 'Pendi' ORDER BY created_at DESC`;
    }
    const [rows]: any = await pool.query(query);
    bookings = rows.map((row: any) => {
      // Parse services JSON if it's a string
      let parsedServices = row.services;
      try {
        if (typeof row.services === 'string') {
          parsedServices = JSON.parse(row.services);
        }
      } catch {}
      return { ...row, services: parsedServices };
    });
  } catch (e) {
    console.error("Failed to fetch bookings:", e);
  }

  return (
    <div className="p-8 font-sans bg-white min-h-screen text-[13px]">
      
      {/* Title */}
      <h1 className="text-[22px] font-bold text-gray-800 tracking-tight mb-4">Manage Booking</h1>

      {/* Tabs */}
      <div className="flex items-center space-x-2 mb-6">
        <Link href="?filter=All">
          <button className={`px-4 py-1.5 rounded font-medium transition ${
            filter === "All" ? "bg-[#2962ff] text-white" : "text-[#2962ff] hover:bg-blue-50"
          }`}>
            All
          </button>
        </Link>
        <Link href="?filter=Normal Service">
          <button className={`px-4 py-1.5 rounded font-medium transition ${
            filter === "Normal Service" ? "bg-[#2962ff] text-white" : "text-[#2962ff] hover:bg-blue-50"
          }`}>
            Normal Service
          </button>
        </Link>
        <Link href="?filter=New Product">
          <button className={`px-4 py-1.5 rounded font-medium transition ${
            filter === "New Product" ? "bg-[#2962ff] text-white" : "text-[#2962ff] hover:bg-blue-50"
          }`}>
            New Product
          </button>
        </Link>
        <Link href="?filter=AMC">
          <button className={`px-4 py-1.5 rounded font-medium transition ${
            filter === "AMC" ? "bg-[#2962ff] text-white" : "text-[#2962ff] hover:bg-blue-50"
          }`}>
            AMC
          </button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
        <div className="flex flex-col space-y-2">
          {/* Action Buttons */}
          <ExportButtons tableId="bookingsTable" filename="omaa-bookings" />
          
          {/* Show entries */}
          <div className="flex items-center space-x-2 text-gray-600">
            <span>Show</span>
            <select className="border border-gray-300 rounded px-2 py-0.5 outline-none focus:border-blue-500">
              <option>50</option>
              <option>100</option>
            </select>
            <span>entries</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Search:</span>
          <input type="text" className="border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 w-48" />
        </div>
      </div>

      {/* Data Table */}
      <div className="border border-gray-200 overflow-hidden shadow-[0_2px_12px_rgb(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table id="bookingsTable" className="w-full text-left border-collapse min-w-[1600px]">
            <thead>
              <tr className="bg-[#2f3d51] text-white text-[11px] font-bold">
                <th className="px-3 py-4 border-r border-gray-600/30">ID</th>
                <th className="px-3 py-4 border-r border-gray-600/30">Order ID</th>
                <th className="px-3 py-4 border-r border-gray-600/30">Type</th>
                <th className="px-3 py-4 border-r border-gray-600/30">Address</th>
                <th className="px-3 py-4 border-r border-gray-600/30">Cus. Name</th>
                <th className="px-3 py-4 border-r border-gray-600/30">Mobile</th>
                <th className="px-3 py-4 border-r border-gray-600/30">Category</th>
                <th className="px-3 py-4 border-r border-gray-600/30">Services</th>
                <th className="px-3 py-4 border-r border-gray-600/30">Date</th>
                <th className="px-3 py-4 border-r border-gray-600/30">Slot</th>
                <th className="px-3 py-4 border-r border-gray-600/30">Total</th>
                <th className="px-3 py-4 border-r border-gray-600/30 text-center">Share</th>
                <th className="px-3 py-4 border-r border-gray-600/30">Payment</th>
                <th className="px-3 py-4 border-r border-gray-600/30">Payment Status</th>
                <th className="px-3 py-4">Working Status</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {bookings.length > 0 ? (
                bookings.map((row) => (
                  <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50 transition align-middle text-[12px] text-gray-700">
                    <td className="px-3 py-4 border-r border-gray-200">{row.id}</td>
                    <td className="px-3 py-4 border-r border-gray-200 font-medium">{row.order_id}</td>
                    
                    <td className="px-3 py-4 border-r border-gray-200 text-center">
                      <span className="bg-gray-600 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                        {row.type || 'Online'}
                      </span>
                    </td>
                    
                    {/* Address */}
                    <td className="px-3 py-4 border-r border-gray-200 text-[11px] max-w-[160px] leading-snug">
                      {row.address || '—'}
                    </td>
                    
                    <td className="px-3 py-4 border-r border-gray-200 leading-tight">
                      {row.customer_name}
                    </td>

                    <td className="px-3 py-4 border-r border-gray-200 font-medium text-gray-800">
                      {row.mobile}
                    </td>
                    
                    <td className="px-3 py-4 border-r border-gray-200 leading-tight max-w-[140px]">
                      {row.category || '—'}
                    </td>
                    
                    {/* Services — parse JSON array */}
                    <td className="px-3 py-4 border-r border-gray-200 leading-tight max-w-[200px]">
                      {Array.isArray(row.services) ? (
                        <ul className="space-y-1">
                          {row.services.map((s: any, i: number) => (
                            <li key={i} className="text-[11px] text-gray-700">
                              <span className="font-semibold">{s.title}</span>
                              {s.quantity > 1 && <span className="text-gray-400 ml-1">x{s.quantity}</span>}
                              <span className="text-gray-500 ml-1">₹{s.price}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-500 text-[11px]">{String(row.services || '—')}</span>
                      )}
                    </td>

                    <td className="px-3 py-4 border-r border-gray-200 leading-tight whitespace-nowrap text-[11px]">
                      {row.booking_date 
                        ? new Date(row.booking_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') 
                        : new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
                      }
                    </td>
                    
                    <td className="px-3 py-4 border-r border-gray-200 leading-tight whitespace-nowrap text-[11px]">
                      {row.time_slot}
                    </td>

                    <td className="px-3 py-4 border-r border-gray-200">
                      <form action={updateTotal} className="flex items-center space-x-1">
                        <input type="hidden" name="id" value={row.id} />
                        <div className="relative">
                          <span className="absolute left-2 top-1 text-gray-500">₹</span>
                          <input 
                            type="number" 
                            name="total" 
                            defaultValue={row.total}
                            className="border border-gray-300 rounded pl-5 pr-2 py-1 w-20 text-[11px] outline-none focus:border-blue-500"
                          />
                        </div>
                        <button type="submit" className="border border-blue-400 text-blue-500 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-[10px] transition">
                          Update
                        </button>
                      </form>
                    </td>

                    <td className="px-3 py-4 border-r border-gray-200 text-center">
                      <button className="bg-[#1b6b50] hover:bg-[#15533e] text-white px-2 py-1 rounded shadow-sm text-[11px] transition flex flex-col items-center mx-auto">
                        <MessageCircle className="w-3.5 h-3.5 mb-0.5" />
                        <span>Share</span>
                      </button>
                    </td>

                    <td className="px-3 py-4 border-r border-gray-200">
                      {row.payment_method}
                    </td>

                    <td className="px-3 py-4 border-r border-gray-200 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white whitespace-nowrap ${
                        row.payment_status === 'Completed' ? 'bg-[#1b6b50]' : 'bg-[#ffc107] text-gray-900'
                      }`}>
                        {row.payment_status}
                      </span>
                    </td>

                    <td className="px-3 py-4 text-center">
<WorkingStatusSelect id={row.id} defaultValue={row.working_status} action={updateWorkingStatus} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={15} className="px-6 py-12 text-center text-gray-500 bg-gray-50">
                    No bookings found.
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
