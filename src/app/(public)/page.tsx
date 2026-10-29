import { unstable_cache } from 'next/cache';
import HomeClient from './HomeClient';
import { supabase } from '@/lib/supabase';
import { PUBLIC_INSTRUCTOR_COLUMNS, sanitizePublicInstructor } from '@/lib/instructors/public';
import type { Instructor } from '@/types';

// The featured list is public and changes slowly. Render it on the server so
// the hero and social proof are visible on first paint, and cache the query so
// repeat requests do not hit the database.
export const revalidate = 300;

const getFeatured = unstable_cache(
  async () => {
    if (!supabase) return { featured: [] as Instructor[], instructorCount: 0 };

    const { data, count } = await supabase
      .from('instructors')
      .select(PUBLIC_INSTRUCTOR_COLUMNS.join(', '), { count: 'exact' })
      .eq('is_verified', true)
      .order('average_rating', { ascending: false, nullsFirst: false })
      .limit(4);

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

export default async function HomePage() {
  const { featured, instructorCount } = await getFeatured();
  return <HomeClient featured={featured} instructorCount={instructorCount} />;
}
