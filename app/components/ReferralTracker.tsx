"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      const ref = searchParams?.get("ref");
      if (ref && typeof ref === "string" && ref.trim()) {
        const cleanRef = ref.trim().toUpperCase();
        // Save to localStorage
        localStorage.setItem("omaa_referral_code", cleanRef);
        // Save to cookie (valid for 30 days)
        document.cookie = `omaa_referral_code=${encodeURIComponent(cleanRef)}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      }
    } catch (e) {
      // Ignore errors in environments where storage/cookies are restricted
    }
  }, [searchParams]);

  return null;
}
