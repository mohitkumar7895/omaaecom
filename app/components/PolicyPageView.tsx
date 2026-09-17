import Navbar from "./Navbar";
import { Shield, Clock, Mail, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { PolicyData } from "../actions/policies";

export default function PolicyPageView({ policy }: { policy: PolicyData }) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans text-gray-900 selection:bg-[#6b62d9] selection:text-white">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2c3e50] via-[#34495e] to-[#2c3e50] text-white py-12 px-4 sm:px-8 border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-300 mb-4">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-indigo-300">{policy.title}</span>
          </div>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
                {policy.title}
              </h1>
              {policy.subtitle && (
                <p className="text-gray-300 text-sm sm:text-base max-w-2xl leading-relaxed whitespace-pre-line">
                  {policy.subtitle}
                </p>
              )}
            </div>

            {policy.last_updated && (
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-medium text-gray-200 border border-white/10">
                <Clock className="w-3.5 h-3.5 text-indigo-300" />
                <span>Last Updated: {policy.last_updated}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 divide-y divide-gray-100">
          
          {/* Intro Notice */}
          <div className="pb-6">
            <div className="flex items-center space-x-3 text-[#6b62d9] mb-3">
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span className="font-bold text-sm uppercase tracking-wider">OMAA Company Official Policy</span>
            </div>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              OMAA Company values your trust and is committed to transparent, reliable, and secure service delivery.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="py-6 space-y-8">
            {policy.sections && policy.sections.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#6b62d9]"></span>
                  {section.heading}
                </h2>

                {section.content && (
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed pl-4">
                    {section.content}
                  </p>
                )}

                {section.bullets && section.bullets.length > 0 && (
                  <ul className="space-y-2.5 pl-4">
                    {section.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start space-x-3 text-sm sm:text-base text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-[#328e3b] flex-shrink-0 mt-1" />
                        <span className="leading-snug">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Contact Section */}
          {policy.contact_email && (
            <div className="pt-8">
              <div className="bg-[#f8f9fa] rounded-xl p-5 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">Have questions about this policy?</h3>
                  <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Our support team is available to assist you anytime.</p>
                </div>
                <a 
                  href={`mailto:${policy.contact_email}`}
                  className="inline-flex items-center space-x-2 bg-[#6b62d9] hover:bg-[#584ec6] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition"
                >
                  <Mail className="w-4 h-4" />
                  <span>{policy.contact_email}</span>
                </a>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
