import { Suspense } from 'react';
import { unstable_cache } from 'next/cache';
import HomeClient from './HomeClient';
import HomeSkeleton from './HomeSkeleton';
import { supabase } from '@/lib/supabase';
import { PUBLIC_INSTRUCTOR_COLUMNS, sanitizePublicInstructor } from '@/lib/instructors/public';
import type { HomeReview, Instructor } from '@/types';

// Public data changes slowly. Cache it briefly so repeat requests do not hit
// the database, while still picking up newly approved instructors quickly.
export const revalidate = 300;

type HomeData = {
  featured: Instructor[];
  instructorCount: number;
};

const getHomeData = unstable_cache(
  async (): Promise<HomeData> => {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const { data, count, error } = await supabase
      .from('instructors')
      .select(PUBLIC_INSTRUCTOR_COLUMNS.join(', '), { count: 'exact' })
      .eq('is_verified', true)
      .order('average_rating', { ascending: false, nullsFirst: false })
      .limit(4);

    if (error) {
      throw new Error(error.message);
    }

    return {
      featured: ((data || []) as unknown as Record<string, unknown>[]).map((row) =>
        sanitizePublicInstructor(row),
      ) as unknown as Instructor[],
      instructorCount: count ?? 0,
    };
  },
  ['home-featured-instructors'],
  { revalidate: 300, tags: ['instructors'] },
);

const getHomeReviews = unstable_cache(
  async (): Promise<HomeReview[]> => {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('reviews')
      .select(
        'id, instructor_id, reviewer_name, rating_overall, review_text, created_at, instructor:instructors(first_name, last_name, slug, suburb)',
      )
      .eq('is_approved', true)
      .not('review_text', 'is', null)
      .order('created_at', { ascending: false })
      .limit(24);

    if (error || !data) return [];

    // Prefer reviews from different instructors so the homepage shows a range
    // of genuine learner feedback rather than several reviews about one person.
    const seenInstructors = new Set<string>();
    const reviews: HomeReview[] = [];
    const rows = data as unknown as Array<{
      id: string;
      instructor_id: string;
      reviewer_name: string;
      rating_overall: number | null;
      review_text: string | null;
      created_at: string;
      instructor: HomeReview['instructor'];
    }>;

    for (const row of rows) {
      const text = typeof row.review_text === 'string' ? row.review_text.trim() : '';
      if (!text || !row.instructor || seenInstructors.has(row.instructor_id)) continue;

      seenInstructors.add(row.instructor_id);
      reviews.push({
        id: row.id,
        reviewer_name: row.reviewer_name,
        rating_overall: Number(row.rating_overall) || 0,
        review_text: text,
        created_at: row.created_at,
        instructor: row.instructor,
      });

      if (reviews.length === 3) break;
    }

    return reviews;
  },
  ['home-approved-reviews'],
  { revalidate: 300, tags: ['reviews'] },
);

async function HomeContent() {
  const [dataResult, reviewsResult] = await Promise.allSettled([getHomeData(), getHomeReviews()]);

  if (dataResult.status === 'rejected') {
    console.error('Homepage instructor load failed:', dataResult.reason);
  }
  if (reviewsResult.status === 'rejected') {
    console.error('Homepage review load failed:', reviewsResult.reason);
  }

  const homeData: HomeData =
    dataResult.status === 'fulfilled' ? dataResult.value : { featured: [], instructorCount: 0 };
  const reviews = reviewsResult.status === 'fulfilled' ? reviewsResult.value : [];

  return (
    <HomeClient
      featured={homeData.featured}
      instructorCount={homeData.instructorCount}
      initialError={dataResult.status === 'rejected' ? 'We could not load instructors right now.' : null}
      reviews={reviews}
    />
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
