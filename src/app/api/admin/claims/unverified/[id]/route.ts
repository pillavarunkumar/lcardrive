import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-guard';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard) return guard;
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { action } = await req.json();

  if (action === 'approve' || action === 'reject') {
    if (action === 'approve') {
      const { error } = await supabase
        .from('instructors')
        .update({ is_verified: true, is_claimed: true, status: 'approved' })
        .eq('id', params.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await supabase
        .from('instructors')
        .update({ is_verified: false, status: 'rejected' })
        .eq('id', params.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Any pending profile-review flag is now resolved either way.
    await supabase
      .from('listing_flags')
      .update({ is_resolved: true })
      .eq('instructor_id', params.id)
      .eq('detail', 'profile_review')
      .eq('is_resolved', false);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
