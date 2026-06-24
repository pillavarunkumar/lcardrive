import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ALL_TABLES = ['instructors', 'reviews', 'listing_flags', 'search_logs', 'leads'] as const;

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const backup: Record<string, unknown[]> = {};

  for (const table of ALL_TABLES) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      return NextResponse.json({ error: `Failed to backup ${table}: ${error.message}` }, { status: 500 });
    }
    backup[table] = data || [];
  }

  const filename = `lcardrive-backup-${new Date().toISOString().split('T')[0]}.json`;

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
