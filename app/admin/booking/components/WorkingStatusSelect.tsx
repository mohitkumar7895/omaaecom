"use client";

import { useState } from "react";

export default function WorkingStatusSelect({ id, defaultValue, action }: { id: string | number, defaultValue: string, action: any }) {
  const [value, setValue] = useState(defaultValue);

  const colorClass = 
    value === 'Complete' ? 'bg-green-100 text-green-700 border-green-300' :
    value === 'Reject'   ? 'bg-red-100 text-red-700 border-red-300' :
    'bg-yellow-100 text-yellow-800 border-yellow-300';

  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <select 
        name="working_status"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          e.target.form?.requestSubmit();
        }}
        className={`border rounded px-2 py-1 text-[11px] font-bold outline-none min-w-[90px] cursor-pointer transition ${colorClass}`}
      >
        <option value="Pendi">Pending</option>
        <option value="Complete">Complete</option>
        <option value="Reject">Reject</option>
      </select>
    </form>
  );
}
