"use client";

import { useTransition } from "react";
import { updateContactStatus } from "@/app/actions/contacts";

export default function StatusSelect({ id, currentStatus }: { id: number | string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", String(id));
      formData.append("status", newStatus);
      await updateContactStatus(formData);
    });
  };

  return (
    <select
      value={currentStatus || "New"}
      disabled={isPending}
      onChange={handleChange}
      className={`text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none border cursor-pointer transition disabled:opacity-50 ${
        currentStatus === "Contacted"
          ? "bg-amber-50 text-amber-700 border-amber-200 focus:ring-1 focus:ring-amber-400"
          : currentStatus === "Closed" || currentStatus === "Resolved"
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-1 focus:ring-emerald-400"
          : "bg-indigo-50 text-indigo-700 border-indigo-200 focus:ring-1 focus:ring-indigo-400"
      }`}
    >
      <option value="New">New</option>
      <option value="Contacted">Contacted</option>
      <option value="Closed">Closed</option>
    </select>
  );
}
