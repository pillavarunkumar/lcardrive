import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { computeCompleteness } from '@/lib/utils';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('instructors')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let hasPendingReview = false;
  if (data?.id) {
    const { data: flag } = await supabase
      .from('listing_flags')
      .select('id')
      .eq('instructor_id', data.id)
      .eq('detail', 'profile_review')
      .eq('is_resolved', false)
      .maybeSingle();
    hasPendingReview = !!flag;
  }

  return NextResponse.json({ instructor: data, hasPendingReview });
}

export async function PUT(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const completeness = computeCompleteness(body);

  const { error } = await supabase
    .from('instructors')
    .upsert({ ...body, profile_completeness: completeness, clerk_user_id: userId }, { onConflict: 'clerk_user_id' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
