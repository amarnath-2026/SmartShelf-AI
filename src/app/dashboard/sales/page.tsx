'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2, Receipt, CreditCard, DollarSign, Scan, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { ToastNotification } from '@/components/ui/ToastNotification';
import { EmptyState } from '@/components/ui/EmptyState';
import { BarcodeScannerModal } from '@/components/scanner/BarcodeScannerModal';

export default function SalesPOSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Array<{ product: any; quantity: number }>>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI'>('CASH');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [isCheckout, setIsCheckout] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = (product: any) => {
    if (product.expiryStatus === 'EXPIRED') {
      setToast({
        type: 'error',
        message: `Safety Block: "${product.name}" has expired! Cannot sell expired stock.`,
      });
      return;
    }

    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.totalStock) {
        setToast({ type: 'warning', message: `Cannot add more units than total available stock (${product.totalStock}).` });
        return;
      }
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    setToast({ type: 'success', message: `Added ${product.name} to cart` });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as any
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.product.sellingPrice, 0);

  const handleCompleteCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckout(true);

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          paymentMethod,
          customerName,
        }),
      });

      const data = await response.json();
      setIsCheckout(false);

      if (response.ok) {
        setReceipt(data);
        setCart([]);
        setToast({ type: 'success', message: 'Sale completed & FEFO batch stock updated!' });
        fetchProducts();
      } else {
        setToast({ type: 'error', message: data.error || 'Failed to process sale' });
      }
    } catch (err: any) {
      setIsCheckout(false);
      setToast({ type: 'error', message: 'Error connecting to sales server' });
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Point of Sale (FEFO Terminal)</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System automatically deducts stock from earliest expiring active batches. Expired batches are strictly blocked.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsScannerOpen(true)}
            leftIcon={<Scan className="w-4 h-4 text-emerald-500" />}
          >
            Scan Barcode At Counter
          </Button>
        </div>
      </div>

      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Product Catalog Picker (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Select Product Catalog</h3>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                FEFO Auto-Select Active
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : products.length === 0 ? (
              <EmptyState title="No products found" description="Add products to your catalog to start sales transactions." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
                {products.map((p) => {
                  const isExpired = p.expiryStatus === 'EXPIRED';
                  return (
                    <div
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                        isExpired
                          ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 opacity-80'
                          : 'bg-slate-50/50 dark:bg-slate-800/40 hover:bg-emerald-50/60 dark:hover:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-600 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-400">
                            {p.name}
                          </div>
                          {isExpired && (
                            <span className="px-1.5 py-0.5 text-[9px] font-extrabold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/80 rounded">
                              EXPIRED
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {p.brand} • Stock: {p.totalStock} units
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-2.5 border-t border-slate-200/60 dark:border-slate-800">
                        <span className="text-base font-black text-slate-900 dark:text-white">₹{p.sellingPrice}</span>
                        <span
                          className={`px-3 py-1 font-extrabold text-[10px] rounded-lg transition-colors ${
                            isExpired
                              ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 cursor-not-allowed'
                              : 'bg-emerald-600 group-hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          {isExpired ? '⚠️ Expired (Blocked)' : '+ Add Item'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Active Cart & Invoice Summary (Col 5) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Current Order Cart</span>
              </h3>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700">
                {cart.length} item(s)
              </span>
            </div>

            {/* Cart Items List */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
                  Cart is empty. Click any product from catalog or scan barcode to add.
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{item.product.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">₹{item.product.sellingPrice} × {item.quantity}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateCartQty(item.product.id, -1)}
                          className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.product.id, 1)}
                          className="w-6 h-6 rounded bg-emerald-200 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 font-bold flex items-center justify-center hover:bg-emerald-300 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        ₹{item.quantity * item.product.sellingPrice}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment Details & Complete Order */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-6 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2 rounded-xl border transition-all ${
                    paymentMethod === 'CASH'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  💵 Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`py-2 rounded-xl border transition-all ${
                    paymentMethod === 'CARD'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  💳 Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`py-2 rounded-xl border transition-all ${
                    paymentMethod === 'UPI'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  📲 UPI
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total Amount:</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">₹{cartTotal.toLocaleString()}</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={cart.length === 0}
              isLoading={isCheckout}
              onClick={handleCompleteCheckout}
              leftIcon={<Receipt className="w-4 h-4" />}
            >
              Complete Sale & Deduct FEFO Stock
            </Button>
          </div>
        </div>
      </div>

      {/* Sale Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Sale Completed!</h3>
              <p className="text-xs text-slate-500 font-mono">Invoice #{receipt.invoiceNo}</p>
            </div>

            <div className="text-xs space-y-2 max-h-48 overflow-y-auto">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">FEFO Batches Auto-Deducted:</div>
              {receipt.items?.map((it: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-slate-900 dark:text-white">{it.productName}</div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    Batch: <strong className="font-mono">{it.batchNumber}</strong> ({it.quantity} units deducted)
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm font-bold">
              <span className="text-slate-700 dark:text-slate-300">Total Paid:</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-xl font-black">₹{receipt.totalAmount}</span>
            </div>

            <Button variant="secondary" className="w-full" onClick={() => setReceipt(null)}>
              Done & Print Receipt
            </Button>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </div>
  );
}
