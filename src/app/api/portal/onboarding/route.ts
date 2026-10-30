import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { computeCompleteness } from '@/lib/utils';
import { findOrLinkInstructor, getClerkProfile, syncClerkPhoto } from '@/lib/instructors/link';
import {
  computeOnboardingChecks,
  deriveApprovalStatus,
  isOnboardingStep,
  mergeBusinessInfo,
  normalizeBusinessInfo,
  ONBOARDING_STEPS,
  parseOnboardingDetail,
  sanitizeBusinessPayload,
  sanitizeStepPayload,
  serializeOnboardingDetail,
  validateStepData,
  validateSubmission,
  type BusinessInfo,
  type OnboardingChecks,
  type OnboardingMetadata,
  type OnboardingStep,
} from '@/lib/onboarding';

function generateSlug(firstName: string, lastName: string, userId: string): string {
  const first = firstName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'user';
  const last = (lastName || firstName).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || userId.substring(0, 4);
  const suffix = userId.substring(0, 4);
  return `${first}-${last}-${suffix}`;
}

type FlagRow = {
  id: string;
  detail: string | null;
  is_resolved: boolean | null;
  created_at?: string | null;
};

async function loadInstructor(userId: string, profile: Awaited<ReturnType<typeof getClerkProfile>>) {
  const { instructor } = await findOrLinkInstructor(userId, profile);
  if (instructor) return instructor;

  const first = profile?.firstName || 'User';
  const last = profile?.lastName || 'Instructor';
  const row = {
    slug: generateSlug(first, last, userId),
    first_name: first,
    last_name: last,
    email: profile?.email || '',
    profile_photo_url: profile?.imageUrl || '',
    clerk_user_id: userId,
    suburb: 'Unknown',
    state: 'VIC',
    status: 'draft',
  };

  const { data, error } = await supabase!
    .from('instructors')
    .insert(row)
    .select('*')
    .single();

  if (!error && data) return data as Record<string, unknown>;

  // A concurrent request may have created the row between the lookup and insert.
  const { data: existing } = await supabase!
    .from('instructors')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  if (existing) return existing as Record<string, unknown>;

  throw new Error(error?.message || 'Could not create instructor profile');
}

async function loadFlags(instructorId: string): Promise<FlagRow[]> {
  const { data, error } = await supabase!
    .from('listing_flags')
    .select('id, detail, is_resolved, created_at')
    .eq('instructor_id', instructorId);

  if (error) throw new Error(error.message);
  return (data || []) as FlagRow[];
}

function metadataFlag(flags: FlagRow[]): FlagRow | undefined {
  return flags.find((flag) => parseOnboardingDetail(flag.detail));
}

function pendingFlag(flags: FlagRow[]): FlagRow | undefined {
  return flags.find((flag) => flag.detail === 'profile_review' && !flag.is_resolved);
}

function metadataFromFlags(flags: FlagRow[]): OnboardingMetadata | null {
  return (
    flags
      .map((flag) => parseOnboardingDetail(flag.detail))
      .find((value): value is OnboardingMetadata => Boolean(value)) || null
  );
}

async function saveMetadata(
  instructorId: string,
  metadata: OnboardingMetadata,
  existingFlag?: FlagRow,
) {
  const detail = serializeOnboardingDetail(metadata);
  if (existingFlag) {
    const { error } = await supabase!
      .from('listing_flags')
      .update({ detail })
      .eq('id', existingFlag.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase!.from('listing_flags').insert({
    instructor_id: instructorId,
    reason: 'other',
    detail,
    is_resolved: true,
  });
  if (error) throw new Error(error.message);
}

async function ensurePendingFlag(instructorId: string, existing?: FlagRow) {
  if (existing) return;
  const { error } = await supabase!.from('listing_flags').insert({
    instructor_id: instructorId,
    reason: 'other',
    detail: 'profile_review',
    is_resolved: false,
  });
  if (error) throw new Error(error.message);
}

function firstIncompleteStep(checks: OnboardingChecks): OnboardingStep {
  for (const step of ONBOARDING_STEPS) {
    if (step === 'review') continue;
    if (!checks[step].complete) return step;
  }
  return 'review';
}

function buildPayload(
  instructor: Record<string, unknown>,
  profile: Awaited<ReturnType<typeof getClerkProfile>>,
  flags: FlagRow[],
) {
  const meta = metadataFromFlags(flags);
  const business = normalizeBusinessInfo(meta?.business);
  const pending = pendingFlag(flags);
  const status = deriveApprovalStatus(instructor, Boolean(pending));
  const checks = computeOnboardingChecks(instructor, business);
  const nextStep = firstIncompleteStep(checks);
  const allComplete = ONBOARDING_STEPS.every(
    (step) => step === 'review' || checks[step].complete,
  );

  return {
    instructor: {
      ...instructor,
      email: instructor.email || profile?.email || '',
    },
    business,
    onboarding: {
      status,
      step: meta?.step || nextStep,
      nextStep,
      checks,
      allComplete,
      canSubmit: allComplete && status !== 'pending_review' && status !== 'approved',
      hasPendingReview: Boolean(pending) || status === 'pending_review',
      submittedAt: meta?.submitted_at || pending?.created_at || null,
      reviewedAt: meta?.reviewed_at || null,
      reviewNote: meta?.review_note || null,
    },
  };
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unexpected error';
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const profile = await getClerkProfile(userId);
    let instructor = await loadInstructor(userId, profile);
    instructor = await syncClerkPhoto(instructor, profile);
    const flags = await loadFlags(String(instructor.id));
    return NextResponse.json(buildPayload(instructor, profile, flags), {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(req: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const step = body.step;
  if (!isOnboardingStep(step)) {
    return NextResponse.json({ error: 'Invalid onboarding step' }, { status: 400 });
  }

  const data = body.data && typeof body.data === 'object' ? body.data : {};
  const validationErrors = validateStepData(step, data);
  if (validationErrors.length > 0) {
    return NextResponse.json(
      { error: validationErrors[0], errors: validationErrors },
      { status: 400 },
    );
  }

  try {
    const profile = await getClerkProfile(userId);
    const instructor = await loadInstructor(userId, profile);
    const flags = await loadFlags(String(instructor.id));
    const meta = metadataFromFlags(flags);
    const metaFlag = metadataFlag(flags);
    let business = normalizeBusinessInfo(meta?.business);

    let updated = { ...instructor };

    if (step === 'business') {
      business = mergeBusinessInfo(business, sanitizeBusinessPayload(data));
    } else {
      const updates = sanitizeStepPayload(step, data);
      // These columns are NOT NULL. An empty field should not replace a valid
      // value with null.
      for (const field of ['first_name', 'last_name', 'suburb', 'state']) {
        if (field in updates && updates[field] === null) delete updates[field];
      }

      updated = { ...instructor, ...updates };
      updated.profile_completeness = computeCompleteness(updated);

      if (Object.keys(updates).length > 0 || step === 'review') {
        const { error } = await supabase
          .from('instructors')
          .update({
            ...updates,
            profile_completeness: updated.profile_completeness,
          })
          .eq('id', String(instructor.id));
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
    }

    const nextMeta: OnboardingMetadata = {
      step,
      business,
      submitted_at: meta?.submitted_at || null,
      reviewed_at: meta?.reviewed_at || null,
      review_note: meta?.review_note || null,
    };
    await saveMetadata(String(instructor.id), nextMeta, metaFlag);

    const refreshedFlags = await loadFlags(String(instructor.id));
    return NextResponse.json(buildPayload(updated, profile, refreshedFlags));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    // An empty body means "submit", which keeps the endpoint easy to call.
  }

  if (body.action && body.action !== 'submit') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  try {
    const profile = await getClerkProfile(userId);
    const instructor = await loadInstructor(userId, profile);
    const flags = await loadFlags(String(instructor.id));
    const pending = pendingFlag(flags);
    const status = deriveApprovalStatus(instructor, Boolean(pending));

    if (status === 'approved') {
      return NextResponse.json({ error: 'This profile is already approved' }, { status: 409 });
    }

    if (pending) {
      return NextResponse.json(buildPayload(instructor, profile, flags));
    }

    const meta = metadataFromFlags(flags);
    const business = normalizeBusinessInfo(meta?.business);
    const validation = validateSubmission(instructor, business);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Complete the required registration details before submitting.',
          errors: validation.errors,
        },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const updates = {
      status: 'pending_review',
      identity_verified_at: now,
      documents_submitted_at: now,
      profile_completeness: computeCompleteness(instructor),
    };
    const { error } = await supabase
      .from('instructors')
      .update(updates)
      .eq('id', String(instructor.id));
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await ensurePendingFlag(String(instructor.id), pending);
    await saveMetadata(
      String(instructor.id),
      {
        step: 'review',
        business,
        submitted_at: now,
        reviewed_at: null,
        review_note: null,
      },
      metadataFlag(flags),
    );

    const updated = { ...instructor, ...updates };
    const refreshedFlags = await loadFlags(String(instructor.id));
    return NextResponse.json(buildPayload(updated, profile, refreshedFlags));
  } catch (error) {
    return errorResponse(error);
  }
}
