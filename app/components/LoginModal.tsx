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
        className={`relative w-full sm:w-[420px] bg-white rounded-[24px] sm:rounded-[24px] shadow-2xl p-5 sm:p-8 transform transition-transform duration-300 border border-gray-100 will-change-transform ${
          visible ? "translate-y-0" : "translate-y-full"
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
              width={140} 
              height={40} 
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="w-full">
            <h2 className="text-[20px] sm:text-[22px] font-bold text-gray-900 tracking-tight text-center mb-4 sm:mb-6">
              Enter your phone number
            </h2>

            {/* Inputs */}
            <div className="flex items-center space-x-3 mt-4 sm:mt-6">
              {/* Country Code */}
              <div className="flex items-center justify-center space-x-1 border border-gray-200 rounded-xl px-3 py-2 sm:px-4 sm:py-3 bg-white text-gray-700 font-medium text-sm cursor-pointer hover:bg-gray-50 transition">
                <span>+91</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              
              {/* Phone Number Input */}
              <input
                type="tel"
                placeholder="Enter Phone Number"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 sm:px-4 sm:py-3 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c67b8]/30 focus:border-[#5c67b8] transition text-sm font-medium"
                autoFocus
              />
            </div>

            {/* Terms and Privacy */}
            <p className="text-[11px] text-gray-400 mt-5 text-center px-4">
              By continuing, you agree to our{" "}
              <Link href="#" className="font-semibold text-blue-600 hover:underline">T&C</Link>
              {" "}and{" "}
              <Link href="#" className="font-semibold text-blue-600 hover:underline">Privacy policy</Link>
            </p>

            <button className="w-full mt-4 sm:mt-6 bg-[#b1b7ff] hover:bg-[#9ba3fc] text-white font-semibold py-2.5 sm:py-3.5 rounded-xl transition-colors shadow-sm text-sm tracking-wide">
              Continue
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
