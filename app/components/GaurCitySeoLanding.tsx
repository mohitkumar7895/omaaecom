import Link from "next/link";
import {
  GaurCitySociety,
  GaurCityServiceConfig,
  GAUR_CITY_SOCIETIES,
  GAUR_CITY_SERVICES,
  GAUR_CITY_GENERAL_FAQS,
} from "../../lib/gaur-city-data";

export type DynamicChildLocation = {
  slug: string;
  name: string;
  url?: string;
  isCore?: boolean;
  localityLabel?: string;
};

type Props = {
  society?: GaurCitySociety;
  service?: GaurCityServiceConfig;
  canonicalUrl: string;
  dynamicSocieties?: DynamicChildLocation[];
};

const PHONE = "9999251966";
const WHATSAPP_PHONE = "919999251966";

export default function GaurCitySeoLanding({ society, service, canonicalUrl, dynamicSocieties }: Props) {
  const isHub = !society && !service;
  const isSocietyHub = society && !service;
  const isServiceSociety = Boolean(society && service);

  // Construct H1 and titles
  let pageH1 = "Doorstep Appliance Repair in Gaur City 2, Noida Extension";
  let subHeading =
    "Expert technicians for RO water purifiers, AC servicing & washing machines across all Gaur City 2 avenues and Sector 16C societies in Greater Noida West.";

  if (isServiceSociety && society && service) {
    pageH1 = `${service.name} in ${society.name}, Gaur City 2`;
    subHeading = `Certified doorstep ${service.shortName.toLowerCase()} in ${society.name}, Sector 16C, Noida Extension / Greater Noida West. Upfront rate card, genuine spare parts & 30-day warranty. Technician reaches your flat in 60–90 minutes.`;
  } else if (isSocietyHub && society) {
    pageH1 = `Doorstep Appliance Repair in ${society.name}, Gaur City 2`;
    subHeading = `Same-day repair & maintenance for RO water purifiers, air conditioners, and washing machines in ${society.localityLabel}.`;
  }

  const whatsappMessage = encodeURIComponent(
    `Hello OMAA Company! I need ${service ? service.name : "appliance repair"} in ${
      society ? society.name : "Gaur City 2"
    }. Please confirm technician availability.`
  );

  return (
    <div className="bg-slate-50 text-gray-800">
      {/* Top Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-gray-500">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-[#5c67b8] font-medium transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-gray-300">
                /
              </li>
              <li>
                <Link
                  href="/gaur-city-2"
                  className={!society ? "text-gray-900 font-semibold" : "hover:text-[#5c67b8] font-medium transition-colors"}
                >
                  Gaur City 2
                </Link>
              </li>
              {society && (
                <>
                  <li aria-hidden="true" className="text-gray-300">
                    /
                  </li>
                  <li>
                    <Link
                      href={`/gaur-city-2/${society.slug}`}
                      className={!service ? "text-gray-900 font-semibold" : "hover:text-[#5c67b8] font-medium transition-colors"}
                    >
                      {society.name}
                    </Link>
                  </li>
                </>
              )}
              {service && (
                <>
                  <li aria-hidden="true" className="text-gray-300">
                    /
                  </li>
                  <li className="text-gray-900 font-semibold truncate max-w-[200px] sm:max-w-none">
                    {service.shortName}
                  </li>
                </>
              )}
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 border-b border-gray-100 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100/80 text-[#434db0] text-xs sm:text-sm font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                {society ? `${society.name} Resident Support` : "Gaur City 2 & Sector 16C Local Hub"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
              {pageH1}
            </h1>

            <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">{subHeading}</p>

            {/* Locality Accuracy Notice */}
            <div className="mt-4 p-3 bg-white/90 border border-indigo-100 rounded-xl text-xs sm:text-sm text-gray-600 flex items-start gap-2 shadow-sm">
              <svg
                className="w-4 h-4 text-[#5c67b8] mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div>
                <strong className="text-gray-900">Verified Service Location:</strong>{" "}
                {society ? (
                  <span>
                    {society.name} &bull; {society.localityLabel} ({society.classificationNote})
                  </span>
                ) : (
                  <span>
                    Gaur City 2, Sector 16C, Greater Noida West / Noida Extension (Pin 201009 / 201318) &bull; Covering 10th, 11th, 12th, 14th & 16th Avenues
                  </span>
                )}
              </div>
            </div>

            {/* Direct Call / WhatsApp CTA Actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={`tel:+91${PHONE}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#5c67b8] hover:bg-[#4b55a0] text-white font-bold text-sm sm:text-base shadow-sm shadow-indigo-200 transition-all active:scale-[0.98]"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                </svg>
                Call {PHONE}
              </a>

              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20b858] text-white font-bold text-sm sm:text-base shadow-sm shadow-emerald-200 transition-all active:scale-[0.98]"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84a8.18 8.18 0 01-5.82 2.41c-1.47 0-2.9-.39-4.16-1.13l-.3-.18-3.1 1.22.83-3.02-.2-.31a8.19 8.19 0 01-1.26-4.83c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.07-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.23.9 2.43 1.02 2.6.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z" />
                </svg>
                WhatsApp Booking
              </a>

              {service && (
                <Link
                  href={`/services/${service.categoryId}`}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-xl bg-white border border-gray-200 hover:border-[#5c67b8] text-gray-800 font-bold text-sm sm:text-base hover:text-[#5c67b8] transition-colors shadow-sm"
                >
                  View Rate Card
                </Link>
              )}
            </div>

            {/* Quick Guarantees Ribbon */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs">
                <span className="block text-base font-bold text-[#5c67b8]">30-Day</span>
                <span className="text-xs text-gray-500 font-medium">Service Warranty</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs">
                <span className="block text-base font-bold text-[#5c67b8]">₹149</span>
                <span className="text-xs text-gray-500 font-medium">Visiting & Diagnosis</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs">
                <span className="block text-base font-bold text-[#5c67b8]">60-90 Min</span>
                <span className="text-xs text-gray-500 font-medium">Same-Day Arrival</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs">
                <span className="block text-base font-bold text-[#5c67b8]">Verified</span>
                <span className="text-xs text-gray-500 font-medium">Technician ID Card</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12 sm:space-y-16">
        {/* If viewing a specific service in a society */}
        {service && society && (
          <>
            {/* Common Problems & Solutions Specific to Locality */}
            <section>
              <div className="max-w-3xl mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Common {service.shortName} Problems in {society.name}
                </h2>
                <p className="mt-2 text-sm sm:text-base text-gray-600">
                  Sector 16C and Gaur City 2 high-rise residents frequently encounter specific
                  environmental challenges. Here is how our technicians diagnose and resolve them:
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {service.commonProblems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h3 className="text-base font-bold text-gray-900 leading-snug">
                          {item.problem}
                        </h3>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        <strong className="text-gray-700">Root Cause:</strong> {item.reason}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 bg-emerald-50/60 -mx-5 -mb-5 p-4 rounded-b-2xl">
                      <p className="text-xs text-emerald-900 leading-relaxed">
                        <strong className="font-semibold text-emerald-950">OMAA Fix:</strong>{" "}
                        {item.solution}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Local Maintenance Pro-Tip */}
            <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  💡
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-amber-950">
                    Local Maintenance Advice for {society.name} Residents
                  </h3>
                  <p className="mt-1 text-sm text-amber-900 leading-relaxed">
                    {service.maintenanceTip}
                  </p>
                </div>
              </div>
            </section>

            {/* How OMAA Works in 4 Steps */}
            <section>
              <div className="max-w-3xl mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Our Step-by-Step Service Process
                </h2>
                <p className="mt-2 text-sm sm:text-base text-gray-600">
                  Transparent, prompt, and hassle-free repair service at your society gate:
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {service.processSteps.map((step) => (
                  <div
                    key={step.step}
                    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs relative"
                  >
                    <span className="text-3xl font-black text-indigo-100 block mb-2">
                      {step.step}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 mb-1.5">{step.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Supported Brands */}
            <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Brands We Service in {society.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-5">
                Our technicians carry specialized diagnostic tools and genuine spares for all major
                manufacturers:
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {service.supportedBrands.map((brand) => (
                  <span
                    key={brand}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-gray-800 text-xs sm:text-sm font-semibold border border-gray-200/60"
                  >
                    {brand}
                  </span>
                ))}
                <span className="px-3.5 py-1.5 rounded-lg bg-indigo-50 text-[#5c67b8] text-xs sm:text-sm font-semibold">
                  + All Other Brands
                </span>
              </div>
            </section>
          </>
        )}

        {/* If viewing a society hub (all 3 services available) */}
        {(isSocietyHub || isHub) && (
          <section>
            <div className="max-w-3xl mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {society
                  ? `Services Available in ${society.name}`
                  : "Core Appliance Services in Gaur City 2"}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Choose your appliance category for immediate doorstep assistance:
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {Object.values(GAUR_CITY_SERVICES).map((svc) => (
                <div
                  key={svc.slug}
                  className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <span className="w-10 h-10 rounded-xl bg-indigo-100 text-[#5c67b8] flex items-center justify-center font-bold text-lg mb-4">
                      {svc.slug.includes("ro") ? "💧" : svc.slug.includes("ac") ? "❄️" : "🧺"}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{svc.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-3">
                      {svc.maintenanceTip}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <Link
                      href={
                        society
                          ? `/gaur-city-2/${society.slug}/${svc.slug}`
                          : `/gaur-city-2/10th-avenue/${svc.slug}`
                      }
                      className="block text-center py-2.5 px-4 rounded-xl bg-[#5c67b8] text-white font-bold text-xs sm:text-sm hover:bg-[#4b55a0] transition-colors"
                    >
                      View Service Details &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Societies Directory inside Gaur City 2 & Sector 16C */}
        <section>
          <div className="max-w-3xl mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Gaur City 2 Avenues & Nearby Societies Covered
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Verified local coverage across core avenues and neighboring Sector 16C/16B communities:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(dynamicSocieties && dynamicSocieties.length > 0 ? dynamicSocieties : GAUR_CITY_SOCIETIES).map((soc) => {
              const active = society?.slug === soc.slug;
              const targetUrl = service
                ? `/gaur-city-2/${soc.slug}/${service.slug}`
                : ('url' in soc && soc.url ? soc.url : `/gaur-city-2/${soc.slug}`);

              return (
                <Link
                  key={soc.slug}
                  href={targetUrl}
                  className={`p-4 rounded-xl border transition-all ${
                    active
                      ? "bg-indigo-50/70 border-[#5c67b8] shadow-xs"
                      : "bg-white border-gray-200/80 hover:border-[#5c67b8] hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-sm font-bold ${active ? "text-[#5c67b8]" : "text-gray-900"}`}
                    >
                      {soc.name}
                    </h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                        soc.isCore
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {soc.isCore ? "Core GC2" : "Nearby"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{soc.localityLabel || "Gaur City 2, Sector 16C, Greater Noida West"}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Location-Specific FAQs */}
        <section>
          <div className="max-w-3xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Frequently Asked Questions ({society ? society.name : "Gaur City 2"})
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Clear, honest information about pricing, technician access, and warranties:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {GAUR_CITY_GENERAL_FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs"
              >
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final Conversion CTA Footer Banner */}
        <section className="bg-gradient-to-r from-[#434db0] to-[#5c67b8] rounded-3xl p-8 sm:p-12 text-white shadow-lg">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Need Same-Day Appliance Repair in {society ? society.name : "Gaur City 2"}?
            </h2>
            <p className="mt-3 text-indigo-100 text-sm sm:text-base leading-relaxed">
              Our verified local technicians are currently operating in Sector 16C. Transparent
              prices, genuine spare parts, and a 30-day warranty on every repair.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`tel:+91${PHONE}`}
                className="px-6 py-3.5 rounded-xl bg-white text-[#434db0] font-black text-sm sm:text-base hover:bg-gray-100 transition-colors shadow-sm"
              >
                Call {PHONE} Now
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-[#25D366] text-white font-black text-sm sm:text-base hover:bg-[#20b858] transition-colors shadow-sm"
              >
                Book via WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
