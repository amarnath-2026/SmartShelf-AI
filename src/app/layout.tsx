import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

export const metadata: Metadata = {
  title: 'SmartShelf AI | AI-Powered Multi-Store Expiry & Inventory Platform',
  description: 'SmartShelf AI tracks product batches, monitors expiry dates using FEFO principles, and provides super-admin owner analytics & staff directives.',
  keywords: ['inventory management', 'expiry tracking', 'FEFO', 'supermarket software', 'shelf life', 'retail AI'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body 
        className="h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200"
        suppressHydrationWarning
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
