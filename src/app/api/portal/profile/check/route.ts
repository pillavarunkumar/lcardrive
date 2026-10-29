import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { findOrLinkInstructor, getClerkProfile } from '@/lib/instructors/link';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ exists: false });
  }

  // Also links an imported, unclaimed listing when the signed-in user has a
  // verified email that matches it. Without this, login checks would say the
  // instructor does not exist and sign them out.
  const profile = await getClerkProfile(userId);
  const { instructor } = await findOrLinkInstructor(userId, profile);

  return NextResponse.json(
    { exists: Boolean(instructor) },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
