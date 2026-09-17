"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import { Headset, Send } from "lucide-react";
import { submitComplaint } from "../actions/complaints";

export default function LodgeComplaintPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setErrorMsg("");
    setSuccess(false);

    const result = await submitComplaint(formData);

    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setSuccess(true);
      // Reset form handled by HTML native form reset via ref, or we just leave it for now.
    }
    
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] font-sans flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden border border-gray-100">
          
          {/* Header */}
          <div className="bg-[#663ab6] p-6 text-white flex items-center space-x-3">
            <Headset className="w-8 h-8 stroke-[1.5]" />
            <div>
              <h2 className="text-xl font-bold tracking-tight">Lodge a Complaint</h2>
              <p className="text-purple-100 text-sm mt-0.5">We will get back to you within 24 hours.</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            {success ? (
              <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-8 rounded-xl text-center space-y-3">
                <div className="text-4xl">✅</div>
                <h3 className="font-bold text-lg">Complaint Submitted</h3>
                <p className="text-sm">Your complaint has been successfully recorded. We will contact you soon.</p>
                <button onClick={() => setSuccess(false)} className="mt-4 px-4 py-2 bg-green-600 text-white rounded font-medium text-sm hover:bg-green-700 transition">
                  Submit Another
                </button>
              </div>
            ) : (
              <form action={handleSubmit} className="space-y-6">
                
                {errorMsg && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Full Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Mobile Number <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      name="phone"
                      required
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Order ID (optional)</label>
                  <input 
                    type="text" 
                    name="orderId"
                    placeholder="e.g. 123456"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Subject <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="subject"
                    required
                    placeholder="e.g. Service not completed"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Complaint Details <span className="text-red-500">*</span></label>
                  <textarea 
                    name="message"
                    required
                    rows={4}
                    placeholder="Describe your complaint in detail..."
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#663ab6] hover:bg-[#522c95] text-white font-medium py-3 rounded-lg flex items-center justify-center space-x-2 transition disabled:opacity-70"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? "Submitting..." : "Submit Complaint"}</span>
                </button>

              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
