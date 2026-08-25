"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText } from "lucide-react";
import ServiceCard from "./ServiceCard";
import ServiceDetailsModal from "./ServiceDetailsModal";

type CategoryViewProps = {
  category: any;
  subcategories: any[];
  services: any[];
  rateCards?: any[];
};

export default function CategoryView({ category, subcategories, services, rateCards = [] }: CategoryViewProps) {
  const router = useRouter();
  const [activeSubcat, setActiveSubcat] = useState<number>(subcategories[0]?.id || 0);
  const [cart, setCart] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any | null>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem("omaa_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart");
      }
    }
  }, []);
  
  // Create refs for each subcategory section to enable scroll spy
  const sectionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const handleScroll = () => {
    const scrollPosition = window.scrollY + 200; // Offset for header

    for (const sub of subcategories) {
      const element = sectionRefs.current[sub.id];
      if (element) {
        const { offsetTop, offsetHeight } = element;
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          setActiveSubcat(sub.id);
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [subcategories]);

  const scrollToSubcategory = (id: number) => {
    setActiveSubcat(id);
    const element = sectionRefs.current[id];
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100; // Offset for navbar
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const isCashbackItem = (item: any) => {
    const title = (item.title || "").toLowerCase();
    const catId = Number(item.category_id || category?.id);
    const catName = (item.category || item.type || category?.title || "").toLowerCase();
    
    if (catId === 6 || catId === 7) return true;
    if (
      title.includes("new product") || 
      title.includes("amc") || 
      title.includes("plan") ||
      title.includes("cashback") ||
      catName.includes("new product") || 
      catName.includes("amc") ||
      catName.includes("product") ||
      catName.includes("cashback")
    ) {
      return true;
    }
    return false;
  };

  const handleAddService = (service: any) => {
    if (cart.length > 0) {
      const isNewItemCashback = isCashbackItem(service);
      const hasCashbackInCart = isCashbackItem(cart[0]);

      if (isNewItemCashback && !hasCashbackInCart) {
        alert("You cannot add Cashback/Products to a cart containing Regular Services. Please complete or clear your cart first.");
        return;
      }
      if (!isNewItemCashback && hasCashbackInCart) {
        alert("You cannot add Regular Services to a cart containing Cashback/Products. Please complete or clear your cart first.");
        return;
      }
    }

    setCart((prev) => {
      let newCart;
      const existing = prev.find(item => item.id === service.id);
      if (existing) {
        newCart = prev.map(item => item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        newCart = [...prev, { ...service, category: category?.title, type: category?.type, quantity: 1 }];
      }
      setTimeout(() => {
        localStorage.setItem('omaa_cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event("cart_updated"));
      }, 0);
      return newCart;
    });
  };

  const handleRemoveService = (serviceId: number) => {
    setCart((prev) => {
      let newCart;
      const existing = prev.find(item => item.id === serviceId);
      if (existing && existing.quantity > 1) {
        newCart = prev.map(item => item.id === serviceId ? { ...item, quantity: item.quantity - 1 } : item);
      } else {
        newCart = prev.filter(item => item.id !== serviceId);
      }
      setTimeout(() => {
        localStorage.setItem('omaa_cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event("cart_updated"));
      }, 0);
      return newCart;
    });
  };

  const totalCartPrice = cart.reduce((total, item) => total + (Number(item.selling_price) * item.quantity || 0), 0);
  const totalCartItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto w-full bg-white min-h-screen pb-24">
      {/* Header Area */}
      <div className="pt-8 pb-5 px-6 lg:px-12 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-1">{category.title}</h1>
          <p className="text-gray-500 text-xs sm:text-sm">Select a service ....</p>
        </div>

        <Link href="/rate-card">
          <button className="flex items-center gap-2 bg-[#1c1c1e] hover:bg-black text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition active:scale-98">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Rate Card</span>
          </button>
        </Link>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row px-4 lg:px-12 py-4 lg:py-8 gap-6 lg:gap-8 relative">
        
        {/* Left Sidebar (Sticky) */}
        <div className="lg:w-[340px] flex-shrink-0 w-full mb-4 lg:mb-0">
          <div className="sticky top-[70px] lg:top-[100px] bg-white border border-gray-100 rounded-2xl p-4 lg:p-6 shadow-sm overflow-x-auto z-10 hidden-scrollbar">
            <div className="flex lg:grid lg:grid-cols-3 gap-3 lg:gap-4 min-w-max lg:min-w-0 pb-1 lg:pb-0">
              {subcategories.map((sub) => {
                const subServices = services.filter(s => s.subcategory_id === sub.id);
                const fallbackImage = subServices.find(s => s.image_url)?.image_url;

                return (
                  <div 
                    key={sub.id}
                    onClick={() => scrollToSubcategory(sub.id)}
                    className="flex flex-col items-center gap-1.5 lg:gap-2 cursor-pointer group w-[70px] lg:w-auto"
                  >
                    <div className={`w-[60px] h-[60px] lg:w-[72px] lg:h-[72px] rounded-2xl p-1 transition-all duration-300 ease-in-out transform ${
                      activeSubcat === sub.id 
                        ? 'border-2 border-[#6069c9] scale-105' 
                        : 'border-2 border-transparent hover:border-[#6069c9] hover:scale-105 hover:shadow-md'
                    }`}>
                      <div className="w-full h-full bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center text-[#2c3e50] font-bold text-xl bg-[#e2e5fc]">
                        {(sub.image_url || fallbackImage) ? (
                          <img 
                            src={sub.image_url || fallbackImage} 
                            alt={sub.title} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                          />
                        ) : (
                          <img 
                            src={
                              sub.title.toLowerCase().includes('service') 
                                ? '/uploads/services/1787316110905-foam-jet-ac.webp'
                                : sub.title.toLowerCase().includes('repair')
                                ? '/uploads/services/1787316608900-Ac-repair.webp'
                                : sub.title.toLowerCase().includes('install')
                                ? '/uploads/services/1787316910874-Window-Ac-un.webp'
                                : '/uploads/services/1787316110905-foam-jet-ac.webp'
                            } 
                            alt={sub.title} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                          />
                        )}
                      </div>
                    </div>
                    <span className={`text-xs text-center font-semibold leading-tight ${activeSubcat === sub.id ? 'text-[#6069c9]' : 'text-gray-600 group-hover:text-[#6069c9]'}`}>
                      {sub.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Content (Service Lists) */}
        <div className="flex-1">
          {subcategories.map((sub) => {
            const subServices = services.filter(s => s.subcategory_id === sub.id);
            if (subServices.length === 0) return null;

            return (
              <div 
                key={sub.id} 
                ref={(el) => { sectionRefs.current[sub.id] = el }}
                className="mb-8 lg:mb-12"
              >
                <h2 className="text-[20px] lg:text-[22px] font-bold text-[#6069c9] mb-4 lg:mb-6 pb-2 border-b border-[#6069c9]">
                  {sub.title}
                </h2>
                <div className="flex flex-col gap-2">
                  {subServices.map((service) => (
                    <ServiceCard 
                      key={service.id} 
                      service={service} 
                      quantity={cart.find(c => c.id === service.id)?.quantity || 0}
                      onAdd={() => handleAddService(service)}
                      onRemove={() => handleRemoveService(service.id)} 
                      onViewDetails={() => setSelectedService(service)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Sidebar (Cart - Desktop) */}
        {cart.length > 0 && (
          <div className="hidden lg:block lg:w-[320px] flex-shrink-0">
            <div className="sticky top-[100px] bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cart</h2>
              
              <div className="max-h-[40vh] overflow-y-auto mb-4 pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-start mb-4">
                    <div className="flex-1 pr-2">
                      <h3 className="text-[13px] font-semibold text-gray-800 line-clamp-2 leading-snug">{item.title}</h3>
                      <div className="text-sm font-bold mt-1 text-gray-900">₹{Number(item.selling_price)}</div>
                    </div>
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between bg-white border border-[#6069c9]/30 rounded-lg shadow-sm h-8 w-[72px] px-1 shrink-0">
                      <button onClick={() => handleRemoveService(item.id)} className="w-6 h-6 flex items-center justify-center text-[#6069c9] hover:bg-gray-50 rounded">
                        <span className="text-lg leading-none mt-[-2px]">-</span>
                      </button>
                      <span className="text-sm font-bold text-[#6069c9]">{item.quantity}</span>
                      <button onClick={() => handleAddService(item)} className="w-6 h-6 flex items-center justify-center text-[#6069c9] hover:bg-gray-50 rounded">
                        <span className="text-lg leading-none mt-[-1px]">+</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => router.push('/cart')}
                className="w-full bg-[#6069c9] hover:bg-[#525ab5] text-white font-bold py-3.5 rounded-xl transition shadow-md flex justify-between items-center px-4"
              >
                <span>₹{totalCartPrice.toLocaleString()}</span>
                <span>View Cart</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Cart Summary */}
      <div 
        className={`lg:hidden fixed bottom-4 left-4 right-4 z-[99] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          cart.length > 0 && !isMobileCartOpen 
            ? 'translate-y-0 opacity-100 pointer-events-auto scale-100' 
            : 'translate-y-10 opacity-0 pointer-events-none scale-95'
        }`}
      >
        <div 
          onClick={() => setIsMobileCartOpen(true)}
          className="bg-[#6069c9] text-white rounded-2xl shadow-[0_8px_30px_rgba(96,105,201,0.4)] flex items-center justify-between p-4 cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider mb-1 text-white/80">
              {totalCartItems} {totalCartItems === 1 ? 'Item' : 'Items'}
            </span>
            <span className="font-extrabold text-lg leading-none">
              ₹{totalCartPrice.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 font-bold text-sm bg-white/20 px-4 py-2 rounded-xl">
            View Cart
          </div>
        </div>
      </div>

      {/* Mobile Cart Modal Overlay */}
      {cart.length > 0 && (
        <div className={`lg:hidden fixed inset-0 z-[100] flex flex-col justify-end pointer-events-none`}>
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-[#0f172a]/60 backdrop-blur-sm transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              isMobileCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'
            }`}
            onClick={() => setIsMobileCartOpen(false)}
          ></div>
          
          {/* Bottom Sheet */}
          <div 
            className={`relative bg-white w-full rounded-t-[32px] shadow-2xl flex flex-col max-h-[85vh] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              isMobileCartOpen ? 'translate-y-0 pointer-events-auto' : 'translate-y-full'
            }`}
          >
            {/* Handle bar for visual cue */}
            <div className="w-full flex justify-center pt-3 pb-1" onClick={() => setIsMobileCartOpen(false)}>
              <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
            </div>

            <div className="flex items-center justify-between px-6 pb-4 pt-2 border-b border-gray-100">
              <div>
                <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight">Your Cart</h2>
                <p className="text-sm font-medium text-gray-500">{totalCartItems} items</p>
              </div>
              <button 
                onClick={() => setIsMobileCartOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors active:scale-95"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 13L13 1M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-2 overflow-y-auto flex-1 hidden-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-5 border-b border-gray-50/50 last:border-0">
                  <div className="flex-1 pr-4">
                    <h3 className="text-[15px] font-semibold text-gray-800 leading-snug mb-1.5">{item.title}</h3>
                    <div className="text-[15px] font-extrabold text-[#6069c9]">₹{Number(item.selling_price)}</div>
                  </div>
                  
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl shadow-sm h-10 w-[90px] px-1.5 shrink-0">
                    <button onClick={() => handleRemoveService(item.id)} className="w-7 h-7 flex items-center justify-center text-[#6069c9] hover:bg-gray-50 rounded-lg active:bg-gray-100 transition-colors">
                      <span className="text-xl leading-none mt-[-2px] font-medium">-</span>
                    </button>
                    <span className="text-[15px] font-bold text-gray-800">{item.quantity}</span>
                    <button onClick={() => handleAddService(item)} className="w-7 h-7 flex items-center justify-center text-[#6069c9] hover:bg-gray-50 rounded-lg active:bg-gray-100 transition-colors">
                      <span className="text-xl leading-none mt-[-1px] font-medium">+</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-5 border-t border-gray-100 bg-white/80 backdrop-blur-md pb-safe">
              <button 
                onClick={() => {
                  setIsMobileCartOpen(false);
                  setTimeout(() => router.push('/cart'), 300);
                }}
                className="w-full bg-[#6069c9] hover:bg-[#525ab5] active:scale-[0.98] text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-[0_8px_20px_rgba(96,105,201,0.3)] flex justify-between items-center px-6"
              >
                <span className="text-lg tracking-tight">₹{totalCartPrice.toLocaleString()}</span>
                <span className="flex items-center gap-2 text-[15px]">
                  View Cart
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Details Modal */}
      {selectedService && (
        <ServiceDetailsModal 
          service={selectedService}
          quantity={cart.find(c => c.id === selectedService.id)?.quantity || 0}
          onClose={() => setSelectedService(null)}
          onAdd={handleAddService}
          onRemove={() => handleRemoveService(selectedService.id)}
          rateCards={rateCards}
        />
      )}
    </div>
  );
}
