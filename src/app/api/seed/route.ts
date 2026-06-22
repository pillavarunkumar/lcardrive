import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const instructors = [
  {
    first_name: 'Sarah', last_name: 'Mitchell', suburb: 'Coburg', state: 'VIC', postcode: '3058',
    lat: -37.7441, lng: 144.9693, hourly_rate: 65, transmission: 'both', licence_types: ['car'],
    lesson_duration_mins: 60, vehicle_make: 'Toyota', vehicle_model: 'Corolla', vehicle_year: 2022,
    languages: ['English'], bio: 'Friendly and patient instructor with over 8 years of experience helping nervous drivers build confidence on the road.',
    years_experience: 8, dual_controls: true, specialises_anxiety: true, accepts_international: true,
    availability_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    service_suburbs: ['Coburg', 'Brunswick', 'Pascoe Vale', 'Glenroy', 'Fawkner'],
    service_radius_km: 10, adi_registration: 'ADI-847291', gender: 'female',
    familiar_test_centres: ['Carlton', 'Brunswick'], package_options: [{ hours: 5, price: 300, label: 'Starter Pack' }, { hours: 10, price: 550, label: 'Value Pack' }],
  },
  {
    first_name: 'James', last_name: 'Chen', suburb: 'Box Hill', state: 'VIC', postcode: '3128',
    lat: -37.8189, lng: 145.1251, hourly_rate: 70, transmission: 'both', licence_types: ['car'],
    lesson_duration_mins: 60, vehicle_make: 'Mazda', vehicle_model: 'CX-5', vehicle_year: 2023,
    languages: ['English', 'Mandarin', 'Cantonese'], bio: 'Bilingual instructor specialising in licence test preparation. Know all the test routes in the eastern suburbs.',
    years_experience: 12, dual_controls: true, specialises_anxiety: false, accepts_international: true,
    availability_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    service_suburbs: ['Box Hill', 'Doncaster', 'Blackburn', 'Burwood', 'Balwyn'],
    service_radius_km: 15, adi_registration: 'ADI-392018', gender: 'male',
    familiar_test_centres: ['Burwood East', 'Carlton'], package_options: [{ hours: 5, price: 330, label: '5-Hour Pack' }, { hours: 10, price: 620, label: '10-Hour Pack' }],
  },
  {
    first_name: 'Priya', last_name: 'Sharma', suburb: 'Werribee', state: 'VIC', postcode: '3030',
    lat: -37.9000, lng: 144.6616, hourly_rate: 55, transmission: 'auto', licence_types: ['car'],
    lesson_duration_mins: 60, vehicle_make: 'Hyundai', vehicle_model: 'i30', vehicle_year: 2021,
    languages: ['English', 'Hindi', 'Punjabi'], bio: 'Calm and encouraging instructor who makes learning to drive a positive experience for students of all ages.',
    years_experience: 5, dual_controls: true, specialises_anxiety: true, accepts_international: false,
    availability_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    service_suburbs: ['Werribee', 'Hoppers Crossing', 'Point Cook', 'Tarneit', 'Wyndham Vale'],
    service_radius_km: 10, adi_registration: 'ADI-561234', gender: 'female',
    familiar_test_centres: ['Werribee'], package_options: [{ hours: 5, price: 260, label: '5 Lessons' }, { hours: 10, price: 490, label: '10 Lessons' }],
  },
  {
    first_name: 'Mike', last_name: 'Thompson', suburb: 'Reservoir', state: 'VIC', postcode: '3073',
    lat: -37.7160, lng: 145.0070, hourly_rate: 60, transmission: 'manual', licence_types: ['car'],
    lesson_duration_mins: 90, vehicle_make: 'Volkswagen', vehicle_model: 'Golf', vehicle_year: 2022,
    languages: ['English'], bio: 'Manual transmission specialist. I teach proper clutch control and gear changing techniques for confident driving.',
    years_experience: 15, dual_controls: true, specialises_anxiety: false, accepts_international: false,
    availability_days: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    service_suburbs: ['Reservoir', 'Preston', 'Thornbury', 'Northcote', 'Bundoora'],
    service_radius_km: 10, adi_registration: 'ADI-784512', gender: 'male',
    familiar_test_centres: ['Carlton', 'Heidelberg'], package_options: [{ hours: 5, price: 280, label: 'Manual Pack' }, { hours: 10, price: 520, label: 'Manual Value' }],
  },
  {
    first_name: 'Emily', last_name: 'Watson', suburb: 'Brighton', state: 'VIC', postcode: '3186',
    lat: -37.9055, lng: 144.9985, hourly_rate: 80, transmission: 'both', licence_types: ['car'],
    lesson_duration_mins: 60, vehicle_make: 'BMW', vehicle_model: '1 Series', vehicle_year: 2023,
    languages: ['English', 'French'], bio: 'Premium driving instruction in the Bayside area. Focus on defensive driving and advanced road awareness.',
    years_experience: 10, dual_controls: true, specialises_anxiety: false, accepts_international: true,
    availability_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Sat'],
    service_suburbs: ['Brighton', 'Elwood', 'St Kilda', 'Hampton', 'Sandringham'],
    service_radius_km: 8, adi_registration: 'ADI-903456', gender: 'female',
    familiar_test_centres: ['Carlton'], package_options: [{ hours: 5, price: 375, label: 'Bayside Pack' }],
  },
  {
    first_name: 'David', last_name: 'Nguyen', suburb: 'Footscray', state: 'VIC', postcode: '3011',
    lat: -37.7996, lng: 144.8995, hourly_rate: 55, transmission: 'both', licence_types: ['car'],
    lesson_duration_mins: 60, vehicle_make: 'Toyota', vehicle_model: 'Camry', vehicle_year: 2020,
    languages: ['English', 'Vietnamese'], bio: 'Affordable lessons in the inner west. Patient with first-time drivers and those needing test preparation.',
    years_experience: 7, dual_controls: true, specialises_anxiety: true, accepts_international: true,
    availability_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    service_suburbs: ['Footscray', 'Yarraville', 'Sunshine', 'St Albans', 'Deer Park'],
    service_radius_km: 12, adi_registration: 'ADI-678901', gender: 'male',
    familiar_test_centres: ['Carlton', 'Werribee'], package_options: [{ hours: 5, price: 260, label: 'Starter' }, { hours: 10, price: 480, label: 'Standard' }],
  },
  {
    first_name: 'Lisa', last_name: 'Tran', suburb: 'Richmond', state: 'VIC', postcode: '3121',
    lat: -37.8237, lng: 145.0033, hourly_rate: 68, transmission: 'both', licence_types: ['car'],
    lesson_duration_mins: 60, vehicle_make: 'Honda', vehicle_model: 'HR-V', vehicle_year: 2022,
    languages: ['English', 'Mandarin', 'Vietnamese'], bio: 'Multilingual instructor near the city. Specialise in helping international licence holders convert to full licence.',
    years_experience: 6, dual_controls: true, specialises_anxiety: false, accepts_international: true,
    availability_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    service_suburbs: ['Richmond', 'Hawthorn', 'Kew', 'Fitzroy', 'Collingwood'],
    service_radius_km: 10, adi_registration: 'ADI-234567', gender: 'female',
    familiar_test_centres: ['Carlton'], package_options: [{ hours: 5, price: 320, label: '5-Pack' }, { hours: 10, price: 600, label: '10-Pack' }],
  },
  {
    first_name: 'John', last_name: 'O\'Brien', suburb: 'Dandenong', state: 'VIC', postcode: '3175',
    lat: -37.9835, lng: 145.2138, hourly_rate: 50, transmission: 'both', licence_types: ['car', 'motorbike'],
    lesson_duration_mins: 60, vehicle_make: 'Ford', vehicle_model: 'Focus', vehicle_year: 2021,
    languages: ['English'], bio: 'Car and motorbike instructor serving the south-east. Affordable rates and flexible scheduling.',
    years_experience: 20, dual_controls: true, specialises_anxiety: false, accepts_international: false,
    availability_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    service_suburbs: ['Dandenong', 'Noble Park', 'Springvale', 'Keysborough', 'Cranbourne'],
    service_radius_km: 15, adi_registration: 'ADI-345678', gender: 'male',
    familiar_test_centres: ['Dandenong'], package_options: [{ hours: 5, price: 240, label: 'Budget Pack' }, { hours: 10, price: 450, label: 'Saver Pack' }],
  },
  {
    first_name: 'Anna', last_name: 'Kowalski', suburb: 'Glen Waverley', state: 'VIC', postcode: '3150',
    lat: -37.8788, lng: 145.1641, hourly_rate: 72, transmission: 'both', licence_types: ['car'],
    lesson_duration_mins: 60, vehicle_make: 'Subaru', vehicle_model: 'Impreza', vehicle_year: 2023,
    languages: ['English', 'Polish'], bio: 'Detail-oriented instructor who focuses on building safe driving habits from day one. High pass rate.',
    years_experience: 9, dual_controls: true, specialises_anxiety: false, accepts_international: true,
    availability_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Sat'],
    service_suburbs: ['Glen Waverley', 'Mount Waverley', 'Clayton', 'Oakleigh', 'Chadstone'],
    service_radius_km: 10, adi_registration: 'ADI-789012', gender: 'female',
    familiar_test_centres: ['Burwood East'], package_options: [{ hours: 5, price: 340, label: '5 Pack' }, { hours: 10, price: 640, label: '10 Pack' }],
  },
  {
    first_name: 'Carlos', last_name: 'Rivera', suburb: 'Craigieburn', state: 'VIC', postcode: '3064',
    lat: -37.6033, lng: 144.9400, hourly_rate: 55, transmission: 'both', licence_types: ['car'],
    lesson_duration_mins: 60, vehicle_make: 'Kia', vehicle_model: 'Cerato', vehicle_year: 2022,
    languages: ['English', 'Spanish'], bio: 'Patient and friendly instructor serving Melbourne\'s northern growth corridor. Flexible with pickup locations.',
    years_experience: 4, dual_controls: true, specialises_anxiety: true, accepts_international: false,
    availability_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    service_suburbs: ['Craigieburn', 'Roxburgh Park', 'Epping', 'Mill Park', 'Broadmeadows'],
    service_radius_km: 12, adi_registration: 'ADI-456789', gender: 'male',
    familiar_test_centres: ['Carlton'], package_options: [{ hours: 5, price: 260, label: 'Starter' }],
  },
];

const reviewTemplates = [
  { reviewer: 'Tom S.', rating: 5, patience: 5, comms: 5, value: 4, punctuality: 5, pass: 'passed_first' as const, text: 'Amazing instructor! Very patient and helped me pass first time.' },
  { reviewer: 'Emma W.', rating: 4, patience: 4, comms: 5, value: 4, punctuality: 5, pass: 'passed_first' as const, text: 'Great instructor, really helped with my parallel parking technique.' },
  { reviewer: 'Jack R.', rating: 5, patience: 5, comms: 5, value: 5, punctuality: 5, pass: 'passed_first' as const, text: 'Couldn\'t have asked for a better instructor. Highly recommend to anyone learning.' },
  { reviewer: 'Olivia P.', rating: 4, patience: 5, comms: 4, value: 3, punctuality: 4, pass: 'passed_retry' as const, text: 'Really helped me overcome my nerves after failing my first test.' },
  { reviewer: 'Liam N.', rating: 5, patience: 4, comms: 5, value: 5, punctuality: 5, pass: 'passed_first' as const, text: 'Professional, knowledgeable, and made the whole process really easy.' },
  { reviewer: 'Sophie M.', rating: 4, patience: 5, comms: 4, value: 4, punctuality: 4, pass: 'still_learning' as const, text: 'Still learning but feeling much more confident behind the wheel.' },
  { reviewer: 'Noah K.', rating: 5, patience: 5, comms: 5, value: 5, punctuality: 5, pass: 'passed_first' as const, text: 'Best driving instructor in Melbourne. No question.' },
  { reviewer: 'Mia C.', rating: 4, patience: 4, comms: 4, value: 4, punctuality: 5, pass: 'passed_retry' as const, text: 'Very thorough and made sure I was ready before booking my test.' },
  { reviewer: 'Ethan B.', rating: 5, patience: 5, comms: 5, value: 5, punctuality: 4, pass: 'passed_first' as const, text: 'Fantastic experience from start to finish. Highly skilled instructor.' },
  { reviewer: 'Ava L.', rating: 4, patience: 4, comms: 5, value: 4, punctuality: 5, pass: 'passed_first' as const, text: 'Clear instructions and very patient. Made learning enjoyable.' },
];

function slugify(first: string, last: string, suburb: string) {
  return `${first.toLowerCase()}-${last.toLowerCase().replace(/'/g, '')}-${suburb.toLowerCase().replace(/\s+/g, '-')}`;
}

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const results: { instructor: string; status: string; error?: string }[] = [];

  for (const inst of instructors) {
    const slug = slugify(inst.first_name, inst.last_name, inst.suburb);

    const { error } = await supabase.from('instructors').insert({
      slug,
      ...inst,
      is_claimed: false,
      is_verified: true,
      profile_completeness: 100,
    });

    if (error) {
      results.push({ instructor: `${inst.first_name} ${inst.last_name}`, status: 'error', error: error.message });
      continue;
    }

    const { data: inserted } = await supabase.from('instructors').select('id').eq('slug', slug).single();

    if (inserted) {
      const selectedReviews = reviewTemplates.sort(() => Math.random() - 0.5).slice(0, 4 + Math.floor(Math.random() * 4));
      for (const r of selectedReviews) {
        await supabase.from('reviews').insert({
          instructor_id: inserted.id,
          reviewer_name: r.reviewer,
          reviewer_email: `${r.reviewer.toLowerCase().replace(/\s/, '')}@example.com`,
          rating_overall: r.rating,
          rating_patience: r.patience,
          rating_communication: r.comms,
          rating_value: r.value,
          rating_punctuality: r.punctuality,
          pass_outcome: r.pass,
          review_text: r.text,
          is_approved: true,
        });
      }
    }

    results.push({ instructor: `${inst.first_name} ${inst.last_name}`, status: 'inserted' });
  }

  return NextResponse.json({ message: 'Seeding complete', results });
}
