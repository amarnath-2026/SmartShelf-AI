'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, Trash2, AlertTriangle, Bot, Info, ArrowRight } from 'lucide-react';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { Button } from '@/components/ui/Button';
import { ToastNotification } from '@/components/ui/ToastNotification';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const fetchNotifications = () => {
    setLoading(true);
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((d) => {
        setNotifications(d.notifications || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'MARK_ALL_READ' }),
    });
    setToast({ type: 'success', message: 'All notifications marked as read' });
    fetchNotifications();
  };

  const handleDeleteNotification = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DELETE', notificationId: id }),
    });
    setToast({ type: 'info', message: 'Notification removed' });
    fetchNotifications();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Notification Center</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Store alerts, critical expiry notifications, stock warnings, and ShelfSense AI recommendations
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleMarkAllRead}
          leftIcon={<Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
        >
          Mark All As Read
        </Button>
      </div>

      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Notifications List */}
      {loading ? (
        <TableSkeleton />
      ) : notifications.length === 0 ? (
        <EmptyState title="No notifications found" description="You are all caught up! No active alerts at this time." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex items-start justify-between gap-4 ${
                !n.read
                  ? 'border-amber-300 dark:border-amber-900 bg-amber-50/20 dark:bg-amber-950/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    n.type === 'CRITICAL'
                      ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                      : n.type === 'AI'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {n.type === 'CRITICAL' && <AlertTriangle className="w-5 h-5" />}
                  {n.type === 'AI' && <Bot className="w-5 h-5" />}
                  {n.type !== 'CRITICAL' && n.type !== 'AI' && <Info className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h4>
                    {!n.read && (
                      <span className="px-2 py-0.5 text-[9px] font-extrabold text-amber-800 dark:text-amber-300 bg-amber-200 dark:bg-amber-950/80 rounded border border-amber-300 dark:border-amber-800">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-mono">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {n.link && (
                  <Link
                    href={n.link}
                    className="px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg transition-colors flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                <button
                  onClick={() => handleDeleteNotification(n.id)}
                  className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

