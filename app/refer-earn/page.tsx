import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import pool from "../../lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

export const dynamic = "force-dynamic";

export default async function ReferEarnPage() {
  let couponCode = "";

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("omaa_auth_token")?.value;

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const userEmail = decoded?.email;
      const userMobile = decoded?.mobile || "";

      // 1. Check latest booking with coupon_code
      if (userEmail || userMobile) {
        const [bookingRows]: any = await pool.query(
          "SELECT coupon_code FROM bookings WHERE (user_email = ? OR mobile = ?) AND coupon_code IS NOT NULL AND coupon_code != '' ORDER BY id DESC LIMIT 1",
          [userEmail || "", userMobile || ""]
        );

        if (bookingRows.length > 0 && bookingRows[0]?.coupon_code) {
          couponCode = bookingRows[0].coupon_code;
        }
      }

      // 2. Check coupons table
      if (!couponCode && userMobile) {
        const [cRows]: any = await pool.query(
          "SELECT code FROM coupons WHERE mobile = ? LIMIT 1",
          [userMobile]
        );
        if (cRows.length > 0 && cRows[0]?.code) {
          couponCode = cRows[0].code;
        }
      }
    }
  } catch (err) {
    console.error("Refer-earn redirect error:", err);
  }

  // Fallback to dynamic OC + 6 digits coupon code (e.g. OC133461)
  if (!couponCode) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    couponCode = `OC${randomNum}`;
  }

  redirect(`https://omaacompany.in/?ref=${couponCode}`);
}