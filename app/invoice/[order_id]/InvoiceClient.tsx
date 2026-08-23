"use client";

import React from "react";
import { Printer } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface InvoiceClientProps {
  booking: any;
  services: any[];
  gstSettings: any;
}

export default function InvoiceClient({ booking, services, gstSettings }: InvoiceClientProps) {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(booking.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const isGstEligibleService = booking.type === 'AMC' || booking.type === 'New Product';
  const applyGstRate = isGstEligibleService && gstSettings && gstSettings.online_gst_enabled;
  const showGstNumber = gstSettings && gstSettings.show_gst_on_invoice && gstSettings.gst_number && gstSettings.gst_number !== '0' && gstSettings.gst_number !== 'null';
  
  // Calculate totals
  const subtotal = services.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = Number(booking.total);

  const gstRate = Number(gstSettings?.gst_rate || 0);
  let baseAmount = total;
  let gstAmount = 0;

  if (applyGstRate && gstRate > 0) {
    baseAmount = total / (1 + (gstRate / 100));
    gstAmount = total - baseAmount;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans print:bg-white print:p-0 print:m-0">
      <div className="max-w-4xl mx-auto relative">
        
        {/* Action Bar - Hidden when printing */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 sm:mb-8 print:hidden bg-white px-4 sm:px-6 py-4 rounded-2xl shadow-sm border border-gray-200">
          <Link href="/my-bookings" className="text-gray-500 hover:text-gray-900 font-bold text-sm transition-colors flex items-center gap-2">
            &larr; Back to My Bookings
          </Link>
          <button 
            onClick={handlePrint}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-[#6069c9] hover:bg-[#525ab5] text-white px-6 py-3 sm:py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Printer className="w-4 h-4" />
            Print / Download PDF
          </button>
        </div>

        {/* Invoice Paper */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none mx-auto border border-gray-200 relative">
          
          {/* Top colored bar */}
          <div className="h-3 w-full bg-gradient-to-r from-[#6069c9] to-indigo-400 print:bg-[#6069c9]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></div>

          {/* Header */}
          <div className="p-5 sm:p-12 flex flex-col md:flex-row justify-between items-start gap-4 sm:gap-6 border-b border-gray-100">
            <div>
              <Image 
                src="/logoomaa.webp" 
                alt="OMAA Logo" 
                width={140} 
                height={50} 
                className="h-10 sm:h-14 w-auto object-contain mb-3 sm:mb-5"
                priority
              />
              <div className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                <p className="font-black text-gray-900 text-base sm:text-lg mb-1 tracking-tight">OMAA Services</p>
                <p className="font-medium">Support: support@omaa.com</p>
                {showGstNumber && (
                  <p className="font-bold text-gray-700 mt-1 sm:mt-2 bg-gray-50 inline-block px-2 py-1 rounded border border-gray-200 text-[10px] sm:text-xs">GSTIN: {gstSettings.gst_number}</p>
                )}
              </div>
            </div>
            
            <div className="text-left md:text-right mt-2 md:mt-0">
              <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tighter uppercase mb-1 sm:mb-2">Invoice</h1>
              <p className="text-gray-400 font-bold text-lg sm:text-xl tracking-wide">#{booking.order_id}</p>
              <p className="text-gray-500 text-xs sm:text-sm font-semibold mt-1 sm:mt-2">{formattedDate}</p>
            </div>
          </div>

          {/* Customer Details */}
          <div className="p-5 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 bg-[#f8f9fa] print:bg-[#f8f9fa]" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            <div>
              <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-indigo-400 mb-2 sm:mb-4">Billed To</h3>
              <p className="text-gray-900 font-black text-xl sm:text-2xl mb-1 sm:mb-2 tracking-tight">{booking.customer_name}</p>
              <p className="text-gray-600 text-xs sm:text-sm max-w-[250px] leading-relaxed mb-2 sm:mb-3 font-medium">{booking.address}</p>
              <p className="text-gray-700 text-xs sm:text-sm font-bold bg-white inline-block px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-200 shadow-sm">+91 {booking.mobile}</p>
            </div>
            <div className="md:text-right">
              <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-indigo-400 mb-2 sm:mb-4">Service Details</h3>
              <div className="space-y-2 sm:space-y-3">
                <p className="text-gray-800 text-xs sm:text-sm"><span className="text-gray-400 w-16 sm:w-20 inline-block md:w-auto font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">Category:</span> <span className="font-bold bg-white px-2 sm:px-2.5 py-1 rounded-md border border-gray-200 shadow-sm ml-1">{booking.category}</span></p>
                {booking.booking_date && (
                  <p className="text-gray-800 text-xs sm:text-sm">
                    <span className="text-gray-400 w-16 sm:w-20 inline-block md:w-auto font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">Schedule:</span> 
                    <span className="font-bold ml-1 block sm:inline mt-1 sm:mt-0">
                      {booking.booking_date.includes('T') ? new Date(booking.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : booking.booking_date} • {booking.time_slot}
                    </span>
                  </p>
                )}
                <p className="text-gray-800 text-xs sm:text-sm"><span className="text-gray-400 w-16 sm:w-20 inline-block md:w-auto font-bold uppercase text-[9px] sm:text-[10px] tracking-wider">Payment:</span> <span className="font-bold uppercase tracking-wide text-[10px] sm:text-[11px] text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-1 rounded-md border border-emerald-100 shadow-sm ml-1">{booking.payment_method}</span></p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-5 sm:p-12 border-t border-gray-100">
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full text-left border-collapse min-w-[350px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 sm:py-4 px-4 sm:px-6 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-gray-500 w-[55%]">Service Description</th>
                    <th className="py-3 sm:py-4 px-3 sm:px-6 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-gray-500 text-center w-[20%]">Qty</th>
                    <th className="py-3 sm:py-4 px-4 sm:px-6 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-gray-500 text-right w-[25%]">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-xs sm:text-sm divide-y divide-gray-100">
                  {services.map((item: any, idx: number) => (
                    <tr key={idx} className="bg-white hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 sm:py-5 px-4 sm:px-6 text-gray-900 font-bold">{item.title}</td>
                      <td className="py-3 sm:py-5 px-3 sm:px-6 text-gray-500 text-center font-bold bg-gray-50/30">{item.quantity}</td>
                      <td className="py-3 sm:py-5 px-4 sm:px-6 text-gray-900 font-black text-right">₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-6 sm:mt-8 flex flex-col items-end">
              <div className="w-full sm:max-w-[340px] space-y-3 sm:space-y-4 bg-gray-50 p-5 sm:p-8 rounded-2xl border border-gray-100">
                <div className="flex justify-between text-sm text-gray-500 font-bold">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-black">₹{subtotal}</span>
                </div>
                {total < subtotal && (
                  <div className="flex justify-between text-sm text-emerald-600 font-bold">
                    <span>Discount</span>
                    <span>-₹{subtotal - total}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-end pt-4 sm:pt-5 border-t border-gray-200/80">
                  <span className="text-xs sm:text-sm font-black text-gray-400 uppercase tracking-widest">Total Paid</span>
                  <span className="text-3xl sm:text-4xl font-black text-[#6069c9] tracking-tight">₹{total}</span>
                </div>
                {applyGstRate && gstRate > 0 && (
                  <div className="flex justify-between text-[10px] sm:text-[11px] text-gray-400 font-bold mt-2 pt-3 border-t border-gray-200/50">
                    <span className="uppercase tracking-wider">Includes GST @ {gstRate}%</span>
                    <span>₹{gstAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#1a1a2e] p-6 sm:p-10 text-center print:bg-[#1a1a2e] print:!text-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            <p className="text-white font-black text-lg sm:text-xl mb-1 sm:mb-2 tracking-tight">Thank you for choosing OMAA Services!</p>
            <p className="text-gray-400 text-[10px] sm:text-xs font-semibold">This is a computer-generated invoice and does not require a physical signature.</p>
          </div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; size: auto; }
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            background-color: white !important; 
          }
          /* Ensure backgrounds are forced in printing for elements that need it */
          .print\\:bg-\\[\\#1a1a2e\\] { background-color: #1a1a2e !important; }
          .print\\:bg-\\[\\#f8f9fa\\] { background-color: #f8f9fa !important; }
          .print\\:bg-\\[\\#6069c9\\] { background-color: #6069c9 !important; }
          .print\\:\\!text-white { color: white !important; }
        }
      `}} />
    </div>
  );
}
