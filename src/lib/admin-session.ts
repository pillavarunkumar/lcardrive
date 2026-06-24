const SESSION_PREFIX = 'v1';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 2;
const encoder = new TextEncoder();

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SECRET || process.env.CLERK_SECRET_KEY || '';
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function equalSignatures(a: string, b: string) {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

export async function createAdminSession(subject: string) {
  const secret = getAdminSessionSecret();
  if (!secret) throw new Error('Admin session secret is not configured');

  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const safeSubject = encodeURIComponent(subject);
  const payload = `${safeSubject}.${expiresAt}`;
  const signature = await sign(payload, secret);

  return {
    maxAge: SESSION_MAX_AGE_SECONDS,
    value: `${SESSION_PREFIX}.${payload}.${signature}`,
  };
}

export async function verifyAdminSession(value?: string) {
  const secret = getAdminSessionSecret();
  if (!value || !secret) return false;

  const [prefix, subject, expiresAt, signature, ...extra] = value.split('.');
  if (extra.length || prefix !== SESSION_PREFIX || !subject || !expiresAt || !signature) {
    return false;
  }

  const expiresAtNumber = Number(expiresAt);
  if (!Number.isFinite(expiresAtNumber) || expiresAtNumber <= Date.now()) {
    return false;
  }

  const payload = `${subject}.${expiresAt}`;
  const expectedSignature = await sign(payload, secret);

  return equalSignatures(signature, expectedSignature);
}
