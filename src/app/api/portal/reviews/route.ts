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
    return NextResponse.json({ reviews: [] });
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('instructor_id', instructor.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const reviews = (data || []).map((review) => ({
    id: review.id,
    student_name: review.reviewer_name,
    rating: review.rating_overall,
    content: review.review_text || '',
    created_at: review.created_at,
    tags: [
      review.rating_patience >= 5 ? 'Patient' : null,
      review.rating_communication >= 5 ? 'Clear communication' : null,
      review.rating_punctuality >= 5 ? 'Punctual' : null,
      review.rating_value >= 5 ? 'Good value' : null,
    ].filter(Boolean),
    passed_first_attempt: review.pass_outcome === 'passed_first',
    rating_patience: review.rating_patience,
    rating_communication: review.rating_communication,
    rating_value: review.rating_value,
    rating_punctuality: review.rating_punctuality,
  }));

  return NextResponse.json({ reviews });
}
