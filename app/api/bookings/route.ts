import { NextResponse } from "next/server";
import pool from "../../../lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, mobile, email, address, payment_method, total_amount, cart_items } = body;

    // Validate required fields
    if (!name || !mobile || !address) {
      return NextResponse.json({ error: "Name, mobile and address are required" }, { status: 400 });
    }

    if (String(mobile).length !== 10) {
      return NextResponse.json({ error: "Mobile must be 10 digits" }, { status: 400 });
    }

    // Build services string from cart items
    const servicesJson = JSON.stringify(cart_items.map((item: any) => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      price: item.selling_price,
    })));

    const categoryName = cart_items[0]?.category_title || 'Service';

    // Insert booking
    const [result]: any = await pool.query(
      `INSERT INTO bookings (customer_name, mobile, category, services, total, payment_method, payment_status, working_status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', 'pending', NOW())`,
      [name, mobile, categoryName, servicesJson, total_amount, payment_method]
    );

    return NextResponse.json({ success: true, booking_id: result.insertId });
  } catch (error: any) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Failed to create booking: " + error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM bookings ORDER BY created_at DESC`
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

