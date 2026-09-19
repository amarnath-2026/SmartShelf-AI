import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDaysRemaining } from '@/lib/expiry/engine';

export async function GET() {
  try {
    const store = await prisma.store.findFirst();
    if (!store) return NextResponse.json({ error: 'No store found' }, { status: 404 });

    const sales = await prisma.sale.findMany({
      where: { storeId: store.id },
      include: {
        items: {
          include: {
            product: true,
            batch: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ sales });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, paymentMethod = 'CASH', customerName = 'Walk-in Customer' } = body;

    const store = await prisma.store.findFirst();
    if (!store) return NextResponse.json({ error: 'No store found' }, { status: 404 });

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    let totalInvoiceAmount = 0;
    const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
    const now = new Date();

    // Create Sale Header
    const sale = await prisma.sale.create({
      data: {
        storeId: store.id,
        invoiceNo,
        totalAmount: 0,
        paymentMethod,
        customerName,
      },
    });

    const processedItems = [];

    // Process each cart item using FEFO principle (earliest UNEXPIRED batch first)
    for (const item of items) {
      const { productId, quantity } = item;
      let qtyNeeded = parseInt(quantity) || 1;

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) continue;

      // Query active batches ordered by FEFO (expiryDate ASC)
      const allBatches = await prisma.batch.findMany({
        where: {
          productId,
          storeId: store.id,
          quantity: { gt: 0 },
        },
        orderBy: { expiryDate: 'asc' },
      });

      // Filter out EXPIRED batches — REAL-LIFE COMMON SENSE SAFETY RULE: Never sell expired food!
      const validActiveBatches = allBatches.filter((b) => {
        const days = getDaysRemaining(b.expiryDate, now);
        return days >= 0 && b.status !== 'EXPIRED';
      });

      if (validActiveBatches.length === 0) {
        const expiredBatches = allBatches.filter((b) => getDaysRemaining(b.expiryDate, now) < 0);
        if (expiredBatches.length > 0) {
          return NextResponse.json(
            {
              error: `⚠️ SAFETY PREVENTION: Cannot sell "${product.name}". All available stock (${expiredBatches[0].quantity} units in Batch ${expiredBatches[0].batchNumber}) HAS EXPIRED. Selling expired goods is prohibited. Please remove & discard this batch.`,
            },
            { status: 400 }
          );
        }

        return NextResponse.json(
          { error: `Insufficient stock for product: ${product.name}` },
          { status: 400 }
        );
      }

      for (const b of validActiveBatches) {
        if (qtyNeeded <= 0) break;

        const deductQty = Math.min(b.quantity, qtyNeeded);
        qtyNeeded -= deductQty;

        // Update batch quantity
        await prisma.batch.update({
          where: { id: b.id },
          data: { quantity: b.quantity - deductQty },
        });

        // Create SaleItem
        const itemTotal = deductQty * product.sellingPrice;
        totalInvoiceAmount += itemTotal;

        await prisma.saleItem.create({
          data: {
            saleId: sale.id,
            productId,
            batchId: b.id,
            quantity: deductQty,
            unitPrice: product.sellingPrice,
            totalPrice: itemTotal,
          },
        });

        // Log Inventory Transaction
        await prisma.inventoryTransaction.create({
          data: {
            storeId: store.id,
            productId,
            batchId: b.id,
            type: 'SALE',
            quantity: -deductQty,
            reason: `Sale ${invoiceNo} (FEFO Auto-Deduction)`,
          },
        });

        processedItems.push({
          productName: product.name,
          batchNumber: b.batchNumber,
          expiryDate: b.expiryDate,
          quantity: deductQty,
          unitPrice: product.sellingPrice,
          totalPrice: itemTotal,
        });
      }

      if (qtyNeeded > 0) {
        return NextResponse.json(
          { error: `Not enough unexpired stock for ${product.name}. Short by ${qtyNeeded} units.` },
          { status: 400 }
        );
      }
    }

    // Update Sale total
    const updatedSale = await prisma.sale.update({
      where: { id: sale.id },
      data: { totalAmount: totalInvoiceAmount },
    });

    return NextResponse.json({
      success: true,
      sale: updatedSale,
      invoiceNo,
      totalAmount: totalInvoiceAmount,
      items: processedItems,
    });
  } catch (error: any) {
    console.error('Error processing sale:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
