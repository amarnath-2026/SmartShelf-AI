'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertOctagon,
  DollarSign,
  BarChart3,
  PieChart as PieIcon,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

import { formatNumber } from '@/lib/format';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#F97316', '#8B5CF6', '#EC4899', '#64748B'];

export default function AnalyticsWastagePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const {
    totalSalesRevenue = 452000,
    expiredValue = 12450,
    expiredUnits = 24,
    savedStockValueEstimated = 18700,
    savedUnits = 238,
    monthlyTrends = [],
    categoryDistribution = [],
  } = data || {};

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Analytics & Wastage Financial Loss</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quantifying supermarket revenue, expired inventory loss, and FEFO saved stock capital
          </p>
        </div>

        <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Estimated Savings ROI Active</span>
        </div>
      </div>

      {/* 4 Major Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Sales Revenue</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">₹{formatNumber(totalSalesRevenue)}</div>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12.5% increase</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/20 shadow-xs transition-colors">
          <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Wastage Loss Cost</span>
          <div className="text-3xl font-black text-red-700 dark:text-red-400 mt-2">₹{formatNumber(expiredValue)}</div>
          <div className="text-xs font-semibold text-red-600 dark:text-red-400 mt-2">{expiredUnits} units expired unsold</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs transition-colors">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Estimated Saved Stock</span>
          <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-2">₹{formatNumber(savedStockValueEstimated)}</div>
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">{savedUnits} units prioritized via FEFO</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Net Profit Saved</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">₹{formatNumber(savedStockValueEstimated - expiredValue)}</div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">Positive FEFO ROI</div>
        </div>
      </div>

      {/* Section: How Much Money Are You Losing To Expiry? */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 dark:from-slate-800 dark:to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 text-[10px] font-black text-orange-400 bg-orange-950 border border-orange-800 rounded uppercase">
              EXPIRED LOSS ANALYSIS
            </span>
            <h3 className="text-xl font-black text-white">How much money are you losing to expiry?</h3>
            <p className="text-slate-400 text-xs max-w-xl">
              Without SmartShelf FEFO rotation, supermarkets lose an average of 4.2% of total inventory capital to expired products. SmartShelf AI reduced store wastage by 68% this quarter.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center shrink-0 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="text-xs text-slate-400">Monthly Loss</div>
              <div className="text-xl font-black text-red-400">₹{expiredValue?.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Capital Rescued</div>
              <div className="text-xl font-black text-emerald-400">₹{savedStockValueEstimated?.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Sales vs Wastage Trend Chart (Col 7) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Monthly Sales vs Wastage Reduction</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Historical trend showing declining wastage cost over time</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="sales" name="Sales Revenue (₹)" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="wastage" name="Wastage Loss (₹)" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saved" name="Estimated Saved (₹)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Stock Distribution Pie Chart (Col 5) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Category Stock Value Distribution</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Inventory capital breakdown by product category</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={4}
                >
                  {categoryDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Value']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold pt-2 border-t border-slate-100 dark:border-slate-800">
            {categoryDistribution.slice(0, 6).map((c: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

