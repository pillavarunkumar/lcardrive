import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import type { Mock } from 'vitest';

vi.mock('@/lib/admin-guard', () => ({
  requireAdmin: vi.fn(),
}));

const mocks = vi.hoisted(() => {
  const state = {
    instructor: {
      id: 'inst_1',
      first_name: 'Alex',
      last_name: 'Sample',
      is_verified: true,
      documents_submitted_at: '2026-01-01T00:00:00.000Z',
      drivers_licence_image_url: 'documents/user_1/drivers_licence-1.png',
      adi_registration_image_url: null,
      certificate_iv_image_url: null,
      wwcc_image_url:
        'https://example.supabase.co/storage/v1/object/public/documents/user_1/wwcc-1.png',
      police_check_image_url: null,
      medical_assessment_image_url: null,
      public_liability_image_url: null,
      vehicle_image_url: null,
    } as Record<string, unknown> | null,
    reviews: [
      {
        id: 'rev_1',
        doc_type: 'drivers_licence',
        status: 'pending',
        confidence: 0.31,
        reason: 'low_confidence',
        extracted: { full_name: 'Alex Sample' },
        image_path: 'documents/user_1/drivers_licence-2.png',
        model_attempts: 2,
        created_at: '2026-02-01T00:00:00.000Z',
      },
    ] as Array<Record<string, unknown>>,
  };

  const supabase = {
    from: (table: string) => {
      const resolve = () =>
        table === 'instructors'
          ? { data: state.instructor, error: null }
          : { data: state.reviews, error: null };

      const builder: any = {
        select: () => builder,
        eq: () => builder,
        order: () => builder,
        maybeSingle: async () => resolve(),
        then: (
          onFulfilled: (value: unknown) => unknown,
          onRejected: (reason: unknown) => unknown,
        ) => Promise.resolve(resolve()).then(onFulfilled, onRejected),
      };
      return builder;
    },
    storage: {
      from: () => ({
        createSignedUrl: async (path: string) => ({
          data: { signedUrl: `https://example.test/signed/${path}` },
          error: null,
        }),
      }),
    },
  };

  return { supabase, state };
});

vi.mock('@/lib/supabase', () => ({ supabase: mocks.supabase }));

import { requireAdmin } from '@/lib/admin-guard';
import { GET } from '@/app/api/admin/documents/[id]/route';

const requireAdminMock = requireAdmin as unknown as Mock;

function request() {
  return new NextRequest('http://localhost/api/admin/documents/inst_1');
}

function params(id = 'inst_1') {
  return { params: { id } };
}

beforeEach(() => {
  requireAdminMock.mockReset();
  requireAdminMock.mockResolvedValue(null);
  mocks.state.instructor = {
    id: 'inst_1',
    first_name: 'Alex',
    last_name: 'Sample',
    is_verified: true,
    documents_submitted_at: '2026-01-01T00:00:00.000Z',
    drivers_licence_image_url: 'documents/user_1/drivers_licence-1.png',
    adi_registration_image_url: null,
    certificate_iv_image_url: null,
    wwcc_image_url:
      'https://example.supabase.co/storage/v1/object/public/documents/user_1/wwcc-1.png',
    police_check_image_url: null,
    medical_assessment_image_url: null,
    public_liability_image_url: null,
    vehicle_image_url: null,
  };
});

describe('GET /api/admin/documents/[id]', () => {
  it('returns the guard response when the caller is not an admin', async () => {
    requireAdminMock.mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 403 }),
    );

    const res = await GET(request(), params());

    expect(res.status).toBe(403);
  });

  it('returns 404 when the instructor does not exist', async () => {
    mocks.state.instructor = null;

    const res = await GET(request(), params());

    expect(res.status).toBe(404);
  });

  it('returns signed document links and pending reviews for an admin', async () => {
    const res = await GET(request(), params('inst_1'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.instructor).toMatchObject({
      id: 'inst_1',
      name: 'Alex Sample',
      is_verified: true,
    });

    const licence = body.documents.find(
      (doc: { docType: string }) => doc.docType === 'drivers_licence',
    );
    expect(licence.uploaded).toBe(true);
    expect(licence.path).toBe('documents/user_1/drivers_licence-1.png');
    expect(licence.signedUrl).toBe('https://example.test/signed/user_1/drivers_licence-1.png');

    // Legacy public URLs are normalised to storage paths before signing.
    const wwcc = body.documents.find((doc: { docType: string }) => doc.docType === 'wwcc');
    expect(wwcc.path).toBe('documents/user_1/wwcc-1.png');
    expect(wwcc.signedUrl).toBe('https://example.test/signed/user_1/wwcc-1.png');

    const adi = body.documents.find(
      (doc: { docType: string }) => doc.docType === 'adi_registration',
    );
    expect(adi.uploaded).toBe(false);
    expect(adi.signedUrl).toBeNull();

    expect(body.pendingReviews).toHaveLength(1);
    expect(body.pendingReviews[0]).toMatchObject({
      id: 'rev_1',
      reason: 'low_confidence',
      image_url: 'https://example.test/signed/user_1/drivers_licence-2.png',
    });
    expect(requireAdminMock).toHaveBeenCalledTimes(1);
  });
});
