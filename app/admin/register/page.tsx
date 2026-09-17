"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Mail, User, ShieldCheck } from "lucide-react";

export default function AdminRegister() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/login");
  }, [router]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin/login");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-600/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md p-8 relative z-10">
        
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10">
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-gradient-to-br from-[#2f3d51] to-[#1e293b] p-3 rounded-2xl shadow-lg shadow-slate-300/50 mb-4 inline-flex">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h2>
            <p className="text-slate-500 mt-2 text-sm">Register as a new administrator</p>
          </div>

          {error && (
            <div className="bg-red-50/50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none text-sm"
                  placeholder="admin@omaa.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative flex items-center justify-center space-x-2 bg-[#2f3d51] hover:bg-[#1e293b] text-white font-semibold py-3.5 px-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              <span className="relative z-10 text-sm">{loading ? "Creating..." : "Register"}</span>
              {!loading && (
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </form>

        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/admin/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
