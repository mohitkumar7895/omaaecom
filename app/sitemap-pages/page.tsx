import { Metadata } from "next";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Sitemap Pages | OMAA Company",
  description: "Browse all our service location pages including Gaur City 2, Noida, Delhi, and Gurgaon.",
};

export default function SitemapPages() {
  const locations = [
    { title: "Gaur City 2 – 10th Avenue", path: "/gaur-city-2-10th-avenue" },
    { title: "Gaur City 2 – 11th Avenue", path: "/gaur-city-2-11th-avenue" },
    { title: "Gaur City 2 – 12th Avenue", path: "/gaur-city-2-12th-avenue" },
    { title: "Gaur City 2 – 14th Avenue", path: "/gaur-city-2-14th-avenue" },
    { title: "Gaur City 2 – 14th Avenue Phase 1", path: "/gaur-city-2-14th-avenue-phase-1" },
    { title: "Gaur City 2 – 14th Avenue Phase 2", path: "/gaur-city-2-14th-avenue-phase-2" },
    { title: "Gaur City 2 – 16th Avenue", path: "/gaur-city-2-16th-avenue" },
    { title: "Noida", path: "/noida" },
    { title: "Delhi", path: "/delhi" },
    { title: "Greater Noida", path: "/greater-noida" },
    { title: "Ghaziabad", path: "/ghaziabad" },
    { title: "Gurgaon", path: "/gurgaon" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-grow max-w-4xl mx-auto w-full px-6 py-12">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Service Locations</h1>
        <p className="text-gray-600 mb-8">Browse all our dedicated service areas where we offer doorstep appliance repair.</p>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-4">
            <h2 className="font-bold text-indigo-900">Available Areas</h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {locations.map((loc, idx) => (
              <li key={idx}>
                <Link 
                  href={loc.path}
                  className="flex items-center justify-between px-6 py-4 hover:bg-indigo-50/50 transition-colors group"
                >
                  <span className="font-medium text-gray-800 group-hover:text-indigo-700">{loc.title}</span>
                  <span className="text-gray-300 group-hover:text-indigo-500 transition-colors">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Footer />
    </main>
  );
}
