import {
  PROMPTS,
  parseExtraction,
  type DocType,
  type ParsedExtraction,
} from './document-schema';
import {
  DEFAULT_RETRIES,
  DEFAULT_TIMEOUT_MS,
  TimeoutError,
  geminiGenerator,
  withTimeout,
  type GeminiGenerator,
} from './gemini';

export type ScanStatus = 'accepted' | 'needs_review';

export interface ScanInput {
  docType: DocType;
  bytes: Buffer;
  mimeType: string;
  generator?: GeminiGenerator;
  timeoutMs?: number;
  retries?: number;
}

export interface ScanOutcome {
  status: ScanStatus;
  reason: string | null;
  extracted: Record<string, unknown>;
  confidence: number;
  attempts: number;
  raw: string;
  issues: string[];
}

function review(
  reason: string,
  attempts: number,
  raw: string,
  issues: string[],
  parsed?: Extract<ParsedExtraction, { ok: true }>,
): ScanOutcome {
  return {
    status: 'needs_review',
    reason,
    extracted: parsed?.data ?? {},
    confidence: parsed?.confidence ?? 0,
    attempts,
    raw,
    issues,
  };
}

/**
 * Runs the image through Gemini, validates the response against the zod schema
 * for the document type and retries once on timeout or invalid output. Anything
 * that cannot be trusted is returned as `needs_review` rather than accepted.
 */
export async function scanDocument(input: ScanInput): Promise<ScanOutcome> {
  const generator = input.generator ?? geminiGenerator;
  const timeoutMs = input.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxAttempts = Math.max(1, (input.retries ?? DEFAULT_RETRIES) + 1);

  let lastRaw = '';
  let lastIssues: string[] = ['No attempt was made'];
  let lastReason = 'invalid_output';

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      lastRaw = await withTimeout(
        generator({
          docType: input.docType,
          prompt: PROMPTS[input.docType],
          image: { mimeType: input.mimeType, base64: input.bytes.toString('base64') },
        }),
        timeoutMs,
      );
    } catch (error) {
      lastRaw = '';
      lastReason = error instanceof TimeoutError ? 'timeout' : 'gemini_error';
      lastIssues = [error instanceof Error ? error.message : 'Unknown Gemini error'];
      continue;
    }

    const parsed = parseExtraction(input.docType, lastRaw);

    if (!parsed.ok) {
      lastReason = parsed.error;
      lastIssues = parsed.issues;
      continue;
    }

    if (parsed.manualReview) {
      return review(parsed.reviewReason ?? 'low_confidence', attempt, lastRaw, parsed.missingFields, parsed);
    }

    return {
      status: 'accepted',
      reason: null,
      extracted: parsed.data,
      confidence: parsed.confidence,
      attempts: attempt,
      raw: lastRaw,
      issues: [],
    };
  }

  return review(lastReason, maxAttempts, lastRaw, lastIssues);
}
