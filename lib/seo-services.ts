export type SeoService = {
  slug: string;
  name: string;
  shortName: string;
  categoryId: number;
  titleKeyword: string;
  description: (place: string) => string;
  intro: (place: string) => string;
  faqs: (place: string) => { q: string; a: string }[];
};

const PHONE = "9999251966";

export const SEO_SERVICES: SeoService[] = [
  {
    slug: "ro-repair",
    name: "RO Repair and Service",
    shortName: "RO Repair",
    categoryId: 5,
    titleKeyword: "RO Repair and Service",
    description: (place) =>
      `Doorstep RO repair and service in ${place}. Filter change, TDS check, leakage, gas/pump issues and AMC by OMAA technicians. Call ${PHONE}.`,
    intro: (place) =>
      `Need RO repair and service in ${place}? OMAA Company sends a certified technician to your tower for Kent, Livpure, Aquaguard, Pureit, Aquafresh and local RO brands. Filter replacement, low water, leakage, taste/TDS issues and annual maintenance are covered with a 30-day service warranty.`,
    faqs: (place) => [
      {
        q: `Do you repair all RO brands in ${place}?`,
        a: `Yes. We service Kent, Livpure, Aquaguard, Pureit, Aquafresh, Aqua Grand, Havells and most local RO models at your doorstep in ${place}.`,
      },
      {
        q: `How fast is RO service in ${place}?`,
        a: `Most RO repair bookings in ${place} get a same-day visit between 8 AM and 8 PM. Call ${PHONE} to confirm the next slot.`,
      },
      {
        q: `Is filter change included with RO repair in ${place}?`,
        a: `Filters are charged as per the live rate card. The technician checks TDS, leakage and filters first, then you approve parts before replacement.`,
      },
    ],
  },
  {
    slug: "refrigerator-repair",
    name: "Refrigerator Repair",
    shortName: "Refrigerator Repair",
    categoryId: 2,
    titleKeyword: "Refrigerator Repair",
    description: (place) =>
      `Refrigerator repair in ${place} for no cooling, noise, leakage and power issues. Single door, double door and inverter fridges. Call ${PHONE}.`,
    intro: (place) =>
      `Book refrigerator repair in ${place} for single-door, double-door, side-by-side and inverter models. OMAA technicians diagnose no cooling, excess cooling, noise, water leakage and door issues at your home with genuine parts and a 30-day warranty.`,
    faqs: (place) => [
      {
        q: `Which fridge brands do you repair in ${place}?`,
        a: `LG, Samsung, Whirlpool, Haier, Godrej, Bosch, Panasonic and most other refrigerator brands are serviced in ${place}.`,
      },
      {
        q: `Can you fix no-cooling the same day in ${place}?`,
        a: `Yes, same-day doorstep diagnosis is available in ${place}. Spare parts, if needed, follow the rate card after your approval.`,
      },
      {
        q: `Do you repair inverter refrigerators in ${place}?`,
        a: `Yes. Inverter, frost-free and direct-cool refrigerators are repaired at home in ${place}.`,
      },
    ],
  },
  {
    slug: "washing-machine-repair",
    name: "Washing Machines Repair",
    shortName: "Washing Machine Repair",
    categoryId: 3,
    titleKeyword: "Washing Machine Repair",
    description: (place) =>
      `Washing machine repair in ${place} for top load, front load and semi-automatic machines. Noise, drain, spin and power issues. Call ${PHONE}.`,
    intro: (place) =>
      `Get washing machine repair in ${place} for top-load, front-load and semi-automatic machines. We fix not spinning, not draining, noise, leakage and power issues, plus jet cleaning, with genuine parts and a 30-day service warranty.`,
    faqs: (place) => [
      {
        q: `Do you repair front load and top load machines in ${place}?`,
        a: `Yes. Front load, top load and semi-automatic washing machines are repaired at your doorstep in ${place}.`,
      },
      {
        q: `Is washing machine jet service available in ${place}?`,
        a: `Yes. Deep jet cleaning and breakdown repair are both available for residents of ${place}.`,
      },
      {
        q: `Which washing machine brands do you cover in ${place}?`,
        a: `LG, Samsung, Whirlpool, IFB, Bosch, Haier and most other brands are serviced in ${place}.`,
      },
    ],
  },
];

const SERVICE_BY_SLUG = new Map(SEO_SERVICES.map((s) => [s.slug, s]));

const SERVICE_ALIASES: Record<string, string> = {
  "ro-repair-and-service": "ro-repair",
  "ro-repair-service": "ro-repair",
  "water-purifier-repair": "ro-repair",
  "fridge-repair": "refrigerator-repair",
  "refrigerator-repair-service": "refrigerator-repair",
  "washing-machines-repair": "washing-machine-repair",
  "washing-machine-repair-service": "washing-machine-repair",
};

export function getSeoService(slug: string): SeoService | undefined {
  const key = slug.toLowerCase();
  return SERVICE_BY_SLUG.get(SERVICE_ALIASES[key] || key);
}
