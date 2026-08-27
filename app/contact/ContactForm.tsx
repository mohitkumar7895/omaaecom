"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { submitContactForm } from "../actions/contacts";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const result = await submitContactForm(formData);

    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    }

    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-gray-900 text-[22px] font-bold mb-2">Tell us about your requirement</h2>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">
        Whether you have questions, need a service quote, or would just like to say hello, send us a message below.
      </p>

      {success && (
        <div className="mb-6 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3.5 text-emerald-800 text-sm font-medium animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-base">Message Sent Successfully!</p>
            <p className="mt-1 text-emerald-700">Thank you for reaching out. Our support team will get back to you shortly.</p>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="mt-3 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition"
            >
              Send Another Message
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm font-medium animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Submission Failed</p>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input 
              type="text" 
              name="name"
              required
              placeholder="e.g. John Doe" 
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-gray-900 placeholder:text-gray-400 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input 
              type="tel" 
              name="phone"
              required
              placeholder="e.g. 9876543210" 
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-gray-900 placeholder:text-gray-400 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <input 
              type="email" 
              name="email"
              placeholder="e.g. you@example.com" 
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-gray-900 placeholder:text-gray-400 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Subject / Service <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <input 
              type="text" 
              name="subject"
              placeholder="e.g. AC Repair Inquiry" 
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-gray-900 placeholder:text-gray-400 font-medium"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Your Message <span className="text-rose-500">*</span>
          </label>
          <textarea 
            name="message"
            required
            placeholder="Write your message or inquiry details here..." 
            rows={4}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none text-gray-900 placeholder:text-gray-400 font-medium"
          ></textarea>
        </div>

        <div className="pt-2">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Message...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
