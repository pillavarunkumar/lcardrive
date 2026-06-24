import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { computeCompleteness } from '@/lib/utils';
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

  const { data, error } = await supabase
    .from('instructors')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Auto-create row if it doesn't exist yet (catches OAuth signups, failed signup PUTs, etc.)
  if (!data) {
    let firstName = 'User';
    let lastName = 'Instructor';
    let email = '';
    let profilePhotoUrl = '';
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      firstName = clerkUser.firstName || firstName;
      lastName = clerkUser.lastName || clerkUser.firstName || lastName;
      email = clerkUser.emailAddresses?.[0]?.emailAddress || '';
      profilePhotoUrl = clerkUser.imageUrl || '';
    } catch (e) {
      console.warn('Could not fetch Clerk user for auto-create:', e);
    }

    const slug = generateSlug(firstName, lastName, userId);

    const { error: insertError } = await supabase
      .from('instructors')
      .upsert({
        clerk_user_id: userId,
        slug,
        first_name: firstName,
        last_name: lastName,
        email,
        profile_photo_url: profilePhotoUrl,
        suburb: 'Unknown',
        profile_completeness: 0,
      }, { onConflict: 'clerk_user_id' });

    if (insertError) {
      console.error('Auto-create instructor row error:', insertError);
      return NextResponse.json({ instructor: null, hasPendingReview: false });
    }

    const { data: newData } = await supabase
      .from('instructors')
      .select('*')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    return NextResponse.json({ instructor: newData ?? null, hasPendingReview: false });
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

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

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

  // Fetch existing record so computeCompleteness sees all fields, not just the partial update
  const { data: existing } = await supabase
    .from('instructors')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  const merged = { ...existing, ...sanitized };
  const completeness = computeCompleteness(merged);

  const upsertData: Record<string, unknown> = {
    ...sanitized,
    profile_completeness: completeness,
    clerk_user_id: userId,
  };

  // Always provide slug — required NOT NULL for both new and existing records
  upsertData.slug = existing?.slug || generateSlug(
    (sanitized.first_name as string) || existing?.first_name || 'User',
    (sanitized.last_name as string) || existing?.last_name || '',
    userId,
  );
  // Ensure NOT NULL columns always have a value in the upsert row
  upsertData.first_name = sanitized.first_name || existing?.first_name || 'User';
  {
    const last = existing?.last_name;
    const isAutoGen = last && (last.includes('_') || /\d/.test(last));
    upsertData.last_name = sanitized.last_name || (isAutoGen ? undefined : last) || sanitized.first_name as string || existing?.first_name || 'Instructor';
  }
  upsertData.suburb = sanitized.suburb || existing?.suburb || 'Unknown';

  const { error } = await supabase
    .from('instructors')
    .upsert(upsertData, { onConflict: 'clerk_user_id' });

  if (error) {
    console.error('PUT /api/portal/profile upsert error:', error);
    return NextResponse.json({
      error: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
