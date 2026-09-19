'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
  Barcode,
  Calendar,
} from 'lucide-react';
import { ExpiryBadge } from '@/components/ui/ExpiryBadge';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { ToastContainer, ToastMessage } from '@/components/ui/ToastNotification';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = `/api/products?search=${encodeURIComponent(search)}`;
    if (selectedCategory) url += `&categoryId=${selectedCategory}`;
    if (selectedStatus) url += `&status=${selectedStatus}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        addToast('error', 'Fetch Error', 'Failed to fetch product catalog');
      });
  }, [search, selectedCategory, selectedStatus]);

  const toggleExpand = (id: string) => {
    setExpandedProductId(expandedProductId === id ? null : id);
  };

  return (
    <div className="space-y-6 pb-12 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen font-sans transition-colors duration-200">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Product Directory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage product catalog, prices, and multi-batch expiry dates
          </p>
        </div>

        <Link href="/dashboard/products/add">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Product &amp; Batches
          </Button>
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, barcode, brand..."
            className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Expiry Status Filter */}
        <div className="w-full md:w-48">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
          >
            <option value="">All Expiry Tiers</option>
            <option value="CRITICAL">Critical (1-2 Days)</option>
            <option value="URGENT">Urgent (3-6 Days)</option>
            <option value="WARNING">Warning (7-14 Days)</option>
            <option value="WATCH">Watch (15-30 Days)</option>
            <option value="SAFE">Safe (&gt; 30 Days)</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* Table / Responsive Cards / Empty State */}
      {loading ? (
        <TableSkeleton />
      ) : products.length === 0 ? (
        <EmptyState
          type="empty"
          title="No Products Found"
          description="Your search criteria did not match any inventory items. Add a new product or adjust filters."
          actionText="Add Product"
          actionHref="/dashboard/products/add"
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Product &amp; Barcode</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Brand</th>
                  <th className="py-3.5 px-4 text-center">Total Stock</th>
                  <th className="py-3.5 px-4">Nearest Expiry</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {products.map((p) => {
                  const isExpanded = expandedProductId === p.id;
                  return (
                    <React.Fragment key={p.id}>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="font-mono bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                              {p.barcode}
                            </span>
                            <span>•</span>
                            <span>{p.batchesCount} Batch(es)</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-semibold">{p.category}</td>
                        <td className="py-4 px-4 text-slate-700 dark:text-slate-300">{p.brand}</td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">{p.totalStock}</span>
                          <span className="text-[10px] text-slate-400 block">{p.unit}</span>
                        </td>
                        <td className="py-4 px-4">
                          {p.nearestExpiry ? (
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {new Date(p.nearestExpiry).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </div>
                              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                {p.daysRemaining <= 0 ? 'Expires Today' : `${p.daysRemaining} days left`}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400">No active batches</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <ExpiryBadge status={p.expiryStatus} />
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">₹{p.sellingPrice}</td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => toggleExpand(p.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-lg transition-colors cursor-pointer"
                          >
                            <span>Batches ({p.batchesCount})</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Multi-Batch Breakdown Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/60 dark:bg-slate-950/60">
                          <td colSpan={8} className="p-4 pl-12 border-t border-slate-100 dark:border-slate-800">
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                              <div className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                  <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                  <span>Batch Breakdown for {p.name}</span>
                                </span>
                                <span className="text-slate-500 dark:text-slate-400 font-normal">
                                  FEFO Sorting Active (Earliest Expiry First)
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {p.batches.map((b: any) => (
                                  <div
                                    key={b.id}
                                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between"
                                  >
                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                                          {b.batchNumber}
                                        </span>
                                        <ExpiryBadge status={b.status} />
                                      </div>
                                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        {b.quantity} / {b.initialQuantity} units available
                                      </div>
                                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        Expires:{' '}
                                        <strong className="text-slate-800 dark:text-slate-200">
                                          {new Date(b.expiryDate).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                          })}
                                        </strong>
                                      </div>
                                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Location: {b.storageLocation}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards */}
          <div className="md:hidden p-4 space-y-3">
            {products.map((p) => (
              <div key={p.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">{p.barcode} • {p.brand}</p>
                  </div>
                  <ExpiryBadge status={p.expiryStatus} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Total Stock</span>
                    <span className="font-bold text-slate-900 dark:text-white">{p.totalStock} {p.unit}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Selling Price</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{p.sellingPrice}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
