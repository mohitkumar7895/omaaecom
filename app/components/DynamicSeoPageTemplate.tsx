"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Phone,
  MessageCircle,
  ShieldCheck,
  Clock,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  MapPin,
  Wrench,
  Sparkles,
  Calendar,
  AlertCircle
} from "lucide-react";

export interface DynamicSeoPageData {
  id?: number;
  title: string;
  slug: string;
  url: string;
  h1?: string | null;
  h2?: string | null;
  h3?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  subheading?: string | null;
  content?: string | null;
  city?: string | null;
  area?: string | null;
  category_id?: number | null;
  service_id?: number | null;
  service_name?: string | null;
  category_name?: string | null;
  category_image?: string | null;
  price?: number | string | null;
  faqs?: Array<{ question: string; answer: string }> | null;
  features?: string[] | null;
  canonical_url?: string | null;
  related_services?: Array<{ id: number; title: string; slug?: string; category_id?: number }>;
  related_locations?: Array<{ name: string; slug: string; city: string }>;
}

const PHONE_NUMBER = "9999251966";
const PHONE_HREF = "tel:+919999251966";
const WHATSAPP_NUMBER = "919999251966";

export default function DynamicSeoPageTemplate({ data }: { data: DynamicSeoPageData }) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const locationDisplay = [data.area, data.city].filter(Boolean).join(", ") || data.city || data.area || "Delhi NCR";
  const serviceDisplay = data.service_name || data.category_name || "Appliance Repair & Service";
  const displayH1 = data.h1 || data.title || `${serviceDisplay} in ${locationDisplay}`;
  const displaySubheading =
    data.subheading ||
    data.meta_description ||
    `Verified doorstep ${serviceDisplay.toLowerCase()} in ${locationDisplay}. Certified technician dispatch within 60–90 minutes with upfront rates and a 30-day warranty.`;

  const whatsappMessage = encodeURIComponent(
    `Hello OMAA Company! I need ${serviceDisplay} in ${locationDisplay}. Please confirm technician availability.`
  );

  // Fallback default FAQs if none provided
  const faqs = data.faqs && data.faqs.length > 0
    ? data.faqs
    : [
        {
          question: `How fast can a technician reach my doorstep in ${locationDisplay}?`,
          answer: `Most service visits in ${locationDisplay} are attended within 60 to 90 minutes from booking. Same-day service slots operate between 8:00 AM and 8:00 PM. Call ${PHONE_NUMBER} for emergency priority dispatch.`,
        },
        {
          question: `Is there a warranty on ${serviceDisplay} in ${locationDisplay}?`,
          answer: `Yes, all completed repairs by OMAA Company come with an official 30-day service warranty. Genuine spare parts carry manufacturer warranty periods as specified on your invoice.`,
        },
        {
          question: `What are the visiting and inspection charges in ${locationDisplay}?`,
          answer: `Standard inspection charges are nominal and strictly aligned with our published Rate Card. If you proceed with the repair on the same visit, the inspection charge is adjusted within the service bill.`,
        },
        {
          question: `Which brands do you service for ${serviceDisplay}?`,
          answer: `Our certified technicians service all major Indian and international brands including Kent, Livpure, Aquaguard, Pureit, LG, Samsung, Whirlpool, Haier, Voltas, Godrej, IFB, Bosch, and Daikin.`,
        },
      ];

  // Parse structured features
  const featuresList = Array.isArray(data.features) && data.features.length > 0
    ? data.features
    : [
        "Doorstep technician within 60-90 minutes",
        "100% Genuine manufacturer spare parts",
        "Transparent published rate card (No hidden costs)",
        "Verified background-checked technicians",
        "30-day comprehensive service warranty",
        "Post-service digital invoice & warranty card",
      ];

  const bookUrl = data.category_id ? `/services/${data.category_id}` : "/";

  return (
    <div className="bg-[#FAFBFD] text-slate-800 font-sans min-h-screen">
      {/* 1. Breadcrumbs Bar */}
      <div className="bg-white border-b border-slate-200/70 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-slate-500">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-indigo-600 transition-colors font-medium">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate-300">/</li>
              {data.city && (
                <>
                  <li>
                    <span className="text-slate-600 font-medium">{data.city}</span>
                  </li>
                  <li aria-hidden="true" className="text-slate-300">/</li>
                </>
              )}
              {data.area && data.area !== data.city && (
                <>
                  <li>
                    <span className="text-slate-600 font-medium">{data.area}</span>
                  </li>
                  <li aria-hidden="true" className="text-slate-300">/</li>
                </>
              )}
              <li className="text-indigo-700 font-semibold truncate max-w-[260px] sm:max-w-none">
                {serviceDisplay}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* 2. Hero Section with Rich Aesthetics */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-[#FAFBFD] border-b border-slate-200/70 pt-10 pb-14 sm:py-16">
        {/* Subtle geometric background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute top-1/2 left-10 w-72 h-72 bg-blue-100/40 rounded-full blur-2xl pointer-events-none -z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content (8 Cols) */}
            <div className="lg:col-span-8">
              {/* Trust Badge Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs sm:text-sm font-semibold mb-4 shadow-xs">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Verified Doorstep Service in {locationDisplay}</span>
              </div>

              {/* Dynamic H1 Heading */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
                {displayH1}
              </h1>

              {/* Subheading */}
              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
                {displaySubheading}
              </p>

              {/* Action Buttons: Call Now, WhatsApp, Online Booking */}
              <div className="mt-7 flex flex-wrap items-center gap-3 sm:gap-4">
                <a
                  href={PHONE_HREF}
                  id="seo-btn-call"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/25 transition-all transform active:scale-95"
                >
                  <Phone className="w-5 h-5 fill-current" />
                  <span>Call {PHONE_NUMBER}</span>
                </a>

                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="seo-btn-whatsapp"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>WhatsApp Chat</span>
                </a>

                <Link
                  href={bookUrl}
                  id="seo-btn-book"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base border border-slate-300 shadow-xs transition-all"
                >
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Book Online</span>
                </Link>
              </div>

              {/* Trust Pillars */}
              <div className="mt-8 pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">60-90 Mins</div>
                    <div className="text-[11px] text-slate-500">Fast Doorstep Visit</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">30-Day Warranty</div>
                    <div className="text-[11px] text-slate-500">On Repaired Parts</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Genuine Spares</div>
                    <div className="text-[11px] text-slate-500">100% Brand Certified</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">4.8★ Rated</div>
                    <div className="text-[11px] text-slate-500">25,000+ Customers</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card (4 Cols): Quick Highlights & Booking Card */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700" />
                
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Service Inclusions</span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">{serviceDisplay}</h3>
                  </div>
                  {data.price && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Starts At</span>
                      <div className="text-xl font-extrabold text-indigo-600">₹{data.price}</div>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2.5">
                  {featuresList.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Serving all sectors & societies in <strong>{locationDisplay}</strong></span>
                  </div>
                  <Link
                    href={bookUrl}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm text-center block transition-colors"
                  >
                    View Rates & Book Slot
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Dynamic H2 & H3 SEO Content Sections */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10">
            
            {/* Main Content Body (8 Cols) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Dynamic H2 Section */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">
                  {data.h2 || `Why Choose OMAA for ${serviceDisplay} in ${locationDisplay}?`}
                </h2>
                
                {data.content ? (
                  <div className="mt-5 prose prose-slate max-w-none text-slate-600 text-sm sm:text-base leading-relaxed space-y-4">
                    {data.content.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 text-slate-600 text-sm sm:text-base leading-relaxed space-y-4">
                    <p>
                      At <strong>OMAA Company</strong>, we understand that an appliance breakdown in your home disrupts your daily routine. That is why our local technicians in <strong>{locationDisplay}</strong> are equipped with certified diagnostic tools and genuine replacement parts to restore your appliances on the very first visit.
                    </p>
                    <p>
                      Whether you need quick emergency service, periodic deep chemical foam cleaning, filter replacement, or motor diagnostics, we follow a transparent rate card with upfront price estimation before any work starts.
                    </p>
                  </div>
                )}

                {/* Dynamic H3 Subsection if provided */}
                {data.h3 && (
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                      {data.h3}
                    </h3>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                      All repair work in {locationDisplay} is carried out strictly under manufacturer service protocols, ensuring high durability, energy efficiency, and total safety for your family.
                    </p>
                  </div>
                )}
              </div>

              {/* Service Process Section */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  How Our Doorstep Service Works
                </h2>
                <div className="mt-6 grid sm:grid-cols-3 gap-6">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm mb-3">1</div>
                    <h4 className="font-bold text-slate-900 text-sm">Book or Call</h4>
                    <p className="text-xs text-slate-500 mt-1">Book online or call 9999251966 with your appliance model & address in {locationDisplay}.</p>
                  </div>
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm mb-3">2</div>
                    <h4 className="font-bold text-slate-900 text-sm">60-Min Visit</h4>
                    <p className="text-xs text-slate-500 mt-1">A verified technician arrives at your flat, diagnoses the issue, and quotes the rate card price.</p>
                  </div>
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm mb-3">3</div>
                    <h4 className="font-bold text-slate-900 text-sm">Repaired & Covered</h4>
                    <p className="text-xs text-slate-500 mt-1">Repair completed with genuine spares and an official 30-day warranty card issued on spot.</p>
                  </div>
                </div>
              </div>

              {/* 4. Interactive FAQs Accordion */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      Frequently Asked Questions
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Common questions about {serviceDisplay} in {locationDisplay}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {faqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div
                        key={idx}
                        className={`rounded-xl border transition-all duration-200 ${
                          isOpen ? "border-indigo-200 bg-indigo-50/20" : "border-slate-200/80 bg-white hover:border-slate-300"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(idx)}
                          className="w-full py-4 px-5 flex items-center justify-between text-left gap-4"
                        >
                          <span className="font-bold text-sm sm:text-base text-slate-900">
                            {faq.question}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-indigo-600 transition-transform duration-200 shrink-0 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-indigo-100/60 pt-3">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Sidebar (4 Cols): Related Services & Coverage Areas */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Direct Emergency Contact Box */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest">Doorstep Helpdesk</span>
                <h3 className="text-xl font-bold mt-1">Need Urgent Help?</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Call our central dispatch desk directly for immediate technician allocation in {locationDisplay}.
                </p>
                <a
                  href={PHONE_HREF}
                  className="mt-4 w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-colors"
                >
                  <Phone className="w-4 h-4 fill-current" />
                  <span>Call {PHONE_NUMBER}</span>
                </a>
              </div>

              {/* Related Services */}
              {data.related_services && data.related_services.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                  <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-indigo-600" />
                    <span>Other Services in {locationDisplay}</span>
                  </h3>
                  <div className="space-y-2">
                    {data.related_services.map((svc) => (
                      <Link
                        key={svc.id}
                        href={svc.slug ? `/${svc.slug}` : (svc.category_id ? `/services/${svc.category_id}` : "#")}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-100 hover:border-indigo-200 transition-all text-xs font-semibold text-slate-800"
                      >
                        <span>{svc.title}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Locations / Nearby Sectors */}
              {data.related_locations && data.related_locations.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                  <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <span>Nearby Areas We Cover</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.related_locations.map((loc, i) => (
                      <Link
                        key={i}
                        href={`/${loc.slug}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-300 text-xs text-slate-700 hover:text-indigo-700 font-medium transition-all"
                      >
                        {loc.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </section>

      {/* 5. Sticky Bottom Action Bar for Mobile Users */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 z-40 flex items-center gap-2.5 shadow-2xl">
        <a
          href={PHONE_HREF}
          className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
        >
          <Phone className="w-4 h-4 fill-current" />
          <span>Call Now</span>
        </a>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
