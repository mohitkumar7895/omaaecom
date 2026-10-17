import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { sendBookingEmail } from "../../../lib/mail";

import { getAuthToken } from "../../../lib/auth";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

function generateOrderId(): string {
  // Generate a random 4-digit number (1000 - 9999)
  const random = Math.floor(Math.random() * 9000 + 1000);
  return random.toString();
}

function generateCouponCode(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `OC${randomNum}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      name, 
      mobile, 
      email, 
      address, 
      payment_method, 
      total_amount, 
      cart_items, 
      booking_date, 
      time_slot, 
      referred_by,
      points_redeemed,
      referral_money_used
    } = body;

    let user_email = null;
    const token = await getAuthToken(req);
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        user_email = decoded.email;
      } catch (e) {}
    }

    if (!user_email && email) {
      user_email = email;
    }

    // Require customer authentication to confirm booking
    if (!user_email && !token) {
      return NextResponse.json({ error: "Please log in with your email/account to confirm your booking." }, { status: 401 });
    }

    // Resolve referred_by if not provided in payload
    let effectiveReferredBy = referred_by || null;
    if (!effectiveReferredBy) {
      try {
        const cookieHeader = req.headers.get("cookie") || "";
        const match = cookieHeader.match(/omaa_referral_code=([^;]+)/);
        if (match) effectiveReferredBy = decodeURIComponent(match[1]).trim().toUpperCase();
      } catch(e) {}
    }
    if (!effectiveReferredBy && user_email) {
      try {
        const [u]: any = await pool.query("SELECT referred_by FROM users WHERE email = ? LIMIT 1", [user_email]);
        if (u.length > 0 && u[0].referred_by) effectiveReferredBy = u[0].referred_by;
      } catch(e) {}
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
      quantity: item.quantity || 1,
      price: Number(item.selling_price ?? item.price ?? item.final_price ?? 0),
      selling_price: Number(item.selling_price ?? item.price ?? item.final_price ?? 0),
      category_id: item.category_id,
    })));

    let categoryName = cart_items[0]?.category_title || cart_items[0]?.category || '';
    if (!categoryName || categoryName.toLowerCase() === 'service') {
      try {
        const firstItem = cart_items[0];
        const catId = firstItem?.category_id;
        const svcId = firstItem?.id;
        if (catId) {
          const [catRows]: any = await pool.query(`SELECT title FROM categories WHERE id = ?`, [catId]);
          if (catRows.length > 0) categoryName = catRows[0].title;
        } else if (svcId) {
          const [catRows]: any = await pool.query(
            `SELECT c.title FROM services s JOIN categories c ON s.category_id = c.id WHERE s.id = ?`,
            [svcId]
          );
          if (catRows.length > 0) categoryName = catRows[0].title;
        }
      } catch (e) {}
    }
    if (!categoryName) categoryName = 'Service';

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

    let couponCode: string | null = null;

    // Ensure essential columns exist dynamically on production without crashing
    try {
      await pool.query("ALTER TABLE bookings ADD COLUMN user_email VARCHAR(255) DEFAULT NULL");
    } catch (e) {}
    try {
      await pool.query("ALTER TABLE bookings ADD COLUMN amc_coupon_code VARCHAR(50) DEFAULT NULL");
    } catch (e) {}
    try {
      await pool.query("ALTER TABLE bookings ADD COLUMN referred_by VARCHAR(50) DEFAULT NULL");
    } catch (e) {}

    // Auto-generate coupon immediately for online AMC & New Product bookings
    if ((isAMC || isNewProduct) && payment_method === 'online') {
      try {
        couponCode = generateCouponCode();
        await pool.query(
          "INSERT INTO coupons (code, discount_type, discount_value, mobile) VALUES (?, 'percentage', 10.00, ?)",
          [couponCode, mobile]
        );
      } catch (couponErr) {
        console.warn("Notice: coupon insert skipped:", couponErr);
      }
    }

    const finalBookingDate = requiresSchedule ? booking_date : (booking_date || new Date().toISOString().slice(0, 10));
    const finalTimeSlot = requiresSchedule ? time_slot : (time_slot || 'Instant');

    const ptsRedeemedNum = Math.max(0, Number(points_redeemed) || 0);
    const refMoneyUsedNum = Math.max(0, Number(referral_money_used) || 0);

    try {
      await pool.query(
        `INSERT INTO bookings (order_id, type, customer_name, mobile, address, category, services, booking_date, time_slot, total, payment_method, payment_status, working_status, created_at, user_email, amc_coupon_code, referred_by, points_redeemed, referral_money_used)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Pendi', NOW(), ?, ?, ?, ?, ?)`,
        [orderId, bookingType, name, mobile, address, categoryName, servicesJson, finalBookingDate, finalTimeSlot, total_amount, payment_method === 'online' ? 'cashfree' : 'Cash on Book', user_email, couponCode, effectiveReferredBy || null, ptsRedeemedNum, refMoneyUsedNum]
      );
    } catch (insertErr: any) {
      console.warn("Standard insert failed, trying compatible fallback insert:", insertErr?.message);
      // Fallback in case production DB has different columns
      await pool.query(
        `INSERT INTO bookings (order_id, type, customer_name, mobile, address, category, services, booking_date, time_slot, total, payment_method, payment_status, working_status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Pendi', NOW())`,
        [orderId, bookingType, name, mobile, address, categoryName, servicesJson, finalBookingDate, finalTimeSlot, total_amount, payment_method === 'online' ? 'cashfree' : 'Cash on Book']
      );
    }

    // Debit redeemed points from reward_points_transactions if used
    if (ptsRedeemedNum > 0 && user_email) {
      try {
        await pool.query(
          `INSERT INTO reward_points_transactions (user_email, points, type, category, order_id, description)
           VALUES (?, ?, 'Debit', 'redemption', ?, ?)`,
          [user_email, ptsRedeemedNum, orderId, `Points Redeemed on Booking #${orderId}`]
        );
      } catch (ptsErr) {
        console.error("Failed to debit redeemed points:", ptsErr);
      }
    }

    // Debit used referral money from referral_money_transactions if used
    if (refMoneyUsedNum > 0 && user_email) {
      try {
        await pool.query(
          `INSERT INTO referral_money_transactions (user_email, amount, type, category, level, order_id, description)
           VALUES (?, ?, 'Debit', 'purchase_deduction', 0, ?, ?)`,
          [user_email, refMoneyUsedNum, orderId, `Referral Balance used on Booking #${orderId}`]
        );
      } catch (rmErr) {
        console.error("Failed to debit referral money:", rmErr);
      }
    }

    // Trigger email notification immediately to Admin and Customer
    try {
      await sendBookingEmail({
        orderId,
        name,
        mobile,
        address,
        category: categoryName,
        services: cart_items || [],
        total: total_amount,
        paymentMethod: payment_method,
        bookingDate: finalBookingDate,
        timeSlot: finalTimeSlot,
        userEmail: user_email || email || undefined
      });
    } catch (mailSyncErr) {
      console.warn("Could not dispatch booking email:", mailSyncErr);
    }

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
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
