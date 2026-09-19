'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Package, Layers, Users, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { safeFetchJson } from '@/lib/fetch';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any>({ products: [], suppliers: [], alerts: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!search.trim()) {
      setResults({ products: [], suppliers: [], alerts: [] });
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      safeFetchJson(`/api/products?search=${encodeURIComponent(search)}`).then(({ ok, data }) => {
        if (ok && data) {
          setResults({
            products: data.products || [],
            suppliers: [],
            alerts: [],
          });
        }
        setLoading(false);
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, barcodes (e.g. 8901262), brands, batches..."
            className="w-full bg-transparent text-slate-900 text-sm focus:outline-hidden placeholder:text-slate-400 font-medium"
            autoFocus
          />
          {search && (
            <button onClick={() => setSearch('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 divide-y divide-slate-100">
          {!search.trim() ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Type product name (e.g. <span className="font-semibold text-slate-600">Milk</span>), barcode (e.g. <span className="font-semibold text-slate-600">8901262</span>), or brand.
            </div>
          ) : loading ? (
            <div className="py-8 text-center text-xs text-slate-500 animate-pulse">
              Searching SmartShelf database...
            </div>
          ) : results.products.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No products or batches found for &quot;{search}&quot;
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                Products & Batches ({results.products.length})
              </div>
              {results.products.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/dashboard/products`}
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50/60 border border-transparent hover:border-emerald-100 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-800">
                        {p.name}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>Barcode: {p.barcode}</span>
                        <span>•</span>
                        <span>Stock: {p.totalStock} units</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-slate-900">₹{p.sellingPrice}</span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
