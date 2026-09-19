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
    getSiteSettings()
      .then((settings) => {
        if (cancelled) return;
        setText(settings.offer_text || "");
        setEnabled(Boolean(settings.offer_enabled));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (pathname?.startsWith("/admin") || !enabled || !text) return null;
  return <OfferMarquee text={text} />;
}
