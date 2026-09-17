"use client";

import { useState } from "react";
import { saveRegistration } from "../../../../app/actions/registration";

export default function AddRegistrationForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await saveRegistration(formData);
  }

  return (
    <div className="p-8 font-sans bg-[#f8f9fa] min-h-screen">
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden w-full max-w-4xl mx-auto">
        
        {/* Form Header */}
        <div className="bg-[#2c3e50] px-6 py-4 text-white">
          <h2 className="text-[16px] font-bold tracking-wide">Register Professional</h2>
        </div>

        {/* Form Content */}
        <form action={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-800">Full Name</label>
              <input 
                type="text" 
                name="name"
                required
                placeholder="e.g. Santosh Kumar"
                className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-800">Mobile Number</label>
              <input 
                type="text" 
                name="mobile"
                required
                placeholder="e.g. 9893852800"
                className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-800">Work / Company</label>
              <input 
                type="text" 
                name="work_company"
                required
                placeholder="e.g. RO Repair"
                className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-800">Location</label>
              <input 
                type="text" 
                name="location"
                required
                placeholder="e.g. Noida Sector 15"
                className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[13px] font-bold text-gray-800">Experience</label>
              <select 
                name="experience"
                required
                className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">Select Experience Level</option>
                <option value="1-3">1-3 Years</option>
                <option value="3-5">3-5 Years</option>
                <option value="5-10">5-10 Years</option>
                <option value="10+">10+ Years</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#2c3e50] hover:bg-[#1a252f] text-white font-medium px-6 py-2.5 rounded text-[13px] transition disabled:opacity-70"
            >
              {loading ? "Saving..." : "Save Registration"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
