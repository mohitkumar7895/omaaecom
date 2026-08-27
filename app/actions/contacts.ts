"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

// Ensure contacts table exists
async function ensureContactsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NULL,
        phone VARCHAR(50) NULL,
        subject VARCHAR(255) NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'New',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.error("Error creating contacts table:", err);
  }
}

export async function submitContactForm(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  if (!name || !name.trim()) {
    return { error: "Please enter your name." };
  }

  if (!message || !message.trim()) {
    return { error: "Please enter your message." };
  }

  try {
    await ensureContactsTable();

    await pool.query(
      `INSERT INTO contacts (name, email, phone, subject, message, status) VALUES (?, ?, ?, ?, ?, 'New')`,
      [name.trim(), email?.trim() || null, phone?.trim() || null, subject?.trim() || null, message.trim()]
    );

    revalidatePath("/admin/contacts");
    revalidatePath("/admin");

    return { success: true, message: "Thank you for reaching out! We will get back to you shortly." };
  } catch (error: any) {
    console.error("Error submitting contact inquiry:", error);
    return { error: error.message || "Failed to submit your message. Please try again later." };
  }
}

export async function updateContactStatus(formData: FormData) {
  const id = formData.get("id");
  const status = formData.get("status");

  if (!id || !status) return;

  try {
    await pool.query("UPDATE contacts SET status = ? WHERE id = ?", [status, id]);
    revalidatePath("/admin/contacts");
  } catch (error) {
    console.error("Error updating contact status:", error);
  }
}

export async function deleteContact(formData: FormData) {
  const id = formData.get("id");
  if (!id) return;

  try {
    await pool.query("DELETE FROM contacts WHERE id = ?", [id]);
    revalidatePath("/admin/contacts");
  } catch (error) {
    console.error("Error deleting contact:", error);
  }
}
