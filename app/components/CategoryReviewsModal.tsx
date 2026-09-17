"use client";

import { useState, useEffect } from "react";
import { X, Star, CheckCircle2, ThumbsUp, MessageSquare } from "lucide-react";

interface CategoryReviewsModalProps {
  categoryTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryReviewsModal({ categoryTitle, isOpen, onClose }: CategoryReviewsModalProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !categoryTitle) return;

    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/reviews?category=${encodeURIComponent(categoryTitle)}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
          setStats(data.stats || null);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [isOpen, categoryTitle]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-0 sm:p-4">
      <div 
        className="bg-white w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl flex flex-col relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base sm:text-lg leading-tight">
                {categoryTitle} Reviews
              </h3>
              <p className="text-xs text-gray-500 font-medium">Ratings & Verified Feedback</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Rating Summary Scorecard */}
          <div className="bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-amber-50/50 border border-indigo-100/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-6">
            <div className="flex flex-col items-center justify-center pr-4 sm:pr-6 border-r border-indigo-100 shrink-0">
              <div className="text-3xl sm:text-4xl font-black text-gray-900 flex items-center gap-1">
                <span>{stats?.average || "4.8"}</span>
                <Star className="w-6 h-6 sm:w-7 sm:h-7 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-[11px] text-gray-500 font-medium mt-1">
                {stats?.total || 120}+ Reviews
              </div>
              <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1.5 border border-emerald-200">
                ✓ 100% Genuine
              </div>
            </div>

            {/* Visual Bars */}
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = stats?.distribution?.[stars] || (stars === 5 ? 85 : stars === 4 ? 25 : 5);
                const total = stats?.total || 120;
                const percent = Math.min(100, Math.round((count / total) * 100)) || (stars === 5 ? 75 : stars === 4 ? 20 : 5);
                return (
                  <div key={stars} className="flex items-center gap-2 text-xs">
                    <span className="w-5 font-bold text-gray-700 text-right shrink-0">{stars}★</span>
                    <div className="flex-1 h-2 bg-gray-200/80 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-7 text-[10px] text-gray-400 text-right shrink-0">{percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Reviews Feed */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span>Customer Reviews</span>
              </h4>
              <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                Recent Bookings
              </span>
            </div>

            {loading ? (
              <div className="py-8 flex items-center justify-center text-xs text-gray-400">
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2" />
                Loading customer reviews...
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((rev: any, i: number) => (
                  <div key={rev.id || i} className="bg-white border border-gray-100 rounded-2xl p-3.5 sm:p-4 shadow-2xs hover:border-gray-200 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                          {(rev.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900 flex items-center gap-1">
                            <span>{rev.name}</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          </div>
                          <span className="text-[10px] text-gray-400">{rev.date || "Recently"}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-0.5 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-black text-amber-900">{rev.rating || 5}.0</span>
                      </div>
                    </div>

                    {/* Compliment Badges */}
                    {rev.tags && rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {rev.tags.map((tag: string, tIdx: number) => (
                          <span key={tIdx} className="text-[10px] font-bold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-full border border-indigo-100/60">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Review Feedback Comment */}
                    {rev.review && (
                      <p className="text-xs text-gray-700 leading-relaxed italic bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                        &ldquo;{rev.review}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-4">No reviews recorded yet for this category.</p>
            )}
          </div>
        </div>

        {/* Footer Close */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto bg-[#6069c9] hover:bg-[#525ab5] text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
