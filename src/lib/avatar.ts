/**
 * Avatar helpers shared by server and client components.
 *
 * Priority:
 *   1. Stored profile photo (Clerk/Google image is copied here on sign-in).
 *   2. Gravatar for the instructor's email (correct RFC 1321 MD5 hash).
 *   3. Deterministic local initials avatar — no third-party request, no
 *      generic stock portrait pretending to be the instructor.
 */

export interface AvatarInput {
  first_name?: string | null;
  last_name?: string | null;
  profile_photo_url?: string | null;
  email?: string | null;
  gender?: string | null;
}

const AVATAR_COLOURS = ['#064E3B', '#047857', '#0F766E', '#B45309', '#1D4ED8', '#7C3AED'];

/** RFC 1321 MD5. Gravatar hashes the lowercase, trimmed email with MD5. */
export function md5(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const bitLength = bytes.length * 8;
  const paddedLength = (((bytes.length + 8) >> 6) + 1) * 64;
  const buffer = new Uint8Array(paddedLength);
  buffer.set(bytes);
  buffer[bytes.length] = 0x80;

  const view = new DataView(buffer.buffer);
  view.setUint32(paddedLength - 8, bitLength >>> 0, true);
  view.setUint32(paddedLength - 4, Math.floor(bitLength / 0x100000000), true);

  const shifts = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];
  const constants = Array.from({ length: 64 }, (_, i) =>
    Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0,
  );

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let offset = 0; offset < paddedLength; offset += 64) {
    const words = new Uint32Array(16);
    for (let i = 0; i < 16; i++) {
      words[i] = view.getUint32(offset + i * 4, true);
    }

    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let i = 0; i < 64; i++) {
      let f: number;
      let g: number;

      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }

      const sum = (a + f + constants[i] + words[g]) >>> 0;
      const rotated = ((sum << shifts[i]) | (sum >>> (32 - shifts[i]))) >>> 0;

      a = d;
      d = c;
      c = b;
      b = (b + rotated) >>> 0;
    }

    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  const out = new Uint8Array(16);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, a0, true);
  outView.setUint32(4, b0, true);
  outView.setUint32(8, c0, true);
  outView.setUint32(12, d0, true);

  return Array.from(out, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function gravatarUrl(email: string, size = 200): string {
  const hash = md5(email.trim().toLowerCase());
  // d=404 keeps a missing Gravatar from showing an unrelated stock face.
  // The Avatar component swaps in the local initials image on error.
  return `https://www.gravatar.com/avatar/${hash}?d=404&s=${size}`;
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = (firstName || '').trim();
  const last = (lastName || '').trim();
  const letters = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  return letters || '?';
}

export function getInitialsAvatar(instructor: AvatarInput, size = 200): string {
  const initials = getInitials(instructor.first_name, instructor.last_name);
  const colour = AVATAR_COLOURS[
    hashString(`${instructor.first_name || ''}${instructor.last_name || ''}`) % AVATAR_COLOURS.length
  ];
  const fontSize = Math.round(size * 0.42);
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    `<rect width="${size}" height="${size}" fill="${colour}"/>`,
    `<text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="system-ui,-apple-system,'Segoe UI',Roboto,sans-serif" font-size="${fontSize}" font-weight="600" fill="#ffffff">${initials}</text>`,
    '</svg>',
  ].join('');
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function isUsablePhotoUrl(value?: string | null): boolean {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim());
}

export function getAvatarUrl(instructor: AvatarInput, size = 200): string {
  if (isUsablePhotoUrl(instructor.profile_photo_url)) {
    return instructor.profile_photo_url!.trim();
  }
  if (instructor.email && instructor.email.trim()) {
    return gravatarUrl(instructor.email, size);
  }
  return getInitialsAvatar(instructor, size);
}

/** Local image used when a remote avatar fails to load (e.g. no Gravatar). */
export function getAvatarFallback(instructor: AvatarInput, size = 200): string {
  return getInitialsAvatar(instructor, size);
}
