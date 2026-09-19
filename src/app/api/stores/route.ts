import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            products: true,
            batches: true,
            sales: true,
            directives: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate aggregated sales metrics per store
    const storesWithMetrics = await Promise.all(
      stores.map(async (store) => {
        const salesAgg = await prisma.sale.aggregate({
          where: { storeId: store.id },
          _sum: { totalAmount: true },
          _count: { id: true },
        });

        const criticalExpiryCount = await prisma.batch.count({
          where: {
            storeId: store.id,
            status: { in: ['CRITICAL', 'URGENT', 'EXPIRED'] },
          },
        });

        return {
          id: store.id,
          name: store.name,
          code: store.code,
          address: store.address,
          phone: store.phone,
          email: store.email,
          createdAt: store.createdAt,
          userCount: store.users.length,
          users: store.users,
          productCount: store._count.products,
          batchCount: store._count.batches,
          salesCount: salesAgg._count.id || 0,
          totalRevenue: salesAgg._sum.totalAmount || 0,
          criticalExpiryCount,
        };
      })
    );

    return NextResponse.json({ stores: storesWithMetrics });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, address, phone, email } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Store Name and Store Code are required' },
        { status: 400 }
      );
    }

    const cleanCode = code.toUpperCase().trim();

    // Check if store code exists
    const existing = await prisma.store.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Store Code '${cleanCode}' already exists` },
        { status: 400 }
      );
    }

    // 1. Create the store
    const newStore = await prisma.store.create({
      data: {
        name: name.trim(),
        code: cleanCode,
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
      },
    });

    // 2. Create store settings
    await prisma.storeSettings.create({
      data: {
        storeId: newStore.id,
        watchDays: 30,
        warningDays: 14,
        urgentDays: 6,
        criticalDays: 2,
        autoDiscountEnabled: true,
        currencySymbol: '₹',
      },
    });

    // 3. Automatically generate default Staff login for this store
    const staffEmail = `staff.${cleanCode.toLowerCase()}@smartshelf.ai`;
    const defaultStaff = await prisma.user.create({
      data: {
        storeId: newStore.id,
        name: `${name} Staff`,
        email: staffEmail,
        password: 'password123',
        role: 'STAFF',
      },
    });

    // 4. Automatically generate default Supervisor login for this store
    const supervisorEmail = `supervisor.${cleanCode.toLowerCase()}@smartshelf.ai`;
    const defaultSupervisor = await prisma.user.create({
      data: {
        storeId: newStore.id,
        name: `${name} Area Supervisor`,
        email: supervisorEmail,
        password: 'password123',
        role: 'SUPERVISOR',
      },
    });

    return NextResponse.json({
      success: true,
      store: newStore,
      generatedCredentials: {
        staff: { email: staffEmail, password: 'password123', role: 'STAFF' },
        supervisor: { email: supervisorEmail, password: 'password123', role: 'SUPERVISOR' },
      },
    });
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json({ error: 'Failed to create store' }, { status: 500 });
  }
}
