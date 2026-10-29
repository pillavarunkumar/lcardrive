const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      process.env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    }
  }
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const crypto = require('crypto');

function gravatarUrl(email) {
  const e = email.trim().toLowerCase();
  const hash = crypto.createHash('md5').update(e).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?d=404&s=200`;
}

const instructors = [
  {
    slug: 'sarah-chen-dandenong', first_name: 'Sarah', last_name: 'Chen',
    email: 'sarah.chen@example.com', phone: '0401 111 111',
    bio: 'Fully qualified driving instructor with over 8 years of experience. Specialising in nervous drivers and first-time learners.',
    suburb: 'Dandenong', state: 'VIC', postcode: '3175', lat: -37.9837, lng: 145.2131,
    service_suburbs: ['Dandenong','Noble Park','Springvale','Keysborough','Hallam'],
    service_radius_km: 15, hourly_rate: 65, licence_types: ['car'], transmission: 'both',
    lesson_duration_mins: 60, vehicle_make: 'Toyota', vehicle_model: 'Corolla', vehicle_year: 2022,
    dual_controls: true, languages: ['English','Mandarin','Cantonese'], gender: 'female',
    adi_registration: 'ADI-2024-8741', years_experience: 8,
    profile_photo_url: gravatarUrl('sarah.chen@example.com'),
    is_verified: true, status: 'active',
  },
  {
    slug: 'james-park-springvale', first_name: 'James', last_name: 'Park',
    email: 'james.park@example.com', phone: '0402 222 222',
    bio: 'Friendly and professional driving instructor. Specialising in manual transmission and test preparation.',
    suburb: 'Springvale', state: 'VIC', postcode: '3171', lat: -37.9505, lng: 145.1523,
    service_suburbs: ['Springvale','Clayton','Mulgrave','Glen Waverley','Oakleigh'],
    service_radius_km: 10, hourly_rate: 55, licence_types: ['car'], transmission: 'manual',
    lesson_duration_mins: 60, vehicle_make: 'Hyundai', vehicle_model: 'i30', vehicle_year: 2023,
    dual_controls: true, languages: ['English','Korean'], gender: 'male',
    adi_registration: 'ADI-2024-5592', years_experience: 4,
    profile_photo_url: gravatarUrl('james.park@example.com'),
    is_verified: true, status: 'active',
  },
  {
    slug: 'priya-sharma-clayton', first_name: 'Priya', last_name: 'Sharma',
    email: 'priya.sharma@example.com', phone: '0403 333 333',
    bio: 'Patient and encouraging female driving instructor. Creating a supportive learning environment for students of all backgrounds.',
    suburb: 'Clayton', state: 'VIC', postcode: '3168', lat: -37.9207, lng: 145.1212,
    service_suburbs: ['Clayton','Oakleigh','Chadstone','Mount Waverley','Ashwood'],
    service_radius_km: 12, hourly_rate: 60, licence_types: ['car'], transmission: 'auto',
    lesson_duration_mins: 60, vehicle_make: 'Mazda', vehicle_model: 'CX-30', vehicle_year: 2023,
    dual_controls: true, languages: ['English','Hindi','Punjabi'], gender: 'female',
    adi_registration: 'ADI-2024-3341', years_experience: 6,
    profile_photo_url: gravatarUrl('priya.sharma@example.com'),
    is_verified: true, status: 'active',
  },
];

const reviewsData = [
  { name: 'Michael T.', email: 'michael@example.com', rating: 5, patience: 5, comms: 5, value: 5, punct: 5, outcome: 'passed_first', text: 'Sarah was amazing! Passed my test on the first try. Highly recommend!', approved: true },
  { name: 'Emily R.', email: 'emily@example.com', rating: 5, patience: 5, comms: 4, value: 5, punct: 5, outcome: 'passed_first', text: 'Very patient instructor. My confidence grew with every lesson.', approved: true },
  { name: 'David L.', email: 'david@example.com', rating: 4, patience: 4, comms: 5, value: 4, punct: 5, outcome: 'passed_retry', text: 'Good instructor with clear communication. Passed on my second try.', approved: true },
  { name: 'Lisa K.', email: 'lisa@example.com', rating: 5, patience: 5, comms: 5, value: 5, punct: 5, outcome: 'still_learning', text: 'Sarah is the best! Makes learning to drive fun.', approved: false },
  { name: 'Tom H.', email: 'tom@example.com', rating: 5, patience: 5, comms: 5, value: 5, punct: 5, outcome: 'passed_first', text: 'James got me through my manual test with confidence!', approved: true },
  { name: 'Anna W.', email: 'anna@example.com', rating: 4, patience: 4, comms: 4, value: 5, punct: 4, outcome: 'passed_first', text: 'James is a fantastic manual instructor. Lessons were always on time.', approved: true },
  { name: 'Steve M.', email: 'steve@example.com', rating: 5, patience: 5, comms: 5, value: 4, punct: 5, outcome: 'passed_retry', text: 'Great manual instructor. Really knew his stuff.', approved: false },
  { name: 'Neha G.', email: 'neha@example.com', rating: 5, patience: 5, comms: 5, value: 5, punct: 5, outcome: 'passed_first', text: 'Priya made me feel so comfortable behind the wheel. Perfect for nervous drivers!', approved: true },
  { name: 'Raj P.', email: 'raj@example.com', rating: 5, patience: 5, comms: 4, value: 5, punct: 5, outcome: 'passed_first', text: 'Very knowledgeable and supportive. Multilingual approach is a huge plus.', approved: true },
];

async function main() {
  console.log('Seeding...\n');
  const created = [];
  for (const inst of instructors) {
    const { data, error } = await supabase.from('instructors').insert(inst).select('id, first_name, last_name');
    if (error) { console.log(`  FAIL: ${inst.first_name} ${inst.last_name} — ${error.message}`); continue; }
    console.log(`  Created: ${data[0].first_name} ${data[0].last_name}`);
    created.push(data[0]);
  }
  if (!created.length) { console.log('\nNo instructors created.'); process.exit(1); }
  const reviewRows = [];
  const split = [reviewsData.slice(0,4), reviewsData.slice(4,7), reviewsData.slice(7)];
  for (const [i, inst] of created.entries()) {
    for (const r of (split[i] || [])) {
      reviewRows.push({ instructor_id: inst.id, reviewer_name: r.name, reviewer_email: r.email, rating_overall: r.rating, rating_patience: r.patience, rating_communication: r.comms, rating_value: r.value, rating_punctuality: r.punct, pass_outcome: r.outcome, review_text: r.text, is_approved: r.approved });
    }
  }
  const { error: revErr } = await supabase.from('reviews').insert(reviewRows);
  console.log(`\n  Reviews: ${revErr ? 'FAILED ' + revErr.message : reviewRows.length + ' created'}`);
  console.log('\nDone!');
}

main().catch((e) => console.error(e));
