import { describe, expect, it } from 'vitest';
import { getAvatarUrl, getInitialsAvatar, gravatarUrl, md5 } from '@/lib/avatar';
import { sanitizePublicInstructor } from '@/lib/instructors/public';

describe('avatar helpers', () => {
  it('computes RFC 1321 MD5 vectors', () => {
    expect(md5('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
    expect(md5('abc')).toBe('900150983cd24fb0d6963f7d28e17f72');
    expect(md5('The quick brown fox jumps over the lazy dog')).toBe('9e107d9d372bb6826bd81d3542a419d6');
  });

  it('builds a real Gravatar URL from a normalised email', () => {
    expect(gravatarUrl('Test.User+tag@Gmail.com')).toBe(
      'https://www.gravatar.com/avatar/ea07707bf2c2f463e6aef8c761aaf1c6?d=404&s=200',
    );
  });

  it('prefers a stored Clerk/Google photo over Gravatar', () => {
    expect(
      getAvatarUrl({
        first_name: 'Gmail',
        last_name: 'Instructor',
        email: 'instructor@gmail.com',
        profile_photo_url: 'https://lh3.googleusercontent.com/a/photo',
      }),
    ).toBe('https://lh3.googleusercontent.com/a/photo');
  });

  it('uses Gravatar when only an email is available', () => {
    expect(getAvatarUrl({ first_name: 'Gmail', last_name: 'Instructor', email: 'instructor@gmail.com' })).toContain(
      'fc2001660f9fffa6ce8774dab6d66fce',
    );
  });

  it('falls back to a local initials image, not a random stock portrait', () => {
    const url = getAvatarUrl({ first_name: 'Sarah', last_name: 'Mitchell' });
    expect(url.startsWith('data:image/svg+xml')).toBe(true);
    expect(decodeURIComponent(url)).toContain('>SM<');
    expect(url).not.toContain('randomuser.me');
  });

  it('ignores an unusable stored photo URL', () => {
    const url = getInitialsAvatar({ first_name: 'A', last_name: 'B' });
    expect(getAvatarUrl({ first_name: 'A', last_name: 'B', profile_photo_url: 'not-a-url' })).toBe(url);
  });
});

describe('public instructor normalisation', () => {
  it('replaces database nulls with safe display defaults', () => {
    const safe = sanitizePublicInstructor({
      id: '1',
      first_name: 'A',
      last_name: 'B',
      average_rating: null,
      review_count: null,
      languages: null,
      service_suburbs: null,
      is_verified: true,
      email: 'private@example.com',
    });

    expect(safe.average_rating).toBe(0);
    expect(safe.review_count).toBe(0);
    expect(safe.languages).toEqual([]);
    expect(safe.service_suburbs).toEqual([]);
    expect(safe.is_verified).toBe(true);
    expect(safe).not.toHaveProperty('email');
  });
});
