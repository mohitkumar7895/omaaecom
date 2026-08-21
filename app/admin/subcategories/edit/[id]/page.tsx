import EditSubcategoryForm from "@/app/admin/subcategories/edit/[id]/EditSubcategoryForm";
import pool from "../../../../../lib/db";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditSubcategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  let subcategory = null;
  let categories = [];
  
  try {
    const [subRows]: any = await pool.query("SELECT * FROM subcategories WHERE id = ?", [resolvedParams.id]);
    if (subRows.length > 0) {
      subcategory = subRows[0];
    }

    const [catRows]: any = await pool.query("SELECT id, title FROM categories ORDER BY title ASC");
    categories = catRows;
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }

  if (!subcategory) {
    redirect("/admin/subcategories");
  }

  return <EditSubcategoryForm subcategory={subcategory} categories={categories} />;
}
