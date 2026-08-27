"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Clock, ChevronDown, CheckCircle2 } from "lucide-react";

interface BookingSchedulePickerProps {
  selectedDate: string;
  selectedTime: string;
  onChange: (date: string, time: string) => void;
  errorDate?: string;
  errorTime?: string;
}

export default function BookingSchedulePicker({
  selectedDate,
  selectedTime,
  onChange,
  errorDate,
  errorTime,
}: BookingSchedulePickerProps) {
  const [dates, setDates] = useState<any[]>([]);

  const timeSlots = [
    "08:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "12:00 PM - 02:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM",
    "06:00 PM - 08:00 PM",
  ];

  // Helper to get formatted local date string YYYY-MM-DD
  const getLocalDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const nextDays = [];
    const today = new Date();

    // Generate dates for the next 30 days starting strictly from TODAY (no past dates)
    for (let i = 0; i <= 30; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);

      const fullDate = getLocalDateStr(d);

      nextDays.push({
        fullDate,
        dayStr: d.toLocaleDateString("en-US", { weekday: "short" }),
        dateNum: d.getDate(),
        monthStr: d.toLocaleDateString("en-US", { month: "short" }),
        isToday: i === 0,
      });
    }
    setDates(nextDays);

    // Auto-select today if no date is selected
    if (!selectedDate && nextDays.length > 0) {
      onChange(nextDays[0].fullDate, selectedTime);
    }
  }, []);

  // Check if a time slot is expired for the currently selected date
  // (Keep currently running slot OPEN and only disable when slot END time has passed)
  const isSlotDisabled = (slot: string) => {
    if (!selectedDate) return false;

    const today = new Date();
    const todayStr = getLocalDateStr(today);

    // If selected date is before today, it's disabled
    if (selectedDate < todayStr) return true;

    // If selected date is today, check if the slot END time has already passed
    if (selectedDate === todayStr) {
      // Extract the end time (e.g. from "10:00 AM - 12:00 PM", get "12:00 PM")
      const parts = slot.split("-");
      const endTimeStr = (parts[1] || parts[0]).trim();
      const match = endTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      
      if (match) {
        let hour = parseInt(match[1]);
        const min = parseInt(match[2]);
        const ampm = match[3].toUpperCase();

        if (ampm === "PM" && hour < 12) hour += 12;
        if (ampm === "AM" && hour === 12) hour = 0;

        const currentTime = new Date();
        const slotEndTime = new Date();
        slotEndTime.setHours(hour, min, 0, 0);

        // Only disable if the current time has reached or passed the END time of the slot
        if (currentTime >= slotEndTime) {
          return true;
        }
      }
    }

    return false;
  };

  // Helper to identify if a slot is currently in-progress right now
  const isSlotOngoing = (slot: string) => {
    if (!selectedDate) return false;
    const today = new Date();
    const todayStr = getLocalDateStr(today);
    if (selectedDate !== todayStr) return false;

    const parts = slot.split("-");
    const startMatch = (parts[0] || "").trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
    const endMatch = (parts[1] || parts[0]).trim().match(/(\d+):(\d+)\s*(AM|PM)/i);

    if (startMatch && endMatch) {
      let startHour = parseInt(startMatch[1]);
      if (startMatch[3].toUpperCase() === "PM" && startHour < 12) startHour += 12;
      if (startMatch[3].toUpperCase() === "AM" && startHour === 12) startHour = 0;

      let endHour = parseInt(endMatch[1]);
      if (endMatch[3].toUpperCase() === "PM" && endHour < 12) endHour += 12;
      if (endMatch[3].toUpperCase() === "AM" && endHour === 12) endHour = 0;

      const now = new Date();
      const startTime = new Date();
      startTime.setHours(startHour, parseInt(startMatch[2]), 0, 0);
      const endTime = new Date();
      endTime.setHours(endHour, parseInt(endMatch[2]), 0, 0);

      return now >= startTime && now < endTime;
    }
    return false;
  };

  // If user selected today and current selectedTime is expired, clear selectedTime
  useEffect(() => {
    if (selectedDate && selectedTime && isSlotDisabled(selectedTime)) {
      onChange(selectedDate, "");
    }
  }, [selectedDate]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 mb-4 shadow-sm font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#f0effb] text-[#6b62d9] flex items-center justify-center shadow-inner">
          <CalendarCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-[16px] font-bold text-gray-900 tracking-tight">Service Schedule</h2>
          <p className="text-[12px] text-gray-500 font-medium">Select your preferred date and time slot</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6">
        
        {/* Date Selection */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5" /> Select Date
            </label>
            {errorDate && !selectedDate && (
              <span className="text-red-500 text-xs font-bold">{errorDate}</span>
            )}
          </div>
          
          <div className="relative">
            <div className="grid grid-cols-3 gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar pb-4">
              {dates.map((d, idx) => {
                const isSelected = selectedDate === d.fullDate;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChange(d.fullDate, selectedTime)}
                    className={`w-full py-2.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 border cursor-pointer ${
                      isSelected 
                        ? "bg-[#6b62d9] text-white shadow-[0_6px_16px_rgba(107,98,217,0.3)] scale-[1.02] border-[#6b62d9]" 
                        : "bg-white border-gray-200 text-gray-700 hover:border-[#6b62d9] hover:bg-[#f8f7ff]"
                    }`}
                  >
                    <span className={`text-[10px] font-bold mb-0.5 ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                      {d.isToday ? "Today" : d.monthStr}
                    </span>
                    <span className="text-[18px] font-black leading-none mb-0.5">{d.dateNum}</span>
                    <span className={`text-[10px] font-bold ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                      {d.dayStr}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none flex justify-center items-end pb-0.5">
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Time Slot Selection */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Available Slots
            </label>
            {errorTime && !selectedTime && (
              <span className="text-red-500 text-xs font-bold">{errorTime}</span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2.5">
            {timeSlots.map((slot, idx) => {
              const disabled = isSlotDisabled(slot);
              const ongoing = isSlotOngoing(slot);
              const isSelected = selectedTime === slot;
              
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && onChange(selectedDate, slot)}
                  className={`py-3 px-2 rounded-xl text-[11px] sm:text-[12px] font-bold transition-all duration-200 border text-center relative ${
                    disabled 
                      ? "bg-gray-100/70 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed line-through"
                      : isSelected
                      ? "bg-[#6b62d9] text-white border-[#6b62d9] shadow-[0_4px_12px_rgba(107,98,217,0.3)] scale-[1.02]"
                      : ongoing
                      ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 hover:bg-emerald-100/70 cursor-pointer shadow-sm"
                      : "bg-white border-gray-200 text-gray-700 hover:border-[#6b62d9]/50 hover:bg-[#f8f7ff] cursor-pointer"
                  }`}
                >
                  {slot}
                  {ongoing && !isSelected && (
                    <span className="block text-[9px] font-bold text-emerald-600 no-underline not-italic">Active Now</span>
                  )}
                  {disabled && (
                    <span className="block text-[9px] font-normal text-gray-400 no-underline not-italic">Passed</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
