'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  PlusCircle,
  AlertTriangle,
  Flame,
  Calendar,
  ShoppingCart,
  BarChart3,
  Users,
  Bell,
  Settings,
  Sparkles,
  X,
  Store,
  ShieldCheck,
  UserCheck,
  User,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path !== '/dashboard' && pathname.startsWith(path)) return true;
    return false;
  };

  const navGroups: Array<{ title: string; items: NavItem[] }> = [
    {
      title: 'PORTALS',
      items: [
        { label: 'Owner Enterprise', href: '/dashboard/owner', icon: ShieldCheck, highlight: true },
        { label: 'Supervisor Oversight', href: '/dashboard/supervisor', icon: UserCheck },
        { label: 'Staff Intake Inbox', href: '/dashboard/staff', icon: User },
      ],
    },
    {
      title: 'MAIN',
      items: [
        { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'INVENTORY',
      items: [
        { label: 'Products', href: '/dashboard/products', icon: Package },
        { label: 'Stock & Batches', href: '/dashboard/stock', icon: Layers },
        { label: 'Add Product', href: '/dashboard/products/add', icon: PlusCircle },
      ],
    },
    {
      title: 'EXPIRY CONTROL',
      items: [
        { label: 'Expiring Soon', href: '/dashboard/expiry', icon: AlertTriangle, badge: '37' },
        { label: 'SELL FIRST Queue', href: '/dashboard/sell-first', icon: Flame, badge: 'FEFO' },
        { label: 'Expiry Calendar', href: '/dashboard/expiry/calendar', icon: Calendar },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { label: 'Sales / POS', href: '/dashboard/sales', icon: ShoppingCart },
        { label: 'Analytics & Loss', href: '/dashboard/analytics', icon: BarChart3 },
        { label: 'Suppliers', href: '/dashboard/suppliers', icon: Users },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
        { label: 'Settings', href: '/dashboard/settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-950/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none">
                SmartShelf <span className="text-emerald-500">AI</span>
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Enterprise FEFO Platform
              </div>
            </div>
          </Link>

          <button
            onClick={onCloseMobile}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <div className="px-3 mb-2 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded-md ${
                            active
                              ? 'bg-emerald-700 text-emerald-100'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Store className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">FreshMart Enterprise</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Multi-Store Central DB</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
