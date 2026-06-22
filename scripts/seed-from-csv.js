const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars. Make sure .env.local exists with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length === 0) continue;
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] || '').trim();
    });
    rows.push(row);
  }
  return rows;
}

function parseLine(line) {
  const result = [];
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

async function main() {
  const csvPath = path.resolve(__dirname, '../public/sample-instructors.csv');
  const csv = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csv);

  console.log(`Parsed ${rows.length} instructors from CSV`);

  for (const r of rows) {
    const payload = {
      slug: r.slug || `${r.first_name?.toLowerCase()}-${r.last_name?.toLowerCase()}-${r.suburb?.toLowerCase().replace(/\s+/g, '-')}`,
      first_name: r.first_name || '',
      last_name: r.last_name || '',
      email: r.email || null,
      phone: r.phone || null,
      bio: r.bio || null,
      suburb: r.suburb || '',
      state: r.state || 'VIC',
      postcode: r.postcode || null,
      lat: r.lat ? parseFloat(r.lat) : null,
      lng: r.lng ? parseFloat(r.lng) : null,
      service_suburbs: r.service_suburbs ? r.service_suburbs.split(';').map(s => s.trim()).filter(Boolean) : [],
      service_radius_km: r.service_radius_km ? parseInt(r.service_radius_km) : 10,
      hourly_rate: r.hourly_rate ? parseFloat(r.hourly_rate) : null,
      licence_types: r.licence_types ? r.licence_types.split(';').map(s => s.trim()).filter(Boolean) : ['car'],
      transmission: r.transmission || null,
      lesson_duration_mins: r.lesson_duration_mins ? parseInt(r.lesson_duration_mins) : 60,
      vehicle_make: r.vehicle_make || null,
      vehicle_model: r.vehicle_model || null,
      vehicle_year: r.vehicle_year ? parseInt(r.vehicle_year) : null,
      dual_controls: r.dual_controls !== 'false',
      languages: r.languages ? r.languages.split(';').map(s => s.trim()).filter(Boolean) : ['English'],
      gender: r.gender || null,
      adi_registration: r.adi_registration || null,
      years_experience: r.years_experience ? parseInt(r.years_experience) : null,
      is_claimed: false,
      is_verified: true,
      profile_completeness: 80,
    };

    const { error } = await supabase.from('instructors').insert(payload);

    if (error) {
      console.error(`  FAILED: ${r.first_name} ${r.last_name} — ${error.message}`);
    } else {
      console.log(`  INSERTED: ${r.first_name} ${r.last_name} (${r.suburb})`);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
