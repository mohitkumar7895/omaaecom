import { NextResponse } from "next/server";
import pool from "../../../lib/db";

export async function GET() {
  try {
    console.log("Creating coupons table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        discount_type ENUM('percentage', 'flat') DEFAULT 'percentage',
        discount_value DECIMAL(10,2) DEFAULT 10.00,
        mobile VARCHAR(15) NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Adding amc_coupon_code column to bookings...");
    try {
      await pool.query(`
        ALTER TABLE bookings ADD COLUMN amc_coupon_code VARCHAR(100) DEFAULT NULL
      `);
      console.log("Column amc_coupon_code added.");
    } catch (e: any) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("Column amc_coupon_code already exists.");
      } else {
        throw e;
      }
    }

    return NextResponse.json({ success: true, message: "Setup complete" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
