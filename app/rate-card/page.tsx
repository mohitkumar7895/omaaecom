import pool from "../../lib/db";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RateCardClient from "./RateCardClient";

export const dynamic = 'force-dynamic';

export default async function RateCardPage() {
  let categories: any[] = [];
  let rateCards: any[] = [];

  try {
    // 1. Fetch Categories that have rate cards or all categories
    const [catRows]: any = await pool.query("SELECT id, title FROM categories ORDER BY id ASC");
    categories = catRows;

    // 2. Fetch all Rate Cards with heading and category
    const [cardRows]: any = await pool.query(`
      SELECT 
        rc.*, 
        c.title as category_title, 
        h.title as heading_title 
      FROM rate_cards rc
      LEFT JOIN categories c ON rc.category_id = c.id
      LEFT JOIN rate_headings h ON rc.heading_id = h.id
      ORDER BY rc.category_id ASC, rc.heading_id ASC, rc.id ASC
    `);
    rateCards = cardRows;
  } catch (error) {
    console.error("Error loading rate cards page:", error);
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb] flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <RateCardClient categories={categories} initialRateCards={rateCards} />
      </div>
      <Footer />
    </main>
  );
}
