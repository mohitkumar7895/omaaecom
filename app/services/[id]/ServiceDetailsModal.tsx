import { X, Star, CheckCircle2, Check, FileText, ChevronDown, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

type ServiceDetailsModalProps = {
  service: any;
  categoryName?: string;
  onClose: () => void;
  onAdd: (service: any) => void;
  quantity?: number;
  onRemove?: () => void;
  rateCards?: any[];
};

// Fallback generator for services that don't have custom long_description in DB yet
function getServiceLongDescription(service: any, categoryName?: string): string {
  if (service?.long_description && String(service.long_description).trim().length > 0) {
    return String(service.long_description).trim();
  }

  const title = (service?.title || "").toLowerCase();
  const cat = (categoryName || "").toLowerCase();

  // 1. RO / Water Purifiers
  if (title.includes("ro") || title.includes("purifier") || cat.includes("ro") || cat.includes("water purifier")) {
    return `Complete multi-stage doorstep RO water purifier inspection, filter check, TDS calibration, membrane testing, and internal sanitization. Certified technicians arrive within 60–90 minutes with genuine replacement filters, sediment cartridges, carbon blocks, and booster pumps. Includes our official 45-day service warranty and 90-day spare parts warranty on eligible components.\n\nAll electrical components including SMPS power supply, solenoid valve (SV), float switch, and pressure booster pump undergo thorough multi-point diagnostics. Post-service water quality verification ensures optimal TDS levels and 100% pure, safe drinking water for your household.`;
  }

  // 2. AC / Air Conditioners
  if (title.includes("ac") || title.includes("air conditioner") || cat.includes("ac") || cat.includes("air conditioner")) {
    return `Comprehensive doorstep AC servicing, deep jet cleaning of indoor and outdoor cooling coils, blower wheel sanitization, gas pressure checking, drain pipe unclogging, and electrical capacitor testing. Performed by verified HVAC specialists with advanced pressure pump equipment.\n\nCovers all brands including split, window, and inverter AC units. Our technicians inspect compressor current draw, PCB wiring, remote sensor calibration, and airflow performance to deliver maximum cooling efficiency and lower electricity consumption.`;
  }

  // 3. Refrigerator / Fridge
  if (title.includes("refrigerator") || title.includes("fridge") || cat.includes("refrigerator") || cat.includes("fridge")) {
    return `Expert doorstep refrigerator repair and maintenance for single-door, double-door, side-by-side, and inverter models. Covers compressor diagnosis, eco-friendly refrigerant gas recharging, defrost sensor & timer replacement, thermostat calibration, and cooling coil inspection.\n\nTechnicians test evaporator fan motors, door gasket magnetic seals, condenser coils, and digital inverter PCBs to resolve cooling issues, water leakage, strange noises, and excessive frost buildup with genuine spare parts.`;
  }

  // 4. Washing Machine
  if (title.includes("washing machine") || cat.includes("washing machine") || title.includes("washer")) {
    return `Comprehensive doorstep diagnostic and repair for top-load, front-load, and semi-automatic washing machines. Covers drum bearing inspection, motor testing, drain pump unclogging, PCB error code troubleshooting, and water inlet valve replacement with genuine manufacturer spares.\n\nIncludes dynamic spin-balance testing, drive belt tension adjustment, pulsator cleaning, suspension rod check, and internal tub sanitization to eliminate vibration, drainage failure, water overflow, and motor buzzing.`;
  }

  // 5. Microwave Oven
  if (title.includes("microwave") || cat.includes("microwave") || title.includes("oven")) {
    return `Certified doorstep microwave oven repair covering magnetron testing, high-voltage diode & capacitor replacement, turntable motor repair, touch panel / membrane keypad troubleshooting, and door safety interlock switches.\n\nTechnicians conduct microwave radiation leakage checks, grill/convection heating coil performance audits, and thermostat thermal fuse replacements to ensure 100% safe cooking and heating performance.`;
  }

  // 6. Chimney / Kitchen Appliances
  if (title.includes("chimney") || cat.includes("chimney") || title.includes("hob")) {
    return `Professional doorstep kitchen chimney deep cleaning and motor repair. Covers baffle filter degreasing, carbon filter replacement, suction blower wheel cleaning, touch control switch repair, and duct pipe inspection to restore optimal suction power and smoke elimination.`;
  }

  // 7. Geyser / Water Heater
  if (title.includes("geyser") || cat.includes("geyser") || title.includes("water heater")) {
    return `Complete doorstep geyser repair, heating element descaling, thermostat safety valve inspection, and tank leakage diagnostics. We service instant and storage water heaters across all major brands with genuine heating coils and safety thermostats.`;
  }

  // 8. General Appliance Fallback
  return `Verified doorstep appliance repair and comprehensive diagnostic service for ${service?.title || "your appliance"} by certified OMAA Company technicians. We ensure transparent pricing, genuine replacement spares, upfront rate cards, and post-service warranty documentation on every visit.\n\nAll service procedures adhere strictly to manufacturer safety standards with advance diagnostic tools, verified technician arrival within 60 to 90 minutes, and dedicated customer support assistance.`;
}

export default function ServiceDetailsModal({ service, categoryName, onClose, onAdd, quantity = 0, onRemove, rateCards = [] }: ServiceDetailsModalProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showWarrantyTerms, setShowWarrantyTerms] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const longDescText = getServiceLongDescription(service, categoryName);
  const isLong = longDescText.length > 130 || longDescText.includes("\n") || longDescText.includes("|");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const cat = categoryName || service.category_name || service.category || "";
        const sTitle = service.title || "";
        const res = await fetch(`/api/reviews?category=${encodeURIComponent(cat)}&service=${encodeURIComponent(sTitle)}`);
        if (res.ok) {
          const data = await res.json();
          setReviewsList(data.reviews || []);
          setReviewStats(data.stats || null);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [service, categoryName]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-[95vh] sm:h-[90vh] md:h-[85vh] rounded-t-3xl sm:rounded-3xl md:rounded-2xl flex flex-col relative shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md p-1.5 sm:p-2 rounded-full shadow-md hover:bg-white text-gray-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Full Service Image Container */}
          <div className="w-full bg-slate-100/80 relative overflow-hidden flex items-center justify-center min-h-[220px] sm:min-h-[280px] max-h-[380px] sm:max-h-[440px] p-4 sm:p-6 border-b border-gray-100">
            {service.image_url ? (
              <>
                {/* Soft ambient background glow from image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-2xl opacity-15 scale-110 pointer-events-none"
                  style={{ backgroundImage: `url(${service.image_url})` }}
                  aria-hidden="true"
                />
                <img 
                  src={service.image_url} 
                  alt={service.title} 
                  className="relative z-1 max-w-full max-h-[320px] sm:max-h-[380px] w-auto h-auto object-contain drop-shadow-md rounded-xl" 
                />
              </>
            ) : (
              <div className="w-full h-48 flex items-center justify-center text-gray-400 font-medium text-sm">No Image Available</div>
            )}
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {/* Title & Rating */}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2">{service.title}</h2>
            <div className="flex items-center space-x-1 text-[13px] sm:text-sm text-gray-500 mb-4 sm:mb-5">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="font-bold text-black">{service.rating || '4.8'}</span>
              <span>({service.reviews ? `${service.reviews}` : '0 reviews'})</span>
            </div>

            {/* Long Description Section */}
            <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 sm:p-5 mb-5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#6069c9]" />
                  <span>Long Description</span>
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6069c9] bg-[#eef1fc] px-2.5 py-0.5 rounded-full">
                  Service Details
                </span>
              </div>

              {/* Text Container with first few lines visible */}
              <div className="relative">
                <div
                  className={`text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2 transition-all duration-300 ${
                    !isDescriptionExpanded && isLong ? "max-h-[72px] sm:max-h-[82px] overflow-hidden" : ""
                  }`}
                >
                  {longDescText.includes("|") ? (
                    <ul className="space-y-1.5 list-disc pl-4">
                      {longDescText.split("|").map((item: string, idx: number) => (
                        <li key={idx} className="leading-snug">{item.trim()}</li>
                      ))}
                    </ul>
                  ) : (
                    longDescText.split(/\n\s*\n|\r\n\r\n|\n|\r\n/).map((para: string, idx: number) => (
                      <p key={idx}>{para.trim()}</p>
                    ))
                  )}
                </div>

                {/* Subtle gradient fade overlay when collapsed */}
                {!isDescriptionExpanded && isLong && (
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent pointer-events-none" />
                )}
              </div>

              {/* Read More / Read Less Toggle */}
              {isLong && (
                <button
                  type="button"
                  onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#6069c9] hover:text-[#4a52a3] transition cursor-pointer select-none"
                >
                  <span>{isDescriptionExpanded ? "Read Less" : "Read More"}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isDescriptionExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
            </div>

            {/* OMAA Company Official Warranty Policy Section */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 mb-5 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-1">
                    OMAA Warranty Policy
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    Official Warranty Coverage
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    At OMAA Company, we are committed to delivering reliable repair services and quality workmanship. To ensure customer confidence and peace of mind, we offer the following warranty coverage:
                  </p>

                  {/* 2 Warranty Cards */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-white border border-emerald-200/80 shadow-xs">
                      <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                        1. Repair & Service Warranty
                      </div>
                      <div className="text-lg font-black text-slate-900 mt-0.5">45 Days</div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                        Enjoy a 45-day warranty on eligible repair and service work from the date of service completion. Covers the specific repair performed against the same issue.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-emerald-200/80 shadow-xs">
                      <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide">
                        2. Spare Parts Warranty
                      </div>
                      <div className="text-lg font-black text-slate-900 mt-0.5">90 Days</div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                        Eligible spare parts supplied and installed by OMAA Company are covered by a 90-day warranty from the date of installation.
                      </p>
                    </div>
                  </div>

                  {/* Expandable / Accordion for Terms & Conditions and Commitment */}
                  <div className="mt-3 pt-3 border-t border-emerald-200/70">
                    <button
                      type="button"
                      onClick={() => setShowWarrantyTerms((prev) => !prev)}
                      className="w-full flex items-center justify-between text-xs font-bold text-slate-800 hover:text-emerald-700 transition cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>Warranty Terms & Conditions</span>
                        <span className="text-[10px] font-normal text-slate-500">
                          {showWarrantyTerms ? "(Click to hide)" : "(Click to view details)"}
                        </span>
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                          showWarrantyTerms ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showWarrantyTerms && (
                      <div className="mt-2.5 space-y-2.5 text-[11px] text-slate-600 bg-white/90 p-3.5 rounded-xl border border-emerald-100 animate-in fade-in duration-150">
                        <ul className="space-y-1.5 list-disc pl-4 leading-relaxed">
                          <li>Warranty applies only to the specific repair work or spare parts mentioned in the service invoice.</li>
                          <li>New or unrelated technical issues are not covered under the existing repair warranty.</li>
                          <li>Damage caused by misuse, accidents, voltage fluctuations, water damage or unauthorized repairs is excluded.</li>
                          <li>Normal wear and tear and consumable items are not covered unless specifically mentioned.</li>
                          <li>Warranty claims are subject to inspection and verification by OMAA Company&apos;s service team.</li>
                          <li>Original service invoice or valid booking details are required for warranty claims.</li>
                        </ul>
                        <div className="pt-2.5 border-t border-slate-100">
                          <strong className="text-slate-800 block mb-0.5">Our Commitment:</strong>
                          <p className="leading-relaxed">
                            Your trust matters to us. OMAA Company strives to provide dependable service, transparent processes and a better customer experience with every service visit.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Clean 'Rate Cards' Button that redirects to the separate page */}
            <div className="mb-6">
              <Link 
                href={`/rate-card?cat_ref_id=${service?.category_id || 1}`}
                className="w-full flex items-center justify-between bg-[#1e293b] hover:bg-[#0f172a] text-white font-bold py-3.5 px-5 rounded-2xl transition shadow-sm group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-extrabold tracking-wide">Rate Cards</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-300 font-medium group-hover:text-white">View Pricing</span>
                  <span className="text-gray-400 group-hover:translate-x-0.5 transition-transform text-base">→</span>
                </div>
              </Link>
            </div>



            {/* How it works */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 inline-block mb-6 border-b-2 border-purple-500 pb-1">
                How it works
              </h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-[#6069c9] text-white font-bold text-sm shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">1</div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 shadow-sm bg-white ml-4 md:ml-0">
                    <h4 className="font-bold text-slate-900">Book your service</h4>
                    <p className="text-sm text-slate-500">Select date and time slot</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-[#6069c9] text-white font-bold text-sm shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">2</div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 shadow-sm bg-white ml-4 md:ml-0">
                    <h4 className="font-bold text-slate-900">Professional arrives</h4>
                    <p className="text-sm text-slate-500">Verified and trained expert</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-[#6069c9] text-white font-bold text-sm shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">3</div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 shadow-sm bg-white ml-4 md:ml-0">
                    <h4 className="font-bold text-slate-900">Service completed</h4>
                    <p className="text-sm text-slate-500">Quality assured work</p>
                  </div>
                </div>

              </div>
            </div>

            {/* FAQ */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 inline-block mb-4 border-b-2 border-purple-500 pb-1">
                Frequently Asked Questions
              </h3>
              <div className="space-y-2">
                {[
                  { q: "How long does the service take?", a: "The service typically takes 2-3 hours depending on the condition and type of appliance." },
                  { q: "Do you provide warranty?", a: `Yes, we provide ${service.warranty_days || 180} days service warranty on all services.` },
                  { q: "What if I need to reschedule?", a: "You can reschedule free of charge up to 2 hours before your appointment." }
                ].map((faq, i) => (
                  <div key={i} className="border-b border-gray-100 last:border-0 pb-2">
                    <button 
                      onClick={() => toggleFaq(i)}
                      className="w-full flex justify-between items-center py-3 text-left font-semibold text-gray-800 text-[15px]"
                    >
                      {faq.q}
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === i && (
                      <div className="pb-4 text-gray-600 text-sm animate-in slide-in-from-top-1">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Ratings & Reviews */}
            <div className="mb-8 sm:mb-20">
              <div className="flex items-center justify-between mb-4 border-b-2 border-purple-500 pb-1">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Ratings & Reviews
                </h3>
                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                  Verified Customers
                </span>
              </div>

              {/* Rating Summary Box */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 sm:p-5 mb-5 flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-6">
                <div className="flex flex-col items-center justify-center sm:border-r sm:border-gray-200 sm:pr-6 shrink-0">
                  <div className="text-3xl sm:text-4xl font-black text-gray-900 flex items-center gap-1">
                    <span>{reviewStats?.average || service.rating || "4.8"}</span>
                    <Star className="w-6 h-6 sm:w-7 sm:h-7 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="text-xs text-gray-500 font-medium mt-1">
                    {reviewStats?.total || service.reviews || 120}+ Ratings
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2">
                    ✓ 100% Verified
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="flex-1 w-full space-y-1.5 justify-center flex flex-col">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviewStats?.distribution?.[stars] || (stars === 5 ? 85 : stars === 4 ? 25 : 5);
                    const total = reviewStats?.total || 120;
                    const percent = Math.min(100, Math.round((count / total) * 100)) || (stars === 5 ? 75 : stars === 4 ? 20 : 5);
                    return (
                      <div key={stars} className="flex items-center gap-2 text-xs">
                        <span className="w-6 font-bold text-gray-700 text-right shrink-0">{stars}★</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-8 text-[11px] text-gray-400 text-right shrink-0">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Reviews List */}
              {loadingReviews ? (
                <div className="py-6 flex items-center justify-center text-xs text-gray-400">
                  <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2" />
                  Loading customer reviews...
                </div>
              ) : reviewsList.length > 0 ? (
                <div className="space-y-3.5">
                  {reviewsList.map((rev: any, i: number) => (
                    <div key={rev.id || i} className="bg-white border border-gray-100 rounded-2xl p-3.5 sm:p-4 shadow-2xs hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                            {(rev.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs sm:text-[13px] font-bold text-gray-900 flex items-center gap-1">
                              <span>{rev.name}</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            </div>
                            <span className="text-[10px] text-gray-400">{rev.date || "Recently"}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-0.5 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-black text-amber-900">{rev.rating || 5}.0</span>
                        </div>
                      </div>

                      {/* Compliment Tags */}
                      {rev.tags && rev.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {rev.tags.map((tag: string, tIdx: number) => (
                            <span key={tIdx} className="text-[10px] font-bold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-full border border-indigo-100/60">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Review Comment */}
                      {rev.review && (
                        <p className="text-xs text-gray-700 leading-relaxed italic bg-gray-50/60 p-2.5 rounded-xl border border-gray-100">
                          &ldquo;{rev.review}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-xs sm:text-sm">No reviews yet for this service.</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 bg-white p-3 sm:p-4 flex items-center justify-between sticky bottom-0 rounded-b-3xl sm:rounded-b-2xl">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">₹{Number(service.selling_price)}</div>
            <div className="text-xs sm:text-sm text-gray-500">{service.duration || '45 mins'}</div>
          </div>
          {quantity > 0 ? (
            <div className="bg-white border border-[#6069c9] text-[#6069c9] text-sm sm:text-[15px] font-bold h-9 sm:h-11 w-28 sm:w-32 rounded-lg shadow-sm flex items-center justify-between px-2">
              <button 
                onClick={(e) => { e.preventDefault(); onRemove && onRemove(); }}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-blue-50 rounded-md transition"
              >
                -
              </button>
              <span className="text-[#6069c9]">{quantity}</span>
              <button 
                onClick={(e) => { e.preventDefault(); onAdd(service); }}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-blue-50 rounded-md transition"
              >
                +
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onAdd(service)}
              className="bg-[#7780d6] text-white font-bold py-2 sm:py-2.5 px-6 sm:px-8 rounded-xl hover:bg-[#6069c9] transition shadow-md text-sm sm:text-base"
            >
              Add to Cart
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
