"use client";

import React from "react";
import { Printer, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface InvoiceClientProps {
  booking: any;
  services: any[];
  gstSettings: any;
}

export default function InvoiceClient({ booking, services, gstSettings }: InvoiceClientProps) {
  const handlePrint = () => window.print();

  const bookingDate = booking.booking_date
    ? new Date(booking.booking_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date(booking.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const bookingTime = booking.time_slot || new Date(booking.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const isGstEligibleService = booking.type === 'AMC' || booking.type === 'New Product';
  const applyGstRate = isGstEligibleService && gstSettings && gstSettings.online_gst_enabled;
  const showGstNumber = isGstEligibleService && gstSettings && gstSettings.show_gst_on_invoice && gstSettings.gst_number && gstSettings.gst_number !== '0' && gstSettings.gst_number !== 'null';

  const subtotal = services.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const total = Number(booking.total);
  const gstRate = Number(gstSettings?.gst_rate || 0);

  let baseAmount = total;
  let gstAmount = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  if (applyGstRate && gstRate > 0) {
    baseAmount = total / (1 + gstRate / 100);
    gstAmount = total - baseAmount;
    cgstAmount = gstAmount / 2;
    sgstAmount = gstAmount / 2;
  }

  const detectedConvenienceFee = !isGstEligibleService ? Math.max(0, total - subtotal) : 0;
  const categoryLabel = booking.category || booking.type || 'Service';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans print:bg-white print:p-0 print:m-0">
      <div className="max-w-3xl mx-auto">

        {/* Invoice Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden print:shadow-none print:rounded-none print:border-0">

          {/* ── TOP ACTION BAR (hidden on print) ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 print:hidden">
            <div className="flex items-center gap-3">
              {/* OC logo box */}
              <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-black text-sm tracking-tight">OC</span>
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm leading-tight"><span className="text-indigo-600">OMAA</span> Company</p>
                <p className="text-[11px] text-gray-400 font-medium">Invoice</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
              <Link
                href="/my-bookings"
                className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition-all"
              >
                Close
              </Link>
            </div>
          </div>

          {/* ── INVOICE BODY ── */}
          <div className="p-6 sm:p-10">

            {/* Header row: logo + INVOICE title */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
              <div>
                <Image
                  src="/logoomaa.webp"
                  alt="OMAA Logo"
                  width={120}
                  height={40}
                  className="h-10 w-auto object-contain mb-2"
                  priority
                />
                <p className="text-xs text-gray-500 font-medium">support@omaacompany.com</p>
                {showGstNumber && (
                  <p className="text-[11px] font-bold text-gray-600 mt-1 border border-gray-200 inline-block px-2 py-0.5 rounded bg-gray-50">
                    GSTIN: {gstSettings.gst_number}
                  </p>
                )}
              </div>
              <div className="sm:text-right">
                <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight uppercase mb-1">Invoice</h1>
                <p className="text-gray-400 font-bold text-base">#{booking.order_id}</p>
              </div>
            </div>

            {/* Info Grid: customer left, booking details right */}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
              <div className="space-y-1.5 text-sm">
                <p><span className="font-bold text-gray-900">Order ID:</span> <span className="text-gray-600">{booking.order_id}</span></p>
                <p><span className="font-bold text-gray-900">Name:</span> <span className="text-gray-600">{booking.customer_name}</span></p>
                <p><span className="font-bold text-gray-900">Mobile:</span> <span className="text-gray-600">{booking.mobile}</span></p>
                <p><span className="font-bold text-gray-900">Category:</span> <span className="text-gray-600">{categoryLabel}</span></p>
                <p><span className="font-bold text-gray-900">Payment:</span>{' '}
                  <span className="inline-block text-[11px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    {booking.payment_method}
                  </span>
                </p>
              </div>
              <div className="space-y-1.5 text-sm sm:text-right">
                <p><span className="font-bold text-gray-900">Booking Date:</span> <span className="text-gray-600">{bookingDate}</span></p>
                <p><span className="font-bold text-gray-900">Booking Time:</span> <span className="text-gray-600">{bookingTime}</span></p>
              </div>
            </div>

            {/* Services Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left border border-gray-200 rounded-xl overflow-hidden text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 font-bold text-gray-800 w-[50%]">Service</th>
                    <th className="px-4 py-3 font-bold text-gray-800 text-center w-[15%]">Qty</th>
                    <th className="px-4 py-3 font-bold text-gray-800 text-right w-[17%]">Price</th>
                    <th className="px-4 py-3 font-bold text-gray-800 text-right w-[18%]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {services.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3.5 text-gray-800 font-medium">{item.title}</td>
                      <td className="px-4 py-3.5 text-gray-600 text-center">{item.quantity}</td>
                      <td className="px-4 py-3.5 text-gray-700 text-right">₹{Number(item.price).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3.5 text-gray-900 font-bold text-right">₹{(Number(item.price) * Number(item.quantity)).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full sm:w-72 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-800">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {total < subtotal && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-bold">-₹{(subtotal - total).toLocaleString('en-IN')}</span>
                  </div>
                )}

                {detectedConvenienceFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Convenience Fee</span>
                    <span className="font-bold">₹{detectedConvenienceFee}</span>
                  </div>
                )}

                {applyGstRate && gstRate > 0 && (
                  <>
                    <div className="flex justify-between text-gray-500 text-xs pt-1">
                      <span>Taxable Amount</span>
                      <span>₹{baseAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-blue-600 text-xs">
                      <span>CGST @ {gstRate / 2}%</span>
                      <span>₹{cgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-blue-600 text-xs">
                      <span>SGST @ {gstRate / 2}%</span>
                      <span>₹{sgstAmount.toFixed(2)}</span>
                    </div>
                  </>
                )}

                <div className="border-t border-gray-200 pt-3 mt-2 flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-base">Total</span>
                  <span className="font-black text-gray-900 text-2xl">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Address footer */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <span className="font-semibold">Address:</span> {booking.address}
              </p>
              <p className="text-[11px] text-gray-400 mt-3">
                This is a computer-generated invoice and does not require a physical signature. Thank you for choosing OMAA Company.
              </p>
            </div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 15mm; size: A4; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: white !important; }
        }
      `}} />
    </div>
  );
}
