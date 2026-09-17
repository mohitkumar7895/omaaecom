import pool from "../../../lib/db";
import { getAllZones } from "../../../app/actions/zones";
import ZoneManager from "./ZoneManager";

export const dynamic = "force-dynamic";

export default async function AdminZonesPage() {
  const zones = await getAllZones();
  
  let categories: any[] = [];
  try {
    const [rows]: any = await pool.query("SELECT id, title, image_url, type FROM categories WHERE status = 'Active'");
    categories = rows;
  } catch (e) {
    console.error("Error fetching categories for zones page:", e);
  }

  return <ZoneManager initialZones={zones} categories={categories} />;
}
