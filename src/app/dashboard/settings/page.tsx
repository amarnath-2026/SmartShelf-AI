'use client';

import React, { useState } from 'react';
import { Settings, Shield, Sliders, Store, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ToastNotification } from '@/components/ui/ToastNotification';

export default function SettingsPage() {
  const [watchDays, setWatchDays] = useState(30);
  const [warningDays, setWarningDays] = useState(14);
  const [urgentDays, setUrgentDays] = useState(6);
  const [criticalDays, setCriticalDays] = useState(2);
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setToast({ type: 'success', message: 'Expiry alert threshold settings saved successfully!' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">System Settings</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure store alert thresholds, currency, and role permissions
            </p>
          </div>
        </div>
      </div>

      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Threshold Days Config */}
      <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Expiry Alert Threshold Days</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define how many days remaining trigger each alert tier in the FEFO Expiry Engine
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 space-y-2">
            <label className="block text-red-900 dark:text-red-300">Critical Expiry Threshold (Days)</label>
            <input
              type="number"
              value={criticalDays}
              onChange={(e) => setCriticalDays(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-red-300 dark:border-red-800 rounded-lg text-slate-900 dark:text-white font-bold focus:outline-hidden"
            />
            <p className="text-[10px] text-red-700 dark:text-red-400 font-normal">Triggers CRITICAL 🔴 alert and SELL FIRST priority tag.</p>
          </div>

          <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 space-y-2">
            <label className="block text-orange-900 dark:text-orange-300">Urgent Expiry Threshold (Days)</label>
            <input
              type="number"
              value={urgentDays}
              onChange={(e) => setUrgentDays(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-orange-300 dark:border-orange-800 rounded-lg text-slate-900 dark:text-white font-bold focus:outline-hidden"
            />
            <p className="text-[10px] text-orange-700 dark:text-orange-400 font-normal">Triggers URGENT 🟠 warning tier.</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2">
            <label className="block text-amber-900 dark:text-amber-300">Warning Expiry Threshold (Days)</label>
            <input
              type="number"
              value={warningDays}
              onChange={(e) => setWarningDays(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800 rounded-lg text-slate-900 dark:text-white font-bold focus:outline-hidden"
            />
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-normal">Triggers WARNING 🟧 alert tier.</p>
          </div>

          <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-900/60 space-y-2">
            <label className="block text-yellow-900 dark:text-yellow-300">Watch Expiry Threshold (Days)</label>
            <input
              type="number"
              value={watchDays}
              onChange={(e) => setWatchDays(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-yellow-300 dark:border-yellow-800 rounded-lg text-slate-900 dark:text-white font-bold focus:outline-hidden"
            />
            <p className="text-[10px] text-yellow-700 dark:text-yellow-400 font-normal">Triggers WATCH 🟨 monitoring tier.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Currency Symbol: <strong className="text-slate-900 dark:text-white font-mono">₹ (INR)</strong>
          </div>
          <Button variant="primary" type="submit" leftIcon={<Save className="w-4 h-4" />}>
            Save Settings
          </Button>
        </div>
      </form>

      {/* Role-based permissions overview */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Role-Based Access Permissions</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Active store staff roles and security scopes</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-extrabold uppercase text-[10px] text-emerald-700 dark:text-emerald-400">OWNER</div>
            <div className="font-bold text-slate-800 dark:text-slate-200">Rahul Sharma</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Full administrative access, store settings, user permissions, & financial loss reports.</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-extrabold uppercase text-[10px] text-blue-700 dark:text-blue-400">SUPERVISOR / MANAGER</div>
            <div className="font-bold text-slate-800 dark:text-slate-200">Anish Verma</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Inventory management, batch creation, sales checkout, supplier management, & directives.</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-extrabold uppercase text-[10px] text-purple-700 dark:text-purple-400">STAFF</div>
            <div className="font-bold text-slate-800 dark:text-slate-200">Priya Patel</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">POS Sales checkout, barcode scanning, stock intake, & viewing sell-first priority.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

