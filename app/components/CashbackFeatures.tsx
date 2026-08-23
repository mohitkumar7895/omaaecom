"use client";

import { useState, useEffect, useRef } from "react";
import { Gift, Wallet, PlayCircle, Clock, CheckCircle2, AlertCircle, X } from "lucide-react";

interface CashbackFeaturesProps {
  orderId: string;
}

export default function CashbackFeatures({ orderId }: CashbackFeaturesProps) {
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCashbackModal, setShowCashbackModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'service' | 'cashback' | 'center'>('center');
  
  const [loading, setLoading] = useState(false);
  const [cashbackData, setCashbackData] = useState<any>(null);
  const [adCountdown, setAdCountdown] = useState(10);
  const [playingAd, setPlayingAd] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const [isDragging, setIsDragging] = useState(false);
  const [dragPercent, setDragPercent] = useState(25);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) {
      if (activeTab === 'center') setDragPercent(25);
      else if (activeTab === 'service') setDragPercent(0);
      else if (activeTab === 'cashback') setDragPercent(50);
    }
  }, [activeTab, isDragging]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLDivElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    let left = percent - 25; 
    if (left < 0) left = 0;
    if (left > 50) left = 50;
    setDragPercent(left);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.target as HTMLDivElement).releasePointerCapture(e.pointerId);
    
    if (dragPercent < 15) {
      if (!isServiceLocked) {
        setActiveTab('service');
        setShowServiceModal(true);
      } else {
        setActiveTab('center');
        setDragPercent(25);
      }
    } else if (dragPercent > 35) {
      if (!isCashbackLocked) {
        setActiveTab('cashback');
        setShowCashbackModal(true);
      } else {
        setActiveTab('center');
        setDragPercent(25);
      }
    } else {
      setDragPercent(activeTab === 'service' ? 0 : activeTab === 'cashback' ? 50 : 25);
    }
  };

  const handleBgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    if (x > rect.width / 2) {
      if (!isCashbackLocked) {
        setActiveTab('cashback');
        setShowCashbackModal(true);
      }
    } else {
      if (!isServiceLocked) {
        setActiveTab('service');
        setShowServiceModal(true);
      }
    }
  };

  const fetchCashbackData = async () => {
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
    if (showCashbackModal && !cashbackData) {
      fetchCashbackData();
    }
  }, [showCashbackModal]);

  // Handle Ad Watch
  useEffect(() => {
    let interval: any;
    if (playingAd && adCountdown > 0) {
      interval = setInterval(() => setAdCountdown((prev) => prev - 1), 1000);
    } else if (playingAd && adCountdown === 0) {
      setPlayingAd(false);
      markAdAsWatched();
    }
    return () => clearInterval(interval);
  }, [playingAd, adCountdown]);

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
    setAdCountdown(10);
    setPlayingAd(true);
  };

  const isServiceLocked = cashbackData?.ad_watched;
  const isCashbackLocked = cashbackData?.service_opted;

  // Format 24h timer (HH:MM:SS)
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full py-2">
        <div className="flex items-center gap-5 sm:gap-8">
          {/* Service Text */}
          <button 
            type="button"
            onClick={() => {
              if (isServiceLocked) return;
              setActiveTab('service');
              setShowServiceModal(true);
            }}
            className={`flex items-center gap-1.5 font-bold transition-all ${
              activeTab === 'service' ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'
            } ${isServiceLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Gift className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'service' ? 'animate-pulse' : ''}`} />
            <span className="text-[14px] sm:text-[15px]">Service</span>
          </button>

          {/* Toggle Pill */}
          <div 
            ref={containerRef}
            onClick={handleBgClick}
            className={`relative w-20 sm:w-24 h-9 sm:h-10 rounded-full p-1 shadow-inner cursor-pointer border transition-colors duration-300 ${
              activeTab === 'service' ? 'bg-[#e0e7ff] border-blue-200' : 'bg-[#fef3c7] border-amber-200'
            }`}
          >
            <div className="relative w-full h-full overflow-visible">
              {/* Draggable Thumb */}
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={`absolute top-0 bottom-0 w-1/2 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center justify-center cursor-grab active:cursor-grabbing z-10 touch-none ${!isDragging ? 'transition-all duration-300 ease-out' : ''}`}
                style={{ left: `${dragPercent}%` }}
              >
                <div className="flex gap-[3px] opacity-30">
                  <div className="w-[3px] h-[12px] sm:h-[14px] rounded-full bg-gray-400"></div>
                  <div className="w-[3px] h-[12px] sm:h-[14px] rounded-full bg-gray-400"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Cashback Text */}
          <button 
            type="button"
            onClick={() => {
              if (isCashbackLocked) return;
              setActiveTab('cashback');
              setShowCashbackModal(true);
            }}
            className={`flex items-center gap-1.5 font-bold transition-all ${
              activeTab === 'cashback' ? 'text-amber-600 scale-105' : 'text-gray-400 hover:text-gray-600'
            } ${isCashbackLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-[14px] sm:text-[15px]">Cashback</span>
            <Wallet className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'cashback' ? 'animate-pulse' : ''}`} />
          </button>
        </div>
      </div>

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

      {/* Service Modal */}
      {showServiceModal && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60"
          style={{ animation: 'modal-overlay 0.3s ease-out forwards' }}
        >
          <div 
            className="bg-white rounded-[24px] max-w-sm w-full p-8 text-center relative shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-gray-100"
            style={{ animation: 'modal-content 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
          >
            <button onClick={() => setShowServiceModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-transform hover:rotate-90">
              <X className="w-5 h-5" />
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
            }} className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)] hover:shadow-[0_10px_25px_-8px_rgba(37,99,235,0.8)] active:scale-95">
              {cashbackData?.service_opted ? 'Close' : 'Claim Service'}
            </button>
          </div>
        </div>
      )}

      {/* Cashback Modal */}
      {showCashbackModal && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60"
          style={{ animation: 'modal-overlay 0.3s ease-out forwards' }}
        >
          <div 
            className="bg-white rounded-[24px] max-w-md w-full p-6 sm:p-8 text-center relative shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-gray-100 overflow-hidden"
            style={{ animation: 'modal-content 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
          >
            <button onClick={() => { setShowCashbackModal(false); setPlayingAd(false); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 z-10 transition-transform hover:rotate-90">
              <X className="w-5 h-5" />
            </button>
            
            {loading ? (
              <div className="py-12 flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium">Loading your cashback status...</p>
              </div>
            ) : (
              <>
                {!cashbackData?.ad_watched ? (
                  /* Step 1: Watch Ad */
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">Claim Your Cashback</h3>
                    <p className="text-gray-500 font-medium text-sm mb-6">Watch a short video to unlock your cashback timer.</p>
                    
                    <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden mb-6 flex items-center justify-center shadow-inner">
                      {playingAd ? (
                        <div className="text-white flex flex-col items-center">
                          <PlayCircle className="w-12 h-12 mb-3 text-amber-500 animate-pulse" />
                          <p className="font-bold">Playing Ad...</p>
                          <div className="absolute top-3 right-3 bg-black/60 px-3 py-1 rounded-full text-sm font-bold text-white">
                            {adCountdown}s
                          </div>
                        </div>
                      ) : (
                        <button onClick={startAd} className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 transition transform hover:scale-105 active:scale-95 shadow-[0_8px_20px_-8px_rgba(245,158,11,0.6)]">
                          <PlayCircle className="w-5 h-5" /> Watch Now
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
                          <p className="text-[13px] text-amber-800 font-medium">Your cashback will be revealed after 24 hours. Check back later!</p>
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
                            
                            <a href="/cashback" className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition transform hover:scale-[1.02] active:scale-95 shadow-[0_8px_20px_-8px_rgba(22,163,74,0.6)]">
                              Go to Cashback Page
                            </a>
                          </div>
                        ) : (
                          <div>
                            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Almost There! ⏳</h3>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-left my-6 shadow-sm">
                              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                              <p className="text-[13px] text-blue-800 font-medium">The 24-hour timer is complete! We are just waiting for the technician to mark the job as <strong>Completed</strong> to release your cashback.</p>
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
    </>
  );
}
