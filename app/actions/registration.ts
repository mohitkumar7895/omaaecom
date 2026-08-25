"use server";

import pool from "../../lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveRegistration(formData: FormData) {
  const name = formData.get("name") as string;
  const mobile = formData.get("mobile") as string;
  const workCompany = formData.get("work_company") as string;
  const location = formData.get("location") as string;
  const experience = formData.get("experience") as string;

  await ensureStatusColumn();

  try {
    const query = `
      INSERT INTO registration_records (name, mobile, work_company, location, experience, status)
      VALUES (?, ?, ?, ?, ?, 'Pending')
    `;
    await pool.query(query, [name, mobile, workCompany, location, experience]);
  } catch (error) {
    console.error("Error saving registration:", error);
    return { error: "Failed to save registration" };
  }

  revalidatePath("/admin/registration-records");
  redirect("/admin/registration-records");
}

async function ensureStatusColumn() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS registration_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        work_company VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        experience VARCHAR(50) NOT NULL,
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    try {
      await pool.query(`
        ALTER TABLE registration_records 
        ADD COLUMN status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending'
      `);
    } catch (e: any) {
      // Ignored if column already exists
    }
  } catch (err) {
    console.error("Error ensuring registration table schema:", err);
  }
}

export async function submitProfessionalRegistration(data: {
  name: string;
  mobile: string;
  work_company: string;
  location: string;
  experience: string;
}) {
  await ensureStatusColumn();

  const { name, mobile, work_company, location, experience } = data;

  if (!name || !name.trim()) {
    return { success: false, error: "Full name is required." };
  }
  if (!mobile || !/^\d{10}$/.test(mobile.trim())) {
    return { success: false, error: "Please enter a valid 10-digit mobile number." };
  }
  if (!work_company || !work_company.trim()) {
    return { success: false, error: "Work / Skill name is required." };
  }
  if (!location || !location.trim()) {
    return { success: false, error: "Work location is required." };
  }
  if (!experience || !experience.trim()) {
    return { success: false, error: "Please select your experience level." };
  }

  try {
    const query = `
      INSERT INTO registration_records (name, mobile, work_company, location, experience, status)
      VALUES (?, ?, ?, ?, ?, 'Pending')
    `;

    const [result]: any = await pool.query(query, [
      name.trim(),
      mobile.trim(),
      work_company.trim(),
      location.trim(),
      experience.trim(),
    ]);

    revalidatePath("/admin/registration-records");

    return {
      success: true,
      message: "Professional registration submitted successfully! Our team will contact you soon.",
      recordId: result?.insertId,
    };
  } catch (error: any) {
    console.error("Database error in submitProfessionalRegistration:", error);
    return { success: false, error: "Failed to submit registration. Please try again." };
  }
}

export async function updateRegistrationStatus(id: number, status: "Pending" | "Approved" | "Rejected") {
  await ensureStatusColumn();

  try {
    await pool.query("UPDATE registration_records SET status = ? WHERE id = ?", [status, id]);
    revalidatePath("/admin/registration-records");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating registration status:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteRegistration(formData: FormData) {
  await ensureStatusColumn();
  const id = formData.get("id");
  if (id) {
    await pool.query("DELETE FROM registration_records WHERE id = ?", [id]);
    revalidatePath("/admin/registration-records");
  }
}

export async function deleteRegistrationById(id: number) {
  await ensureStatusColumn();
  try {
    await pool.query("DELETE FROM registration_records WHERE id = ?", [id]);
    revalidatePath("/admin/registration-records");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting registration:", error);
    return { success: false, error: error.message };
  }
}
