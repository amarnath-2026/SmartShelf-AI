import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subDays, subWeeks, subMonths, differenceInDays } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly'; // 'daily' | 'weekly' | 'monthly' | 'all'

    const now = new Date();
    let startDate = subMonths(now, 1);
    let daysInPeriod = 30;

    if (period === 'daily') {
      startDate = subDays(now, 1);
      daysInPeriod = 1;
    } else if (period === 'weekly') {
      startDate = subWeeks(now, 1);
      daysInPeriod = 7;
    } else if (period === 'monthly') {
      startDate = subMonths(now, 1);
      daysInPeriod = 30;
    } else if (period === 'all') {
      startDate = new Date(0);
      daysInPeriod = 90; // Default denominator for historical average
    }

    const stores = await prisma.store.findMany();

    // Calculate total revenue, profit margin, scrap loss, and store benchmarks
    const storeMetrics = await Promise.all(
      stores.map(async (store) => {
        const sales = await prisma.sale.findMany({
          where: {
            storeId: store.id,
            createdAt: { gte: startDate },
          },
          include: {
            items: {
              include: { product: true },
            },
          },
        });

        const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);

        // Estimate Cost of Goods Sold (COGS) based on purchase price
        let cogs = 0;
        sales.forEach((sale) => {
          sale.items.forEach((item) => {
            const purchasePrice = item.product?.purchasePrice || item.unitPrice * 0.7;
            cogs += purchasePrice * item.quantity;
          });
        });

        const grossProfit = totalRevenue - cogs;

        // Expired / Scrapped Inventory Value
        const expiredBatches = await prisma.batch.findMany({
          where: {
            storeId: store.id,
            status: 'EXPIRED',
          },
          include: { product: true },
        });

        const scrapLossValue = expiredBatches.reduce((acc, b) => {
          const cost = b.product?.purchasePrice || 20;
          return acc + b.quantity * cost;
        }, 0);

        // Calculate Average Business per Day
        const averageDailyBusiness = totalRevenue / Math.max(1, daysInPeriod);

        return {
          storeId: store.id,
          storeName: store.name,
          storeCode: store.code,
          totalRevenue,
          cogs,
          grossProfit,
          scrapLossValue,
          totalSalesCount: sales.length,
          averageDailyBusiness,
        };
      })
    );

    // Global totals
    const globalRevenue = storeMetrics.reduce((acc, s) => acc + s.totalRevenue, 0);
    const globalProfit = storeMetrics.reduce((acc, s) => acc + s.grossProfit, 0);
    const globalScrapLoss = storeMetrics.reduce((acc, s) => acc + s.scrapLossValue, 0);
    const globalAvgDailyBusiness = storeMetrics.reduce((acc, s) => acc + s.averageDailyBusiness, 0);

    // Sort store rankings by top average daily business
    const rankedStores = [...storeMetrics].sort((a, b) => b.averageDailyBusiness - a.averageDailyBusiness);

    return NextResponse.json({
      period,
      daysInPeriod,
      summary: {
        totalRevenue: globalRevenue,
        grossProfit: globalProfit,
        scrapLossValue: globalScrapLoss,
        averageDailyBusiness: globalAvgDailyBusiness,
        activeStoresCount: stores.length,
      },
      stores: rankedStores,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
