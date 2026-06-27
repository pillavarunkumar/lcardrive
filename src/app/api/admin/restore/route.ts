import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-guard';

const ALL_TABLES = ['instructors', 'reviews', 'listing_flags', 'search_logs', 'leads'] as const;

const DELETE_ORDER: readonly (typeof ALL_TABLES[number])[] = ['listing_flags', 'reviews', 'leads', 'instructors', 'search_logs'];
const INSERT_ORDER: readonly (typeof ALL_TABLES[number])[] = ['search_logs', 'instructors', 'leads', 'reviews', 'listing_flags'];

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  let backup: Record<string, unknown[]>;
  try {
    backup = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const missing = ALL_TABLES.filter((t) => !Array.isArray(backup[t]));
  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing tables in backup: ${missing.join(', ')}` }, { status: 400 });
  }

  const results: { table: string; inserted: number; error?: string }[] = [];

  for (const table of DELETE_ORDER) {
    if (!backup[table]) continue;
    const { error: delErr } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delErr) {
      results.push({ table, inserted: 0, error: `delete failed: ${delErr.message}` });
    }
  }

  for (const table of INSERT_ORDER) {
    const rows = backup[table] as Record<string, unknown>[];

    if (!rows || rows.length === 0) {
      results.push({ table, inserted: 0 });
      continue;
    }

    const BATCH_SIZE = 100;
    let inserted = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const { error: insErr } = await supabase.from(table).insert(batch, { defaultToNull: false });
      if (insErr) {
        results.push({ table, inserted, error: `insert failed at row ${i}: ${insErr.message}` });
        break;
      }
      inserted += batch.length;
    }

    if (!results.find((r) => r.table === table && r.inserted !== undefined)) {
      results.push({ table, inserted });
    }
  }

  const totalInserted = results.reduce((acc, r) => acc + r.inserted, 0);
  const errors = results.filter((r) => r.error);

  return NextResponse.json({
    message: errors.length > 0 ? 'Restore completed with errors' : 'Restore complete',
    totalInserted,
    errors: errors.length,
    results,
  });
}
