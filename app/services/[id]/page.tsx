import { notFound } from "next/navigation";
import pool from "../../../lib/db";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CategoryView from "./CategoryView";

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const categoryId = resolvedParams.id;
  
  if (!categoryId || isNaN(Number(categoryId))) {
    return notFound();
  }

  try {
    // Fetch Category
    const [catRows]: any = await pool.query("SELECT * FROM categories WHERE id = ?", [categoryId]);
    if (catRows.length === 0) {
      return notFound();
    }
    const category = catRows[0];

    // Fetch Subcategories
    const [subcats]: any = await pool.query("SELECT * FROM subcategories WHERE category_id = ?", [categoryId]);
    
    // Fetch Services
    const [services]: any = await pool.query("SELECT * FROM services WHERE category_id = ?", [categoryId]);

    // Fetch Rate Cards added by Admin for this Category
    const [rateCards]: any = await pool.query(`
      SELECT rc.*, h.title as heading_title 
      FROM rate_cards rc
      LEFT JOIN rate_headings h ON rc.heading_id = h.id
      WHERE rc.category_id = ?
      ORDER BY rc.id ASC
    `, [categoryId]);

    return (
      <main className="min-h-screen bg-white flex flex-col font-sans">
        <Navbar />
        
        {/* Pass data to the Client Component that will handle the layout and interactions */}
        <div className="flex-grow">
          <CategoryView 
            category={category} 
            subcategories={subcats} 
            services={services} 
            rateCards={rateCards}
          />
        </div>
      </main>
    );
  } catch (error) {
    console.error("Database error in CategoryPage:", error);
    return notFound();
  }
}
