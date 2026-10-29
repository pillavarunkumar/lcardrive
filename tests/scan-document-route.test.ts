import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { resetRateLimits } from '@/lib/http/rate-limit';

const mocks = vi.hoisted(() => {
  const calls: string[] = [];

  const builder: any = {
    select: () => builder,
    eq: () => builder,
    maybeSingle: async () => ({ data: { id: 'inst_1' }, error: null }),
    update: () => builder,
    insert: async () => {
      calls.push('insert');
      return { error: null };
    },
  };

  const supabase = {
    from: (table: string) => {
      calls.push(`from:${table}`);
      return builder;
    },
    storage: {
      from: () => ({
        upload: async () => ({ error: null }),
        createSignedUrl: async () => ({
          data: { signedUrl: 'https://example.test/signed' },
          error: null,
        }),
      }),
    },
  };

  return { supabase, calls };
});

vi.mock('@/lib/supabase', () => ({ supabase: mocks.supabase }));

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(async () => ({ userId: 'user_1' })),
}));

vi.mock('@/lib/ai/scan-service', () => ({
  scanDocument: vi.fn(),
}));

vi.mock('@/lib/ai/review-queue', () => ({
  queueDocumentReview: vi.fn(async () => true),
}));

import { auth } from '@clerk/nextjs/server';
import { scanDocument } from '@/lib/ai/scan-service';
import { queueDocumentReview } from '@/lib/ai/review-queue';
import { POST } from '@/app/api/ai/scan-document/route';

const authMock = auth as unknown as ReturnType<typeof vi.fn>;
const scanMock = scanDocument as unknown as ReturnType<typeof vi.fn>;
const queueMock = queueDocumentReview as unknown as ReturnType<typeof vi.fn>;

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function pngFile(size = 64): File {
  const bytes = Buffer.alloc(size);
  PNG_SIGNATURE.copy(bytes, 0);
  return new File([bytes], 'licence.png', { type: 'image/png' });
}

function buildRequest(file: File | null, docType: string | null): NextRequest {
  const formData = new FormData();
  if (file) formData.append('file', file);
  if (docType) formData.append('doc_type', docType);

  return new NextRequest('http://localhost/api/ai/scan-document', {
    method: 'POST',
    body: formData,
  });
}

const acceptedOutcome = {
  status: 'accepted',
  reason: null,
  extracted: { full_name: 'Alex Sample', licence_number: 'SYN-1', expiry_date: '2029-01-01' },
  confidence: 0.94,
  attempts: 1,
  raw: '{}',
  issues: [],
};

const reviewOutcome = {
  status: 'needs_review',
  reason: 'low_confidence',
  extracted: { full_name: 'Alex Sample', licence_number: 'SYN-1' },
  confidence: 0.22,
  attempts: 2,
  raw: '{}',
  issues: [],
};

beforeEach(() => {
  resetRateLimits();
  mocks.calls.length = 0;
  authMock.mockResolvedValue({ userId: 'user_1' });
  scanMock.mockReset();
  scanMock.mockResolvedValue(acceptedOutcome);
  queueMock.mockReset();
  queueMock.mockResolvedValue(true);
});

describe('POST /api/ai/scan-document', () => {
  it('returns 401 when there is no Clerk session', async () => {
    authMock.mockResolvedValue({ userId: null });

    const res = await POST(buildRequest(pngFile(), 'drivers_licence'));

    expect(res.status).toBe(401);
    expect(scanMock).not.toHaveBeenCalled();
  });

  it('returns 400 for an unknown document type', async () => {
    const res = await POST(buildRequest(pngFile(), 'not_a_document'));

    expect(res.status).toBe(400);
    expect(scanMock).not.toHaveBeenCalled();
  });

  it('returns 415 when the declared type is not allowed', async () => {
    const file = new File([Buffer.from('hello')], 'notes.txt', { type: 'text/plain' });

    const res = await POST(buildRequest(file, 'drivers_licence'));

    expect(res.status).toBe(415);
    expect(scanMock).not.toHaveBeenCalled();
  });

  it('returns 415 when the contents do not match the declared image type', async () => {
    const file = new File([Buffer.from('not really a png')], 'fake.png', { type: 'image/png' });

    const res = await POST(buildRequest(file, 'drivers_licence'));

    expect(res.status).toBe(415);
    expect(scanMock).not.toHaveBeenCalled();
  });

  it('returns 413 for files over the 5MB limit', async () => {
    const file = pngFile(5 * 1024 * 1024 + 1);

    const res = await POST(buildRequest(file, 'drivers_licence'));

    expect(res.status).toBe(413);
    expect(scanMock).not.toHaveBeenCalled();
  });

  it('accepts a valid high-confidence scan and stores identity from the session', async () => {
    const res = await POST(buildRequest(pngFile(), 'drivers_licence'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('accepted');
    expect(body.requires_review).toBe(false);
    expect(body.extracted.licence_number).toBe('SYN-1');
    expect(body.document_name).toBe('Alex Sample');
    expect(body.image_path).toMatch(/^documents\/user_1\/drivers_licence-/);
    expect(body.image_url).toBe('https://example.test/signed');
    expect(queueMock).not.toHaveBeenCalled();

    // The scan is keyed on the session user, not a client-supplied id.
    expect(scanMock).toHaveBeenCalledTimes(1);
    expect(mocks.calls).toContain('from:instructors');
  });

  it('routes low-confidence scans to the review queue', async () => {
    scanMock.mockResolvedValue(reviewOutcome);

    const res = await POST(buildRequest(pngFile(), 'drivers_licence'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('needs_review');
    expect(body.requires_review).toBe(true);
    expect(body.review_reason).toBe('low_confidence');
    expect(body.document_name).toBeNull();

    expect(queueMock).toHaveBeenCalledTimes(1);
    expect(queueMock.mock.calls[0][0]).toMatchObject({
      clerkUserId: 'user_1',
      docType: 'drivers_licence',
      confidence: 0.22,
      reason: 'low_confidence',
      modelAttempts: 2,
    });
  });

  it('rate limits after 20 scans in the window', async () => {
    for (let i = 0; i < 20; i += 1) {
      const res = await POST(buildRequest(pngFile(), 'drivers_licence'));
      expect(res.status).toBe(200);
    }

    const blocked = await POST(buildRequest(pngFile(), 'drivers_licence'));

    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBeTruthy();
    expect(scanMock).toHaveBeenCalledTimes(20);
  });
});
