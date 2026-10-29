import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => {
  const state = {
    instructor: null as Record<string, unknown> | null,
    candidates: [] as Record<string, unknown>[],
    updates: [] as Record<string, unknown>[],
    upserts: [] as Record<string, unknown>[],
    lastUpdate: null as Record<string, unknown> | null,
  };

  function makeBuilder(table: string): any {
    const builder: any = {
      select: () => builder,
      eq: () => builder,
      ilike: () => builder,
      is: () => builder,
      limit: () => builder,
      maybeSingle: async () => ({
        data: table === 'instructors' ? state.instructor : null,
        error: null,
      }),
      single: async () => ({
        data:
          table === 'instructors'
            ? { ...(state.candidates[0] || {}), ...(state.lastUpdate || {}) }
            : null,
        error: null,
      }),
      update: (payload: Record<string, unknown>) => {
        state.updates.push(payload);
        state.lastUpdate = payload;
        return builder;
      },
      upsert: async (payload: Record<string, unknown>) => {
        state.upserts.push(payload);
        return { error: null };
      },
      insert: async () => ({ error: null }),
      then: (resolve: (value: unknown) => void) =>
        resolve({
          data: table === 'instructors' ? state.candidates : null,
          error: null,
        }),
    };
    return builder;
  }

  const supabase = {
    from: (table: string) => makeBuilder(table),
  };

  return { state, supabase };
});

vi.mock('@/lib/supabase', () => ({ supabase: mocks.supabase }));

const clerkUser = {
  imageUrl: 'https://lh3.googleusercontent.com/a/instructor-photo=s200',
  firstName: 'Gmail',
  lastName: 'Instructor',
  primaryEmailAddressId: 'email_1',
  emailAddresses: [
    {
      id: 'email_1',
      emailAddress: 'instructor@gmail.com',
      verification: { status: 'verified' },
    },
  ],
};

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(async () => ({ userId: 'user_1' })),
  clerkClient: vi.fn(async () => ({
    users: { getUser: vi.fn(async () => clerkUser) },
  })),
}));

import { PUT, GET } from '@/app/api/portal/profile/route';

function putRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/portal/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mocks.state.instructor = null;
  mocks.state.candidates = [];
  mocks.state.updates.length = 0;
  mocks.state.upserts.length = 0;
  mocks.state.lastUpdate = null;
});

describe('/api/portal/profile', () => {
  it('stores the Clerk (Gmail) photo when an instructor profile is created', async () => {
    const res = await PUT(putRequest({ first_name: 'Gmail', last_name: 'Instructor' }));

    expect(res.status).toBe(200);
    expect(mocks.state.upserts).toHaveLength(1);
    expect(mocks.state.upserts[0].profile_photo_url).toBe(clerkUser.imageUrl);
    expect(mocks.state.upserts[0].email).toBe('instructor@gmail.com');
  });

  it('replaces an existing generated avatar with the Clerk (Gmail) photo on load', async () => {
    mocks.state.instructor = {
      id: 'inst_1',
      clerk_user_id: 'user_1',
      profile_photo_url: 'https://www.gravatar.com/avatar/abc?d=robohash&s=200',
    };

    const res = await GET(new NextRequest('http://localhost/api/portal/profile'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mocks.state.updates).toContainEqual({ profile_photo_url: clerkUser.imageUrl });
    expect(body.instructor.profile_photo_url).toBe(clerkUser.imageUrl);
  });

  it('links an imported unclaimed listing by verified email instead of creating a duplicate', async () => {
    mocks.state.candidates = [
      {
        id: 'legacy_1',
        slug: 'legacy-listing',
        first_name: 'Legacy',
        last_name: 'Instructor',
        email: 'instructor@gmail.com',
        is_claimed: false,
        clerk_user_id: null,
        profile_photo_url: null,
      },
    ];

    const res = await PUT(putRequest({ bio: 'Updated bio' }));

    expect(res.status).toBe(200);
    expect(mocks.state.upserts).toHaveLength(0);
    const linkUpdate = mocks.state.updates.find((update) => update.clerk_user_id === 'user_1');
    expect(linkUpdate).toMatchObject({
      clerk_user_id: 'user_1',
      is_claimed: true,
      profile_photo_url: clerkUser.imageUrl,
    });
    expect(mocks.state.updates.some((update) => update.bio === 'Updated bio')).toBe(true);
  });

  it('shows the Gmail photo on GET after auto-linking an imported listing', async () => {
    mocks.state.candidates = [
      {
        id: 'legacy_1',
        slug: 'legacy-listing',
        first_name: 'Legacy',
        last_name: 'Instructor',
        email: 'instructor@gmail.com',
        is_claimed: false,
        clerk_user_id: null,
        profile_photo_url: null,
      },
    ];

    const res = await GET(new NextRequest('http://localhost/api/portal/profile'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.instructor.id).toBe('legacy_1');
    expect(body.instructor.profile_photo_url).toBe(clerkUser.imageUrl);
  });
});
