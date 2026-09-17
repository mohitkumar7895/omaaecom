import { ShoppingCart, ShieldCheck } from "lucide-react";

export default function HeroBottom() {
  return (
    <div className="max-w-6xl mx-auto px-8 -mt-16 relative z-30 mb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* New Products Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
          <div className="flex items-center space-x-2 text-blue-600 mb-6">
            <ShoppingCart className="w-5 h-5" />
            <h2 className="font-bold text-lg">New Products</h2>
          </div>
          
          <div className="border border-gray-100 rounded-xl p-4 flex justify-between items-center bg-gray-50/50 hover:shadow-md transition cursor-pointer">
             <span className="font-semibold text-gray-800">New Products</span>
             <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center shadow-inner">
                {/* Placeholder for Water Purifier Image */}
                💧
             </div>
          </div>
        </div>

        {/* AMC Products Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
          <div className="flex items-center space-x-2 text-emerald-600 mb-6">
            <h2 className="font-bold text-lg">AMC Products</h2>
          </div>
          
          <div className="border border-gray-100 rounded-xl p-4 flex justify-between items-center bg-gray-50/50 hover:shadow-md transition cursor-pointer">
             <span className="font-semibold text-gray-800">RO AMC</span>
             <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center shadow-inner relative">
                {/* Placeholder for RO System Image */}
                🚰
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-1 py-0.5 rounded font-bold">1 Yr AMC</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
