import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      referral_member_id, 
      referral_user_name, 
      name, 
      email, 
      mobile, 
      coupon_code, 
      password 
    } = body;

    // Validate required fields
    if (!referral_member_id || !referral_user_name || !name || !email || !mobile || !password) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    // Check if email already exists in referral_registrations
    const [existing]: any = await pool.query(
      "SELECT id FROM referral_registrations WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "This email has already been registered." }, { status: 400 });
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert into database
    await pool.query(
      `INSERT INTO referral_registrations 
       (referral_member_id, referral_user_name, name, email, mobile, coupon_code, password_hash) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [referral_member_id, referral_user_name, name, email, mobile, coupon_code || "", password_hash]
    );

    return NextResponse.json({ success: true, message: "Registration successful!" });
  } catch (error: any) {
    console.error("Referral registration error:", error);
    return NextResponse.json({ error: "Failed to process registration: " + error.message }, { status: 500 });
  }
}
