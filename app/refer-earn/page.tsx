"use client";

import { Eye, EyeOff, CheckCircle2, Share2, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ReferEarnPage() {
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [referralData, setReferralData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    referral_member_id: "",
    referral_user_name: "",
    name: "",
    email: "",
    mobile: "",
    coupon_code: "",
    password: "",
    confirm_password: ""
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/refer-earn/me");
        if (res.ok) {
          const data = await res.json();
          if (data.isReferralMember) {
            setReferralData(data.referralData);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegister = async () => {
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match!");
      return;
    }

    if (form.mobile.length < 10) {
      setError("Please enter a valid mobile number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/refer-earn/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referral_member_id: form.referral_member_id,
          referral_user_name: form.referral_user_name,
          name: form.name,
          email: form.email,
          mobile: form.mobile,
          coupon_code: form.coupon_code,
          password: form.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register. Please try again.");
      }

      setSuccess("Registration successful! You can now log in.");
      
      setTimeout(() => {
        setIsLogin(true);
        setSuccess("");
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/refer-earn/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid email or password.");
      }

      setSuccess("Login successful! Redirecting...");
      
      window.dispatchEvent(new Event("auth_changed"));

      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (isLogin) {
      await handleLogin();
    } else {
      await handleRegister();
    }
  };

  const handleCopy = () => {
    const link = `https://omaacompany.in/?ref=${referralData?.referral_member_id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass = "w-full bg-white/40 hover:bg-white/50 focus:bg-white/70 focus:outline-none focus:ring-[3px] focus:ring-white/80 transition-all duration-300 px-5 py-3.5 rounded-[12px] text-[#0f4d4d] font-bold text-[14px] placeholder:text-[#187576] placeholder:font-semibold shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-white/50 backdrop-blur-md";

  if (isCheckingSession) {
    return (
      <main className="min-h-screen bg-[#0cc7c9] flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0cc7c9] relative flex flex-col items-center justify-center p-4 font-sans overflow-hidden">
      
      {/* Background Depth Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#2dedef] blur-[120px] rounded-full opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#099b9d] blur-[150px] rounded-full opacity-70"></div>
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] bg-white/10 blur-[100px] rounded-full pointer-events-none"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-[15%] right-[20%] w-24 h-24 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 rotate-12 animate-[bounce_8s_infinite] shadow-xl hidden sm:block"></div>
      <div className="absolute bottom-[20%] left-[15%] w-16 h-16 bg-white/10 backdrop-blur-2xl rounded-full border border-white/20 -rotate-12 animate-[bounce_6s_infinite_reverse] shadow-xl hidden sm:block"></div>

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-[650px] bg-white/30 backdrop-blur-[30px] rounded-[32px] border-2 border-white/50 p-7 sm:p-12 shadow-[0_30px_60px_rgba(0,0,0,0.15),inset_0_0_0_1px_rgba(255,255,255,0.4)] my-8">
        
        {/* Logo Section */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-[20px] py-4 px-10 shadow-[0_10px_25px_rgba(0,0,0,0.1)] flex flex-col items-center transform transition-transform hover:scale-105 duration-300">
            <div className="w-[50px] h-[40px] bg-[#35338a] rounded-xl flex items-center justify-center text-white font-black text-[20px] mb-1.5 shadow-inner">
              OC
            </div>
            <div className="text-gray-900 font-extrabold text-[16px] tracking-tight">OMAA Company</div>
          </div>
        </div>

        {referralData ? (
          <div className="text-center text-[#0a3838]">
            <h2 className="text-3xl sm:text-4xl font-black mb-3 text-gray-900 tracking-tight">Refer & Earn ₹100 to ₹32Cr</h2>
            <p className="text-base sm:text-lg font-semibold text-gray-800 mb-8 opacity-90">
              Get <span className="font-black text-[#11c9cb] px-2 py-1 bg-white rounded-lg shadow-sm">₹100</span> when your friend completes their first booking!
            </p>
            
            <div className="bg-white/40 p-6 rounded-2xl border border-white/60 shadow-inner mb-6 backdrop-blur-md">
              <p className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wider">Your Unique Share Link</p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full bg-white p-4 rounded-xl border border-gray-100 font-mono text-[14px] font-semibold text-gray-800 break-all shadow-sm">
                  https://omaacompany.in/?ref={referralData.referral_member_id}
                </div>
                <button 
                  onClick={handleCopy}
                  className="w-full sm:w-auto shrink-0 bg-[#35338a] hover:bg-[#2a286e] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                  {copied ? "COPIED" : "COPY LINK"}
                </button>
              </div>
            </div>

            <div className="bg-white/40 p-5 rounded-2xl border border-white/60 shadow-inner backdrop-blur-md">
              <p className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Your Referral Code</p>
              <div className="text-3xl font-black text-[#35338a] tracking-widest bg-white inline-block px-6 py-2 rounded-xl shadow-sm border border-gray-100">
                {referralData.referral_member_id}
              </div>
            </div>
            
            <div className="mt-8">
              <Link href="/wallet">
                <button className="bg-white text-[#0a3838] font-black text-sm uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:bg-gray-50 transition-all active:scale-95 border border-transparent">
                  View Wallet & Earnings
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Notifications */}
            {error && (
              <div className="mb-6 p-4 bg-red-100/80 backdrop-blur-md border border-red-300 text-red-800 rounded-xl text-center font-bold shadow-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-100/80 backdrop-blur-md border border-green-300 text-green-800 rounded-xl text-center font-bold shadow-sm">
                {success}
              </div>
            )}

            {/* Form Section */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {!isLogin ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <input 
                    type="text" 
                    name="referral_member_id"
                    value={form.referral_member_id}
                    onChange={handleChange}
                    placeholder="Referral Member Id *" 
                    className={inputClass} 
                    required 
                  />
                  <input 
                    type="text" 
                    name="referral_user_name"
                    value={form.referral_user_name}
                    onChange={handleChange}
                    placeholder="Referral User Name *" 
                    className={inputClass} 
                    required 
                  />
                  
                  <input 
                    type="text" 
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Name *" 
                    className={inputClass} 
                    required 
                  />
                  <input 
                    type="email" 
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email *" 
                    className={inputClass} 
                    required 
                  />
                  
                  <input 
                    type="tel" 
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="Mobile *" 
                    className={inputClass} 
                    required 
                    maxLength={15}
                  />
                  <input 
                    type="text" 
                    name="coupon_code"
                    value={form.coupon_code}
                    onChange={handleChange}
                    placeholder="Coupon Code" 
                    className={inputClass} 
                  />
                  
                  {/* Password */}
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Password *" 
                      className={inputClass} 
                      required 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#187576] hover:text-[#0f4d4d] focus:outline-none transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      name="confirm_password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      placeholder="Confirm Password *" 
                      className={inputClass} 
                      required 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#187576] hover:text-[#0f4d4d] focus:outline-none transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 max-w-sm mx-auto">
                  <input 
                    type="email" 
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email *" 
                    className={inputClass} 
                    required 
                  />
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Password *" 
                      className={inputClass} 
                      required 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#187576] hover:text-[#0f4d4d] focus:outline-none transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-4 max-w-sm mx-auto sm:max-w-none">
                <button 
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-[#11c9cb] hover:bg-[#0eaeb0] text-white font-black text-[16px] tracking-[0.15em] uppercase py-4 rounded-[14px] shadow-[0_10px_25px_rgba(17,201,203,0.4)] transition-all duration-300 hover:shadow-[0_15px_35px_rgba(17,201,203,0.5)] active:scale-[0.98] border border-white/20 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (isLogin ? "LOGGING IN..." : "SUBMITTING...") : (isLogin ? "LOGIN" : "REGISTER")}
                </button>
                
                <div className="mt-6 text-center">
                  {!isLogin ? (
                    <p className="text-[#0a3838] font-medium text-[14px]">
                      Already have an account?{" "}
                      <button 
                        type="button" 
                        onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }} 
                        className="text-[#35338a] font-extrabold hover:underline"
                      >
                        Login
                      </button>
                    </p>
                  ) : (
                    <p className="text-[#0a3838] font-medium text-[14px]">
                      Don't have an account?{" "}
                      <button 
                        type="button" 
                        onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }} 
                        className="text-[#35338a] font-extrabold hover:underline"
                      >
                        Register
                      </button>
                    </p>
                  )}
                </div>
              </div>
            </form>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto relative z-10 w-full bg-black/10 py-5 text-center backdrop-blur-sm border-t border-white/10">
        <p className="text-white/90 text-[12px] font-medium tracking-wide">
          Copyright © 2026 All Rights Reserved <span className="font-extrabold text-white">OMAA Company</span>
        </p>
      </div>
    </main>
  );
}