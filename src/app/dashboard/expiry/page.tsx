'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, AlertOctagon, Flame, ShieldAlert, CheckCircle2, RefreshCw, ArrowRight, Trash2, PackageCheck } from 'lucide-react';
import { ExpiryBadge } from '@/components/ui/ExpiryBadge';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { Button } from '@/components/ui/Button';
import { ToastNotification } from '@/components/ui/ToastNotification';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ExpiryAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'CRITICAL' | 'URGENT' | 'WARNING' | 'EXPIRED'>('ALL');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ batchId: string; actionType: 'DISCARDED' | 'RETURNED_TO_SUPPLIER'; productName: string } | null>(null);

  const fetchAlerts = () => {
    setLoading(true);
    fetch('/api/sell-first')
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data.sellFirstItems || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleDiscardBatch = async () => {
    if (!confirmAction) return;
    try {
      const res = await fetch('/api/stock/discard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: confirmAction.batchId, action: confirmAction.actionType }),
      });
      if (res.ok) {
        setToast({
          type: 'success',
          message: confirmAction.actionType === 'RETURNED_TO_SUPPLIER'
            ? `Stock returned to supplier for ${confirmAction.productName}`
            : `Expired batch for ${confirmAction.productName} discarded & logged in waste analytics.`,
        });
        setConfirmAction(null);
        fetchAlerts();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Error processing discard action' });
    }
  };

  const filtered = alerts.filter((item) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'EXPIRED') return item.status === 'EXPIRED' || item.status === 'EXPIRES_TODAY';
    if (activeTab === 'CRITICAL') return item.status === 'CRITICAL';
    if (activeTab === 'URGENT') return item.status === 'URGENT';
    if (activeTab === 'WARNING') return item.status === 'WARNING';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Expiry Alert & Discard Engine</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Multi-tier risk monitoring. Prioritize sellable near-expiry items or discard expired stock immediately.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors"
        >
          <span>Configure Threshold Days</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'ALL'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          All Active Alerts ({alerts.length})
        </button>

        <button
          onClick={() => setActiveTab('EXPIRED')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'EXPIRED'
              ? 'bg-gray-800 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-300 dark:border-slate-700'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5 text-red-500" />
          <span>Expired Stock (Discard Required)</span>
        </button>

        <button
          onClick={() => setActiveTab('CRITICAL')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'CRITICAL'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900'
          }`}
        >
          Critical (1-2 Days)
        </button>

        <button
          onClick={() => setActiveTab('URGENT')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'URGENT'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 border border-orange-200 dark:border-orange-900'
          }`}
        >
          Urgent (3-6 Days)
        </button>

        <button
          onClick={() => setActiveTab('WARNING')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'WARNING'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-900'
          }`}
        >
          Warning (7-14 Days)
        </button>
      </div>

      {/* List */}
      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState title="No Active Alerts in this Category" description="Your inventory is safe and well within fresh shelf life parameters." />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isExpired = item.status === 'EXPIRED' || item.daysRemaining < 0;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isExpired
                    ? 'border-gray-300 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/40'
                    : item.status === 'CRITICAL' || item.status === 'EXPIRES_TODAY'
                    ? 'border-red-300 dark:border-red-900 bg-red-50/20 dark:bg-red-950/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isExpired
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        : item.status === 'CRITICAL' || item.status === 'EXPIRES_TODAY'
                        ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                        : 'bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400'
                    }`}
                  >
                    {isExpired ? <AlertOctagon className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{item.productName}</h4>
                      <ExpiryBadge status={item.status} />
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-3">
                      <span>Batch: <strong className="font-mono text-slate-900 dark:text-slate-200">{item.batchNumber}</strong></span>
                      <span>•</span>
                      <span>Quantity: <strong className="text-slate-900 dark:text-slate-200">{item.quantity} units</strong></span>
                      <span>•</span>
                      <span>Location: {item.storageLocation}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
                      {isExpired ? (
                        <span className="text-red-700 dark:text-red-400 font-bold">
                          ⚠️ EXPIRED: Selling is prohibited in store POS checkout. Remove from display rack immediately.
                        </span>
                      ) : (
                        <span>AI Insight: {item.aiRecommendation}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Real-life Action Triggers */}
                <div className="flex items-center justify-end gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  {isExpired ? (
                    <>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setConfirmAction({ batchId: item.id, actionType: 'DISCARDED', productName: item.productName })}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                      >
                        Discard to Waste Bin
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setConfirmAction({ batchId: item.id, actionType: 'RETURNED_TO_SUPPLIER', productName: item.productName })}
                        leftIcon={<PackageCheck className="w-4 h-4" />}
                      >
                        Return to Supplier
                      </Button>
                    </>
                  ) : (
                    <Link
                      href="/dashboard/sell-first"
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Flame className="w-4 h-4" />
                      <span>SELL FIRST Queue</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <ConfirmModal
          isOpen={!!confirmAction}
          title={confirmAction.actionType === 'DISCARDED' ? 'Discard Expired Stock' : 'Return Stock to Supplier'}
          description={`Are you sure you want to ${confirmAction.actionType === 'DISCARDED' ? 'discard' : 'return'} batch stock for "${confirmAction.productName}"?`}
          confirmText={confirmAction.actionType === 'DISCARDED' ? 'Yes, Discard' : 'Yes, Return'}
          variant={confirmAction.actionType === 'DISCARDED' ? 'danger' : 'primary'}
          onConfirm={handleDiscardBatch}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}

