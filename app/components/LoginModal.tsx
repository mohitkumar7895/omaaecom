"use client";

import { X, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Wait a frame so the browser paints the 'translate-y-full' state first
      setTimeout(() => setVisible(true), 20);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 300); // matches transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4`}>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={`relative w-full sm:w-[440px] bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl p-6 sm:p-10 transform transition-transform duration-300 border border-gray-100 will-change-transform mt-auto sm:mt-0 ${
          visible ? "translate-y-0" : "translate-y-full sm:translate-y-12 sm:opacity-0"
        }`}
        style={{ transitionTimingFunction: "ease-out" }}
      >
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mt-2">
          {/* Logo floating above the card */}
          <div className="mb-4 sm:mb-6 transform transition-transform hover:scale-105 duration-300">
            <Image 
              src="/logoomaa.webp" 
              alt="OMAA Logo" 
              width={160} 
              height={50} 
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>

          <div className="w-full">
            <h2 className="text-[22px] sm:text-[26px] font-bold text-gray-900 tracking-tight text-center mb-2">
              Enter your phone number
            </h2>
            <p className="text-gray-500 text-[14px] text-center mb-6 sm:mb-8 font-medium">
              You will receive an OTP for verification
            </p>

            {/* Inputs */}
            <div className="flex items-stretch space-x-3 mt-4 sm:mt-6">
              {/* Country Code */}
              <div className="flex items-center justify-center space-x-1 border-2 border-gray-200 rounded-[16px] px-3 sm:px-4 py-3 sm:py-4 bg-gray-50 text-gray-800 font-bold text-[16px] cursor-pointer hover:bg-gray-100 transition">
                <span>+91</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              
              {/* Phone Number Input */}
              <input
                type="tel"
                placeholder="Enter 10-digit number"
                maxLength={10}
                className="flex-1 border-2 border-gray-200 rounded-[16px] px-4 py-3 sm:py-4 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-gray-900 transition-colors text-[16px] sm:text-[18px] font-bold tracking-wide"
                autoFocus
              />
            </div>

            {/* Terms and Privacy */}
            <p className="text-[12px] text-gray-400 mt-6 text-center px-4 leading-relaxed">
              By continuing, you agree to our{" "}
              <Link href="#" className="font-semibold text-gray-600 hover:text-black hover:underline transition">T&C</Link>
              {" "}and{" "}
              <Link href="#" className="font-semibold text-gray-600 hover:text-black hover:underline transition">Privacy policy</Link>
            </p>

            <button className="w-full mt-6 bg-gray-900 hover:bg-black text-white font-bold py-3.5 sm:py-4 rounded-[16px] transition-transform active:scale-[0.98] shadow-md text-[16px] tracking-wide">
              Continue
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
