"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Gift, Wallet, PlayCircle, Clock, CheckCircle2, AlertCircle, X } from "lucide-react";

interface CashbackFeaturesProps {
  orderId: string;
  isEligible?: boolean;
}

export default function CashbackFeatures({ orderId, isEligible = true }: CashbackFeaturesProps) {
  const [mounted, setMounted] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCashbackModal, setShowCashbackModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'service' | 'cashback' | 'center'>('center');
  
  const [loading, setLoading] = useState(false);
  const [cashbackData, setCashbackData] = useState<any>(null);
  const [adCountdown, setAdCountdown] = useState(10);
  const [playingAd, setPlayingAd] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [adPaused, setAdPaused] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const [dragPercent, setDragPercent] = useState(25);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchCashbackData();
  }, []);

  // When data loads, if they already picked one, lock the UI to it permanently.
  useEffect(() => {
    if (cashbackData) {
      if (cashbackData.service_opted) {
        setActiveTab('service');
        setDragPercent(0);
      } else if (cashbackData.ad_watched) {
        setActiveTab('cashback');
        setDragPercent(50);
      }
    }
  }, [cashbackData]);

  useEffect(() => {
    if (!isDragging) {
      if (activeTab === 'center') setDragPercent(25);
      else if (activeTab === 'service') setDragPercent(0);
      else if (activeTab === 'cashback') setDragPercent(50);
    }
  }, [activeTab, isDragging]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isEligible) return;
    if (activeTab !== 'center') return; // LOCKED! Cannot drag if already locked
    (e.target as HTMLDivElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current || !isEligible) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    let left = percent - 25; 
    if (left < 0) left = 0;
    if (left > 50) left = 50;
    setDragPercent(left);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !isEligible) return;
    setIsDragging(false);
    (e.target as HTMLDivElement).releasePointerCapture(e.pointerId);
    
    // Require a hard swipe (almost to the edges) to prevent accidental triggers
    if (dragPercent < 5) {
      setActiveTab('service');
      setShowServiceModal(true);
    } else if (dragPercent > 45) {
      setActiveTab('cashback');
      setShowCashbackModal(true);
    } else {
      setDragPercent(25); // Snap back to center if they didn't swipe fully
    }
  };

  const handleBgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging || activeTab !== 'center' || !isEligible) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    if (x > rect.width / 2) {
      setActiveTab('cashback');
      setShowCashbackModal(true);
    } else {
      setActiveTab('service');
      setShowServiceModal(true);
    }
  };

  const fetchCashbackData = async () => {
    if (!isEligible) return; // Don't fetch if not eligible
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/cashback?orderId=${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setCashbackData(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (showCashbackModal && !cashbackData && isEligible) {
      fetchCashbackData();
    }
  }, [showCashbackModal, isEligible]);

  // Handle Ad Watch
  useEffect(() => {
    let interval: any;
    if (playingAd && !adPaused && adCountdown > 0) {
      interval = setInterval(() => {
        setAdCountdown((prev) => {
          const next = prev - 1;
          
          // Slideshow logic
          const config = cashbackData?.adConfig;
          if (config?.ad_type === 'image' && config?.media_urls?.length > 1) {
            const totalDuration = config.duration || 20;
            const numImages = config.media_urls.length;
            const secondsPerImage = totalDuration / numImages;
            const timeElapsed = totalDuration - next;
            const newIndex = Math.min(numImages - 1, Math.floor(timeElapsed / secondsPerImage));
            setCurrentImageIndex(newIndex);
          }
          
          return next;
        });
      }, 1000);
    } else if (playingAd && adCountdown === 0) {
      setPlayingAd(false);
      markAdAsWatched();
    }
    return () => clearInterval(interval);
  }, [playingAd, adCountdown, adPaused, cashbackData]);

  // Handle 24h Timer
  useEffect(() => {
    let interval: any;
    if (cashbackData?.ad_watched && cashbackData?.ad_watched_at) {
      const calculateTimeLeft = () => {
        const watchedTime = new Date(cashbackData.ad_watched_at).getTime();
        const endTime = watchedTime + 24 * 60 * 60 * 1000;
        const now = new Date().getTime();
        return Math.max(0, endTime - now);
      };

      setTimeLeft(calculateTimeLeft());
      
      interval = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cashbackData]);

  const markAdAsWatched = async () => {
    try {
      await fetch('/api/bookings/cashback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      fetchCashbackData(); // Refresh data to get ad_watched_at timestamp
    } catch (e) {
      console.error(e);
    }
  };

  const markServiceAsOpted = async () => {
    try {
      await fetch('/api/bookings/cashback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action: 'opt_service' })
      });
      fetchCashbackData(); // Refresh data
    } catch (e) {
      console.error(e);
    }
  };

  const startAd = () => {
    const config = cashbackData?.adConfig;
    setAdCountdown(config?.duration || 20);
    setPlayingAd(true);
    setAdPaused(false);
    setCurrentImageIndex(0);
  };

  // Format 24h timer (HH:MM:SS)
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderModals = () => {
    // ... modal code ... (not changing)
    if (!mounted) return null;

    return createPortal(
      <>
        {/* Service Modal */}
        {showServiceModal && (
          <div 
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/70"
            style={{ animation: 'modal-overlay 0.3s ease-out forwards' }}
          >
            <div 
              className="bg-white rounded-[24px] max-w-sm w-full p-8 text-center relative shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-gray-100"
              style={{ animation: 'modal-content 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            >
              <button onClick={() => setShowServiceModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-transform hover:rotate-90">
                <X className="w-6 h-6" />
              </button>
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100">
                <Gift className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">365 Days Free Service</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Congratulations! This product includes a complimentary 1-year free service plan. We've got you covered!
              </p>
              <button onClick={() => {
                if (!cashbackData?.service_opted) {
                  markServiceAsOpted();
                }
                setShowServiceModal(false);
              }} className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)] hover:shadow-[0_10px_25px_-8px_rgba(37,99,235,0.8)] active:scale-95 text-lg">
                {cashbackData?.service_opted ? 'Close' : 'Claim Service'}
              </button>
            </div>
          </div>
        )}

        {/* Cashback Modal */}
        {showCashbackModal && (
          <div 
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/70"
            style={{ animation: 'modal-overlay 0.3s ease-out forwards' }}
          >
            <div 
              className="bg-white rounded-[24px] max-w-md w-full p-6 sm:p-8 text-center relative shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-gray-100 overflow-hidden"
              style={{ animation: 'modal-content 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            >
              <button onClick={() => { setShowCashbackModal(false); setPlayingAd(false); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 z-10 transition-transform hover:rotate-90">
                <X className="w-6 h-6" />
              </button>
              
              {loading ? (
                <div className="py-12 flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500 font-medium text-lg">Loading your cashback status...</p>
                </div>
              ) : (
                <>
                  {!cashbackData?.ad_watched ? (
                    /* Step 1: Watch Ad */
                    <div>
                      <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Claim Your Cashback</h3>
                      <p className="text-gray-500 font-medium text-base mb-6">Watch to unlock your cashback timer.</p>
                      
                      <div 
                        className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden mb-6 flex items-center justify-center shadow-inner cursor-pointer"
                        onPointerDown={() => playingAd && setAdPaused(true)}
                        onPointerUp={() => playingAd && setAdPaused(false)}
                        onPointerLeave={() => playingAd && setAdPaused(false)}
                      >
                        {playingAd ? (
                          <div className="w-full h-full relative">
                            {cashbackData?.adConfig?.ad_type === 'image' ? (
                              <img 
                                src={cashbackData?.adConfig?.media_urls[currentImageIndex] || ''} 
                                alt="Ad" 
                                className="w-full h-full object-contain bg-black transition-opacity duration-500"
                              />
                            ) : (() => {
                              const videoSrc = cashbackData?.adConfig?.media_urls?.[0] || '';
                              // Check if YouTube URL
                              const ytMatch = videoSrc.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                              if (ytMatch && ytMatch[1]) {
                                return (
                                  <iframe
                                    src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytMatch[1]}`}
                                    className="w-full h-full border-0 pointer-events-none"
                                    allow="autoplay; encrypted-media"
                                  />
                                );
                              }
                              return (
                                <video 
                                  src={videoSrc} 
                                  autoPlay 
                                  playsInline 
                                  muted 
                                  loop
                                  className="w-full h-full object-contain bg-black"
                                  ref={(el) => {
                                    if (el) {
                                      if (adPaused) el.pause();
                                      else el.play().catch(()=>{});
                                    }
                                  }}
                                />
                              );
                            })()}
                            
                            {/* Overlay Controls */}
                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-white/10 z-10">
                              <div className={`w-2 h-2 rounded-full ${adPaused ? 'bg-amber-500' : 'bg-green-500 animate-pulse'}`}></div>
                              <span className="text-sm font-bold text-white font-mono">{adCountdown}s</span>
                            </div>
                            
                            {adPaused && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px] z-20">
                                <div className="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                                  <div className="w-3 h-4 border-l-4 border-r-4 border-gray-900"></div>
                                  Paused
                                </div>
                              </div>
                            )}

                            {!adPaused && (
                              <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none z-10">
                                <span className="bg-black/50 text-white text-[10px] px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
                                  Hold to Pause
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button onClick={startAd} className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3.5 rounded-full flex items-center gap-2 transition transform hover:scale-105 active:scale-95 shadow-[0_8px_20px_-8px_rgba(245,158,11,0.6)] text-lg">
                            <PlayCircle className="w-6 h-6" /> Watch Now
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Step 2: Timer & Result */
                    <div className="pt-4">
                      <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-amber-100">
                        <Wallet className="w-8 h-8 text-amber-500" />
                      </div>
                      
                      {timeLeft > 0 ? (
                        <div>
                          <h3 className="text-xl font-extrabold text-gray-900 mb-2">Cashback Unlocking in</h3>
                          <div className="text-4xl font-black text-amber-500 tracking-wider my-6 font-mono drop-shadow-sm">
                            {formatTime(timeLeft)}
                          </div>
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-left shadow-sm">
                            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[14px] text-amber-800 font-medium">Your cashback will be revealed after 24 hours. Check back later!</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {cashbackData.working_status === 'Completed' ? (
                            <div className="text-left">
                              <h3 className="text-2xl font-extrabold text-green-600 mb-2 text-center">100% Cashback Unlocked! 🎉</h3>
                              <p className="text-gray-500 font-medium mb-4 text-center text-sm">Here is how you will receive your cashback:</p>
                              
                              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-4 shadow-sm">
                                <ul className="space-y-3 text-sm text-green-800 font-medium leading-relaxed">
                                  <li className="flex gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                    <span>You will receive <b>₹4 daily</b> in your Omaa Wallet.</span>
                                  </li>
                                  <li className="flex gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                    <span>A new 24-hour timer will run every day.</span>
                                  </li>
                                  <li className="flex gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                    <span>Once the timer finishes, go to the Cashback page and click "Claim" to add it to your Wallet.</span>
                                  </li>
                                  <li className="flex gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                    <span>Keep claiming daily until you receive the full 100% value of your product!</span>
                                  </li>
                                </ul>
                              </div>
                              
                              <a href="/cashback" className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition transform hover:scale-[1.02] active:scale-95 shadow-[0_8px_20px_-8px_rgba(22,163,74,0.6)] text-lg">
                                Go to Cashback Page
                              </a>
                            </div>
                          ) : (
                            <div>
                              <h3 className="text-xl font-extrabold text-gray-900 mb-2">Almost There! ⏳</h3>
                              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-left my-6 shadow-sm">
                                <AlertCircle className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-[14px] text-blue-800 font-medium">The 24-hour timer is complete! We are just waiting for the technician to mark the job as <strong>Completed</strong> to release your cashback.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </>,
      document.body
    );
  };

  return (
    <div className="relative">
      {/* Sleek Claim Cashback Pill Button (matching user's design) */}
      <button 
        type="button"
        onClick={() => {
          if (cashbackData?.service_opted) {
            setShowServiceModal(true);
          } else if (cashbackData?.ad_watched) {
            setShowCashbackModal(true);
          } else {
            // Open selection toggle modal
            setShowServiceModal(false);
            setShowCashbackModal(false);
            setActiveTab('center');
            setDragPercent(25);
            setShowToggleModal(true);
          }
        }}
        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm flex items-center gap-2 ${
          cashbackData?.service_opted 
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : cashbackData?.ad_watched 
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : "bg-[#00a86b] hover:bg-[#00925d] text-white shadow-emerald-500/20 active:scale-95"
        }`}
      >
        {cashbackData?.service_opted ? (
          <>
            <Gift className="w-3.5 h-3.5" />
            <span>Service Active</span>
          </>
        ) : cashbackData?.ad_watched ? (
          <>
            <Wallet className="w-3.5 h-3.5" />
            <span>{timeLeft > 0 ? `Unlocking in ${formatTime(timeLeft)}` : "100% Cashback Ready"}</span>
          </>
        ) : (
          <>
            <Gift className="w-3.5 h-3.5" />
            <span>Claim Cashback</span>
          </>
        )}
      </button>

      {/* Main Interactive Selection Modal with Draggable Service vs Cashback Toggle */}
      {showToggleModal && (
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center relative shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200"
          >
            <button 
              onClick={() => setShowToggleModal(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-transform hover:rotate-90 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-gradient-to-tr from-amber-100 via-emerald-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Gift className="w-8 h-8 text-[#00a86b]" />
            </div>

            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Choose Your Reward</h3>
            <p className="text-gray-500 text-xs sm:text-sm font-medium mb-6">
              Swipe the toggle left for <b>Free 1-Year Service</b> or right for <b>100% Daily Cashback</b>!
            </p>

            {/* The Draggable Toggle Pill */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 py-4 bg-gray-50/80 rounded-2xl border border-gray-100 mb-6">
              {/* Service Text */}
              <button 
                type="button"
                onClick={() => {
                  setActiveTab('service');
                  setShowToggleModal(false);
                  setShowServiceModal(true);
                }}
                className={`flex items-center gap-1.5 font-bold transition-all ${
                  activeTab === 'service' ? 'text-blue-600 scale-105' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Gift className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Service</span>
              </button>

              {/* Toggle Pill Container */}
              <div 
                ref={containerRef}
                onClick={handleBgClick}
                className={`relative w-24 h-10 rounded-full p-1 shadow-inner cursor-pointer border transition-colors duration-300 ${
                  activeTab === 'service' ? 'bg-[#e0e7ff] border-blue-200' : 'bg-[#fef3c7] border-amber-200'
                }`}
              >
                <div className="relative w-full h-full overflow-visible">
                  <div
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className={`absolute top-0 bottom-0 w-1/2 rounded-full flex items-center justify-center z-10 touch-none transition-all duration-300 ease-out ${
                      activeTab === 'center' ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] cursor-grab active:cursor-grabbing' : 
                      activeTab === 'service' ? 'bg-blue-500 shadow-[0_2px_10px_rgba(59,130,246,0.4)]' : 
                      'bg-amber-500 shadow-[0_2px_10px_rgba(245,158,11,0.4)]'
                    }`}
                    style={{ left: `${dragPercent}%`, transform: isDragging ? 'scale(0.95)' : 'scale(1)' }}
                  >
                    <div className="flex gap-[3px]">
                      <div className={`w-[3px] h-[12px] rounded-full ${activeTab === 'center' ? 'bg-gray-400' : 'bg-white'}`}></div>
                      <div className={`w-[3px] h-[12px] rounded-full ${activeTab === 'center' ? 'bg-gray-400' : 'bg-white'}`}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cashback Text */}
              <button 
                type="button"
                onClick={() => {
                  setActiveTab('cashback');
                  setShowToggleModal(false);
                  setShowCashbackModal(true);
                }}
                className={`flex items-center gap-1.5 font-bold transition-all ${
                  activeTab === 'cashback' ? 'text-amber-600 scale-105' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <span className="text-sm">Cashback</span>
                <Wallet className="w-4 h-4 text-amber-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div 
                onClick={() => {
                  setActiveTab('service');
                  setShowToggleModal(false);
                  setShowServiceModal(true);
                }}
                className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 cursor-pointer transition text-xs"
              >
                <span className="font-bold text-blue-900 block mb-0.5">Option 1: Free Service</span>
                <span className="text-blue-700">1-Year maintenance & breakdown coverage</span>
              </div>
              <div 
                onClick={() => {
                  setActiveTab('cashback');
                  setShowToggleModal(false);
                  setShowCashbackModal(true);
                }}
                className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50 cursor-pointer transition text-xs"
              >
                <span className="font-bold text-amber-900 block mb-0.5">Option 2: 100% Cashback</span>
                <span className="text-amber-700">Daily wallet credit after 20s ad timer</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {renderModals()}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes modal-overlay {
          0% { opacity: 0; backdrop-filter: blur(0px); }
          100% { opacity: 1; backdrop-filter: blur(8px); }
        }
        @keyframes modal-content {
          0% { opacity: 0; transform: scale(0.92) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}} />
    </div>
  );
}
