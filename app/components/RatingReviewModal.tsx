"use client";

import React, { useEffect, useState } from "react";
import { Star, X, CheckCircle2, Sparkles, ThumbsUp, Wrench, ShieldCheck, Heart } from "lucide-react";

interface PendingBooking {
  id: number;
  order_id: string;
  customer_name?: string;
  category?: string;
  services?: Array<{ title?: string; quantity?: number }>;
  total?: number;
  booking_date?: string;
  time_slot?: string;
}

const RATING_EMOJIS = [
  { rating: 1, emoji: "😞", label: "Disappointed", color: "text-rose-500" },
  { rating: 2, emoji: "🙁", label: "Could be Better", color: "text-orange-500" },
  { rating: 3, emoji: "😐", label: "Good", color: "text-amber-500" },
  { rating: 4, emoji: "😊", label: "Very Good", color: "text-emerald-500" },
  { rating: 5, emoji: "🤩", label: "Outstanding!", color: "text-indigo-600 font-extrabold" },
];

const COMPLIMENT_TAGS = [
  "⚡ On-Time Arrival",
  "🧰 Skilled & Expert",
  "🧼 Clean & Neat Work",
  "🤝 Polite & Professional",
  "💯 Quality Spare Parts",
  "💬 Clear Explanation",
];

export default function RatingReviewModal() {
  const [booking, setBooking] = useState<PendingBooking | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Check pending review on mount & periodically
  const checkPendingReview = async () => {
    try {
      // Don't disturb if user dismissed in this browser session
      const dismissedOrder = sessionStorage.getItem("omaa_dismissed_rating_order");
      
      const res = await fetch("/api/bookings/pending-review", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      
      if (data.pendingBooking) {
        if (dismissedOrder === data.pendingBooking.order_id) {
          return;
        }
        setBooking(data.pendingBooking);
        setIsOpen(true);
      }
    } catch (_) {}
  };

  useEffect(() => {
    // Delay check by 1.5s after page load for smooth experience
    const timer = setTimeout(() => {
      checkPendingReview();
    }, 1500);

    // Listen for custom trigger e.g. from My Bookings "Rate Now" button
    const handleManualOpen = (event: any) => {
      if (event.detail?.booking) {
        setBooking(event.detail.booking);
        setRating(5);
        setSelectedTags([]);
        setReviewText("");
        setIsSubmitted(false);
        setIsOpen(true);
      } else {
        checkPendingReview();
      }
    };

    window.addEventListener("open_rating_modal", handleManualOpen);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("open_rating_modal", handleManualOpen);
    };
  }, []);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleDismiss = () => {
    if (booking) {
      sessionStorage.setItem("omaa_dismissed_rating_order", booking.order_id);
    }
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    if (!booking) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/bookings/submit-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: booking.order_id,
          rating: rating,
          review: reviewText,
          tags: selectedTags,
        }),
      });

      if (res.ok) {
        setIsSubmitted(true);
        // Clear session dismiss
        sessionStorage.removeItem("omaa_dismissed_rating_order");
        
        // Notify other components (like MyBookings) to refresh
        window.dispatchEvent(new Event("rating_submitted"));

        setTimeout(() => {
          setIsOpen(false);
          setBooking(null);
          setIsSubmitted(false);
        }, 2200);
      }
    } catch (err) {
      console.error("Failed to submit rating", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !booking) return null;

  const currentDisplayRating = hoveredRating !== null ? hoveredRating : rating;
  const ratingInfo = RATING_EMOJIS.find((r) => r.rating === currentDisplayRating) || RATING_EMOJIS[4];

  // Extract service title
  const serviceTitle =
    booking.services && booking.services.length > 0
      ? booking.services[0]?.title || booking.category || "Home Service"
      : booking.category || "Home Service";

  return (
    <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-300 animate-scale-up max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Gradient Top Bar */}
        <div className="bg-gradient-to-r from-[#6277db] via-[#8c67c5] to-[#db5285] px-5 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5 text-white relative shrink-0">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
            title="Remind me later"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-white/90 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Service Completed</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Rate Your Experience
          </h3>
          <p className="text-white/80 text-xs sm:text-sm mt-0.5">
            How was our service for <span className="font-bold text-white underline">{serviceTitle}</span>?
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 overscroll-contain">
          {isSubmitted ? (
            /* Success State */
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-200/50">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-extrabold text-gray-900">
                Thank You for Your Feedback!
              </h4>
              <p className="text-sm text-gray-600 max-w-xs">
                Your rating helps us improve our service and reward our top technicians.
              </p>
              <div className="flex items-center space-x-1 text-amber-500 font-bold text-lg pt-1">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
          ) : (
            /* Rating Form */
            <>
              {/* Service Summary Pill */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Order #{booking.order_id}</div>
                    <div className="text-sm font-bold text-gray-900 line-clamp-1">{serviceTitle}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Job Done</span>
                </div>
              </div>

              {/* Star Rating Section */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(null)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                    >
                      <Star
                        className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors duration-200 ${
                          star <= currentDisplayRating
                            ? "fill-amber-400 text-amber-400 drop-shadow-md"
                            : "fill-gray-100 text-gray-300 hover:text-amber-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Dynamic Reaction Label */}
                <div className="mt-3 flex items-center space-x-2 animate-fade-in">
                  <span className="text-2xl">{ratingInfo.emoji}</span>
                  <span className={`text-base font-bold ${ratingInfo.color}`}>
                    {ratingInfo.label}
                  </span>
                </div>
              </div>

              {/* Quick Compliment Tags */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  What did you like the most? (Optional)
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {COMPLIMENT_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 border ${
                          isSelected
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-sm scale-102"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Review Textarea */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Write a review (Optional)
                </label>
                <textarea
                  rows={2}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share a few words about technician punctuality, work quality..."
                  className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-gray-200 focus:border-[#6277db] focus:ring-2 focus:ring-[#6277db]/20 outline-none transition-all placeholder:text-gray-400 bg-gray-50/50 focus:bg-white resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#6277db] via-[#8c67c5] to-[#db5285] hover:opacity-95 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-purple-500/25 transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Submit Review</span>
                      <ThumbsUp className="w-4 h-4" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs text-gray-500 font-semibold hover:text-gray-800 transition-colors cursor-pointer text-center"
                >
                  Remind Later
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
