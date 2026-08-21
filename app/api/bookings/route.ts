import { NextResponse } from "next/server";
import pool from "../../../lib/db";

function generateOrderId(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `OMAA-${timestamp}-${random}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, mobile, email, address, payment_method, total_amount, cart_items, booking_date, time_slot } = body;

    if (!name || !mobile || !address) {
      return NextResponse.json({ error: "Name, mobile and address are required" }, { status: 400 });
    }
    if (String(mobile).length !== 10) {
      return NextResponse.json({ error: "Mobile must be 10 digits" }, { status: 400 });
    }
    if (!booking_date) {
      return NextResponse.json({ error: "Please select a booking date" }, { status: 400 });
    }
    if (!time_slot) {
      return NextResponse.json({ error: "Please select a time slot" }, { status: 400 });
    }

    const orderId = generateOrderId();

    const servicesJson = JSON.stringify(cart_items.map((item: any) => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      price: item.selling_price,
    })));

    const categoryName = cart_items[0]?.category_title || 'Service';

    await pool.query(
      `INSERT INTO bookings (order_id, type, customer_name, mobile, address, category, services, booking_date, time_slot, total, payment_method, payment_status, working_status, created_at)
       VALUES (?, 'Normal Service', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Pendi', NOW())`,
      [orderId, name, mobile, address, categoryName, servicesJson, booking_date, time_slot, total_amount, payment_method === 'online' ? 'cashfree' : 'Cash on Book']
    );

    return NextResponse.json({ success: true, order_id: orderId });
  } catch (error: any) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Failed to create booking: " + error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const [rows] = await pool.query(`SELECT * FROM bookings ORDER BY created_at DESC`);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

