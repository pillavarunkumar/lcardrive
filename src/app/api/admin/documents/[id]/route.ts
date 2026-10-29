import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-guard';
import { DOCUMENT_FIELDS, DOCUMENT_LABELS, type DocType } from '@/lib/ai/document-schema';
import { createSignedDocumentUrl, normalizeDocumentPath } from '@/lib/storage/documents';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard) return guard;
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { data: instructor, error } = await supabase
    .from('instructors')
    .select('id, first_name, last_name, is_verified, documents_submitted_at, drivers_licence_image_url, adi_registration_image_url, certificate_iv_image_url, wwcc_image_url, police_check_image_url, medical_assessment_image_url, public_liability_image_url, vehicle_image_url')
    .eq('id', params.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!instructor) {
    return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
  }

  const documents = await Promise.all(
    (Object.keys(DOCUMENT_FIELDS) as DocType[]).map(async (docType) => {
      const column = DOCUMENT_FIELDS[docType][0] as keyof typeof instructor;
      const stored = (instructor[column] as string | null) ?? null;
      const path = normalizeDocumentPath(stored);
      const signedUrl = path ? await createSignedDocumentUrl(path, 300) : null;

      return {
        docType,
        label: DOCUMENT_LABELS[docType],
        uploaded: Boolean(stored),
        path,
        signedUrl,
      };
    }),
  );

  const { data: pendingReviews } = await supabase
    .from('document_reviews')
    .select('id, doc_type, status, confidence, reason, extracted, image_path, model_attempts, created_at')
    .eq('instructor_id', instructor.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  const reviews = await Promise.all(
    (pendingReviews || []).map(async (review) => ({
      ...review,
      image_url: review.image_path ? await createSignedDocumentUrl(review.image_path, 300) : null,
    })),
  );

  return NextResponse.json({
    instructor: {
      id: instructor.id,
      name: `${instructor.first_name} ${instructor.last_name}`,
      is_verified: instructor.is_verified,
      documents_submitted_at: instructor.documents_submitted_at,
    },
    documents,
    pendingReviews: reviews,
  });
}
