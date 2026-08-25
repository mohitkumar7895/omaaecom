import pool from "../../../../lib/db";
import { CalendarCheck, MessageCircle } from "lucide-react";
import ExportButtons from "../../components/ExportButtons";
import WorkingStatusSelect from "../components/WorkingStatusSelect";
import PaymentStatusSelect from "../components/PaymentStatusSelect";
import { updateWorkingStatus, updatePaymentStatus } from "../actions";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "New Bookings (Pending) - OMAA Admin",
};

export default async function NewBookingPage() {
  let bookings: any[] = [];

  try {
    const query = `
      SELECT * FROM bookings 
      WHERE working_status = 'Pendi'
      ORDER BY created_at DESC
    `;
    const [rows]: any = await pool.query(query);
    bookings = rows.map((row: any) => {
      let parsedServices = row.services;
      try {
        if (typeof row.services === 'string') {
          parsedServices = JSON.parse(row.services);
        }
      } catch {}
      return { ...row, services: parsedServices };
    });
  } catch (e) {
    console.error("Failed to fetch New Bookings:", e);
  }

  return (
    <div className="font-sans text-[13px] pb-12">
      
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-indigo-500" />
            New Bookings (Pending Action)
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">All newly arrived customer service appointments awaiting completion.</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        
        {/* Top Action Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <ExportButtons tableId="newBookingTable" filename="omaa-new-bookings" />
          <div className="text-xs font-semibold text-gray-500">
            Pending Orders: <span className="font-bold text-amber-600">{bookings.length}</span>
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto">
          <table id="newBookingTable" className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-900 text-white text-[12px] font-semibold uppercase tracking-wider">
                <th className="px-4 py-3.5">Sr. No</th>
                <th className="px-4 py-3.5">Order ID</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Category & Services</th>
                <th className="px-4 py-3.5">Date & Slot</th>
                <th className="px-4 py-3.5">Total Amount</th>
                <th className="px-4 py-3.5">Payment</th>
                <th className="px-4 py-3.5">Working Status</th>
                <th className="px-4 py-3.5 text-center">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {bookings.length > 0 ? (
                bookings.map((row, index) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors text-[13px]">
                    <td className="px-4 py-4 font-medium text-gray-400">{index + 1}</td>
                    
                    <td className="px-4 py-4">
                      <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-xs">
                        #{row.order_id}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100 whitespace-nowrap">
                        {row.type || "Service"}
                      </span>
                    </td>

                    <td className="px-4 py-4 min-w-[200px]">
                      <div className="font-bold text-gray-900 mb-0.5">{row.customer_name}</div>
                      <a href={`tel:${row.mobile}`} className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold mb-1 block">
                        {row.mobile}
                      </a>
                      <div className="text-[12px] text-gray-700 bg-gray-50/80 p-2 rounded-lg border border-gray-100/80 leading-relaxed break-words">
                        📍 {row.address || 'Address not provided'}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="inline-block bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 border border-indigo-100">
                        {row.category || "Service"}
                      </div>
                      <div className="text-gray-700 text-xs font-medium">
                        {Array.isArray(row.services) ? (
                          row.services.map((s: any, i: number) => (
                            <span key={i} className="inline-block mr-2">
                              • {s.title} {s.quantity > 1 ? `(x${s.quantity})` : ''}
                            </span>
                          ))
                        ) : (
                          <span>{row.services}</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-900 text-xs">
                        {row.booking_date ? new Date(row.booking_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Instant'}
                      </div>
                      <div className="text-gray-400 text-[11px] mt-0.5">{row.time_slot || 'Standard'}</div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-bold text-gray-900 text-sm">₹{Number(row.total).toLocaleString()}</div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-gray-500 uppercase block">
                          {row.payment_method === 'cashfree' ? 'Online' : 'Cash'}
                        </span>
                        <PaymentStatusSelect
                          id={row.id}
                          defaultValue={row.payment_status || "Pending"}
                          action={updatePaymentStatus}
                        />
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <WorkingStatusSelect
                        id={row.id}
                        defaultValue={row.working_status || "Pendi"}
                        action={updateWorkingStatus}
                      />
                    </td>

                    <td className="px-4 py-4 text-center">
                      <a 
                        href={`https://wa.me/91${row.mobile}?text=Hello%20${encodeURIComponent(row.customer_name)},%20your%20Service%20Booking%20%23${row.order_id}%20has%20been%20confirmed%20with%20OMAA%20Company.`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition shadow-xs"
                        title="Share on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-400">
                    <p className="text-sm font-medium">No pending new bookings found</p>
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
