"use server";

import pool from "../../lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveRateHeading(formData: FormData) {
  const title = formData.get("title") as string;

  try {
    await pool.query("INSERT INTO rate_headings (title) VALUES (?)", [title]);
  } catch (error) {
    console.error("Error saving rate heading:", error);
  }

  revalidatePath("/admin/rate-headings");
  redirect("/admin/rate-headings");
}

export async function updateRateHeading(formData: FormData) {
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;

  try {
    await pool.query("UPDATE rate_headings SET title = ? WHERE id = ?", [title, id]);
  } catch (error) {
    console.error("Error updating rate heading:", error);
  }

  revalidatePath("/admin/rate-headings");
  redirect("/admin/rate-headings");
}

export async function deleteRateHeading(formData: FormData) {
  const id = formData.get("id") as string;

  try {
    await pool.query("DELETE FROM rate_headings WHERE id = ?", [id]);
  } catch (error) {
    console.error("Error deleting rate heading:", error);
  }

  revalidatePath("/admin/rate-headings");
}
