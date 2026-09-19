'use client';

import React, { useEffect, useState } from 'react';
import { Layers, Search, Filter, Plus, Edit2, ArrowRight } from 'lucide-react';
import { ExpiryBadge } from '@/components/ui/ExpiryBadge';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { ToastNotification } from '@/components/ui/ToastNotification';
import { EmptyState } from '@/components/ui/EmptyState';

export default function StockBatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const fetchBatches = () => {
    setLoading(true);
    fetch('/api/stock')
      .then((res) => res.json())
      .then((data) => {
        setBatches(data.batches || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleAdjustQty = async (batchId: string, delta: number) => {
    try {
      const res = await fetch('/api/stock', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId, quantityDelta: delta }),
      });
      if (res.ok) {
        setBatches(
          batches.map((b) =>
            b.id === batchId ? { ...b, quantity: Math.max(0, b.quantity + delta) } : b
          )
        );
        setToast({ type: 'success', message: `Stock batch quantity updated (${delta > 0 ? '+' : ''}${delta})` });
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to update stock quantity' });
    }
  };

  const filtered = batches.filter((b) => {
    const matchesSearch =
      b.productName.toLowerCase().includes(search.toLowerCase()) ||
      b.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.storageLocation.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !selectedStatus || b.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Batch-Level Inventory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            FEFO batch-level tracking. Each product batch maintains an independent expiry date & quantity.
          </p>
        </div>

        <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800">
          FEFO AUTO-ORDER ACTIVE
        </div>
      </div>

      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 transition-colors">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by batch number (e.g. AM-201), product, location..."
            className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 dark:text-white rounded-xl focus:outline-hidden"
          />
        </div>

        <div className="w-full md:w-56">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 dark:text-slate-200 rounded-xl focus:outline-hidden"
          >
            <option value="">All Expiry Status Tiers</option>
            <option value="CRITICAL">🔴 Critical (1-2 Days)</option>
            <option value="URGENT">🟠 Urgent (3-6 Days)</option>
            <option value="WARNING">🟧 Warning (7-14 Days)</option>
            <option value="WATCH">🟨 Watch (15-30 Days)</option>
            <option value="SAFE">🟢 Safe (&gt; 30 Days)</option>
            <option value="EXPIRED">⚪ Expired</option>
          </select>
        </div>
      </div>

      {/* Table & Mobile Responsive Layout */}
      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState title="No stock batches found" description="No inventory batches match your selected criteria." />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-6">Batch Number</th>
                    <th className="py-3.5 px-4">Product Name</th>
                    <th className="py-3.5 px-4">Storage Location</th>
                    <th className="py-3.5 px-4 text-center">Available Stock</th>
                    <th className="py-3.5 px-4">Expiry Date</th>
                    <th className="py-3.5 px-4">Expiry Status</th>
                    <th className="py-3.5 px-4 text-right">Batch Value</th>
                    <th className="py-3.5 px-6 text-center">Adjust Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                  {filtered.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                          {b.batchNumber}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{b.productName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{b.brand} • {b.category}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-semibold text-xs border border-slate-200 dark:border-slate-700">
                          {b.storageLocation}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">{b.quantity}</span>
                        <span className="text-[10px] text-slate-400 block">/ {b.initialQuantity} units</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {new Date(b.expiryDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {b.daysRemaining <= 0 ? 'Expired' : `${b.daysRemaining} days left`}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <ExpiryBadge status={b.status} />
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-slate-900 dark:text-white">
                        ₹{b.batchValue?.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleAdjustQty(b.id, -1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-extrabold text-xs text-slate-900 dark:text-white">{b.quantity}</span>
                          <button
                            onClick={() => handleAdjustQty(b.id, 1)}
                            className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 font-bold text-sm flex items-center justify-center transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="md:hidden space-y-3">
            {filtered.map((b) => (
              <div key={b.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {b.batchNumber}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{b.productName}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{b.storageLocation}</p>
                  </div>
                  <ExpiryBadge status={b.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block">Available Stock:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{b.quantity} / {b.initialQuantity} units</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block">Batch Value:</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{b.batchValue?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Expires: </span>
                    <strong className="text-slate-900 dark:text-white font-mono">{new Date(b.expiryDate).toLocaleDateString('en-IN')}</strong>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAdjustQty(b.id, -1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-extrabold text-xs text-slate-900 dark:text-white">{b.quantity}</span>
                    <button
                      onClick={() => handleAdjustQty(b.id, 1)}
                      className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-sm flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
