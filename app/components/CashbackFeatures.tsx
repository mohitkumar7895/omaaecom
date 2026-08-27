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
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // Controlled video play/pause
  useEffect(() => {
    if (videoRef.current) {
      if (adPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [adPaused]);

  const [claiming, setClaiming] = useState(false);

  // Handle 24h Timer
  useEffect(() => {
    let interval: any;
    if (cashbackData?.ad_watched) {
      const calculateTimeLeft = () => {
        const lastClaimTimestamp = cashbackData.last_cashback_claim_at || cashbackData.ad_watched_at;
        if (!lastClaimTimestamp) return 0;
        const lastTime = new Date(lastClaimTimestamp).getTime();
        const endTime = lastTime + 24 * 60 * 60 * 1000;
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

  const handleClaimDailyCashback = async () => {
    setClaiming(true);
    try {
      const res = await fetch('/api/bookings/cashback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action: 'claim_daily' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchCashbackData();
        window.dispatchEvent(new CustomEvent("booking_updated"));
        setShowCashbackModal(true);
      } else {
        alert(data.error || 'Unable to claim cashback right now.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClaiming(false);
    }
  };

  const markAdAsWatched = async () => {
    try {
      await fetch('/api/bookings/cashback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      fetchCashbackData(); // Refresh data to get ad_watched_at timestamp
      window.dispatchEvent(new CustomEvent("booking_updated"));
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
      window.dispatchEvent(new CustomEvent("booking_updated"));
    } catch (e) {
      console.error(e);
    }
  };

  // Automatically start ad/video when Cashback modal opens
  useEffect(() => {
    if (showCashbackModal && !cashbackData?.ad_watched) {
      startAd();
    }
  }, [showCashbackModal, cashbackData]);

  const startAd = () => {
    const config = cashbackData?.adConfig;
    setAdCountdown(config?.duration || 20);
    setPlayingAd(true);
    setAdPaused(false);
    setCurrentImageIndex(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
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

        {/* Cashback Modal (Extra Large Cinema Display) */}
        {showCashbackModal && (
          <div 
            className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xs"
            style={{ animation: 'modal-overlay 0.3s ease-out forwards' }}
          >
            <div 
              className="bg-white rounded-3xl max-w-3xl sm:max-w-4xl w-full p-5 sm:p-7 text-center relative shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7)] border border-gray-100 overflow-hidden max-h-[95vh] flex flex-col justify-between"
              style={{ animation: 'modal-content 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            >
              <button onClick={() => { setShowCashbackModal(false); setPlayingAd(false); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 z-10 transition-transform hover:rotate-90 p-1.5 rounded-full hover:bg-gray-100">
                <X className="w-6 h-6" />
              </button>
              
              {loading ? (
                <div className="py-20 flex flex-col items-center">
                  <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500 font-medium text-lg">Loading your cashback status...</p>
                </div>
              ) : (
                <>
                  {!cashbackData?.ad_watched ? (
                    /* Step 1: Watch Ad (Extra Large Video Screen) */
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1 tracking-tight">Claim 100% Cashback</h3>
                      <p className="text-gray-500 font-medium text-xs sm:text-sm mb-3">
                        Video will complete in <b className="text-amber-600 font-mono">{adCountdown}s</b>. <span className="text-rose-500 font-bold block sm:inline">* (Opting for Cashback will void free warranty service)</span>
                      </p>
                      
                      {/* Extra Large Video Screen */}
                      <div 
                        className="relative w-full aspect-[16/9] min-h-[260px] sm:min-h-[420px] md:min-h-[460px] bg-black rounded-2xl overflow-hidden mb-2 flex items-center justify-center shadow-2xl cursor-pointer border border-gray-800"
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
                                  ref={videoRef}
                                  src={videoSrc} 
                                  autoPlay 
                                  playsInline 
                                  muted 
                                  loop
                                  className="w-full h-full object-contain bg-black"
                                />
                              );
                            })()}
                            
                            {/* Overlay Controls */}
                            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-md border border-white/15 z-10">
                              <div className={`w-2.5 h-2.5 rounded-full ${adPaused ? 'bg-amber-500' : 'bg-green-400 animate-pulse'}`}></div>
                              <span className="text-sm font-bold text-white font-mono">{adCountdown}s</span>
                            </div>
                            
                            {adPaused && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px] z-20">
                                <div className="bg-white/95 text-gray-900 px-5 py-2.5 rounded-full font-black shadow-xl flex items-center gap-2">
                                  <div className="w-3.5 h-4 border-l-4 border-r-4 border-gray-900"></div>
                                  Paused
                                </div>
                              </div>
                            )}

                            {!adPaused && (
                              <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-10">
                                <span className="bg-black/60 text-white text-xs px-3.5 py-1.5 rounded-full backdrop-blur-sm shadow-sm">
                                  Hold / Tap to Pause
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button onClick={startAd} className="bg-amber-500 hover:bg-amber-600 text-white font-black px-9 py-4 rounded-2xl flex items-center gap-3 transition transform hover:scale-105 active:scale-95 shadow-[0_8px_25px_-5px_rgba(245,158,11,0.7)] text-lg cursor-pointer">
                            <PlayCircle className="w-7 h-7" /> Watch Video & Unlock
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
                        <div className="pt-2">
                          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner border border-emerald-100">
                            <Gift className="w-8 h-8 text-emerald-600 animate-bounce" />
                          </div>
                          <h3 className="text-2xl font-black text-gray-900 mb-1">Today's Cashback Ready! 🎉</h3>
                          <p className="text-gray-500 font-medium mb-5 text-sm">
                            Click below to claim <b>₹{cashbackData.cashback_amount || 4}</b> into your Omaa Wallet. You must claim daily to receive your cashback.
                          </p>

                          <button 
                            onClick={handleClaimDailyCashback}
                            disabled={claiming}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-lg shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Gift className="w-6 h-6" />
                            <span>{claiming ? "Crediting Wallet..." : `Claim ₹${cashbackData.cashback_amount || 4} to Wallet`}</span>
                          </button>

                          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800 font-medium text-left flex items-start gap-2">
                            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <span>Note: Once claimed, your next daily cashback unlocks after 24 hours.</span>
                          </div>
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
      {cashbackData?.service_opted ? (
        <button 
          type="button"
          onClick={() => setShowServiceModal(true)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <Gift className="w-3.5 h-3.5 text-blue-600" />
          <span>1-Yr Service Active</span>
        </button>
      ) : cashbackData?.ad_watched ? (
        timeLeft > 0 ? (
          <button 
            type="button"
            onClick={() => setShowCashbackModal(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Unlocking in {formatTime(timeLeft)}</span>
          </button>
        ) : (
          <button 
            type="button"
            onClick={handleClaimDailyCashback}
            disabled={claiming}
            className="px-4 py-1.5 rounded-xl text-xs font-black transition-all bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer animate-pulse"
          >
            <Gift className="w-3.5 h-3.5 text-white" />
            <span>{claiming ? "Claiming..." : `Claim Cashback (₹${cashbackData.cashback_amount || 4})`}</span>
          </button>
        )
      ) : (
        /* Direct Embedded Interactive Slider with Alert Note */
        <div className="flex flex-col items-end sm:items-start">
          {/* Soft Red Notice */}
          <div className="text-[10px] sm:text-[11px] font-semibold text-rose-500 mb-1 flex items-center gap-1">
            <span>* You can choose only one side (Service or Cashback)</span>
          </div>

          <div className="bg-gradient-to-r from-blue-50/80 via-white to-amber-50/80 border border-gray-200/90 rounded-full p-1 shadow-2xs flex items-center gap-1.5 sm:gap-2.5 select-none transition-all hover:border-gray-300">
            {/* Service Active Button (Distinct Blue Badge) */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('service');
                setShowServiceModal(true);
              }}
              className={`font-bold text-[11px] sm:text-xs px-2.5 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'service' 
                  ? 'bg-blue-600 text-white shadow-xs scale-105' 
                  : 'text-blue-700 bg-blue-100/70 hover:bg-blue-100'
              }`}
            >
              <span>Service Active</span>
            </button>

            {/* Toggle Pill Slider Track (Elongated) */}
            <div 
              ref={containerRef}
              onClick={handleBgClick}
              className="relative w-16 sm:w-20 h-5 sm:h-6 rounded-full p-0.5 shadow-inner cursor-pointer border border-amber-200/80 bg-gradient-to-r from-blue-100/80 via-amber-100 to-amber-200/80 transition-colors shrink-0"
            >
              <div className="relative w-full h-full">
                <div
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="absolute top-0 bottom-0 w-1/2 rounded-full flex items-center justify-center z-10 touch-none transition-all duration-300 ease-out bg-white shadow-[0_1px_4px_rgba(0,0,0,0.15)] cursor-grab active:cursor-grabbing"
                  style={{ left: `${dragPercent}%`, transform: isDragging ? 'scale(0.95)' : 'scale(1)' }}
                >
                  <div className="flex gap-[2px]">
                    <div className="w-[1.5px] h-[7px] sm:h-[8px] rounded-full bg-gray-400"></div>
                    <div className="w-[1.5px] h-[7px] sm:h-[8px] rounded-full bg-gray-400"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cashback up to 100% Button (Distinct Amber Badge) */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('cashback');
                setShowCashbackModal(true);
              }}
              className={`font-bold text-[11px] sm:text-xs px-2.5 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'cashback' 
                  ? 'bg-amber-500 text-white shadow-xs scale-105' 
                  : 'text-amber-800 bg-amber-100/70 hover:bg-amber-100'
              }`}
            >
              <span>Cashback up to 100%</span>
            </button>
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
