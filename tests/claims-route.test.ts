import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const state = {
    instructor: null as Record<string, unknown> | null,
    pending: [] as Record<string, unknown>[],
    inserts: [] as Record<string, unknown>[],
  };

  function makeBuilder(table: string): any {
    const builder: any = {
      select: () => builder,
      eq: () => builder,
      like: () => builder,
      maybeSingle: async () => ({ data: table === 'instructors' ? state.instructor : null, error: null }),
      insert: async (payload: Record<string, unknown>) => {
        state.inserts.push(payload);
        return { error: null };
      },
      then: (resolve: (value: unknown) => void) =>
        resolve({ data: table === 'listing_flags' ? state.pending : null, error: null }),
    };
    return builder;
  }

  return {
    state,
    supabase: { from: (table: string) => makeBuilder(table) },
  };
});

vi.mock('@/lib/supabase', () => ({ supabase: mocks.supabase }));
vi.mock('@/lib/http/rate-limit', () => ({
  rateLimit: () => ({ allowed: true, retryAfterSeconds: 0 }),
}));
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(async () => ({ userId: 'user_1' })),
  clerkClient: vi.fn(async () => ({
    users: {
      getUser: vi.fn(async () => ({
        imageUrl: 'https://lh3.googleusercontent.com/a/photo',
        firstName: 'Gmail',
        lastName: 'Instructor',
        primaryEmailAddressId: 'email_1',
        emailAddresses: [
          { id: 'email_1', emailAddress: 'instructor@gmail.com', verification: { status: 'verified' } },
        ],
      })),
    },
  })),
}));

import { POST } from '@/app/api/claims/route';
import { parseClaimDetail } from '@/lib/claims';

function request(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/claims', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mocks.state.instructor = null;
  mocks.state.pending = [];
  mocks.state.inserts.length = 0;
});

describe('/api/claims', () => {
  it('stores the signed-in claimant identity with the pending ownership flag', async () => {
    mocks.state.instructor = {
      id: 'inst_1',
      is_claimed: false,
      clerk_user_id: null,
      adi_registration: null,
    };

    const res = await POST(request({ instructor_id: 'inst_1', adi_number: 'ADI-123' }));

    expect(res.status).toBe(200);
    expect(mocks.state.inserts).toHaveLength(1);
    expect(mocks.state.inserts[0]).toMatchObject({
      instructor_id: 'inst_1',
      reason: 'incorrect_info',
      is_resolved: false,
    });
    const claim = parseClaimDetail(mocks.state.inserts[0].detail as string);
    expect(claim).toMatchObject({
      clerk_user_id: 'user_1',
      email: 'instructor@gmail.com',
      name: 'Gmail Instructor',
      adi_number: 'ADI-123',
    });
  });

  it('refuses to claim a listing already owned by another account', async () => {
    mocks.state.instructor = {
      id: 'inst_1',
      is_claimed: true,
      clerk_user_id: 'user_other',
    };

    const res = await POST(request({ instructor_id: 'inst_1' }));

    expect(res.status).toBe(409);
    expect(mocks.state.inserts).toHaveLength(0);
  });

  it('is idempotent when the same user already has a pending claim', async () => {
    mocks.state.instructor = {
      id: 'inst_1',
      is_claimed: false,
      clerk_user_id: null,
    };
    mocks.state.pending = [
      {
        id: 'flag_1',
        detail: 'claim:{"clerk_user_id":"user_1","email":"instructor@gmail.com"}',
      },
    ];

    const res = await POST(request({ instructor_id: 'inst_1' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.alreadyPending).toBe(true);
    expect(mocks.state.inserts).toHaveLength(0);
  });
});
