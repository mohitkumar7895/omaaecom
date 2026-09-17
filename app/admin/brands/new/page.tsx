import pool from "../../../../lib/db";
import AddBrandForm from "./AddBrandForm";

export const dynamic = 'force-dynamic';

export default async function AddBrandPage() {
  let categories: any[] = [];

  try {
    const [rows]: any = await pool.query("SELECT id, title FROM categories ORDER BY title ASC");
    categories = rows;
  } catch (error) {
    console.error("Database error:", error);
  }

  return <AddBrandForm categories={categories} />;
}
