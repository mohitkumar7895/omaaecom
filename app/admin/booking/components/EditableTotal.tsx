"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

export default function EditableTotal({ id, defaultValue, action }: { id: string | number, defaultValue: number | string, action: any }) {
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", String(id));
      formData.append("total", String(value));
      await action(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSave} className="flex items-center space-x-2">
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
        <input 
          type="number" 
          name="total" 
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-24 pl-6 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
        />
      </div>
      <button 
        type="submit" 
        disabled={isPending}
        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
          saved 
            ? "bg-emerald-500 text-white" 
            : "text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 active:scale-95"
        }`}
      >
        {saved ? <Check className="w-3.5 h-3.5" /> : isPending ? "..." : "Save"}
      </button>
    </form>
  );
}
