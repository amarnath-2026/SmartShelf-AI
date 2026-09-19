import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDaysRemaining, calculateExpiryStatus, calculateAIRiskScore } from '@/lib/expiry/engine';

export async function GET() {
  try {
    const store = await prisma.store.findFirst();
    if (!store) return NextResponse.json({ error: 'No store found' }, { status: 404 });

    const batches = await prisma.batch.findMany({
      where: {
        storeId: store.id,
        quantity: { gt: 0 },
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

    const items = batches
      .map((b) => {
        const days = getDaysRemaining(b.expiryDate);
        const status = calculateExpiryStatus(b.expiryDate);

        // AI Risk Calculation
        const aiAssessment = calculateAIRiskScore({
          daysRemaining: days,
          quantity: b.quantity,
          sellingPrice: b.product.sellingPrice,
        });

        return {
          id: b.id,
          productId: b.productId,
          productName: b.product.name,
          barcode: b.product.barcode,
          brand: b.product.brand || 'Generic',
          category: b.product.category.name,
          batchNumber: b.batchNumber,
          quantity: b.quantity,
          initialQuantity: b.initialQuantity,
          expiryDate: b.expiryDate,
          daysRemaining: days,
          sellingPrice: b.product.sellingPrice,
          storageLocation: b.storageLocation,
          status,
          riskLevel: aiAssessment.riskLevel,
          riskScore: aiAssessment.riskScore,
          expectedLeftover: aiAssessment.expectedLeftover,
          aiRecommendation: aiAssessment.recommendation,
          potentialLoss: b.quantity * b.product.sellingPrice,
        };
      })
      .filter((item) => item.daysRemaining <= 30); // Show items expiring within 30 days

    // FEFO Sort: Earliest expiry first, then highest quantity
    items.sort((a, b) => a.daysRemaining - b.daysRemaining || b.quantity - a.quantity);

    return NextResponse.json({ sellFirstItems: items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
