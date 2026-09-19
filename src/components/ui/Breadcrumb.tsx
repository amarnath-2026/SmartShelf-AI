'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showBackButton?: boolean;
  className?: string;
}

const ROUTE_NAME_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  owner: 'Owner Portal',
  supervisor: 'Supervisor Portal',
  staff: 'Staff Portal',
  products: 'Product Catalog',
  stock: 'Batch Inventory',
  expiry: 'Expiry Management',
  calendar: 'Heatmap Calendar',
  'sell-first': 'FEFO Sell-First',
  sales: 'POS & Transactions',
  analytics: 'Financial Analytics',
  suppliers: 'Supplier Directory',
  notifications: 'Directives & Alerts',
  settings: 'Store Settings',
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  showBackButton = false,
  className = '',
}) => {
  const pathname = usePathname();
  const router = useRouter();

  // If custom items are not provided, auto-generate from pathname
  const breadcrumbItems: BreadcrumbItem[] = React.useMemo(() => {
    if (items && items.length > 0) return items;

    const segments = pathname.split('/').filter(Boolean);
    const generated: BreadcrumbItem[] = [
      { label: 'Home', href: '/dashboard', icon: <Home className="w-3.5 h-3.5" /> },
    ];

    let currentPath = '';

    segments.forEach((segment, index) => {
      // Skip 'dashboard' as home covers it when path is just /dashboard
      if (segment === 'dashboard') return;

      const cumulativePath = '/' + segments.slice(0, index + 1).join('/');

      const label =
        ROUTE_NAME_MAP[segment] ||
        segment
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase());

      generated.push({
        label,
        href: index === segments.length - 1 ? undefined : cumulativePath,
      });
    });

    return generated;
  }, [items, pathname]);

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center justify-between gap-3 mb-6 py-2 px-1 text-xs text-slate-500 dark:text-slate-400 ${className}`}
    >
      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
        {showBackButton && (
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 mr-2 px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-lg border border-slate-200 dark:border-slate-700 transition-all"
            title="Go back to previous page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}

        <ol className="flex items-center gap-1.5 flex-wrap min-w-0">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;

            return (
              <li key={index} className="flex items-center gap-1.5 min-w-0">
                {index > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
                )}

                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="flex items-center gap-1.5 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors hover:underline truncate max-w-[140px] sm:max-w-xs"
                  >
                    {item.icon && <span className="shrink-0">{item.icon}</span>}
                    <span className="truncate">{item.label}</span>
                  </Link>
                ) : (
                  <span
                    className={`flex items-center gap-1.5 truncate max-w-[160px] sm:max-w-sm ${
                      isLast
                        ? 'font-bold text-slate-900 dark:text-slate-100'
                        : 'font-medium'
                    }`}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.icon && <span className="shrink-0">{item.icon}</span>}
                    <span className="truncate">{item.label}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
