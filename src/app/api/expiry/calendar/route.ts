import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { getDaysRemaining, calculateExpiryStatus } from '@/lib/expiry/engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearStr = searchParams.get('year') || new Date().getFullYear().toString();
    const monthStr = searchParams.get('month') || (new Date().getMonth() + 1).toString();

    const year = parseInt(yearStr);
    const month = parseInt(monthStr) - 1; // 0-indexed

    const targetDate = new Date(year, month, 1);
    const startDate = startOfMonth(targetDate);
    const endDate = endOfMonth(targetDate);

    const store = await prisma.store.findFirst();
    if (!store) return NextResponse.json({ error: 'No store found' }, { status: 404 });

    const batches = await prisma.batch.findMany({
      where: {
        storeId: store.id,
        expiryDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });

    // Group by YYYY-MM-DD
    const dateMap: Record<string, { date: string; count: number; items: any[]; highestRisk: string }> = {};

    batches.forEach((b) => {
      const dateKey = format(new Date(b.expiryDate), 'yyyy-MM-dd');
      const days = getDaysRemaining(b.expiryDate);
      const status = calculateExpiryStatus(b.expiryDate);

      if (!dateMap[dateKey]) {
        dateMap[dateKey] = {
          date: dateKey,
          count: 0,
          items: [],
          highestRisk: 'SAFE',
        };
      }

      dateMap[dateKey].count += b.quantity;
      dateMap[dateKey].items.push({
        id: b.id,
        productId: b.productId,
        productName: b.product.name,
        category: b.product.category.name,
        batchNumber: b.batchNumber,
        quantity: b.quantity,
        expiryDate: b.expiryDate,
        daysRemaining: days,
        status,
        sellingPrice: b.product.sellingPrice,
      });

      // Track highest risk
      const riskLevels = ['CRITICAL', 'EXPIRES_TODAY', 'URGENT', 'WARNING', 'WATCH', 'SAFE'];
      if (riskLevels.indexOf(status) < riskLevels.indexOf(dateMap[dateKey].highestRisk)) {
        dateMap[dateKey].highestRisk = status;
      }
    });

    return NextResponse.json({ calendarData: dateMap });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
