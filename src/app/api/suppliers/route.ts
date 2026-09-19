import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const store = await prisma.store.findFirst();
    if (!store) return NextResponse.json({ error: 'No store found' }, { status: 404 });

    const suppliers = await prisma.supplier.findMany({
      where: { storeId: store.id },
      include: {
        products: {
          include: {
            batches: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formatted = suppliers.map((sup) => {
      const productCount = sup.products.length;
      let totalValue = 0;

      sup.products.forEach((p) => {
        p.batches.forEach((b) => {
          totalValue += b.quantity * p.purchasePrice;
        });
      });

      return {
        id: sup.id,
        name: sup.name,
        contactPerson: sup.contactPerson || 'N/A',
        phone: sup.phone || 'N/A',
        email: sup.email || 'N/A',
        address: sup.address || 'N/A',
        productCount,
        totalValue,
      };
    });

    return NextResponse.json({ suppliers: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contactPerson, phone, email, address } = body;

    const store = await prisma.store.findFirst();
    if (!store) return NextResponse.json({ error: 'No store found' }, { status: 404 });

    const supplier = await prisma.supplier.create({
      data: {
        storeId: store.id,
        name,
        contactPerson,
        phone,
        email,
        address,
      },
    });

    return NextResponse.json({ success: true, supplier }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
