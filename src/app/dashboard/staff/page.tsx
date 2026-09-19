'use client';

import React, { useState, useEffect } from 'react';
import { 
  Scan, PackagePlus, Send, CheckCircle2, AlertCircle, ShoppingCart, 
  Sparkles, Calendar, Layers, Clock, ArrowRight, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ToastContainer, ToastMessage } from '@/components/ui/ToastNotification';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface Directive {
  id: string;
  title: string;
  message: string;
  priority: string;
  status: string;
  createdAt: string;
  createdBy?: { name: string; role: string };
}

export default function StaffDashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [directives, setDirectives] = useState<Directive[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Confirmation modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    directiveId: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    directiveId: '',
  });

  // Stock Ingestion Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStock, setNewStock] = useState({
    name: '',
    barcode: '',
    batchNumber: '',
    quantity: 50,
    mfgDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    purchasePrice: 20,
    sellingPrice: 28,
    storageLocation: 'Front Display Shelf',
  });

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch session & store directives
  const loadStaffPortal = async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me').then((r) => r.json());
      if (meRes.user) {
        setSession(meRes.user);

        // Fetch directives for this store
        const dirRes = await fetch(`/api/directives?storeId=${meRes.user.storeId}`).then((r) => r.json());
        if (dirRes.directives) {
          setDirectives(dirRes.directives);
        }
      }
    } catch (err) {
      console.error('Failed to load staff portal data:', err);
      addToast('error', 'Fetch Error', 'Failed to load store directives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffPortal();
  }, []);

  // Complete a directive with confirmation
  const handleCompleteDirective = async () => {
    const id = confirmConfig.directiveId;
    if (!id) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/directives', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'COMPLETED' }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', 'Action Executed', 'Directive marked as completed');
        setConfirmConfig({ ...confirmConfig, isOpen: false });
        loadStaffPortal();
      } else {
        addToast('error', 'Execution Failed', data.error || 'Failed to update status');
      }
    } catch (err) {
      addToast('error', 'Server Error', 'Failed to execute directive');
    } finally {
      setSubmitting(false);
    }
  };

  // Add stock submission
  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/stock/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newStock,
          storeId: session?.storeId,
        }),
      });
      const data = await res.json();
      if (data.success || res.ok) {
        setShowAddModal(false);
        addToast('success', 'Stock Batch Ingested', `${newStock.name} (Batch #${newStock.batchNumber}) saved`);
        setNewStock({
          name: '',
          barcode: '',
          batchNumber: '',
          quantity: 50,
          mfgDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          purchasePrice: 20,
          sellingPrice: 28,
          storageLocation: 'Front Display Shelf',
        });
        loadStaffPortal();
      } else {
        addToast('error', 'Ingestion Failed', data.error || 'Failed to add stock');
      }
    } catch (err) {
      addToast('error', 'Server Error', 'Error saving stock');
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
        variant="amber"
        confirmText="Confirm Execution"
        isLoading={submitting}
        onConfirm={handleCompleteDirective}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <PackagePlus className="w-4 h-4" /> Store Operations Staff
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {session?.storeName || 'Store Ingestion & Directives Portal'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Store Code: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{session?.storeCode || 'STORE-001'}</span> | Scoped single-store inventory intake &amp; action directives
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setShowAddModal(true)}
          leftIcon={<PackagePlus className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          Ingest New Item &amp; Batch
        </Button>
      </div>

      {/* SECTION 1: INTIMATION & ACTION DIRECTIVES INBOX */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Send className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Owner &amp; Supervisor Directives Inbox
          </h2>
          <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 font-bold">
            {directives.filter((d) => d.status === 'PENDING').length} Pending Relocation Actions
          </span>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : directives.length > 0 ? (
          <div className="space-y-3">
            {directives.map((d) => (
              <div
                key={d.id}
                className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                  d.status === 'COMPLETED'
                    ? 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-slate-50 dark:bg-slate-950 border-amber-500/30 shadow-xs'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        d.priority === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {d.priority} DIRECTIVE
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      From: {d.createdBy?.name || 'Owner'}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{d.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{d.message}</p>
                </div>

                <div>
                  {d.status === 'COMPLETED' ? (
                    <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Action Completed
                    </span>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        setConfirmConfig({
                          isOpen: true,
                          title: `Confirm Directive Execution: "${d.title}"`,
                          description: 'Confirm that you have physically relocated the items to the designated shelf or applied the requested promotional tag.',
                          directiveId: d.id,
                        })
                      }
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Mark Action Executed
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            type="clear"
            title="All Directives Completed"
            description="Your store inbox has no pending relocation actions or expiry alerts."
          />
        )}
      </div>

      {/* SECTION 2: QUICK INVENTORY ACTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <Scan className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Barcode &amp; Item Intake</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Scan product barcodes and record manufacturing/expiry dates into store database.</p>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={() => setShowAddModal(true)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="mt-4 w-full"
          >
            Scan / Ingest Item
          </Button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
              <Tag className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">FIFO Shelf Placement</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ensure older stock batches are placed in front row to minimize expiration waste.</p>
          </div>
          <a href="/dashboard/sell-first" className="mt-4 w-full">
            <Button
              variant="secondary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full"
            >
              View Sell-First Queue
            </Button>
          </a>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">POS Sales Checkout</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Record customer purchases to automatically deduct batch inventory stock.</p>
          </div>
          <a href="/dashboard/sales" className="mt-4 w-full">
            <Button
              variant="secondary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full"
            >
              Open POS Terminal
            </Button>
          </a>
        </div>
      </div>

      {/* INGEST ITEM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl text-slate-900 dark:text-white">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-emerald-500" /> Intake Item &amp; Batch into Store DB
            </h3>

            <form onSubmit={handleAddStock} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Amul Butter 500g"
                  value={newStock.name}
                  onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Barcode *</label>
                  <input
                    type="text"
                    required
                    placeholder="8901262010012"
                    value={newStock.barcode}
                    onChange={(e) => setNewStock({ ...newStock, barcode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="BT-909"
                    value={newStock.batchNumber}
                    onChange={(e) => setNewStock({ ...newStock, batchNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    value={newStock.quantity}
                    onChange={(e) => setNewStock({ ...newStock, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={newStock.expiryDate}
                    onChange={(e) => setNewStock({ ...newStock, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={submitting}
                >
                  Save Batch to Database
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
