import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

async function getUserEmail() {
  const cookieStore = await cookies();
  const token = cookieStore.get("omaa_auth_token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.email;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { orderId, action } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    try { await pool.query("ALTER TABLE bookings ADD COLUMN service_opted BOOLEAN DEFAULT FALSE"); } catch(e) {}
    try { await pool.query("ALTER TABLE bookings ADD COLUMN last_cashback_claim_at TIMESTAMP NULL"); } catch(e) {}

    if (action === 'opt_service') {
      await pool.query("UPDATE bookings SET service_opted = TRUE, ad_watched = FALSE WHERE order_id = ?", [orderId]);
      return NextResponse.json({ success: true });
    }

    if (action === 'claim_daily') {
      const [rows]: any = await pool.query(
        `SELECT order_id, user_email, mobile, total, cashback_amount, ad_watched, last_cashback_claim_at FROM bookings WHERE order_id = ?`,
        [orderId]
      );

      if (!rows || rows.length === 0) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      const booking = rows[0];
      if (!booking.ad_watched) {
        return NextResponse.json({ error: "Please watch the video first to activate cashback." }, { status: 400 });
      }

      const now = Date.now();
      if (booking.last_cashback_claim_at) {
        const lastClaim = new Date(booking.last_cashback_claim_at).getTime();
        const nextAllowed = lastClaim + (24 * 60 * 60 * 1000);
        if (nextAllowed > now) {
          const hoursLeft = Math.ceil((nextAllowed - now) / (1000 * 60 * 60));
          return NextResponse.json({ error: `Next claim available in ${hoursLeft} hours.` }, { status: 400 });
        }
      }

      const loggedEmail = await getUserEmail();
      const userEmail = loggedEmail || booking.user_email || `${booking.mobile || 'user'}@omaacompany.com`;
      const claimAmount = Number(booking.cashback_amount) || 4;

      // Credit wallet
      try {
        await pool.query(
          `CREATE TABLE IF NOT EXISTS wallet_transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_email VARCHAR(255) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            type ENUM('Credit', 'Debit') NOT NULL,
            description VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`
        );
      } catch (e) {}

      await pool.query(
        `INSERT INTO wallet_transactions (user_email, amount, type, description) VALUES (?, ?, 'Credit', ?)`,
        [userEmail, claimAmount, `Daily Cashback - Order #${orderId}`]
      );

      await pool.query(
        `UPDATE bookings SET last_cashback_claim_at = NOW() WHERE order_id = ?`,
        [orderId]
      );

      return NextResponse.json({ 
        success: true, 
        message: `₹${claimAmount} cashback credited to your wallet!`,
        amount: claimAmount 
      });
    }

    // Default POST: mark ad watched / opt cashback
    await pool.query(
      `UPDATE bookings SET ad_watched = TRUE, service_opted = FALSE, ad_watched_at = NOW(), last_cashback_claim_at = NOW(), cashback_amount = COALESCE(NULLIF(cashback_amount, 0), 4) WHERE order_id = ?`,
      [orderId]
    );

    // Also give initial claim upon first video watch
    const loggedEmail = await getUserEmail();
    const [bRows]: any = await pool.query(`SELECT user_email, mobile, cashback_amount FROM bookings WHERE order_id = ?`, [orderId]);
    if (bRows && bRows.length > 0) {
      const uEmail = loggedEmail || bRows[0].user_email || `${bRows[0].mobile || 'user'}@omaacompany.com`;
      const cAmount = Number(bRows[0].cashback_amount) || 4;
      try {
        await pool.query(
          `INSERT INTO wallet_transactions (user_email, amount, type, description) VALUES (?, ?, 'Credit', ?)`,
          [uEmail, cAmount, `Daily Cashback (Day 1) - Order #${orderId}`]
        );
      } catch (e) {}
    }

    // If a warranty record exists, void it because customer opted for Cashback
    try {
      await pool.query("UPDATE warranties SET status = 'Void' WHERE order_id = ?", [orderId]);
    } catch(e) {}

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
    try { await pool.query("ALTER TABLE bookings ADD COLUMN last_cashback_claim_at TIMESTAMP NULL"); } catch(e) {}

    const [rows]: any = await pool.query(
      `SELECT ad_watched, ad_watched_at, last_cashback_claim_at, cashback_amount, working_status, service_opted FROM bookings WHERE order_id = ?`,
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
