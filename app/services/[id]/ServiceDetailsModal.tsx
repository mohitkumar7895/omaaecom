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
    if (service?.category_id) {
      getRateCardsByCategoryId(service.category_id).then((data) => {
        if (data && data.length > 0) {
          setLiveRateCards(data);
        } else if (rateCards && rateCards.length > 0) {
          setLiveRateCards(rateCards);
        }
      });
    } else if (rateCards && rateCards.length > 0) {
      setLiveRateCards(rateCards);
    }
  }, [service, rateCards]);

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

            {/* Dedicated Rate Cards Modal Popup */}
            {showRateCardModal && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
                  
                  {/* Modal Header */}
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-amber-400" />
                      <div>
                        <h3 className="font-bold text-base">Rate Cards & Spare Parts</h3>
                        <p className="text-gray-400 text-xs">{service.title || "Service Parts Pricing"}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowRateCardModal(false)}
                      className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Content Table */}
                  <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                    {liveRateCards && liveRateCards.length > 0 ? (
                      <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                          <thead>
                            <tr className="bg-slate-100 text-gray-800 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                              <th className="py-3 px-4">Part / Description</th>
                              <th className="py-3 px-4 text-center">Part Price</th>
                              <th className="py-3 px-4 text-right">Labour Charges</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {liveRateCards.map((rc: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3.5 px-4 font-semibold text-gray-900">
                                  <div>{rc.part_name}</div>
                                  {rc.heading_title && (
                                    <span className="inline-block bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded mt-1">
                                      {rc.heading_title}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 text-center font-bold text-gray-900 text-sm">
                                  ₹{Number(rc.price).toLocaleString()}
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <span className="font-bold text-indigo-600 text-sm">₹{Number(rc.labour_charges).toLocaleString()}</span>
                                  {rc.labour_note && (
                                    <div className="text-[10px] text-gray-400 font-medium mt-0.5">{rc.labour_note}</div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center text-gray-500 text-sm font-medium">
                        Standard visiting charges included. Detailed spare parts pricing will be provided on-site by technician.
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
                    <button 
                      onClick={() => setShowRateCardModal(false)}
                      className="bg-slate-900 hover:bg-black text-white font-bold px-6 py-2.5 rounded-xl text-xs transition"
                    >
                      Close
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
