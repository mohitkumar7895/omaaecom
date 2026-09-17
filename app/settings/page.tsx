"use client";

import Navbar from "../components/Navbar";
import { ArrowLeft, BellOff, MessageCircle, Bell, Mail, MessageSquare, Phone, Shield, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  
  // State for toggles
  const [toggles, setToggles] = useState({
    whatsapp: true,
    push: true,
    email: true,
    sms: true,
    voice: true
  });

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Ultra-Premium iOS Style Toggle Switch
  const ToggleSwitch = ({ active, onClick, activeColor = "bg-[#34C759]" }: { active: boolean, onClick: () => void, activeColor?: string }) => (
    <button 
      onClick={onClick}
      className={`relative inline-flex h-[30px] w-[52px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 ${active ? activeColor : 'bg-[#E5E5EA]'}`}
      style={{ boxShadow: active ? 'inset 0 0 0 1px rgba(0,0,0,0.05)' : 'inset 0 0 0 1.5px rgba(0,0,0,0.1)' }}
    >
      <span 
        className={`pointer-events-none inline-block h-[26px] w-[26px] transform rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2),0_1px_1px_rgba(0,0,0,0.1)] ring-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${active ? 'translate-x-[22px]' : 'translate-x-0'}`} 
      />
    </button>
  );

  return (
    <main className="min-h-screen bg-[#f2f2f7] flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-1 max-w-[900px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        
        {/* Premium Header */}
        <div className="flex items-center gap-5 mb-8">
          <button 
            onClick={() => router.back()}
            className="w-11 h-11 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-all shadow-sm border border-gray-100 text-gray-700 hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-gray-900 tracking-tight">Settings</h1>
          </div>
        </div>

        {/* Purple Banner */}
        <div className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-[20px] p-6 mb-10 flex items-center gap-5 text-white shadow-[0_10px_30px_rgba(139,92,246,0.2)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="bg-white/20 p-3.5 rounded-2xl shrink-0 backdrop-blur-md border border-white/10">
            <BellOff size={24} className="text-white" />
          </div>
          <div className="relative z-10">
            <h3 className="font-bold text-[16px] mb-1 tracking-wide">Order related messages</h3>
            <p className="text-white/80 text-[14px] font-medium leading-relaxed max-w-xl">
              These messages cannot be turned off as they are critical for tracking your service experience.
            </p>
          </div>
        </div>

        {/* Notifications & Reminders Section */}
        <div className="mb-12">
          <h2 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-4">Notifications & Reminders</h2>
          
          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/80 overflow-hidden divide-y divide-gray-50">
            
            {/* WhatsApp */}
            <div className={`flex items-center justify-between p-5 transition-colors ${toggles.whatsapp ? 'bg-white' : 'bg-gray-50/50'}`}>
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 transition-colors duration-300 ${toggles.whatsapp ? 'bg-[#dcfce7] text-[#22c55e]' : 'bg-gray-100 text-gray-400'}`}>
                  <MessageCircle size={24} fill="currentColor" fillOpacity={toggles.whatsapp ? 0.2 : 0} />
                </div>
                <div>
                  <h3 className={`font-bold text-[16px] mb-0.5 transition-colors ${toggles.whatsapp ? 'text-gray-900' : 'text-gray-500'}`}>WhatsApp</h3>
                  <p className="text-[13px] text-gray-400 font-medium">Chat & order updates</p>
                </div>
              </div>
              <ToggleSwitch active={toggles.whatsapp} onClick={() => handleToggle('whatsapp')} activeColor="bg-[#22c55e]" />
            </div>

            {/* Push Notifications */}
            <div className={`flex items-center justify-between p-5 transition-colors ${toggles.push ? 'bg-white' : 'bg-gray-50/50'}`}>
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 transition-colors duration-300 ${toggles.push ? 'bg-[#fef9c3] text-[#eab308]' : 'bg-gray-100 text-gray-400'}`}>
                  <Bell size={24} fill="currentColor" fillOpacity={toggles.push ? 0.2 : 0} />
                </div>
                <div>
                  <h3 className={`font-bold text-[16px] mb-0.5 transition-colors ${toggles.push ? 'text-gray-900' : 'text-gray-500'}`}>Push Notifications</h3>
                  <p className="text-[13px] text-gray-400 font-medium">In-app alerts</p>
                </div>
              </div>
              <ToggleSwitch active={toggles.push} onClick={() => handleToggle('push')} activeColor="bg-[#eab308]" />
            </div>

            {/* Email */}
            <div className={`flex items-center justify-between p-5 transition-colors ${toggles.email ? 'bg-white' : 'bg-gray-50/50'}`}>
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 transition-colors duration-300 ${toggles.email ? 'bg-[#dbeafe] text-[#3b82f6]' : 'bg-gray-100 text-gray-400'}`}>
                  <Mail size={24} fill="currentColor" fillOpacity={toggles.email ? 0.2 : 0} />
                </div>
                <div>
                  <h3 className={`font-bold text-[16px] mb-0.5 transition-colors ${toggles.email ? 'text-gray-900' : 'text-gray-500'}`}>Email</h3>
                  <p className="text-[13px] text-gray-400 font-medium">Booking receipts & offers</p>
                </div>
              </div>
              <ToggleSwitch active={toggles.email} onClick={() => handleToggle('email')} activeColor="bg-[#3b82f6]" />
            </div>

            {/* SMS */}
            <div className={`flex items-center justify-between p-5 transition-colors ${toggles.sms ? 'bg-white' : 'bg-gray-50/50'}`}>
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 transition-colors duration-300 ${toggles.sms ? 'bg-[#f3e8ff] text-[#a855f7]' : 'bg-gray-100 text-gray-400'}`}>
                  <MessageSquare size={24} fill="currentColor" fillOpacity={toggles.sms ? 0.2 : 0} />
                </div>
                <div>
                  <h3 className={`font-bold text-[16px] mb-0.5 transition-colors ${toggles.sms ? 'text-gray-900' : 'text-gray-500'}`}>SMS</h3>
                  <p className="text-[13px] text-gray-400 font-medium">Text message alerts</p>
                </div>
              </div>
              <ToggleSwitch active={toggles.sms} onClick={() => handleToggle('sms')} activeColor="bg-[#a855f7]" />
            </div>

            {/* Voice Calls */}
            <div className={`flex items-center justify-between p-5 transition-colors ${toggles.voice ? 'bg-white' : 'bg-gray-50/50'}`}>
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 transition-colors duration-300 ${toggles.voice ? 'bg-[#fee2e2] text-[#ef4444]' : 'bg-gray-100 text-gray-400'}`}>
                  <Phone size={24} fill="currentColor" fillOpacity={toggles.voice ? 0.2 : 0} />
                </div>
                <div>
                  <h3 className={`font-bold text-[16px] mb-0.5 transition-colors ${toggles.voice ? 'text-gray-900' : 'text-gray-500'}`}>Voice calls</h3>
                  <p className="text-[13px] text-gray-400 font-medium">Important call alerts</p>
                </div>
              </div>
              <ToggleSwitch active={toggles.voice} onClick={() => handleToggle('voice')} activeColor="bg-[#ef4444]" />
            </div>

          </div>
        </div>

        {/* More Section */}
        <div>
          <h2 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-4">More Options</h2>
          
          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/80 overflow-hidden cursor-pointer hover:bg-gray-50 active:scale-[0.99] transition-all">
            
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-[#f1f5f9] rounded-[14px] flex items-center justify-center text-gray-500 shrink-0">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-[16px] text-gray-900 mb-0.5">Privacy & data</h3>
                  <p className="text-[13px] text-gray-400 font-medium">Manage your data preferences</p>
                </div>
              </div>
              <ChevronRight size={22} className="text-gray-300" />
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}