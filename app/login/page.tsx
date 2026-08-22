"use client";

import Navbar from "../components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, KeyRound } from "lucide-react";
import { auth } from "../../lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<any>(null);

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (data.user) router.push("/");
        }
      } catch (e) {
        setUser(null);
      }
    };
    
    checkAuth();
    window.addEventListener("auth_changed", checkAuth);
    return () => window.removeEventListener("auth_changed", checkAuth);
  }, [router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      
      setStep("otp");
      setResendTimer(60);
      setSuccess("OTP sent to your email!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Invalid OTP");
      
      window.dispatchEvent(new Event("auth_changed"));
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const res = await fetch("/api/auth/google-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          uid: result.user.uid, 
          email: result.user.email,
          displayName: result.user.displayName 
        }),
      });
      
      if (!res.ok) throw new Error("Failed to sync account");
      
      await auth.signOut();
      
      window.dispatchEvent(new Event("auth_changed"));
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.dispatchEvent(new Event("auth_changed"));
    setUser(null);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fc] flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="mb-8">
          <Image src="/logoomaa.webp" alt="OMAA Logo" width={160} height={50} className="h-12 w-auto object-contain"/>
        </div>

        <div className="bg-white rounded-[24px] shadow-xl p-6 sm:p-8 max-w-[420px] w-full border border-gray-100">
          {user ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Successfully Logged In</h2>
              <p className="text-gray-500 mb-6">Authenticated as: <br/><span className="font-semibold text-gray-800">{user.email || user.name}</span></p>
              <button onClick={handleLogout} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors">
                Logout
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-[20px] sm:text-[22px] font-bold text-gray-900 tracking-tight text-center mb-2">
                Welcome to OMAA
              </h2>
              <p className="text-gray-500 text-[14px] text-center mb-8 font-medium">
                Log in or sign up to continue
              </p>

              {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-[13px] font-medium border border-red-100 flex items-center justify-center text-center">{error}</div>}
              {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-[13px] font-medium border border-green-100 flex items-center justify-center text-center">{success}</div>}

              {step === "email" ? (
                <div className="space-y-4">
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6b62d9]/20 focus:border-[#6b62d9] transition-all"
                      />
                    </div>
                    <button type="submit" disabled={loading} className={`relative w-full flex items-center justify-center gap-3 bg-[#6b62d9] text-white py-3.5 px-4 rounded-xl font-bold transition-all shadow-sm ${loading ? 'opacity-80 cursor-not-allowed' : 'hover:bg-[#5b52c9] hover:shadow-md'}`}>
                      {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Get OTP</span>}
                    </button>
                  </form>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-semibold uppercase tracking-widest">Or</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  {/* Google Button */}
                  <button 
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full bg-white border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm flex justify-center items-center gap-3 disabled:opacity-70 group"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Enter 6-digit OTP"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[15px] font-bold tracking-widest text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6b62d9]/20 focus:border-[#6b62d9] transition-all text-center"
                    />
                  </div>
                  <button type="submit" disabled={loading || otp.length !== 6} className={`relative w-full flex items-center justify-center gap-3 bg-[#6b62d9] text-white py-3.5 px-4 rounded-xl font-bold transition-all shadow-sm ${(loading || otp.length !== 6) ? 'opacity-80 cursor-not-allowed' : 'hover:bg-[#5b52c9] hover:shadow-md'}`}>
                    {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>Verify OTP</span>}
                  </button>
                  <div className="text-center mt-4">
                    {resendTimer > 0 ? (
                      <p className="text-sm text-gray-500 font-medium">Resend OTP in {resendTimer}s</p>
                    ) : (
                      <button type="button" onClick={() => handleSendOtp()} className="text-sm text-[#6b62d9] font-bold hover:underline">Resend OTP</button>
                    )}
                    <button type="button" onClick={() => { setStep("email"); setError(""); setSuccess(""); }} className="block w-full mt-3 text-sm text-gray-500 font-medium hover:text-gray-800 transition">
                      Change Email Address
                    </button>
                  </div>
                </form>
              )}

              <p className="mt-8 text-center text-[12px] text-gray-400 font-medium">
                By continuing, you agree to our <Link href="/terms" className="text-gray-600 underline hover:text-[#6b62d9]">Terms</Link> & <Link href="/privacy" className="text-gray-600 underline hover:text-[#6b62d9]">Privacy Policy</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
