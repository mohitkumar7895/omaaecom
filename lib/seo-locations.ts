export type SeoLocation = {
  slug: string;
  title: string;
  region: string;
  intro: string;
  faqs: { q: string; a: string }[];
};

const PHONE = "9999251966";

function faqsFor(place: string): { q: string; a: string }[] {
  return [
    {
      q: `Do you provide RO, fridge and washing machine repair in ${place}?`,
      a: `Yes. OMAA Company provides doorstep RO water purifier repair, refrigerator repair, washing machine repair and AC service in ${place}. Call ${PHONE} to book a same-day visit.`,
    },
    {
      q: `How fast can a technician reach ${place}?`,
      a: `Most bookings in ${place} get a same-day doorstep visit during working hours (8 AM – 8 PM). Emergency slots depend on technician availability.`,
    },
    {
      q: `Is there a warranty on repairs in ${place}?`,
      a: `Yes. Completed repairs typically include a 30-day service warranty. Spare parts and labour follow the published rate card.`,
    },
    {
      q: `Which appliance brands do you service in ${place}?`,
      a: `We service Kent, Livpure, Aquaguard, Pureit, LG, Samsung, Whirlpool, Haier, Voltas, Godrej and most local RO and appliance brands in ${place}.`,
    },
  ];
}

export const SEO_LOCATIONS: SeoLocation[] = [
  {
    slug: "noida",
    title: "Noida",
    region: "Uttar Pradesh",
    intro:
      "Book certified doorstep appliance repair in Noida for RO water purifiers, refrigerators, washing machines and ACs. OMAA technicians serve Sector 1–168, Noida Extension and nearby societies with upfront pricing and a 30-day service warranty.",
    faqs: faqsFor("Noida"),
  },
  {
    slug: "delhi",
    title: "Delhi",
    region: "Delhi",
    intro:
      "Doorstep RO, refrigerator, washing machine and AC repair across Delhi. OMAA Company sends verified technicians to your home with transparent rates and genuine spare parts.",
    faqs: faqsFor("Delhi"),
  },
  {
    slug: "greater-noida",
    title: "Greater Noida",
    region: "Uttar Pradesh",
    intro:
      "Same-day appliance repair in Greater Noida for RO purifiers, fridges, washing machines and ACs. Serving Greater Noida West, Knowledge Park, Pari Chowk and nearby sectors.",
    faqs: faqsFor("Greater Noida"),
  },
  {
    slug: "ghaziabad",
    title: "Ghaziabad",
    region: "Uttar Pradesh",
    intro:
      "RO, refrigerator, washing machine and AC doorstep repair in Ghaziabad, including Indirapuram, Vaishali, Vasundhara and Crossing Republik.",
    faqs: faqsFor("Ghaziabad"),
  },
  {
    slug: "gurgaon",
    title: "Gurgaon",
    region: "Haryana",
    intro:
      "Book doorstep appliance repair in Gurgaon (Gurugram) for RO service, fridge repair, washing machine jet service and AC maintenance.",
    faqs: faqsFor("Gurgaon"),
  },
  {
    slug: "gurugram",
    title: "Gurugram",
    region: "Haryana",
    intro:
      "Certified doorstep RO, refrigerator, washing machine and AC repair in Gurugram with same-day technician visits.",
    faqs: faqsFor("Gurugram"),
  },
  {
    slug: "noida-extension",
    title: "Noida Extension",
    region: "Uttar Pradesh",
    intro:
      "Local doorstep repair in Noida Extension and Greater Noida West for water purifiers, refrigerators, washing machines and ACs. Our workshop is near Gaur City 2.",
    faqs: faqsFor("Noida Extension"),
  },
  {
    slug: "greater-noida-west",
    title: "Greater Noida West",
    region: "Uttar Pradesh",
    intro:
      "OMAA Company is based in Greater Noida West. Get fast RO, fridge, washing machine and AC repair at your society gate with a 30-day warranty.",
    faqs: faqsFor("Greater Noida West"),
  },
  {
    slug: "gaur-city-2-10th-avenue",
    title: "Gaur City 2 – 10th Avenue",
    region: "Noida Extension",
    intro:
      "Doorstep RO, refrigerator, washing machine and AC repair in Gaur City 2, 10th Avenue. Call 9999251966 for a same-day technician visit.",
    faqs: faqsFor("Gaur City 2, 10th Avenue"),
  },
  {
    slug: "gaur-city-2-11th-avenue",
    title: "Gaur City 2 – 11th Avenue",
    region: "Noida Extension",
    intro:
      "Appliance repair at your doorstep in Gaur City 2, 11th Avenue — RO service, fridge repair, washing machine repair and AC servicing.",
    faqs: faqsFor("Gaur City 2, 11th Avenue"),
  },
  {
    slug: "gaur-city-2-12th-avenue",
    title: "Gaur City 2 – 12th Avenue",
    region: "Noida Extension",
    intro:
      "Book verified technicians for RO, refrigerator, washing machine and AC repair in Gaur City 2, 12th Avenue.",
    faqs: faqsFor("Gaur City 2, 12th Avenue"),
  },
  {
    slug: "gaur-city-2-14th-avenue",
    title: "Gaur City 2 – 14th Avenue",
    region: "Noida Extension",
    intro:
      "Same-day doorstep appliance repair in Gaur City 2, 14th Avenue with upfront rate card pricing and 30-day warranty.",
    faqs: faqsFor("Gaur City 2, 14th Avenue"),
  },
  {
    slug: "gaur-city-2-14th-avenue-phase-1",
    title: "Gaur City 2 – 14th Avenue Phase 1",
    region: "Noida Extension",
    intro:
      "RO, fridge, washing machine and AC repair for residents of Gaur City 2, 14th Avenue Phase 1.",
    faqs: faqsFor("Gaur City 2, 14th Avenue Phase 1"),
  },
  {
    slug: "gaur-city-2-14th-avenue-phase-2",
    title: "Gaur City 2 – 14th Avenue Phase 2",
    region: "Noida Extension",
    intro:
      "Doorstep home appliance repair in Gaur City 2, 14th Avenue Phase 2. Call 9999251966 to book.",
    faqs: faqsFor("Gaur City 2, 14th Avenue Phase 2"),
  },
  {
    slug: "gaur-city-2-16th-avenue",
    title: "Gaur City 2 – 16th Avenue",
    region: "Noida Extension",
    intro:
      "Local technicians for RO service, refrigerator repair, washing machine repair and AC service in Gaur City 2, 16th Avenue.",
    faqs: faqsFor("Gaur City 2, 16th Avenue"),
  },
];

const LOCATION_BY_SLUG = new Map(SEO_LOCATIONS.map((loc) => [loc.slug, loc]));

export function getSeoLocation(slug: string): SeoLocation | undefined {
  return LOCATION_BY_SLUG.get(slug.toLowerCase());
}

export function isIndexableLocation(slug: string): boolean {
  return LOCATION_BY_SLUG.has(slug.toLowerCase());
}

export function locationToCitySlug(city: string): string {
  return city
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function absoluteTitle(title: string) {
  return { absolute: title };
}
