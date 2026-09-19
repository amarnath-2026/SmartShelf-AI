import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { batchId, action = 'DISCARDED', reason = 'Item expired on shelf' } = body;

    const store = await prisma.store.findFirst();
    if (!store) return NextResponse.json({ error: 'No store found' }, { status: 404 });

    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { product: true },
    });

    if (!batch) return NextResponse.json({ error: 'Batch not found' }, { status: 404 });

    const discardedQty = batch.quantity;

    // 1. Set batch quantity to 0 and status to EXPIRED/DISCARDED
    const updatedBatch = await prisma.batch.update({
      where: { id: batchId },
      data: {
        quantity: 0,
        status: action === 'RETURNED_TO_SUPPLIER' ? 'RETURNED' : 'EXPIRED',
      },
    });

    // 2. Record Inventory Transaction as DISCARD or ADJUSTMENT
    await prisma.inventoryTransaction.create({
      data: {
        storeId: store.id,
        productId: batch.productId,
        batchId: batch.id,
        type: action === 'RETURNED_TO_SUPPLIER' ? 'RETURN' : 'DISCARD',
        quantity: -discardedQty,
        reason: `${action}: ${reason} (${discardedQty} units removed)`,
      },
    });

    // 3. Mark Expiry Alerts as resolved
    await prisma.expiryAlert.updateMany({
      where: { batchId },
      data: {
        isResolved: true,
        actionTaken: action,
      },
    });

    // 4. Create Notification
    await prisma.notification.create({
      data: {
        storeId: store.id,
        title: action === 'RETURNED_TO_SUPPLIER' ? '📦 Returned to Supplier' : '🗑️ Expired Stock Discarded',
        message: `${discardedQty} units of ${batch.product.name} (Batch ${batch.batchNumber}) were removed from active inventory.`,
        type: 'INFO',
        read: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully removed ${discardedQty} units of ${batch.product.name} from active inventory.`,
      batch: updatedBatch,
    });
  } catch (error: any) {
    console.error('Error discarding batch:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
