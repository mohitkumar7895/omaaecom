import { Star } from "lucide-react";

export default function ProductsSection() {
  const amcProducts = [
    { title: "Aqua Ultra", rating: "4.9", reviews: "208K", discount: "28% OFF" },
    { title: "Aquafresh", rating: "4.7", reviews: "224K", discount: "28% OFF" },
    { title: "Aqua Grand Plus", rating: "4.5", reviews: "150K", discount: "38% OFF" },
    { title: "Aqua Grand", rating: "4.5", reviews: "222K", discount: "38% OFF", bg: "bg-blue-500 text-white" },
    { title: "RO & Refrigerator", rating: "4.8", reviews: "262K", discount: "36% OFF" },
    { title: "AC / Water Purifier / Refrigerator", rating: "4.9", reviews: "523K", discount: "44% OFF" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      {/* New Products Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 inline-block border-b-4 border-pink-500 pb-2">
          New Products
        </h2>
        
        <div className="w-80 h-48 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
          <div className="w-12 h-12 bg-gray-200 rounded mb-4"></div>
          <p className="font-medium text-sm">New Products Plans coming soon.</p>
        </div>
      </div>

      {/* AMC Products Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 inline-block border-b-4 border-purple-500 pb-2">
          AMC Products
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {amcProducts.map((product, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden group cursor-pointer flex flex-col h-full">
              {/* Image Area */}
              <div className={`relative h-40 bg-gray-100 w-full flex-shrink-0 ${product.bg ? product.bg : ''} flex flex-col justify-center items-center`}>
                {product.discount && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md z-10">
                    {product.discount}
                  </span>
                )}
                {/* Placeholder Image Content */}
                <div className="text-4xl">
                  {product.bg ? "💧" : "🔧"}
                </div>
              </div>
              
              {/* Text Area */}
              <div className="p-4 flex flex-col flex-1 justify-between">
                <h3 className="font-semibold text-sm text-gray-800 mb-2 leading-snug">{product.title}</h3>
                <div className="flex items-center space-x-1 text-xs text-gray-500 font-medium mt-auto">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-gray-700">{product.rating}</span>
                  <span>({product.reviews})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
