'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Scan, X, Camera, Package, Check, Plus, AlertCircle, Trash2, ArrowRight, Search, ShoppingBag 
} from 'lucide-react';
import Link from 'next/link';
import { safeFetchJson } from '@/lib/fetch';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [detectedProduct, setDetectedProduct] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);

  // New Batch Form Fields when adding stock for scanned item
  const [newBatchNumber, setNewBatchNumber] = useState(`B-${Date.now().toString().slice(-4)}`);
  const [addQty, setAddQty] = useState(30);
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [storageLocation, setStorageLocation] = useState('Main Shelf Rack A');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setScannedBarcode('');
      setDetectedProduct(null);
      setSearchAttempted(false);
      setSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLookupBarcode = (code: string) => {
    if (!code.trim()) return;
    setScannedBarcode(code);
    setIsSearching(true);
    setSearchAttempted(true);
    setSuccessMsg('');

    safeFetchJson(`/api/products?search=${encodeURIComponent(code.trim())}`).then(({ ok, data }) => {
      setIsSearching(false);
      if (ok && data?.products && data.products.length > 0) {
        setDetectedProduct(data.products[0]);
        setNewBatchNumber(`B-${Date.now().toString().slice(-4)}`);
      } else {
        setDetectedProduct(null);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLookupBarcode(scannedBarcode);
    }
  };

  const handleAddNewBatch = async () => {
    if (!detectedProduct) return;
    setSubmitting(true);

    try {
      // Add new batch to existing master product
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: detectedProduct.name,
          barcode: detectedProduct.barcode,
          categoryId: detectedProduct.categoryId,
          supplierId: detectedProduct.supplierId,
          brand: detectedProduct.brand,
          sellingPrice: detectedProduct.sellingPrice,
          purchasePrice: detectedProduct.purchasePrice,
          unit: detectedProduct.unit,
          batches: [
            {
              batchNumber: newBatchNumber,
              quantity: addQty,
              expiryDate,
              storageLocation,
            },
          ],
        }),
      });

      setSubmitting(false);

      if (res.ok) {
        setSuccessMsg(`✓ Added new batch (${newBatchNumber}) with ${addQty} units for ${detectedProduct.name}!`);
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1800);
      }
    } catch (err) {
      setSubmitting(false);
    }
  };

  const handleQuickSellUnit = async (batchId: string) => {
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'CASH',
          items: [
            {
              productId: detectedProduct.id,
              batchId,
              quantity: 1,
              unitPrice: detectedProduct.sellingPrice,
            },
          ],
        }),
      });
      if (res.ok) {
        setSuccessMsg(`✓ Recorded sale of 1x ${detectedProduct.name}! Stock updated.`);
        // Refresh product info
        handleLookupBarcode(detectedProduct.barcode);
      }
    } catch (err) {}
  };

  const handleDiscardExpiredBatch = async (batchId: string) => {
    try {
      const res = await fetch('/api/stock/discard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId, action: 'DISCARDED', reason: 'Scanned expired batch removed from shelf' }),
      });
      if (res.ok) {
        setSuccessMsg('✓ Expired batch removed & logged into waste analytics!');
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1800);
      }
    } catch (err) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold">Dynamic Barcode Scanner</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Hardware & Manual Barcode Scanner Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Scan Barcode (Camera or Handheld Hardware Reader)
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={inputRef}
                  type="text"
                  value={scannedBarcode}
                  onChange={(e) => setScannedBarcode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Scan or type barcode (e.g. 8901262010012)..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              <button
                onClick={() => handleLookupBarcode(scannedBarcode)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
              >
                Lookup
              </button>
            </div>
          </div>

          {/* Camera Viewfinder Mockup */}
          <div className="relative w-full h-40 bg-slate-950 rounded-xl border-2 border-emerald-500/50 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-red-500 shadow-glow-red animate-pulse" />

            <Camera className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs text-slate-400 font-semibold">Live Camera Scanner Active</p>

            <div className="absolute bottom-2.5 flex items-center gap-1.5 z-10 flex-wrap justify-center px-2">
              <span className="text-[10px] font-bold text-slate-400">Quick Scan Demo:</span>
              <button
                onClick={() => handleLookupBarcode('8901262010012')}
                className="px-2 py-0.5 text-[10px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-700 rounded hover:bg-emerald-900"
              >
                Milk (8901262...)
              </button>
              <button
                onClick={() => handleLookupBarcode('8901063012015')}
                className="px-2 py-0.5 text-[10px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-700 rounded hover:bg-emerald-900"
              >
                Bread (8901063...)
              </button>
              <button
                onClick={() => handleLookupBarcode('8901058005517')}
                className="px-2 py-0.5 text-[10px] font-bold text-red-300 bg-red-950 border border-red-700 rounded hover:bg-red-900"
              >
                Expired (8901058...)
              </button>
            </div>
          </div>

          {/* Scanned Result & Dynamic Action Area */}
          {searchAttempted && (
            <div className="space-y-3">
              {isSearching ? (
                <div className="p-4 text-center text-xs text-slate-500 animate-pulse">
                  Querying store database for barcode <span className="font-mono">{scannedBarcode}</span>...
                </div>
              ) : detectedProduct ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 rounded">
                        Product Identified
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">{detectedProduct.name}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Barcode: <span className="font-mono">{detectedProduct.barcode}</span> • Brand: {detectedProduct.brand}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">₹{detectedProduct.sellingPrice}</span>
                      <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Stock: {detectedProduct.totalStock || 0} units</div>
                    </div>
                  </div>

                  {/* Existing Batches Preview */}
                  {detectedProduct.batches && detectedProduct.batches.length > 0 && (
                    <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Available Batches in Inventory:
                      </div>
                      {detectedProduct.batches.map((b: any) => (
                        <div key={b.id} className="flex items-center justify-between text-[11px] font-medium p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">Batch #{b.batchNumber}</span>
                            <span className="text-slate-500 ml-2">({b.quantity} units)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={b.status === 'EXPIRED' ? 'text-red-500 font-bold' : 'text-slate-600 dark:text-slate-300'}>
                              Exp: {new Date(b.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                            {b.status === 'EXPIRED' ? (
                              <button
                                onClick={() => handleDiscardExpiredBatch(b.id)}
                                className="px-2 py-0.5 bg-red-600 text-white font-bold text-[10px] rounded hover:bg-red-700"
                              >
                                Discard
                              </button>
                            ) : (
                              <button
                                onClick={() => handleQuickSellUnit(b.id)}
                                className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded flex items-center gap-1"
                                title="Record 1 unit sale"
                              >
                                <ShoppingBag className="w-3 h-3" /> Quick Sell 1x
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Form to Add New Batch for Scanned Stock */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Receive New Inventory Batch:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold">New Batch #</label>
                        <input
                          type="text"
                          value={newBatchNumber}
                          onChange={(e) => setNewBatchNumber(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold">Quantity (Units)</label>
                        <input
                          type="number"
                          value={addQty}
                          onChange={(e) => setAddQty(parseInt(e.target.value) || 1)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-red-600 dark:text-red-400 font-bold">Expiry Date *</label>
                        <input
                          type="date"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-red-300 dark:border-red-500/50 rounded-lg font-bold text-red-700 dark:text-red-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold">Storage Location</label>
                        <input
                          type="text"
                          value={storageLocation}
                          onChange={(e) => setStorageLocation(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-medium"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleAddNewBatch}
                      disabled={submitting}
                      className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{submitting ? 'Adding Batch...' : 'Add Stock Batch To Inventory'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-xs">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300">New Product Detected</h4>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
                        Barcode <span className="font-mono font-bold">{scannedBarcode}</span> is not registered in your directory yet.
                      </p>
                      <Link
                        href={`/dashboard/products?newBarcode=${scannedBarcode}`}
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create New Master Product</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-600 text-white font-bold text-xs rounded-xl text-center animate-in fade-in">
                  {successMsg}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
