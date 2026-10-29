import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/http/rate-limit';
import { getClerkProfile } from '@/lib/instructors/link';
import { CLAIM_PREFIX, parseClaimDetail } from '@/lib/claims';

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Please sign in to claim a profile' }, { status: 401 });
  }

  const limit = rateLimit(`claim:${userId}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many claim attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const instructorId = typeof body.instructor_id === 'string' ? body.instructor_id.trim() : '';
  const adiNumber = typeof body.adi_number === 'string' ? body.adi_number.trim().slice(0, 40) : '';
  if (!instructorId) {
    return NextResponse.json({ error: 'Missing instructor' }, { status: 400 });
  }

  const profile = await getClerkProfile(userId);
  if (!profile?.email || !profile.emailVerified) {
    return NextResponse.json(
      { error: 'Verify your email address before claiming a profile' },
      { status: 403 },
    );
  }

  const { data: instructor } = await supabase
    .from('instructors')
    .select('id, is_claimed, clerk_user_id, adi_registration')
    .eq('id', instructorId)
    .maybeSingle();

  if (!instructor) {
    return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
  }

  if (instructor.clerk_user_id === userId) {
    return NextResponse.json({ success: true, alreadyLinked: true });
  }

  if (instructor.is_claimed || instructor.clerk_user_id) {
    return NextResponse.json(
      { error: 'This profile is already linked to another account' },
      { status: 409 },
    );
  }

  const { data: pending } = await supabase
    .from('listing_flags')
    .select('id, detail')
    .eq('instructor_id', instructorId)
    .eq('is_resolved', false)
    .like('detail', `${CLAIM_PREFIX}%`);

  const duplicate = (pending || []).find((flag) => parseClaimDetail(flag.detail)?.clerk_user_id === userId);
  if (duplicate) {
    return NextResponse.json({ success: true, alreadyPending: true });
  }

  const detail = `${CLAIM_PREFIX}${JSON.stringify({
    clerk_user_id: userId,
    email: profile.email,
    name: `${profile.firstName} ${profile.lastName}`.trim() || profile.email,
    adi_number: adiNumber,
  })}`;

  const { error } = await supabase.from('listing_flags').insert({
    instructor_id: instructorId,
    reason: 'incorrect_info',
    detail,
    is_resolved: false,
  });

  if (error) {
    console.error('POST /api/claims insert error:', error);
    return NextResponse.json({ error: 'Could not submit your claim' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
