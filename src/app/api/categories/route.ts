import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const SUPERMARKET_CATEGORIES = [
  { name: 'Groceries & Staples', icon: 'ShoppingBag', color: 'emerald' },
  { name: 'Dairy & Eggs', icon: 'Milk', color: 'blue' },
  { name: 'Fruits & Vegetables', icon: 'Apple', color: 'green' },
  { name: 'Beverages', icon: 'CupSoda', color: 'purple' },
  { name: 'Snacks & Biscuits', icon: 'Cookie', color: 'amber' },
  { name: 'Bakery & Bread', icon: 'Wheat', color: 'orange' },
  { name: 'Packaged & Instant Foods', icon: 'Zap', color: 'red' },
  { name: 'Frozen Foods', icon: 'IceCream', color: 'cyan' },
  { name: 'Meat & Seafood', icon: 'Fish', color: 'rose' },
  { name: 'Personal Care', icon: 'Smile', color: 'pink' },
  { name: 'Household Cleaning', icon: 'Sparkles', color: 'indigo' },
  { name: 'Baby Care', icon: 'Baby', color: 'sky' },
  { name: 'Health & Wellness', icon: 'HeartPulse', color: 'teal' },
  { name: 'Home & Kitchen', icon: 'Home', color: 'yellow' },
  { name: 'Stationery & School Supplies', icon: 'BookOpen', color: 'slate' },
  { name: 'Pet Care', icon: 'Dog', color: 'stone' },
  { name: 'Pooja & Religious Items', icon: 'Flame', color: 'amber' },
  { name: 'Automotive & Utility', icon: 'Wrench', color: 'zinc' },
  { name: 'Clothing & Accessories', icon: 'Shirt', color: 'violet' },
  { name: 'Seasonal Products', icon: 'Sun', color: 'lime' },
];

export async function GET() {
  try {
    const store = await prisma.store.findFirst();
    if (!store) return NextResponse.json({ error: 'No store found' }, { status: 404 });

    // Fetch existing categories for store
    let categories = await prisma.category.findMany({
      where: { storeId: store.id },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Auto-provision any missing standard categories
    const existingNames = new Set(categories.map((c) => c.name));
    const missing = SUPERMARKET_CATEGORIES.filter((c) => !existingNames.has(c.name));

    if (missing.length > 0) {
      await prisma.category.createMany({
        data: missing.map((c) => ({
          storeId: store.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
        })),
      });

      categories = await prisma.category.findMany({
        where: { storeId: store.id },
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    }

    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
