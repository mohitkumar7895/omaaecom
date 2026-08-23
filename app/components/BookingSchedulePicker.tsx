"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Clock, ChevronDown } from "lucide-react";

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
  errorTime
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

  useEffect(() => {
    const nextDays = [];
    // Generate dates for the next 30 days
    for (let i = 0; i <= 30; i++) { 
      const d = new Date();
      d.setDate(d.getDate() + i);
      
      // Use local date string YYYY-MM-DD to avoid timezone bugs
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const fullDate = `${year}-${month}-${day}`;
      
      nextDays.push({
        fullDate,
        dayStr: d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
        dateNum: d.getDate(), 
        monthStr: d.toLocaleDateString('en-US', { month: 'short' }), 
      });
    }
    setDates(nextDays);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 mb-4 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#f0effb] text-[#6b62d9] flex items-center justify-center shadow-inner">
          <CalendarCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-[16px] font-bold text-gray-900 tracking-tight">Service Schedule</h2>
          <p className="text-[12px] text-gray-500 font-medium">Select your preferred slot</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6">
        {/* Date Selection */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><CalendarCheck className="w-3.5 h-3.5"/> Date</label>
            {(errorDate && !selectedDate) && <span className="text-red-500 text-xs font-bold">{errorDate}</span>}
          </div>
          
          {/* Scrollable Container with gradient indicator */}
          <div className="relative">
            <div className="grid grid-cols-3 gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar pb-6">
              {dates.map((d, idx) => {
                const isSelected = selectedDate === d.fullDate;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChange(d.fullDate, selectedTime)}
                    className={`w-full py-2.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border ${
                      isSelected 
                        ? 'bg-[#6b62d9] text-white shadow-[0_6px_16px_rgba(107,98,217,0.3)] scale-[1.02] border-[#6b62d9]' 
                        : 'bg-white border-gray-200 text-gray-600 hover:border-[#6b62d9] hover:bg-[#f8f7ff]'
                    }`}
                  >
                    <span className={`text-[10px] font-bold mb-0.5 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>{d.monthStr}</span>
                    <span className="text-[18px] font-black leading-none mb-0.5">{d.dateNum}</span>
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>{d.dayStr}</span>
                  </button>
                );
              })}
            </div>
            {/* Fade effect at bottom to indicate scroll */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none flex justify-center items-end pb-1 pr-2">
              <ChevronDown className="w-4 h-4 text-gray-400 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Time Slot Selection */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Time Slot</label>
            {(errorTime && !selectedTime) && <span className="text-red-500 text-xs font-bold">{errorTime}</span>}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {timeSlots.map((slot, idx) => {
              const disabled = (() => {
                if (!selectedDate) return false;
                const today = new Date();
                
                // Parse selectedDate safely in local time
                const [sYear, sMonth, sDay] = selectedDate.split('-').map(Number);
                
                if (
                  sYear === today.getFullYear() &&
                  (sMonth - 1) === today.getMonth() &&
                  sDay === today.getDate()
                ) {
                  const match = slot.match(/(\d+):(\d+)\s(AM|PM)/);
                  if (match) {
                    let hour = parseInt(match[1]);
                    const min = parseInt(match[2]);
                    const ampm = match[3];
                    if (ampm === 'PM' && hour < 12) hour += 12;
                    if (ampm === 'AM' && hour === 12) hour = 0;
                    
                    const currentTime = new Date();
                    const slotTime = new Date();
                    slotTime.setHours(hour, min, 0, 0);
                    
                    // Passed if current time is greater than slot start time
                    if (currentTime > slotTime) return true;
                  }
                }
                return false;
              })();

              const isSelected = selectedTime === slot;
              
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(selectedDate, slot)}
                  className={`py-3 px-2 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all duration-300 border text-center ${
                    disabled 
                      ? 'bg-gray-100 border-gray-200 text-gray-400 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#6b62d9] text-white border-[#6b62d9] shadow-[0_4px_12px_rgba(107,98,217,0.3)] scale-[1.02]'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-[#6b62d9]/50 hover:bg-[#f8f7ff]'
                  }`}
                >
                  {slot}
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
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}
