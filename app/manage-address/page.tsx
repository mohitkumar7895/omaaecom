"use client";

import Navbar from "../components/Navbar";
import { MapPin, Plus, Home, Briefcase, Building } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ManageAddressPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // We'll just mock addresses for now since there's no DB table for it yet, 
  // or we can just show empty state.
  const addresses: any[] = [];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const { user } = await res.json();
          setUser(user);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fc] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#6069c9] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f7f8fc] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-4 sm:mt-8">
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[50vh]">
            <MapPin className="w-16 h-16 text-gray-300 mb-6" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">Login Required</h1>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">Login to manage your saved addresses.</p>
            <Link href="/login">
              <button className="mt-8 bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md">
                Go to Login
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-4 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#e2e5fc] rounded-2xl flex items-center justify-center text-[#6069c9]">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Saved Addresses</h1>
              <p className="text-gray-500 font-medium">Manage locations for quick booking</p>
            </div>
          </div>
          <button className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Add New Address
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[40vh]">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6 border border-gray-100">
              <MapPin className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-2">No Saved Addresses</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">Add your home or work address for faster checkout.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Map over addresses here */}
          </div>
        )}
      </div>
    </main>
  );
}