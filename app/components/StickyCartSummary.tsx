"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function StickyCartSummary() {
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem("omaa_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        const newCount = parsed.length;
        const newTotal = parsed.reduce((sum: number, item: any) => sum + (Number(item.selling_price) * (item.quantity || 1)), 0);
        
        setCartCount(newCount);
        setCartTotal(newTotal);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      } else {
        setCartCount(0);
        setCartTotal(0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadCart();

    const handleCartUpdate = () => loadCart();
    
    // Listen to custom cart_updated event and standard storage event
    window.addEventListener("cart_updated", handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate);
    
    return () => {
      window.removeEventListener("cart_updated", handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, []);

  if (!mounted || cartCount === 0) return null;

  return (
    <div className={`fixed bottom-4 left-4 right-4 md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-[400px] z-[9999] lg:hidden pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isAnimating ? 'scale-[1.03] -translate-y-1' : 'scale-100 translate-y-0'}`}>
      <div className={`rounded-2xl shadow-[0_8px_32px_rgba(17,24,39,0.3)] p-3.5 px-5 pointer-events-auto flex items-center justify-between border border-gray-800 backdrop-blur-md transition-colors duration-300 ${isAnimating ? 'bg-[#1f2937]' : 'bg-[#111827]'}`}>
        <div className="flex items-center gap-3">
          <div className={`text-white font-bold w-8 h-8 rounded-lg flex items-center justify-center text-[14px] transition-all duration-300 ${isAnimating ? 'bg-[#6069c9] scale-125 rotate-12' : 'bg-[#374151] scale-100 rotate-0'}`}>
            {cartCount}
          </div>
          <div className="flex flex-col">
            <span className="text-gray-300 text-[11px] font-medium uppercase tracking-wider leading-none mb-1">Total</span>
            <span className="text-white font-bold text-lg leading-none">₹{cartTotal.toLocaleString()}</span>
          </div>
        </div>
        <Link href="/checkout">
          <button className="bg-white text-[#111827] font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm hover:scale-105 hover:bg-gray-100 active:scale-95 shadow-sm">
            View Cart
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}
