"use client";

import CategoryGrid, { ServiceItem } from "./CategoryGrid";

const FALLBACK_PRODUCTS: ServiceItem[] = [
  {
    id: 50,
    category_id: 6,
    title: "Modern White & Silver RO Purifier",
    original_price: 7999,
    selling_price: 6999,
    rating: "4.9",
    image_url: "https://nyonmwpxzzwkhwylxkcs.supabase.co/storage/v1/object/public/omaa-images/services/1792992054159-Modern-White-and-Silver-Water-Purifier-auto-sized.webp",
  },
  {
    id: 51,
    category_id: 6,
    title: "AQUA One3 Purifier with Chrome Tap",
    original_price: 7999,
    selling_price: 6999,
    rating: "4.9",
    image_url: "https://nyonmwpxzzwkhwylxkcs.supabase.co/storage/v1/object/public/omaa-images/services/1792992148519-AQUA-One3-Purifier-with-Chrome-Tap-auto-sized.webp",
  },
  {
    id: 52,
    category_id: 6,
    title: "Modern Black RO Purifier with Faucet",
    original_price: 8200,
    selling_price: 7200,
    rating: "4.9",
    image_url: "https://nyonmwpxzzwkhwylxkcs.supabase.co/storage/v1/object/public/omaa-images/services/1792992221467-Modern-Black-Water-Purifier-with-Faucet-auto-sized.webp",
  },
];

export default function NewProductsSection({ services = [] }: { services?: ServiceItem[] }) {
  const displayServices = services && services.length > 0 ? services : FALLBACK_PRODUCTS;

  return (
    <section className="w-full">
      <CategoryGrid title="New Products" services={displayServices} />
    </section>
  );
}
