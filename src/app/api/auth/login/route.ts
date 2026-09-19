import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDbSeeded } from '@/lib/ensureSeed';

export async function POST(request: Request) {
  try {
    await ensureDbSeeded();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        store: true,
      },
    });

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Determine redirect path based on user role
    let redirectTo = '/dashboard';
    if (user.role === 'OWNER') {
      redirectTo = '/dashboard/owner';
    } else if (user.role === 'SUPERVISOR') {
      redirectTo = '/dashboard/supervisor';
    } else if (user.role === 'STAFF') {
      redirectTo = '/dashboard/staff';
    }

    const sessionData = {
      userId: user.id,
      storeId: user.storeId,
      role: user.role,
      name: user.name,
      email: user.email,
      storeName: user.store.name,
      storeCode: user.store.code,
    };

    const response = NextResponse.json({
      success: true,
      user: sessionData,
      redirectTo,
    });

    // Set cookie
    response.cookies.set({
      name: 'smartshelf_session',
      value: JSON.stringify(sessionData),
      httpOnly: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
