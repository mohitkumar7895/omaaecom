"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ServiceCard from "./ServiceCard";
import ServiceDetailsModal from "./ServiceDetailsModal";

type CategoryViewProps = {
  category: any;
  subcategories: any[];
  services: any[];
};

export default function CategoryView({ category, subcategories, services }: CategoryViewProps) {
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

  const handleAddService = (service: any) => {
    setCart((prev) => {
      let newCart;
      const existing = prev.find(item => item.id === service.id);
      if (existing) {
        newCart = prev.map(item => item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        newCart = [...prev, { ...service, quantity: 1 }];
      }
      localStorage.setItem('omaa_cart', JSON.stringify(newCart));
      window.dispatchEvent(new Event("cart_updated"));
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
      localStorage.setItem('omaa_cart', JSON.stringify(newCart));
      window.dispatchEvent(new Event("cart_updated"));
      return newCart;
    });
  };

  const totalCartPrice = cart.reduce((total, item) => total + (Number(item.selling_price) * item.quantity || 0), 0);
  const totalCartItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  return (
    <div className="max-w-7xl mx-auto w-full bg-white min-h-screen">
      {/* Header Area */}
      <div className="pt-10 pb-6 px-6 lg:px-12 border-b border-gray-100">
        <h1 className="text-3xl font-bold text-[#111827] mb-2">{category.title}</h1>
        <p className="text-gray-500 text-sm">Select a service ....</p>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row px-6 lg:px-12 py-8 gap-8 relative">
        
        {/* Left Sidebar (Sticky) */}
        <div className="lg:w-[340px] flex-shrink-0">
          <div className="sticky top-[100px] bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-3 gap-4">
              {subcategories.map((sub) => {
                const subServices = services.filter(s => s.subcategory_id === sub.id);
                const fallbackImage = subServices.find(s => s.image_url)?.image_url;

                return (
                  <div 
                    key={sub.id}
                    onClick={() => scrollToSubcategory(sub.id)}
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                  >
                    <div className={`w-[72px] h-[72px] rounded-2xl p-1 transition-all duration-300 ease-in-out transform ${
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
                className="mb-12"
              >
                <h2 className="text-[22px] font-bold text-[#6069c9] mb-6 pb-2 border-b border-[#6069c9]">
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
      </div>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[400px] bg-[#7780d6] rounded-xl shadow-2xl p-4 flex items-center justify-between z-50 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="bg-white text-[#7780d6] font-bold w-8 h-8 rounded flex items-center justify-center text-sm">
              {totalCartItems}
            </div>
            <span className="text-white font-bold text-lg">₹{totalCartPrice.toLocaleString()}</span>
          </div>
          <button 
            className="bg-white text-[#7780d6] font-bold py-2 px-6 rounded-lg hover:bg-gray-50 transition"
            onClick={() => {
              router.push('/checkout');
            }}
          >
            Done
          </button>
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
        />
      )}
    </div>
  );
}
