"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CheckCircle2, AlertCircle, X, Sparkles } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  description?: string;
}

export function showAdminToast(title: string, type: "success" | "error" | "info" = "success", description?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("admin_toast", {
        detail: { title, type, description },
      })
    );
  }
}

export default function AdminToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 1. Catch URL query params like ?status=updated or ?status=saved
  useEffect(() => {
    const status = searchParams.get("status");
    const msg = searchParams.get("msg");
    const updated = searchParams.get("updated");
    const saved = searchParams.get("saved");

    let toastText = "";
    let descText = "";

    if (status === "updated" || updated === "1" || updated === "true") {
      toastText = "Updated Successfully!";
      descText = "Your changes have been saved & updated.";
    } else if (status === "saved" || saved === "1" || saved === "true") {
      toastText = "Saved Successfully!";
      descText = "New record created successfully.";
    } else if (status === "deleted") {
      toastText = "Deleted Successfully!";
      descText = "The item was removed.";
    } else if (msg) {
      toastText = msg;
    }

    if (toastText) {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, type: "success", title: toastText, description: descText }]);

      // Clean query params from URL smoothly without reloading
      const params = new URLSearchParams(searchParams.toString());
      params.delete("status");
      params.delete("msg");
      params.delete("updated");
      params.delete("saved");
      const newQuery = params.toString();
      const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams, pathname]);

  // 2. Listen to custom window "admin_toast" events
  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.title) {
        const id = Date.now().toString();
        setToasts((prev) => [
          ...prev,
          {
            id,
            type: detail.type || "success",
            title: detail.title,
            description: detail.description,
          },
        ]);
      }
    };

    window.addEventListener("admin_toast", handleToastEvent);
    return () => window.removeEventListener("admin_toast", handleToastEvent);
  }, []);

  // Auto-remove toasts after 4.5 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 4500);
    return () => clearTimeout(timer);
  }, [toasts]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto transform transition-all duration-300 ease-out translate-y-0 opacity-100 flex items-start gap-3 p-4 rounded-2xl shadow-2xl border ${
              isSuccess
                ? "bg-white border-emerald-300 text-gray-900 shadow-emerald-500/10"
                : "bg-white border-red-300 text-gray-900 shadow-red-500/10"
            }`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 ${
                isSuccess
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 animate-pulse" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-gray-900">
                  {toast.title}
                </p>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  OK
                </span>
              </div>
              {toast.description && (
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
