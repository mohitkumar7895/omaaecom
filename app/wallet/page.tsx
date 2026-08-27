"use client";

import Navbar from "../components/Navbar";
import { Wallet, TrendingUp, IndianRupee, ArrowDownRight, ArrowUpRight, History, ShieldCheck, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const fetchWallet = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const { user } = await res.json();
        setUser(user);
        
        if (user) {
          const wRes = await fetch("/api/wallet");
          if (wRes.ok) {
            const data = await wRes.json();
            setBalance(data.balance || 0);
            setTransactions(data.transactions || []);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load wallet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
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
            <Wallet className="w-16 h-16 text-gray-300 mb-6" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">Login to view Wallet</h1>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">Securely manage your cashback and wallet balance.</p>
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

  // Calculate total earned (just credits)
  const totalEarned = transactions
    .filter(tx => tx.type === 'Credit')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  return (
    <main className="min-h-screen bg-[#f7f8fc] flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-4 pb-20">
        
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8 mt-2">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-[0_8px_30px_rgba(245,158,11,0.3)]">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">OMAA Company Wallet</h1>
            <p className="text-gray-500 font-medium text-sm mt-1">Your premium rewards and balance</p>
          </div>
        </div>

        {/* Premium Balance Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-[#1a1c29] to-black rounded-[32px] p-8 sm:p-12 mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/10 group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-500/10 to-teal-400/10 blur-[80px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/4"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <p className="text-amber-400/90 font-bold tracking-[0.2em] uppercase text-[11px] mb-4 flex items-center gap-2 bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-400/20">
              <ShieldCheck className="w-4 h-4" />
              Total Available Balance
            </p>
            <div className="flex items-start justify-center gap-1 mb-8">
              <span className="text-4xl sm:text-5xl font-semibold text-white/50 mt-2">₹</span>
              <h2 className="text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 tracking-tighter drop-shadow-sm">{Number(balance)}</h2>
            </div>
            
            <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex justify-around">
              <div className="text-center">
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5">Total Earned</p>
                <p className="text-emerald-400 font-bold text-xl tracking-wide">₹{Number(totalEarned)}</p>
              </div>
              <div className="w-px bg-white/10"></div>
              <div className="text-center">
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5">Spent</p>
                <p className="text-gray-300 font-bold text-xl tracking-wide">₹0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-400" />
              Recent Transactions
            </h3>
            <button className="text-sm font-semibold text-[#6069c9] hover:text-[#525ab5]">View All</button>
          </div>

          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
            {transactions.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
                  <IndianRupee className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">No Transactions Yet</h4>
                <p className="text-gray-500 text-sm">Complete a booking, claim daily cashback, or add money.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {transactions.map((tx, idx) => (
                  <div key={idx} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'Credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {tx.type === 'Credit' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{tx.description}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Tx: {tx.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black ${tx.type === 'Credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {tx.type === 'Credit' ? '+' : '-'}₹{Number(tx.amount)}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                        {new Date(tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}