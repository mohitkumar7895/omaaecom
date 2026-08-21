"use server";

import pool from "../../../lib/db";
import { revalidatePath } from "next/cache";

export async function updateWorkingStatus(formData: FormData) {
  const id = formData.get("id");
  const status = formData.get("working_status");
  if (id && status) {
    await pool.query("UPDATE bookings SET working_status = ? WHERE id = ?", [status, id]);
    revalidatePath("/admin/booking", 'layout');
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
