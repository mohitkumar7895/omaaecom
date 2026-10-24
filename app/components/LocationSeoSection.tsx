import Link from "next/link";
import { Phone, MessageCircle } from "lucide-react";
import type { SeoLocation } from "../../lib/seo-locations";
import type { SeoService } from "../../lib/seo-services";
import { SEO_SERVICES } from "../../lib/seo-services";

export default function LocationSeoSection({
  location,
  service,
  heading: headingOverride,
}: {
  location: SeoLocation;
  service?: SeoService;
  heading?: string;
}) {
  const faqs = service ? service.faqs(location.title) : location.faqs;
  const heading =
    headingOverride ||
    (service
      ? location.slug === "noida"
        ? `${service.shortName} Noida | ${service.shortName} Near Me`
        : `${service.titleKeyword} Near Me in ${location.title}`
      : location.slug === "noida"
        ? "Home Appliance Repair Noida | Washing Machine, Refrigerator & RO Repair Near Me"
        : `Washing Machine, Refrigerator & RO Repair Near Me in ${location.title}`);
  const intro = service ? service.intro(location.title) : location.intro;

  // Hide the ENTIRE section visually for pure location/city pages
  const sectionClass = !service ? "sr-only" : "bg-white border-b border-gray-100";

  return (
    <section className={sectionClass}>
      <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-12 py-6 md:py-8">
        <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-gray-500 mb-3">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-[#5c67b8] font-medium">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/${location.slug}`} className="hover:text-[#5c67b8] font-medium">
                {location.title}
              </Link>
            </li>
            {service && (
              <>
                <li aria-hidden="true">/</li>
                <li className="text-gray-800 font-semibold">{service.shortName}</li>
              </>
            )}
          </ol>
        </nav>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
          {heading}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">{location.region}</p>
        
        <div>
          <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-3xl leading-relaxed">{intro}</p>
          <p className="mt-4 text-sm text-gray-700 max-w-3xl">
            <span className="font-semibold">Services we provide in {location.title}:</span>{" "}
            washing machine repair near me, refrigerator repair near me, fridge repair, RO repair near me
            and water purifier repair. Local technicians, 8 AM – 8 PM, 30-day warranty. Call 9999251966.
          </p>
        </div>

        <div className="mt-5 grid sm:grid-cols-3 gap-3">
          {(service ? SEO_SERVICES.filter((item) => item.slug === service.slug) : SEO_SERVICES).map((item) => (
            <div key={item.slug} className="rounded-2xl border border-gray-100 bg-slate-50 p-4">
              <p className="font-bold text-gray-900 text-sm">{item.name}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">Doorstep service in {location.title}</p>
              <Link
                href={`/services/${item.categoryId}`}
                className="inline-block mt-3 text-xs font-bold bg-[#5c67b8] text-white px-3 py-1.5 rounded-lg"
              >
                View & Book
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a
            href="tel:+919999251966"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold bg-[#5c67b8] hover:bg-[#4a55a2] text-white px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span>Call 9999251966</span>
          </a>
          <a
            href={`https://wa.me/919999251966?text=${encodeURIComponent(`Hello OMAA Company! I need ${service ? service.name : 'appliance repair'} in ${location.title}. Please confirm availability.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold bg-[#25D366] hover:bg-[#20b858] text-white px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Chat</span>
          </a>
          <Link
            href="/service-areas"
            className="inline-flex items-center text-xs sm:text-sm font-semibold bg-[#eef1fc] text-[#5c67b8] hover:bg-[#dfe4f9] px-4 py-2.5 rounded-xl transition"
          >
            All service areas
          </Link>
        </div>

        <div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-gray-100 bg-slate-50 p-4">
                <h2 className="text-sm sm:text-base font-bold text-gray-900">{faq.q}</h2>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
