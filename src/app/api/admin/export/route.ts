import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const EXPORTABLE_TABLES = ['instructors', 'reviews', 'listing_flags', 'search_logs'] as const;

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) =>
    headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      const str = String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(','),
  );
  return [headers.join(','), ...lines].join('\n');
}

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table');
  const format = searchParams.get('format') || 'csv';

  if (!table || !EXPORTABLE_TABLES.includes(table as typeof EXPORTABLE_TABLES[number])) {
    return NextResponse.json({ error: `Invalid table. Must be one of: ${EXPORTABLE_TABLES.join(', ')}` }, { status: 400 });
  }

  const { data, error } = await supabase.from(table).select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'No data found' }, { status: 404 });
  }

  if (format === 'json') {
    return NextResponse.json(data);
  }

  const csv = toCSV(data as Record<string, unknown>[]);
  const filename = `${table}-${new Date().toISOString().split('T')[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
