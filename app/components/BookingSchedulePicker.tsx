"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Available Time Slots (kept existing data but styled like screenshot)
  const timeSlots = [
    "08:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "12:00 PM - 02:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM",
    "06:00 PM - 08:00 PM",
  ];

  useEffect(() => {
    // Generate next 14 days
    const nextDays = [];
    for (let i = 1; i <= 14; i++) { // Starting from tomorrow
      const d = new Date();
      d.setDate(d.getDate() + i);
      nextDays.push({
        fullDate: d.toISOString().split('T')[0], // YYYY-MM-DD
        dayStr: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(), // SAT
        dateNum: d.getDate(), // 22
        monthStr: d.toLocaleDateString('en-US', { month: 'short' }), // Aug
      });
    }
    setDates(nextDays);
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 mb-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#f0effb] text-[#6b62d9] flex items-center justify-center">
          <CalendarCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Choose Booking</h2>
          <p className="text-sm text-gray-500 font-medium">Date and Time</p>
        </div>
      </div>

      {/* Date Selection */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 text-[15px]">Select Date</h3>
          {(errorDate && !selectedDate) && <span className="text-red-500 text-xs font-bold">{errorDate}</span>}
        </div>
        
        <div className="relative group">
          {/* Scroll Buttons */}
          <button 
            type="button"
            onClick={scrollLeft}
            className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 shadow-sm z-10 hidden sm:flex hover:bg-gray-50 transition opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {/* Scrollable Container */}
          <div 
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto hidden-scrollbar pb-2 pt-1 px-1 snap-x scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {dates.map((d, idx) => {
              const isSelected = selectedDate === d.fullDate;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange(d.fullDate, selectedTime)}
                  className={`snap-start shrink-0 w-[85px] h-[105px] rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${
                    isSelected 
                      ? 'bg-[#6b62d9] text-white shadow-[0_4px_12px_rgba(107,98,217,0.3)] scale-[1.02] border-transparent' 
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-[#6b62d9] hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-[12px] font-bold mb-1 ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>{d.dayStr}</span>
                  <span className="text-[26px] font-extrabold leading-none mb-1">{d.dateNum}</span>
                  <span className={`text-[13px] font-semibold ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>{d.monthStr}</span>
                </button>
              );
            })}
          </div>

          <button 
            type="button"
            onClick={scrollRight}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 shadow-sm z-10 hidden sm:flex hover:bg-gray-50 transition opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Time Slot Selection */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 text-[15px]">Select Time Slot</h3>
          {(errorTime && !selectedTime) && <span className="text-red-500 text-xs font-bold">{errorTime}</span>}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {timeSlots.map((slot, idx) => {
            const isSelected = selectedTime === slot;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(selectedDate, slot)}
                className={`py-3.5 px-4 rounded-xl text-[14px] font-bold transition-all duration-200 border text-center ${
                  isSelected
                    ? 'bg-[#6b62d9] text-white border-[#6b62d9] shadow-[0_4px_12px_rgba(107,98,217,0.2)]'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-[#6b62d9] hover:text-[#6b62d9] hover:bg-gray-50'
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}
