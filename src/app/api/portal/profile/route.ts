import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { computeCompleteness } from '@/lib/utils';
import { findOrLinkInstructor, getClerkProfile, syncClerkPhoto } from '@/lib/instructors/link';
import {
  computeOnboardingChecks,
  deriveApprovalStatus,
  normalizeBusinessInfo,
  parseOnboardingDetail,
} from '@/lib/onboarding';
import type { NextRequest } from 'next/server';

function generateSlug(firstName: string, lastName: string, userId: string): string {
  const first = firstName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'user';
  const last = (lastName || firstName).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || userId.substring(0, 4);
  const suffix = userId.substring(0, 4);
  return `${first}-${last}-${suffix}`;
}

export async function GET(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getClerkProfile(userId);
  const { instructor: found } = await findOrLinkInstructor(userId, profile);

  if (!found) {
    return NextResponse.json({ instructor: null, hasPendingReview: false });
  }

  // Keep the public profile photo in sync with the signed-in Clerk (Google)
  // account so the listing always shows the same image as the Gmail photo.
  const data = await syncClerkPhoto(found, profile);

  const { data: flags } = await supabase
    .from('listing_flags')
    .select('detail, is_resolved')
    .eq('instructor_id', data.id);
  const flagRows = (flags || []) as Array<{ detail: string | null; is_resolved: boolean | null }>;

  const hasPendingReview = flagRows.some(
    (flag) => flag.detail === 'profile_review' && !flag.is_resolved,
  );
  const isDeactivated = flagRows.some(
    (flag) => flag.detail === 'deactivated' && !flag.is_resolved,
  );

  const metadata = flagRows
    .map((flag) => parseOnboardingDetail(flag.detail))
    .find((value) => Boolean(value));
  const business = normalizeBusinessInfo(metadata?.business);
  const approvalStatus = deriveApprovalStatus(data, hasPendingReview);
  const checks = computeOnboardingChecks(data, business);

  return NextResponse.json({
    instructor: { ...data, is_hidden: isDeactivated },
    hasPendingReview,
    approvalStatus,
    reviewNote: metadata?.review_note || null,
    onboarding: {
      status: approvalStatus,
      step: metadata?.step || 'account',
      checks,
      submittedAt: metadata?.submitted_at || null,
      reviewNote: metadata?.review_note || null,
    },
  });
}

export async function PUT(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const allowedFields = [
    'first_name', 'last_name', 'email',
    'bio', 'phone', 'suburb', 'state', 'postcode',
    'licence_types', 'transmission', 'lesson_duration_mins',
    'specialises_anxiety', 'accepts_international', 'languages',
    'vehicle_make', 'vehicle_model', 'vehicle_year', 'vehicle_rego', 'vehicle_color', 'dual_controls',
    'drivers_licence_number', 'drivers_licence_expiry',
    'adi_registration', 'adi_registration_expiry',
    'certificate_iv_reference', 'certificate_iv_date',
    'wwcc_number', 'wwcc_expiry',
    'police_check_date',
    'medical_assessment_date', 'medical_assessment_expiry',
    'public_liability_provider', 'public_liability_policy_number', 'public_liability_expiry',
    'drivers_licence_image_url', 'adi_registration_image_url',
    'certificate_iv_image_url', 'wwcc_image_url',
    'police_check_image_url', 'medical_assessment_image_url',
    'public_liability_image_url', 'vehicle_image_url',
    'social_facebook', 'social_google_biz',
    'hourly_rate', 'package_options',
    'service_suburbs', 'service_radius_km', 'familiar_test_centres',
    'availability_days', 'availability_slots',
    'teaching_style', 'primary_learner_types', 'vehicle_transmission',
    'years_experience', 'gender',
    'profile_photo_url',
  ];

  const sanitized: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) {
      sanitized[key] = body[key];
    }
  }

  // Clerk is the source of truth for the account's Google profile photo.
  const profile = await getClerkProfile(userId);
  const { instructor: existing } = await findOrLinkInstructor(userId, profile);
  const clerkImageUrl = profile?.imageUrl || '';
  const clerkEmail = profile?.email || '';
  const clerkFirstName = profile?.firstName || '';
  const clerkLastName = profile?.lastName || '';

  // Fetch existing record so computeCompleteness sees all fields, not just the partial update
  const merged = {
    ...existing,
    ...sanitized,
    ...(clerkImageUrl ? { profile_photo_url: clerkImageUrl } : {}),
  };
  const completeness = computeCompleteness(merged);

  const data: Record<string, unknown> = {
    ...sanitized,
    profile_completeness: completeness,
    clerk_user_id: userId,
  };

  // Always provide slug — required NOT NULL for both new and existing records
  data.slug = existing?.slug || generateSlug(
    (sanitized.first_name as string) || existing?.first_name || clerkFirstName || 'User',
    (sanitized.last_name as string) || existing?.last_name || clerkLastName || '',
    userId,
  );
  // Ensure NOT NULL columns always have a value in the upsert row
  data.first_name = sanitized.first_name || existing?.first_name || clerkFirstName || 'User';
  {
    const last = existing?.last_name;
    const isAutoGen = last && (last.includes('_') || /\d/.test(last));
    data.last_name = sanitized.last_name || (isAutoGen ? undefined : last) || sanitized.first_name as string || existing?.first_name || clerkLastName || 'Instructor';
  }

  // If names are default fallbacks, use the Clerk account name.
  if (!existing && (data.first_name === 'User' || data.last_name === 'Instructor')) {
    if (clerkFirstName) data.first_name = clerkFirstName;
    if (clerkLastName) data.last_name = clerkLastName;
  }

  // Keep the public photo identical to the Google/Clerk profile photo.
  data.profile_photo_url =
    clerkImageUrl || (data.profile_photo_url as string) || existing?.profile_photo_url || '';
  data.email = data.email || clerkEmail || existing?.email || '';
  data.suburb = sanitized.suburb || existing?.suburb || 'Unknown';

  if (existing?.id) {
    const { error } = await supabase
      .from('instructors')
      .update(data)
      .eq('id', existing.id);

    if (error) {
      console.error('PUT /api/portal/profile update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const { error } = await supabase
      .from('instructors')
      .upsert(data, { onConflict: 'clerk_user_id' });

    if (error) {
      console.error('PUT /api/portal/profile upsert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
