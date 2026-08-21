import { Search, Scissors, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function Hero({ categories = [] }: { categories?: any[] }) {
  
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
    <div className="relative bg-gradient-to-br from-[#6277db] via-[#a268b8] to-[#db5285] text-white min-h-[calc(100vh-73px)] w-full font-sans overflow-hidden py-12 px-6 lg:px-12">
      
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-start h-full">
        
        {/* Left Side: Content & Cards */}
        <div className="w-full lg:w-[55%] flex flex-col space-y-6 z-10 pt-4">
          
          <h1 className="text-[42px] font-bold leading-[1.15] mb-2">
            Home Services at Your <br /> Doorsteps
          </h1>

          {/* Search Bar */}
          <div className="relative w-full shadow-lg">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 rounded-xl leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 sm:text-base border-none shadow-sm"
              placeholder="Search for Services ..."
            />
          </div>

          {/* Home Services Box */}
          <div className="bg-white rounded-2xl p-6 shadow-xl text-gray-800">
            <div className="flex items-center space-x-2 mb-6">
              <Scissors className="w-5 h-5 text-gray-700" />
              <h3 className="font-bold text-[17px]">Home Services...</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center justify-items-center">
              {homeServices.map((service, index) => (
                <Link href={`/category/${service.id}`} key={index} className="flex flex-col items-center space-y-3 cursor-pointer group">
                  <div className="w-20 h-20 bg-[#f4f7fb] rounded-xl flex items-center justify-center text-4xl shadow-sm group-hover:shadow-md transition overflow-hidden p-2">
                    {service.image_url && service.image_url.length > 5 ? (
                      <img src={service.image_url} alt={service.title} className="w-full h-full object-contain" />
                    ) : (
                      <span>{getIcon(service.title)}</span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 leading-tight">{service.title}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Row: New Products & AMC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            {/* New Products Card */}
            {newProducts.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-xl text-gray-800 flex flex-col">
                <div className="flex items-center space-x-2 text-[#2c8af8] mb-4">
                  <ShoppingCart className="w-5 h-5" fill="currentColor" />
                  <h3 className="font-bold text-sm">New Products</h3>
                </div>
                <Link href={`/category/${newProducts[0].id}`} className="border border-gray-100 rounded-xl p-3 flex justify-between items-center bg-[#fbfcfd] shadow-sm cursor-pointer hover:shadow-md transition">
                  <span className="text-[13px] font-bold text-gray-800">{newProducts[0].title}</span>
                  <div className="w-14 h-14 bg-[#f4f7fb] rounded-lg flex items-center justify-center text-2xl shadow-inner border border-gray-50 overflow-hidden p-1">
                    {newProducts[0].image_url && newProducts[0].image_url.length > 5 ? (
                      <img src={newProducts[0].image_url} alt={newProducts[0].title} className="w-full h-full object-contain" />
                    ) : (
                      <span>📦</span>
                    )}
                  </div>
                </Link>
              </div>
            )}

            {/* AMC Products Card */}
            {amcProducts.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-xl text-gray-800 flex flex-col">
                <div className="flex items-center text-[#21a868] mb-4">
                  <h3 className="font-bold text-sm">AMC Products</h3>
                </div>
                <Link href={`/category/${amcProducts[0].id}`} className="border border-gray-100 rounded-xl p-3 flex justify-between items-center bg-[#fbfcfd] shadow-sm cursor-pointer hover:shadow-md transition">
                  <span className="text-[13px] font-bold text-gray-800">{amcProducts[0].title}</span>
                  <div className="w-14 h-14 bg-[#f4f7fb] rounded-lg flex items-center justify-center text-2xl shadow-inner border border-gray-50 relative overflow-hidden p-1">
                    {amcProducts[0].image_url && amcProducts[0].image_url.length > 5 ? (
                      <img src={amcProducts[0].image_url} alt={amcProducts[0].title} className="w-full h-full object-contain" />
                    ) : (
                      <span>🛡️</span>
                    )}
                    <span className="absolute -top-1.5 -right-1.5 bg-[#4cda64] text-white text-[8px] px-1 py-0.5 rounded-sm font-bold shadow-sm z-10">AMC</span>
                  </div>
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Masonry Image Grid */}
        <div className="w-full lg:w-[45%] h-full flex gap-4 pt-2 pb-2">
           {/* Left Tall Image */}
           <div className="w-1/2 h-full flex flex-col">
              <img 
                src="/Hero1.webp" 
                alt="Cleaning Service" 
                className="w-full h-[220px] lg:h-[550px] object-cover rounded-2xl lg:rounded-3xl shadow-2xl border-4 border-white/40"
              />
           </div>
           
           {/* Right Stacked Images */}
           <div className="w-1/2 h-[220px] lg:h-[550px] flex flex-col gap-4">
              <img 
                src="/Hero 2.webp" 
                alt="RO Repair" 
                className="w-full h-[48%] object-cover rounded-2xl lg:rounded-3xl shadow-2xl border-4 border-white/40"
              />
              <img 
                src="/Hero3.webp" 
                alt="AC Repair" 
                className="w-full h-[48%] object-cover rounded-2xl lg:rounded-3xl shadow-2xl border-4 border-white/40"
              />
           </div>
        </div>

      </div>
    </div>
  );
}
