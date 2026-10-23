export type GaurCitySociety = {
  slug: string;
  name: string;
  localityLabel: string;
  isCore: boolean;
  classificationNote: string;
  landmarkContext: string;
  towersOverview?: string;
  coverageNotice: string;
};

export type GaurCityServiceConfig = {
  slug: string;
  name: string;
  shortName: string;
  categoryId: number;
  categorySlug: string;
  commonProblems: { problem: string; reason: string; solution: string }[];
  processSteps: { step: string; title: string; desc: string }[];
  supportedBrands: string[];
  maintenanceTip: string;
};

export const GAUR_CITY_SERVICES: Record<string, GaurCityServiceConfig> = {
  "ro-water-purifier-service": {
    slug: "ro-water-purifier-service",
    name: "RO Repair & Water Purifier Service",
    shortName: "RO Service",
    categoryId: 5,
    categorySlug: "ro-repair",
    maintenanceTip:
      "Greater Noida West groundwater frequently reaches 800 to 1,500+ ppm TDS. Replace sediment and carbon pre-filters every 3 to 6 months to protect the RO membrane from premature scaling.",
    supportedBrands: [
      "Kent",
      "Aquaguard",
      "Livpure",
      "Pureit",
      "Aqua Grand",
      "Havells",
      "AO Smith",
      "Blue Star",
      "Eureka Forbes",
    ],
    commonProblems: [
      {
        problem: "Low Water Flow or Tank Filling Extremely Slow",
        reason:
          "High sediment load in Sector 16C pipelines chokes 5-micron pre-filter candles and carbon blocks.",
        solution:
          "Technician tests input water pressure, replaces choked pre-filters, and checks booster pump bar pressure.",
      },
      {
        problem: "Water Taste Foul or High Output TDS",
        reason:
          "Exhausted RO membrane pores, depleted post-carbon filter, or miscalibrated TDS controller valve.",
        solution:
          "Digital TDS measurement before and after membrane. Genuine 75/80/100 GPD membrane replacement and mineral cartridge reset.",
      },
      {
        problem: "Continuous Drain Water Rejection",
        reason:
          "Faulty Auto-Flush valve, stuck Solenoid Valve (SV), or low booster pressure failing to trigger automatic shutoff.",
        solution:
          "SV valve electrical check, flow-restrictor (FR) matching, and auto-cut float sensor replacement.",
      },
      {
        problem: "Water Leaking from Purifier Cabinet or Connectors",
        reason:
          "Cracked pre-filter housing, damaged 1/4\" push-fit elbow fittings, or high line pressure during morning supply.",
        solution:
          "Heavy-duty food-grade fitting replacement and leak pressure test under operating conditions.",
      },
      {
        problem: "No Power / Purifier Dead",
        reason:
          "Burned 24V/36V SMPS power adapter caused by voltage spikes, or blown internal fuse.",
        solution:
          "Multimeter voltage test and installation of copper-wound, surge-protected SMPS power supply.",
      },
    ],
    processSteps: [
      {
        step: "01",
        title: "Same-Day Doorstep Booking",
        desc: "Book online or call 9999251966 with your tower number and apartment details for a prompt slot.",
      },
      {
        step: "02",
        title: "TDS & Water Diagnostics",
        desc: "Certified technician checks raw input TDS, output purified TDS, pump pressure, and membrane health.",
      },
      {
        step: "03",
        title: "Upfront Rate Card Estimate",
        desc: "Transparent price quote before starting work with zero hidden charges or unapproved part swaps.",
      },
      {
        step: "04",
        title: "Genuine Parts & 30-Day Warranty",
        desc: "High-grade components, full sanitization of storage tank, and digital invoice with 30-day service warranty.",
      },
    ],
  },
  "ac-repair-service": {
    slug: "ac-repair-service",
    name: "AC Repair & Servicing",
    shortName: "AC Repair",
    categoryId: 1,
    categorySlug: "ac-repair-service",
    maintenanceTip:
      "High-rise towers face strong winds and urban dust that coat outdoor condenser coils quickly. Book power jet servicing every 6 months to prevent compressor overheating and reduce power consumption by up to 20%.",
    supportedBrands: [
      "Voltas",
      "Daikin",
      "LG",
      "Samsung",
      "Lloyd",
      "Blue Star",
      "Hitachi",
      "Carrier",
      "Panasonic",
      "Godrej",
      "Haier",
    ],
    commonProblems: [
      {
        problem: "AC Not Cooling / Weak Airflow",
        reason:
          "Choked cooling fins, dust-clogged indoor filters, or low refrigerant gas pressure due to pinhole vibration leaks.",
        solution:
          "High-pressure foam jet wash, temperature delta inspection, nitrogen pressure testing, and refrigerant recharge (R32/R410A).",
      },
      {
        problem: "Indoor Unit Water Dripping on Walls",
        reason:
          "Slime and algae blockage in the indoor condensate drain tray or bent PVC drain pipe routing.",
        solution:
          "Drain line chemical flush, drain tray declogging, and slope readjustment to prevent wall seepage.",
      },
      {
        problem: "Unusual Noise or Vibration from Outdoor Unit",
        reason:
          "Loose balcony mounting brackets, worn motor bearings, or unbalanced condenser fan blades.",
        solution:
          "Bracket reinforcement, anti-vibration rubber pad installation, and fan motor alignment.",
      },
      {
        problem: "AC Tripping MCB or Showing Error Code",
        reason:
          "Inverter PCB circuit failure, compressor capacitor blowout, or electrical short in terminal wiring.",
        solution:
          "Component-level inverter PCB diagnostics, high-grade capacitor replacement, and wiring insulation.",
      },
      {
        problem: "Foul Odor When Air Conditioner Starts",
        reason:
          "Mold and bacterial growth on evaporator coils and wet blower drum from stagnant humidity.",
        solution:
          "Antimicrobial deep foam jet wash, blower wheel disinfection, and air filter sanitization.",
      },
    ],
    processSteps: [
      {
        step: "01",
        title: "Doorstep Slot Confirmation",
        desc: "Direct coordination with society security desk for verified technician entry and tower access.",
      },
      {
        step: "02",
        title: "Multi-Point Diagnostics",
        desc: "Amperage measurement, coil temperature evaluation, blower inspection, and gas gauge pressure verification.",
      },
      {
        step: "03",
        title: "Clean Service with Spill Protection",
        desc: "Protective AC service jacket and drop cloths ensure your walls, floors, and furniture remain clean.",
      },
      {
        step: "04",
        title: "Cooling Verification & 30-Day Cover",
        desc: "Laser thermometer cooling test, digital bill generation, and 30-day workmanship assurance.",
      },
    ],
  },
  "washing-machine-repair": {
    slug: "washing-machine-repair",
    name: "Washing Machine Repair & Service",
    shortName: "Washing Machine Repair",
    categoryId: 3,
    categorySlug: "washing-machine-repair",
    maintenanceTip:
      "Hard water in Greater Noida West leads to calcium scaling on outer drums and heater elements. Run a tub-clean cycle with descaling powder once every month to preserve drum bearings and drive belt life.",
    supportedBrands: [
      "LG",
      "Samsung",
      "Whirlpool",
      "IFB",
      "Bosch",
      "Haier",
      "Godrej",
      "Panasonic",
      "Siemens",
    ],
    commonProblems: [
      {
        problem: "Machine Not Spinning / Drum Stalled",
        reason:
          "Snapped drive belt, worn motor carbon brushes, damaged drum spider arm, or motor capacitor failure.",
        solution:
          "Drive belt replacement, motor winding test, suspension balance alignment, or capacitor replacement.",
      },
      {
        problem: "Water Not Draining / OE / E20 Error",
        reason:
          "Coins, lint, hair pins, or calcified gunk obstructing the drain pump impeller or drain solenoid valve.",
        solution:
          "Drain filter disassembly, pump chamber clearance, impeller test, and drain pipe descaling.",
      },
      {
        problem: "Violent Shaking or Loud Banging Noise during Spin",
        reason:
          "Worn shock absorbers in front loaders, uneven suspension springs in top loaders, or rusted rear tub bearings.",
        solution:
          "Shock absorber replacement, spring tension recalibration, and hydraulic seal bearing overhaul.",
      },
      {
        problem: "Water Leaking from Underneath or Door Bellow",
        reason:
          "Torn door rubber gasket, punctured internal tub hose, or cracked detergent dispenser box.",
        solution:
          "Original door seal (gasket) installation, hose clamp tightening, and pressure switch check.",
      },
      {
        problem: "PCB Display Blank or Program Buttons Unresponsive",
        reason:
          "Power surges damaging the main control motherboard or moisture ingress behind tactile switch buttons.",
        solution:
          "Motherboard micro-soldering, relay replacement, and moisture-barrier protective silicone reseal.",
      },
    ],
    processSteps: [
      {
        step: "01",
        title: "Schedule Your Technician",
        desc: "Choose your preferred morning or evening slot. Technicians carry standard repair kits right to your flat.",
      },
      {
        step: "02",
        title: "On-Site Mechanical & Electrical Test",
        desc: "Thorough inspection of water inlet solenoid, drain pump, drum bearings, belt tension, and PCB circuits.",
      },
      {
        step: "03",
        title: "Transparent Quotation",
        desc: "All repair and spare part costs explained beforehand according to OMAA's standard published rate card.",
      },
      {
        step: "04",
        title: "Cycle Test & 30-Day Guarantee",
        desc: "Full wash and spin cycle tested before handover with an official 30-day service warranty on repairs.",
      },
    ],
  },
};

export const GAUR_CITY_SOCIETIES: GaurCitySociety[] = [
  {
    slug: "10th-avenue",
    name: "10th Avenue / Sanskriti Vihar",
    localityLabel: "Gaur City 2, Sector 16C, Noida Extension (Greater Noida West)",
    isCore: true,
    classificationNote: "Core Gaur City 2 residential avenue",
    landmarkContext: "Beside Sanskriti Vihar, Sector 16C",
    towersOverview: "Multi-tower residential complex with both high-rise flats and gated avenues.",
    coverageNotice: "Immediate same-day doorstep service available for all towers in 10th Avenue.",
  },
  {
    slug: "11th-avenue",
    name: "11th Avenue",
    localityLabel: "Gaur City 2, Sector 16C, Noida Extension (Greater Noida West)",
    isCore: true,
    classificationNote: "Core Gaur City 2 residential avenue",
    landmarkContext: "Next to 12th Avenue inside Gaur City 2, Sector 16C",
    towersOverview: "Extensive multi-tower society with high customer density and family residences.",
    coverageNotice: "Our resident technicians cover 11th Avenue with 60 to 90 minute response times.",
  },
  {
    slug: "12th-avenue",
    name: "12th Avenue",
    localityLabel: "Gaur City 2, Sector 16C, Noida Extension (Greater Noida West)",
    isCore: true,
    classificationNote: "Core Gaur City 2 residential complex",
    landmarkContext: "Near the commercial high street & Gaur City 2 stadium approach",
    towersOverview: "High-rise apartments requiring specialized high-floor AC and appliance tools.",
    coverageNotice: "Daily technician presence inside 12th Avenue for prompt doorstep appointments.",
  },
  {
    slug: "14th-avenue-phase-1",
    name: "14th Avenue – Phase I",
    localityLabel: "Gaur City 2, Sector 16C, Noida Extension (Greater Noida West)",
    isCore: true,
    classificationNote: "Core Gaur City 2 prominent high-rise phase",
    landmarkContext: "Sector 16C central avenue road with direct society gate entry",
    towersOverview: "Large residential towers with active families needing reliable maintenance support.",
    coverageNotice: "Verified technicians registered for swift gate security clearance in 14th Avenue Phase 1.",
  },
  {
    slug: "14th-avenue-phase-2",
    name: "14th Avenue – Phase II",
    localityLabel: "Gaur City 2, Sector 16C, Noida Extension (Greater Noida West)",
    isCore: true,
    classificationNote: "Core Gaur City 2 phase extension",
    landmarkContext: "Adjacent to Phase 1 within Sector 16C residential enclosure",
    towersOverview: "Dedicated phase towers sharing comprehensive township amenities.",
    coverageNotice: "Same-day doorstep repair slots available across all blocks in 14th Avenue Phase 2.",
  },
  {
    slug: "16th-avenue",
    name: "16th Avenue",
    localityLabel: "Gaur City 2, Sector 16C, Noida Extension (Greater Noida West)",
    isCore: true,
    classificationNote: "Core Gaur City 2 large residential avenue",
    landmarkContext: "Close to Gaur City 2 exit routes and green park belts",
    towersOverview: "Expansive residential society with round-the-clock water and power infrastructure.",
    coverageNotice: "Full doorstep support for RO, washing machine, and AC repair in 16th Avenue.",
  },
  {
    slug: "white-orchid",
    name: "White Orchid",
    localityLabel: "Gaur City 2 / Sector 16C, Noida Extension (Greater Noida West)",
    isCore: true,
    classificationNote: "Luxury high-rise society inside Gaur City 2 perimeter",
    landmarkContext: "Sector 16C near Gaur City 2, 12th Avenue junction",
    towersOverview: "Premium multi-tower gated society with modern apartment layouts.",
    coverageNotice: "Dedicated technicians equipped with original brand spare parts for White Orchid residents.",
  },
  {
    slug: "divyansh-flora",
    name: "Divyansh Flora",
    localityLabel: "Sector 16C, Noida Extension (Near Gaur City 2)",
    isCore: false,
    classificationNote: "Standalone residential society neighboring Gaur City 2",
    landmarkContext: "Sector 16C link road, near Gaur City 2 boundary",
    towersOverview: "Gated community with dedicated family apartments and local market access.",
    coverageNotice: "Technicians reach Divyansh Flora flats quickly from our local Sector 16C hub.",
  },
  {
    slug: "mahagun-mywoods",
    name: "Mahagun Mywoods",
    localityLabel: "Sector 16C, Noida Extension (Opposite Gaur City 2)",
    isCore: false,
    classificationNote: "Major standalone township opposite Gaur City 2",
    landmarkContext: "Directly opposite Gaur City 2 across the main Sector 16C road",
    towersOverview: "Massive residential township comprising multiple phases and hundreds of families.",
    coverageNotice: "OMAA workshop is situated opposite Mahagun Mywoods for immediate doorstep service.",
  },
  {
    slug: "palm-olympia",
    name: "Palm Olympia",
    localityLabel: "Sector 16C, Noida Extension (Near Gaur City 2)",
    isCore: false,
    classificationNote: "Prime standalone residential society in Sector 16C vicinity",
    landmarkContext: "Located on main Greater Noida West / Noida Extension corridor near Gaur City 2",
    towersOverview: "Extensive multi-block residential towers with lush sports and living facilities.",
    coverageNotice: "Full same-day technician dispatch available for Palm Olympia apartments.",
  },
  {
    slug: "vvip-homes",
    name: "VVIP Homes",
    localityLabel: "Sector 16C area, Noida Extension (Near Gaur City 2)",
    isCore: false,
    classificationNote: "Gated residential development neighboring Gaur City 2",
    landmarkContext: "Sector 16C with rapid access to Gaur City circle",
    towersOverview: "Quality mid-to-high rise towers with active resident welfare associations.",
    coverageNotice: "Book verified doorstep technicians for VVIP Homes with zero travel surcharges.",
  },
  {
    slug: "galaxy-north-avenue-2",
    name: "Galaxy North Avenue 2",
    localityLabel: "Near Gaur Chowk / Gaur City 2, Noida Extension",
    isCore: false,
    classificationNote: "Established residential enclave near Gaur City entrance",
    landmarkContext: "Positioned close to the Gaur Chowk / Sector 16C crossover",
    towersOverview: "Dense family residences with high frequency appliance usage.",
    coverageNotice: "Complete coverage for all water purifier, AC, and washing machine models.",
  },
  {
    slug: "gaur-smart-homes",
    name: "Gaur Smart Homes",
    localityLabel: "Sector 16C, Noida Extension (Greater Noida West)",
    isCore: false,
    classificationNote: "Residential development project near Gaur City 2",
    landmarkContext: "Within Sector 16C residential sector",
    towersOverview: "Modern apartments designed for compact efficient family living.",
    coverageNotice: "On-call doorstep appliance servicing with transparent rate cards.",
  },
  {
    slug: "gaur-city-arcade",
    name: "Gaur City Arcade",
    localityLabel: "Sector 16B / Sector 16C, Noida Extension",
    isCore: false,
    classificationNote: "Mixed-use commercial and residential hub in Gaur City cluster",
    landmarkContext: "Commercial and studio apartment center catering to shoppers and residents",
    towersOverview: "Commercial retail outlets and residential units requiring AC & appliance maintenance.",
    coverageNotice: "Commercial and residential appliance diagnostics with official business invoicing.",
  },
];

const SOCIETY_BY_SLUG = new Map(GAUR_CITY_SOCIETIES.map((s) => [s.slug, s]));

export function getGaurCitySociety(slug: string): GaurCitySociety | undefined {
  if (!slug) return undefined;
  return SOCIETY_BY_SLUG.get(slug.toLowerCase());
}

export function isGaurCitySociety(slug: string): boolean {
  if (!slug) return false;
  return SOCIETY_BY_SLUG.has(slug.toLowerCase());
}

export function getGaurCityService(slug: string): GaurCityServiceConfig | undefined {
  if (!slug) return undefined;
  const key = slug.toLowerCase();
  if (key === "ro-water-purifier-service" || key === "ro-repair" || key === "ro-repair-service") {
    return GAUR_CITY_SERVICES["ro-water-purifier-service"];
  }
  if (key === "ac-repair-service" || key === "ac-repair" || key === "ac-service") {
    return GAUR_CITY_SERVICES["ac-repair-service"];
  }
  if (key === "washing-machine-repair" || key === "washing-machines-repair") {
    return GAUR_CITY_SERVICES["washing-machine-repair"];
  }
  return undefined;
}

export function getGaurCityPageSeo(societySlug?: string, serviceSlug?: string) {
  const society = societySlug ? getGaurCitySociety(societySlug) : undefined;
  const service = serviceSlug ? getGaurCityService(serviceSlug) : undefined;

  if (society && service) {
    if (service.slug === "ro-water-purifier-service") {
      return {
        title: `RO Repair & Water Purifier Service in ${society.name} | OMAA Company`,
        description: `RO repair in ${society.name}: water purifier diagnosis, filter/membrane replacement, installation and maintenance by OMAA Company. Confirm availability and charges.`,
        h1: `RO Repair & Water Purifier Service in ${society.name}, Greater Noida West`,
        keywords: [
          `RO repair in ${society.name}`,
          `water purifier service ${society.name}`,
          `RO filter replacement ${society.name}`,
          `RO installation ${society.name}`,
          society.name,
          "Gaur City 2",
          "OMAA Company",
        ],
      };
    }
    if (service.slug === "ac-repair-service") {
      return {
        title: `AC Repair & Service in ${society.name} | OMAA Company`,
        description: `Need AC repair in ${society.name}? OMAA Company helps with cooling issues, water leakage, installation and maintenance. Confirm appointment availability and charges.`,
        h1: `AC Repair & Service in ${society.name}, Greater Noida West`,
        keywords: [
          `AC repair in ${society.name}`,
          `AC service ${society.name}`,
          `split AC repair ${society.name}`,
          `AC installation ${society.name}`,
          society.name,
          "Gaur City 2",
          "OMAA Company",
        ],
      };
    }
    return {
      title: `Washing Machine Repair in ${society.name} | OMAA Company`,
      description: `Need washing machine repair in ${society.name}? OMAA Company helps diagnose top-load, front-load and semi-automatic machine issues. Confirm availability and charges.`,
      h1: `Washing Machine Repair in ${society.name}, Greater Noida West`,
      keywords: [
        `washing machine repair in ${society.name}`,
        `washing machine service ${society.name}`,
        `front load repair ${society.name}`,
        `top load repair ${society.name}`,
        society.name,
        "Gaur City 2",
        "OMAA Company",
      ],
    };
  }

  if (society) {
    return {
      title: `Appliance Repair in ${society.name} | RO, AC & Washing Machine | OMAA Company`,
      description: `Doorstep appliance repair in ${society.name}, ${society.localityLabel}. Same-day RO service, AC repair & washing machine maintenance with 30-day warranty. Call 9999251966.`,
      h1: `Doorstep Appliance Repair in ${society.name}`,
      keywords: [
        `Appliance repair ${society.name}`,
        `RO service ${society.name}`,
        `AC repair ${society.name}`,
        `Washing machine repair ${society.name}`,
        society.name,
        "Gaur City 2",
        "OMAA Company",
      ],
    };
  }

  return {
    title: "Appliance Repair in Gaur City 2, Greater Noida West | OMAA Company",
    description:
      "Doorstep RO water purifier repair, AC service & washing machine repair across Gaur City 2 and Sector 16C. Upfront rate card & 30-day warranty. Call 9999251966.",
    h1: "Doorstep Appliance Repair in Gaur City 2, Greater Noida West",
    keywords: [
      "Appliance Repair Gaur City 2",
      "RO Repair Gaur City 2",
      "AC Repair Gaur City 2",
      "Washing Machine Repair Gaur City 2",
      "Gaur City 2 Sector 16C",
      "OMAA Company",
    ],
  };
}

export const GAUR_CITY_GENERAL_FAQS = [
  {
    q: "How fast can an OMAA technician reach my flat in Gaur City 2?",
    a: "Because our workshop and technicians are locally based in Sector 16C Greater Noida West, most society bookings in Gaur City 2 receive doorstep service within 60 to 90 minutes between 8:00 AM and 8:00 PM.",
  },
  {
    q: "Do your technicians carry ID and clear society security gates?",
    a: "Yes. All OMAA service engineers carry official company identification, wear company uniforms, and comply with society visitor entry rules via MyGate, NoBrokerHood, or gate registers.",
  },
  {
    q: "What is your warranty policy on repairs in Gaur City 2?",
    a: "All completed repair work, electrical component fixes, and spare parts replacements are backed by our standard 30-day service warranty. You receive an official digital invoice.",
  },
  {
    q: "How do your charges compare with local unverified mechanics?",
    a: "We follow a strictly published, upfront rate card. Our visiting and diagnostic charges start at just ₹149. You receive a complete price quote before any repair begins, preventing surprise charges.",
  },
  {
    q: "Which appliances do you repair in Gaur City 2 and nearby Sector 16C societies?",
    a: "We specialize in RO water purifiers, air conditioners (split & window), washing machines (front-load & top-load), refrigerators, and comprehensive annual maintenance contracts (AMC).",
  },
];

