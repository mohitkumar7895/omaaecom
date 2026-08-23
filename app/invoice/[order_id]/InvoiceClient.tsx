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

  const showGst = gstSettings && gstSettings.show_gst_on_invoice && gstSettings.gst_number;
  
  // Calculate totals
  const subtotal = services.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  // Optional: We can show GST breakdown if we had the rate, but the user removed rate from the UI.
  // So we just show the total. The total_amount is already the final amount.
  const total = Number(booking.total);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans print:bg-white print:p-0 print:m-0">
      <div className="max-w-3xl mx-auto">
        
        {/* Action Bar - Hidden when printing */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link href="/my-bookings" className="text-[#6069c9] hover:underline font-medium text-sm">
            &larr; Back to My Bookings
          </Link>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#6069c9] hover:bg-[#525ab5] text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print / Download PDF
          </button>
        </div>

        {/* Invoice Paper */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden print:shadow-none print:border-none print:rounded-none">
          
          {/* Header */}
          <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <Image 
                src="/logoomaa.webp" 
                alt="OMAA Logo" 
                width={150} 
                height={50} 
                className="h-10 w-auto object-contain mb-2"
                priority
              />
              <p className="text-sm text-gray-500 font-medium">OMAA Services</p>
              {showGst && (
                <p className="text-xs text-gray-400 font-medium mt-1">GSTIN: {gstSettings.gst_number}</p>
              )}
            </div>
            
            <div className="text-left md:text-right">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Invoice</h1>
              <p className="text-gray-500 font-medium mt-1">#{booking.order_id}</p>
              <p className="text-gray-500 text-sm mt-1">{formattedDate}</p>
            </div>
          </div>

          {/* Customer Details */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/50 print:bg-white border-b border-gray-100">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Billed To</h3>
              <p className="text-gray-900 font-bold text-lg">{booking.customer_name}</p>
              <p className="text-gray-600 text-sm mt-1 max-w-[250px] leading-relaxed">{booking.address}</p>
              <p className="text-gray-600 text-sm mt-1 font-medium">+91 {booking.mobile}</p>
            </div>
            <div className="md:text-right">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Service Details</h3>
              <p className="text-gray-800 text-sm"><span className="text-gray-500">Category:</span> <span className="font-semibold">{booking.category}</span></p>
              {booking.booking_date && (
                <p className="text-gray-800 text-sm mt-1"><span className="text-gray-500">Schedule:</span> <span className="font-semibold">{booking.booking_date} • {booking.time_slot}</span></p>
              )}
              <p className="text-gray-800 text-sm mt-1"><span className="text-gray-500">Payment:</span> <span className="font-semibold capitalize">{booking.payment_method}</span></p>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="py-3 px-2 text-[11px] font-black uppercase tracking-wider text-gray-400 w-[60%]">Service Description</th>
                    <th className="py-3 px-2 text-[11px] font-black uppercase tracking-wider text-gray-400 text-center w-[15%]">Qty</th>
                    <th className="py-3 px-2 text-[11px] font-black uppercase tracking-wider text-gray-400 text-right w-[25%]">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {services.map((item: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-50 last:border-0">
                      <td className="py-4 px-2 text-gray-800 font-medium">{item.title}</td>
                      <td className="py-4 px-2 text-gray-600 text-center">{item.quantity}</td>
                      <td className="py-4 px-2 text-gray-800 font-semibold text-right">₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col items-end">
              <div className="w-full max-w-[280px] space-y-3">
                <div className="flex justify-between text-sm text-gray-600 font-medium">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {/* Assuming total is subtotal, if total is different due to coupons, we could show discount */}
                {total < subtotal && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Discount</span>
                    <span>-₹{subtotal - total}</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-3 border-t border-gray-200">
                  <span className="text-base font-bold text-gray-900">Total Paid</span>
                  <span className="text-2xl font-black text-[#6069c9]">₹{total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50/50 p-6 text-center border-t border-gray-100 print:bg-white print:border-none">
            <p className="text-gray-500 font-medium text-sm">Thank you for choosing OMAA Services!</p>
            <p className="text-gray-400 text-xs mt-1">This is a computer-generated invoice and does not require a signature.</p>
          </div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 0; size: auto; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white; }
        }
      `}} />
    </div>
  );
}
