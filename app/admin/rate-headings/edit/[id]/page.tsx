import EditRateHeadingForm from "./EditRateHeadingForm"; // fix ts
import pool from "../../../../../lib/db";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditRateHeadingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  let heading = null;
  
  try {
    const [rows]: any = await pool.query("SELECT * FROM rate_headings WHERE id = ?", [resolvedParams.id]);
    if (rows.length > 0) {
      heading = rows[0];
    }
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }

  if (!heading) {
    redirect("/admin/rate-headings");
  }

  return <EditRateHeadingForm heading={heading} />;
}
