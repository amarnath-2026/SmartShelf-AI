import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDaysRemaining, calculateExpiryStatus } from '@/lib/expiry/engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const categoryId = searchParams.get('categoryId') || '';
    const statusFilter = searchParams.get('status') || '';

    const store = await prisma.store.findFirst();
    if (!store) return NextResponse.json({ error: 'No store found' }, { status: 404 });

    const products = await prisma.product.findMany({
      where: {
        storeId: store.id,
        ...(categoryId ? { categoryId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { barcode: { contains: search } },
                { brand: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
        supplier: true,
        batches: {
          orderBy: { expiryDate: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formatted = products.map((p) => {
      const totalStock = p.batches.reduce((sum, b) => sum + b.quantity, 0);
      const nearestBatch = p.batches.find((b) => b.quantity > 0) || p.batches[0];

      let nearestExpiry: Date | null = nearestBatch ? nearestBatch.expiryDate : null;
      let expiryStatus = nearestBatch ? calculateExpiryStatus(nearestBatch.expiryDate) : 'SAFE';
      let daysRemaining = nearestBatch ? getDaysRemaining(nearestBatch.expiryDate) : 999;

      return {
        id: p.id,
        name: p.name,
        barcode: p.barcode,
        brand: p.brand || 'Generic',
        category: p.category.name,
        categoryId: p.categoryId,
        supplier: p.supplier?.name || 'N/A',
        supplierId: p.supplierId,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        unit: p.unit,
        totalStock,
        nearestExpiry,
        daysRemaining,
        expiryStatus,
        batchesCount: p.batches.length,
        batches: p.batches,
      };
    });

    let filtered = formatted;
    if (statusFilter) {
      filtered = formatted.filter((p) => p.expiryStatus === statusFilter);
    }

    return NextResponse.json({ products: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, barcode, brand, categoryId, supplierId, purchasePrice, sellingPrice, unit, batches } = body;

    const store = await prisma.store.findFirst();
    if (!store) return NextResponse.json({ error: 'No store found' }, { status: 404 });

    if (!name || !barcode || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields (name, barcode, category)' }, { status: 400 });
    }

    // Check existing barcode
    const existing = await prisma.product.findFirst({
      where: { storeId: store.id, barcode },
    });
    if (existing) {
      return NextResponse.json({ error: 'Product with this barcode already exists' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        storeId: store.id,
        name,
        barcode,
        brand,
        categoryId,
        supplierId,
        purchasePrice: parseFloat(purchasePrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        unit: unit || 'pcs',
      },
    });

    // Create multi-batches if provided
    if (batches && Array.isArray(batches) && batches.length > 0) {
      for (const b of batches) {
        const expiryDate = new Date(b.expiryDate);
        const mfgDate = b.mfgDate ? new Date(b.mfgDate) : new Date();
        const days = getDaysRemaining(expiryDate);
        const status = calculateExpiryStatus(expiryDate);

        await prisma.batch.create({
          data: {
            storeId: store.id,
            productId: product.id,
            batchNumber: b.batchNumber || `B-${Date.now().toString().slice(-4)}`,
            quantity: parseInt(b.quantity) || 0,
            initialQuantity: parseInt(b.quantity) || 0,
            mfgDate,
            expiryDate,
            storageLocation: b.storageLocation || 'Main Shelf',
            status,
          },
        });
      }
    }

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
