"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pushToDataLayer, trackPhoneClick } from "@/lib/gtm";

export default function GoogleTagTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);

  // Track SPA client-side route transitions without duplicating initial GTM pageview
  useEffect(() => {
    if (!pathname) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const queryString = searchParams?.toString();
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname;

    pushToDataLayer({
      event: "virtual_page_view",
      page_path: fullPath,
      page_location: typeof window !== "undefined" ? window.location.href : fullPath,
      page_title: typeof document !== "undefined" ? document.title : "",
    });
  }, [pathname, searchParams]);

  // Global capture listener for all tel: phone-number clicks across the entire site
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const telLink = target.closest('a[href^="tel:"]') as HTMLAnchorElement | null;
      if (!telLink) return;

      if (window.location.pathname.startsWith("/admin")) return;

      const href = telLink.getAttribute("href") || "";
      const phoneNumber = href.replace(/^tel:/i, "").trim();
      const linkText = (telLink.textContent || "").trim();

      trackPhoneClick({
        phoneNumber,
        linkText,
        pagePath: window.location.pathname,
      });
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, []);

  return null;
}

