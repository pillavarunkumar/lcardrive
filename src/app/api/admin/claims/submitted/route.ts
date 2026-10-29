import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-guard';
import { isOwnershipFlag, parseClaimDetail } from '@/lib/claims';

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  // Fetch broadly and filter in code so both the legacy `ownership` value and
  // the newer JSON `claim:` payloads are supported by the existing schema.
  const { data: flags, error } = await supabase
    .from('listing_flags')
    .select('id, instructor_id, reason, detail, created_at')
    .eq('is_resolved', false)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ownershipFlags = (flags || []).filter((flag) => isOwnershipFlag(flag.detail));
  const instructorIds = [...new Set(ownershipFlags.map((flag) => flag.instructor_id).filter(Boolean))];

  let instructors: Record<string, any>[] = [];
  if (instructorIds.length > 0) {
    const { data } = await supabase
      .from('instructors')
      .select('id, first_name, last_name, suburb, adi_registration, is_claimed, clerk_user_id')
      .in('id', instructorIds);
    instructors = data || [];
  }
  const byId = new Map(instructors.map((instructor) => [instructor.id, instructor]));

  return NextResponse.json({
    claims: ownershipFlags.map((flag) => {
      const instructor = byId.get(flag.instructor_id);
      const claim = parseClaimDetail(flag.detail);
      return {
        id: flag.id,
        instructor_id: flag.instructor_id,
        instructor_name: instructor
          ? `${instructor.first_name} ${instructor.last_name}`.trim()
          : 'Unknown instructor',
        suburb: instructor?.suburb || '',
        adi_registration: claim?.adi_number || instructor?.adi_registration || null,
        claimant_name: claim?.name || null,
        claimant_email: claim?.email || null,
        already_claimed: Boolean(instructor?.is_claimed),
        reason: 'ownership',
        detail: flag.detail,
        created_at: flag.created_at,
      };
    }),
    total: ownershipFlags.length,
  });
}
