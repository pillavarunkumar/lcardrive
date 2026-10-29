import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

/**
 * One round-trip replacement for the previous pair of Header requests
 * (/api/admin/login-via-clerk + /api/portal/profile/check).
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ isAdmin: false, isInstructor: false }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  }

  let isAdmin = false;
  try {
    const user = await currentUser();
    isAdmin = user?.publicMetadata?.role === 'admin';
  } catch (error) {
    console.warn('Could not read Clerk role:', error);
  }

  let isInstructor = false;
  if (supabase) {
    const { count } = await supabase
      .from('instructors')
      .select('id', { count: 'exact', head: true })
      .eq('clerk_user_id', userId);
    isInstructor = (count ?? 0) > 0;
  }

  return NextResponse.json(
    { isAdmin, isInstructor },
    { headers: { 'Cache-Control': 'private, max-age=60' } },
  );
}
