import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import { createAdminSession } from '@/lib/admin-session';

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ isAdmin: false, error: 'Not authenticated' }, { status: 401 });
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (adminEmails.length === 0) {
    return NextResponse.json({ isAdmin: false, error: 'No admin emails configured' });
  }

  const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  });
  if (!clerkRes.ok) {
    return NextResponse.json({ isAdmin: false, error: 'Failed to fetch user' });
  }

  const user = await clerkRes.json();
  const email = user.email_addresses?.[0]?.email_address?.toLowerCase();

  if (!email || !adminEmails.includes(email)) {
    return NextResponse.json({ isAdmin: false });
  }

  const cookieStore = await cookies();
  const adminSession = await createAdminSession(userId);
  cookieStore.set('admin_session', adminSession.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: adminSession.maxAge,
    path: '/',
  });

  return NextResponse.json({ isAdmin: true });
}
