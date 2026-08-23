"use client";

import { useState, useEffect, useRef } from "react";
import { Gift, Wallet, PlayCircle, Clock, CheckCircle2, AlertCircle, X } from "lucide-react";

interface CashbackFeaturesProps {
  orderId: string;
}

export default function CashbackFeatures({ orderId }: CashbackFeaturesProps) {
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCashbackModal, setShowCashbackModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'service' | 'cashback'>('service');
  
  const [loading, setLoading] = useState(false);
  const [cashbackData, setCashbackData] = useState<any>(null);
  const [adCountdown, setAdCountdown] = useState(10);
  const [playingAd, setPlayingAd] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const [isDragging, setIsDragging] = useState(false);
  const [dragPercent, setDragPercent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) {
      setDragPercent(activeTab === 'cashback' ? 50 : 0);
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
    
    if (dragPercent > 25) {
      if (!isCashbackLocked) {
        setActiveTab('cashback');
        setShowCashbackModal(true);
      } else {
        setDragPercent(0);
        setActiveTab('service');
      }
    } else {
      if (!isServiceLocked) {
        setActiveTab('service');
        setShowServiceModal(true);
      } else {
        setDragPercent(50);
        setActiveTab('cashback');
      }
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
      <div 
        ref={containerRef}
        onClick={handleBgClick}
        className="relative w-full h-14 bg-gradient-to-r from-gray-200/80 to-gray-100 rounded-full p-1.5 flex items-center shadow-inner overflow-hidden cursor-pointer border border-gray-300/50"
      >
        {/* Background Labels */}
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-8">
          <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
            <Gift className="w-4 h-4" />
            <span>Service</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
            <Wallet className="w-4 h-4" />
            <span>Cashback</span>
          </div>
        </div>

        {/* Draggable Thumb */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 flex items-center justify-center cursor-grab active:cursor-grabbing z-10 touch-none ${!isDragging ? 'transition-all duration-300 ease-out' : ''}`}
          style={{ left: `calc(${dragPercent}% + 3px)` }}
        >
          {dragPercent < 25 ? (
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <Gift className="w-4 h-4" />
              <span>Service</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
              <Wallet className="w-4 h-4" />
              <span>Cashback</span>
            </div>
          )}
          
          {/* Subtle drag handle graphics */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-[3px] opacity-20">
            <div className="w-[3px] h-[3px] rounded-full bg-gray-500"></div>
            <div className="w-[3px] h-[3px] rounded-full bg-gray-500"></div>
            <div className="w-[3px] h-[3px] rounded-full bg-gray-500"></div>
          </div>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-[3px] opacity-20">
            <div className="w-[3px] h-[3px] rounded-full bg-gray-500"></div>
            <div className="w-[3px] h-[3px] rounded-full bg-gray-500"></div>
            <div className="w-[3px] h-[3px] rounded-full bg-gray-500"></div>
          </div>
        </div>
      </div>

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-8 text-center relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowServiceModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
              <X className="w-5 h-5" />
            </button>
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
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
            }} className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md">
              {cashbackData?.service_opted ? 'Close' : 'Claim Service'}
            </button>
          </div>
        </div>
      )}

      {/* Cashback Modal */}
      {showCashbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 sm:p-8 text-center relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <button onClick={() => { setShowCashbackModal(false); setPlayingAd(false); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 z-10">
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
                        <button onClick={startAd} className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 transition transform hover:scale-105">
                          <PlayCircle className="w-5 h-5" /> Watch Now
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Step 2: Timer & Result */
                  <div className="pt-4">
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wallet className="w-8 h-8 text-amber-500" />
                    </div>
                    
                    {timeLeft > 0 ? (
                      <div>
                        <h3 className="text-xl font-extrabold text-gray-900 mb-2">Cashback Unlocking in</h3>
                        <div className="text-4xl font-black text-amber-500 tracking-wider my-6 font-mono drop-shadow-sm">
                          {formatTime(timeLeft)}
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-left">
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
                            
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-4">
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
                            
                            <a href="/cashback" className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition transform hover:scale-105 shadow-md">
                              Go to Cashback Page
                            </a>
                          </div>
                        ) : (
                          <div>
                            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Almost There! ⏳</h3>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-left my-6">
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
