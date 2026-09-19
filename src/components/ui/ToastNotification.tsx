'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export interface SingleToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
}

export const ToastNotification: React.FC<SingleToastProps> = ({ type, title, message, onClose }) => {
  useEffect(() => {
    if (!onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300',
      icon: <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300',
      icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />,
    },
  }[type];

  return (
    <div className={`p-4 rounded-xl border shadow-sm flex items-center justify-between gap-3 animate-in fade-in transition-all ${config.bg}`}>
      <div className="flex items-center gap-3">
        {config.icon}
        <div>
          {title && <h4 className="text-xs font-bold leading-snug">{title}</h4>}
          <p className="text-xs font-medium">{message}</p>
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = {
    success: {
      bg: 'bg-white dark:bg-slate-900 border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    },
    error: {
      bg: 'bg-white dark:bg-slate-900 border-red-500/40 text-red-600 dark:text-red-400',
      icon: <XCircle className="w-5 h-5 text-red-500 shrink-0" />,
    },
    warning: {
      bg: 'bg-white dark:bg-slate-900 border-amber-500/40 text-amber-600 dark:text-amber-400',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    },
    info: {
      bg: 'bg-white dark:bg-slate-900 border-blue-500/40 text-blue-600 dark:text-blue-400',
      icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
    },
  }[toast.type];

  return (
    <div
      className={`pointer-events-auto p-4 rounded-2xl border shadow-xl flex items-start gap-3 transition-all duration-200 animate-in slide-in-from-bottom-2 ${config.bg}`}
    >
      {config.icon}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{toast.title}</h4>
        {toast.message && (
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 rounded-md"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
