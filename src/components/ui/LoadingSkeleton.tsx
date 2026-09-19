import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs animate-pulse space-y-3">
    <div className="flex justify-between items-start">
      <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded"></div>
      <div className="h-7 w-7 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
    </div>
    <div className="h-8 w-24 bg-slate-300 dark:bg-slate-700 rounded"></div>
    <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
  </div>
);

export const TableSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs animate-pulse space-y-4">
    <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex gap-4 items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
        <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-4 w-1/6 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-4 w-1/6 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
      </div>
    ))}
  </div>
);
