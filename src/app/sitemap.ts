import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://lcardrive.com.au';

  const staticRoutes = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/find-my-instructor`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
  ];

  let instructorRoutes: MetadataRoute.Sitemap = [];

  if (supabase) {
    try {
      const { data: instructors } = await supabase
        .from('instructors')
        .select('slug, suburb, updated_at');

      if (instructors) {
        instructorRoutes = instructors.map((i) => ({
          url: `${baseUrl}/instructors/${i.suburb.toLowerCase().replace(/\s+/g, '-')}/${i.slug}`,
          lastModified: new Date(i.updated_at),
          changeFrequency: 'weekly' as const,
          priority: 0.9,
        }));
      }
    } catch {
      // DB not available at build time
    }
  }

  return [...staticRoutes, ...instructorRoutes];
}
