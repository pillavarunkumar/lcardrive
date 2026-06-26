import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function POST() {
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: instructor } = await supabase
    .from('instructors')
    .select('id')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  if (!instructor) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Check if already deactivated
  const { data: existing } = await supabase
    .from('listing_flags')
    .select('id')
    .eq('instructor_id', instructor.id)
    .eq('detail', 'deactivated')
    .eq('is_resolved', false)
    .maybeSingle();

  if (existing) {
    // Reactivate: mark as resolved
    const { error } = await supabase
      .from('listing_flags')
      .update({ is_resolved: true })
      .eq('id', existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ active: true });
  }

  // Deactivate: create flag
  const { error } = await supabase
    .from('listing_flags')
    .insert({ instructor_id: instructor.id, reason: 'other', detail: 'deactivated', is_resolved: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ active: false });
}
