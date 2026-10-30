import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-guard';
import {
  computeOnboardingChecks,
  deriveApprovalStatus,
  normalizeBusinessInfo,
  parseOnboardingDetail,
} from '@/lib/onboarding';

type FlagRow = { id: string; instructor_id: string; detail: string | null; is_resolved: boolean | null; created_at?: string | null };

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { data: flags, error } = await supabase
    .from('listing_flags')
    .select('id, instructor_id, detail, is_resolved, created_at')
    .eq('is_resolved', false)
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const pendingFlags = ((flags || []) as FlagRow[]).filter(
    (flag) => flag.detail === 'profile_review',
  );
  const instructorIds = [...new Set(pendingFlags.map((flag) => flag.instructor_id))];

  if (instructorIds.length === 0) {
    return NextResponse.json({ submissions: [], total: 0 });
  }

  const [{ data: instructors, error: instructorError }, { data: allFlags }] = await Promise.all([
    supabase
      .from('instructors')
      .select('id, first_name, last_name, email, phone, suburb, state, postcode, adi_registration, hourly_rate, status, is_verified, profile_photo_url, created_at')
      .in('id', instructorIds),
    supabase
      .from('listing_flags')
      .select('id, instructor_id, detail, is_resolved')
      .in('instructor_id', instructorIds),
  ]);

  if (instructorError) {
    return NextResponse.json({ error: instructorError.message }, { status: 500 });
  }

  const byId = new Map((instructors || []).map((row: Record<string, unknown>) => [String(row.id), row]));
  const metadataByInstructor = new Map<string, ReturnType<typeof parseOnboardingDetail>>();
  for (const flag of (allFlags || []) as FlagRow[]) {
    const metadata = parseOnboardingDetail(flag.detail);
    if (metadata) metadataByInstructor.set(flag.instructor_id, metadata);
  }

  const submissions = pendingFlags
    .map((flag) => {
      const instructor = byId.get(flag.instructor_id);
      if (!instructor) return null;
      const metadata = metadataByInstructor.get(flag.instructor_id) || null;
      const business = normalizeBusinessInfo(metadata?.business);
      const status = deriveApprovalStatus(instructor, true);
      const checks = computeOnboardingChecks(instructor, business);
      return {
        instructor_id: flag.instructor_id,
        instructor_name: `${instructor.first_name || ''} ${instructor.last_name || ''}`.trim() || 'Instructor',
        email: instructor.email || '',
        phone: instructor.phone || '',
        suburb: instructor.suburb || '',
        state: instructor.state || '',
        adi_registration: instructor.adi_registration || '',
        hourly_rate: instructor.hourly_rate || null,
        profile_photo_url: instructor.profile_photo_url || '',
        status,
        business,
        submitted_at: metadata?.submitted_at || flag.created_at || null,
        review_note: metadata?.review_note || null,
        checks,
        complete: Object.values(checks).every((check) => check.complete),
      };
    })
    .filter(Boolean)
    .sort((a, b) => String(b?.submitted_at || '').localeCompare(String(a?.submitted_at || '')));

  return NextResponse.json(
    { submissions, total: submissions.length },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
