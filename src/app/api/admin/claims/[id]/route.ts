import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-guard';
import { parseClaimDetail } from '@/lib/claims';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard) return guard;
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  let action: string;
  try {
    ({ action } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (action === 'approve') {
    const { data: flag, error: fetchError } = await supabase
      .from('listing_flags')
      .select('instructor_id, detail')
      .eq('id', params.id)
      .single();

    if (fetchError || !flag) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    const claim = parseClaimDetail(flag.detail);

    if (flag.detail === 'ownership' || claim) {
      const updateFields: Record<string, unknown> = { is_claimed: true };
      if (claim?.clerk_user_id) updateFields.clerk_user_id = claim.clerk_user_id;
      if (claim?.adi_number) {
        const { data: instructor } = await supabase
          .from('instructors')
          .select('adi_registration')
          .eq('id', flag.instructor_id)
          .maybeSingle();
        if (!instructor?.adi_registration) updateFields.adi_registration = claim.adi_number;
      }

      const { error: updateInstructorError } = await supabase
        .from('instructors')
        .update(updateFields)
        .eq('id', flag.instructor_id);

      if (updateInstructorError) {
        const message =
          updateInstructorError.code === '23505'
            ? 'That Clerk account is already linked to another instructor listing.'
            : updateInstructorError.message;
        return NextResponse.json({ error: message }, { status: 409 });
      }
    } else if (flag.detail === 'profile_review') {
      const { error: updateInstructorError } = await supabase
        .from('instructors')
        .update({ is_verified: true })
        .eq('id', flag.instructor_id);

      if (updateInstructorError) {
        return NextResponse.json({ error: updateInstructorError.message }, { status: 500 });
      }
    }

    const { error: updateFlagError } = await supabase
      .from('listing_flags')
      .update({ is_resolved: true })
      .eq('id', params.id);

    if (updateFlagError) {
      return NextResponse.json({ error: updateFlagError.message }, { status: 500 });
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
