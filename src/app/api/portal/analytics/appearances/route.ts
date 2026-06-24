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
    return NextResponse.json({ days: [], totals: [] });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data: logs } = await supabase
    .from('search_logs')
    .select('created_at')
    .gte('created_at', sevenDaysAgo.toISOString())
    .contains('filters_applied', { result_instructor_ids: [instructor.id] })
    .order('created_at', { ascending: true });

  const dayTotals: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    dayTotals[d.toISOString().slice(0, 10)] = 0;
  }

  for (const log of logs || []) {
    const day = log.created_at?.slice(0, 10);
    if (day && day in dayTotals) {
      dayTotals[day]++;
    }
  }

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay();
  const startDay = ((today - 6) % 7 + 7) % 7;
  const orderedLabels = [...labels.slice(startDay), ...labels.slice(0, startDay)];

  return NextResponse.json({
    days: orderedLabels,
    totals: Object.values(dayTotals),
  });
}
