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
  
  // States for Add Money
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState("");
  const [addError, setAddError] = useState("");

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

  const handleAddMoney = async () => {
    setIsAdding(true);
    setAddError("");
    setAddSuccess("");
    
    // Simulate adding ₹500
    try {
      const res = await fetch("/api/wallet/add-money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 500 })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to add money");
      
      setAddSuccess(`Success! ₹500 added.`);
      fetchWallet(); // refresh balance and history
      
      setTimeout(() => setAddSuccess(""), 3000);
    } catch (err: any) {
      setAddError(err.message);
      setTimeout(() => setAddError(""), 3000);
    } finally {
      setIsAdding(false);
    }
  };

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
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">OMAA Wallet</h1>
            <p className="text-gray-500 font-medium">Your earned cashback and rewards</p>
          </div>
        </div>

        {/* Notifications */}
        {addSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> {addSuccess}
          </div>
        )}
        {addError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm font-semibold">
            {addError}
          </div>
        )}

        {/* Balance Card (Glassmorphism + Gradients) */}
        <div className="relative overflow-hidden bg-gray-900 rounded-[28px] p-8 sm:p-10 mb-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-indigo-500/30 to-purple-500/30 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 blur-[60px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/4"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <p className="text-gray-400 font-medium tracking-wide uppercase text-sm mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Available Balance
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-semibold text-white/80">₹</span>
                  <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tight">{balance.toFixed(2)}</h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleAddMoney}
                  disabled={isAdding}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_4px_24px_rgba(0,0,0,0.2)] flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {isAdding ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />} 
                  {isAdding ? 'Adding...' : 'Add ₹500 (Demo)'}
                </button>
              </div>
            </div>
            
            <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Earned</p>
                <p className="text-emerald-400 font-bold text-lg">₹{totalEarned.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Spent</p>
                <p className="text-white font-bold text-lg">₹0.00</p>
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
                        {tx.type === 'Credit' ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
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