import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    const where = storeId ? { storeId } : {};

    const allocations = await prisma.stockAllocation.findMany({
      where,
      include: {
        store: {
          select: { name: true, code: true },
        },
      },
      orderBy: { dispatchedAt: 'desc' },
    });

    return NextResponse.json({ allocations });
  } catch (error) {
    console.error('Error fetching stock allocations:', error);
    return NextResponse.json({ error: 'Failed to fetch stock allocations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storeId, productId, batchNumber, shippedQuantity, mfgDate, expiryDate } = body;

    if (!storeId || !productId || !batchNumber || !shippedQuantity) {
      return NextResponse.json(
        { error: 'storeId, productId, batchNumber, and shippedQuantity are required' },
        { status: 400 }
      );
    }

    const allocation = await prisma.stockAllocation.create({
      data: {
        storeId,
        productId,
        batchNumber,
        shippedQuantity: Number(shippedQuantity),
        mfgDate: mfgDate ? new Date(mfgDate) : new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'IN_TRANSIT',
      },
    });

    return NextResponse.json({ success: true, allocation });
  } catch (error) {
    console.error('Error creating stock allocation:', error);
    return NextResponse.json({ error: 'Failed to create stock allocation' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, receivedQuantity, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Allocation ID is required' }, { status: 400 });
    }

    const allocation = await prisma.stockAllocation.findUnique({ where: { id } });
    if (!allocation) {
      return NextResponse.json({ error: 'Allocation not found' }, { status: 404 });
    }

    const recQty = receivedQuantity !== undefined ? Number(receivedQuantity) : allocation.shippedQuantity;
    const finalStatus = status || (recQty >= allocation.shippedQuantity ? 'RECEIVED' : 'PARTIAL');

    const updated = await prisma.stockAllocation.update({
      where: { id },
      data: {
        receivedQuantity: recQty,
        status: finalStatus,
        receivedAt: new Date(),
      },
    });

    // If marked received, add to store's product batch
    if (finalStatus === 'RECEIVED') {
      const existingBatch = await prisma.batch.findFirst({
        where: {
          storeId: allocation.storeId,
          productId: allocation.productId,
          batchNumber: allocation.batchNumber,
        },
      });

      if (existingBatch) {
        await prisma.batch.update({
          where: { id: existingBatch.id },
          data: {
            quantity: existingBatch.quantity + recQty,
          },
        });
      } else {
        await prisma.batch.create({
          data: {
            storeId: allocation.storeId,
            productId: allocation.productId,
            batchNumber: allocation.batchNumber,
            quantity: recQty,
            initialQuantity: recQty,
            mfgDate: allocation.mfgDate,
            expiryDate: allocation.expiryDate,
            status: 'SAFE',
          },
        });
      }
    }

    return NextResponse.json({ success: true, allocation: updated });
  } catch (error) {
    console.error('Error updating stock allocation:', error);
    return NextResponse.json({ error: 'Failed to update stock allocation' }, { status: 500 });
  }
}
