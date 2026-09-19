import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('smartshelf_session');

    if (!sessionCookie?.value) {
      // Default to owner for demo preview if no session set
      const defaultOwner = await prisma.user.findFirst({
        where: { role: 'OWNER' },
        include: { store: true },
      });

      if (defaultOwner) {
        return NextResponse.json({
          authenticated: false,
          user: {
            userId: defaultOwner.id,
            storeId: defaultOwner.storeId,
            role: defaultOwner.role,
            name: defaultOwner.name,
            email: defaultOwner.email,
            storeName: defaultOwner.store.name,
            storeCode: defaultOwner.store.code,
          },
        });
      }

      return NextResponse.json({ authenticated: false, user: null });
    }

    const sessionData = JSON.parse(sessionCookie.value);
    return NextResponse.json({
      authenticated: true,
      user: sessionData,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}
