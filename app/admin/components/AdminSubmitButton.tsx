"use client";

import { useEffect } from "react";
import { Loader2, Check, CheckCircle2 } from "lucide-react";

interface AdminSubmitButtonProps {
  loading: boolean;
  success?: boolean;
  label?: string;
  loadingLabel?: string;
  successLabel?: string;
  className?: string;
  onClick?: () => void;
}

function playSuccessChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Tone 1: gentle chime
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.18);

    // Tone 2: higher harmonic confirmation
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.08); // A5
    gain2.gain.setValueAtTime(0.16, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.38);
  } catch {
    // Audio context may be restricted by autoplay policy before user interaction
  }
}

export default function AdminSubmitButton({
  loading,
  success = false,
  label = "Save Changes",
  loadingLabel = "Saving...",
  successLabel = "Updated Successfully!",
  className = "",
  onClick,
}: AdminSubmitButtonProps) {
  useEffect(() => {
    if (success) {
      playSuccessChime();
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.([30, 40, 30]);
      }
    }
  }, [success]);

  return (
    <button
      type="submit"
      disabled={loading || success}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center gap-2.5 px-8 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 select-none cursor-pointer shadow-md overflow-hidden ${
        success
          ? "bg-gradient-to-r from-emerald-600 to-green-600 shadow-xl shadow-emerald-500/30 ring-2 ring-emerald-300 scale-[1.03] animate-pulse"
          : loading
          ? "bg-emerald-700/80 cursor-wait opacity-90 shadow-sm"
          : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.95] hover:shadow-xl hover:-translate-y-0.5"
      } ${className}`}
    >
      {success ? (
        <>
          <CheckCircle2 className="w-5 h-5 text-white shrink-0 animate-bounce" />
          <span className="tracking-wide text-[14.5px] font-extrabold">{successLabel}</span>
        </>
      ) : loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0 text-emerald-100" />
          <span className="tracking-wide">{loadingLabel}</span>
        </>
      ) : (
        <>
          <Check className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span className="tracking-wide">{label}</span>
        </>
      )}
    </button>
  );
}
