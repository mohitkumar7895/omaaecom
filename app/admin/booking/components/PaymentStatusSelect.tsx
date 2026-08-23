"use client";

import { useState, useTransition } from "react";

export default function PaymentStatusSelect({ id, defaultValue, action }: { id: string | number, defaultValue: string, action: any }) {
  const [value, setValue] = useState(defaultValue || 'Pending');
  const [isPending, startTransition] = useTransition();

  const colorClass = 
    value.toLowerCase() === 'completed' || value.toLowerCase() === 'success' || value.toLowerCase() === 'paid' 
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
      : 'bg-amber-100 text-amber-800 border-amber-300';

  return (
    <div className="inline-block mt-1">
      <select 
        name="payment_status"
        value={value}
        onChange={(e) => {
          const newValue = e.target.value;
          setValue(newValue);
          startTransition(() => {
            const formData = new FormData();
            formData.append("id", String(id));
            formData.append("payment_status", newValue);
            action(formData);
          });
        }}
        className={`border rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer transition ${colorClass} ${isPending ? 'opacity-50' : ''}`}
      >
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
      </select>
    </div>
  );
}
