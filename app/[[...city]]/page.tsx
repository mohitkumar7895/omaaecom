import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import NewProductsSection from "../components/NewProductsSection";
import HomeCategoryStream from "../components/HomeCategoryStream";
import Footer from "../components/Footer";
import pool from "../../lib/db";

// Dynamic rendering to reflect live booking ratings in real time
export const dynamic = 'force-dynamic';

export default async function Home() {
  let categories: any[] = [];
  let desktopBanners: any[] = [];
  let mobileBanners: any[] = [];

  try {
    // Fetch all live ratings from bookings
    let bookingRatings: any[] = [];
    try {
      const [bRows]: any = await pool.query(
        "SELECT category, services, rating FROM bookings WHERE rating IS NOT NULL AND rating > 0"
      );
      bookingRatings = bRows || [];
    } catch (bErr) {
      console.warn("Could not query booking ratings:", bErr);
    }

    // Fetch categories and their associated services
    const [catRows]: any = await pool.query("SELECT * FROM categories WHERE status = 'Active'");
    
    // For each category, fetch its services and calculate live rating
    categories = await Promise.all(
      catRows.map(async (cat: any) => {
        const [services]: any = await pool.query("SELECT * FROM services WHERE category_id = ?", [cat.id]);
        
        const enhancedServices = (services || []).map((srv: any) => {
          // Find matching booking reviews for this service / category
          const matching = bookingRatings.filter((b) => {
            const matchesCategory = b.category && cat.title && b.category.toLowerCase().includes(cat.title.toLowerCase());
            let matchesService = false;
            try {
              if (b.services) {
                const srvStr = typeof b.services === 'string' ? b.services : JSON.stringify(b.services);
                matchesService = srvStr.toLowerCase().includes(srv.title.toLowerCase());
              }
            } catch {}
            return matchesService || matchesCategory;
          });

          if (matching.length > 0) {
            const sum = matching.reduce((acc, curr) => acc + Number(curr.rating || 0), 0);
            const liveAvg = (sum / matching.length).toFixed(1);
            return {
              ...srv,
              rating: liveAvg,
              reviews: `${matching.length}+`,
            };
          }

          return {
            ...srv,
            rating: srv.rating || "4.8",
            reviews: srv.reviews || "120+",
          };
        });

        return {
          ...cat,
          services: enhancedServices,
        };
      })
    );

    // Fetch desktop banners
    const [desktopRows]: any = await pool.query("SELECT * FROM banners WHERE type = 'desktop' OR type IS NULL ORDER BY created_at DESC LIMIT 1");
    if (desktopRows && desktopRows.length > 0) {
      const row = desktopRows[0];
      if (row.banner1_url) desktopBanners.push(row.banner1_url);
      if (row.banner2_url) desktopBanners.push(row.banner2_url);
      if (row.banner3_url) desktopBanners.push(row.banner3_url);
    }

    // Fetch mobile banners
    const [mobileRows]: any = await pool.query("SELECT * FROM banners WHERE type = 'mobile' ORDER BY created_at DESC LIMIT 1");
    if (mobileRows && mobileRows.length > 0) {
      const row = mobileRows[0];
      if (row.banner1_url) mobileBanners.push(row.banner1_url);
      if (row.banner2_url) mobileBanners.push(row.banner2_url);
      if (row.banner3_url) mobileBanners.push(row.banner3_url);
    }

  } catch (error) {
    console.error("Database connection error on Home page:", error);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <Hero categories={categories} banners={mobileBanners.length > 0 ? mobileBanners : desktopBanners} />
      
      {/* New Products Section above RO AMC */}
      <NewProductsSection />
      
      {/* Exact Order: RO AMC -> Banner 1 -> AC Repair -> Refrigerator -> Banner 2 -> Washing Machine -> Microwave -> Banner 3 -> Water Purifier with Zone Filtering */}
      <HomeCategoryStream 
        initialCategories={categories} 
        banners={desktopBanners} 
      />
      
      {/* Footer is rendered strictly on the Home Page */}
      <Footer />
    </main>
  );
}
