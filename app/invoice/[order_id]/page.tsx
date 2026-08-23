import pool from "../../../lib/db";
import { notFound } from "next/navigation";
import InvoiceClient from "./InvoiceClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoice | OMAA",
};

export default async function InvoicePage(props: { params: Promise<{ order_id: string }> }) {
  const params = await props.params;
  const { order_id } = params;
  
  // Fetch Booking
  const [rows]: any = await pool.query(
    "SELECT * FROM bookings WHERE order_id = ?",
    [order_id]
  );

  if (!rows || rows.length === 0) {
    notFound();
  }

  const booking = rows[0];

  // Fetch GST settings
  let gstSettings = null;
  try {
    const [gstRows]: any = await pool.query("SELECT * FROM gst_settings WHERE id = 1");
    if (gstRows.length > 0) {
      gstSettings = gstRows[0];
    }
  } catch (e) {
    console.error("No GST settings table found or error fetching");
  }

  let parsedServices = [];
  try {
    parsedServices = typeof booking.services === 'string' ? JSON.parse(booking.services) : booking.services;
  } catch (e) {}

  // Convert dates to string so they can be passed to client component
  const safeBooking = {
    ...booking,
    created_at: booking.created_at ? new Date(booking.created_at).toISOString() : null
  };

  return <InvoiceClient booking={safeBooking} services={parsedServices} gstSettings={gstSettings} />;
}
