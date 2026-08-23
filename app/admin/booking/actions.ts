"use server";

import pool from "../../../lib/db";
import { revalidatePath } from "next/cache";

function generateCouponCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function updateWorkingStatus(formData: FormData) {
  const id = formData.get("id");
  const status = formData.get("working_status");
  
  if (id && status) {
    try {
      // Check if status is Complete
      if (status === 'Complete') {
        try {
          await pool.query("ALTER TABLE bookings ADD COLUMN coupon_code VARCHAR(50) DEFAULT NULL");
        } catch(e) {}
        try {
          await pool.query("ALTER TABLE bookings ADD COLUMN referred_by VARCHAR(50) DEFAULT NULL");
        } catch(e) {}
        
        // Fetch booking details
        const [rows]: any = await pool.query("SELECT type, mobile, coupon_code, referred_by FROM bookings WHERE id = ?", [id]);
        if (rows && rows.length > 0) {
          const booking = rows[0];
          
          // Generate coupon only if type matches and coupon hasn't been generated yet
          if ((booking.type === 'AMC' || booking.type === 'New Product') && !booking.coupon_code) {
            const couponCode = generateCouponCode();
            
            // Insert into coupons table (10% standard discount)
            await pool.query(
              "INSERT INTO coupons (code, discount_type, discount_value, mobile) VALUES (?, 'percentage', 10.00, ?)",
              [couponCode, booking.mobile]
            );
            
            // Update booking with status and coupon_code
            await pool.query(
              "UPDATE bookings SET working_status = ?, coupon_code = ? WHERE id = ?", 
              [status, couponCode, id]
            );
            revalidatePath("/admin/booking", 'layout');
          } else {
            // Update booking status directly
            await pool.query("UPDATE bookings SET working_status = ? WHERE id = ?", [status, id]);
            revalidatePath("/admin/booking", 'layout');
          }

          // Referral payout logic: If referred_by exists, add ₹100 to the referrer's wallet
          if (booking.referred_by) {
            const description = `Referral Bonus for Booking #${id}`;
            
            // Check if this bonus was already paid to prevent duplicate payouts
            const [existingTxs]: any = await pool.query(
              "SELECT id FROM wallet_transactions WHERE description = ?",
              [description]
            );
            
            if (existingTxs.length === 0) {
              // Find the email of the referral member
              const [referrerRows]: any = await pool.query(
                "SELECT email FROM referral_registrations WHERE referral_member_id = ?",
                [booking.referred_by]
              );
              
              if (referrerRows && referrerRows.length > 0) {
                const referrerEmail = referrerRows[0].email;
                
                // Add ₹100 to their wallet
                await pool.query(
                  "INSERT INTO wallet_transactions (user_email, amount, type, description) VALUES (?, ?, 'Credit', ?)",
                  [referrerEmail, 100.00, description]
                );
              }
            }
          }

          return;
        }
      }
      
      // Default update if not Complete or if not matching criteria
      await pool.query("UPDATE bookings SET working_status = ? WHERE id = ?", [status, id]);
      revalidatePath("/admin/booking", 'layout');
    } catch (error) {
      console.error("Error updating working status:", error);
    }
  }
}

export async function updateTotal(formData: FormData) {
  const id = formData.get("id");
  const total = formData.get("total");
  if (id && total) {
    await pool.query("UPDATE bookings SET total = ? WHERE id = ?", [total, id]);
    revalidatePath("/admin/booking", 'layout');
  }
}

export async function updateCashback(formData: FormData) {
  const id = formData.get("id");
  const amount = formData.get("cashback_amount");
  if (id && amount) {
    await pool.query("UPDATE bookings SET cashback_amount = ? WHERE id = ?", [amount, id]);
    revalidatePath("/admin/booking", 'layout');
  }
}

export async function updatePaymentStatus(formData: FormData) {
  const id = formData.get("id");
  const status = formData.get("payment_status");
  if (id && status) {
    try {
      await pool.query("UPDATE bookings SET payment_status = ? WHERE id = ?", [status, id]);
      revalidatePath("/admin/booking", 'layout');
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  }
}
