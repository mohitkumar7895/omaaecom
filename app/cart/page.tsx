"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { ShoppingBasket, Minus, Plus, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getGstSettings } from "../actions/gst-settings";
import LoginModal from "../components/LoginModal";
import { getStoredUser, saveStoredUser, fetchCurrentUser, isLoggedIn } from "@/lib/client-auth";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [gstSettings, setGstSettings] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedCart = localStorage.getItem("omaa_cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        let changed = false;
        const normalized = (parsed || []).map((item: any) => {
          const title = (item.title || item.name || "").toLowerCase();
          const catId = Number(item.category_id);
          const isAmc = catId === 7 || title.includes("amc") || title.includes("ro & refrigerator");
          if (isAmc || Number(item.selling_price) === 4000 || Number(item.price) === 4000) {
            if (Number(item.selling_price) === 4000 || !item.selling_price) {
              changed = true;
              return {
                ...item,
                selling_price: 3999,
                price: 3999,
              };
            }
          }
          return item;
        });
        if (changed) {
          localStorage.setItem("omaa_cart", JSON.stringify(normalized));
          window.dispatchEvent(new Event("cart_updated"));
        }
        setCart(normalized);
      } catch (e) {
        console.error("Failed to parse cart");
      }
    }

    getGstSettings().then((settings) => {
      if (settings) {
        setGstSettings(settings);
      }
    });

    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
    }

    const checkAuth = async (e?: Event) => {
      try {
        const fromEvent = (e as CustomEvent)?.detail?.user;
        const freshUser = fromEvent || (await fetchCurrentUser()) || getStoredUser();
        if (freshUser && (freshUser.email || isLoggedIn())) {
          setUser(freshUser);
        } else if (!isLoggedIn() && !getStoredUser()) {
          setUser(null);
        }
      } catch (e) {
        // Keep stored user on error
      }
    };

    checkAuth();
    window.addEventListener("auth_changed", checkAuth);
    return () => window.removeEventListener("auth_changed", checkAuth);
  }, []);

  const updateCart = (newCart: any[]) => {
    setCart(newCart);
    localStorage.setItem("omaa_cart", JSON.stringify(newCart));
    // Trigger custom event so navbar cart counter updates if it listens
    window.dispatchEvent(new Event("cart_updated"));
  };

  const handleIncrement = (index: number) => {
    const newCart = [...cart];
    newCart[index].quantity = (newCart[index].quantity || 1) + 1;
    updateCart(newCart);
  };

  const handleDecrement = (index: number) => {
    const newCart = [...cart];
    if (newCart[index].quantity > 1) {
      newCart[index].quantity -= 1;
    } else {
      newCart.splice(index, 1);
    }
    updateCart(newCart);
  };

  const isCustomerLoggedIn = Boolean(
    (user && (user.email || user.name)) ||
    (getStoredUser() && (getStoredUser()?.email || getStoredUser()?.name)) ||
    isLoggedIn()
  );

  const handleProceedToCheckout = () => {
    const activeUser = user || getStoredUser();
    if (!activeUser && !isLoggedIn()) {
      setIsLoginModalOpen(true);
      return;
    }
    router.push('/checkout');
  };

  if (!mounted) return null;

  const isGstItem = (item: any) => {
    const title = (item.title || item.name || "").toLowerCase();
    const catId = Number(item.category_id);
    const category = (item.category || item.type || item.category_title || "").toLowerCase();
    
    // Category 6 is New Products, Category 7 is RO AMC
    if (catId === 6 || catId === 7) return true;
    
    // Exact strict matching: ONLY RO AMC and New Products
    if (
      title.includes("ro amc") || 
      title.includes("amc plan") || 
      title.includes("amc package") ||
      title.includes("new product") ||
      category.includes("ro amc") ||
      category.includes("new product") ||
      category === "amc" ||
      category === "new products"
    ) {
      return true;
    }
    return false;
  };

  const itemTotals = cart.reduce((sum, item) => sum + (Number(item.selling_price) * (item.quantity || 1)), 0);
  
  // Calculate GST amount for eligible items (RO AMC & New Products) strictly if enabled
  const gstRate = Number(gstSettings?.gst_rate || 0);
  const gstEnabled = Boolean(gstSettings && (Number(gstSettings.online_gst_enabled) === 1 || Number(gstSettings.cash_gst_enabled) === 1));
  const gstItemsTotal = cart.filter(isGstItem).reduce((sum, item) => sum + (Number(item.selling_price) * (item.quantity || 1)), 0);
  const gstAmount = (gstEnabled && gstRate > 0) ? (gstItemsTotal * (gstRate / 100)) : 0;

  // Exempt convenience fee for RO AMC or New Product services
  const hasGstEligible = cart.some(isGstItem);
  const convenienceFee = hasGstEligible ? 0 : 49;
  const totalAmount = itemTotals + gstAmount + convenienceFee;

  return (
    <main className="min-h-screen bg-[#fafafa] flex flex-col font-sans pb-20">
      <Navbar />
      
      {cart.length === 0 ? (
        /* Empty Cart State */
        <div className="flex-1 flex flex-col items-center justify-center -mt-10">
          <div className="mb-6 text-gray-300">
            <ShoppingBasket className="w-32 h-32 stroke-[1.5]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-8">
            Your cart is empty
          </h2>
          <Link href="/">
            <button className="bg-[#6b62d9] hover:bg-[#5b52c9] text-white font-medium px-8 py-3 rounded-full transition-colors shadow-sm text-sm">
              Browse Services
            </button>
          </Link>
        </div>
      ) : (
        /* Filled Cart State */
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 tracking-tight">Payment summary</h1>
          
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Left Column - Product List */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
              
              {/* Header Row (Hidden on mobile) */}
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 p-5 border-b border-gray-50 bg-gray-50/50">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Product</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Price</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Quantity</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Subtotal</span>
              </div>

              {/* Cart Items */}
              <div className="divide-y divide-gray-50">
                {cart.map((item, idx) => {
                  const price = Number(item.selling_price);
                  const qty = item.quantity || 1;
                  const subtotal = price * qty;
                  
                  return (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-4 p-5 items-center">
                      
                      {/* Product Name */}
                      <div className="font-bold text-gray-800 text-[15px]">
                        {item.title}
                        {/* Mobile Price Display */}
                        <div className="md:hidden text-gray-500 font-medium text-sm mt-1">
                          ₹{price.toLocaleString()}
                        </div>
                      </div>

                      {/* Price (Desktop) */}
                      <div className="hidden md:block text-gray-700 font-medium text-[15px] text-center">
                        ₹{price.toLocaleString()}
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center md:justify-center">
                        <div className="flex items-center justify-between w-[100px] h-[36px] border border-gray-200 rounded-lg px-2 bg-white hover:border-[#6b62d9]/50 transition-colors">
                          <button 
                            onClick={() => handleDecrement(idx)}
                            className="text-[#6b62d9] hover:bg-[#6b62d9]/10 p-1 rounded transition"
                          >
                            <Minus className="w-4 h-4 stroke-[2.5]" />
                          </button>
                          <span className="font-bold text-gray-900 text-sm w-6 text-center">
                            {qty}
                          </span>
                          <button 
                            onClick={() => handleIncrement(idx)}
                            className="text-[#6b62d9] hover:bg-[#6b62d9]/10 p-1 rounded transition"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="flex justify-between md:block md:text-right font-bold text-gray-900 text-[15px]">
                        <span className="md:hidden text-gray-400 font-medium text-sm">Subtotal: </span>
                        ₹{subtotal.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="w-full lg:w-[380px] shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:sticky top-24">
              
              <div className="space-y-4 mb-5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-[14px]">Item totals</span>
                  <span className="font-bold text-gray-800 text-[15px]">₹{itemTotals.toLocaleString()}</span>
                </div>
                
                {gstAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-[14px]">GST ({gstRate}%)</span>
                    <span className="font-bold text-gray-800 text-[15px]">₹{Math.round(gstAmount).toLocaleString()}</span>
                  </div>
                )}
                
                {convenienceFee > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-[14px]">Convenience fee</span>
                    <span className="text-gray-800 text-[15px]">₹{convenienceFee.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 font-bold text-[14px]">Total amount</span>
                  <span className="font-bold text-gray-900 text-[15px]">₹{Math.round(totalAmount).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8 mt-6">
                <span className="text-gray-900 font-bold text-[15px]">Amount to pay</span>
                <span className="font-bold text-gray-900 text-[18px]">₹{Math.round(totalAmount).toLocaleString()}</span>
              </div>

              <button 
                onClick={handleProceedToCheckout}
                className="w-full bg-[#6b62d9] hover:bg-[#5b52c9] active:scale-[0.99] text-white font-bold py-3.5 rounded-xl transition shadow-md flex justify-center items-center gap-2 cursor-pointer"
              >
                {!isCustomerLoggedIn && <Lock className="w-4 h-4 opacity-75" />}
                <span>{isCustomerLoggedIn ? "Proceed to Checkout" : "Login to Checkout"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Login Modal for non-authenticated customers */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(loggedInUser) => {
          saveStoredUser(loggedInUser);
          setUser(loggedInUser);
          setIsLoginModalOpen(false);
          router.push('/checkout');
        }}
      />
    </main>
  );
}

