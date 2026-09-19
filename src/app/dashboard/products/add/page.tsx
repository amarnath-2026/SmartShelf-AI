'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  Package,
  Layers,
  Barcode,
  Sparkles,
} from 'lucide-react';

function AddProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialBarcode = searchParams.get('barcode') || '';

  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState(initialBarcode || `8901${Math.floor(100000000 + Math.random() * 900000000)}`);
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [unit, setUnit] = useState('pack');

  // Multi-Batch Fields
  const [batches, setBatches] = useState<Array<{
    batchNumber: string;
    quantity: number;
    mfgDate: string;
    expiryDate: string;
    storageLocation: string;
  }>>([
    {
      batchNumber: `B-${Date.now().toString().slice(-4)}`,
      quantity: 30,
      mfgDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      storageLocation: 'Main Shelf Rack 1',
    },
  ]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
          setCategoryId(data.categories[0].id);
        }
      })
      .catch(() => {});

    fetch('/api/suppliers')
      .then((res) => res.json())
      .then((data) => {
        if (data.suppliers && data.suppliers.length > 0) {
          setSuppliers(data.suppliers);
          setSupplierId(data.suppliers[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddBatchRow = () => {
    setBatches([
      ...batches,
      {
        batchNumber: `B-${(Date.now() + batches.length).toString().slice(-4)}`,
        quantity: 20,
        mfgDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        storageLocation: 'Warehouse Bay 2',
      },
    ]);
  };

  const handleRemoveBatchRow = (index: number) => {
    if (batches.length <= 1) return;
    setBatches(batches.filter((_, i) => i !== index));
  };

  const handleBatchChange = (index: number, field: string, value: any) => {
    const updated = [...batches];
    updated[index] = { ...updated[index], [field]: value };
    setBatches(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !barcode || !categoryId) {
      setErrorMsg('Please fill in required fields (Product Name, Barcode, Category)');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          barcode,
          brand,
          categoryId,
          supplierId,
          purchasePrice,
          sellingPrice,
          unit,
          batches,
        }),
      });

      const data = await response.json();
      setSubmitting(false);

      if (response.ok) {
        router.push('/dashboard/products');
      } else {
        setErrorMsg(data.error || 'Failed to create product');
      }
    } catch (err: any) {
      setSubmitting(false);
      setErrorMsg(err.message || 'Error creating product');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-3 pb-6 border-b border-slate-200 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Add New Product & Multi-Batches</h1>
          <p className="text-xs text-slate-500">
            Input product details and specify batch-level expiry dates for FEFO inventory rotation
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 mb-6 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Product Master Information */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            1. Master Product Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Amul Taaza Toned Milk 500ml"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Barcode (EAN/UPC) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  required
                  placeholder="8901262010012"
                  className="w-full pl-3.5 pr-20 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setBarcode(`8901${Math.floor(100000000 + Math.random() * 900000000)}`)}
                  className="absolute right-2 top-2 px-2 py-1 text-[10px] font-extrabold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded"
                >
                  Gen Barcode
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Amul"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="28.00"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Purchase Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="24.00"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Multi-Batch Inventory Tracking */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>2. Initial Inventory Batches (FEFO Tracking)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Never assign one expiry date to all stock. Add multiple batches with unique expiry dates.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddBatchRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Batch</span>
            </button>
          </div>

          {/* Batch Rows */}
          <div className="space-y-3">
            {batches.map((batch, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-6 gap-3 items-end relative"
              >
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={batch.batchNumber}
                    onChange={(e) => handleBatchChange(idx, 'batchNumber', e.target.value)}
                    required
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Quantity (Units)</label>
                  <input
                    type="number"
                    value={batch.quantity}
                    onChange={(e) => handleBatchChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                    required
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Mfg Date</label>
                  <input
                    type="date"
                    value={batch.mfgDate}
                    onChange={(e) => handleBatchChange(idx, 'mfgDate', e.target.value)}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-bold text-red-600 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    value={batch.expiryDate}
                    onChange={(e) => handleBatchChange(idx, 'expiryDate', e.target.value)}
                    required
                    className="w-full px-2 py-2 bg-white border border-red-300 rounded-lg text-xs font-bold text-red-700"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Storage Location</label>
                  <input
                    type="text"
                    value={batch.storageLocation}
                    onChange={(e) => handleBatchChange(idx, 'storageLocation', e.target.value)}
                    placeholder="Rack A"
                    className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  {batches.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBatchRow(idx)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove batch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
          <Link
            href="/dashboard/products"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm transition-all"
          >
            {submitting ? 'Saving Product...' : 'Save Product & Batches'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product Directory</span>
        </Link>
      </div>

      <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading form...</div>}>
        <AddProductForm />
      </Suspense>
    </div>
  );
}
