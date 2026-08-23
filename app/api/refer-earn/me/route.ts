import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("omaa_auth_token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userEmail = decoded.email;

    const [rows]: any = await pool.query(
      "SELECT referral_member_id, referral_user_name, name, email FROM referral_registrations WHERE email = ?",
      [userEmail]
    );

    if (rows.length === 0) {
      return NextResponse.json({ isReferralMember: false });
    }

    return NextResponse.json({ 
      isReferralMember: true, 
      referralData: rows[0] 
    });
  } catch (error: any) {
    console.error("Fetch referral user error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
