"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ReferEarnPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Premium glass inputs
  const inputClass = "w-full bg-white/40 hover:bg-white/50 focus:bg-white/70 focus:outline-none focus:ring-[3px] focus:ring-white/80 transition-all duration-300 px-5 py-3.5 rounded-[12px] text-[#0f4d4d] font-bold text-[14px] placeholder:text-[#187576] placeholder:font-semibold shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-white/50 backdrop-blur-md";

  return (
    <main className="min-h-screen bg-[#0cc7c9] relative flex flex-col items-center justify-center p-4 font-sans overflow-hidden">
      
      {/* Background Depth Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#2dedef] blur-[120px] rounded-full opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#099b9d] blur-[150px] rounded-full opacity-70"></div>
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] bg-white/10 blur-[100px] rounded-full pointer-events-none"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-[15%] right-[20%] w-24 h-24 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 rotate-12 animate-[bounce_8s_infinite] shadow-xl"></div>
      <div className="absolute bottom-[20%] left-[15%] w-16 h-16 bg-white/10 backdrop-blur-2xl rounded-full border border-white/20 -rotate-12 animate-[bounce_6s_infinite_reverse] shadow-xl"></div>

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-[650px] bg-white/30 backdrop-blur-[30px] rounded-[32px] border-2 border-white/50 p-7 sm:p-12 shadow-[0_30px_60px_rgba(0,0,0,0.15),inset_0_0_0_1px_rgba(255,255,255,0.4)] my-8">
        
        {/* Logo Section */}
        <div className="flex justify-center mb-10">
          <div className="bg-white rounded-[20px] py-4 px-10 shadow-[0_10px_25px_rgba(0,0,0,0.1)] flex flex-col items-center transform transition-transform hover:scale-105 duration-300">
            <div className="w-[50px] h-[40px] bg-[#35338a] rounded-xl flex items-center justify-center text-white font-black text-[20px] mb-1.5 shadow-inner">
              OC
            </div>
            <div className="text-gray-900 font-extrabold text-[16px] tracking-tight">OMAA Company</div>
          </div>
        </div>

        {/* Form Section */}
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <input type="text" placeholder="Referral Member Id *" className={inputClass} required />
            <input type="text" placeholder="Referral User Name *" className={inputClass} required />
            
            <input type="text" placeholder="Name *" className={inputClass} required />
            <input type="email" placeholder="Email *" className={inputClass} required />
            
            <input type="tel" placeholder="Mobile *" className={inputClass} required />
            <input type="text" placeholder="Coupon Code" className={inputClass} />
            
            {/* Password */}
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password *" 
                className={inputClass} 
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#187576] hover:text-[#0f4d4d] focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Confirm Password *" 
                className={inputClass} 
                required 
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#187576] hover:text-[#0f4d4d] focus:outline-none transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-[#11c9cb] hover:bg-[#0eaeb0] text-white font-black text-[16px] tracking-[0.15em] uppercase py-4.5 rounded-[14px] shadow-[0_10px_25px_rgba(17,201,203,0.4)] transition-all duration-300 hover:shadow-[0_15px_35px_rgba(17,201,203,0.5)] active:scale-[0.98] border border-white/20"
            >
              SUBMIT
            </button>
          </div>
          
          <div className="pt-2 text-center">
            <Link href="/login" className="inline-block text-[#0b6b6c] font-black text-[14px] hover:text-white transition-colors duration-300">
              Already have an account
            </Link>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-auto relative z-10 w-full bg-black/10 py-5 text-center backdrop-blur-sm border-t border-white/10">
        <p className="text-white/90 text-[12px] font-medium tracking-wide">
          Copyright © 2026 All Rights Reserved <span className="font-extrabold text-white">OMAA Company</span>
        </p>
      </div>
    </main>
  );
}