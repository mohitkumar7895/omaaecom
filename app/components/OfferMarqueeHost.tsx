"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import OfferMarquee from "./OfferMarquee";
import { getSiteSettings } from "../actions/settings";

export default function OfferMarqueeHost() {
  const pathname = usePathname();
  const [text, setText] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    let cancelled = false;
    try {
      const cached = sessionStorage.getItem("omaa_offer_marquee");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.at < 5 * 60 * 1000) {
          setText(parsed.text || "");
          setEnabled(Boolean(parsed.enabled));
          return;
        }
      }
    } catch {}
    getSiteSettings()
      .then((settings) => {
        if (cancelled) return;
        const nextText = settings.offer_text || "";
        const nextEnabled = Boolean(settings.offer_enabled);
        setText(nextText);
        setEnabled(nextEnabled);
        try {
          sessionStorage.setItem(
            "omaa_offer_marquee",
            JSON.stringify({ text: nextText, enabled: nextEnabled, at: Date.now() })
          );
        } catch {}
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (pathname?.startsWith("/admin") || !enabled || !text) return null;
  return <OfferMarquee text={text} />;
}
