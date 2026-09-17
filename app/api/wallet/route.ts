import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

interface DecodedToken {
  email?: string;
  [key: string]: unknown;
}

interface WalletTransactionRow {
  id: number;
  type: string;
  description: string;
  amount: number | string;
  created_at: string | Date;
}

interface BookingCashbackRow {
  id: number;
  type?: string;
  order_id: string;
  cashback_amount?: number | string;
  ad_watched?: number | boolean;
  ad_watched_at?: string | Date | null;
  created_at: string | Date;
  working_status?: string;
}

interface WalletHistoryItem {
  id: string;
  type: "Credit" | "Debit";
  description: string;
  amount: number;
  date: string | Date;
}

async function getUserEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("omaa_auth_token")?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return typeof decoded.email === "string" ? decoded.email : null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const userEmail = await getUserEmail();
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let walletTxBalance = 0;
    let walletTxHistory: WalletHistoryItem[] = [];
    try {
      const [walletTxRows] = await pool.query(
        `SELECT * FROM wallet_transactions WHERE user_email = ? ORDER BY created_at DESC`,
        [userEmail]
      ) as unknown as [WalletTransactionRow[]];

      walletTxHistory = (walletTxRows || []).map((tx) => {
        const amount = Number(tx.amount);
        walletTxBalance += amount;
        return {
          id: "wtx_" + tx.id,
          type: tx.type === "Credit" ? "Credit" : "Debit",
          description: tx.description,
          amount,
          date: tx.created_at
        };
      });
    } catch (error) {
      console.warn("Wallet transactions unavailable:", error instanceof Error ? error.message : error);
    }

    // 2. Get Bookings Cashback Balance & History
    let bookingsCashbackBalance = 0;
    let bookingsHistory: WalletHistoryItem[] = [];
    try {
      const [bookings] = await pool.query(
        `SELECT * FROM bookings WHERE user_email = ?`,
        [userEmail]
      ) as unknown as [BookingCashbackRow[]];

      bookingsHistory = (bookings || [])
        .filter((booking) => booking.working_status === "Complete" && Boolean(booking.ad_watched) && Number(booking.cashback_amount) > 0)
        .map((booking) => {
          const amount = Number(booking.cashback_amount);
          bookingsCashbackBalance += amount;
          return {
            id: "bk_" + booking.id,
            type: "Credit",
            description: (booking.type || "Booking") + " Cashback (Order: " + booking.order_id + ")",
            amount,
            date: booking.ad_watched_at || booking.created_at
          };
        });
    } catch (error) {
      console.warn("Booking cashback unavailable:", error instanceof Error ? error.message : error);
    }

    // 3. Combine and sort all transactions
    const totalBalance = walletTxBalance + bookingsCashbackBalance;
    const allTransactions = [...walletTxHistory, ...bookingsHistory].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return NextResponse.json({ balance: totalBalance, transactions: allTransactions });
  } catch (error) {
    console.error("Wallet GET error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to fetch wallet details" }, { status: 500 });
  }
}
