"use client";

import { useState, useEffect } from "react";
import { 
  KeyRound, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Lock,
  Mail,
  Send
} from "lucide-react";

export default function AdminPasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cooldown countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async () => {
    setErrorMessage(null);
    setOtpSentMessage(null);
    setIsSendingOtp(true);

    try {
      const res = await fetch("/api/admin/send-password-otp", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to send OTP. Please try again.");
      } else {
        setOtpSentMessage(data.message || "A 6-digit OTP has been sent to your admin email address.");
        setCooldown(60); // 60 seconds cooldown
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Could not send OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    // Client-side validation checks
    if (!currentPassword.trim()) {
      setErrorMessage("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }
    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMessage("Please enter the 6-digit OTP sent to your email.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
          otp: otp.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to update password. Please try again.");
      } else {
        setSuccessMessage(data.message || "Admin password has been updated successfully with OTP verification!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setOtp("");
        setOtpSentMessage(null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Admin Security & Password</h2>
            <p className="text-sm text-gray-500 mt-1">
              Securely update your admin password with 2-Factor Email OTP verification
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 text-sm font-medium animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Success!</p>
              <p className="mt-0.5">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm font-medium animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Action Failed</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* OTP Sent Alert */}
        {otpSentMessage && (
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-3 text-indigo-900 text-sm font-medium animate-in fade-in duration-200">
            <Mail className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">OTP Dispatched</p>
              <p className="mt-0.5 text-xs text-indigo-700">{otpSentMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                title={showCurrent ? "Hide password" : "Show password"}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* New Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  title={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5 font-medium">Must be at least 6 characters</p>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  title={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-rose-500 mt-1.5 font-medium">Passwords do not match</p>
              )}
            </div>
          </div>

          {/* Email OTP Verification Section */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-sm font-bold text-gray-800">
                  Email Security OTP <span className="text-rose-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  Request a 6-digit OTP sent to your registered admin email address
                </p>
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp || cooldown > 0}
                className="inline-flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-4 py-2 rounded-xl text-xs border border-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : cooldown > 0 ? (
                  <span>Resend in {cooldown}s</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Get OTP on Email</span>
                  </>
                )}
              </button>
            </div>

            <div className="max-w-xs">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-Digit OTP (e.g. 123456)"
                maxLength={6}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono font-bold tracking-widest text-base text-gray-900 bg-white"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading || (confirmPassword.length > 0 && newPassword !== confirmPassword) || otp.length !== 6}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying & Updating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify OTP & Change Password</span>
                </>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 font-medium">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span>2FA Protected with Bcrypt</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
