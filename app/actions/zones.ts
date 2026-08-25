"use server";

import pool from "../../lib/db";
import { revalidatePath } from "next/cache";

export interface ZoneData {
  id?: number;
  name: string;
  city_names: string;
  coordinates: any; // { type: "polygon" | "circle", points?: Array<{lat: number, lng: number}>, center?: {lat: number, lng: number}, radiusKm?: number }
  category_ids: number[];
  status: "Active" | "Inactive";
  created_at?: string;
}

async function ensureZonesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_zones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city_names VARCHAR(255) DEFAULT '',
        coordinates JSON NOT NULL,
        category_ids JSON NOT NULL,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error("Failed to ensure service_zones table:", err);
  }
}

export async function getAllZones(): Promise<ZoneData[]> {
  await ensureZonesTable();
  try {
    const [rows]: any = await pool.query("SELECT * FROM service_zones ORDER BY created_at DESC");
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      city_names: row.city_names || "",
      coordinates: typeof row.coordinates === "string" ? JSON.parse(row.coordinates) : row.coordinates,
      category_ids: typeof row.category_ids === "string" ? JSON.parse(row.category_ids) : row.category_ids,
      status: row.status || "Active",
      created_at: row.created_at,
    }));
  } catch (error) {
    console.error("Error fetching zones:", error);
    return [];
  }
}

export async function saveZone(zone: ZoneData) {
  await ensureZonesTable();

  try {
    if (zone.id) {
      // Update
      await pool.query(
        `UPDATE service_zones 
         SET name = ?, city_names = ?, coordinates = ?, category_ids = ?, status = ?
         WHERE id = ?`,
        [
          zone.name,
          zone.city_names || "",
          JSON.stringify(zone.coordinates),
          JSON.stringify(zone.category_ids || []),
          zone.status || "Active",
          zone.id,
        ]
      );
    } else {
      // Insert
      await pool.query(
        `INSERT INTO service_zones (name, city_names, coordinates, category_ids, status)
         VALUES (?, ?, ?, ?, ?)`,
        [
          zone.name,
          zone.city_names || "",
          JSON.stringify(zone.coordinates),
          JSON.stringify(zone.category_ids || []),
          zone.status || "Active",
        ]
      );
    }

    revalidatePath("/admin/zones");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving zone:", error);
    return { success: false, error: error.message || "Failed to save zone" };
  }
}

export async function deleteZone(id: number) {
  await ensureZonesTable();
  try {
    await pool.query("DELETE FROM service_zones WHERE id = ?", [id]);
    revalidatePath("/admin/zones");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting zone:", error);
    return { success: false, error: error.message };
  }
}
