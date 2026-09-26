import { unstable_cache } from "next/cache";
import pool from "./db";
import { PUBLIC_IMAGE_SQL, publicAssetUrl } from "./public-media";

export type HomeCatalog = {
  categories: any[];
  desktopBanners: string[];
  mobileBanners: string[];
};

const IMAGE_SQL = PUBLIC_IMAGE_SQL;
const BANNER_SQL = (col: string) =>
  `CASE WHEN ${col} IS NULL OR ${col} LIKE 'data:%' OR CHAR_LENGTH(${col}) > 2048 THEN NULL ELSE ${col} END AS ${col}`;

async function loadHomeCatalog(locationTitle: string): Promise<HomeCatalog> {
  const [
    bResult,
    catResult,
    servicesResult,
    desktopResult,
    mobileResult,
  ] = await Promise.allSettled([
    pool.query(
      "SELECT category, rating FROM bookings WHERE rating IS NOT NULL AND rating > 0 ORDER BY created_at DESC LIMIT 80"
    ),
    locationTitle
      ? pool.query(
          `SELECT id, title, type, ${IMAGE_SQL}, zones_location FROM categories WHERE status = 'Active' AND (zones_location IS NULL OR zones_location = '' OR zones_location LIKE ?)`,
          [`%${locationTitle}%`]
        )
      : pool.query(
          `SELECT id, title, type, ${IMAGE_SQL}, zones_location FROM categories WHERE status = 'Active'`
        ),
    pool.query(
      `SELECT id, category_id, title, rating, reviews, discount, selling_price, original_price, ${IMAGE_SQL} FROM services`
    ),
    pool.query(
      `SELECT ${BANNER_SQL("banner1_url")}, ${BANNER_SQL("banner2_url")}, ${BANNER_SQL("banner3_url")} FROM banners WHERE type = 'desktop' OR type IS NULL ORDER BY created_at DESC LIMIT 1`
    ),
    pool.query(
      `SELECT ${BANNER_SQL("banner1_url")}, ${BANNER_SQL("banner2_url")}, ${BANNER_SQL("banner3_url")} FROM banners WHERE type = 'mobile' ORDER BY created_at DESC LIMIT 1`
    ),
  ]);

  let bookingRatings: any[] = [];
  if (bResult.status === "fulfilled") {
    const [bRows]: any = bResult.value;
    bookingRatings = bRows || [];
  }

  let catRows: any[] = [];
  if (catResult.status === "fulfilled") {
    const [rows]: any = catResult.value;
    catRows = rows || [];
  }

  let allServices: any[] = [];
  if (servicesResult.status === "fulfilled") {
    const [rows]: any = servicesResult.value;
    allServices = rows || [];
  }

  const categories = catRows.map((cat: any) => {
    const services = allServices.filter((s: any) => s.category_id === cat.id);
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
        title: srv.title,
        rating: liveAvg || srv.rating || "4.8",
        reviews: matching.length > 0 ? `${matching.length}+` : srv.reviews || "120+",
        discount: srv.discount,
        selling_price: srv.selling_price,
        original_price: srv.original_price,
        image_url: publicAssetUrl(srv.image_url),
      })),
    };
  });

  const desktopBanners: string[] = [];
  const mobileBanners: string[] = [];

  if (desktopResult.status === "fulfilled") {
    const [desktopRows]: any = desktopResult.value;
    const row = desktopRows?.[0];
    const b1 = publicAssetUrl(row?.banner1_url);
    const b2 = publicAssetUrl(row?.banner2_url);
    const b3 = publicAssetUrl(row?.banner3_url);
    if (b1) desktopBanners.push(b1);
    if (b2) desktopBanners.push(b2);
    if (b3) desktopBanners.push(b3);
  }

  if (mobileResult.status === "fulfilled") {
    const [mobileRows]: any = mobileResult.value;
    const row = mobileRows?.[0];
    const b1 = publicAssetUrl(row?.banner1_url);
    const b2 = publicAssetUrl(row?.banner2_url);
    const b3 = publicAssetUrl(row?.banner3_url);
    if (b1) mobileBanners.push(b1);
    if (b2) mobileBanners.push(b2);
    if (b3) mobileBanners.push(b3);
  }

  return { categories, desktopBanners, mobileBanners };
}

export function getHomeCatalog(locationTitle = "") {
  return unstable_cache(
    () => loadHomeCatalog(locationTitle),
    ["home-catalog-v3", locationTitle || "all"],
    { revalidate: 120, tags: ["home-catalog"] }
  )();
}
