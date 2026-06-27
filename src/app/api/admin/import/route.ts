import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-guard';

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = parseLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length === 0) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] || '').trim();
    });
    rows.push(row);
  }
  return rows;
}

function parseLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function toArray(val: string | undefined): string[] {
  if (!val) return [];
  return val.split(';').map((s) => s.trim()).filter(Boolean);
}

function toNumber(val: string | undefined): number | undefined {
  if (!val) return undefined;
  const n = parseFloat(val);
  return isNaN(n) ? undefined : n;
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { csv } = await request.json();
  if (!csv) {
    return NextResponse.json({ error: 'No CSV data provided' }, { status: 400 });
  }

  const rows = parseCSV(csv);
  if (rows.length === 0) {
    return NextResponse.json({ error: 'No rows found in CSV' }, { status: 400 });
  }

  const results: { row: number; status: string; error?: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];

    if (!r.first_name || !r.last_name || !r.suburb) {
      results.push({ row: i + 2, status: 'error', error: 'Missing required fields (first_name, last_name, suburb)' });
      continue;
    }

    const slug = r.slug || `${r.first_name?.toLowerCase()}-${r.last_name?.toLowerCase()}-${r.suburb?.toLowerCase().replace(/\s+/g, '-')}`;

    const { error } = await supabase.from('instructors').insert({
      slug,
      first_name: r.first_name || '',
      last_name: r.last_name || '',
      email: r.email || null,
      phone: r.phone || null,
      bio: r.bio || null,
      profile_photo_url: r.profile_photo_url || null,
      suburb: r.suburb || '',
      state: r.state || 'VIC',
      postcode: r.postcode || null,
      lat: toNumber(r.lat),
      lng: toNumber(r.lng),
      service_suburbs: toArray(r.service_suburbs),
      service_radius_km: toNumber(r.service_radius_km) || 10,
      hourly_rate: toNumber(r.hourly_rate),
      licence_types: toArray(r.licence_types).length ? toArray(r.licence_types) : ['car'],
      transmission: (r.transmission as any) || null,
      lesson_duration_mins: toNumber(r.lesson_duration_mins) || 60,
      vehicle_make: r.vehicle_make || null,
      vehicle_model: r.vehicle_model || null,
      vehicle_year: toNumber(r.vehicle_year),
      dual_controls: r.dual_controls !== 'false',
      languages: toArray(r.languages).length ? toArray(r.languages) : ['English'],
      gender: (r.gender as any) || null,
      adi_registration: r.adi_registration || null,
      years_experience: toNumber(r.years_experience),
      is_claimed: false,
      is_verified: true,
      profile_completeness: toNumber(r.profile_completeness) || 80,
    });

    if (error) {
      results.push({ row: i + 2, status: 'error', error: error.message });
    } else {
      results.push({ row: i + 2, status: 'inserted' });
    }
  }

  const inserted = results.filter((r) => r.status === 'inserted').length;
  const failed = results.filter((r) => r.status === 'error').length;

  return NextResponse.json({ inserted, failed, results });
}
