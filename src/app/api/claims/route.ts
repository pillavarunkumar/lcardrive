import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const body = await request.json();
  const { instructor_id, first_name, last_name, email, adi_number } = body;

  if (!instructor_id || !first_name || !last_name || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { error } = await supabase.from('listing_flags').insert({
    instructor_id,
    reason: 'incorrect_info',
    detail: 'ownership',
    is_resolved: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
