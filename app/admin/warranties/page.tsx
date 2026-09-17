import pool from "../../../lib/db";
import { Shield, ShieldCheck, ShieldAlert, Briefcase, Grid, FileSpreadsheet, Search, XCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function WarrantiesPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  // Await searchParams in Next.js 15+
  const resolvedSearchParams = await searchParams;
  const filter = resolvedSearchParams.filter || "All";
  
  let warranties: any[] = [];
  let stats = { total: 0, active: 0, expired: 0 };

  try {
    const [allWarranties]: any = await pool.query(`
      SELECT w.*, b.category as booking_category, b.type as booking_type, b.service_opted as cashback_opted
      FROM warranties w
      LEFT JOIN bookings b ON w.order_id = b.order_id
      ORDER BY w.issued_date DESC
    `);
    
    const processedWarranties = allWarranties.map((w: any) => {
      if (w.cashback_opted == 1) {
        return { ...w, status: 'EXPIRED', cashback_expired: true };
      }
      return w;
    });

    stats.total = processedWarranties.length;
    stats.active = processedWarranties.filter((w: any) => w.status === 'ACTIVE').length;
    stats.expired = processedWarranties.filter((w: any) => w.status === 'EXPIRED').length;

    warranties = processedWarranties;
    if (filter === "Active") warranties = processedWarranties.filter((w: any) => w.status === 'ACTIVE');
    if (filter === "Expired") warranties = processedWarranties.filter((w: any) => w.status === 'EXPIRED');

  } catch (error) {
    console.error("Database connection failed:", error);
  }

  return (
    <div className="p-8 font-sans bg-[#f8f9fa] min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-green-600 stroke-[1.5]" />
          <h1 className="text-[26px] font-bold text-gray-800 tracking-tight">Warranty Management</h1>
        </div>
        <button className="bg-[#1b6b50] hover:bg-[#15533e] text-white font-medium px-4 py-2 rounded shadow-sm text-sm transition">
          System Overview
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Total Records */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
          <div className="bg-blue-50 w-14 h-14 rounded-full flex items-center justify-center text-blue-500">
            <Briefcase className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Records</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
          </div>
        </div>

        {/* Active Warranties */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
          <div className="bg-green-50 w-14 h-14 rounded-full flex items-center justify-center text-green-500">
            <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Active Warranties</p>
            <h3 className="text-2xl font-bold text-green-600">{stats.active}</h3>
          </div>
        </div>

        {/* Expired / Inactive */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
          <div className="bg-red-50 w-14 h-14 rounded-full flex items-center justify-center text-red-500">
            <ShieldAlert className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Expired / Inactive</p>
            <h3 className="text-2xl font-bold text-red-600">{stats.expired}</h3>
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <span className="text-gray-600 font-medium text-sm">Filter:</span>
        <Link href="?filter=All">
          <button className={`px-4 py-1.5 rounded text-sm font-medium transition ${
              filter === "All" ? "bg-gray-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            All
          </button>
        </Link>
        <Link href="?filter=Active">
          <button className={`px-4 py-1.5 rounded text-sm font-medium transition border ${
              filter === "Active" ? "border-green-500 text-green-600 bg-green-50" : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            Active
          </button>
        </Link>
        <Link href="?filter=Expired">
          <button className={`px-4 py-1.5 rounded text-sm font-medium transition border ${
              filter === "Expired" ? "border-red-400 text-red-500 bg-red-50" : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            Expired
          </button>
        </Link>
      </div>

      {/* Data Table Container */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-end">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Grid className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-gray-800">Warranty Records</h2>
            </div>
            <button className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </button>
          </div>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search warranties..." 
              className="border border-gray-200 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-64 text-gray-700"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#34495e] text-white text-[11px] font-bold tracking-wider uppercase">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Service</th>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Issued</th>
                <th className="px-6 py-3">Expiry</th>
                <th className="px-6 py-3">Days</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-[13px] bg-white">
              {warranties.length > 0 ? (
                warranties.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-800 font-medium">#{row.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{row.customer_name}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{row.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-800 text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">
                        {row.booking_category || row.booking_type || "Appliance Service"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-800 text-white text-[10px] font-bold px-2.5 py-1 rounded font-mono">
                        #{row.order_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      {new Date(row.issued_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium text-center">
                      {row.expiry_date 
                        ? new Date(row.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : new Date(new Date(row.issued_date).getTime() + (Number(row.days_valid) || 90) * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      }
                    </td>
                    <td className="px-6 py-4">
                      <span className="border border-gray-200 text-gray-800 text-[10px] font-bold px-2 py-1 rounded bg-gray-50/50 whitespace-nowrap">
                        {row.days_valid} days
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {row.status === 'EXPIRED' ? (
                        row.cashback_expired ? (
                          <div className="inline-flex items-center space-x-1 bg-gray-50 text-gray-500 text-[10px] font-bold px-2.5 py-1 rounded-full border border-gray-200" title="Inactive because user claimed cashback">
                            <XCircle className="w-3 h-3" />
                            <span>INACTIVE (CASHBACK)</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center space-x-1 bg-red-50 text-red-500 text-[10px] font-bold px-2.5 py-1 rounded-full border border-red-100">
                            <XCircle className="w-3 h-3" />
                            <span>EXPIRED</span>
                          </div>
                        )
                      ) : (
                        <div className="inline-flex items-center space-x-1 bg-green-50 text-green-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-green-100">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ACTIVE</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No warranties found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
