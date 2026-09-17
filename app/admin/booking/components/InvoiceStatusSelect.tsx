"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, CheckCircle2, Clock } from "lucide-react";

export default function InvoiceStatusSelect({
  id,
  orderId,
  defaultValue,
  action,
}: {
  id: string | number;
  orderId?: string;
  defaultValue?: string;
  action: any;
}) {
  const [value, setValue] = useState(defaultValue || "Pending");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isCompleted =
    value.toLowerCase() === "completed" ||
    value.toLowerCase() === "complete" ||
    value.toLowerCase() === "generated";

  const colorClass = isCompleted
    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
    : "bg-amber-100 text-amber-800 border-amber-300";

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <select
        name="invoice_status"
        value={value}
        onChange={(e) => {
          const newValue = e.target.value;
          setValue(newValue);
          startTransition(async () => {
            const formData = new FormData();
            formData.append("id", String(id));
            formData.append("invoice_status", newValue);
            await action(formData);
            router.refresh();
          });
        }}
        className={`border rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wider outline-none cursor-pointer transition shadow-xs ${colorClass} ${
          isPending ? "opacity-50" : ""
        }`}
      >
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
      </select>

      {/* When completed, show instant link to open invoice */}
      {isCompleted && orderId && (
        <Link
          href={`/invoice/${orderId}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200 shadow-xs transition-all mt-0.5"
          title="View / Download Invoice"
        >
          <FileText className="w-3 h-3 text-indigo-600" />
          <span>Invoice</span>
        </Link>
      )}
    </div>
  );
}
