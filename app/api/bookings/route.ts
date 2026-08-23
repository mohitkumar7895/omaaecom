import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

function generateOrderId(): string {
  // Generate a random 4-digit number (1000 - 9999)
  const random = Math.floor(Math.random() * 9000 + 1000);
  return random.toString();
}

function generateCouponCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, mobile, email, address, payment_method, total_amount, cart_items, booking_date, time_slot, referred_by } = body;

    let user_email = null;
    const cookieStore = await cookies();
    const token = cookieStore.get("omaa_auth_token")?.value;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        user_email = decoded.email;
      } catch (e) {}
    }

    if (!name || !mobile || !address) {
      return NextResponse.json({ error: "Name, mobile and address are required" }, { status: 400 });
    }
    if (String(mobile).length !== 10) {
      return NextResponse.json({ error: "Mobile must be 10 digits" }, { status: 400 });
    }

    // Check if the order requires a schedule
    const requiresSchedule = cart_items.some((item: any) => {
      const title = (item.title || "").toLowerCase();
      const catId = Number(item.category_id);
      const category = (item.category || item.type || "").toLowerCase();
      
      // Category 6 is New Products, Category 7 is RO AMC
      if (catId === 6 || catId === 7) return false;
      
      if (
        title.includes("new product") || 
        title.includes("amc") || 
        title.includes("plan") ||
        category.includes("new product") || 
        category.includes("amc") ||
        category.includes("product")
      ) {
        return false;
      }
      
      return true;
    });

    if (requiresSchedule) {
      if (!booking_date) {
        return NextResponse.json({ error: "Please select a booking date" }, { status: 400 });
      }
      if (!time_slot) {
        return NextResponse.json({ error: "Please select a time slot" }, { status: 400 });
      }
    }

    const orderId = generateOrderId();

    const servicesJson = JSON.stringify(cart_items.map((item: any) => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      price: item.selling_price,
    })));

    const categoryName = cart_items[0]?.category_title || 'Service';

    // Determine type (AMC vs New Product vs Normal Service)
    let bookingType = 'Normal Service';
    const isAMC = cart_items.some((item: any) => {
      const catId = Number(item.category_id);
      const categoryStr = (item.category || item.type || "").toLowerCase();
      const titleStr = (item.title || "").toLowerCase();
      return catId === 7 || categoryStr.includes("amc") || titleStr.includes("amc");
    });
    
    const isNewProduct = cart_items.some((item: any) => {
      const catId = Number(item.category_id);
      const categoryStr = (item.category || item.type || "").toLowerCase();
      const titleStr = (item.title || "").toLowerCase();
      return catId === 6 || categoryStr.includes("new product") || titleStr.includes("new product");
    });
    
    if (isAMC) {
      bookingType = 'AMC';
    } else if (isNewProduct) {
      bookingType = 'New Product';
    }

    let couponCode = null;
    
    // Auto-generate coupon immediately for online AMC & New Product bookings
    if ((isAMC || isNewProduct) && payment_method === 'online') {
      couponCode = generateCouponCode();
      await pool.query(
        "INSERT INTO coupons (code, discount_type, discount_value, mobile) VALUES (?, 'percentage', 10.00, ?)",
        [couponCode, mobile]
      );
    }

    try {
      await pool.query("ALTER TABLE bookings ADD COLUMN coupon_code VARCHAR(50) DEFAULT NULL");
    } catch (e) {}
    try {
      await pool.query("ALTER TABLE bookings ADD COLUMN referred_by VARCHAR(50) DEFAULT NULL");
    } catch (e) {}

    await pool.query(
      `INSERT INTO bookings (order_id, type, customer_name, mobile, address, category, services, booking_date, time_slot, total, payment_method, payment_status, working_status, created_at, user_email, coupon_code, referred_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Pendi', NOW(), ?, ?, ?)`,
      [orderId, bookingType, name, mobile, address, categoryName, servicesJson, booking_date || '', time_slot || '', total_amount, payment_method === 'online' ? 'cashfree' : 'Cash on Book', user_email, couponCode, referred_by || null]
    );

    return NextResponse.json({ success: true, order_id: orderId });
  } catch (error: any) {
    console.error("====== DATABASE / BOOKING ERROR ======");
    console.error("Error Message:", error.message);
    console.error("Error Code:", error.code);
    console.error("Full Error:", error);
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
