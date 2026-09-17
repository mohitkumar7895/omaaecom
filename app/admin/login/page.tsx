"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  Mail, 
  ShieldCheck, 
  KeyRound, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Sparkles,
  Loader2
} from "lucide-react";

export default function AdminLogin() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [tempToken, setTempToken] = useState("");
  const [targetEmail, setTargetEmail] = useState("mail.omaacompany@gmail.com");
  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [autoStatus, setAutoStatus] = useState("");
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const autoFetchedRef = useRef(false);

  // Resend Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Step 2: Verify OTP
  const verifyOtpCode = useCallback(async (otpCodeToVerify?: string, tokenOverride?: string) => {
    const code = otpCodeToVerify || otp.join("");
    const currentToken = tokenOverride || tempToken;

    if (code.length !== 6) {
      setError("Please enter all 6 digits of the OTP code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/verify-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temp_token: currentToken,
          otp: code,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg("✨ Verification successful! Logging into Admin Dashboard...");
        setAutoStatus("✅ Logged in successfully!");
        setTimeout(() => {
          window.location.href = "/admin";
        }, 400);
      } else {
        setError(data.error || "Invalid or expired OTP. Please try again.");
        setAutoDetecting(false);
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
      setAutoDetecting(false);
    } finally {
      setLoading(false);
    }
  }, [otp, tempToken]);

  // Automated OTP Fetch & Fill
  const autoFetchAndFillOtp = useCallback(async (token: string) => {
    if (!token || autoFetchedRef.current) return;
    autoFetchedRef.current = true;
    setAutoDetecting(true);
    setAutoStatus("📡 Auto-detecting security code from mail.omaacompany@gmail.com...");

    try {
      // 700ms smooth delay to simulate real-time email dispatch & sync
      await new Promise((r) => setTimeout(r, 700));

      const res = await fetch("/api/admin/auto-fetch-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temp_token: token }),
      });

      const data = await res.json();

      if (res.ok && data.otp && data.otp.length === 6) {
        setAutoStatus("⚡ OTP Received! Auto-filling security code...");
        const digits = data.otp.split("");
        
        // Sequentially fill the 6 inputs with a fast smooth visual animation
        for (let i = 0; i < digits.length; i++) {
          await new Promise((r) => setTimeout(r, 55));
          setOtp((prev) => {
            const next = [...prev];
            next[i] = digits[i];
            return next;
          });
        }

        setAutoStatus("🚀 Code filled! Authenticating administrator session...");
        await new Promise((r) => setTimeout(r, 180));
        
        // Instant auto-login!
        await verifyOtpCode(data.otp, token);
      } else {
        setAutoDetecting(false);
        setAutoStatus("");
      }
    } catch (err) {
      setAutoDetecting(false);
      setAutoStatus("");
    }
  }, [verifyOtpCode]);

  // Trigger automated OTP pickup on Step 2 transition
  useEffect(() => {
    if (step === 2 && tempToken && !autoFetchedRef.current) {
      autoFetchAndFillOtp(tempToken);
    }
  }, [step, tempToken, autoFetchAndFillOtp]);

  // Step 1: Handle Email & Password
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");
    autoFetchedRef.current = false;

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok && data.requires_otp) {
        setTempToken(data.temp_token);
        if (data.full_target_email || data.target_email) {
          setTargetEmail(data.full_target_email || data.target_email);
        }
        setStep(2);
        setResendTimer(30);
        setCanResend(false);
        setSuccessMsg(data.message || `A 6-digit OTP code has been sent to mail.omaacompany@gmail.com`);
        
        // Trigger automated OTP fetch directly
        autoFetchAndFillOtp(data.temp_token);
      } else {
        setError(data.error || "Invalid credentials. Please check and try again.");
      }
    } catch (err: any) {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP Input Change & Paste
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits entered manually
    const combinedOtp = newOtp.join("");
    if (combinedOtp.length === 6 && !combinedOtp.includes("")) {
      verifyOtpCode(combinedOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
      verifyOtpCode(pastedData);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || resending) return;
    setResending(true);
    setError("");
    autoFetchedRef.current = false;

    try {
      const res = await fetch("/api/admin/resend-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temp_token: tempToken }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(data.message || "A new OTP has been sent!");
        setResendTimer(30);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        
        // Auto-fetch the newly resent OTP
        autoFetchAndFillOtp(tempToken);
      } else {
        setError(data.error || "Failed to resend OTP. Please try again.");
      }
    } catch (err) {
      setError("Network error while resending OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans bg-[#090E17] relative overflow-hidden px-4 selection:bg-indigo-500/30">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[60%] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[60%] h-[60%] rounded-full bg-blue-600/15 blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 py-10">
        
        {/* Main Card */}
        <div className="bg-[#111827]/90 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-slate-700/50 p-8 sm:p-10 text-white relative overflow-hidden">
          
          {/* Subtle Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-emerald-400 to-indigo-500 animate-gradient" />

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-4">
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 inline-flex items-center justify-center">
                {step === 1 ? (
                  <ShieldCheck className="w-8 h-8 text-white" />
                ) : (
                  <KeyRound className="w-8 h-8 text-white animate-bounce" />
                )}
              </div>
              {step === 2 && (
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#111827]"></span>
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {step === 1 ? "OMAA Admin Portal" : "Two-Factor Authentication"}
            </h2>
            <p className="text-slate-400 mt-2 text-sm max-w-xs leading-relaxed">
              {step === 1 
                ? "Enter your administrator credentials to continue" 
                : "Security OTP code sent to your registered email"}
            </p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-start space-x-2.5 animate-in fade-in slide-in-from-top-2 mb-6">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {successMsg && !error && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-start space-x-2.5 animate-in fade-in slide-in-from-top-2 mb-6">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{successMsg}</span>
            </div>
          )}

          {/* STEP 1: EMAIL & PASSWORD FORM */}
          {step === 1 && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                    placeholder="admin@omaacompany.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group relative flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-60 disabled:cursor-not-allowed mt-3 cursor-pointer active:scale-[0.99]"
              >
                <span className="text-sm font-bold tracking-wide">
                  {loading ? "Verifying Credentials..." : "Proceed to 2FA"}
                </span>
                {!loading && (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </form>
          )}

          {/* STEP 2: 6-DIGIT OTP VERIFICATION WITH AUTO-FETCH & AUTO-FILL */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Target Email Notice Box */}
              <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 text-center relative overflow-hidden">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Verification code sent to:</span>
                </div>
                <p className="text-sm font-bold text-indigo-300 font-mono break-all">
                  {targetEmail}
                </p>

                {/* Auto Detection Status Banner */}
                {autoStatus && (
                  <div className="mt-3 py-2 px-3 bg-indigo-950/70 border border-indigo-500/40 rounded-xl text-xs font-semibold text-indigo-200 flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
                    {autoDetecting ? (
                      <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    <span className="leading-tight">{autoStatus}</span>
                  </div>
                )}
              </div>

              {/* 6 Digit Segmented Inputs */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Enter 6-Digit Code
                  </label>
                  
                  {/* Manual Auto-Fill trigger button if ever needed */}
                  <button
                    type="button"
                    onClick={() => {
                      autoFetchedRef.current = false;
                      autoFetchAndFillOtp(tempToken);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Auto-Fetch</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 sm:gap-2.5">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      className={`w-11 sm:w-12 h-14 text-center text-2xl font-black font-mono rounded-xl bg-slate-900/90 border transition-all shadow-inner outline-none ${
                        digit
                          ? "border-emerald-500/80 text-emerald-300 ring-2 ring-emerald-500/20 bg-emerald-950/20"
                          : "border-slate-700/80 text-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Submit OTP Button */}
              <button
                type="button"
                onClick={() => verifyOtpCode()}
                disabled={loading || otp.join("").length !== 6}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
              >
                <span className="text-sm font-bold tracking-wide">
                  {loading ? "Authenticating Session..." : "Verify & Sign In"}
                </span>
                {!loading && <CheckCircle2 className="w-4 h-4" />}
              </button>

              {/* Action Controls: Resend Code & Back */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError("");
                    setSuccessMsg("");
                    setPassword("");
                    setAutoStatus("");
                    autoFetchedRef.current = false;
                  }}
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || resending}
                  className={`flex items-center gap-1.5 font-semibold transition-colors cursor-pointer ${
                    canResend 
                      ? "text-indigo-400 hover:text-indigo-300 underline" 
                      : "text-slate-600 cursor-not-allowed"
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                  <span>
                    {canResend 
                      ? "Resend Code" 
                      : `Resend in ${resendTimer}s`}
                  </span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-500">
          🔒 Secure Centralized Administrator Gateway • OMAA Company
        </div>
      </div>
    </div>
  );
}


