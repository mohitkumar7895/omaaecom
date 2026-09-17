import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

// API Secret to prevent unauthorized access (Share this with the developer)
const API_SECRET = process.env.EXTERNAL_API_SECRET || "OMAA_SECURE_API_KEY_2026";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { coupon_code, api_key } = body;

    // 1. Security Check
    if (api_key !== API_SECRET) {
      return NextResponse.json({ error: "Unauthorized access. Invalid API Key." }, { status: 401 });
    }

    // 2. Validate input
    if (!coupon_code) {
      return NextResponse.json({ error: "coupon_code is required." }, { status: 400 });
    }

    // 3. Check if coupon exists and is active
    const [couponRows]: any = await pool.query(
      "SELECT status FROM coupons WHERE code = ? LIMIT 1",
      [coupon_code]
    );

    if (!couponRows || couponRows.length === 0) {
      return NextResponse.json({ error: "Invalid coupon code." }, { status: 404 });
    }

    if (couponRows[0].status !== 'active') {
      return NextResponse.json({ error: "This coupon code is already used or expired." }, { status: 400 });
    }

    // 4. Update coupon status to 'used'
    await pool.query(
      "UPDATE coupons SET status = 'used' WHERE code = ?",
      [coupon_code]
    );

    return NextResponse.json({ 
      success: true, 
      message: `Coupon ${coupon_code} has been successfully marked as used/expired.` 
    });

  } catch (error: any) {
    console.error("Expire coupon API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
