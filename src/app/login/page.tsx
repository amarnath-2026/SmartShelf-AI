'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Lock, Mail, Store, ShieldCheck, UserCheck, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [selectedRole, setSelectedRole] = useState<'OWNER' | 'SUPERVISOR' | 'STAFF'>('OWNER');
  const [email, setEmail] = useState('owner@smartshelf.ai');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleSelect = (role: 'OWNER' | 'SUPERVISOR' | 'STAFF') => {
    setSelectedRole(role);
    setErrorMsg('');
    if (role === 'OWNER') {
      setEmail('owner@smartshelf.ai');
    } else if (role === 'SUPERVISOR') {
      setEmail('supervisor@smartshelf.ai');
    } else if (role === 'STAFF') {
      setEmail('staff1@smartshelf.ai');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Invalid credentials');
        setLoading(false);
        return;
      }

      router.push(data.redirectTo || '/dashboard');
    } catch (err) {
      console.error(err);
      setErrorMsg('Server error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8 relative overflow-hidden">
        {/* Top Header Theme Toggle */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200 dark:border-slate-800"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>

        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">SmartShelf <span className="text-emerald-500">AI</span></span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Centralized Portal Login</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select your portal role to access inventory &amp; analytics</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => handleRoleSelect('OWNER')}
            className={`py-2 px-2 text-[11px] font-bold rounded-lg transition-all flex flex-col items-center gap-1 ${
              selectedRole === 'OWNER'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Owner</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('SUPERVISOR')}
            className={`py-2 px-2 text-[11px] font-bold rounded-lg transition-all flex flex-col items-center gap-1 ${
              selectedRole === 'SUPERVISOR'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Supervisor</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('STAFF')}
            className={`py-2 px-2 text-[11px] font-bold rounded-lg transition-all flex flex-col items-center gap-1 ${
              selectedRole === 'STAFF'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Store Staff</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 dark:text-red-400 font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="email@smartshelf.ai"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <a href="#" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : `Sign In as ${selectedRole}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-900 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Demo Credentials Pre-filled. Default Password: <code className="bg-slate-100 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono">password123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
