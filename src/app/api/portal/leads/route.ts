import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: instructor } = await supabase
    .from('instructors')
    .select('id')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  if (!instructor) {
    return NextResponse.json({ leads: [] });
  }

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('instructor_id', instructor.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leads: data || [] });
}

export async function PATCH(req: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: instructor } = await supabase
    .from('instructors')
    .select('id')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  if (!instructor) {
    return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
  }

  const { id, status } = await req.json();

  if (!id || !status) {
    return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
  }

  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', id)
    .eq('instructor_id', instructor.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
