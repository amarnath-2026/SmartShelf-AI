'use client';

import React, { useEffect, useState } from 'react';
import { Flame, Sparkles, TrendingDown, CheckCircle, ArrowRight, AlertTriangle, Percent, ShoppingCart } from 'lucide-react';
import { ExpiryBadge } from '@/components/ui/ExpiryBadge';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { ToastNotification } from '@/components/ui/ToastNotification';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export default function SellFirstPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  useEffect(() => {
    fetch('/api/sell-first')
      .then((res) => res.json())
      .then((data) => {
        setItems(data.sellFirstItems || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleApplyAction = (productName: string, actionText: string) => {
    setToast({
      type: 'success',
      message: `Applied: ${actionText} for ${productName}`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-8 rounded-3xl shadow-xl shadow-orange-950/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold mb-3">
            <Flame className="w-4 h-4 text-orange-200 animate-pulse" />
            <span>FEFO FIRST EXPIRY FIRST OUT HUB</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight mb-2">Sell First Hub</h1>
          <p className="text-orange-100 text-sm leading-relaxed">
            Products & batches prioritized automatically using FEFO risk scoring, days remaining, quantity, and estimated unsold leftover calculations.
          </p>
        </div>
      </div>

      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Items List */}
      {items.length === 0 ? (
        <EmptyState title="No Urgent Items Needing Priority Sale Today" description="All inventory items are well within safe shelf life parameters." />
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border p-6 shadow-xs transition-all ${
                idx === 0
                  ? 'border-orange-400 ring-2 ring-orange-400/20 shadow-lg'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left Product Info */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      idx === 0
                        ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Flame className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {idx === 0 && (
                        <span className="px-2.5 py-0.5 text-[10px] font-black text-white bg-orange-600 rounded uppercase tracking-wider animate-pulse">
                          🔥 #1 HIGHEST PRIORITY
                        </span>
                      )}
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">{item.productName}</h3>
                      <ExpiryBadge status={item.status} />
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <span>Brand: <strong className="text-slate-900 dark:text-slate-200">{item.brand}</strong></span>
                      <span>•</span>
                      <span>Batch: <strong className="font-mono text-slate-900 dark:text-slate-200">{item.batchNumber}</strong></span>
                      <span>•</span>
                      <span>Quantity: <strong className="text-slate-900 dark:text-white text-sm">{item.quantity} units</strong></span>
                      <span>•</span>
                      <span>Selling Price: <strong className="text-slate-900 dark:text-white">₹{item.sellingPrice}</strong></span>
                    </div>

                    {/* AI Expiry Risk Scoring Card */}
                    <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>AI Expiry Risk Analysis</span>
                        </span>
                        <span className="px-2 py-0.5 font-black text-[11px] text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/60 rounded border border-orange-200 dark:border-orange-800">
                          Risk Score: {item.riskScore} / 100
                        </span>
                      </div>

                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        {item.aiRecommendation}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700 text-[11px]">
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block">Days Remaining:</span>
                          <strong className="text-slate-900 dark:text-white font-bold">
                            {item.daysRemaining <= 0 ? 'Expires Today' : `${item.daysRemaining} Day(s)`}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block">Est. Leftover Unsold:</span>
                          <strong className="text-orange-600 dark:text-orange-400 font-bold">{item.expectedLeftover} units</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block">Financial Value at Risk:</span>
                          <strong className="text-red-600 dark:text-red-400 font-bold">₹{item.potentialLoss?.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Action Triggers */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-800">
                  <Button
                    variant="amber"
                    size="sm"
                    onClick={() => handleApplyAction(item.productName, 'Marked Priority SELL FIRST on Shelf')}
                    leftIcon={<Flame className="w-4 h-4" />}
                  >
                    Mark as Priority
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleApplyAction(item.productName, '25% Promotional Discount Tag')}
                    leftIcon={<Percent className="w-3.5 h-3.5 text-amber-500" />}
                  >
                    Apply 25% Promo
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleApplyAction(item.productName, '50% Flash Sale Tag')}
                  >
                    Apply 50% Flash Sale
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

