"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import { submitProfessionalRegistration } from "../actions/registration";
import { Briefcase, User, Phone, MapPin, Award, CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ProfessionalRegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    work_company: "",
    location: "",
    experience: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.mobile.trim()) {
      errs.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
      errs.mobile = "Please enter a valid 10-digit mobile number";
    }
    if (!formData.work_company.trim()) errs.work_company = "Work Name is required";
    if (!formData.location.trim()) errs.location = "Work Location is required";
    if (!formData.experience.trim()) errs.experience = "Please select your experience";

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: digits }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await submitProfessionalRegistration(formData);
      if (res.success) {
        setSuccess(true);
        setFormData({
          name: "",
          mobile: "",
          work_company: "",
          location: "",
          experience: "",
        });
      } else {
        setError(res.error || "Submission failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans text-gray-900 selection:bg-[#6b62d9] selection:text-white">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#2c3e50] via-[#3d4b94] to-[#6b62d9] text-white py-12 md:py-16 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-indigo-200 mb-4 border border-white/10">
            <Award className="w-4 h-4 text-amber-300" />
            <span>Join OMAA Company Verified Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
            Professional Registration
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Partner with OMAA Company as a skilled technician and grow your business with consistent bookings and daily payouts.
          </p>
        </div>
      </div>

      {/* Main Form Section */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12 -mt-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10 relative overflow-hidden">
          
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {success ? (
            <div className="py-8 text-center space-y-5 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
                  Registration Received!
                </h2>
                <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                  Thank you for applying. Our verification team will review your profile and contact you within 24-48 hours.
                </p>
              </div>
              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => setSuccess(false)}
                  className="bg-[#6b62d9] hover:bg-[#584ec6] text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-sm"
                >
                  Submit Another Profile
                </button>
                <Link
                  href="/"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3 rounded-xl text-sm transition"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">Partner Details</h2>
                <p className="text-xs text-gray-500">Please provide accurate information for verification</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center space-x-3 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition ${
                    fieldErrors.name
                      ? "border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-[#6b62d9] focus:ring-2 focus:ring-[#6b62d9]/10"
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-red-500 text-xs font-semibold">{fieldErrors.name}</p>
                )}
              </div>

              {/* Mobile */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>Mobile Number *</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold text-sm">
                    +91
                  </div>
                  <input
                    type="tel"
                    name="mobile"
                    maxLength={10}
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className={`w-full border rounded-xl pl-14 pr-4 py-3 text-sm outline-none transition ${
                      fieldErrors.mobile
                        ? "border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-gray-200 focus:border-[#6b62d9] focus:ring-2 focus:ring-[#6b62d9]/10"
                    }`}
                  />
                </div>
                {fieldErrors.mobile && (
                  <p className="text-red-500 text-xs font-semibold">{fieldErrors.mobile}</p>
                )}
              </div>

              {/* Work Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                  <span>Work Name / Skill Specialization *</span>
                </label>
                <input
                  type="text"
                  name="work_company"
                  value={formData.work_company}
                  onChange={handleChange}
                  placeholder="e.g. AC Technician, RO Expert, Refrigerator Mechanic"
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition ${
                    fieldErrors.work_company
                      ? "border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-[#6b62d9] focus:ring-2 focus:ring-[#6b62d9]/10"
                  }`}
                />
                {fieldErrors.work_company && (
                  <p className="text-red-500 text-xs font-semibold">{fieldErrors.work_company}</p>
                )}
              </div>

              {/* Work Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>Work Location / Area *</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Sector 62 Noida, Delhi NCR, Agra"
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition ${
                    fieldErrors.location
                      ? "border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-[#6b62d9] focus:ring-2 focus:ring-[#6b62d9]/10"
                  }`}
                />
                {fieldErrors.location && (
                  <p className="text-red-500 text-xs font-semibold">{fieldErrors.location}</p>
                )}
              </div>

              {/* Experience Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-gray-400" />
                  <span>Experience *</span>
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none bg-white transition ${
                    fieldErrors.experience
                      ? "border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-[#6b62d9] focus:ring-2 focus:ring-[#6b62d9]/10"
                  }`}
                >
                  <option value="">Select Experience Level</option>
                  <option value="Less than 1 Year">Less than 1 Year</option>
                  <option value="1 - 3 Years">1 - 3 Years</option>
                  <option value="3 - 5 Years">3 - 5 Years</option>
                  <option value="5 - 10 Years">5 - 10 Years</option>
                  <option value="10+ Years">10+ Years</option>
                </select>
                {fieldErrors.experience && (
                  <p className="text-red-500 text-xs font-semibold">{fieldErrors.experience}</p>
                )}
              </div>

              {/* Security Note */}
              <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <ShieldCheck className="w-4 h-4 text-[#328e3b] flex-shrink-0" />
                <span>Your information is encrypted & used exclusively for verified onboarding.</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6b62d9] hover:bg-[#5b52c9] active:scale-[0.99] disabled:opacity-50 text-white font-extrabold py-4 rounded-xl text-base shadow-lg shadow-[#6b62d9]/25 flex items-center justify-center space-x-2 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Registration</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

            </form>
          )}

        </div>
      </main>
    </div>
  );
}
