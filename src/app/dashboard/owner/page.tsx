'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, ArrowUpRight, TrendingUp, AlertTriangle, 
  Send, PackageCheck, DollarSign, Calendar, RefreshCw, CheckCircle2,
  Users, Layers, Truck, Sparkles, Filter, ChevronRight, Store as StoreIcon
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ToastContainer, ToastMessage } from '@/components/ui/ToastNotification';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { TableSkeleton, CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface StoreItem {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  userCount: number;
  productCount: number;
  batchCount: number;
  salesCount: number;
  totalRevenue: number;
  criticalExpiryCount: number;
}

interface Directive {
  id: string;
  storeId: string;
  title: string;
  message: string;
  priority: string;
  status: string;
  createdAt: string;
  store: { name: string; code: string };
  createdBy?: { name: string; role: string };
}

interface AnalyticsData {
  period: string;
  daysInPeriod: number;
  summary: {
    totalRevenue: number;
    grossProfit: number;
    scrapLossValue: number;
    averageDailyBusiness: number;
    activeStoresCount: number;
  };
  stores: Array<{
    storeId: string;
    storeName: string;
    storeCode: string;
    totalRevenue: number;
    grossProfit: number;
    scrapLossValue: number;
    totalSalesCount: number;
    averageDailyBusiness: number;
  }>;
}

export default function OwnerDashboardPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'stores' | 'directives'>('analytics');
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  
  // Data & UX Action States
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [directives, setDirectives] = useState<Directive[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modal states
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', code: '', address: '', phone: '', email: '' });
  const [createdCredentials, setCreatedCredentials] = useState<any>(null);

  const [showDirectiveModal, setShowDirectiveModal] = useState(false);
  const [newDirective, setNewDirective] = useState({ storeId: '', title: '', message: '', priority: 'URGENT' });

  // Confirmation Modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [storesRes, directivesRes, analyticsRes] = await Promise.all([
        fetch('/api/stores').then((r) => r.json()),
        fetch('/api/directives').then((r) => r.json()),
        fetch(`/api/analytics/owner?period=${analyticsPeriod}`).then((r) => r.json()),
      ]);

      if (storesRes.stores) setStores(storesRes.stores);
      if (directivesRes.directives) setDirectives(directivesRes.directives);
      if (analyticsRes.summary) setAnalytics(analyticsRes);
    } catch (err) {
      console.error('Failed to load owner data:', err);
      addToast('error', 'Network Error', 'Failed to fetch enterprise data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [analyticsPeriod]);

  // Handle Add Store
  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStore),
      });
      const data = await res.json();
      if (data.success) {
        setCreatedCredentials(data.generatedCredentials);
        setNewStore({ name: '', code: '', address: '', phone: '', email: '' });
        addToast('success', 'Store Provisioned', `${data.store.name} created with auto logins`);
        fetchData();
      } else {
        addToast('error', 'Provisioning Failed', data.error || 'Failed to create store');
      }
    } catch (err) {
      addToast('error', 'Server Error', 'Error creating store');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Dispatch Staff Directive
  const handleCreateDirective = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/directives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDirective),
      });
      const data = await res.json();
      if (data.success) {
        setShowDirectiveModal(false);
        setNewDirective({ storeId: '', title: '', message: '', priority: 'URGENT' });
        addToast('success', 'Directive Dispatched', 'Staff intimation sent to store inbox');
        fetchData();
      } else {
        addToast('error', 'Dispatch Failed', data.error || 'Failed to dispatch directive');
      }
    } catch (err) {
      addToast('error', 'Server Error', 'Error dispatching directive');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen font-sans transition-colors duration-200">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        description={confirmConfig.description}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl relative overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Super Admin Portal
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Owner Enterprise Control Center</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Multi-store revenue analytics, staff intimation directives, and dynamic store management
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <Button
            variant="amber"
            size="md"
            onClick={() => setShowDirectiveModal(true)}
            leftIcon={<Send className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Intimate Store Staff
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowAddStoreModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Add New Store
          </Button>
        </div>
      </div>

      {/* Navigation Tabs - Horizontally Scrollable on Mobile */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Financial &amp; Business Benchmarks
        </button>

        <button
          onClick={() => setActiveTab('stores')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'stores'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" /> Store Provisioning &amp; Logins ({stores.length})
        </button>

        <button
          onClick={() => setActiveTab('directives')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'directives'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Send className="w-4 h-4" /> Staff Directives &amp; Intimations ({directives.length})
        </button>
      </div>

      {/* TAB 1: FINANCIAL ANALYTICS & STORE BENCHMARKS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Period Filter Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Analytics Timeframe
            </span>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 w-full sm:w-auto justify-center">
              {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setAnalyticsPeriod(p)}
                  className={`px-3 py-1 rounded-md text-xs font-bold capitalize cursor-pointer transition-all ${
                    analyticsPeriod === p
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {p} Analysis
                </button>
              ))}
            </div>
          </div>

          {/* Loading Skeleton vs Key Metric Cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-xs">
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Sales Income</span>
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  ₹{analytics?.summary.totalRevenue.toLocaleString() || '0'}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 capitalize">{analyticsPeriod} aggregated income</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-xs">
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Estimated Gross Profit</span>
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  ₹{analytics?.summary.grossProfit.toLocaleString() || '0'}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Revenue minus estimated COGS</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-xs">
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Average Daily Business / Store</span>
                  <Calendar className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  ₹{Math.round(analytics?.summary.averageDailyBusiness || 0).toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Average business generated per store per day</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-xs">
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Stock Expiry Scrap Loss</span>
                  <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
                </div>
                <div className="text-2xl font-black text-red-600 dark:text-red-400">
                  ₹{analytics?.summary.scrapLossValue.toLocaleString() || '0'}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Unsold expired batch loss valuation</p>
              </div>
            </div>
          )}

          {/* Store Daily Average Business Benchmarking Matrix */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Average Daily Business &amp; Store Performance Matrix
            </h3>

            {loading ? (
              <TableSkeleton />
            ) : analytics?.stores && analytics.stores.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Store Name</th>
                        <th className="py-3 px-4">Code</th>
                        <th className="py-3 px-4 text-right">Total Revenue</th>
                        <th className="py-3 px-4 text-right">Gross Profit</th>
                        <th className="py-3 px-4 text-right bg-slate-50 dark:bg-slate-800/40 text-amber-600 dark:text-amber-400">Avg Daily Business</th>
                        <th className="py-3 px-4 text-right text-red-600 dark:text-red-400">Scrap Loss</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs">
                      {analytics.stores.map((s, idx) => (
                        <tr key={s.storeId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all">
                          <td className="py-3 px-4 font-bold text-slate-500 dark:text-slate-400">
                            {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : `#${idx + 1}`}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{s.storeName}</td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{s.storeCode}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-200">
                            ₹{s.totalRevenue.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{s.grossProfit.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-amber-600 dark:text-amber-400 bg-slate-50 dark:bg-slate-800/30">
                            ₹{Math.round(s.averageDailyBusiness).toLocaleString()} / day
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-red-600 dark:text-red-400">
                            ₹{s.scrapLossValue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Responsive Card Stack */}
                <div className="md:hidden space-y-3">
                  {analytics.stores.map((s, idx) => (
                    <div key={s.storeId} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">
                          {idx === 0 ? '🥇 #1 Rank' : `#${idx + 1} Rank`}
                        </span>
                        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {s.storeCode}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{s.storeName}</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">Total Revenue</span>
                          <span className="font-bold text-slate-900 dark:text-white">₹{s.totalRevenue.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">Avg Daily Business</span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">₹{Math.round(s.averageDailyBusiness).toLocaleString()} / day</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                type="empty"
                title="No Performance Metrics Recorded"
                description="Create stores and record sales transactions to view automated store benchmark matrix."
                actionText="Add First Store"
                onActionClick={() => setShowAddStoreModal(true)}
              />
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STORE PROVISIONING & CREDENTIALS */}
      {activeTab === 'stores' && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardSkeleton /><CardSkeleton /><CardSkeleton />
            </div>
          ) : stores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => (
                <div key={store.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-mono text-[11px] font-bold rounded-lg">
                        {store.code}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {store.userCount} User Logins
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{store.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{store.address || 'No address provided'}</p>

                    <div className="space-y-2 py-3 border-t border-slate-200 dark:border-slate-800/60 text-xs">
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Total Products:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{store.productCount}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Total Sales Volume:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{store.salesCount} Sales</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Total Revenue:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{store.totalRevenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Staff Default Login:</span>
                    <code className="bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded text-emerald-600 dark:text-emerald-400 font-mono block">
                      staff.{store.code.toLowerCase()}@smartshelf.ai
                    </code>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              type="empty"
              title="No Stores Registered"
              description="Dynamically add your supermarket branches to auto-generate staff login credentials."
              actionText="Provision Store Now"
              onActionClick={() => setShowAddStoreModal(true)}
            />
          )}
        </div>
      )}

      {/* TAB 3: STAFF DIRECTIVES & INTIMATION */}
      {activeTab === 'directives' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Active Staff Placement &amp; Expiry Directives
            </h3>

            {loading ? (
              <TableSkeleton />
            ) : directives.length > 0 ? (
              <div className="space-y-3">
                {directives.map((d) => (
                  <div key={d.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          d.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          {d.priority}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{d.store.name}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{d.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{d.message}</p>
                    </div>

                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                        d.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                type="clear"
                title="No Pending Directives"
                description="Dispatched expiry intimations and shelf relocation instructions will appear here."
                actionText="Dispatch New Directive"
                onActionClick={() => setShowDirectiveModal(true)}
              />
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD STORE */}
      {showAddStoreModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl text-slate-900 dark:text-white">
            <h3 className="text-lg font-bold">Dynamically Provision New Store</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Creating a store will automatically generate its default Staff &amp; Supervisor login credentials.
            </p>

            <form onSubmit={handleCreateStore} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Store Name *</label>
                <input
                  type="text"
                  required
                  placeholder="FreshMart Express - HSR Layout"
                  value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Store Code (Unique) *</label>
                <input
                  type="text"
                  required
                  placeholder="STORE-004"
                  value={newStore.code}
                  onChange={(e) => setNewStore({ ...newStore, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Address</label>
                <input
                  type="text"
                  placeholder="27th Main, Sector 1, HSR Layout, Bengaluru"
                  value={newStore.address}
                  onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              {createdCredentials && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 space-y-1">
                  <p className="font-bold">✅ Store &amp; Accounts Provisioned Successfully!</p>
                  <p>Staff Email: <code className="font-mono text-slate-900 dark:text-white">{createdCredentials.staff.email}</code></p>
                  <p>Supervisor Email: <code className="font-mono text-slate-900 dark:text-white">{createdCredentials.supervisor.email}</code></p>
                  <p>Password: <code className="font-mono text-slate-900 dark:text-white">password123</code></p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => { setShowAddStoreModal(false); setCreatedCredentials(null); }}
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={submitting}
                >
                  Create &amp; Generate Accounts
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INTIMATE STORE STAFF DIRECTIVE */}
      {showDirectiveModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl text-slate-900 dark:text-white">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Send className="w-5 h-5 text-amber-500 dark:text-amber-400" /> Dispatch Expiry Intimation Directive to Staff
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instruct store staff to immediately relocate near-expiry items to front shelves or set promotion discounts.
            </p>

            <form onSubmit={handleCreateDirective} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Target Store *</label>
                <select
                  required
                  value={newDirective.storeId}
                  onChange={(e) => setNewDirective({ ...newDirective, storeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="">Select Target Store...</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Priority</label>
                <select
                  value={newDirective.priority}
                  onChange={(e) => setNewDirective({ ...newDirective, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="URGENT">Urgent (Expires in &lt; 7 Days)</option>
                  <option value="CRITICAL">Critical (Expires in &lt; 3 Days)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Directive Title *</label>
                <input
                  type="text"
                  required
                  placeholder="🔥 Move Amul Taaza Batch #AM-201 to Front Counter"
                  value={newDirective.title}
                  onChange={(e) => setNewDirective({ ...newDirective, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Detailed Instructions for Staff *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Batch #AM-201 has 20 packs expiring in 2 days. Relocate to the SELL FIRST display shelf at main entrance and set 20% discount tag."
                  value={newDirective.message}
                  onChange={(e) => setNewDirective({ ...newDirective, message: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDirectiveModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="amber"
                  size="sm"
                  isLoading={submitting}
                >
                  Send Directive Now
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
