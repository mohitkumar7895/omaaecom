"use client";

import Navbar from "../components/Navbar";
import { 
  Wallet, 
  Sparkles, 
  IndianRupee, 
  ArrowDownRight, 
  ArrowUpRight, 
  History, 
  ShieldCheck, 
  Copy, 
  Check, 
  Share2, 
  Users, 
  HelpCircle, 
  AlertCircle, 
  Building2, 
  Smartphone, 
  CheckCircle2, 
  X,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getStoredUser, fetchCurrentUser, authFetch, persistLogin } from "@/lib/client-auth";
import LoginModal from "../components/LoginModal";

function WalletContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(() => getStoredUser());
  const [walletData, setWalletData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"points" | "referral_money" | "referrals" | "withdrawals">("referrals");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const refParam = searchParams?.get("ref") || (typeof window !== "undefined" ? localStorage.getItem("omaa_referral_code") || "" : "");

  // Referral copy state
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Withdrawal modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<"UPI" | "Bank">("UPI");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [upiId, setUpiId] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");

  const fetchWallet = async () => {
    try {
      const stored = getStoredUser();
      if (stored) setUser(stored);

      const currentUser = await fetchCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const wRes = await authFetch("/api/wallet");
        if (wRes.ok) {
          const data = await wRes.json();
          setWalletData(data.summary || null);
          if (data.summary?.referral_money?.available_balance) {
            setWithdrawAmount(String(data.summary.referral_money.available_balance));
          }
        }
      } else if (!getStoredUser()) {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to load wallet", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  useEffect(() => {
    if (!user && refParam) {
      const t = setTimeout(() => {
        setIsLoginModalOpen(true);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [user, refParam]);

  const getReferralLink = () => {
    const code = walletData?.referral_network?.referral_code || user?.referral_code || "";
    if (!code) return "https://omaacompany.com/wallet";
    return `https://omaacompany.com/wallet?ref=${code}`;
  };

  const handleCopyLink = () => {
    const link = getReferralLink();
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    if (!walletData?.referral_network?.referral_code) return;
    navigator.clipboard.writeText(walletData.referral_network.referral_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const link = getReferralLink();
    const message = `Hey! Check out OMAA Company for doorstep RO, AC & home appliance services. Sign up on Wallet using my link to get 100 Welcome Points instantly! ${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError("");
    setWithdrawSuccess("");

    const amt = Number(withdrawAmount);
    if (isNaN(amt) || amt < 200) {
      setWithdrawError("Minimum withdrawal limit is ₹200.");
      return;
    }

    const available = walletData?.referral_money?.available_balance || 0;
    if (amt > available) {
      setWithdrawError(`Amount exceeds your available balance of ₹${available.toFixed(2)}.`);
      return;
    }

    if (withdrawMethod === "UPI" && (!upiId.trim() || !upiId.includes("@"))) {
      setWithdrawError("Please enter a valid UPI ID (e.g. mobile@upi).");
      return;
    }

    if (withdrawMethod === "Bank") {
      if (!bankName.trim() || !accountNumber.trim() || !ifscCode.trim() || !accountHolderName.trim()) {
        setWithdrawError("Please fill out all bank account fields.");
        return;
      }
    }

    setIsSubmittingWithdraw(true);
    try {
      const res = await authFetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          payment_method: withdrawMethod,
          upi_id: upiId,
          bank_name: bankName,
          account_number: accountNumber,
          ifsc_code: ifscCode,
          account_holder_name: accountHolderName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit withdrawal request.");

      setWithdrawSuccess(data.message || "Withdrawal request submitted successfully!");
      // Refresh wallet
      await fetchWallet();
      setTimeout(() => {
        setShowWithdrawModal(false);
        setWithdrawSuccess("");
        setActiveTab("withdrawals");
      }, 2000);
    } catch (err: any) {
      setWithdrawError(err.message || "Failed to submit withdrawal request.");
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-9 h-9 border-4 border-[#6069c9] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-4 sm:mt-8">
          <div className="bg-white rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-8 sm:p-14 flex flex-col items-center justify-center text-center min-h-[50vh]">
            <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 mb-6 border border-amber-100">
              <Wallet className="w-10 h-10" />
            </div>

            {refParam && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-center gap-3 text-left max-w-lg w-full">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                  🎁
                </div>
                <div>
                  <p className="text-xs font-black text-amber-900 uppercase tracking-wider">
                    Referral Invitation Applied
                  </p>
                  <p className="text-xs text-amber-800 mt-0.5 font-medium leading-relaxed">
                    You were invited with referral code <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">{refParam}</strong>. Sign up or log in now to claim your <strong>100 Welcome Points</strong> and activate your wallet!
                  </p>
                </div>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
              {refParam ? "Claim Your 100 Welcome Points" : "Login to View Your Rewards & Wallet"}
            </h1>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
              {refParam 
                ? "Sign in or create your account using your email to instantly receive 100 points, start earning ₹400 + ₹200 on referrals, and access your personal wallet."
                : "Track your 100 Welcome Points, Purchase Rewards, 2-Level Referral Earnings (₹400 / ₹200), and withdraw cash directly to your bank or UPI."}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-9 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Login / Sign Up
              </button>
            </div>
          </div>
        </div>

        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={(loggedInUser, token) => {
            if (loggedInUser) {
              persistLogin(loggedInUser, token);
              setUser(loggedInUser);
              fetchWallet();
            }
            setIsLoginModalOpen(false);
          }}
        />
      </main>
    );
  }

  const pointsData = walletData?.points || { welcome_points: 100, purchase_points: 0, redeemed_points: 0, available_points: 100, history: [] };
  const referralData = walletData?.referral_money || { total_earned: 0, total_withdrawn: 0, total_used_checkout: 0, available_balance: 0, min_withdrawal_limit: 200, can_withdraw: false, history: [] };
  const networkData = walletData?.referral_network || { referral_code: "", referral_link: "", level1_users: [], level2_users: [], total_network_count: 0 };
  const withdrawalsList = walletData?.withdrawals || [];

  return (
    <main className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-2 pb-24">
        
        {/* User Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-5 sm:p-6 rounded-[24px] border border-gray-100 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-[#6b62d9] rounded-2xl flex items-center justify-center text-white shadow-[0_8px_20px_rgba(107,98,217,0.25)] shrink-0">
              <Wallet className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  {user.name || user.email?.split('@')[0]}
                </h1>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  Verified Member
                </span>
              </div>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5 font-medium">{user.email}</p>
            </div>
          </div>

          {/* Referral Code Quick View */}
          <div className="flex items-center gap-2 bg-gray-50 p-2 sm:p-2.5 rounded-xl border border-gray-200/80 self-start sm:self-center">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-2">My Code:</span>
            <span className="font-mono font-black text-gray-900 text-sm tracking-wider px-2 py-1 bg-white rounded-lg border border-gray-200">
              {networkData.referral_code || "..."}
            </span>
            <button 
              onClick={handleCopyCode}
              title="Copy Referral Code"
              className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 transition cursor-pointer"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 2 DISTINCT WALLETS (RULE: Reward Points aur Referral Money ke separate wallets honge) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          
          {/* ========================================================================= */}
          {/* WALLET 1: REWARD POINTS WALLET */}
          {/* ========================================================================= */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#241f5a] to-[#0f172a] rounded-[32px] p-6 sm:p-8 text-white shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-white/10 flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/15 blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-amber-400 font-extrabold uppercase tracking-widest text-[11px] flex items-center gap-1.5 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  Reward Points Wallet
                </span>
                <span className="text-xs font-bold text-indigo-200 bg-white/10 px-2.5 py-1 rounded-lg">
                  1 Point = ₹1
                </span>
              </div>

              <div className="my-4">
                <p className="text-indigo-200 text-xs font-semibold tracking-wide uppercase">Available Redeemable Points</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-amber-100 to-white tracking-tight">
                    {pointsData.available_points}
                  </h2>
                  <span className="text-xl font-bold text-amber-300/80">Pts</span>
                </div>
              </div>

              {/* Points Breakdown Sub-cards */}
              <div className="grid grid-cols-3 gap-2.5 my-6 bg-white/5 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xs">
                <div className="text-center p-2 rounded-xl bg-white/5">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Welcome</p>
                  <p className="text-amber-300 font-extrabold text-base sm:text-lg mt-0.5">+{pointsData.welcome_points}</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-white/5">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Purchases</p>
                  <p className="text-emerald-400 font-extrabold text-base sm:text-lg mt-0.5">+{pointsData.purchase_points}</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-white/5">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Redeemed</p>
                  <p className="text-red-300 font-extrabold text-base sm:text-lg mt-0.5">-{pointsData.redeemed_points}</p>
                </div>
              </div>
            </div>

            {/* Redemption Rules Checklist */}
            <div className="bg-amber-400/10 rounded-2xl p-3.5 border border-amber-400/20 text-[12px] space-y-1.5">
              <div className="flex items-center gap-2 text-amber-200 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span><strong>Services (AC, Fridge, RO etc.):</strong> Max 50% paid via Points</span>
              </div>
              <div className="flex items-center gap-2 text-amber-200 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span><strong>New Products & RO AMC:</strong> Up to 100% full Points redemption</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* WALLET 2: REFERRAL MONEY WALLET */}
          {/* ========================================================================= */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#022c22] rounded-[32px] p-6 sm:p-8 text-white shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-white/10 flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/15 blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-emerald-300 font-extrabold uppercase tracking-widest text-[11px] flex items-center gap-1.5 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                  <IndianRupee className="w-3.5 h-3.5" />
                  Referral Money Wallet
                </span>
                <span className="text-xs font-bold text-emerald-200 bg-white/10 px-2.5 py-1 rounded-lg">
                  Actual Rupees (₹)
                </span>
              </div>

              <div className="my-4">
                <p className="text-emerald-200 text-xs font-semibold tracking-wide uppercase">Withdrawable Balance</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl sm:text-4xl font-semibold text-emerald-300/80">₹</span>
                  <h2 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-200 via-white to-gray-200 tracking-tight">
                    {Number(referralData.available_balance).toFixed(2)}
                  </h2>
                </div>
              </div>

              {/* Referral Money Breakdown */}
              <div className="grid grid-cols-3 gap-2.5 my-6 bg-white/5 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xs">
                <div className="text-center p-2 rounded-xl bg-white/5">
                  <p className="text-emerald-200/70 text-[10px] font-bold uppercase tracking-wider">Total Earned</p>
                  <p className="text-emerald-300 font-extrabold text-base sm:text-lg mt-0.5">₹{Number(referralData.total_earned).toFixed(0)}</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-white/5">
                  <p className="text-emerald-200/70 text-[10px] font-bold uppercase tracking-wider">Withdrawn</p>
                  <p className="text-emerald-100 font-extrabold text-base sm:text-lg mt-0.5">₹{Number(referralData.total_withdrawn).toFixed(0)}</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-white/5">
                  <p className="text-emerald-200/70 text-[10px] font-bold uppercase tracking-wider">Used in Orders</p>
                  <p className="text-emerald-100 font-extrabold text-base sm:text-lg mt-0.5">₹{Number(referralData.total_used_checkout).toFixed(0)}</p>
                </div>
              </div>
            </div>

            {/* Withdraw Action Box */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-left">
                <p className="text-xs text-emerald-200 font-medium">
                  Min. Withdrawal Limit: <strong className="text-white">₹200</strong>
                </p>
                <p className="text-[11px] text-emerald-300/80">
                  Withdraw to UPI or Bank Account anytime
                </p>
              </div>

              <button
                onClick={() => {
                  setWithdrawAmount(String(referralData.available_balance || 200));
                  setShowWithdrawModal(true);
                }}
                disabled={!referralData.can_withdraw}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  referralData.can_withdraw
                    ? 'bg-emerald-400 hover:bg-emerald-300 text-gray-950 font-black shadow-emerald-500/25 active:scale-95'
                    : 'bg-white/10 text-emerald-200/50 cursor-not-allowed border border-white/10'
                }`}
              >
                <Building2 className="w-4 h-4" />
                {referralData.can_withdraw ? "Withdraw Money" : "Min ₹200 Needed"}
              </button>
            </div>
          </div>

        </div>

        {/* 🚀 REFERRAL SHARING & 2-LEVEL EXPLANATION CARD */}
        <div className="bg-white rounded-[28px] p-6 sm:p-8 mb-10 border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs tracking-wider uppercase mb-1">
                <Users className="w-4 h-4" />
                <span>OMAA 2-Level Referral System</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Share Link & Earn ₹400 + ₹200 on Purchases
              </h3>
              <p className="text-gray-500 text-sm mt-1 max-w-xl">
                When your referred friend buys a <strong>New Product</strong> or <strong>RO AMC</strong>, you get ₹400, your original referrer gets ₹200, and your friend gets 200 Reward Points!
              </p>
            </div>

            {/* Share Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button 
                onClick={handleWhatsAppShare}
                className="bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-sm px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-sm active:scale-95 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                Share on WhatsApp
              </button>
              <button 
                onClick={handleCopyLink}
                className="bg-gray-900 hover:bg-black text-white font-extrabold text-sm px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-sm active:scale-95 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? "Link Copied!" : "Copy Referral Link"}
              </button>
            </div>
          </div>

          {/* Referral Link Field */}
          <div className="my-6 p-3 bg-gray-50 rounded-2xl border border-gray-200/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <span className="font-mono text-xs sm:text-sm text-gray-700 px-3 truncate font-medium">
              {getReferralLink()}
            </span>
            <button
              onClick={handleCopyLink}
              className="text-xs font-bold text-[#6b62d9] hover:text-[#584ec6] px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-2xs shrink-0 cursor-pointer text-center"
            >
              {copiedLink ? "Copied" : "Copy"}
            </button>
          </div>

          {/* 3-Level Visual Infographic */}
          <div className="mt-8">
            <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4 text-center">
              How the 2-Level Referral Chain Works
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col items-center text-center">
                <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center mb-2">1</span>
                <span className="text-xs font-extrabold text-indigo-700 uppercase">Level 1 (Direct Referrer)</span>
                <p className="text-2xl font-black text-gray-900 my-1">₹400</p>
                <p className="text-xs text-gray-500">Earned when your direct referral buys New Product or RO AMC</p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col items-center text-center">
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-2">2</span>
                <span className="text-xs font-extrabold text-emerald-700 uppercase">Level 2 (Original Referrer)</span>
                <p className="text-2xl font-black text-gray-900 my-1">₹200</p>
                <p className="text-xs text-gray-500">Earned when your referral's friend buys New Product or RO AMC</p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-100 flex flex-col items-center text-center">
                <span className="w-8 h-8 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center mb-2">3</span>
                <span className="text-xs font-extrabold text-amber-700 uppercase">Product Buyer</span>
                <p className="text-2xl font-black text-gray-900 my-1">200 Pts</p>
                <p className="text-xs text-gray-500">Credited to the buyer's reward points wallet after purchase</p>
              </div>

            </div>
          </div>
        </div>

        {/* 📑 TABBED DETAILS & HISTORIES */}
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("referrals")}
              className={`px-6 py-4 font-extrabold text-sm border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === "referrals"
                  ? "border-[#6b62d9] text-[#6b62d9] bg-[#6b62d9]/5"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <Users className="w-4 h-4" />
              Referral Network ({networkData.total_network_count})
            </button>

            <button
              onClick={() => setActiveTab("points")}
              className={`px-6 py-4 font-extrabold text-sm border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === "points"
                  ? "border-amber-500 text-amber-600 bg-amber-50/40"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Reward Points History ({pointsData.history.length})
            </button>

            <button
              onClick={() => setActiveTab("referral_money")}
              className={`px-6 py-4 font-extrabold text-sm border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === "referral_money"
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/40"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <IndianRupee className="w-4 h-4" />
              Referral Money History ({referralData.history.length})
            </button>

            <button
              onClick={() => setActiveTab("withdrawals")}
              className={`px-6 py-4 font-extrabold text-sm border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === "withdrawals"
                  ? "border-gray-900 text-gray-900 bg-gray-50"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Withdrawal History ({withdrawalsList.length})
            </button>
          </div>

          {/* TAB 1: REFERRAL NETWORK */}
          {activeTab === "referrals" && (
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-extrabold text-lg text-gray-900">Your Referred Users</h4>
                  <p className="text-gray-500 text-xs mt-0.5">Track your direct (Level 1) and second-level (Level 2) referrals</p>
                </div>
              </div>

              {networkData.total_network_count === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h5 className="font-bold text-gray-800 text-base">No Referrals Yet</h5>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto mt-1">
                    Share your referral link with friends. When they register, they get 100 Welcome Points and appear here!
                  </p>
                  <button 
                    onClick={handleWhatsAppShare}
                    className="mt-5 bg-[#25D366] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
                  >
                    Share via WhatsApp
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Level 1 Direct */}
                  <div>
                    <h5 className="text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md inline-block mb-3">
                      Level 1: Direct Referrals ({networkData.level1_users.length}) • ₹400 / purchase
                    </h5>
                    <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                      {networkData.level1_users.map((u: any, idx: number) => (
                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50/50">
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{u.name || "Customer"}</p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">{u.email}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                              {Number(u.completed_orders || 0)} Completed Orders
                            </span>
                            <p className="text-[10px] text-gray-400 mt-1">
                              Joined: {new Date(u.created_at).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Level 2 Sub-referrals */}
                  {networkData.level2_users.length > 0 && (
                    <div>
                      <h5 className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md inline-block mb-3">
                        Level 2: Second-Level Referrals ({networkData.level2_users.length}) • ₹200 / purchase
                      </h5>
                      <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                        {networkData.level2_users.map((u: any, idx: number) => (
                          <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50/50">
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{u.name || "Customer"}</p>
                              <p className="text-xs text-gray-500 font-mono mt-0.5">{u.email}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                                {Number(u.completed_orders || 0)} Completed Orders
                              </span>
                              <p className="text-[10px] text-gray-400 mt-1">
                                Joined: {new Date(u.created_at).toLocaleDateString('en-GB')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REWARD POINTS HISTORY */}
          {activeTab === "points" && (
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-extrabold text-lg text-gray-900">Reward Points Ledger</h4>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Available: {pointsData.available_points} Points
                </span>
              </div>

              {pointsData.history.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No points transactions recorded.</div>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                  {pointsData.history.map((tx: any, idx: number) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          tx.type === 'Credit' ? 'bg-amber-100 text-amber-700' : 'bg-red-50 text-red-600'
                        }`}>
                          {tx.type === 'Credit' ? <Sparkles className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{tx.description}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-black text-base ${tx.type === 'Credit' ? 'text-amber-600' : 'text-red-600'}`}>
                          {tx.type === 'Credit' ? '+' : '-'}{tx.points} Pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REFERRAL MONEY HISTORY */}
          {activeTab === "referral_money" && (
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-extrabold text-lg text-gray-900">Referral Money Earnings (₹)</h4>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Balance: ₹{Number(referralData.available_balance).toFixed(2)}
                </span>
              </div>

              {referralData.history.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  No referral earnings yet. When your referrals purchase New Products or RO AMC, your ₹400 / ₹200 commissions will show here.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                  {referralData.history.map((tx: any, idx: number) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          tx.type === 'Credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-600'
                        }`}>
                          {tx.type === 'Credit' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{tx.description}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-black text-base ${tx.type === 'Credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {tx.type === 'Credit' ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WITHDRAWALS HISTORY */}
          {activeTab === "withdrawals" && (
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-extrabold text-lg text-gray-900">Withdrawal Requests</h4>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  disabled={!referralData.can_withdraw}
                  className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  New Request
                </button>
              </div>

              {withdrawalsList.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No withdrawal requests made yet.</div>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                  {withdrawalsList.map((wd: any, idx: number) => (
                    <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-900 text-sm">#{wd.withdrawal_id}</span>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            wd.status === 'Completed' || wd.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : wd.status === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {wd.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Method: <strong>{wd.payment_method}</strong> • {wd.upi_id ? `UPI: ${wd.upi_id}` : `Bank: ${wd.account_number} (${wd.bank_name})`}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Requested: {new Date(wd.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <span className="text-lg font-black text-gray-900">₹{Number(wd.amount).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 🚀 WITHDRAWAL POPUP MODAL */}
      {/* ========================================================================= */}
      {showWithdrawModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowWithdrawModal(false)}
        >
          <div 
            className="bg-white rounded-[28px] w-full max-w-md shadow-2xl border border-gray-100 p-6 sm:p-7 relative my-auto animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Withdraw Referral Money</h3>
                <p className="text-xs text-gray-500">Available: ₹{referralData.available_balance.toFixed(2)}</p>
              </div>
            </div>

            {withdrawError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-100">
                {withdrawError}
              </div>
            )}

            {withdrawSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-green-50 text-green-700 text-xs font-semibold border border-green-100">
                {withdrawSuccess}
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              
              {/* Amount input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Withdrawal Amount (Min ₹200)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="200"
                    max={referralData.available_balance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Select Payout Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod("UPI")}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition cursor-pointer ${
                      withdrawMethod === "UPI"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" /> UPI ID
                  </button>

                  <button
                    type="button"
                    onClick={() => setWithdrawMethod("Bank")}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition cursor-pointer ${
                      withdrawMethod === "Bank"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Building2 className="w-4 h-4" /> Bank Account
                  </button>
                </div>
              </div>

              {/* UPI Fields */}
              {withdrawMethod === "UPI" ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    UPI ID (e.g. 9876543210@paytm, user@oksbi)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    required={withdrawMethod === "UPI"}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="Name as per bank records"
                      required={withdrawMethod === "Bank"}
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. HDFC Bank"
                        required={withdrawMethod === "Bank"}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        placeholder="HDFC0001234"
                        required={withdrawMethod === "Bank"}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter Bank Account Number"
                      required={withdrawMethod === "Bank"}
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingWithdraw}
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm py-3.5 rounded-xl transition shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmittingWithdraw ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Submit Withdrawal Request</span>
                )}
              </button>

            </form>
          </div>
        </div>
      )}

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(loggedInUser, token) => {
          if (loggedInUser) {
            persistLogin(loggedInUser, token);
            setUser(loggedInUser);
            fetchWallet();
          }
          setIsLoginModalOpen(false);
        }}
      />

    </main>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-9 h-9 border-4 border-[#6069c9] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    }>
      <WalletContent />
    </Suspense>
  );
}