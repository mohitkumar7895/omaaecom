import Link from "next/link";
import type { SeoLocation } from "../../lib/seo-locations";

export default function LocationSeoSection({ location }: { location: SeoLocation }) {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-12 py-6 md:py-8">
        <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-gray-500 mb-3">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-[#5c67b8] font-medium">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-800 font-semibold">{location.title}</li>
          </ol>
        </nav>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Appliance repair in {location.title}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-3xl leading-relaxed">
          {location.intro}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/services/5"
            className="text-xs sm:text-sm font-semibold bg-[#eef1fc] text-[#5c67b8] px-3 py-1.5 rounded-full hover:bg-[#e0e4f8]"
          >
            RO Repair
          </Link>
          <Link
            href="/services/2"
            className="text-xs sm:text-sm font-semibold bg-[#eef1fc] text-[#5c67b8] px-3 py-1.5 rounded-full hover:bg-[#e0e4f8]"
          >
            Refrigerator Repair
          </Link>
          <Link
            href="/services/3"
            className="text-xs sm:text-sm font-semibold bg-[#eef1fc] text-[#5c67b8] px-3 py-1.5 rounded-full hover:bg-[#e0e4f8]"
          >
            Washing Machine Repair
          </Link>
          <Link
            href="/services/1"
            className="text-xs sm:text-sm font-semibold bg-[#eef1fc] text-[#5c67b8] px-3 py-1.5 rounded-full hover:bg-[#e0e4f8]"
          >
            AC Repair
          </Link>
          <a
            href="tel:+919999251966"
            className="text-xs sm:text-sm font-semibold bg-[#5c67b8] text-white px-3 py-1.5 rounded-full"
          >
            Call 9999251966
          </a>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {location.faqs.map((faq) => (
            <div key={faq.q} className="rounded-2xl border border-gray-100 bg-slate-50 p-4">
              <h2 className="text-sm sm:text-base font-bold text-gray-900">{faq.q}</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
