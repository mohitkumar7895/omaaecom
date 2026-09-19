import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Page not found | OMAA Company",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center px-6 py-20 text-center">
        <p className="text-sm font-bold text-[#5c67b8] uppercase tracking-widest">404</p>
        <h1 className="mt-2 text-3xl font-extrabold text-gray-900">Page not found</h1>
        <p className="mt-3 max-w-md text-gray-600">
          This URL is not a service area or product page. Browse our repair services or pick a location we cover.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="bg-[#5c67b8] text-white font-semibold px-5 py-2.5 rounded-xl"
          >
            Go Home
          </Link>
          <Link
            href="/services"
            className="bg-white border border-gray-200 text-gray-800 font-semibold px-5 py-2.5 rounded-xl"
          >
            View Services
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
