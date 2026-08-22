import Navbar from "../components/Navbar";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        
        {/* Logo floating above the card */}
        <div className="mb-8">
          <Image 
            src="/logoomaa.webp" 
            alt="OMAA Logo" 
            width={160} 
            height={50} 
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[24px] shadow-xl p-6 sm:p-8 max-w-[420px] w-full border border-gray-100">
          
          <h2 className="text-[20px] sm:text-[22px] font-bold text-gray-900 tracking-tight">
            Enter your phone number
          </h2>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            We'll send you a text with a verification code. Standard tariff may apply.
          </p>

          {/* Inputs */}
          <div className="flex items-center space-x-3 mt-6">
            {/* Country Code */}
            <div className="flex items-center justify-center space-x-1 border border-gray-200 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 bg-white text-gray-700 font-medium text-sm cursor-pointer hover:bg-gray-50 transition">
              <span>+91</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            
            {/* Phone Number Input */}
            <input
              type="tel"
              placeholder="Enter Phone Number"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c67b8]/30 focus:border-[#5c67b8] transition text-sm font-medium"
            />
          </div>

          {/* Terms and Privacy */}
          <p className="text-[11px] text-gray-400 mt-5 text-center px-4">
            By continuing, you agree to our{" "}
            <Link href="#" className="font-semibold text-blue-600 hover:underline">T&C</Link>
            {" "}and{" "}
            <Link href="#" className="font-semibold text-blue-600 hover:underline">Privacy policy</Link>
          </p>

          {/* Continue Button */}
          <button className="w-full mt-5 sm:mt-6 bg-[#b1b7ff] hover:bg-[#9ba3fc] text-white font-semibold py-3 sm:py-3.5 rounded-xl transition-colors shadow-sm text-sm sm:text-base">
            Continue
          </button>

        </div>
      </div>
    </main>
  );
}
