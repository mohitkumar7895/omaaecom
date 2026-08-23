import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";
const DAILY_CASHBACK_AMOUNT = 4;
const CLAIM_DESCRIPTION = 'Daily Cashback Claim';

async function getUserEmail() {
  const cookieStore = await cookies();
  const token = cookieStore.get("omaa_auth_token")?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.email;
  } catch (e) {
    return null;
  }
}

export async function GET() {
  try {
    const userEmail = await getUserEmail();
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total balance (including all wallet transactions)
    const [balanceRows]: any = await pool.query(
      `SELECT SUM(amount) as total FROM wallet_transactions WHERE user_email = ?`,
      [userEmail]
    );
    const balance = balanceRows[0]?.total || 0;

    // Get claim history
    const [history]: any = await pool.query(
      `SELECT id, created_at as date, description as details, amount, 'Success' as status 
       FROM wallet_transactions 
       WHERE user_email = ? AND description = ? 
       ORDER BY created_at DESC`,
      [userEmail, CLAIM_DESCRIPTION]
    );

    // Calculate time left (24 hours from last claim)
    let timeLeft = 0;
    if (history.length > 0) {
      const lastClaimTime = new Date(history[0].date).getTime();
      const nextClaimTime = lastClaimTime + (24 * 60 * 60 * 1000);
      const now = Date.now();
      if (nextClaimTime > now) {
        timeLeft = Math.floor((nextClaimTime - now) / 1000); // seconds
      }
    }

    return NextResponse.json({ balance, timeLeft, history });
  } catch (error: any) {
    console.error("Cashback GET error:", error);
    return NextResponse.json({ error: "Failed to fetch cashback details" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const userEmail = await getUserEmail();
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check last claim time to ensure 24 hours have passed
    const [history]: any = await pool.query(
      `SELECT created_at as date 
       FROM wallet_transactions 
       WHERE user_email = ? AND description = ? 
       ORDER BY created_at DESC LIMIT 1`,
      [userEmail, CLAIM_DESCRIPTION]
    );

    if (history.length > 0) {
      const lastClaimTime = new Date(history[0].date).getTime();
      const nextClaimTime = lastClaimTime + (24 * 60 * 60 * 1000);
      const now = Date.now();
      if (nextClaimTime > now) {
        return NextResponse.json({ error: "24 hours have not passed yet" }, { status: 400 });
      }
    }

    // Insert new claim
    await pool.query(
      `INSERT INTO wallet_transactions (user_email, amount, type, description) VALUES (?, ?, 'Credit', ?)`,
      [userEmail, DAILY_CASHBACK_AMOUNT, CLAIM_DESCRIPTION]
    );

    return NextResponse.json({ success: true, message: "Claim successful", amount: DAILY_CASHBACK_AMOUNT });
  } catch (error: any) {
    console.error("Cashback POST error:", error);
    return NextResponse.json({ error: "Failed to claim cashback" }, { status: 500 });
  }
}
