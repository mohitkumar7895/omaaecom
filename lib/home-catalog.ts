import { unstable_cache } from "next/cache";
import pool from "./db";
import { publicAssetUrl } from "./public-media";

export type HomeCatalog = {
  categories: any[];
  desktopBanners: string[];
  mobileBanners: string[];
};

const STATIC_BANNERS = ["/Hero1.webp", "/Hero 2.webp", "/Hero3.webp"];

function bannerUrls(row: any): string[] {
  if (!row?.id) return [];
  const urls: string[] = [];
  if (Number(row.has1)) urls.push(`/api/media/banner/${row.id}/1`);
  if (Number(row.has2)) urls.push(`/api/media/banner/${row.id}/2`);
  if (Number(row.has3)) urls.push(`/api/media/banner/${row.id}/3`);
  return urls;
}

async function loadHomeCatalog(): Promise<HomeCatalog> {
  const [bResult, catResult, servicesResult, desktopResult, mobileResult] = await Promise.allSettled([
    pool.query(
      "SELECT category, rating FROM bookings WHERE rating IS NOT NULL AND rating > 0 ORDER BY created_at DESC LIMIT 80"
    ),
    pool.query("SELECT id, title, type, image_url, zones_location FROM categories WHERE status = 'Active'"),
    pool.query(
      "SELECT id, category_id, subcategory_id, title, original_price, selling_price, rating, warranty_days, short_description, image_url FROM services"
    ),
    pool.query(
      `SELECT id,
        (banner1_url IS NOT NULL AND banner1_url <> '') AS has1,
        (banner2_url IS NOT NULL AND banner2_url <> '') AS has2,
        (banner3_url IS NOT NULL AND banner3_url <> '') AS has3
       FROM banners WHERE type = 'desktop' OR type IS NULL ORDER BY created_at DESC LIMIT 1`
    ),
    pool.query(
      `SELECT id,
        (banner1_url IS NOT NULL AND banner1_url <> '') AS has1,
        (banner2_url IS NOT NULL AND banner2_url <> '') AS has2,
        (banner3_url IS NOT NULL AND banner3_url <> '') AS has3
       FROM banners WHERE type = 'mobile' ORDER BY created_at DESC LIMIT 1`
    ),
  ]);

  const bookingRatings =
    bResult.status === "fulfilled" ? ((bResult.value as any)[0] as any[]) || [] : [];
  const catRows = catResult.status === "fulfilled" ? ((catResult.value as any)[0] as any[]) || [] : [];
  const allServices =
    servicesResult.status === "fulfilled" ? ((servicesResult.value as any)[0] as any[]) || [] : [];

  if (servicesResult.status === "rejected") {
    console.error("Home catalog services query failed:", servicesResult.reason);
  }

  const categories = catRows.map((cat: any) => {
    const services = allServices.filter((s: any) => Number(s.category_id) === Number(cat.id));
    const matching = bookingRatings.filter(
      (b) =>
        b.category &&
        cat.title &&
        String(b.category).toLowerCase().includes(String(cat.title).toLowerCase())
    );
    const liveAvg =
      matching.length > 0
        ? (matching.reduce((acc, curr) => acc + Number(curr.rating || 0), 0) / matching.length).toFixed(1)
        : null;

    return {
      id: cat.id,
      title: cat.title,
      type: cat.type,
      image_url: publicAssetUrl(cat.image_url),
      zones_location: cat.zones_location,
      services: services.map((srv: any) => ({
        id: srv.id,
        category_id: srv.category_id,
        subcategory_id: srv.subcategory_id,
        title: srv.title,
        rating: liveAvg || srv.rating || "4.8",
        reviews: matching.length > 0 ? `${matching.length}+` : "120+",
        selling_price: srv.selling_price,
        original_price: srv.original_price,
        warranty_days: srv.warranty_days,
        short_description: srv.short_description,
        image_url: publicAssetUrl(srv.image_url) || (srv.image_url ? `/api/media/service/${srv.id}` : ""),
      })),
    };
  });

  let desktopBanners =
    desktopResult.status === "fulfilled" ? bannerUrls(((desktopResult.value as any)[0] || [])[0]) : [];
  let mobileBanners =
    mobileResult.status === "fulfilled" ? bannerUrls(((mobileResult.value as any)[0] || [])[0]) : [];

  if (desktopBanners.length === 0) desktopBanners = [...STATIC_BANNERS];
  if (mobileBanners.length === 0) mobileBanners = [...STATIC_BANNERS];

  return { categories, desktopBanners, mobileBanners };
}

export function getHomeCatalog(_locationTitle = "") {
  return unstable_cache(() => loadHomeCatalog(), ["home-catalog-v6"], {
    revalidate: 120,
    tags: ["home-catalog"],
  })();
}
