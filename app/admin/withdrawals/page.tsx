"use client";

import { useEffect, useState } from "react";
import { 
  IndianRupee, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Smartphone, 
  Building2, 
  Search, 
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/withdrawals");
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data.withdrawals || []);
      }
    } catch (e) {
      console.error("Failed to load withdrawals", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: string, notes?: string) => {
    if (!confirm(`Are you sure you want to mark this withdrawal as ${newStatus}?`)) return;

    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus, admin_notes: notes }),
      });
      if (res.ok) {
        await fetchWithdrawals();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update status");
      }
    } catch (e) {
      alert("Error updating status");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = withdrawals.filter(w => {
    const matchesSearch = 
      (w.withdrawal_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (w.user_email || "").toLowerCase().includes(search.toLowerCase()) ||
      (w.user_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (w.upi_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (w.account_number || "").toLowerCase().includes(search.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && (w.status || "").toLowerCase() === filterStatus.toLowerCase();
  });

  const totalAmount = withdrawals.reduce((sum, w) => sum + Number(w.amount || 0), 0);
  const pendingAmount = withdrawals.filter(w => w.status === 'Pending').reduce((sum, w) => sum + Number(w.amount || 0), 0);
  const completedAmount = withdrawals.filter(w => w.status === 'Completed' || w.status === 'Approved').reduce((sum, w) => sum + Number(w.amount || 0), 0);

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <IndianRupee className="w-7 h-7 text-emerald-600" />
            Referral Withdrawals Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Review and process user cash payout requests (UPI / Bank Transfers)</p>
        </div>
        <button
          onClick={fetchWithdrawals}
          className="self-start sm:self-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition shadow-2xs flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Payouts</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">₹{pendingAmount.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{withdrawals.filter(w => w.status === 'Pending').length} requests awaiting transfer</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed Payouts</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">₹{completedAmount.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{withdrawals.filter(w => w.status === 'Completed' || w.status === 'Approved').length} requests paid</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Requested</p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">₹{totalAmount.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{withdrawals.length} total lifetime requests</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, email, name, UPI, account..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center overflow-x-auto w-full sm:w-auto">
          {["all", "pending", "completed", "rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold capitalize transition cursor-pointer ${
                filterStatus === st
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading withdrawal requests...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No withdrawal requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Withdrawal ID</th>
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payout Method & Details</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date Requested</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {filtered.map((w: any) => (
                  <tr key={w.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      #{w.withdrawal_id}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{w.user_name || "Valued Customer"}</p>
                      <p className="text-[11px] text-gray-500 font-mono">{w.user_email}</p>
                      {w.user_phone && <p className="text-[11px] text-gray-400">{w.user_phone}</p>}
                    </td>

                    <td className="py-3.5 px-4 font-black text-sm text-gray-900">
                      ₹{Number(w.amount).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      {w.payment_method === "UPI" ? (
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-md">
                            <Smartphone className="w-3.5 h-3.5" />
                          </span>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">UPI ID</span>
                            <p className="font-mono font-bold text-gray-900 select-all">{w.upi_id}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md mt-0.5">
                            <Building2 className="w-3.5 h-3.5" />
                          </span>
                          <div>
                            <p className="font-bold text-gray-900">{w.account_holder_name}</p>
                            <p className="font-mono text-xs text-gray-700">A/C: <span className="select-all font-bold">{w.account_number}</span></p>
                            <p className="text-[11px] text-gray-500 font-mono">IFSC: <span className="select-all font-bold uppercase">{w.ifsc_code}</span> ({w.bank_name})</p>
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold inline-flex items-center gap-1 ${
                        w.status === "Completed" || w.status === "Approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : w.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {w.status === "Completed" && <CheckCircle2 className="w-3 h-3" />}
                        {w.status === "Rejected" && <XCircle className="w-3 h-3" />}
                        {w.status === "Pending" && <Clock className="w-3 h-3" />}
                        {w.status}
                      </span>
                      {w.admin_notes && (
                        <p className="text-[10px] text-gray-400 mt-1 max-w-xs">{w.admin_notes}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                      {new Date(w.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {w.status === "Pending" && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(w.id, "Completed", "Transferred via " + w.payment_method)}
                            disabled={actionLoading === w.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-2xs transition cursor-pointer"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt("Enter reason for rejection (amount will be refunded to user):");
                              if (reason) handleUpdateStatus(w.id, "Rejected", reason);
                            }}
                            disabled={actionLoading === w.id}
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {(w.status === "Completed" || w.status === "Approved") && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                          Paid
                        </span>
                      )}
                      {w.status === "Rejected" && (
                        <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                          Refunded
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
