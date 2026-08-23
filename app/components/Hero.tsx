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
    <div className="relative bg-gradient-to-br from-[#6277db] via-[#a268b8] to-[#db5285] text-white w-full font-sans overflow-hidden py-3 md:py-12 px-4 md:px-12">

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">

        {/* Left Side: Content & Cards */}
        <div className="w-full md:w-1/2 flex flex-col space-y-4 md:space-y-6 z-10 pt-2 md:pt-4">

          {/* Mobile Carousel placed before title or replacing title on mobile */}
          <MobileBannerCarousel banners={banners} />

          <h1
            className="hidden md:block text-[38px] lg:text-[48px] xl:text-[54px] font-bold tracking-tight leading-[1.15] mb-6 text-white drop-shadow-lg"
          >
            Home services at your <br /> doorsteps
          </h1>

          {/* Mobile Search Bar (Only visible on mobile) */}
          <LiveSearchBar className="md:hidden" />

          {/* Unified Services Box */}
          <div className="bg-white rounded-[24px] p-5 md:p-6 shadow-2xl text-gray-800 flex flex-col flex-1 justify-between space-y-3">

            {/* Top Section: Home Services */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Scissors className="w-5 h-5 text-gray-800" />
                <h3 className="font-bold text-[18px] md:text-[20px] text-gray-900 tracking-tight">Home Services</h3>
              </div>
              <div className="grid grid-cols-3 gap-y-3 gap-x-1 sm:gap-x-2 text-center justify-items-center">
                {homeServices.map((service, index) => (
                  <Link href={`/services/${service.id}`} key={index} className="flex flex-col items-center group w-full cursor-pointer">
                    <div className="w-[84px] h-[84px] md:w-[92px] md:h-[92px] bg-[#f4f5f8] rounded-[16px] flex items-center justify-center text-[32px] md:text-[38px] shadow-sm group-hover:shadow-md transition-all overflow-hidden p-1.5 mb-1.5 group-hover:-translate-y-1">
                      {service.image_url && service.image_url.length > 5 ? (
                        <img src={service.image_url} alt={service.title} className="w-full h-full object-contain" />
                      ) : (
                        <span>{getIcon(service.title)}</span>
                      )}
                    </div>
                    <span className="text-[12px] md:text-[13px] font-medium text-gray-800 leading-tight group-hover:text-black transition-colors px-1">{service.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gray-100 my-2"></div>

            {/* Bottom Section: New Products & AMC */}
            <div className="grid grid-cols-2 gap-3 w-full pb-2">
              {/* New Products Card */}
              {newProducts.length > 0 && (
                <Link href={`/services/${newProducts[0].id}`} className="flex flex-col group cursor-pointer bg-[#f4f5f8] rounded-2xl p-3 md:p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-1.5 text-[#2c8af8] mb-2">
                    <ShoppingCart className="w-6 h-5" fill="currentColor" />
                    <span className="font-bold text-[14px] md:text-[15px] tracking-tight truncate leading-none pt-0.5">New Products</span>
                  </div>
                  <div className="flex justify-center items-center mt-1">
                    <div className="w-24 h-24 md:w-[96px] md:h-[96px] bg-white rounded-[14px] flex-shrink-0 flex items-center justify-center shadow-sm overflow-hidden p-1 group-hover:-translate-y-0.5 transition-transform">
                      {newProducts[0].image_url && newProducts[0].image_url.length > 5 ? (
                        <img src={newProducts[0].image_url} alt={newProducts[0].title} className="w-full h-full object-contain" />
                      ) : (
                        <span>📦</span>
                      )}
                    </div>
                  </div>
                </Link>
              )}

              {/* AMC Products Card */}
              {amcProducts.length > 0 && (
                <Link href={`/services/${amcProducts[0].id}`} className="flex flex-col group cursor-pointer bg-[#f4f5f8] rounded-2xl p-3 md:p-4 hover:bg-gray-100 transition-colors relative">
                  <div className="flex items-center space-x-1.5 text-[#21a868] mb-2">
                    <span className="font-bold text-[14px] md:text-[15px] tracking-tight truncate leading-none pt-0.5">RO AMC</span>
                  </div>
                  <div className="flex justify-center items-center mt-1">
                    <div className="w-24 h-24 md:w-[96px] md:h-[96px] bg-white rounded-[14px] flex-shrink-0 flex items-center justify-center shadow-sm relative overflow-hidden p-1 group-hover:-translate-y-0.5 transition-transform">
                      {amcProducts[0].image_url && amcProducts[0].image_url.length > 5 ? (
                        <img src={amcProducts[0].image_url} alt={amcProducts[0].title} className="w-full h-full object-contain" />
                      ) : (
                        <span>🛡️</span>
                      )}
                    </div>
                  </div>
                  <span className="absolute top-3 right-3 bg-[#21a868] text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold shadow-sm">PRO</span>
                </Link>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Masonry Image Grid */}
        <div className="w-full md:w-1/2 flex items-stretch justify-center pt-2 md:pt-4">

          <div className="hidden md:flex gap-3 p-3 border-4 border-white/20 rounded-[32px] bg-white/10 shadow-xl backdrop-blur-sm w-full max-w-[420px] h-full">
            {/* Left Tall Image */}
            <div className="w-1/2 h-full">
              <Image
                src="/Hero1.webp"
                alt="Cleaning Service"
                width={600}
                height={800}
                priority
                className="w-full h-full object-cover rounded-[20px] shadow-md"
              />
            </div>

            {/* Right Stacked Images */}
            <div className="w-1/2 h-full flex flex-col gap-3">
              <Image
                src="/Hero 2.webp"
                alt="RO Repair"
                width={600}
                height={400}
                priority
                className="w-full h-[calc(50%-6px)] object-cover rounded-[20px] shadow-md"
              />
              <Image
                src="/Hero3.webp"
                alt="AC Repair"
                width={600}
                height={400}
                priority
                className="w-full h-[calc(50%-6px)] object-cover rounded-[20px] shadow-md"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
