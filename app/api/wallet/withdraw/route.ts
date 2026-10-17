import { NextResponse } from "next/server";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { getAuthToken } from "@/lib/auth";
import { getUserRewardSummary } from "@/lib/rewards";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

interface DecodedToken {
  email?: string;
  name?: string;
  phone?: string;
  [key: string]: unknown;
}

export async function POST(req: Request) {
  try {
    const token = await getAuthToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    let userEmail = "";
    let userName = "";
    let userPhone = "";
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      userEmail = typeof decoded.email === "string" ? decoded.email : "";
      userName = typeof decoded.name === "string" ? decoded.name : "";
      userPhone = typeof decoded.phone === "string" ? decoded.phone : "";
    } catch {
      return NextResponse.json({ error: "Invalid session token." }, { status: 401 });
    }

    if (!userEmail) {
      return NextResponse.json({ error: "User email not found in token." }, { status: 400 });
    }

    const body = await req.json();
    const { amount, payment_method, upi_id, bank_name, account_number, ifsc_code, account_holder_name } = body;

    const withdrawAmount = Number(amount);
    if (isNaN(withdrawAmount) || withdrawAmount < 200) {
      return NextResponse.json(
        { error: "Minimum withdrawal limit is ₹200." },
        { status: 400 }
      );
    }

    // Verify user's actual available Referral Money balance
    const summary = await getUserRewardSummary(userEmail);
    const availableBalance = summary.referral_money.available_balance;

    if (withdrawAmount > availableBalance) {
      return NextResponse.json(
        { error: `Insufficient balance. Your available withdrawable balance is ₹${availableBalance.toFixed(2)}.` },
        { status: 400 }
      );
    }

    // Validate payment details
    const method = (payment_method || 'UPI').toUpperCase();
    if (method === 'UPI') {
      if (!upi_id || typeof upi_id !== 'string' || !upi_id.includes('@')) {
        return NextResponse.json({ error: "Please enter a valid UPI ID (e.g. mobile@upi, user@okhdfcbank)." }, { status: 400 });
      }
    } else if (method === 'BANK') {
      if (!account_number || !ifsc_code || !bank_name || !account_holder_name) {
        return NextResponse.json({ error: "All bank account fields (Holder Name, Account No, IFSC, Bank Name) are required." }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Invalid payment method. Choose UPI or Bank." }, { status: 400 });
    }

    const withdrawalId = `WDR${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Insert into referral_withdrawals
      await connection.query(
        `INSERT INTO referral_withdrawals 
          (withdrawal_id, user_email, user_name, user_phone, amount, payment_method, upi_id, bank_name, account_number, ifsc_code, account_holder_name, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
        [
          withdrawalId,
          userEmail,
          userName || userEmail.split('@')[0],
          userPhone || null,
          withdrawAmount,
          method === 'BANK' ? 'Bank' : 'UPI',
          method === 'UPI' ? upi_id.trim() : null,
          method === 'BANK' ? bank_name.trim() : null,
          method === 'BANK' ? account_number.trim() : null,
          method === 'BANK' ? ifsc_code.trim().toUpperCase() : null,
          method === 'BANK' ? account_holder_name.trim() : null
        ]
      );

      // 2. Insert debit into referral_money_transactions
      await connection.query(
        `INSERT INTO referral_money_transactions 
          (user_email, amount, type, category, level, order_id, description)
         VALUES (?, ?, 'Debit', 'withdrawal', 0, ?, ?)`,
        [
          userEmail,
          withdrawAmount,
          withdrawalId,
          `Withdrawal Request #${withdrawalId} to ${method === 'UPI' ? `UPI: ${upi_id}` : `Bank: ${account_number}`}`
        ]
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: `Withdrawal request of ₹${withdrawAmount} submitted successfully! Ref: ${withdrawalId}`,
        withdrawal_id: withdrawalId,
        new_balance: availableBalance - withdrawAmount
      });
    } catch (txErr: any) {
      await connection.rollback();
      throw txErr;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error("Withdrawal error:", error);
    return NextResponse.json({ error: "Failed to process withdrawal request: " + error.message }, { status: 500 });
  }
}
