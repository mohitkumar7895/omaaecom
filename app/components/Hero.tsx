import { Search, Scissors, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import MobileBannerCarousel from "./MobileBannerCarousel";
import LiveSearchBar from "./LiveSearchBar";

export default function Hero({ categories = [], banners = [] }: { categories?: any[], banners?: string[] }) {
  
  const getIcon = (title: string) => {
    if (title.includes("Ac Repair")) return "❄️";
    if (title.includes("Refrigerator")) return "🧊";
    if (title.includes("Washing")) return "👕";
    if (title.includes("Microwave")) return "♨️";
    if (title.includes("Water Purifier")) return "🚰";
    if (title.includes("Product")) return "📦";
    if (title.includes("AMC")) return "🛡️";
    return "🔧";
  };

  // Filter categories by type
  const homeServices = categories.filter(c => c.type && c.type.toLowerCase().includes("service")).slice(0, 5);
  const newProducts = categories.filter(c => c.type && c.type.toLowerCase().includes("product")).slice(0, 1);
  const amcProducts = categories.filter(c => c.type && c.type.toLowerCase().includes("amc")).slice(0, 1);

  return (
    <div className="relative bg-gradient-to-br from-[#6277db] via-[#a268b8] to-[#db5285] text-white w-full font-sans overflow-hidden py-3 lg:py-12 px-4 lg:px-12">
      
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-12 items-start h-full">
        
        {/* Left Side: Content & Cards */}
        <div className="w-full lg:w-[55%] flex flex-col space-y-4 lg:space-y-6 z-10 pt-2 lg:pt-4">
          
          {/* Mobile Carousel placed before title or replacing title on mobile */}
          <MobileBannerCarousel banners={banners} />
          
          <h1 className="hidden lg:block text-[42px] font-bold leading-[1.15] mb-2">
            Home Services at Your <br /> Doorsteps
          </h1>

          {/* Mobile Search Bar (Only visible on mobile) */}
          <LiveSearchBar className="lg:hidden" />

          {/* Unified Services Box */}
          <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-xl text-gray-800 flex flex-col space-y-4 lg:space-y-6">
            
            {/* Top Section: Home Services */}
            <div>
              <div className="flex items-center space-x-2 mb-3 lg:mb-6">
                <Scissors className="w-5 h-5 text-gray-700" />
                <h3 className="font-bold text-[17px]">Home Services...</h3>
              </div>
              <div className="grid grid-cols-3 gap-3 lg:gap-6 text-center justify-items-center">
                {homeServices.map((service, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2 group w-full">
                    <div className="w-[72px] h-[72px] sm:w-20 sm:h-20 bg-[#f4f7fb] rounded-xl flex items-center justify-center text-[34px] sm:text-4xl shadow-sm group-hover:shadow-md transition overflow-hidden p-2">
                      {service.image_url && service.image_url.length > 5 ? (
                        <img src={service.image_url} alt={service.title} className="w-full h-full object-contain" />
                      ) : (
                        <span>{getIcon(service.title)}</span>
                      )}
                    </div>
                    <span className="text-[13px] font-bold text-gray-700 leading-tight">{service.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gray-100"></div>

            {/* Bottom Section: New Products & AMC */}
            <div className="grid grid-cols-2 gap-3 lg:gap-6 w-full">
              {/* New Products Card */}
              {newProducts.length > 0 && (
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1.5 lg:space-x-2 text-[#2c8af8] mb-2 lg:mb-3">
                    <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" />
                    <h3 className="font-bold text-[11px] lg:text-sm">New Products</h3>
                  </div>
                  <div className="border border-gray-100 rounded-xl p-2 lg:p-3 flex justify-between items-center bg-[#fbfcfd] shadow-sm hover:shadow-md transition">
                    <span className="text-[10px] lg:text-[13px] font-bold text-gray-800 leading-tight pr-1 line-clamp-2">{newProducts[0].title}</span>
                    <div className="w-10 h-10 lg:w-14 lg:h-14 bg-[#f4f7fb] rounded-lg flex-shrink-0 flex items-center justify-center text-xl lg:text-2xl shadow-inner border border-gray-50 overflow-hidden p-1">
                      {newProducts[0].image_url && newProducts[0].image_url.length > 5 ? (
                        <img src={newProducts[0].image_url} alt={newProducts[0].title} className="w-full h-full object-contain" />
                      ) : (
                        <span>📦</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* AMC Products Card */}
              {amcProducts.length > 0 && (
                <div className="flex flex-col">
                  <div className="flex items-center text-[#21a868] mb-2 lg:mb-3">
                    <h3 className="font-bold text-[11px] lg:text-sm">AMC Products</h3>
                  </div>
                  <div className="border border-gray-100 rounded-xl p-2 lg:p-3 flex justify-between items-center bg-[#fbfcfd] shadow-sm hover:shadow-md transition">
                    <span className="text-[10px] lg:text-[13px] font-bold text-gray-800 leading-tight pr-1 line-clamp-2">{amcProducts[0].title}</span>
                    <div className="w-10 h-10 lg:w-14 lg:h-14 bg-[#f4f7fb] rounded-lg flex-shrink-0 flex items-center justify-center text-xl lg:text-2xl shadow-inner border border-gray-50 relative overflow-hidden p-1">
                      {amcProducts[0].image_url && amcProducts[0].image_url.length > 5 ? (
                        <img src={amcProducts[0].image_url} alt={amcProducts[0].title} className="w-full h-full object-contain" />
                      ) : (
                        <span>🛡️</span>
                      )}
                      <span className="absolute -top-1.5 -right-1.5 bg-[#4cda64] text-white text-[8px] px-1 py-0.5 rounded-sm font-bold shadow-sm z-10">AMC</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Masonry Image Grid */}
        <div className="w-full lg:w-[45%] h-full flex flex-col gap-4 pt-2 pb-2">
           
           {/* Desktop Search Bar (Only visible on desktop) */}
           <LiveSearchBar className="hidden lg:block" />

           <div className="hidden lg:flex gap-4 p-3 border-4 border-white/40 rounded-3xl bg-white/10 shadow-xl">
             {/* Left Tall Image */}
             <div className="w-1/2 flex flex-col justify-center">
                <Image 
                  src="/Hero1.webp" 
                  alt="Cleaning Service" 
                  width={600}
                  height={800}
                  priority
                  className="w-full h-auto lg:h-[550px] object-contain lg:object-cover rounded-2xl shadow-md"
                />
             </div>
             
             {/* Right Stacked Images */}
             <div className="w-1/2 flex flex-col gap-4 justify-center lg:h-[550px]">
                <Image 
                  src="/Hero 2.webp" 
                  alt="RO Repair" 
                  width={600}
                  height={400}
                  priority
                  className="w-full h-auto lg:h-[48%] object-contain lg:object-cover rounded-2xl shadow-md"
                />
                <Image 
                  src="/Hero3.webp" 
                  alt="AC Repair" 
                  width={600}
                  height={400}
                  priority
                  className="w-full h-auto lg:h-[48%] object-contain lg:object-cover rounded-2xl shadow-md"
                />
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
