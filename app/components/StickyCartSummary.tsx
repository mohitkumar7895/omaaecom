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
        
        if (newCount !== cartCount || newTotal !== cartTotal) {
          setCartCount(newCount);
          setCartTotal(newTotal);
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 300);
        }
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
    <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden pointer-events-none transition-transform duration-300 ${isAnimating ? 'scale-105' : 'scale-100'}`}>
      <div className="bg-white rounded-xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border border-gray-100 p-3 pointer-events-auto flex items-center justify-between">
        <div>
          <div className="text-gray-900 font-bold text-lg">₹{cartTotal.toLocaleString()}</div>
          <div className="text-gray-500 text-xs font-medium">{cartCount} item{cartCount > 1 ? 's' : ''} added</div>
        </div>
        <Link href="/cart">
          <button className="bg-[#6b62d9] hover:bg-[#5b52c9] text-white font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm shadow-sm">
            View Cart
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}
