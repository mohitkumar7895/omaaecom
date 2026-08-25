import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import NewProductsSection from "../components/NewProductsSection";
import HomeCategoryStream from "../components/HomeCategoryStream";
import Footer from "../components/Footer";
import pool from "../../lib/db";
import { getAllZones } from "../actions/zones";

// Cache the page for 60 seconds (Incremental Static Regeneration) for fast loading
export const revalidate = 60;

export default async function Home() {
  let categories: any[] = [];
  let banners: any[] = [];
  let zones: any[] = [];

  try {
    // Fetch categories and their associated services
    const [catRows]: any = await pool.query("SELECT * FROM categories WHERE status = 'Active'");
    
    // For each category, fetch its services
    categories = await Promise.all(
      catRows.map(async (cat: any) => {
        const [services]: any = await pool.query("SELECT * FROM services WHERE category_id = ?", [cat.id]);
        return {
          ...cat,
          services: services,
        };
      })
    );

    // Fetch banners
    const [bannerRows]: any = await pool.query("SELECT * FROM banners ORDER BY created_at DESC");
    
    bannerRows.forEach((row: any) => {
      if (row.banner1_url) banners.push(row.banner1_url);
      if (row.banner2_url) banners.push(row.banner2_url);
      if (row.banner3_url) banners.push(row.banner3_url);
    });

    // Fetch Zones for dynamic location filtering
    zones = await getAllZones();
  } catch (error) {
    console.error("Database connection error on Home page:", error);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <Hero categories={categories} banners={banners} />
      
      {/* New Products Section above RO AMC */}
      <NewProductsSection />
      
      {/* Exact Order: RO AMC -> Banner 1 -> AC Repair -> Refrigerator -> Banner 2 -> Washing Machine -> Microwave -> Banner 3 -> Water Purifier with Zone Filtering */}
      <HomeCategoryStream 
        initialCategories={categories} 
        banners={banners} 
        zones={zones} 
      />
      
      {/* Footer is rendered strictly on the Home Page */}
      <Footer />
    </main>
  );
}
