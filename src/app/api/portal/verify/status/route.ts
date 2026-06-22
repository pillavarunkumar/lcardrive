import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('instructors')
    .select('is_verified, verified_name, identity_verified_at, documents_submitted_at')
    .eq('clerk_user_id', userId)
    .single();

  if (error) {
    return NextResponse.json({ is_verified: false });
  }

  return NextResponse.json({
    is_verified: data?.is_verified ?? false,
    verified_name: data?.verified_name ?? null,
    identity_verified_at: data?.identity_verified_at ?? null,
    documents_submitted_at: data?.documents_submitted_at ?? null,
  });
}
