import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ isAdmin: false, error: 'Not authenticated' }, { status: 401 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ isAdmin: false, error: 'Failed to fetch user' });
  }

  const isAdmin = user.publicMetadata?.role === 'admin';

  return NextResponse.json({ isAdmin });
}
