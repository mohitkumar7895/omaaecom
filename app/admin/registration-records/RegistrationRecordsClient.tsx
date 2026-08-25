"use client";

import { useState } from "react";
import { Eye, Trash2, Phone, MapPin, Calendar, Briefcase, Award, CheckCircle2, XCircle, Clock, Search, Filter } from "lucide-react";
import { updateRegistrationStatus, deleteRegistrationById } from "../../../app/actions/registration";

export interface RegistrationRecord {
  id: number;
  name: string;
  mobile: string;
  work_company: string;
  location: string;
  experience: string;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
}

export default function RegistrationRecordsClient({ initialRecords }: { initialRecords: RegistrationRecord[] }) {
  const [records, setRecords] = useState<RegistrationRecord[]>(initialRecords);
  const [selectedRecord, setSelectedRecord] = useState<RegistrationRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // Filter records
  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.mobile.includes(searchTerm) ||
      rec.work_company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || (rec.status || "Pending") === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: number, newStatus: "Pending" | "Approved" | "Rejected") => {
    setLoadingId(id);
    try {
      const res = await updateRegistrationStatus(id, newStatus);
      if (res.success) {
        setRecords((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
        if (selectedRecord && selectedRecord.id === id) {
          setSelectedRecord((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this registration record?")) return;
    setLoadingId(id);
    try {
      const res = await deleteRegistrationById(id);
      if (res.success) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        if (selectedRecord && selectedRecord.id === id) {
          setSelectedRecord(null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
      ", " +
      d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getStatusBadge = (status?: string) => {
    const s = status || "Pending";
    if (s === "Approved") {
      return (
        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
        </span>
      );
    }
    if (s === "Rejected") {
      return (
        <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
          <XCircle className="w-3 h-3 text-rose-600" /> Rejected
        </span>
      );
    }
    return (
      <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
        <Clock className="w-3 h-3 text-amber-600" /> Pending
      </span>
    );
  };

  return (
    <div className="p-6 md:p-8 font-sans bg-gray-50 min-h-screen text-[13px]">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Professional Registration Records</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage technician onboardings, applications, and status</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg font-bold text-gray-700 text-xs shadow-sm">
            Total: {records.length}
          </span>
          <span className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg font-bold text-amber-700 text-xs shadow-sm">
            Pending: {records.filter((r) => (r.status || "Pending") === "Pending").length}
          </span>
          <span className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-bold text-emerald-700 text-xs shadow-sm">
            Approved: {records.filter((r) => r.status === "Approved").length}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, mobile, skill, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm outline-none focus:border-blue-500 bg-white font-medium text-gray-700"
          >
            <option value="All">All Registrations</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#212529] text-white text-[12px] font-bold">
                <th className="px-4 py-3 border-r border-gray-700 w-16">ID</th>
                <th className="px-4 py-3 border-r border-gray-700">Name</th>
                <th className="px-4 py-3 border-r border-gray-700">Mobile</th>
                <th className="px-4 py-3 border-r border-gray-700">Work / Skill</th>
                <th className="px-4 py-3 border-r border-gray-700">Location</th>
                <th className="px-4 py-3 border-r border-gray-700 w-32">Experience</th>
                <th className="px-4 py-3 border-r border-gray-700 w-44">Registration Date</th>
                <th className="px-4 py-3 border-r border-gray-700 w-32 text-center">Status</th>
                <th className="px-4 py-3 text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-[12px] text-gray-700">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition align-middle">
                    <td className="px-4 py-3 border-r border-gray-100 font-bold text-gray-500">#{row.id}</td>
                    <td className="px-4 py-3 border-r border-gray-100 font-extrabold text-gray-900">{row.name}</td>
                    <td className="px-4 py-3 border-r border-gray-100 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span>{row.mobile}</span>
                        <a
                          href={`https://wa.me/91${row.mobile}?text=${encodeURIComponent(`Hello ${row.name}, this is OMAA Company regarding your technician registration.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-500 hover:text-emerald-600 font-bold"
                          title="Chat on WhatsApp"
                        >
                          💬
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-100">{row.work_company}</td>
                    <td className="px-4 py-3 border-r border-gray-100">{row.location}</td>
                    <td className="px-4 py-3 border-r border-gray-100">
                      <span className="bg-indigo-50 text-[#6b62d9] border border-indigo-100 text-[11px] font-bold px-2 py-0.5 rounded-full inline-block">
                        {row.experience}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-100 text-gray-500 whitespace-nowrap">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-100 text-center">
                      <div className="flex justify-center">
                        <select
                          value={row.status || "Pending"}
                          disabled={loadingId === row.id}
                          onChange={(e) => handleStatusChange(row.id, e.target.value as any)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full outline-none border cursor-pointer ${
                            (row.status || "Pending") === "Approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : (row.status || "Pending") === "Rejected"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => setSelectedRecord(row)}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-1.5 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          disabled={loadingId === row.id}
                          className="bg-red-50 text-red-600 hover:bg-red-100 p-1.5 rounded-lg transition"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-gray-500 text-sm">
                    No professional registration records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#2c3e50] to-[#34495e] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Technician Profile Details</h3>
                <p className="text-xs text-gray-300">Applicant ID #{selectedRecord.id}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-300 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Status</span>
                {getStatusBadge(selectedRecord.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold text-gray-400 block mb-0.5">Full Name</span>
                  <p className="text-gray-900 font-extrabold text-sm">{selectedRecord.name}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 block mb-0.5">Mobile Number</span>
                  <p className="text-gray-900 font-bold text-sm">{selectedRecord.mobile}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 block mb-0.5">Skill / Work Name</span>
                  <p className="text-gray-900 font-bold text-sm">{selectedRecord.work_company}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 block mb-0.5">Experience</span>
                  <p className="text-[#6b62d9] font-bold text-sm">{selectedRecord.experience}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-bold text-gray-400 block mb-0.5">Work Location</span>
                  <p className="text-gray-800 font-medium text-sm leading-relaxed">{selectedRecord.location}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-bold text-gray-400 block mb-0.5">Registration Submitted</span>
                  <p className="text-gray-600 text-xs">{formatDate(selectedRecord.created_at)}</p>
                </div>
              </div>

              {/* Status Action Buttons in Modal */}
              <div className="pt-3 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-500 block mb-2">Update Application Status:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedRecord.id, "Approved")}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedRecord.id, "Rejected")}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-xl text-xs transition"
                  >
                    ✕ Reject
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedRecord.id, "Pending")}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-xl text-xs transition"
                  >
                    ⏳ Pending
                  </button>
                </div>
              </div>

              {/* Direct Communication Buttons */}
              <div className="flex gap-2 pt-2">
                <a
                  href={`tel:+91${selectedRecord.mobile}`}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Technician
                </a>
                <a
                  href={`https://wa.me/91${selectedRecord.mobile}?text=${encodeURIComponent(`Hello ${selectedRecord.name}, this is OMAA Company regarding your technician registration.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 px-4 py-1.5 rounded-lg text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
