import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getAuthToken } from "../../../lib/auth";
import { getUserRewardSummary } from "@/lib/rewards";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

interface DecodedToken {
  email?: string;
  [key: string]: unknown;
}

async function getUserEmail(req?: Request): Promise<string | null> {
  const token = await getAuthToken(req);
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return typeof decoded.email === "string" ? decoded.email : null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const userEmail = await getUserEmail(req);
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const summary = await getUserRewardSummary(userEmail);

    // Combine legacy transactions for backward compatibility
    const combinedLegacyHistory = [
      ...summary.referral_money.history.map(item => ({
        id: `rm_${item.id}`,
        type: item.type,
        amount: Number(item.amount),
        description: item.description,
        date: item.created_at,
        source: 'referral_money'
      })),
      ...summary.points.history.map(item => ({
        id: `pts_${item.id}`,
        type: item.type,
        amount: Number(item.points),
        description: `${item.description} (${item.points} Pts)`,
        date: item.created_at,
        source: 'points'
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      balance: summary.referral_money.available_balance,
      transactions: combinedLegacyHistory,
      summary
    });
  } catch (error: any) {
    console.error("Wallet GET error:", error);
    return NextResponse.json({ error: "Failed to fetch wallet details: " + error.message }, { status: 500 });
  }
}
