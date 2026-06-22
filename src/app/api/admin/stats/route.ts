import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const [
    { count: totalInstructors },
    { count: pendingClaims },
    { count: pendingReviews },
    { count: newReviews },
    claimsPromise,
    reviewsPromise,
    instructorsPromise,
  ] = await Promise.all([
    supabase.from('instructors').select('*', { count: 'exact', head: true }),
    supabase.from('listing_flags').select('*', { count: 'exact', head: true }).eq('is_resolved', false).eq('detail', 'ownership'),
    supabase.from('listing_flags').select('*', { count: 'exact', head: true }).eq('is_resolved', false).eq('detail', 'profile_review'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 86400000).toISOString()),
    supabase.from('listing_flags').select('id, reason, detail, created_at, instructor:instructors(first_name, last_name, adi_registration)').eq('is_resolved', false).eq('detail', 'ownership').order('created_at', { ascending: false }).limit(10),
    supabase.from('reviews').select('id, reviewer_name, rating_overall, review_text, created_at, instructor:instructors(first_name, last_name)').eq('is_approved', false).order('created_at', { ascending: false }).limit(10),
    supabase.from('instructors').select('id, first_name, last_name, suburb, hourly_rate, average_rating, is_verified').order('created_at', { ascending: false }).limit(10),
  ]);

  const { data: recentClaims } = claimsPromise;
  const { data: unapprovedReviews } = reviewsPromise;
  const { data: recentInstructors } = instructorsPromise;

  const { data: pendingReviewFlags } = await supabase
    .from('listing_flags')
    .select('id, reason, detail, created_at, instructor:instructors(first_name, last_name, is_verified, profile_completeness)')
    .eq('is_resolved', false)
    .eq('detail', 'profile_review')
    .order('created_at', { ascending: false })
    .limit(10);

  return NextResponse.json({
    totalInstructors: totalInstructors ?? 0,
    pendingClaims: pendingClaims ?? 0,
    pendingReviews: pendingReviews ?? 0,
    newReviews: newReviews ?? 0,
    recentInstructors: recentInstructors || [],
    recentClaims: (recentClaims || []).map((c: any) => ({
      id: c.id,
      reason: c.reason,
      detail: c.detail,
      created_at: c.created_at,
      instructor_name: c.instructor ? `${c.instructor.first_name} ${c.instructor.last_name}` : 'Unknown',
      adi_registration: c.instructor?.adi_registration || null,
    })),
    pendingReviewRequests: (pendingReviewFlags || []).map((r: any) => ({
      id: r.id,
      created_at: r.created_at,
      instructor_name: r.instructor ? `${r.instructor.first_name} ${r.instructor.last_name}` : 'Unknown',
      profile_completeness: r.instructor?.profile_completeness || 0,
    })),
    unapprovedReviews: (unapprovedReviews || []).map((r: any) => ({
      id: r.id,
      reviewer_name: r.reviewer_name,
      rating_overall: r.rating_overall,
      review_text: r.review_text,
      created_at: r.created_at,
      instructor_name: r.instructor ? `${r.instructor.first_name} ${r.instructor.last_name}` : 'Unknown',
    })),
  });
}
