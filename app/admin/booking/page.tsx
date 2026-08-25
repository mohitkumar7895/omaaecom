import pool from "../../../lib/db";
import { Copy, FileSpreadsheet, FileIcon as FilePdf, Printer, MessageCircle, CalendarCheck, Search, Filter } from "lucide-react";
import Link from "next/link";
import ExportButtons from "../components/ExportButtons";
import WorkingStatusSelect from "./components/WorkingStatusSelect";
import PaymentStatusSelect from "./components/PaymentStatusSelect";
import { updateWorkingStatus, updateTotal, updateCashback, updatePaymentStatus } from "./actions";

export const dynamic = 'force-dynamic';

export default async function ManageBookingPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const filter = resolvedSearchParams.filter || "All";
  
  let bookings: any[] = [];

  try {
    let query = `SELECT * FROM bookings WHERE working_status = 'Pendi' ORDER BY created_at DESC`;
    if (filter === "Completed") {
      query = `SELECT * FROM bookings WHERE working_status = 'Complete' ORDER BY created_at DESC`;
    } else if (filter !== "All") {
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

  const tabs = [
    { name: "All", id: "All" },
    { name: "Normal Service", id: "Normal Service" },
    { name: "New Product", id: "New Product" },
    { name: "AMC", id: "AMC" },
    { name: "Completed", id: "Completed" },
  ];

  return (
    <div className="font-sans text-[13px] pb-12">
      
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-indigo-500" />
            Booking Management
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">View and manage all customer appointments.</p>
        </div>
      </div>

      {/* Sleek Segmented Control (Tabs) */}
      <div className="bg-white p-1.5 rounded-xl border border-gray-200 inline-flex items-center gap-1 mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-x-auto max-w-full custom-scrollbar">
        {tabs.map(tab => (
          <Link href={`?filter=${tab.id}`} key={tab.id}>
            <button className={`whitespace-nowrap px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 ${
              filter === tab.id 
                ? tab.id === "Completed" 
                  ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100" 
                  : "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
            }`}>
              {tab.name}
            </button>
          </Link>
        ))}
      </div>

      {/* Data Table Wrapper */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <ExportButtons tableId="bookingsTable" filename={`omaa-bookings-${filter}`} />
            <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
            <div className="flex items-center gap-2 text-gray-600 font-medium">
              <span className="text-xs uppercase tracking-wider text-gray-500">Show</span>
              <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white shadow-sm transition-all cursor-pointer">
                <option>50</option>
                <option>100</option>
              </select>
            </div>
          </div>
          
          <div className="relative w-full lg:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 h-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search bookings..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table id="bookingsTable" className="w-full text-left border-collapse min-w-[1600px]">
            <thead>
              <tr className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <th className="px-4 py-4 whitespace-nowrap">Order ID</th>
                <th className="px-4 py-4 whitespace-nowrap">Type</th>
                <th className="px-4 py-4">Customer Info</th>
                <th className="px-4 py-4">Service Details</th>
                <th className="px-4 py-4 whitespace-nowrap">Schedule</th>
                <th className="px-4 py-4 whitespace-nowrap">Pricing</th>
                <th className="px-4 py-4 whitespace-nowrap text-center">Contact</th>
                <th className="px-4 py-4 whitespace-nowrap text-center">Payment</th>
                <th className="px-4 py-4 whitespace-nowrap text-right">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {bookings.length > 0 ? (
                bookings.map((row) => (
                  <tr key={row.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{row.order_id}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">ID: {row.id}</div>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        row.type === 'AMC' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        row.type === 'New Product' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                        'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          row.type === 'AMC' ? 'bg-purple-500' :
                          row.type === 'New Product' ? 'bg-sky-500' :
                          'bg-gray-500'
                        }`}></span>
                        {row.type || 'Online'}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4">
                      <div className="font-bold text-gray-900 mb-0.5">{row.customer_name}</div>
                      <div className="text-indigo-600 font-medium mb-1">{row.mobile}</div>
                      <div className="text-[11px] text-gray-500 max-w-[200px] leading-snug truncate group-hover:whitespace-normal group-hover:text-clip">{row.address || '—'}</div>
                    </td>
                    
                    <td className="px-4 py-4 max-w-[250px]">
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{row.category || '—'}</div>
                      {Array.isArray(row.services) ? (
                        <div className="space-y-1.5">
                          {row.services.map((s: any, i: number) => (
                            <div key={i} className="flex items-start justify-between text-[12px] bg-gray-50/50 p-1.5 rounded-lg border border-gray-100">
                              <span className="font-medium text-gray-800 line-clamp-1 flex-1 pr-2">{s.title}</span>
                              <div className="shrink-0 text-right">
                                {s.quantity > 1 && <span className="text-gray-400 mr-2 text-[10px] font-bold">x{s.quantity}</span>}
                                <span className="text-gray-900 font-bold">₹{s.price}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-[11px] italic">{String(row.services || '—')}</span>
                      )}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 mb-0.5">
                        {row.booking_date 
                          ? new Date(row.booking_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') 
                          : new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
                        }
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        {row.time_slot}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <form action={updateTotal} className="flex items-center space-x-2">
                        <input type="hidden" name="id" value={row.id} />
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                          <input 
                            type="number" 
                            name="total" 
                            defaultValue={row.total}
                            className="w-24 pl-6 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                          />
                        </div>
                        <button type="submit" className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors">
                          Save
                        </button>
                      </form>
                    </td>



                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <a 
                        href={`https://wa.me/91${row.mobile}?text=${encodeURIComponent(
                          row.coupon_code 
                            ? `Hello ${row.customer_name},\n\nYour ${row.type} service is Complete!\nAs a thank you, here is a special coupon code for 10% OFF your next booking: *${row.coupon_code}*.\n\nThank you for choosing OMAA Company.`
                            : `Hello ${row.customer_name},\n\nYour ${row.type || 'Service'} booking is being processed.\n\nThank you for choosing OMAA Company.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:shadow-md hover:shadow-emerald-500/20 transition-all"
                        title="Send WhatsApp Message"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="text-[11px] font-semibold text-gray-500 mb-1">{row.payment_method}</div>
                      <PaymentStatusSelect id={row.id} defaultValue={row.payment_status} action={updatePaymentStatus} />
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="inline-block">
                        <WorkingStatusSelect id={row.id} defaultValue={row.working_status} action={updateWorkingStatus} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={15} className="px-6 py-16 text-center">
                    <div className="inline-flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <CalendarCheck className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">No bookings found</h3>
                      <p className="text-xs text-gray-500">There are no bookings matching the current filter.</p>
                    </div>
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
