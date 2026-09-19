import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDaysRemaining, calculateExpiryStatus } from '@/lib/expiry/engine';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const queryLower = prompt.toLowerCase();

    const store = await prisma.store.findFirst();
    if (!store) return NextResponse.json({ error: 'No store found' }, { status: 404 });

    const products = await prisma.product.findMany({
      where: { storeId: store.id },
      include: {
        category: true,
        batches: {
          orderBy: { expiryDate: 'asc' },
        },
      },
    });

    let answer = '';
    let itemsFound: any[] = [];

    if (queryLower.includes('expire') && (queryLower.includes('week') || queryLower.includes('7 days'))) {
      const expiringThisWeek = products.flatMap((p) =>
        p.batches
          .filter((b) => {
            const days = getDaysRemaining(b.expiryDate);
            return days >= 0 && days <= 7 && b.quantity > 0;
          })
          .map((b) => ({
            name: p.name,
            batchNumber: b.batchNumber,
            quantity: b.quantity,
            daysRemaining: getDaysRemaining(b.expiryDate),
            sellingPrice: p.sellingPrice,
            location: b.storageLocation,
          }))
      );

      itemsFound = expiringThisWeek;

      if (expiringThisWeek.length === 0) {
        answer = "Great news! According to the database, no products are expiring within the next 7 days. Your inventory is looking healthy.";
      } else {
        const listText = expiringThisWeek
          .map(
            (item) =>
              `• **${item.name}** (Batch ${item.batchNumber}): ${item.quantity} units, expires in ${item.daysRemaining} day(s) [Location: ${item.location}]`
          )
          .join('\n');

        answer = `Here are the **${expiringThisWeek.length} product batch(es)** expiring within this week (7 days):\n\n${listText}\n\n💡 **ShelfSense AI Recommendation**: Prioritize these items using our FEFO protocol or apply a 20%-30% promotional discount immediately to prevent financial loss.`;
      }
    } else if (
      queryLower.includes('sell first') ||
      queryLower.includes('priority') ||
      queryLower.includes('today')
    ) {
      const sellFirstItems = products
        .flatMap((p) =>
          p.batches
            .filter((b) => {
              const days = getDaysRemaining(b.expiryDate);
              return days >= 0 && days <= 14 && b.quantity > 0;
            })
            .map((b) => ({
              name: p.name,
              batchNumber: b.batchNumber,
              quantity: b.quantity,
              daysRemaining: getDaysRemaining(b.expiryDate),
              sellingPrice: p.sellingPrice,
            }))
        )
        .sort((a, b) => a.daysRemaining - b.daysRemaining);

      itemsFound = sellFirstItems;

      if (sellFirstItems.length === 0) {
        answer = "There are no urgent items requiring 'Sell First' prioritization today. All current stock is in safe expiry tiers.";
      } else {
        const top5 = sellFirstItems.slice(0, 5);
        const listText = top5
          .map(
            (item, idx) =>
              `${idx + 1}. 🔥 **${item.name}** (${item.quantity} units, Batch ${item.batchNumber}) — Expires in **${item.daysRemaining} day(s)**.`
          )
          .join('\n');

        answer = `Top priority **"SELL FIRST"** batches for today based on FEFO principle:\n\n${listText}\n\nTotal value at risk for these top items: **₹${top5
          .reduce((acc, curr) => acc + curr.quantity * curr.sellingPrice, 0)
          .toLocaleString()}**.`;
      }
    } else if (queryLower.includes('high risk') || queryLower.includes('critical') || queryLower.includes('risk')) {
      const highRisk = products.flatMap((p) =>
        p.batches
          .filter((b) => {
            const days = getDaysRemaining(b.expiryDate);
            return days >= 0 && days <= 4 && b.quantity > 0;
          })
          .map((b) => ({
            name: p.name,
            batchNumber: b.batchNumber,
            quantity: b.quantity,
            daysRemaining: getDaysRemaining(b.expiryDate),
            riskValue: b.quantity * p.sellingPrice,
          }))
      );

      itemsFound = highRisk;

      if (highRisk.length === 0) {
        answer = "No high-risk inventory detected! All batches have more than 4 days of shelf life remaining.";
      } else {
        const listText = highRisk
          .map(
            (item) =>
              `⚠️ **${item.name}** (${item.quantity} units, Batch ${item.batchNumber}) — Expires in ${item.daysRemaining} day(s). Value at risk: ₹${item.riskValue}.`
          )
          .join('\n');

        answer = `High Expiry Risk Batches Detected:\n\n${listText}\n\nWe recommend marking these items as 'Promotional Priority' immediately.`;
      }
    } else if (queryLower.includes('reorder') || queryLower.includes('low stock')) {
      const lowStock = products.filter((p) => {
        const totalQty = p.batches.reduce((sum, b) => sum + b.quantity, 0);
        return totalQty <= p.minStockLevel;
      });

      if (lowStock.length === 0) {
        answer = "All products are currently above their minimum reorder thresholds. No reorders needed right now.";
      } else {
        const listText = lowStock
          .map(
            (p) =>
              `• **${p.name}** — Total stock: ${p.batches.reduce((sum, b) => sum + b.quantity, 0)} units (Min Threshold: ${p.minStockLevel} units)`
          )
          .join('\n');

        answer = `The following **${lowStock.length} product(s)** are below or near minimum stock levels and should be reordered:\n\n${listText}`;
      }
    } else {
      // General database overview answer
      const totalProductsCount = products.length;
      const totalBatchesCount = products.reduce((acc, p) => acc + p.batches.length, 0);
      const totalUnitsCount = products.reduce(
        (acc, p) => acc + p.batches.reduce((sum, b) => sum + b.quantity, 0),
        0
      );

      const expiringSoonCount = products.reduce(
        (acc, p) =>
          acc +
          p.batches.filter((b) => {
            const days = getDaysRemaining(b.expiryDate);
            return days >= 0 && days <= 14 && b.quantity > 0;
          }).length,
        0
      );

      answer = `**ShelfSense AI Live Inventory Status**:\n\n` +
        `• **Total Products**: ${totalProductsCount} items\n` +
        `• **Total Active Batches**: ${totalBatchesCount} batches\n` +
        `• **Total Units in Stock**: ${totalUnitsCount.toLocaleString()} units\n` +
        `• **Batches Expiring Soon (<= 14 days)**: ${expiringSoonCount} batches\n\n` +
        `You can ask me questions like:\n` +
        `- *"Which products expire this week?"*\n` +
        `- *"What should I sell first today?"*\n` +
        `- *"Which products are at high expiry risk?"*\n` +
        `- *"What products should I reorder?"*`;
    }

    return NextResponse.json({
      answer,
      itemsFound,
      source: 'SmartShelf Database',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
