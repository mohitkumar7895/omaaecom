import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import PromoBanner from "./components/PromoBanner";
import NewProductsSection from "./components/NewProductsSection";
import CategoryGrid from "./components/CategoryGrid";
import ImageBanner from "./components/ImageBanner";
import Footer from "./components/Footer";
import pool from "../lib/db";

// Cache the page for 60 seconds (Incremental Static Regeneration) for fast loading
export const revalidate = 60;

export default async function Home() {
  let categories: any[] = [];
  let banners: any[] = [];

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

    // Fetch banners (the new schema groups them in 3s)
    const [bannerRows]: any = await pool.query("SELECT * FROM banners ORDER BY created_at DESC");
    
    // Flatten the banners into a single array for rendering between categories
    bannerRows.forEach((row: any) => {
      if (row.banner1_url) banners.push(row.banner1_url);
      if (row.banner2_url) banners.push(row.banner2_url);
      if (row.banner3_url) banners.push(row.banner3_url);
    });
  } catch (error) {
    console.error("Database connection failed or tables missing:", error);
    // Silent fail so page renders empty sections rather than crashing
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <Hero categories={categories} />
      <NewProductsSection />
      
      {/* Dynamic Content Stream from Admin DB */}
      <div className="mt-4 mb-20">
        {categories.map((category: any, index: number) => (
          <div key={`cat-${index}`}>
            <CategoryGrid 
              title={category.title} 
              services={category.services} 
            />
            {/* Inject a banner image after every category if available */}
            {banners[index] && (
              <div className="max-w-7xl mx-auto px-8 py-8 my-8">
                <div className="w-full relative rounded-3xl overflow-hidden shadow-lg bg-gray-50 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={banners[index]} alt="Promo Banner" className="w-full h-auto object-contain max-h-[500px]" />
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Render any remaining banners at the bottom */}
        {banners.slice(categories.length).map((bannerUrl: string, index: number) => (
          <div key={`extra-banner-${index}`} className="max-w-7xl mx-auto px-8 py-8 my-8">
            <div className="w-full relative rounded-3xl overflow-hidden shadow-lg bg-gray-50 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bannerUrl} alt="Promo Banner" className="w-full h-auto object-contain max-h-[500px]" />
            </div>
          </div>
        ))}
      </div>
      
      <Footer />
    </main>
  );
}
