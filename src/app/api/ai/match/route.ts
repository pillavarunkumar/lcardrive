import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import { getClientIp, rateLimit, rateLimitHeaders } from '@/lib/http/rate-limit';

export const runtime = 'nodejs';

const MAX_INSTRUCTORS = 25;

export async function POST(req: NextRequest) {
  // This endpoint is used by the public matching flow, so it is rate limited by
  // IP rather than requiring a session. The cap also protects the prompt size.
  const limit = rateLimit(`ai:match:${getClientIp(req)}`, 10, 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { matches: [], error: 'Too many match requests. Please try again shortly.' },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }

  try {
    const body = await req.json();
    const { suburb, transmission, special_needs, available_days, max_hourly_rate, instructors } = body;

    if (!Array.isArray(instructors) || instructors.length === 0) {
      return NextResponse.json({ matches: [] }, { status: 200 });
    }

    const prompt = `You are a driving instructor matching assistant. Given a learner's preferences and a list of instructor profiles, return the top 3 best-matched instructor IDs with a short plain-English reason (max 25 words each). Respond only in JSON: { matches: [{id, reason}] }

Learner preferences:
- Suburb: ${suburb}
- Transmission: ${transmission || 'no preference'}
- Special needs: ${special_needs?.join(', ') || 'none'}
- Available days: ${available_days?.join(', ') || 'any'}
- Max hourly rate: $${max_hourly_rate}

Instructor profiles:
${JSON.stringify(instructors.slice(0, MAX_INSTRUCTORS), null, 2)}`;

    const raw = await generateContent(prompt);

    let matches;
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim();
      matches = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ matches: [] }, { status: 200 });
    }

    return NextResponse.json(matches);
  } catch (error) {
    console.error('AI match error:', error);
    return NextResponse.json({ matches: [] }, { status: 200 });
  }
}
