import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function GET() {
  try {
    await pool.query("ALTER TABLE bookings ADD COLUMN referred_by VARCHAR(100) DEFAULT NULL");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message.includes("Duplicate column name")) {
      return NextResponse.json({ success: true, message: "Already exists" });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
