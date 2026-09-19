'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, Scan, Menu, Store as StoreIcon, Bot, Check, ArrowRight, 
  ShieldCheck, UserCheck, User, LogOut, Sun, Moon 
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/components/theme/ThemeProvider';
import { safeFetchJson } from '@/lib/fetch';

interface TopNavbarProps {
  onToggleMobileSidebar: () => void;
  onOpenSearch: () => void;
  onOpenScanner: () => void;
  onOpenAI: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onToggleMobileSidebar,
  onOpenSearch,
  onOpenScanner,
  onOpenAI,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [unreadNotifications, setUnreadNotifications] = useState<number>(3);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Fetch active session
    safeFetchJson('/api/auth/me').then(({ ok, data }) => {
      if (ok && data?.user) setSession(data.user);
    });

    // Fetch notifications
    safeFetchJson('/api/notifications').then(({ ok, data }) => {
      if (ok && data?.notifications) {
        setNotifications(data.notifications);
        setUnreadNotifications(data.unreadCount || 0);
      }
    });
  }, []);

  const handleMarkAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'MARK_ALL_READ' }),
    });
    setUnreadNotifications(0);
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-xs transition-colors duration-200">
      {/* Mobile Hamburger & Active Store Indicator */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 text-slate-600 dark:text-slate-300 rounded-lg lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60">
          <StoreIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="truncate max-w-[200px]">{session?.storeName || 'FreshMart Supermarket'}</span>
          {session?.storeCode && (
            <span className="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold">
              {session.storeCode}
            </span>
          )}
        </div>
      </div>

      {/* FIXED Global Search Bar (Single Row, Truncated) */}
      <div className="flex-1 max-w-lg mx-3 sm:mx-6 min-w-0">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs sm:text-sm text-slate-400 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200/80 dark:hover:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 transition-all text-left shadow-xs overflow-hidden"
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate hidden sm:inline">Search products, batches, directives, sales...</span>
          <span className="sm:hidden truncate">Search...</span>
          <kbd className="hidden md:inline-block ml-auto px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 shrink-0">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Actions: Role Switches, Theme Toggle, Scanner, AI, User */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Role Portal Quick Switches */}
        <div className="hidden lg:flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-3">
          <Link
            href="/dashboard/owner"
            className="px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100 dark:bg-slate-800/60 hover:bg-emerald-500/10 rounded-lg transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700/50"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Owner</span>
          </Link>
          <Link
            href="/dashboard/supervisor"
            className="px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 bg-slate-100 dark:bg-slate-800/60 hover:bg-amber-500/10 rounded-lg transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700/50"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Supervisor</span>
          </Link>
          <Link
            href="/dashboard/staff"
            className="px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800/60 hover:bg-blue-500/10 rounded-lg transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700/50"
          >
            <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Staff</span>
          </Link>
        </div>

        {/* DARK / LIGHT THEME TOGGLE BUTTON */}
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

        {/* Quick Barcode Scanner Button */}
        <button
          onClick={onOpenScanner}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
          title="Scan product barcode"
        >
          <Scan className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Scan</span>
        </button>

        {/* ShelfSense AI Trigger Button */}
        <button
          onClick={onOpenAI}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl border border-emerald-200 dark:border-emerald-500/30 transition-colors"
          title="Open ShelfSense AI Assistant"
        >
          <Bot className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden md:inline">ShelfSense AI</span>
        </button>

        {/* Notifications Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-800"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotificationsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Directives & Notifications
                </h4>
                {unreadNotifications > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No new notifications</div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${
                        !n.read ? 'bg-amber-50/50 dark:bg-amber-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-none">
              {session?.name || 'Rahul Sharma'}
            </div>
            <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5">
              {session?.role || 'OWNER'}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
