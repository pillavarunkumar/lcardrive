import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-guard';
import {
  EMPTY_BUSINESS_INFO,
  normalizeBusinessInfo,
  parseOnboardingDetail,
  serializeOnboardingDetail,
} from '@/lib/onboarding';

type FlagRow = { id: string; detail: string | null; is_resolved: boolean | null };

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard) return guard;
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  let body: { action?: string; note?: string };
  try {
    body = (await req.json()) as { action?: string; note?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body.action !== 'approve' && body.action !== 'reject') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const instructorId = params.id;
  const { data: instructor, error: instructorError } = await supabase
    .from('instructors')
    .select('id, first_name, last_name')
    .eq('id', instructorId)
    .maybeSingle();

  if (instructorError) {
    return NextResponse.json({ error: instructorError.message }, { status: 500 });
  }
  if (!instructor) {
    return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
  }

  const { data: flags, error: flagsError } = await supabase
    .from('listing_flags')
    .select('id, detail, is_resolved')
    .eq('instructor_id', instructorId);

  if (flagsError) {
    return NextResponse.json({ error: flagsError.message }, { status: 500 });
  }

  const rows = (flags || []) as FlagRow[];
  const metadataFlag = rows.find((flag) => parseOnboardingDetail(flag.detail));
  const metadata = metadataFlag ? parseOnboardingDetail(metadataFlag.detail) : null;
  const business = metadata ? normalizeBusinessInfo(metadata.business) : EMPTY_BUSINESS_INFO;
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : '';

  const updates =
    body.action === 'approve'
      ? { is_verified: true, is_claimed: true, status: 'approved' }
      : { is_verified: false, status: 'rejected' };

  const { error: updateError } = await supabase
    .from('instructors')
    .update(updates)
    .eq('id', instructorId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { error: resolveError } = await supabase
    .from('listing_flags')
    .update({ is_resolved: true })
    .eq('instructor_id', instructorId)
    .eq('detail', 'profile_review')
    .eq('is_resolved', false);

  if (resolveError) {
    return NextResponse.json({ error: resolveError.message }, { status: 500 });
  }

  const now = new Date().toISOString();
  const detail = serializeOnboardingDetail({
    step: 'review',
    business,
    submitted_at: metadata?.submitted_at || now,
    reviewed_at: now,
    review_note: note || null,
  });

  if (metadataFlag) {
    const { error } = await supabase
      .from('listing_flags')
      .update({ detail })
      .eq('id', metadataFlag.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const { error } = await supabase.from('listing_flags').insert({
      instructor_id: instructorId,
      reason: 'other',
      detail,
      is_resolved: true,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, status: updates.status });
}
