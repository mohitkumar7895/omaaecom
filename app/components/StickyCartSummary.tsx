"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function StickyCartSummary() {
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [actionState, setActionState] = useState<'done' | 'view'>('view');

  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem("omaa_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        const newCount = parsed.length;
        const newTotal = parsed.reduce((sum: number, item: any) => sum + (Number(item.selling_price) * (item.quantity || 1)), 0);
        
        setCartCount(newCount);

        setCartTotal(prevTotal => {
          if (newTotal > prevTotal) {
            setActionState('done');
          }
          return newTotal;
        });
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
    
    window.addEventListener("cart_updated", handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate);
    
    return () => {
      window.removeEventListener("cart_updated", handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, [cartCount, cartTotal]);

  if (!mounted || cartCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-[9999] lg:hidden pointer-events-none">
      <div 
        className={`pointer-events-auto bg-gray-900 text-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex items-center justify-between p-4 px-5 transition-all duration-300 ease-out ${
          isAnimating ? 'scale-[1.02] -translate-y-1 bg-gray-800' : 'scale-100 translate-y-0'
        }`}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-gray-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <span className={`transition-transform duration-300 ${isAnimating ? 'scale-125 text-indigo-400' : 'scale-100'}`}>
              {cartCount} {cartCount === 1 ? 'Item' : 'Items'} {actionState === 'done' && 'Added'}
            </span>
          </div>
          <div className="text-white font-extrabold text-lg leading-none">
            ₹{cartTotal.toLocaleString()}
          </div>
        </div>

        {actionState === 'done' ? (
          <button 
            onClick={() => setActionState('view')}
            className="flex items-center justify-center bg-indigo-500 text-white font-bold px-8 py-2.5 rounded-xl text-sm transition-all active:scale-95 hover:bg-indigo-400 shadow-sm"
          >
            Done
          </button>
        ) : (
          <Link href="/checkout">
            <button className="flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-2.5 rounded-xl text-sm transition-all active:scale-95 hover:bg-gray-50 shadow-sm">
              View Cart
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
