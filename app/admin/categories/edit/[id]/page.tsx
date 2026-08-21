import pool from "../../../../../lib/db";
import EditCategoryForm from "@/app/admin/categories/edit/[id]/EditCategoryForm"; // Trigger TS update
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  let category = null;

  try {
    const resolvedParams = await params;
    const [rows]: any = await pool.query("SELECT * FROM categories WHERE id = ?", [resolvedParams.id]);
    if (rows && rows.length > 0) {
      category = rows[0];
    }
  } catch (error) {
    console.error("Database error:", error);
  }

  if (!category) {
    redirect("/admin/categories");
  }

  return <EditCategoryForm category={category} />;
}
