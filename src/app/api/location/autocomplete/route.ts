import { NextResponse } from 'next/server';
import { autocompleteSuburb } from '@/lib/locationiq';
import { rateLimit } from '@/lib/http/rate-limit';

export async function GET(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const limit = rateLimit(`location-autocomplete:${ip}`, 60, 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { suggestions: [] },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim().slice(0, 100);

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const results = await autocompleteSuburb(q);

    const suggestions: { display: string; suburb: string; state: string; postcode?: string }[] = (
      results || []
    ).map((r: any) => {
      const parts = r.display_name?.split(',') || [];
      return {
        display: parts.slice(0, 3).join(',').trim(),
        suburb: r.address?.suburb || r.address?.city || r.address?.town || parts[0]?.trim() || '',
        state: r.address?.state || '',
        postcode: r.address?.postcode,
      };
    });

    return NextResponse.json(
      { suggestions },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } },
    );
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
