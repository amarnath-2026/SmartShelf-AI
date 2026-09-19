'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { ExpiryBadge } from '@/components/ui/ExpiryBadge';
import { Button } from '@/components/ui/Button';

export default function ExpiryCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // Sep 2026
  const [calendarData, setCalendarData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchCalendar = () => {
    setLoading(true);
    fetch(`/api/expiry/calendar?year=${year}&month=${month + 1}`)
      .then((res) => res.json())
      .then((data) => {
        setCalendarData(data.calendarData || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCalendar();
  }, [year, month]);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Grid calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const selectedDateDetails = selectedDateKey ? calendarData[selectedDateKey] : null;

  return (
    <div className="space-y-6 pb-16 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/60 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Expiry Calendar</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Visual monthly schedule of product batch expiration dates across store racks
            </p>
          </div>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-black text-slate-900 dark:text-white px-3 min-w-[120px] text-center">
            {monthName} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 sm:p-6 transition-colors">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Month Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty padding cells */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-20 sm:h-28 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-100/50 dark:border-slate-800/40" />
          ))}

          {/* Calendar Day Cells */}
          {Array.from({ length: daysInMonth }).map((_, dayIdx) => {
            const dayNum = dayIdx + 1;
            const formattedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayData = calendarData[formattedDateStr];
            const isSelected = selectedDateKey === formattedDateStr;

            return (
              <div
                key={dayNum}
                onClick={() => dayData && setSelectedDateKey(formattedDateStr)}
                className={`h-20 sm:h-28 p-1.5 sm:p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                  dayData
                    ? 'cursor-pointer hover:border-emerald-500 hover:shadow-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800/60 opacity-80'
                } ${
                  isSelected ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{dayNum}</span>
                  {dayData && (
                    <span
                      className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                        dayData.highestRisk === 'CRITICAL' || dayData.highestRisk === 'EXPIRES_TODAY'
                          ? 'bg-red-500 animate-pulse'
                          : dayData.highestRisk === 'URGENT'
                          ? 'bg-orange-500'
                          : dayData.highestRisk === 'WARNING'
                          ? 'bg-amber-400'
                          : 'bg-emerald-500'
                      }`}
                    />
                  )}
                </div>

                {dayData ? (
                  <div className="space-y-1">
                    <div
                      className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[11px] font-black text-center truncate ${
                        dayData.highestRisk === 'CRITICAL'
                          ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900'
                          : dayData.highestRisk === 'URGENT'
                          ? 'bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-900'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                      }`}
                    >
                      {dayData.count} units
                    </div>
                    <div className="hidden sm:block text-[10px] font-semibold text-slate-500 dark:text-slate-400 text-center truncate">
                      {dayData.items.length} batch(es)
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-300 dark:text-slate-600 text-center font-medium">Clear</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Details Slide-Over Panel */}
      {selectedDateDetails && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col p-6 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                EXPIRY BREAKDOWN
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {new Date(selectedDateDetails.date).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </h3>
            </div>
            <button
              onClick={() => setSelectedDateKey(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl px-4 border border-amber-200 dark:border-amber-900/60 my-4 text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center justify-between">
            <span>Total Units Expiring:</span>
            <span className="text-base font-black text-amber-700 dark:text-amber-400">{selectedDateDetails.count} units</span>
          </div>

          {/* List of items expiring on this date */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {selectedDateDetails.items.map((item: any) => (
              <div key={item.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
                <div className="flex items-start justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.productName}</h4>
                  <ExpiryBadge status={item.status} />
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>Batch: <strong className="font-mono text-slate-900 dark:text-slate-200">{item.batchNumber}</strong></span>
                  <span>Category: {item.category}</span>
                </div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 font-bold flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700">
                  <span>Quantity: {item.quantity} units</span>
                  <span>Unit Price: ₹{item.sellingPrice}</span>
                </div>
              </div>
            ))}
          </div>

          <Button variant="secondary" className="w-full mt-4" onClick={() => setSelectedDateKey(null)}>
            Close Details
          </Button>
        </div>
      )}
    </div>
  );
}

