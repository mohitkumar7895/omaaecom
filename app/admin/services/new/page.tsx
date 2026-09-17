import AddServiceForm from "./AddServiceForm";
import pool from "../../../../lib/db";

export const dynamic = 'force-dynamic';

export default async function AddServicePage() {
  let categories = [];
  let subcategories = [];

  try {
    const [catRows]: any = await pool.query("SELECT id, title FROM categories ORDER BY title ASC");
    categories = catRows;

    const [subRows]: any = await pool.query("SELECT id, category_id, title FROM subcategories ORDER BY title ASC");
    subcategories = subRows;
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }

  return <AddServiceForm categories={categories} subcategories={subcategories} />;
}
