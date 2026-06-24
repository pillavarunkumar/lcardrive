import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminSession } from '@/lib/admin-session';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const normalizedEmail = email?.toString().trim().toLowerCase();
  const adminSecret = process.env.ADMIN_SECRET;

  if (
    normalizedEmail &&
    adminEmails.length > 0 &&
    adminEmails.includes(normalizedEmail) &&
    password === adminSecret
  ) {
    const cookieStore = await cookies();
    const adminSession = await createAdminSession(normalizedEmail);
    cookieStore.set('admin_session', adminSession.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: adminSession.maxAge,
      path: '/',
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { success: false, error: 'Invalid email or password' },
    { status: 401 },
  );
}
