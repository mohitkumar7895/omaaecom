import AddSubcategoryForm from "@/app/admin/subcategories/new/AddSubcategoryForm";
import pool from "../../../../lib/db";

export const dynamic = 'force-dynamic';

export default async function AddSubcategoryPage() {
  let categories = [];
  try {
    const [rows]: any = await pool.query("SELECT id, title FROM categories ORDER BY title ASC");
    categories = rows;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }

  return <AddSubcategoryForm categories={categories} />;
}
