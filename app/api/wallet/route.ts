import { NextResponse } from "next/server";
import pool from "../../../lib/db";
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

    // 1. Get Wallet Transactions Balance & History
    const [walletTxRows]: any = await pool.query(
      `SELECT * FROM wallet_transactions WHERE user_email = ? ORDER BY created_at DESC`,
      [userEmail]
    );
    
    let walletTxBalance = 0;
    const walletTxHistory = walletTxRows.map((tx: any) => {
      walletTxBalance += Number(tx.amount); // amount can be positive or negative
      return {
        id: 'wtx_' + tx.id,
        type: tx.type === 'Credit' ? 'Credit' : 'Debit',
        description: tx.description,
        amount: Number(tx.amount),
        date: tx.created_at
      };
    });

    // 2. Get Bookings Cashback Balance & History
    const [bookings]: any = await pool.query(
      `SELECT * FROM bookings WHERE user_email = ?`,
      [userEmail]
    );

    let bookingsCashbackBalance = 0;
    const bookingsHistory = bookings
      .filter((b: any) => b.working_status === 'Complete' && b.ad_watched === 1 && b.cashback_amount > 0)
      .map((b: any) => {
        bookingsCashbackBalance += Number(b.cashback_amount);
        return {
          id: 'bk_' + b.id,
          type: 'Credit',
          description: b.type + ' Cashback (Order: ' + b.order_id + ')',
          amount: Number(b.cashback_amount),
          date: b.ad_watched_at || b.created_at
        };
      });

    // 3. Combine and sort all transactions
    const totalBalance = walletTxBalance + bookingsCashbackBalance;
    const allTransactions = [...walletTxHistory, ...bookingsHistory].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return NextResponse.json({ balance: totalBalance, transactions: allTransactions });
  } catch (error: any) {
    console.error("Wallet GET error:", error);
    return NextResponse.json({ error: "Failed to fetch wallet details" }, { status: 500 });
  }
}
