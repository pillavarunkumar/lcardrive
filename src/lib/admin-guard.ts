import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function requireAdmin() {
  const user = await currentUser();
  if (!user || user.publicMetadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return null;
}
