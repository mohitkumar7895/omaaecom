"use client";

import { useState, useTransition } from "react";

export default function WorkingStatusSelect({ id, defaultValue, action }: { id: string | number, defaultValue: string, action: any }) {
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();

  const colorClass = 
    value === 'Completed' ? 'bg-green-100 text-green-700 border-green-300' :
    value === 'Reject'   ? 'bg-red-100 text-red-700 border-red-300' :
    'bg-yellow-100 text-yellow-800 border-yellow-300';

  return (
    <div>
      <select 
        name="working_status"
        value={value}
        onChange={(e) => {
          const newValue = e.target.value;
          setValue(newValue);
          startTransition(() => {
            const formData = new FormData();
            formData.append("id", String(id));
            formData.append("working_status", newValue);
            action(formData);
          });
        }}
        className={`border rounded px-2 py-1 text-[11px] font-bold outline-none min-w-[90px] cursor-pointer transition ${colorClass} ${isPending ? 'opacity-50' : ''}`}
      >
        <option value="Pendi">Pending</option>
        <option value="Completed">Completed</option>
        <option value="Reject">Reject</option>
      </select>
    </div>
  );
}
