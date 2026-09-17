import EditServiceForm from "./EditServiceForm";
import pool from "../../../../../lib/db";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  let service = null;
  let categories = [];
  let subcategories = [];
  
  try {
    const [servRows]: any = await pool.query("SELECT * FROM services WHERE id = ?", [resolvedParams.id]);
    if (servRows.length > 0) {
      service = servRows[0];
    }

    const [catRows]: any = await pool.query("SELECT id, title FROM categories ORDER BY title ASC");
    categories = catRows;

    const [subRows]: any = await pool.query("SELECT id, category_id, title FROM subcategories ORDER BY title ASC");
    subcategories = subRows;
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }

  if (!service) {
    redirect("/admin/services");
  }

  return <EditServiceForm service={service} categories={categories} subcategories={subcategories} />;
}
