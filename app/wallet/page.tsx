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
import { getStoredUser, fetchCurrentUser, authFetch, persistLogin, getRandomReferralCode, getActiveReferralCode } from "@/lib/client-auth";
import LoginModal from "../components/LoginModal";

function WalletContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(() => getStoredUser());
  const [walletData, setWalletData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"points" | "referral_money" | "referrals" | "withdrawals">("referrals");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [fallbackCode] = useState(() => getActiveReferralCode());

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
          const freshCode = data.summary?.referral_network?.referral_code || currentUser.referral_code;
          if (freshCode && !freshCode.startsWith("OC") && freshCode.length === 6) {
            try {
              localStorage.setItem("omaa_active_ref", freshCode);
              window.dispatchEvent(new CustomEvent("auth_changed", { detail: { user: currentUser } }));
            } catch(e) {}
          }
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

  const getCleanCode = () => {
    const code = walletData?.referral_network?.referral_code || user?.referral_code || "";
    if (code && !code.startsWith("OC") && code.length === 6) {
      return code;
    }
    return getActiveReferralCode();
  };

  const getReferralLink = () => {
    const code = getCleanCode();
    return `https://omaacompany.com/wallet?ref=${code}`;
  };

  const handleCopyLink = () => {
    const link = getReferralLink();
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    const code = getCleanCode();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const link = getReferralLink();
    const message = `Hey! Check out OMAA Company for doorstep RO, AC & home appliance services. Sign up on Wallet using my link to get 100 Welcome Points instantly! ${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleShare = async () => {
    const link = getReferralLink();
    const message = `Hey! Book Doorstep RO, AC & Home Appliance Repair on OMAA Company. Get 100 Welcome Points on wallet: ${link}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "OMAA Company - Refer & Earn",
          text: message,
          url: link,
        });
        return;
      } catch (err) {}
    }
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

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 sm:py-7">
        
        {/* Compact User Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-gray-900 tracking-tight truncate">
                  {user.name || user.email?.split('@')[0]}
                </h1>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/60">
                  Verified
                </span>
              </div>
              <p className="text-gray-500 text-xs truncate">{user.email}</p>
            </div>
          </div>

          {/* Referral Code Quick View */}
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200/80 self-start sm:self-center shrink-0">
            <span className="text-[11px] font-bold text-gray-500 uppercase">My Code:</span>
            <span className="font-mono font-black text-gray-900 text-xs tracking-wider px-2 py-0.5 bg-white rounded border border-gray-200">
              {getCleanCode()}
            </span>
            <button 
              onClick={handleCopyCode}
              title="Copy Referral Code"
              className="p-1 hover:bg-gray-200 rounded text-gray-600 transition cursor-pointer active:scale-95"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 2 Clean & Compact Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          
          {/* Card 1: Reward Points */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Reward Points
                </span>
                <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                  1 Pt = ₹1
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 my-2">
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                  {pointsData.available_points}
                </h2>
                <span className="text-xs font-bold text-gray-500">Pts Available</span>
              </div>

              {/* Mini Inline Stats */}
              <div className="flex items-center gap-3 text-[11px] text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-100 mb-2 flex-wrap">
                <span>Welcome: <strong className="text-emerald-700">+{pointsData.welcome_points}</strong></span>
                <span className="text-gray-300">•</span>
                <span>Purchases: <strong className="text-indigo-700">+{pointsData.purchase_points}</strong></span>
                <span className="text-gray-300">•</span>
                <span>Used: <strong className="text-red-600">-{pointsData.redeemed_points}</strong></span>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 font-medium">
              Redeemable at checkout (up to 100% on RO AMC & Products)
            </p>
          </div>

          {/* Card 2: Referral Cash */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5" />
                  Referral Cash
                </span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  Withdrawable
                </span>
              </div>

              <div className="flex items-baseline gap-1 my-2">
                <span className="text-2xl font-bold text-gray-500">₹</span>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                  {Number(referralData.available_balance).toFixed(2)}
                </h2>
              </div>

              {/* Mini Inline Stats */}
              <div className="flex items-center gap-3 text-[11px] text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-100 mb-2 flex-wrap">
                <span>Earned: <strong className="text-emerald-700">₹{Number(referralData.total_earned).toFixed(0)}</strong></span>
                <span className="text-gray-300">•</span>
                <span>Withdrawn: <strong className="text-gray-700">₹{Number(referralData.total_withdrawn).toFixed(0)}</strong></span>
                <span className="text-gray-300">•</span>
                <span>Min: <strong>₹200</strong></span>
              </div>
            </div>

            <button
              onClick={() => {
                setWithdrawAmount(String(referralData.available_balance || 200));
                setShowWithdrawModal(true);
              }}
              disabled={!referralData.can_withdraw}
              className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                referralData.can_withdraw
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              {referralData.can_withdraw ? "Withdraw to Bank / UPI" : "Withdraw (Min ₹200 Needed)"}
            </button>
          </div>

        </div>

        {/* Compact Referral Sharing Bar */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-200/80 shadow-xs mb-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-xs sm:text-sm font-black text-gray-900 tracking-tight">
              Refer to earn up to ₹400
            </h3>
            <span className="text-[10.5px] text-gray-500 font-medium">
              ₹400 (Level 1) + ₹200 (Level 2)
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                readOnly
                value={getReferralLink()}
                className="w-full px-2 sm:px-2.5 h-8 bg-gray-50 border border-gray-200 rounded-lg text-[9.5px] sm:text-xs font-mono font-semibold tracking-tight sm:tracking-normal text-gray-800 select-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
              />
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              title={copiedLink ? "Copied!" : "Copy link"}
              aria-label="Copy referral link"
              className={`w-8 h-8 rounded-lg transition shadow-xs shrink-0 flex items-center justify-center cursor-pointer active:scale-95 ${
                copiedLink ? "bg-emerald-600 text-white" : "bg-gray-900 hover:bg-black text-white"
              }`}
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              title="Share referral link"
              aria-label="Share referral link"
              className="w-8 h-8 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs shrink-0 flex items-center justify-center active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compact Tabs & History */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-none bg-gray-50/50">
            <button
              onClick={() => setActiveTab("referrals")}
              className={`px-3.5 py-2.5 font-bold text-xs border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === "referrals"
                  ? "border-indigo-600 text-indigo-700 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Network ({networkData.total_network_count})
            </button>

            <button
              onClick={() => setActiveTab("points")}
              className={`px-3.5 py-2.5 font-bold text-xs border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === "points"
                  ? "border-amber-500 text-amber-700 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Points ({pointsData.history.length})
            </button>

            <button
              onClick={() => setActiveTab("referral_money")}
              className={`px-3.5 py-2.5 font-bold text-xs border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === "referral_money"
                  ? "border-emerald-600 text-emerald-700 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5" />
              Cash ({referralData.history.length})
            </button>

            <button
              onClick={() => setActiveTab("withdrawals")}
              className={`px-3.5 py-2.5 font-bold text-xs border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === "withdrawals"
                  ? "border-gray-900 text-gray-900 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Withdrawals ({withdrawalsList.length})
            </button>
          </div>

          {/* TAB 1: REFERRAL NETWORK */}
          {activeTab === "referrals" && (
            <div className="p-4 sm:p-5">
              {networkData.total_network_count === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No referrals yet. Share your link to start earning!
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Level 1 Direct */}
                  <div>
                    <h5 className="text-[11px] font-black uppercase tracking-wider text-indigo-700 mb-2">
                      Level 1: Direct ({networkData.level1_users.length}) • ₹400 / purchase
                    </h5>
                    <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                      {networkData.level1_users.map((u: any, idx: number) => (
                        <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-gray-50/50">
                          <div>
                            <p className="font-bold text-gray-900">{u.name || "Customer"}</p>
                            <p className="text-[11px] text-gray-500 font-mono">{u.email}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                              {Number(u.completed_orders || 0)} Orders
                            </span>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {new Date(u.created_at).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Level 2 Sub-referrals */}
                  {networkData.level2_users.length > 0 && (
                    <div>
                      <h5 className="text-[11px] font-black uppercase tracking-wider text-emerald-700 mb-2">
                        Level 2: Indirect ({networkData.level2_users.length}) • ₹200 / purchase
                      </h5>
                      <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                        {networkData.level2_users.map((u: any, idx: number) => (
                          <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-gray-50/50">
                            <div>
                              <p className="font-bold text-gray-900">{u.name || "Customer"}</p>
                              <p className="text-[11px] text-gray-500 font-mono">{u.email}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                                {Number(u.completed_orders || 0)} Orders
                              </span>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {new Date(u.created_at).toLocaleDateString('en-GB')}
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
            <div className="p-4 sm:p-5">
              {pointsData.history.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">No points history yet.</div>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                  {pointsData.history.map((tx: any, idx: number) => (
                    <div key={idx} className="p-3 flex items-center justify-between hover:bg-gray-50/50 text-xs">
                      <div>
                        <p className="font-bold text-gray-900">{tx.description}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`font-black text-sm ${tx.type === 'Credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {tx.type === 'Credit' ? '+' : '-'}{tx.points} Pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REFERRAL CASH HISTORY */}
          {activeTab === "referral_money" && (
            <div className="p-4 sm:p-5">
              {referralData.history.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No referral cash earnings yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                  {referralData.history.map((tx: any, idx: number) => (
                    <div key={idx} className="p-3 flex items-center justify-between hover:bg-gray-50/50 text-xs">
                      <div>
                        <p className="font-bold text-gray-900">{tx.description}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`font-black text-sm ${tx.type === 'Credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {tx.type === 'Credit' ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WITHDRAWALS HISTORY */}
          {activeTab === "withdrawals" && (
            <div className="p-4 sm:p-5">
              {withdrawalsList.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">No withdrawal requests yet.</div>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                  {withdrawalsList.map((wd: any, idx: number) => (
                    <div key={idx} className="p-3 flex items-center justify-between hover:bg-gray-50/50 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">#{wd.withdrawal_id}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            wd.status === 'Completed' || wd.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : wd.status === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {wd.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {wd.payment_method} • {wd.upi_id || wd.account_number}
                        </p>
                      </div>
                      <span className="font-black text-sm text-gray-900">
                        ₹{Number(wd.amount).toFixed(2)}
                      </span>
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