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
  } catch (e) {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const userEmail = await getUserEmail();
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount } = body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Insert into wallet_transactions
    await pool.query(
      `INSERT INTO wallet_transactions (user_email, amount, type, description) VALUES (?, ?, 'Credit', 'Wallet Deposit')`,
      [userEmail, Number(amount)]
    );

    return NextResponse.json({ success: true, message: `Successfully added ₹${amount} to your wallet.` });
  } catch (error: any) {
    console.error("Wallet Add Money POST error:", error);
    return NextResponse.json({ error: "Failed to add money" }, { status: 500 });
  }
}
