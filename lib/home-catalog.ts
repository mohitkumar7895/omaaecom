import { unstable_cache } from "next/cache";
import pool from "./db";
import { publicAssetUrl } from "./public-media";

export type HomeCatalog = {
  categories: any[];
  desktopBanners: string[];
  mobileBanners: string[];
};

const DESKTOP_BANNERS = [
  "/banners/Banner2-RO-Service.jpg",
  "/banners/Banner3-Home-Services-Doorstep.jpg",
  "/banners/Banner3-Premium-Package.jpg",
];

const MOBILE_BANNERS = [
  "/banners/Mobile-Banner1-AC-3D.jpg",
  "/banners/Mobile-Banner3-Premium-Package-3D.jpg",
  "/banners/Banner2-RO-Service.jpg",
];

async function loadHomeCatalog(): Promise<HomeCatalog> {
  const [catResult, servicesResult] = await Promise.allSettled([
    pool.query("SELECT id, title, type, image_url, zones_location FROM categories WHERE status = 'Active'"),
    pool.query(
      "SELECT id, category_id, subcategory_id, title, original_price, selling_price, rating, warranty_days, short_description, image_url FROM services"
    ),
  ]);

  const catRows = catResult.status === "fulfilled" ? ((catResult.value as any)[0] as any[]) || [] : [];
  const allServices =
    servicesResult.status === "fulfilled" ? ((servicesResult.value as any)[0] as any[]) || [] : [];

  if (servicesResult.status === "rejected") {
    console.error("Home catalog services query failed:", servicesResult.reason);
  }

  const categories = catRows.map((cat: any) => {
    const services = allServices.filter((s: any) => Number(s.category_id) === Number(cat.id));
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
        rating: srv.rating || "4.8",
        reviews: srv.reviews || "120+",
        selling_price: srv.selling_price,
        original_price: srv.original_price,
        warranty_days: srv.warranty_days,
        short_description: srv.short_description,
        image_url: publicAssetUrl(srv.image_url),
      })),
    };
  });

  return {
    categories,
    desktopBanners: [...DESKTOP_BANNERS],
    mobileBanners: [...MOBILE_BANNERS],
  };
}

export function getHomeCatalog(_locationTitle = "") {
  return unstable_cache(() => loadHomeCatalog(), ["home-catalog-v8"], {
    revalidate: 300,
    tags: ["home-catalog"],
  })();
}
