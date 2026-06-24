import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { data: instructors, error: fetchError } = await supabase
    .from('instructors')
    .select('id, first_name, last_name')
    .limit(20);

  if (fetchError || !instructors?.length) {
    return NextResponse.json({ error: 'No instructors found. Run the seed endpoint first.' }, { status: 400 });
  }

  const results: string[] = [];
  const reasonOptions = ['incorrect_info', 'inappropriate', 'duplicate', 'other'] as const;
  const detailOptions = ['ownership', 'profile_review'];

  // Clear existing flags + unapproved reviews
  await supabase.from('listing_flags').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Reset instructors
  await supabase.from('instructors').update({ is_claimed: false, is_verified: false }).neq('id', '00000000-0000-0000-0000-000000000000');

  // Create ownership claims (claims)
  const claimInstructors = instructors.slice(0, 5);
  for (const inst of claimInstructors) {
    const reason = reasonOptions[Math.floor(Math.random() * reasonOptions.length)];
    const { error } = await supabase.from('listing_flags').insert({
      instructor_id: inst.id,
      reason,
      detail: 'ownership',
      is_resolved: false,
      created_at: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
    });
    if (error) {
      results.push(`Claim for ${inst.first_name} ${inst.last_name}: ${error.message}`);
    } else {
      results.push(`Claim created for ${inst.first_name} ${inst.last_name} (${reason})`);
    }
  }

  // Create profile review requests
  const reviewInstructors = instructors.slice(5, 10);
  for (const inst of reviewInstructors) {
    const { error } = await supabase.from('listing_flags').insert({
      instructor_id: inst.id,
      reason: 'other',
      detail: 'profile_review',
      is_resolved: false,
      created_at: new Date(Date.now() - Math.random() * 5 * 86400000).toISOString(),
    });
    if (error) {
      results.push(`Profile review for ${inst.first_name} ${inst.last_name}: ${error.message}`);
    } else {
      results.push(`Profile review created for ${inst.first_name} ${inst.last_name}`);
    }
  }

  // Create unapproved reviews
  const reviewInstructors2 = instructors.slice(0, 8);
  const reviewerNames = ['Tom S.', 'Emma W.', 'Jack R.', 'Olivia P.', 'Liam N.', 'Sophie M.', 'Noah K.', 'Mia C.'];
  const reviewTexts = [
    'Amazing instructor! Very patient and helped me pass first time.',
    'Great instructor, really helped with my parallel parking technique.',
    'Highly recommend to anyone learning to drive.',
    'Really helped me overcome my nerves.',
    'Professional, knowledgeable, and made the whole process easy.',
    'Still learning but feeling much more confident behind the wheel.',
  ];
  for (const inst of reviewInstructors2) {
    const reviewer = reviewerNames[Math.floor(Math.random() * reviewerNames.length)];
    const text = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];
    const rating = 3 + Math.floor(Math.random() * 3);
    const { error } = await supabase.from('reviews').insert({
      instructor_id: inst.id,
      reviewer_name: reviewer,
      reviewer_email: `${reviewer.toLowerCase().replace(/\s/, '').replace('.', '')}@example.com`,
      rating_overall: rating,
      rating_patience: rating,
      rating_communication: rating,
      rating_value: rating,
      rating_punctuality: rating,
      pass_outcome: rating >= 4 ? 'passed_first' : 'still_learning',
      review_text: text,
      is_approved: false,
    });
    if (error) {
      results.push(`Review for ${inst.first_name} ${inst.last_name}: ${error.message}`);
    } else {
      results.push(`Unapproved review created for ${inst.first_name} ${inst.last_name} (${rating} stars)`);
    }
  }

  // Verify a few instructors so the dashboard shows a mix
  for (const inst of instructors.slice(10, 15)) {
    await supabase.from('instructors').update({ is_verified: true }).eq('id', inst.id);
  }

  return NextResponse.json({ message: 'Claims seeding complete', results });
}
