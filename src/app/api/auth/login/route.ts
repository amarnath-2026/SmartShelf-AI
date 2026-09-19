import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDbSeeded } from '@/lib/ensureSeed';

const DEMO_ACCOUNTS: Record<string, { role: string; name: string; redirect: string }> = {
  'owner@smartshelf.ai': {
    role: 'OWNER',
    name: 'Rahul Sharma (Super Admin)',
    redirect: '/dashboard/owner',
  },
  'supervisor@smartshelf.ai': {
    role: 'SUPERVISOR',
    name: 'Anish Verma (Area Supervisor)',
    redirect: '/dashboard/supervisor',
  },
  'staff1@smartshelf.ai': {
    role: 'STAFF',
    name: 'Priya Patel (Indiranagar Staff)',
    redirect: '/dashboard/staff',
  },
};

export async function POST(request: Request) {
  try {
    await ensureDbSeeded().catch(() => {});

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Safely attempt DB lookup without throwing on serverless read-only FS
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { store: true },
    }).catch(() => null);

    let sessionData: any = null;
    let redirectTo = '/dashboard';

    if (user && user.password === password) {
      if (user.role === 'OWNER') redirectTo = '/dashboard/owner';
      else if (user.role === 'SUPERVISOR') redirectTo = '/dashboard/supervisor';
      else if (user.role === 'STAFF') redirectTo = '/dashboard/staff';

      sessionData = {
        userId: user.id,
        storeId: user.storeId,
        role: user.role,
        name: user.name,
        email: user.email,
        storeName: user.store?.name || 'FreshMart Supermarket',
        storeCode: user.store?.code || 'STORE-001',
      };
    } else if (password === 'password123' && DEMO_ACCOUNTS[cleanEmail]) {
      const demo = DEMO_ACCOUNTS[cleanEmail];
      redirectTo = demo.redirect;
      sessionData = {
        userId: `demo-${demo.role.toLowerCase()}-id`,
        storeId: 'demo-store-001',
        role: demo.role,
        name: demo.name,
        email: cleanEmail,
        storeName: 'FreshMart Supermarket - Indiranagar',
        storeCode: 'STORE-001',
      };
    }

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: sessionData,
      redirectTo,
    });

    response.cookies.set({
      name: 'smartshelf_session',
      value: JSON.stringify(sessionData),
      httpOnly: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Login route error:', error);
    return NextResponse.json(
      { error: 'Login service temporary error', details: String(error?.message || error) },
      { status: 500 }
    );
  }
}
