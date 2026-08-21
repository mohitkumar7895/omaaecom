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

  try {
    const query = `
      INSERT INTO registration_records (name, mobile, work_company, location, experience)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await pool.query(query, [name, mobile, workCompany, location, experience]);
  } catch (error) {
    console.error("Error saving registration:", error);
    return { error: "Failed to save registration" };
  }

  revalidatePath("/admin/registration-records");
  redirect("/admin/registration-records");
}

export async function deleteRegistration(formData: FormData) {
  const id = formData.get("id");
  if (id) {
    await pool.query("DELETE FROM registration_records WHERE id = ?", [id]);
    revalidatePath("/admin/registration-records");
  }
}
