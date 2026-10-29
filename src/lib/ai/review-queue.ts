import { supabase } from '@/lib/supabase';
import type { DocType } from './document-schema';

export interface DocumentReviewInput {
  clerkUserId: string;
  instructorId: string | null;
  docType: DocType;
  confidence: number;
  reason: string;
  extracted: Record<string, unknown>;
  imagePath: string | null;
  modelAttempts: number;
}

/**
 * Low-confidence or schema-invalid scans are queued for a human instead of
 * being written to the instructor record. Returns true when the row was stored.
 */
export async function queueDocumentReview(input: DocumentReviewInput): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from('document_reviews').insert({
    clerk_user_id: input.clerkUserId,
    instructor_id: input.instructorId,
    doc_type: input.docType,
    confidence: input.confidence,
    reason: input.reason,
    extracted: input.extracted,
    image_path: input.imagePath,
    model_attempts: input.modelAttempts,
    status: 'pending',
  });

  if (error) {
    console.error('Failed to queue document review:', error.message);
    return false;
  }

  return true;
}
