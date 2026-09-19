'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  Bell,
  Layers,
  Bot,
  TrendingDown,
  CheckCircle2,
  Package,
  Calendar,
  Zap,
  Building,
  Scan,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Sliders,
  DollarSign,
  Store,
  Check,
  X,
  Play,
  RotateCcw,
  CheckCircle,
  AlertOctagon,
  Sun,
  Moon,
} from 'lucide-react';
import { formatNumber } from '@/lib/format';
import { useTheme } from '@/components/theme/ThemeProvider';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [fefoMode, setFefoMode] = useState<'STANDARD' | 'FEFO' | 'AI_RISK' | 'POS_SAFETY'>('FEFO');

  // Interactive ROI Calculator State
  const [storeCapital, setStoreCapital] = useState(500000);
  const estimatedWastageWithoutFEFO = Math.round(storeCapital * 0.042);
  const estimatedSavingsWithSmartShelf = Math.round(estimatedWastageWithoutFEFO * 0.85);

  // Dynamic Barcode Simulator
  const [simulatedBarcode, setSimulatedBarcode] = useState('8901262010012');
  const [scannedResult, setScannedResult] = useState<any>({
    name: 'Amul Taaza Toned Milk 500ml',
    batch: 'AM-201',
    expiry: '2 Days Remaining',
    status: 'CRITICAL',
    action: 'SELL FIRST PRIORITY',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSimulateScan = (code: string) => {
    setSimulatedBarcode(code);
    if (code === '8901262010012') {
      setScannedResult({
        name: 'Amul Taaza Toned Milk 500ml',
        batch: 'AM-201',
        expiry: '2 Days Remaining',
        status: 'CRITICAL',
        action: 'SELL FIRST PRIORITY (Marked 25% Promo)',
      });
    } else if (code === '8901063012015') {
      setScannedResult({
        name: 'Britannia White Sandwich Bread 400g',
        batch: 'BR-102',
        expiry: 'Expires Tomorrow',
        status: 'URGENT',
        action: 'SELL FIRST PRIORITY (#1 End-Cap)',
      });
    } else if (code === '8901058005517') {
      setScannedResult({
        name: 'Nestlé Everyday Dairy Whitener 200g',
        batch: 'NE-009',
        expiry: 'Expired 2 Days Ago',
        status: 'EXPIRED',
        action: '🚫 POS SALE BLOCKED! Discard Stock',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white overflow-x-hidden transition-colors duration-200">
      {/* 1. Announcement Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 dark:from-emerald-950 dark:via-emerald-900 dark:to-slate-950 border-b border-emerald-700/40 text-emerald-100 text-xs py-2.5 px-4 text-center font-bold flex items-center justify-center gap-2"
      >
        <span className="px-2 py-0.5 bg-emerald-400 text-slate-950 text-[10px] font-black uppercase rounded animate-pulse">
          LIVE DEMO
        </span>
        <span>SmartShelf FEFO 2.0: Multi-Store Engine &amp; Barcode Auto-Scan Active!</span>
        <Link href="/dashboard/owner" className="underline font-black hover:text-white flex items-center gap-0.5 ml-1">
          Launch Owner Portal <ArrowRight className="w-3 h-3 inline" />
        </Link>
      </motion.div>

      {/* 2. Top Header Navigation */}
      <nav className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/30"
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">SmartShelf</span>
              <span className="text-xl font-black text-emerald-500"> AI</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#dynamic-demo" className="hover:text-emerald-500 transition-colors">Interactive Engine</a>
            <a href="#pillars" className="hover:text-emerald-500 transition-colors">3 Technology Pillars</a>
            <a href="#roi-calculator" className="hover:text-emerald-500 transition-colors">Wastage Calculator</a>
            <a href="#comparison" className="hover:text-emerald-500 transition-colors">Before vs After</a>
          </div>

          <div className="flex items-center gap-3">
            {/* THEME SWITCHER TOGGLE BUTTON */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200 dark:border-slate-800"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/dashboard/owner"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950/20 flex items-center gap-1.5"
              >
                <span>Launch Live Platform</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* 3. Hero Section */}
      <section className="relative pt-20 pb-24 bg-gradient-to-b from-slate-100 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-emerald-500/10 blur-[160px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold mb-8 shadow-xs"
          >
            <Building className="w-4 h-4 text-emerald-500" />
            <span>COMMERCIAL SUPERMARKET INVENTORY PLATFORM</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-none max-w-5xl mx-auto mb-8"
          >
            Know What Expires.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600">
              Sell It First.
            </span>{' '}
            Waste Less.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-normal"
          >
            The intelligent FEFO platform that prevents supermarket product wastage, automates batch-level expiry monitoring, blocks expired POS checkouts, and boosts retail profitability.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              href="/dashboard/owner"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-xl shadow-emerald-950/20 flex items-center justify-center gap-3 transition-all hover:scale-105"
            >
              <span>Start Managing Store Stock</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/dashboard/staff"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-sm rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Scan className="w-4 h-4 text-emerald-500" />
              <span>Staff Operations Intake</span>
            </Link>
          </motion.div>

          {/* Key Metric Tickers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left mb-16">
            {[
              { label: 'Avg Saved / Mo', value: '₹18,700', sub: 'Stock rescued from expiry' },
              { label: 'Wastage Reduced', value: '68%', sub: 'Automated FEFO rotation' },
              { label: 'Expired Sales', value: '0%', sub: 'POS Safety Block active' },
              { label: 'Expiry Engine', value: '100% Real-Time', sub: 'Batch-level tracking' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                whileHover={{ y: -4 }}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md"
              >
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{stat.label}</div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stat.value}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{stat.sub}</div>
              </motion.div>
            ))}
          </div>

          {/* 4. DYNAMIC INTERACTIVE ENGINE VISUALIZER */}
          <section id="dynamic-demo" className="scroll-mt-24">
            <div className="max-w-5xl mx-auto rounded-3xl p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl relative text-left">
              <div className="flex flex-col md:flex-row items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Interactive Dynamic Engine Visualizer</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Switch mode to see how SmartShelf algorithms respond in real time</p>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
                  <button
                    onClick={() => setFefoMode('FEFO')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      fefoMode === 'FEFO'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    🔥 FEFO Mode
                  </button>
                  <button
                    onClick={() => setFefoMode('AI_RISK')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      fefoMode === 'AI_RISK'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    🤖 AI Risk Matrix
                  </button>
                  <button
                    onClick={() => setFefoMode('POS_SAFETY')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      fefoMode === 'POS_SAFETY'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    🚫 POS Block
                  </button>
                </div>
              </div>

              <div className="pt-6 min-h-[220px]">
                <AnimatePresence mode="wait">
                  {fefoMode === 'FEFO' && (
                    <motion.div
                      key="fefo"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left"
                    >
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-orange-500/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 text-[10px] font-black bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-800 rounded">
                            🔥 #1 SELL FIRST
                          </span>
                          <span className="font-mono text-xs text-slate-500">BR-102</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">Britannia White Bread 400g</h4>
                        <div className="text-xs text-slate-500 dark:text-slate-400">15 units remaining • Rack 1</div>
                        <div className="pt-2 text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                          <span>Expires Tomorrow</span>
                          <span className="px-2.5 py-1 bg-orange-600 text-white text-[10px] rounded font-black">ROTATED UPFRONT</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-red-500/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 text-[10px] font-black bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800 rounded">
                            🔴 #2 CRITICAL
                          </span>
                          <span className="font-mono text-xs text-slate-500">AM-201</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">Amul Taaza Milk 500ml</h4>
                        <div className="text-xs text-slate-500 dark:text-slate-400">20 units remaining • Cold Room</div>
                        <div className="pt-2 text-xs font-bold text-red-600 dark:text-red-400 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                          <span>Expires in 2 days</span>
                          <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] rounded font-black">SELL FIRST</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-emerald-500/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 rounded">
                            🟢 SAFE TIER
                          </span>
                          <span className="font-mono text-xs text-slate-500">AM-203</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">Amul Milk (Fresh Batch)</h4>
                        <div className="text-xs text-slate-500 dark:text-slate-400">60 units • Warehouse Bay</div>
                        <div className="pt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                          <span>Expires in 18 days</span>
                          <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] rounded font-bold">Main Warehouse</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {fefoMode === 'AI_RISK' && (
                    <motion.div
                      key="ai_risk"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.3 }}
                      className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-emerald-500/40 text-left space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bot className="w-5 h-5 text-emerald-500 animate-pulse" />
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">ShelfSense AI Risk Scoring &amp; Leftover Prediction</h4>
                        </div>
                        <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs font-black">
                          Risk Score: 88.5 / 100
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        🔥 <strong>AI PREDICTION</strong>: Based on average sales velocity (4 units/day) vs 20 units remaining in Batch AM-201, <strong>8 units are predicted to remain unsold before expiry</strong>. Apply a 25% promotional discount immediately.
                      </p>

                      <div className="grid grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                        <div className="bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-500 block text-[10px]">Sales Velocity:</span>
                          <strong className="text-slate-900 dark:text-white font-mono">4.2 units / day</strong>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-500 block text-[10px]">Expected Leftover:</span>
                          <strong className="text-orange-500 font-mono">8 units unsold</strong>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-500 block text-[10px]">Action Recommended:</span>
                          <strong className="text-emerald-500 font-mono">Apply 25% Promo Tag</strong>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {fefoMode === 'POS_SAFETY' && (
                    <motion.div
                      key="pos_safety"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.3 }}
                      className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-red-500/50 text-left space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-red-500">
                          <AlertOctagon className="w-5 h-5 animate-bounce" />
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">POS Counter Expired Item Prevention</h4>
                        </div>
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800 rounded-lg text-xs font-black">
                          CHECKOUT BLOCKED
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-xs text-red-700 dark:text-red-200 space-y-1">
                        <div className="font-bold text-sm text-red-600 dark:text-red-400">⚠️ REAL-LIFE SAFETY RULE TRIGGERED:</div>
                        <p>
                          Customer scanned <strong>Nestlé Everyday Dairy Whitener 200g (Batch NE-009)</strong> which expired 2 days ago. System strictly prevents checkout. Item cannot be sold.
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <Link
                          href="/dashboard/staff"
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-xs"
                        >
                          Discard Stock &amp; Log Loss
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* 5. Interactive Barcode Scanner Simulation Widget */}
          <div className="max-w-4xl mx-auto mt-16 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Interactive Barcode Scan Simulator</h3>
              </div>
              <span className="text-xs text-slate-500">Test barcode scan receiving &amp; lookup</span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => handleSimulateScan('8901262010012')}
                className={`px-3 py-1.5 rounded-lg border font-mono font-bold transition-all ${
                  simulatedBarcode === '8901262010012'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800'
                }`}
              >
                Scan Milk (8901262...)
              </button>
              <button
                onClick={() => handleSimulateScan('8901063012015')}
                className={`px-3 py-1.5 rounded-lg border font-mono font-bold transition-all ${
                  simulatedBarcode === '8901063012015'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800'
                }`}
              >
                Scan Bread (8901063...)
              </button>
              <button
                onClick={() => handleSimulateScan('8901058005517')}
                className={`px-3 py-1.5 rounded-lg border font-mono font-bold transition-all ${
                  simulatedBarcode === '8901058005517'
                    ? 'bg-red-600 text-white border-red-500'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800'
                }`}
              >
                Scan Expired Item (8901058...)
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Scan Result Output:</div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">{scannedResult.name}</div>
              <div className="text-slate-500 flex items-center gap-3">
                <span>Batch: <strong className="font-mono text-slate-900 dark:text-white">{scannedResult.batch}</strong></span>
                <span>•</span>
                <span>Expiry Status: <strong className="text-emerald-500">{scannedResult.expiry}</strong></span>
              </div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold mt-1">Recommended Action: {scannedResult.action}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. The 3 Pillars of Technology Section */}
      <section id="pillars" className="py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
              The 3 Pillars of SmartShelf Expiry Prevention Engine
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base">
              Proprietary retail algorithms engineered to eliminate product wastage across grocery stores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -6 }}
              className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:border-emerald-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-6">
                  <Flame className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. FEFO Algorithmic Matrix</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                  Calculates exact days remaining for every individual batch and orders shelf placement based on First Expiry, First Out principles.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-semibold border-t border-slate-200 dark:border-slate-800 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Configurable Multi-Tier Alert Thresholds</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Automatic SELL FIRST shelf priority tagging</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              whileHover={{ y: -6 }}
              className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:border-emerald-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-6">
                  <Scan className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Dynamic Barcode &amp; Multi-Batch</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                  Instantly fetches product master details when receiving stock while maintaining independent batch expiry dates for Batch A, B, and C.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-semibold border-t border-slate-200 dark:border-slate-800 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Real-time Barcode Camera Scan Receiving</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>POS Checkout Safety Block for Expired Items</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              whileHover={{ y: -6 }}
              className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:border-emerald-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-6">
                  <Bot className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. ShelfSense AI Assistant</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                  Predicts unsold leftover stock based on daily sales velocity and answers real questions using your store database as the source of truth.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-semibold border-t border-slate-200 dark:border-slate-800 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>0 Invented Values — Direct DB Queries</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>AI Risk Prediction &amp; Promo Discount Recommendations</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. Interactive Before vs After Comparison Visualizer */}
      <section id="comparison" className="py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
              Before vs After SmartShelf AI Implementation
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base">
              See how replacing manual shelf tracking with algorithmic FEFO rotation transforms store metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-red-200 dark:border-red-900/40 relative">
              <div className="px-3 py-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 font-black text-xs rounded-lg border border-red-300 dark:border-red-800 inline-block mb-6">
                ❌ TRADITIONAL SUPERMARKET (BEFORE)
              </div>
              <ul className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Forgotten Shelf Batches:</strong> Staff forget which batch expires first, resulting in products expiring unsold on back shelves.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Financial Loss:</strong> 4.2% average store revenue lost to expired inventory waste every month.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Accidental Sales Risk:</strong> Expired food accidentally scanned and sold to customers at checkout.</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-emerald-300 dark:border-emerald-500/50 shadow-xl shadow-emerald-950/10 relative">
              <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-black text-xs rounded-lg border border-emerald-300 dark:border-emerald-800 inline-block mb-6">
                ✓ SMARTSHELF AI SUPERMARKET (AFTER)
              </div>
              <ul className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Automated FEFO Priority:</strong> Clear SELL FIRST tags ensure staff rotate earliest expiring items upfront daily.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Recovered Capital:</strong> Save an estimated ₹18,700/month by converting near-expiry items into sales.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>POS Safety Block:</strong> System strictly blocks selling expired batches at counter POS checkout.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Interactive Wastage Loss ROI Calculator */}
      <section id="roi-calculator" className="py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Calculate Your Store Wastage Savings</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Select your monthly inventory capital to estimate financial loss recovered with SmartShelf AI</p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-8 shadow-xl">
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Monthly Store Inventory Stock Value:
                </label>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  ₹{formatNumber(storeCapital)}
                </span>
              </div>
              <input
                type="range"
                min={100000}
                max={2500000}
                step={50000}
                value={storeCapital}
                onChange={(e) => setStoreCapital(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-bold mt-2">
                <span>₹1 Lakh</span>
                <span>₹10 Lakhs</span>
                <span>₹25 Lakhs</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-500 uppercase">Estimated Loss Without FEFO (4.2%)</div>
                <div className="text-3xl font-black text-red-500 dark:text-red-400 mt-2">
                  ₹{formatNumber(estimatedWastageWithoutFEFO)} / mo
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Capital lost to expired inventory</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-emerald-300 dark:border-emerald-500/40">
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Estimated Capital Recovered (FEFO)</div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                  ₹{formatNumber(estimatedSavingsWithSmartShelf)} / mo
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-1">Rescued via FEFO rotation &amp; promos</div>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/dashboard/owner"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-all"
              >
                <span>Protect Your Store Capital Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CTA Banner & Footer */}
      <section className="py-20 bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 border-t border-slate-200 dark:border-slate-800 text-center text-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl sm:text-5xl font-black mb-6 tracking-tight">
            Turn Expiring Inventory Into Profit Today.
          </h2>
          <p className="text-slate-300 text-base mb-8 max-w-xl mx-auto">
            Experience the commercial supermarket platform that eliminates product expiry losses.
          </p>
          <Link
            href="/dashboard/owner"
            className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base rounded-xl shadow-xl shadow-emerald-950 transition-all hover:scale-105"
          >
            <span>Launch SmartShelf AI Platform</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="py-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 SmartShelf AI. Commercial Supermarket Inventory &amp; Expiry Management Platform.</p>
      </footer>
    </div>
  );
}
