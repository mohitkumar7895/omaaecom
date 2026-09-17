"use server";

import pool from "../../lib/db";
import { revalidatePath } from "next/cache";
import { sendComplaintEmail } from "../../lib/mail";

export async function submitComplaint(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const orderId = formData.get("orderId") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  if (!name || !phone || !subject || !message) {
    return { error: "Please fill in all required fields." };
  }

  try {
    const query = `
      INSERT INTO complaints (name, phone, order_id, subject, message, status)
      VALUES (?, ?, ?, ?, ?, 'Open')
    `;
    const values = [name, phone, orderId || null, subject, message];

    await pool.query(query, values);
    
    // Revalidate the admin complaints page so the new data shows up instantly
    revalidatePath("/admin/complaints");
    
    // Trigger email notification safely
    try {
      sendComplaintEmail({
        name: name.trim(),
        phone: phone.trim(),
        orderId: orderId?.trim() || undefined,
        subject: subject.trim(),
        message: message.trim(),
      }).catch((err) => console.error("Complaint email error:", err));
    } catch (e) {
      console.warn("Could not dispatch complaint email:", e);
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving complaint:", error);
    return { error: "Failed to submit complaint. Please try again later." };
  }
}
