import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function POST() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: instructor, error: fetchError } = await supabase
    .from('instructors')
    .select('id, profile_completeness')
    .eq('clerk_user_id', userId)
    .single();

  if (fetchError || !instructor) {
    return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
  }

  if (instructor.profile_completeness < 100) {
    return NextResponse.json({ error: 'Profile must be 100% complete before submitting for review' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('listing_flags')
    .select('id')
    .eq('instructor_id', instructor.id)
    .eq('detail', 'profile_review')
    .eq('is_resolved', false)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'A review request is already pending' }, { status: 409 });
  }

  const { error: insertError } = await supabase
    .from('listing_flags')
    .insert({ instructor_id: instructor.id, reason: 'other', detail: 'profile_review', is_resolved: false });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
