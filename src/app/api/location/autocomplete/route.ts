import { NextResponse } from 'next/server';
import { autocompleteSuburb } from '@/lib/locationiq';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const results = await autocompleteSuburb(q.trim());

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

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
