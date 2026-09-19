import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDaysRemaining, calculateExpiryStatus } from '@/lib/expiry/engine';

export async function GET() {
  try {
    const store = await prisma.store.findFirst();
    if (!store) return NextResponse.json({ error: 'No store found' }, { status: 404 });

    const batches = await prisma.batch.findMany({
      where: { storeId: store.id },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });

    const formatted = batches.map((b) => {
      const daysRemaining = getDaysRemaining(b.expiryDate);
      const status = calculateExpiryStatus(b.expiryDate);
      return {
        id: b.id,
        batchNumber: b.batchNumber,
        productId: b.productId,
        productName: b.product.name,
        category: b.product.category.name,
        brand: b.product.brand || 'Generic',
        quantity: b.quantity,
        initialQuantity: b.initialQuantity,
        mfgDate: b.mfgDate,
        expiryDate: b.expiryDate,
        daysRemaining,
        status,
        storageLocation: b.storageLocation,
        sellingPrice: b.product.sellingPrice,
        purchasePrice: b.product.purchasePrice,
        batchValue: b.quantity * b.product.sellingPrice,
      };
    });

    return NextResponse.json({ batches: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { batchId, quantityDelta, storageLocation } = body;

    const batch = await prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch) return NextResponse.json({ error: 'Batch not found' }, { status: 404 });

    const newQty = Math.max(0, batch.quantity + (quantityDelta || 0));

    const updated = await prisma.batch.update({
      where: { id: batchId },
      data: {
        quantity: newQty,
        ...(storageLocation ? { storageLocation } : {}),
      },
    });

    return NextResponse.json({ success: true, batch: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
