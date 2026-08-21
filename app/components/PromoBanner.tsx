import { CheckCircle2, Calendar, Snowflake, Droplets, Fan } from "lucide-react";

export default function PromoBanner() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-8 mb-16">
      {/* Banner Container */}
      <div className="bg-[#fefaf4] border-2 border-blue-900 rounded-3xl overflow-hidden relative shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Side Content */}
          <div className="p-10 lg:col-span-5 relative z-10">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="mb-6">
                  <img src="/logoomaa.webp" alt="OMAA Logo" className="h-12 object-contain" />
                </div>
                
                <h2 className="text-4xl md:text-5xl font-extrabold text-blue-900 leading-tight mb-4">
                  Appliances,<br />Repair, & Services
                </h2>
                <p className="text-gray-700 font-semibold mb-6">
                  We Repair. We Care. We're Always There!
                </p>
                
                <div className="bg-blue-900 text-white text-sm font-semibold rounded-lg px-4 py-2 inline-flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Fast Service | Expert Technicians | 100% Satisfaction</span>
                </div>
              </div>
              
              {/* Technicians Placeholder */}
              <div className="mt-8 flex items-end">
                <div className="w-48 h-32 bg-blue-100 rounded-t-xl border-4 border-white shadow-md flex items-center justify-center text-blue-900 font-bold">
                  Technicians Image
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Packages */}
          <div className="p-10 lg:col-span-7 border-l-2 border-dashed border-blue-200">
             
            <div className="flex justify-center items-center mb-8 relative">
              <div className="absolute left-0 right-0 h-0.5 bg-blue-900 z-0"></div>
              <h3 className="text-2xl font-bold text-blue-900 bg-[#fefaf4] px-4 z-10 relative">
                OMAA Company — PACKAGE
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Package 1 */}
              <div className="border-2 border-blue-900 rounded-xl p-6 flex flex-col items-center text-center bg-white relative shadow-sm hover:shadow-md transition">
                <span className="absolute -top-3 -left-3 bg-blue-900 text-white w-8 h-8 rounded flex items-center justify-center font-bold text-lg">1</span>
                <Fan className="w-16 h-16 text-blue-900 mb-4" />
                <h4 className="font-bold text-blue-900 text-xl leading-tight mb-4">1 & 2 AC<br/>SERVICE</h4>
                <div className="w-full h-px bg-blue-900 border-dashed mb-4"></div>
                <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
                  <Calendar className="w-6 h-6" />
                  <div className="text-left leading-tight">
                    <div>1 TIME</div>
                    <div>1 YEAR VALID</div>
                  </div>
                </div>
              </div>

              {/* Package 2 */}
              <div className="border-2 border-blue-900 rounded-xl p-6 flex flex-col items-center text-center bg-white relative shadow-sm hover:shadow-md transition">
                <span className="absolute -top-3 -left-3 bg-blue-900 text-white w-8 h-8 rounded flex items-center justify-center font-bold text-lg">2</span>
                <Snowflake className="w-16 h-16 text-blue-900 mb-4" />
                <h4 className="font-bold text-blue-900 text-xl leading-tight mb-4">1 REFRIGERATOR<br/>SERVICE / VISIT</h4>
                <div className="w-full h-px bg-blue-900 border-dashed mb-4"></div>
                <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
                  <Calendar className="w-6 h-6" />
                  <div className="text-left leading-tight">
                    <div>1 TIME</div>
                    <div>1 YEAR VALID</div>
                  </div>
                </div>
              </div>

              {/* Package 3 */}
              <div className="border-2 border-blue-900 rounded-xl p-6 flex flex-col items-center text-center bg-white relative shadow-sm hover:shadow-md transition">
                <span className="absolute -top-3 -left-3 bg-blue-900 text-white w-8 h-8 rounded flex items-center justify-center font-bold text-lg">3</span>
                <Droplets className="w-16 h-16 text-blue-900 mb-4" />
                <h4 className="font-bold text-blue-900 text-xl leading-tight mb-4">RO AMC<br/>ALL FILTERS</h4>
                <div className="w-full h-px bg-blue-900 border-dashed mb-4"></div>
                <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
                  <Calendar className="w-6 h-6" />
                  <div className="text-left leading-tight">
                    <div>4 TIMES SERVICE</div>
                    <div>1 YEAR VALID</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Tag */}
            <div className="flex justify-center relative">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-blue-900 z-0"></div>
              <div className="bg-blue-900 text-white text-4xl font-extrabold px-12 py-3 rounded-full relative z-10 border-4 border-[#fefaf4] shadow-lg">
                ₹4000/-
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
