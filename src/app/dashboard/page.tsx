'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Layers,
  AlertTriangle,
  AlertOctagon,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  ShoppingCart,
  Plus,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { ExpiryBadge } from '@/components/ui/ExpiryBadge';
import { CardSkeleton, TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { Button } from '@/components/ui/Button';
import { ToastContainer, ToastMessage } from '@/components/ui/ToastNotification';
import { EmptyState } from '@/components/ui/EmptyState';

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    setLoading(true);
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        addToast('error', 'Network Error', 'Failed to fetch store overview stats');
      });
  }, []);

  const handleActionClick = (itemName: string, actionName: string) => {
    addToast('success', 'Action Applied', `${actionName} active for ${itemName}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  const {
    totalProducts = 1248,
    totalStock = 8540,
    expiringSoon = 37,
    expired = 5,
    riskDistribution = { safe: 450, watch: 120, warning: 25, urgent: 8, critical: 4, expired: 5 },
    sellFirstItems = [],
  } = stats || {};

  const totalRiskCount =
    riskDistribution.safe +
    riskDistribution.watch +
    riskDistribution.warning +
    riskDistribution.urgent +
    riskDistribution.critical +
    riskDistribution.expired || 1;

  return (
    <div className="space-y-6 pb-12 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen font-sans transition-colors duration-200">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Banner / Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Good Morning, Rahul</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 rounded-md">
              Store Owner
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Here is your store expiry risk overview for today. FEFO rotation active.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/dashboard/sales">
            <Button
              variant="primary"
              size="md"
              leftIcon={<ShoppingCart className="w-4 h-4" />}
            >
              POS Checkout (FEFO)
            </Button>
          </Link>
          <Link href="/dashboard/products/add">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Stock
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Major KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{totalProducts.toLocaleString()}</div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+8.4% from last month</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Stock Units</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{totalStock.toLocaleString()}</div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">Across all storage racks</div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-500/30 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Expiring Soon</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-700 dark:text-amber-400">{expiringSoon}</div>
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-2">Needs Attention (≤ 14 days)</div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-red-200 dark:border-red-500/30 shadow-xs">
          <div className="flex items-center justify-between text-red-700 dark:text-red-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Expired Products</span>
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-red-700 dark:text-red-400">{expired}</div>
          <div className="text-xs font-semibold text-red-600 dark:text-red-400 mt-2">Take Immediate Action</div>
        </div>
      </div>

      {/* Expiry Risk Overview Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Expiry Risk Overview</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Distribution of active stock across expiry risk tiers</p>
          </div>
          <Link
            href="/dashboard/expiry"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View All Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Multi-tier Segmented Progress Bar */}
        <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden flex mb-4 border border-slate-200 dark:border-slate-800">
          <div
            style={{ width: `${(riskDistribution.safe / totalRiskCount) * 100}%` }}
            className="bg-emerald-500 transition-all"
            title={`Safe: ${riskDistribution.safe}`}
          />
          <div
            style={{ width: `${(riskDistribution.watch / totalRiskCount) * 100}%` }}
            className="bg-amber-400 transition-all"
            title={`Watch: ${riskDistribution.watch}`}
          />
          <div
            style={{ width: `${(riskDistribution.warning / totalRiskCount) * 100}%` }}
            className="bg-orange-500 transition-all"
            title={`Warning: ${riskDistribution.warning}`}
          />
          <div
            style={{ width: `${(riskDistribution.urgent / totalRiskCount) * 100}%` }}
            className="bg-red-500 transition-all"
            title={`Urgent: ${riskDistribution.urgent}`}
          />
          <div
            style={{ width: `${(riskDistribution.critical / totalRiskCount) * 100}%` }}
            className="bg-red-700 transition-all animate-pulse"
            title={`Critical: ${riskDistribution.critical}`}
          />
          <div
            style={{ width: `${(riskDistribution.expired / totalRiskCount) * 100}%` }}
            className="bg-slate-500 transition-all"
            title={`Expired: ${riskDistribution.expired}`}
          />
        </div>

        {/* Status Legend Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-emerald-900 dark:text-emerald-400">Safe: {riskDistribution.safe}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="font-semibold text-yellow-900 dark:text-yellow-300">Watch: {riskDistribution.watch}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="font-semibold text-orange-900 dark:text-orange-400">Warning: {riskDistribution.warning}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="font-semibold text-red-900 dark:text-red-400">Urgent: {riskDistribution.urgent}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-red-700 animate-pulse" />
            <span className="font-bold text-red-950 dark:text-red-300">Critical: {riskDistribution.critical}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span className="font-semibold text-slate-800 dark:text-slate-300">Expired: {riskDistribution.expired}</span>
          </div>
        </div>
      </div>

      {/* TODAY'S PRIORITY: SELL FIRST TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">TODAY&apos;S PRIORITY: SELL FIRST</h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold text-orange-800 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/10 rounded uppercase">
                  FEFO ALGORITHM
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Products prioritized based on earliest expiry date, shelf life, and quantity
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/sell-first"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/10 hover:bg-orange-200 dark:hover:bg-orange-500/20 rounded-lg transition-colors shrink-0"
          >
            <span>View Full FEFO Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {sellFirstItems.length === 0 ? (
          <EmptyState
            type="clear"
            title="FEFO Queue Clear"
            description="All urgent stock items have been prioritized or rotated successfully."
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-6">Product</th>
                    <th className="py-3.5 px-4">Batch Number</th>
                    <th className="py-3.5 px-4 text-center">Qty Remaining</th>
                    <th className="py-3.5 px-4">Expiry Date</th>
                    <th className="py-3.5 px-4">Expiry Risk Tier</th>
                    <th className="py-3.5 px-6 text-right">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {sellFirstItems.slice(0, 6).map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{item.productName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.brand} • {item.category} • Location: {item.storageLocation}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {item.batchNumber}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">{item.quantity}</span>
                        <span className="text-slate-500 dark:text-slate-400 text-[10px] block">units</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {new Date(item.expiryDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] font-bold text-red-600 dark:text-red-400">
                          {item.daysRemaining <= 0
                            ? 'Expires Today'
                            : `Expires in ${item.daysRemaining} day(s)`}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <ExpiryBadge status={item.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="amber"
                            size="sm"
                            onClick={() => handleActionClick(item.productName, 'SELL FIRST Priority Tag')}
                            leftIcon={<Flame className="w-3.5 h-3.5" />}
                          >
                            SELL FIRST
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleActionClick(item.productName, '25% Promo Discount')}
                          >
                            Promo 25%
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards */}
            <div className="md:hidden p-4 space-y-3">
              {sellFirstItems.slice(0, 6).map((item: any) => (
                <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.productName}</h4>
                      <p className="text-[10px] text-slate-500">{item.brand} • {item.storageLocation}</p>
                    </div>
                    <ExpiryBadge status={item.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Batch Number</span>
                      <span className="font-mono text-slate-900 dark:text-white font-bold">{item.batchNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Qty Remaining</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.quantity} units</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <Button
                      variant="amber"
                      size="sm"
                      onClick={() => handleActionClick(item.productName, 'SELL FIRST Tag')}
                    >
                      SELL FIRST
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
