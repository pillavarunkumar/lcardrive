import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { suburb, transmission, special_needs, available_days, max_hourly_rate, instructors } = body;

    const prompt = `You are a driving instructor matching assistant. Given a learner's preferences and a list of instructor profiles, return the top 3 best-matched instructor IDs with a short plain-English reason (max 25 words each). Respond only in JSON: { matches: [{id, reason}] }

Learner preferences:
- Suburb: ${suburb}
- Transmission: ${transmission || 'no preference'}
- Special needs: ${special_needs?.join(', ') || 'none'}
- Available days: ${available_days?.join(', ') || 'any'}
- Max hourly rate: $${max_hourly_rate}

Instructor profiles:
${JSON.stringify(instructors, null, 2)}`;

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
