import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_please_change_in_env";

async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return false;
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [rows]: any = await pool.query(
      `SELECT * FROM referral_withdrawals ORDER BY created_at DESC`
    );

    return NextResponse.json({ withdrawals: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status, admin_notes } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required" }, { status: 400 });
    }

    const [existing]: any = await pool.query(
      "SELECT * FROM referral_withdrawals WHERE id = ? LIMIT 1",
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: "Withdrawal request not found" }, { status: 404 });
    }

    const request = existing[0];
    const previousStatus = request.status;

    // Update status in referral_withdrawals
    await pool.query(
      "UPDATE referral_withdrawals SET status = ?, admin_notes = ? WHERE id = ?",
      [status, admin_notes || null, id]
    );

    // If status changed to Rejected from Pending/Approved, refund the amount
    if (status === "Rejected" && previousStatus !== "Rejected") {
      await pool.query(
        `INSERT INTO referral_money_transactions (user_email, amount, type, category, level, order_id, description)
         VALUES (?, ?, 'Credit', 'referral_bonus', 0, ?, ?)`,
        [
          request.user_email,
          request.amount,
          request.withdrawal_id,
          `Refund: Rejected Withdrawal Request #${request.withdrawal_id}`
        ]
      );
    }

    return NextResponse.json({ success: true, message: `Withdrawal #${request.withdrawal_id} status updated to ${status}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
