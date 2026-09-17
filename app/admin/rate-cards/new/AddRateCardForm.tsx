"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { addRateCards } from "../../../actions/rateCards";

export default function AddRateCardForm({ categories, rateHeadings }: { categories: any[], rateHeadings: any[] }) {
  const [parts, setParts] = useState([{ name: "", price: "" }]);
  
  const handleAddPart = () => {
    setParts([...parts, { name: "", price: "" }]);
  };

  const handlePartChange = (index: number, field: string, value: string) => {
    const newParts = [...parts];
    (newParts[index] as any)[field] = value;
    setParts(newParts);
  };

  return (
    <form action={addRateCards} className="p-6 text-sm text-gray-800">
      
      {/* Category */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1.5 text-[13px]">Category</label>
        <select 
          name="category_id"
          required
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Labour Charges */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1.5 text-[13px]">Labour Charges</label>
        <input 
          type="text"
          name="labour_charges"
          placeholder="Labour Charges"
          required
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Heading */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1.5 text-[13px]">Heading</label>
        <select 
          name="heading_id"
          required
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 bg-white"
        >
          <option value="">Select</option>
          {rateHeadings.map((h) => (
            <option key={h.id} value={h.id}>{h.title}</option>
          ))}
        </select>
      </div>

      {/* Part Name & Price */}
      <div className="mb-4">
        <div className="flex items-center space-x-4 mb-1.5">
          <label className="block text-gray-700 font-medium text-[13px] flex-1">Part Name</label>
          <label className="block text-gray-700 font-medium text-[13px] flex-1">Price (₹)</label>
          <div className="w-10"></div> {/* Spacer for button */}
        </div>
        
        {parts.map((part, index) => (
          <div key={index} className="flex items-center space-x-4 mb-3">
            <input 
              type="text"
              placeholder="Enter Part Name"
              value={part.name}
              onChange={(e) => handlePartChange(index, "name", e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              required={index === 0}
            />
            <input 
              type="number"
              placeholder="Enter price"
              value={part.price}
              onChange={(e) => handlePartChange(index, "price", e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              required={index === 0}
            />
            <button 
              type="button"
              onClick={handleAddPart}
              className="w-8 h-8 flex items-center justify-center bg-[#28a745] hover:bg-[#218838] text-white rounded transition"
              title="Add part"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Hidden input to pass parts data to server action */}
      <input type="hidden" name="parts" value={JSON.stringify(parts)} />

      {/* Labour Note */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-1.5 text-[13px]">Labour Note (Optional)</label>
        <textarea 
          name="labour_note"
          placeholder="Enter additional labour note"
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
        ></textarea>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button 
          type="submit"
          className="bg-[#2c3e50] hover:bg-[#1a252f] text-white px-5 py-2.5 rounded shadow-sm text-[13px] font-medium transition flex items-center space-x-2"
        >
          <span>Save Rate</span>
        </button>
      </div>
      
    </form>
  );
}
