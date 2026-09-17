import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function GET() {
  try {
    // 1. Fetch all Rate Card spare parts / items
    const [rateCardRows]: any = await pool.query(`
      SELECT 
        rc.id, 
        rc.part_name as name, 
        rc.price, 
        rc.labour_charges,
        c.title as category_title, 
        h.title as heading_title 
      FROM rate_cards rc
      LEFT JOIN categories c ON rc.category_id = c.id
      LEFT JOIN rate_headings h ON rc.heading_id = h.id
      ORDER BY c.title ASC, h.title ASC, rc.part_name ASC
    `).catch(() => [[]]);

    // 2. Fetch all Services
    const [serviceRows]: any = await pool.query(`
      SELECT 
        s.id, 
        s.title as name, 
        s.price, 
        c.title as category_title
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY c.title ASC, s.title ASC
    `).catch(() => [[]]);

    const formattedRateCards = (rateCardRows || []).map((rc: any) => ({
      id: `rc_${rc.id}`,
      type: "Rate Card / Spare Part",
      name: rc.name,
      price: Number(rc.price || 0),
      labourCharges: Number(rc.labour_charges || 0),
      category: rc.category_title || "General",
      heading: rc.heading_title || "",
      displayName: `${rc.category_title ? `[${rc.category_title}] ` : ""}${rc.heading_title ? `${rc.heading_title} - ` : ""}${rc.name} (₹${rc.price})`,
    }));

    const formattedServices = (serviceRows || []).map((s: any) => ({
      id: `svc_${s.id}`,
      type: "Service",
      name: s.name,
      price: Number(s.price || 0),
      category: s.category_title || "Service",
      heading: "Service",
      displayName: `${s.category_title ? `[${s.category_title}] ` : ""}${s.name} (₹${s.price})`,
    }));

    return NextResponse.json({
      success: true,
      rateCards: formattedRateCards,
      services: formattedServices,
      allItems: [...formattedRateCards, ...formattedServices],
    });
  } catch (error: any) {
    console.error("Failed to load rate cards:", error);
    return NextResponse.json(
      { success: false, error: error.message, rateCards: [], services: [], allItems: [] },
      { status: 500 }
    );
  }
}
