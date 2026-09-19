import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('smartshelf_session');

    if (!sessionCookie?.value) {
      // Default fallback session for instant preview/demo mode
      const defaultOwner = await prisma.user.findFirst({
        where: { role: 'OWNER' },
        include: { store: true },
      }).catch(() => null);

      if (defaultOwner) {
        return NextResponse.json({
          authenticated: false,
          user: {
            userId: defaultOwner.id,
            storeId: defaultOwner.storeId,
            role: defaultOwner.role,
            name: defaultOwner.name,
            email: defaultOwner.email,
            storeName: defaultOwner.store?.name || 'FreshMart Supermarket',
            storeCode: defaultOwner.store?.code || 'STORE-001',
          },
        });
      }

      return NextResponse.json({
        authenticated: false,
        user: {
          userId: 'demo-owner-id',
          storeId: 'demo-store-001',
          role: 'OWNER',
          name: 'Rahul Sharma (Super Admin)',
          email: 'owner@smartshelf.ai',
          storeName: 'FreshMart Supermarket - Indiranagar',
          storeCode: 'STORE-001',
        },
      });
    }

    const sessionData = JSON.parse(sessionCookie.value);
    return NextResponse.json({
      authenticated: true,
      user: sessionData,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      authenticated: false,
      user: {
        userId: 'demo-owner-id',
        storeId: 'demo-store-001',
        role: 'OWNER',
        name: 'Rahul Sharma (Super Admin)',
        email: 'owner@smartshelf.ai',
        storeName: 'FreshMart Supermarket - Indiranagar',
        storeCode: 'STORE-001',
      },
    });
  }
}
