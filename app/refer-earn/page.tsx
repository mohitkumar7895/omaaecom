"use client";

import { CheckCircle2, Copy } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ReferEarnPage() {
  const [copied, setCopied] = useState(false);
  const link = "https://www.omaacompany.in";

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main 
      className="min-h-screen bg-[#f7f8fc] flex flex-col font-sans cursor-pointer"
      onClick={() => window.location.href = "https://www.omaacompany.in"}
    >
      <Navbar />
      
      <div className="flex-1 relative flex flex-col items-center justify-center p-4 overflow-hidden pt-12 pb-24">
        
        {/* Background Depth Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#6069c9]/10 blur-[120px] rounded-full opacity-60"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#3b439c]/10 blur-[150px] rounded-full opacity-70"></div>
        </div>

        {/* Main Glassmorphism Card */}
        <div className="relative z-10 w-full max-w-[650px] bg-white rounded-[32px] border border-gray-100 p-7 sm:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] my-8 text-center transition-transform hover:scale-[1.02] duration-300">
          
          {/* Logo Section */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-[20px] py-4 px-10 shadow-[0_10px_25px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col items-center">
              <div className="w-[50px] h-[40px] bg-[#35338a] rounded-xl flex items-center justify-center text-white font-black text-[20px] mb-1.5 shadow-inner">
                OC
              </div>
              <div className="text-gray-900 font-extrabold text-[16px] tracking-tight">OMAA Company</div>
            </div>
          </div>

          <div className="text-center text-gray-900">
            <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">Refer & Earn</h2>
            <p className="text-base sm:text-lg font-semibold text-gray-500 mb-10 opacity-90 max-w-md mx-auto leading-relaxed">
              Click anywhere on this page to view exciting rewards and share with your friends!
            </p>
            
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 pointer-events-none">
              <p className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Your Share Link</p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full bg-white p-4 rounded-xl border border-gray-200 font-mono text-[15px] font-semibold text-gray-800 break-all shadow-sm">
                  {link}
                </div>
                <button 
                  className="w-full sm:w-auto shrink-0 bg-[#35338a] hover:bg-[#2a286e] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  GO TO LINK
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}