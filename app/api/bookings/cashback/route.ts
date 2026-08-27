import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function POST(req: Request) {
  try {
    const { orderId, action } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    if (action === 'opt_service') {
      try { await pool.query("ALTER TABLE bookings ADD COLUMN service_opted BOOLEAN DEFAULT FALSE"); } catch(e) {}
      await pool.query("UPDATE bookings SET service_opted = TRUE WHERE order_id = ?", [orderId]);
      return NextResponse.json({ success: true });
    }

    await pool.query(
      `UPDATE bookings SET ad_watched = TRUE, ad_watched_at = NOW(), cashback_amount = COALESCE(NULLIF(cashback_amount, 0), 4) WHERE order_id = ?`,
      [orderId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Cashback update error:", error);
    return NextResponse.json({ error: "Failed to update cashback status" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    try { await pool.query("ALTER TABLE bookings ADD COLUMN service_opted BOOLEAN DEFAULT FALSE"); } catch(e) {}

    const [rows]: any = await pool.query(
      `SELECT ad_watched, ad_watched_at, cashback_amount, working_status, service_opted FROM bookings WHERE order_id = ?`,
      [orderId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    
    // Fetch active Ad Config
    let adConfig = null;
    try {
      const [adRows]: any = await pool.query('SELECT * FROM cashback_ads LIMIT 1');
      if (adRows.length > 0) {
        adConfig = {
          ad_type: adRows[0].ad_type,
          media_urls: typeof adRows[0].media_urls === 'string' ? JSON.parse(adRows[0].media_urls) : adRows[0].media_urls,
          duration: adRows[0].duration
        };
      }
    } catch (e) {
      console.error("Failed to fetch ad config:", e);
    }

    return NextResponse.json({
      ...rows[0],
      adConfig
    });
  } catch (error: any) {
    console.error("Cashback fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch cashback status" }, { status: 500 });
  }
}
