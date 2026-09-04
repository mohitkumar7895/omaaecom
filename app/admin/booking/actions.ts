"use server";

import pool from "../../../lib/db";
import { revalidatePath } from "next/cache";

function generateCouponCode(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `OC${randomNum}`;
}

export async function updateWorkingStatus(formData: FormData) {
  const id = formData.get("id");
  const status = formData.get("working_status");
  
  if (id && status) {
    try {
      // Check if status is Complete
      if (status === 'Complete') {
        try {
          await pool.query("ALTER TABLE bookings ADD COLUMN amc_coupon_code VARCHAR(50) DEFAULT NULL");
        } catch(e) {}
        try {
          await pool.query("ALTER TABLE bookings ADD COLUMN referred_by VARCHAR(50) DEFAULT NULL");
        } catch(e) {}
        
        // Fetch booking details
        const [rows]: any = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);
        if (rows && rows.length > 0) {
          const booking = rows[0];
          
          // 1. Auto-create warranty record if it doesn't already exist
          try {
            const [existingW]: any = await pool.query("SELECT id FROM warranties WHERE order_id = ?", [booking.order_id]);
            if (existingW.length === 0) {
              // Fetch category's warranty days
              let days = 180;
              try {
                const [catRows]: any = await pool.query(
                  "SELECT warranty_days FROM categories WHERE title = ? LIMIT 1",
                  [booking.category]
                );
                if (catRows && catRows.length > 0 && catRows[0].warranty_days !== null) {
                  days = catRows[0].warranty_days;
                } else {
                  days = (booking.type === 'AMC' || booking.type === 'New Product') ? 365 : 180;
                }
              } catch (catErr) {
                console.error("Error reading category warranty_days:", catErr);
                days = (booking.type === 'AMC' || booking.type === 'New Product') ? 365 : 180;
              }

              const issuedDate = new Date().toISOString().slice(0, 10);
              const expiryDateObj = new Date();
              expiryDateObj.setDate(expiryDateObj.getDate() + days);
              const expiryDate = expiryDateObj.toISOString().slice(0, 10);
              
              // Correct columns to match setup-warranties.js schema
              await pool.query(
                `INSERT INTO warranties (order_id, customer_name, customer_phone, days_valid, issued_date, expiry_date, status) 
                 VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
                [booking.order_id, booking.customer_name, booking.mobile, days, issuedDate, expiryDate]
              );
            }
          } catch (wErr) {
            console.error("Failed to auto-insert warranty:", wErr);
          }

          // 2. Generate coupon only if type matches and coupon hasn't been generated yet
          if ((booking.type === 'AMC' || booking.type === 'New Product') && !booking.amc_coupon_code && !booking.coupon_code) {
            const couponCode = generateCouponCode();
            
            // Insert into coupons table (10% standard discount)
            await pool.query(
              "INSERT INTO coupons (code, discount_type, discount_value, mobile) VALUES (?, 'percentage', 10.00, ?)",
              [couponCode, booking.mobile]
            );
            
            // Update booking with status and amc_coupon_code
            await pool.query(
              "UPDATE bookings SET working_status = ?, amc_coupon_code = ? WHERE id = ?", 
              [status, couponCode, id]
            );
            revalidatePath("/admin/booking", 'layout');
            revalidatePath("/admin/warranties", 'layout');
          } else {
            // Update booking status directly
            await pool.query("UPDATE bookings SET working_status = ? WHERE id = ?", [status, id]);
            revalidatePath("/admin/booking", 'layout');
            revalidatePath("/admin/warranties", 'layout');
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

export async function updateInvoiceStatus(formData: FormData) {
  const id = formData.get("id");
  const status = formData.get("invoice_status");
  if (id && status) {
    try {
      try {
        await pool.query("ALTER TABLE bookings ADD COLUMN invoice_status VARCHAR(50) DEFAULT 'Pending'");
      } catch (e) {}
      await pool.query("UPDATE bookings SET invoice_status = ? WHERE id = ?", [status, id]);
      revalidatePath("/admin/booking", 'layout');
      revalidatePath("/my-bookings", 'layout');
    } catch (error) {
      console.error("Error updating invoice status:", error);
    }
  }
}

export async function updateBookingItems(formData: FormData) {
  const id = formData.get("id");
  const servicesJson = formData.get("services");
  const total = formData.get("total");

  if (id && servicesJson) {
    try {
      await pool.query(
        "UPDATE bookings SET services = ?, total = ? WHERE id = ?",
        [servicesJson, total, id]
      );
      revalidatePath("/admin/booking", 'layout');
      revalidatePath("/my-bookings", 'layout');
      revalidatePath("/invoice", 'layout');
      return { success: true };
    } catch (error: any) {
      console.error("Error updating booking items and pricing:", error);
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: "Missing required parameters." };
}
