"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/register";

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
      <Sidebar />
      <div className="flex-1 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
