"use client";

import { useState } from "react";
import { saveKyc } from "../../../actions/kyc";

export default function AddKycForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await saveKyc(formData);
  }

  return (
    <div className="p-8 font-sans bg-[#f8f9fa] min-h-screen">
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden w-full">
        
        {/* Form Header */}
        <div className="bg-[#2c3e50] px-6 py-4 text-white">
          <h2 className="text-[16px] font-bold tracking-wide">Add KYC</h2>
        </div>

        {/* Form Content */}
        <form action={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-800">Select User</label>
                <select 
                  name="user_name"
                  className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">Select User</option>
                  <option value="Santosh Kumar">Santosh Kumar</option>
                  <option value="Tapan Rawat">Tapan Rawat</option>
                  <option value="Mohit">Mohit</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-800">Aadhar Card</label>
                <input 
                  type="text" 
                  name="aadhar_card"
                  placeholder="1234 5678 9012"
                  className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-800">Bank Branch</label>
                <input 
                  type="text" 
                  name="branch"
                  placeholder="Connaught Place"
                  className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-800">IFSC Code</label>
                <input 
                  type="text" 
                  name="ifsc_code"
                  placeholder="SBIN0000123"
                  className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-800">PAN Card</label>
                <input 
                  type="text" 
                  name="pan_card"
                  placeholder="ABCDE1234F"
                  className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-800">Bank Name</label>
                <input 
                  type="text" 
                  name="bank_name"
                  placeholder="State Bank of India"
                  className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-800">Account Number</label>
                <input 
                  type="text" 
                  name="account_number"
                  placeholder="XXXXXXXXXX"
                  className="w-full border border-gray-200 rounded text-sm px-4 py-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-800">Cancelled Cheque</label>
                <div className="flex">
                  <input 
                    type="file" 
                    name="cheque" 
                    accept="image/*,.pdf"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2.5 file:px-4
                      file:border-0 file:border-r file:border-gray-200
                      file:text-sm file:font-medium
                      file:bg-gray-50 file:text-gray-700
                      hover:file:bg-gray-100
                      border border-gray-200 rounded bg-white transition"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#2c3e50] hover:bg-[#1a252f] text-white font-medium px-6 py-2.5 rounded text-[13px] transition disabled:opacity-70"
            >
              {loading ? "Saving..." : "Save KYC Details"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
