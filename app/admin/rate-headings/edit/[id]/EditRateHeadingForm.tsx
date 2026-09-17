"use client";

import { updateRateHeading } from "@/app/actions/rateHeadings";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditRateHeadingForm({ heading }: { heading: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await updateRateHeading(formData);
    } catch (error) {
      console.error("Error saving:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-8 font-sans">
      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden max-w-2xl mb-10">
        
        {/* Header */}
        <div className="bg-[#2c3e50] px-6 py-4">
          <h2 className="text-white text-[17px] font-semibold tracking-wide">
            Edit Rate Heading
          </h2>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8">
          <input type="hidden" name="id" value={heading.id} />
          <div className="space-y-6">
            
            {/* Heading Name */}
            <div>
              <label className="block text-[#2c3e50] text-[15px] font-bold mb-2">
                Heading Name
              </label>
              <input 
                type="text" 
                name="title"
                required
                defaultValue={heading.title}
                className="w-full border border-gray-200 rounded text-[15px] px-4 py-2.5 outline-none focus:border-blue-500 shadow-sm"
              />
            </div>

          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#2c3e50] hover:bg-[#1a252f] text-white px-6 py-2.5 rounded text-[15px] font-medium transition shadow-sm disabled:opacity-70"
            >
              {isSubmitting ? "Updating..." : "Update Rate Heading"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
