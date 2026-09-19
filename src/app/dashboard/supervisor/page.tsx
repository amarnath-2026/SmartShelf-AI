'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, AlertTriangle, CheckCircle2, Clock, Send, ShieldCheck, Filter, RefreshCw, Search 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ToastContainer, ToastMessage } from '@/components/ui/ToastNotification';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface BatchItem {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  mfgDate: string;
  status: string;
  storageLocation: string;
  product: {
    name: string;
    barcode: string;
    purchasePrice: number;
    sellingPrice: number;
  };
  store: {
    name: string;
    code: string;
  };
}

export default function SupervisorDashboardPage() {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchCrossStoreBatches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stock');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.batches) {
        setBatches(
          data.batches.map((b: any) => ({
            id: b.id,
            batchNumber: b.batchNumber,
            quantity: b.quantity,
            expiryDate: b.expiryDate,
            mfgDate: b.mfgDate,
            status: b.status,
            storageLocation: b.storageLocation,
            product: {
              name: b.productName,
              barcode: b.brand || '8901001',
              purchasePrice: b.purchasePrice || 0,
              sellingPrice: b.sellingPrice || 0,
            },
            store: {
              name: 'FreshMart Main Hub',
              code: 'STORE-01',
            },
          }))
        );
      }
    } catch (err) {
      console.error('Failed to fetch supervisor batch data:', err);
      addToast('error', 'Fetch Failed', 'Unable to retrieve multi-store batch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrossStoreBatches();
  }, []);

  const filteredBatches = batches.filter((b) => {
    const matchesRisk = selectedRisk === 'ALL' || b.status === selectedRisk;
    const matchesSearch = 
      b.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.store.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen font-sans transition-colors duration-200">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> Area Supervisor Command
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Multi-Store Cross-Inventory Oversight</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor real-time product quantities, batch expiration schedules, and operational health across all stores
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchCrossStoreBatches}
          isLoading={loading}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh Data
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search product, store, or batch number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {(['ALL', 'CRITICAL', 'URGENT', 'WATCH', 'SAFE'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRisk(r)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedRisk === r
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory & Expiry Table / Mobile Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
        {loading ? (
          <TableSkeleton />
        ) : filteredBatches.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Store Name</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Batch #</th>
                    <th className="py-3 px-4 text-center">Quantity</th>
                    <th className="py-3 px-4 text-center">Expiry Date</th>
                    <th className="py-3 px-4 text-center">Location</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs">
                  {filteredBatches.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.store.name}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{b.product.name}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{b.batchNumber}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{b.quantity} pcs</td>
                      <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        {new Date(b.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400">{b.storageLocation}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-block ${
                          b.status === 'CRITICAL' ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30' :
                          b.status === 'URGENT' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                          b.status === 'WATCH' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 border border-yellow-500/30' :
                          'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards */}
            <div className="md:hidden space-y-3">
              {filteredBatches.map((b) => (
                <div key={b.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{b.store.name}</span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{b.product.name}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      b.status === 'CRITICAL' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                      b.status === 'URGENT' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                      'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Batch #</span>
                      <span className="font-mono text-slate-900 dark:text-white font-bold">{b.batchNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Quantity</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{b.quantity} pcs</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Expiry Date</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{new Date(b.expiryDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Location</span>
                      <span className="text-slate-700 dark:text-slate-300">{b.storageLocation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            type="clear"
            title="No Matching Stock Batches"
            description="Adjust your search parameters or status filters to view registered inventory batches."
            actionText="Clear Filters"
            onActionClick={() => { setSelectedRisk('ALL'); setSearchQuery(''); }}
          />
        )}
      </div>
    </div>
  );
}
