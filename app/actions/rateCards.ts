"use server";

import pool from "../../lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addRateCards(formData: FormData) {
  const category_id = formData.get("category_id")?.toString();
  const heading_id = formData.get("heading_id")?.toString();
  const labour_charges = formData.get("labour_charges")?.toString();
  const labour_note = formData.get("labour_note")?.toString();

  const partsJson = formData.get("parts")?.toString();
  
  if (!category_id || !heading_id || !labour_charges || !partsJson) {
    throw new Error("Missing required fields");
  }

  let parts: { name: string; price: string }[] = [];
  try {
    parts = JSON.parse(partsJson);
  } catch (e) {
    throw new Error("Invalid parts format");
  }

  if (parts.length === 0) {
    throw new Error("At least one part is required");
  }

  try {
    for (const part of parts) {
      if (!part.name || !part.price) continue;
      
      await pool.query(
        "INSERT INTO rate_cards (category_id, heading_id, part_name, price, labour_charges, labour_note) VALUES (?, ?, ?, ?, ?, ?)",
        [category_id, heading_id, part.name, part.price, labour_charges, labour_note || null]
      );
    }
  } catch (error) {
    console.error("Error inserting rate cards:", error);
    throw new Error("Failed to add rate cards");
  }

  revalidatePath("/admin/rate-cards");
  redirect("/admin/rate-cards");
}

export async function deleteRateCard(formData: FormData) {
  const id = formData.get("id")?.toString();

  if (!id) return;

  try {
    await pool.query("DELETE FROM rate_cards WHERE id = ?", [id]);
  } catch (error) {
    console.error("Error deleting rate card:", error);
  }

  revalidatePath("/admin/rate-cards");
}

export async function getRateCardsByCategoryId(categoryId: number | string) {
  if (!categoryId) return [];
  try {
    const [rows]: any = await pool.query(`
      SELECT rc.*, h.title as heading_title 
      FROM rate_cards rc
      LEFT JOIN rate_headings h ON rc.heading_id = h.id
      WHERE rc.category_id = ?
      ORDER BY rc.id ASC
    `, [categoryId]);
    return JSON.parse(JSON.stringify(rows));
  } catch (error) {
    console.error("Error fetching rate cards by category:", error);
    return [];
  }
}
