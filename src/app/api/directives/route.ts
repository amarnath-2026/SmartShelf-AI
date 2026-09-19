import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    const whereCondition = storeId ? { storeId } : {};

    const directives = await prisma.staffDirective.findMany({
      where: whereCondition,
      include: {
        store: {
          select: { name: true, code: true },
        },
        createdBy: {
          select: { name: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ directives });
  } catch (error) {
    console.error('Error fetching directives:', error);
    return NextResponse.json({ error: 'Failed to fetch directives' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storeId, title, message, priority, createdById, productId, batchId } = body;

    if (!storeId || !title || !message) {
      return NextResponse.json(
        { error: 'storeId, title, and message are required' },
        { status: 400 }
      );
    }

    const directive = await prisma.staffDirective.create({
      data: {
        storeId,
        title,
        message,
        priority: priority || 'URGENT',
        createdById: createdById || null,
        productId: productId || null,
        batchId: batchId || null,
        status: 'PENDING',
      },
    });

    // Also trigger a store notification
    await prisma.notification.create({
      data: {
        storeId,
        title: `📌 New Directive: ${title}`,
        message: message,
        type: priority === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
        read: false,
      },
    });

    return NextResponse.json({ success: true, directive });
  } catch (error) {
    console.error('Error creating directive:', error);
    return NextResponse.json({ error: 'Failed to create directive' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Directive ID and status are required' },
        { status: 400 }
      );
    }

    const updated = await prisma.staffDirective.update({
      where: { id },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, directive: updated });
  } catch (error) {
    console.error('Error updating directive:', error);
    return NextResponse.json({ error: 'Failed to update directive' }, { status: 500 });
  }
}
