import pool from "@/lib/db";
import { unstable_cache } from "next/cache";

export const getCachedSiteSettings = unstable_cache(
  async () => {
    try {
      const queryPromise = pool.query("SELECT offer_text, offer_enabled FROM site_settings WHERE id = 1");
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1500));
      const [rows]: any = await Promise.race([queryPromise, timeoutPromise]);

      if (!rows || rows.length === 0) {
        return { offer_text: "", offer_enabled: false };
      }

      return {
        offer_text: rows[0].offer_text as string,
        offer_enabled: rows[0].offer_enabled === 1,
      };
    } catch {
      return { offer_text: "", offer_enabled: false };
    }
  },
  ["site-settings"],
  { revalidate: 60, tags: ["site-settings"] }
);
