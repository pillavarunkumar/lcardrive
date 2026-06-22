import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { action } = await req.json();

  if (action === 'approve') {
    const { data: flag, error: fetchError } = await supabase
      .from('listing_flags')
      .select('instructor_id, detail')
      .eq('id', params.id)
      .single();

    if (fetchError || !flag) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    const { error: updateFlagError } = await supabase
      .from('listing_flags')
      .update({ is_resolved: true })
      .eq('id', params.id);

    if (updateFlagError) {
      return NextResponse.json({ error: updateFlagError.message }, { status: 500 });
    }

    const updateFields: Record<string, boolean> = {};

    if (flag.detail === 'ownership') {
      updateFields.is_claimed = true;
    } else if (flag.detail === 'profile_review') {
      updateFields.is_verified = true;
    }

    if (Object.keys(updateFields).length > 0) {
      const { error: updateInstructorError } = await supabase
        .from('instructors')
        .update(updateFields)
        .eq('id', flag.instructor_id);

      if (updateInstructorError) {
        return NextResponse.json({ error: updateInstructorError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  }

  if (action === 'reject') {
    const { error } = await supabase
      .from('listing_flags')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
