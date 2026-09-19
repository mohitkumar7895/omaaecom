import type { SeoService } from "./seo-services";
import { getSeoService } from "./seo-services";

export type SeoKeywordPage = {
  slug: string;
  title: string;
  description: string;
  locationSlug: string;
  serviceSlug?: string;
};

const PHONE = "9999251966";

export const SEO_KEYWORD_PAGES: SeoKeywordPage[] = [
  {
    slug: "washing-machine-repair-near-me",
    title: "Washing Machine Repair Near Me",
    description: `Washing machine repair near me in Noida and Delhi NCR. Same-day washing machine technician at your doorstep. Call ${PHONE}.`,
    locationSlug: "noida",
    serviceSlug: "washing-machine-repair",
  },
  {
    slug: "refrigerator-repair-near-me",
    title: "Refrigerator Repair Near Me",
    description: `Refrigerator repair near me in Noida. Fridge cooling, noise and leakage fixed by a doorstep technician. Call ${PHONE}.`,
    locationSlug: "noida",
    serviceSlug: "refrigerator-repair",
  },
  {
    slug: "ro-repair-near-me",
    title: "RO Repair Near Me",
    description: `RO repair near me in Noida. Water purifier filter, leakage and TDS service at home. Call ${PHONE}.`,
    locationSlug: "noida",
    serviceSlug: "ro-repair",
  },
  {
    slug: "washing-machine-repair-noida",
    title: "Washing Machine Repair Noida",
    description: `Washing machine repair Noida — top load, front load and semi-automatic. Same-day washing machine service. Call ${PHONE}.`,
    locationSlug: "noida",
    serviceSlug: "washing-machine-repair",
  },
  {
    slug: "refrigerator-repair-noida",
    title: "Refrigerator Repair Noida",
    description: `Refrigerator repair Noida for no cooling, leakage and noise. Fridge repair at your doorstep. Call ${PHONE}.`,
    locationSlug: "noida",
    serviceSlug: "refrigerator-repair",
  },
  {
    slug: "ro-repair-noida",
    title: "RO Repair Noida",
    description: `RO repair Noida — Kent, Livpure, Aquaguard and all brands. Water purifier repair and service at home. Call ${PHONE}.`,
    locationSlug: "noida",
    serviceSlug: "ro-repair",
  },
  {
    slug: "washing-machine-service-near-me",
    title: "Washing Machine Service Near Me",
    description: `Washing machine service near me in Noida. Jet cleaning, spin and drain repair by a local technician. Call ${PHONE}.`,
    locationSlug: "noida",
    serviceSlug: "washing-machine-repair",
  },
  {
    slug: "refrigerator-service-near-me",
    title: "Refrigerator Service Near Me",
    description: `Refrigerator service near me in Noida. Gas, cooling and compressor check at your home. Call ${PHONE}.`,
    locationSlug: "noida",
    serviceSlug: "refrigerator-repair",
  },
  {
    slug: "ro-service-near-me",
    title: "RO Service Near Me",
    description: `RO service near me in Noida. Filter change, TDS and leakage service for all water purifier brands. Call ${PHONE}.`,
    locationSlug: "noida",
    serviceSlug: "ro-repair",
  },
  {
    slug: "fridge-repair-near-me",
    title: "Fridge Repair Near Me",
    description: `Fridge repair near me in Noida. Single door, double door and inverter fridge repair at doorstep. Call ${PHONE}.`,
    locationSlug: "noida",
    serviceSlug: "refrigerator-repair",
  },
  {
    slug: "water-purifier-repair-near-me",
    title: "Water Purifier Repair Near Me",
    description: `Water purifier repair near me in Noida. RO, UV and UF service with genuine filters. Call ${PHONE}.`,
    locationSlug: "noida",
    serviceSlug: "ro-repair",
  },
  {
    slug: "washing-machine-technician-near-me",
    title: "Washing Machine Technician Near Me",
    description: `Book a washing machine technician near me in Noida. Same-day home visit for all brands. Call ${PHONE}.`,
    locationSlug: "noida",
    serviceSlug: "washing-machine-repair",
  },
  {
    slug: "refrigerator-technician-near-me",
    title: "Refrigerator Technician Near Me",
    description: `Refrigerator technician near me in Noida for fridge cooling and gas issues. Call ${PHONE}.`,
    locationSlug: "noida",
    serviceSlug: "refrigerator-repair",
  },
  {
    slug: "ro-technician-near-me",
    title: "RO Technician Near Me",
    description: `RO technician near me in Noida for water purifier repair, filter and TDS service. Call ${PHONE}.`,
    locationSlug: "noida",
    serviceSlug: "ro-repair",
  },
  {
    slug: "home-appliance-repair-noida",
    title: "Home Appliance Repair Noida",
    description: `Home appliance repair Noida — washing machine, refrigerator, fridge and RO water purifier doorstep service. Call ${PHONE}.`,
    locationSlug: "noida",
  },
];

const KEYWORD_BY_SLUG = new Map(SEO_KEYWORD_PAGES.map((p) => [p.slug, p]));

export function getKeywordPage(slug: string): SeoKeywordPage | undefined {
  return KEYWORD_BY_SLUG.get(slug.toLowerCase());
}

export function keywordService(page: SeoKeywordPage): SeoService | undefined {
  return page.serviceSlug ? getSeoService(page.serviceSlug) : undefined;
}

export function keywordFitsLocation(page: SeoKeywordPage, locationSlug: string): boolean {
  if (page.slug.includes("noida")) {
    return locationSlug === "noida";
  }
  return true;
}

export function keywordHeading(page: SeoKeywordPage, locationTitle: string): string {
  if (page.slug.includes("noida") || locationTitle.toLowerCase() === "noida") {
    return page.title;
  }
  return `${page.title} | ${locationTitle}`;
}
