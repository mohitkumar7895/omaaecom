"use client";

import { useState } from "react";
import { PolicyData, PolicySection, updatePolicy } from "../../../app/actions/policies";
import { Plus, Trash2, Save, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PolicyEditor({ initialPolicy }: { initialPolicy: PolicyData }) {
  const [policy, setPolicy] = useState<PolicyData>(initialPolicy);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Section handling
  const handleAddSection = () => {
    const nextNum = (policy.sections?.length || 0) + 1;
    const newSection: PolicySection = {
      heading: `${nextNum}. New Section`,
      content: "",
      bullets: [""],
    };
    setPolicy((prev) => ({
      ...prev,
      sections: [...(prev.sections || []), newSection],
    }));
  };

  const handleRemoveSection = (index: number) => {
    setPolicy((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, idx) => idx !== index),
    }));
  };

  const handleSectionHeadingChange = (index: number, val: string) => {
    setPolicy((prev) => {
      const next = [...prev.sections];
      next[index].heading = val;
      return { ...prev, sections: next };
    });
  };

  const handleSectionContentChange = (index: number, val: string) => {
    setPolicy((prev) => {
      const next = [...prev.sections];
      next[index].content = val;
      return { ...prev, sections: next };
    });
  };

  // Bullets handling
  const handleAddBullet = (secIndex: number) => {
    setPolicy((prev) => {
      const next = [...prev.sections];
      next[secIndex].bullets = [...(next[secIndex].bullets || []), ""];
      return { ...prev, sections: next };
    });
  };

  const handleRemoveBullet = (secIndex: number, bulletIndex: number) => {
    setPolicy((prev) => {
      const next = [...prev.sections];
      next[secIndex].bullets = next[secIndex].bullets?.filter((_, idx) => idx !== bulletIndex);
      return { ...prev, sections: next };
    });
  };

  const handleBulletChange = (secIndex: number, bulletIndex: number, val: string) => {
    setPolicy((prev) => {
      const next = [...prev.sections];
      if (next[secIndex].bullets) {
        next[secIndex].bullets![bulletIndex] = val;
      }
      return { ...prev, sections: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await updatePolicy(policy);
      if (res.success) {
        setMessage({ type: "success", text: "Policy updated and saved successfully!" });
      } else {
        setMessage({ type: "error", text: res.error || "Failed to update policy." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 font-sans bg-gray-50 min-h-screen text-[13px]">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
              <Link href="/admin" className="hover:text-blue-600 transition">Admin</Link>
              <span>/</span>
              <span>Policies</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Manage {policy.title}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href={`/${policy.id}`}
              target="_blank"
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium shadow-sm transition"
            >
              View Live Page ↗
            </Link>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#2962ff] hover:bg-[#1e4ad8] disabled:opacity-50 text-white px-5 py-2 rounded-lg font-bold shadow-sm flex items-center space-x-2 transition"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* General Metadata Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              General Page Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 text-xs">Page Title</label>
                <input
                  type="text"
                  value={policy.title}
                  onChange={(e) => setPolicy({ ...policy, title: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 text-xs">Last Updated Text</label>
                <input
                  type="text"
                  value={policy.last_updated}
                  onChange={(e) => setPolicy({ ...policy, last_updated: e.target.value })}
                  placeholder="e.g. January 2026"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-gray-700 text-xs">Subtitle / Intro Paragraph</label>
                <textarea
                  rows={2}
                  value={policy.subtitle}
                  onChange={(e) => setPolicy({ ...policy, subtitle: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-gray-700 text-xs">Contact Email</label>
                <input
                  type="email"
                  value={policy.contact_email}
                  onChange={(e) => setPolicy({ ...policy, contact_email: e.target.value })}
                  placeholder="support@omaacompany.com"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Policy Sections */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">Policy Sections & Bullet Points</h2>
                <p className="text-xs text-gray-500">Add or edit numbered sections and bullet items</p>
              </div>
              <button
                type="button"
                onClick={handleAddSection}
                className="bg-indigo-50 hover:bg-indigo-100 text-[#6b62d9] font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Section</span>
              </button>
            </div>

            <div className="space-y-6">
              {policy.sections?.map((sec, sIdx) => (
                <div
                  key={sIdx}
                  className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 hover:border-gray-300 transition relative"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-gray-200 text-gray-700 font-bold px-2.5 py-0.5 rounded text-[11px]">
                      Section #{sIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(sIdx)}
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition"
                      title="Delete Section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="font-bold text-gray-700 text-xs block mb-1">Section Heading</label>
                      <input
                        type="text"
                        value={sec.heading}
                        onChange={(e) => handleSectionHeadingChange(sIdx, e.target.value)}
                        placeholder="e.g. 1. Information We Collect"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 text-xs block mb-1">
                        Optional Paragraph Text (if no bullets)
                      </label>
                      <textarea
                        rows={2}
                        value={sec.content || ""}
                        onChange={(e) => handleSectionContentChange(sIdx, e.target.value)}
                        placeholder="Detailed explanation paragraph..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                      />
                    </div>

                    {/* Bullet points */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-gray-700 text-xs">Bullet Points</label>
                        <button
                          type="button"
                          onClick={() => handleAddBullet(sIdx)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center space-x-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Bullet</span>
                        </button>
                      </div>

                      {sec.bullets?.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-center space-x-2">
                          <span className="text-gray-400 font-bold text-sm">•</span>
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => handleBulletChange(sIdx, bIdx, e.target.value)}
                            placeholder="Bullet item text..."
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm outline-none focus:border-blue-500 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveBullet(sIdx, bIdx)}
                            className="text-gray-400 hover:text-red-500 p-1 transition"
                            title="Remove Bullet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="flex justify-end pt-2 pb-12">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#2962ff] hover:bg-[#1e4ad8] disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold shadow-md flex items-center space-x-2 transition"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Saving Changes..." : "Save Policy Changes"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
