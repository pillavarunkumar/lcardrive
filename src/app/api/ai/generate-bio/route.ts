import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateContent } from '@/lib/gemini';
import { rateLimit, rateLimitHeaders } from '@/lib/http/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limit = rateLimit(`ai:bio:${userId}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many bio generations. Please try again later.' },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }

  try {
    const body = await req.json();
    const { experience, licenceTypes, teachingStyle, learnerTypes, specialisations, proudest } = body;

    const prompt = `You are a professional copywriter for a driving instructor platform. Write a compelling, professional bio for a driving instructor based on the following details:

- Years of Experience: ${experience || 'N/A'}
- Licence Types Taught: ${licenceTypes || 'N/A'}
- Teaching Style: ${teachingStyle || 'N/A'}
- Primary Learner Types: ${learnerTypes || 'N/A'}
- Specialisations: ${specialisations || 'N/A'}
- What they're most proud of: ${proudest || 'N/A'}

Write a bio that is:
1. Professional and trustworthy (2-4 sentences)
2. Highlights their unique strengths
3. Appeals to potential learners
4. Keeps a warm, encouraging tone

Return ONLY the bio text, no quotes, no JSON, no prefixes.`;

    const bio = (await generateContent(prompt)).trim();

    return NextResponse.json({ bio });
  } catch (error) {
    console.error('Bio generation error:', error);
    return NextResponse.json({ error: 'Failed to generate bio' }, { status: 500 });
  }
}
