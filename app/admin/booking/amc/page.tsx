import ExportButtons from "../../../admin/components/ExportButtons";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "AMC Booking - OMAA Admin",
};

export default async function AmcBookingPage() {
  
  let bookings: any[] = [];

  return (
    <div className="flex-1 bg-white min-h-screen">
      <div className="p-8">
        
        {/* Header Section */}
        <div className="mb-4">
          <h1 className="text-[22px] font-bold text-gray-800 tracking-tight">Manage Booking</h1>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 mb-6">
          <Link href="/admin/booking?filter=All">
            <button className="px-4 py-1.5 rounded font-medium transition text-[#2962ff] hover:bg-blue-50 text-[13px]">
              All
            </button>
          </Link>
          <Link href="/admin/booking?filter=Normal Service">
            <button className="px-4 py-1.5 rounded font-medium transition text-[#2962ff] hover:bg-blue-50 text-[13px]">
              Normal Service
            </button>
          </Link>
          <Link href="/admin/booking/new-product">
            <button className="px-4 py-1.5 rounded font-medium transition text-[#2962ff] hover:bg-blue-50 text-[13px]">
              New Product
            </button>
          </Link>
          <Link href="/admin/booking/amc">
            <button className="px-4 py-1.5 rounded font-medium transition bg-[#2962ff] text-white text-[13px]">
              AMC
            </button>
          </Link>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-end mb-4">
          <ExportButtons tableId="amc-booking-table" />
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 font-medium">Search:</span>
            <input 
              type="text" 
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 shadow-sm w-64"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="border border-gray-200 overflow-x-auto">
          <table id="amc-booking-table" className="w-full text-left border-collapse min-w-[1600px]">
            <thead>
              <tr className="bg-[#2c3e50] text-white text-[12px] whitespace-nowrap">
                <th className="px-3 py-3 border-r border-gray-600 font-medium">ID <span className="text-[9px] ml-0.5 text-gray-400">▲▼</span></th>
                <th className="px-3 py-3 border-r border-gray-600 font-medium">Order ID <span className="text-[9px] ml-0.5 text-gray-400">▲▼</span></th>
                <th className="px-3 py-3 border-r border-gray-600 font-medium">Type <span className="text-[9px] ml-0.5 text-gray-400">▲▼</span></th>
                <th className="px-3 py-3 border-r border-gray-600 font-medium">Address <span className="text-[9px] ml-0.5 text-gray-400">▲▼</span></th>
                <th className="px-3 py-3 border-r border-gray-600 font-medium">Cus. Name <span className="text-[9px] ml-0.5 text-gray-400">▲▼</span></th>
                <th className="px-3 py-3 border-r border-gray-600 font-medium">Mobile <span className="text-[9px] ml-0.5 text-gray-400">▲▼</span></th>
                <th className="px-3 py-3 border-r border-gray-600 font-medium max-w-[120px]">Category <span className="text-[9px] ml-0.5 text-gray-400">▲▼</span></th>
                <th className="px-3 py-3 border-r border-gray-600 font-medium max-w-[150px]">Services <span className="text-[9px] ml-0.5 text-gray-400">▲▼</span></th>
                <th className="px-3 py-3 border-r border-gray-600 font-medium">Date <span className="text-[9px] ml-0.5 text-gray-400">▲▼</span></th>
                <th className="px-3 py-3 border-r border-gray-600 font-medium">Slot <span className="text-[9px] ml-0.5 text-gray-400">▲▼</span></th>
                <th className="px-3 py-3 border-r border-gray-600 font-medium">Total <span className="text-[9px] ml-0.5 text-gray-400">▲▼</span></th>
                <th className="px-3 py-3 border-r border-gray-600 font-medium">Share <span className="text-[9px] ml-0.5 text-gray-400">▲▼</span></th>
                <th className="px-3 py-3 border-r border-gray-600 font-medium">Payment <span className="text-[9px] ml-0.5 text-gray-400">▲▼</span></th>
                <th className="px-3 py-3 border-r border-gray-600 font-medium">Payment<br/>Status <span className="text-[9px] ml-0.5 text-gray-400">▲▼</span></th>
                <th className="px-3 py-3 font-medium">Working<br/>Status <span className="text-[9px] ml-0.5 text-gray-400">▲▼</span></th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {bookings.length > 0 ? (
                bookings.map((row) => (
                  <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50 transition align-middle text-[12px] text-gray-700">
                    <td className="px-3 py-4 border-r border-gray-200">{row.id}</td>
                    <td className="px-3 py-4 border-r border-gray-200 font-medium">{row.order_id}</td>
                    <td className="px-3 py-4 border-r border-gray-200 text-center">
                      <span className="bg-[#00bcd4] text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                        {row.type}
                      </span>
                    </td>
                    <td className="px-3 py-4 border-r border-gray-200 text-center">
                      <button className="bg-[#00bcd4] hover:bg-[#00acc1] text-white px-3 py-1 rounded shadow-sm text-[11px] transition">
                        View
                      </button>
                    </td>
                    <td className="px-3 py-4 border-r border-gray-200 leading-tight">
                      {row.customer_name}
                    </td>
                    <td className="px-3 py-4 border-r border-gray-200 font-medium text-blue-600 underline cursor-pointer">
                      {row.mobile}
                    </td>
                    <td className="px-3 py-4 border-r border-gray-200 leading-tight max-w-[120px]">
                      {row.category}
                    </td>
                    <td className="px-3 py-4 border-r border-gray-200 leading-tight max-w-[150px]">
                      {row.services}
                    </td>
                    <td className="px-3 py-4 border-r border-gray-200 leading-tight whitespace-nowrap text-[11px]">
                      {new Date(row.booking_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}
                    </td>
                    <td className="px-3 py-4 border-r border-gray-200 leading-tight whitespace-nowrap text-[11px]">
                      {row.time_slot}
                    </td>
                    <td className="px-3 py-4 border-r border-gray-200">
                      ₹ {row.total}
                    </td>
                    <td className="px-3 py-4 border-r border-gray-200 text-center">
                      <button className="bg-[#1b6b50] hover:bg-[#15533e] text-white px-3 py-1.5 rounded shadow-sm text-[11px] transition flex items-center space-x-1 mx-auto">
                        <span>Share</span>
                      </button>
                    </td>
                    <td className="px-3 py-4 border-r border-gray-200 text-[11px]">
                      {row.payment_method === 'cashfree' ? 'cod' : row.payment_method}
                    </td>
                    <td className="px-3 py-4 border-r border-gray-200 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white whitespace-nowrap ${
                        row.payment_status === 'Completed' ? 'bg-[#1b6b50]' : 'bg-[#ffc107] text-gray-900'
                      }`}>
                        {row.payment_status}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-center">
                       <select 
                          name="working_status"
                          defaultValue={row.working_status}
                          className="border border-gray-300 rounded px-2 py-1 text-[11px] outline-none focus:border-blue-500 bg-white min-w-[80px]"
                        >
                          <option value="Complete">Complete</option>
                          <option value="Reject">Reject</option>
                          <option value="Pendi">Pendi</option>
                        </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={15} className="px-4 py-8 text-center text-gray-500 text-sm bg-gray-50/50">
                    No data available in table
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between text-sm text-gray-600 mt-2">
          <div>Showing {bookings.length > 0 ? 1 : 0} to {bookings.length} of {bookings.length} entries</div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50 text-[13px] bg-gray-100">Previous</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50 text-[13px] bg-gray-100">Next</button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
