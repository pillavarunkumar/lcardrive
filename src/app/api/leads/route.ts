import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/http/rate-limit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const limit = rateLimit(`lead:${ip}`, 10, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many enquiries. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const instructorId = clean(body.instructor_id, 64);
  const name = clean(body.name, 100);
  const email = clean(body.email, 200).toLowerCase();
  const phone = clean(body.phone, 30);
  const suburb = clean(body.suburb, 100);
  const message = clean(body.message, 1000);

  if (!instructorId || !name || !email) {
    return NextResponse.json({ error: 'Name, email and instructor are required' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
  }

  const { data: instructor } = await supabase
    .from('instructors')
    .select('id')
    .eq('id', instructorId)
    .eq('is_verified', true)
    .maybeSingle();

  if (!instructor) {
    return NextResponse.json({ error: 'Instructor not available' }, { status: 404 });
  }

  const { error } = await supabase.from('leads').insert({
    instructor_id: instructorId,
    name,
    email,
    phone: phone || null,
    suburb: suburb || null,
    service: 'profile_contact',
    message: message || null,
    status: 'new',
  });

  if (error) {
    console.error('POST /api/leads insert error:', error);
    return NextResponse.json({ error: 'Could not send your enquiry' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
