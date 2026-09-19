import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDaysRemaining, calculateExpiryStatus, DEFAULT_EXPIRY_CONFIG } from '@/lib/expiry/engine';

export async function GET() {
  try {
    const store = await prisma.store.findFirst();
    if (!store) {
      return NextResponse.json({ error: 'No store found' }, { status: 404 });
    }

    const products = await prisma.product.findMany({
      where: { storeId: store.id },
      include: {
        category: true,
        batches: {
          orderBy: { expiryDate: 'asc' },
        },
      },
    });

    const settings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id },
    });

    const expiryConfig = settings
      ? {
          watchDays: settings.watchDays,
          warningDays: settings.warningDays,
          urgentDays: settings.urgentDays,
          criticalDays: settings.criticalDays,
        }
      : DEFAULT_EXPIRY_CONFIG;

    let totalStock = 0;
    let expiringSoonCount = 0; // <= 14 days
    let expiredCount = 0;
    let safeCount = 0;
    let watchCount = 0;
    let warningCount = 0;
    let urgentCount = 0;
    let criticalCount = 0;

    const sellFirstItems: any[] = [];

    products.forEach((p) => {
      p.batches.forEach((b) => {
        totalStock += b.quantity;
        const days = getDaysRemaining(b.expiryDate);
        const status = calculateExpiryStatus(b.expiryDate, expiryConfig);

        if (status === 'EXPIRED') {
          expiredCount++;
        } else if (status === 'SAFE') {
          safeCount++;
        } else if (status === 'WATCH') {
          watchCount++;
        } else if (status === 'WARNING') {
          warningCount++;
          expiringSoonCount++;
        } else if (status === 'URGENT') {
          urgentCount++;
          expiringSoonCount++;
        } else if (status === 'CRITICAL' || status === 'EXPIRES_TODAY') {
          criticalCount++;
          expiringSoonCount++;
        }

        // Add to priority sell first list if quantity > 0 and days <= 14
        if (b.quantity > 0 && days <= 14) {
          let risk = 'Low';
          if (days <= 2) risk = 'Critical';
          else if (days <= 6) risk = 'High';
          else if (days <= 14) risk = 'Medium';

          sellFirstItems.push({
            id: b.id,
            productId: p.id,
            productName: p.name,
            brand: p.brand || 'Generic',
            category: p.category.name,
            batchNumber: b.batchNumber,
            quantity: b.quantity,
            expiryDate: b.expiryDate,
            daysRemaining: days,
            sellingPrice: p.sellingPrice,
            storageLocation: b.storageLocation,
            status,
            risk,
          });
        }
      });
    });

    // Sort sell-first items by FEFO (earliest expiry first, then highest quantity)
    sellFirstItems.sort((a, b) => a.daysRemaining - b.daysRemaining || b.quantity - a.quantity);

    // Calculate monthly sales & wastage estimate
    const sales = await prisma.sale.findMany({
      where: { storeId: store.id },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    const totalSalesAmount = sales.reduce((acc, curr) => acc + curr.totalAmount, 0);

    return NextResponse.json({
      totalProducts: products.length,
      totalStock,
      expiringSoon: expiringSoonCount,
      expired: expiredCount,
      riskDistribution: {
        safe: safeCount,
        watch: watchCount,
        warning: warningCount,
        urgent: urgentCount,
        critical: criticalCount,
        expired: expiredCount,
      },
      sellFirstItems: sellFirstItems.slice(0, 10),
      totalSalesAmount,
      currency: settings?.currencySymbol || '₹',
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
