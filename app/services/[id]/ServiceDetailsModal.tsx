"use client";

import { X, Star, CheckCircle2, Check, FileText, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { getRateCardsByCategoryId } from "../../actions/rateCards";

type ServiceDetailsModalProps = {
  service: any;
  onClose: () => void;
  onAdd: (service: any) => void;
  quantity?: number;
  onRemove?: () => void;
  rateCards?: any[];
};

export default function ServiceDetailsModal({ service, onClose, onAdd, quantity = 0, onRemove, rateCards = [] }: ServiceDetailsModalProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showRateCardModal, setShowRateCardModal] = useState<boolean>(false);
  const [liveRateCards, setLiveRateCards] = useState<any[]>(rateCards);

  useEffect(() => {
    getRateCardsByCategoryId(service?.category_id || 1, service?.title).then((data) => {
      if (data && data.length > 0) {
        setLiveRateCards(data);
      }
    });
  }, [service]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-[95vh] sm:h-[90vh] md:h-[85vh] rounded-t-3xl sm:rounded-3xl md:rounded-2xl flex flex-col relative shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-md p-1.5 sm:p-2 rounded-full shadow-sm hover:bg-white text-gray-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero Image */}
          <div className="w-full h-[180px] sm:h-[240px] bg-gray-100 relative">
            {service.image_url ? (
              <img src={service.image_url} alt={service.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
            )}
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {/* Title & Rating */}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2">{service.title}</h2>
            <div className="flex items-center space-x-1 text-[13px] sm:text-sm text-gray-500 mb-4 sm:mb-6">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="font-bold text-black">{service.rating || '4.8'}</span>
              <span>({service.reviews ? `${service.reviews}` : '0 reviews'})</span>
            </div>

            {/* OC Warranty Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 flex gap-3 mb-4">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-700 mb-0.5 sm:mb-1 text-sm sm:text-base">OC Warranty</h4>
                <p className="text-xs sm:text-sm text-gray-600">New paid service. {service.warranty_days || 180}-day warranty after completion.</p>
              </div>
            </div>

            {/* Clean 'Rate Cards' Button that opens dedicated popup modal */}
            <div className="mb-6">
              <button 
                type="button"
                onClick={() => setShowRateCardModal(true)}
                className="w-full flex items-center justify-between bg-[#1e293b] hover:bg-[#0f172a] text-white font-bold py-3.5 px-5 rounded-2xl transition shadow-sm group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[15px] font-extrabold tracking-wide">Rate Cards</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-300 font-medium group-hover:text-white">View Pricing</span>
                  <span className="text-gray-400 group-hover:translate-x-0.5 transition-transform text-base">→</span>
                </div>
              </button>
            </div>

            {/* Dedicated Rate Cards Modal Popup - Ultra Premium Luxury Theme */}
            {showRateCardModal && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border border-gray-100 animate-in zoom-in-95 duration-200">
                  
                  {/* Premium Modal Header */}
                  <div className="p-5 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 font-black">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-white">Official Rate Card & Spare Parts</h3>
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Verified
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs mt-0.5 font-medium">{service.title || "Standard Spare Parts & Labour Catalog"}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setShowRateCardModal(false)}
                      className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition z-10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Info Notice Banner */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 px-5 py-3 border-b border-blue-100/60 flex items-center justify-between text-xs text-blue-900 font-medium">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>100% Genuine Spare Parts • Transparent Pricing • Standard Labour Charges</span>
                    </div>
                    <span className="bg-white/80 font-bold px-2.5 py-0.5 rounded-full border border-blue-200/60 text-[11px] text-blue-700 shadow-2xs">
                      {liveRateCards?.length || 0} Items
                    </span>
                  </div>

                  {/* Modal Content - 100% Responsive without Horizontal Scroll on Mobile */}
                  <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-[#fafafc]">
                    {liveRateCards && liveRateCards.length > 0 ? (
                      <div>
                        {/* Mobile View: Fluid Vertical Card Rows (Zero Horizontal Scroll!) */}
                        <div className="md:hidden space-y-3">
                          {liveRateCards.map((rc: any, idx: number) => (
                            <div 
                              key={idx} 
                              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-2.5"
                            >
                              {/* Top row: Heading Tag and Index */}
                              <div className="flex items-center justify-between">
                                <span className="inline-block bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-slate-200/60 uppercase tracking-wider">
                                  {rc.heading_title || "General"}
                                </span>
                                <span className="text-[11px] font-bold text-slate-400">#{idx + 1}</span>
                              </div>

                              {/* Part Name */}
                              <div className="font-extrabold text-slate-900 text-[13px] leading-snug">
                                {rc.part_name}
                              </div>

                              {/* Bottom row: Prices Grid */}
                              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                                <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
                                  <span className="text-[10px] font-bold text-emerald-700 block uppercase">Part Price</span>
                                  <span className="text-sm font-black text-emerald-900">₹{Number(rc.price).toLocaleString()}</span>
                                </div>
                                
                                <div className="bg-indigo-50/70 p-2 rounded-xl border border-indigo-100 text-right">
                                  <span className="text-[10px] font-bold text-indigo-700 block uppercase">Labour Charges</span>
                                  <span className="text-sm font-black text-indigo-900">₹{Number(rc.labour_charges).toLocaleString()}</span>
                                  {rc.labour_note && (
                                    <div className="text-[9px] text-slate-400 font-medium truncate mt-0.5">{rc.labour_note}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Desktop View: Full Width Clean Table */}
                        <div className="hidden md:block border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs bg-white">
                          <table className="w-full text-left border-collapse text-xs sm:text-sm">
                            <thead>
                              <tr className="bg-slate-900 text-white text-[11px] font-extrabold uppercase tracking-wider">
                                <th className="py-3.5 px-3 text-center border-r border-slate-800 w-12 text-slate-400">#</th>
                                <th className="py-3.5 px-4 border-r border-slate-800">Heading</th>
                                <th className="py-3.5 px-4 border-r border-slate-800">Part / Service Description</th>
                                <th className="py-3.5 px-4 text-center border-r border-slate-800">Part Price</th>
                                <th className="py-3.5 px-4 text-right">Labour Charges</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {liveRateCards.map((rc: any, idx: number) => (
                                <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group">
                                  <td className="py-3.5 px-3 text-center font-bold text-slate-400 border-r border-slate-100 text-xs">
                                    {idx + 1}
                                  </td>
                                  <td className="py-3.5 px-4 border-r border-slate-100">
                                    <span className="inline-block bg-slate-100 group-hover:bg-white text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
                                      {rc.heading_title || "General"}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 font-bold text-slate-900 border-r border-slate-100">
                                    <span className="group-hover:text-indigo-600 transition-colors">{rc.part_name}</span>
                                  </td>
                                  <td className="py-3.5 px-4 text-center border-r border-slate-100">
                                    <span className="inline-block bg-emerald-50 text-emerald-800 font-extrabold text-sm px-2.5 py-1 rounded-lg border border-emerald-200/60 shadow-2xs">
                                      ₹{Number(rc.price).toLocaleString()}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-right">
                                    <div className="font-extrabold text-indigo-600 text-sm">
                                      ₹{Number(rc.labour_charges).toLocaleString()}
                                    </div>
                                    {rc.labour_note && (
                                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">{rc.labour_note}</div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center shadow-xs">
                        <FileText className="w-10 h-10 text-slate-300 mb-3" />
                        <h4 className="font-bold text-slate-800 text-base mb-1">Standard Rates Apply</h4>
                        <p className="text-slate-500 text-xs max-w-sm">
                          Standard visiting charges included. Detailed spare parts pricing will be provided on-site by technician.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Premium Modal Footer */}
                  <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center justify-between">
                    <p className="text-[11px] text-slate-400 font-medium">
                      Prices are inclusive of standard inspection & testing.
                    </p>
                    <button 
                      onClick={() => setShowRateCardModal(false)}
                      className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold px-7 py-2.5 rounded-xl text-xs transition shadow-md hover:shadow-lg"
                    >
                      Close Window
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* About the service */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 inline-block mb-4 border-b-2 border-purple-500 pb-1">
                About the service
              </h3>
              {service.long_description ? (
                <ul className="space-y-3">
                  {service.long_description.split('|').map((point: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 text-[15px]">{point.trim()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600 text-[15px]">Professional and high-quality service</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600 text-[15px]">Standard safety and hygiene protocols</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600 text-[15px]">Experienced and verified professionals</span>
                  </li>
                </ul>
              )}
            </div>

            {/* How it works */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 inline-block mb-6 border-b-2 border-purple-500 pb-1">
                How it works
              </h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-[#6069c9] text-white font-bold text-sm shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">1</div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 shadow-sm bg-white ml-4 md:ml-0">
                    <h4 className="font-bold text-slate-900">Book your service</h4>
                    <p className="text-sm text-slate-500">Select date and time slot</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-[#6069c9] text-white font-bold text-sm shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">2</div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 shadow-sm bg-white ml-4 md:ml-0">
                    <h4 className="font-bold text-slate-900">Professional arrives</h4>
                    <p className="text-sm text-slate-500">Verified and trained expert</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-[#6069c9] text-white font-bold text-sm shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">3</div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 shadow-sm bg-white ml-4 md:ml-0">
                    <h4 className="font-bold text-slate-900">Service completed</h4>
                    <p className="text-sm text-slate-500">Quality assured work</p>
                  </div>
                </div>

              </div>
            </div>

            {/* FAQ */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 inline-block mb-4 border-b-2 border-purple-500 pb-1">
                Frequently Asked Questions
              </h3>
              <div className="space-y-2">
                {[
                  { q: "How long does the service take?", a: "The service typically takes 2-3 hours depending on the condition and type of appliance." },
                  { q: "Do you provide warranty?", a: `Yes, we provide ${service.warranty_days || 180} days service warranty on all services.` },
                  { q: "What if I need to reschedule?", a: "You can reschedule free of charge up to 2 hours before your appointment." }
                ].map((faq, i) => (
                  <div key={i} className="border-b border-gray-100 last:border-0 pb-2">
                    <button 
                      onClick={() => toggleFaq(i)}
                      className="w-full flex justify-between items-center py-3 text-left font-semibold text-gray-800 text-[15px]"
                    >
                      {faq.q}
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === i && (
                      <div className="pb-4 text-gray-600 text-sm animate-in slide-in-from-top-1">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Ratings & Reviews */}
            <div className="mb-8 sm:mb-20">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 inline-block mb-3 sm:mb-4 border-b-2 border-purple-500 pb-1">
                Ratings & Reviews
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm">Review option will appear after your work status is complete.</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 bg-white p-3 sm:p-4 flex items-center justify-between sticky bottom-0 rounded-b-3xl sm:rounded-b-2xl">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">₹{Number(service.selling_price)}</div>
            <div className="text-xs sm:text-sm text-gray-500">{service.duration || '45 mins'}</div>
          </div>
          {quantity > 0 ? (
            <div className="bg-white border border-[#6069c9] text-[#6069c9] text-sm sm:text-[15px] font-bold h-9 sm:h-11 w-28 sm:w-32 rounded-lg shadow-sm flex items-center justify-between px-2">
              <button 
                onClick={(e) => { e.preventDefault(); onRemove && onRemove(); }}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-blue-50 rounded-md transition"
              >
                -
              </button>
              <span className="text-[#6069c9]">{quantity}</span>
              <button 
                onClick={(e) => { e.preventDefault(); onAdd(service); }}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-blue-50 rounded-md transition"
              >
                +
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onAdd(service)}
              className="bg-[#7780d6] text-white font-bold py-2 sm:py-2.5 px-6 sm:px-8 rounded-xl hover:bg-[#6069c9] transition shadow-md text-sm sm:text-base"
            >
              Add to Cart
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
