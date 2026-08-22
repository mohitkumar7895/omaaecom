import Navbar from "../components/Navbar";
import { History } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-4 sm:mt-8">
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[50vh]">
          <div className="w-20 h-20 bg-[#e2e5fc] rounded-full flex items-center justify-center text-[#6069c9] mb-6">
            <History className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">Product History</h1>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">View your previously purchased products and services.</p>
          <Link href="/">
            <button className="mt-8 bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-8 rounded-xl transition-transform active:scale-[0.98] shadow-md">
              Go back to Home
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}