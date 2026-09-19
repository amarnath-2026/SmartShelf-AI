import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      storeId,
      name,
      barcode,
      batchNumber,
      quantity,
      mfgDate,
      expiryDate,
      purchasePrice,
      sellingPrice,
      storageLocation,
    } = body;

    if (!name || !barcode || !batchNumber || !quantity || !expiryDate) {
      return NextResponse.json(
        { error: 'Name, Barcode, Batch Number, Quantity, and Expiry Date are required' },
        { status: 400 }
      );
    }

    // Default to store 1 if not specified
    const targetStoreId = storeId || (await prisma.store.findFirst())?.id;
    if (!targetStoreId) {
      return NextResponse.json({ error: 'No valid store found' }, { status: 400 });
    }

    // Get or create category
    let category = await prisma.category.findFirst({
      where: { storeId: targetStoreId },
    });
    if (!category) {
      category = await prisma.category.create({
        data: { storeId: targetStoreId, name: 'General Inventory' },
      });
    }

    // Get or create product
    let product = await prisma.product.findFirst({
      where: { storeId: targetStoreId, barcode },
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          storeId: targetStoreId,
          name,
          barcode,
          categoryId: category.id,
          purchasePrice: purchasePrice ? Number(purchasePrice) : 20.0,
          sellingPrice: sellingPrice ? Number(sellingPrice) : 28.0,
        },
      });
    }

    // Calculate initial batch status based on days to expiry
    const expDate = new Date(expiryDate);
    const now = new Date();
    const daysRemaining = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

    let status = 'SAFE';
    if (daysRemaining <= 0) status = 'EXPIRED';
    else if (daysRemaining <= 2) status = 'CRITICAL';
    else if (daysRemaining <= 6) status = 'URGENT';
    else if (daysRemaining <= 14) status = 'WATCH';

    // Create batch
    const batch = await prisma.batch.create({
      data: {
        storeId: targetStoreId,
        productId: product.id,
        batchNumber,
        quantity: Number(quantity),
        initialQuantity: Number(quantity),
        mfgDate: mfgDate ? new Date(mfgDate) : new Date(),
        expiryDate: expDate,
        storageLocation: storageLocation || 'Main Shelf',
        status,
      },
    });

    // Create expiry alert if near expiry
    if (status !== 'SAFE') {
      await prisma.expiryAlert.create({
        data: {
          storeId: targetStoreId,
          batchId: batch.id,
          riskLevel: status,
          daysRemaining: Math.max(0, daysRemaining),
          isResolved: false,
        },
      });
    }

    return NextResponse.json({ success: true, product, batch });
  } catch (error) {
    console.error('Error adding stock item:', error);
    return NextResponse.json({ error: 'Failed to add stock item' }, { status: 500 });
  }
}
