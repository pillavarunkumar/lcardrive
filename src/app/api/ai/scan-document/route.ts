import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { isDocType, type DocType } from '@/lib/ai/document-schema';
import { scanDocument } from '@/lib/ai/scan-service';
import { queueDocumentReview } from '@/lib/ai/review-queue';
import { validateUpload } from '@/lib/validation/upload';
import { buildDocumentPath, createSignedDocumentUrl } from '@/lib/storage/documents';
import { rateLimit, rateLimitHeaders } from '@/lib/http/rate-limit';

export const runtime = 'nodejs';
// Allow the model timeout plus one retry on slow/serverless platforms.
export const maxDuration = 60;

const SCAN_LIMIT = 20;
const SCAN_WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    // Identity always comes from the Clerk session, never from the form body.
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limit = rateLimit(`ai:scan:${userId}`, SCAN_LIMIT, SCAN_WINDOW_MS);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many document scans. Please try again later.' },
        { status: 429, headers: rateLimitHeaders(limit) },
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const docTypeRaw = formData.get('doc_type');

    if (!file || typeof docTypeRaw !== 'string') {
      return NextResponse.json({ error: 'Missing file or doc_type' }, { status: 400 });
    }

    if (!isDocType(docTypeRaw)) {
      return NextResponse.json({ error: `Unknown doc_type: ${docTypeRaw}` }, { status: 400 });
    }

    const docType: DocType = docTypeRaw;
    const bytes = Buffer.from(await file.arrayBuffer());
    const validation = validateUpload(file, bytes);

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    const outcome = await scanDocument({
      docType,
      bytes,
      mimeType: validation.mimeType,
    });

    let instructorId: string | null = null;
    if (supabase) {
      const { data } = await supabase
        .from('instructors')
        .select('id')
        .eq('clerk_user_id', userId)
        .maybeSingle();
      instructorId = data?.id ?? null;
    }

    let imagePath: string | null = null;
    let imageUrl: string | null = null;

    if (supabase) {
      const path = buildDocumentPath(userId, docType, validation.extension);
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(path.replace(/^documents\//, ''), bytes, {
          contentType: validation.mimeType,
          upsert: true,
        });

      if (!uploadError) {
        imagePath = path;
        imageUrl = await createSignedDocumentUrl(path, 300);
      } else {
        console.error('Document upload failed:', uploadError.message);
      }
    }

    const accepted = outcome.status === 'accepted';

    if (accepted && supabase) {
      const documentName = typeof outcome.extracted.full_name === 'string' ? outcome.extracted.full_name : null;
      if (documentName && docType !== 'vehicle_registration') {
        await supabase
          .from('instructors')
          .update({ verified_name: documentName })
          .eq('clerk_user_id', userId);
      }
    } else {
      await queueDocumentReview({
        clerkUserId: userId,
        instructorId,
        docType,
        confidence: outcome.confidence,
        reason: outcome.reason ?? 'invalid_output',
        extracted: outcome.extracted,
        imagePath,
        modelAttempts: outcome.attempts,
      });
    }

    return NextResponse.json({
      status: outcome.status,
      requires_review: !accepted,
      review_reason: outcome.reason,
      confidence: outcome.confidence,
      extracted: outcome.extracted,
      image_path: imagePath,
      image_url: imageUrl,
      document_name:
        accepted && typeof outcome.extracted.full_name === 'string' ? outcome.extracted.full_name : null,
    });
  } catch (error) {
    console.error('Document scan error:', error);
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 });
  }
}
