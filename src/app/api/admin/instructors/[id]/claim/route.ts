import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const { data: existing } = await supabase
    .from('listing_flags')
    .select('id')
    .eq('instructor_id', id)
    .eq('is_resolved', false)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'A pending claim already exists for this instructor' }, { status: 409 });
  }

  const { error } = await supabase
    .from('listing_flags')
    .insert({ instructor_id: id, reason: 'other', detail: 'ownership', is_resolved: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
