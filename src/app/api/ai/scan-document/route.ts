import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const PROMPTS: Record<string, string> = {
  drivers_licence: `Extract the following from this Australian driver's licence card image. Return ONLY valid JSON with these fields:
{
  "full_name": "full name as shown on the licence (e.g. Sarah Mitchell)",
  "licence_number": "the licence number",
  "expiry_date": "expiry date in YYYY-MM-DD format"
}

If a field is not clearly visible, use null.`,

  adi_registration: `Extract the following from this ADI (Authorised Driving Instructor) registration certificate image. Return ONLY valid JSON with these fields:
{
  "full_name": "instructor name as shown on the certificate",
  "adi_registration": "registration number (e.g. ADI-123456)",
  "adi_registration_expiry": "expiry date in YYYY-MM-DD format"
}

If a field is not clearly visible, use null.`,

  certificate_iv: `Extract the following from this Certificate IV in Driving Instruction image. Return ONLY valid JSON with these fields:
{
  "full_name": "student name as shown on the certificate",
  "certificate_iv_reference": "certificate reference or serial number",
  "certificate_iv_date": "date issued in YYYY-MM-DD format"
}

If a field is not clearly visible, use null.`,

  wwcc: `Extract the following from this Working with Children Check card/image. Return ONLY valid JSON with these fields:
{
  "full_name": "cardholder name as shown on the card",
  "wwcc_number": "WWCC number",
  "wwcc_expiry": "expiry date in YYYY-MM-DD format"
}

If a field is not clearly visible, use null.`,

  police_check: `Extract the following from this National Police Check certificate image. Return ONLY valid JSON with these fields:
{
  "full_name": "applicant name as shown on the certificate",
  "police_check_date": "date of check/certificate in YYYY-MM-DD format"
}

If the date is not clearly visible, use null.`,

  medical_assessment: `Extract the following from this Medical Assessment / Fitness to Drive certificate image. Return ONLY valid JSON with these fields:
{
  "full_name": "patient name as shown on the form",
  "medical_assessment_date": "assessment date in YYYY-MM-DD format",
  "medical_assessment_expiry": "expiry date in YYYY-MM-DD format"
}

If a field is not clearly visible, use null.`,

  public_liability: `Extract the following from this Public Liability Insurance certificate image. Return ONLY valid JSON with these fields:
{
  "full_name": "insured name or business name as shown on the certificate",
  "public_liability_provider": "insurance provider name",
  "public_liability_policy_number": "policy number",
  "public_liability_expiry": "expiry date in YYYY-MM-DD format"
}

If a field is not clearly visible, use null.`,

  vehicle_registration: `Extract the following from this vehicle registration document or a photo of a car. Return ONLY valid JSON with these fields:
{
  "vehicle_make": "car make/manufacturer (e.g. Toyota)",
  "vehicle_model": "car model (e.g. Corolla)",
  "vehicle_year": "year of manufacture (as a number)",
  "vehicle_rego": "registration plate number (e.g. ABC-123)",
  "vehicle_color": "vehicle colour (e.g. White, Silver, Blue)"
}

If a field is not clearly visible, use null.`,
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const docType = formData.get('doc_type') as string;
    const clerkUserId = formData.get('clerk_user_id') as string;

    if (!file || !docType) {
      return NextResponse.json({ error: 'Missing file or doc_type' }, { status: 400 });
    }

    const prompt = PROMPTS[docType];
    if (!prompt) {
      return NextResponse.json({ error: `Unknown doc_type: ${docType}` }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent([
      { inlineData: { mimeType, data: base64 } },
      { text: prompt },
    ]);
    const response = result.response.text();

    let extracted: Record<string, unknown> = {};
    try {
      const cleaned = response.replace(/```json|```/g, '').trim();
      extracted = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Failed to parse extracted data', raw: response }, { status: 422 });
    }

    let imageUrl: string | null = null;
    let documentName: string | null = extracted.full_name as string | null || null;

    if (supabase && clerkUserId) {
      const fileName = `${docType}-${Date.now()}.${mimeType.split('/')[1] || 'jpg'}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`${clerkUserId}/${fileName}`, Buffer.from(bytes), {
          contentType: mimeType,
          upsert: true,
        });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(`${clerkUserId}/${fileName}`);
        imageUrl = urlData?.publicUrl || null;
      }

      if (documentName && docType !== 'vehicle_registration') {
        await supabase
          .from('instructors')
          .update({ verified_name: documentName })
          .eq('clerk_user_id', clerkUserId);
      }
    }

    return NextResponse.json({ extracted, image_url: imageUrl, document_name: documentName });
  } catch (error) {
    console.error('Document scan error:', error);
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 });
  }
}
