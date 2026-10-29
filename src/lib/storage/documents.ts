import { supabase } from '@/lib/supabase';

export const DOCUMENTS_BUCKET = 'documents';
export const DOCUMENTS_PREFIX = `${DOCUMENTS_BUCKET}/`;

export function buildDocumentPath(clerkUserId: string, docType: string, extension: string): string {
  const safeUser = clerkUserId.replace(/[^a-zA-Z0-9_-]/g, '');
  const safeType = docType.replace(/[^a-z_]/g, '');
  return `${DOCUMENTS_PREFIX}${safeUser}/${safeType}-${Date.now()}.${extension}`;
}

/**
 * Values written before this change were full public URLs. Values written now
 * are canonical `documents/<clerkId>/<file>` paths. Accept both.
 */
export function normalizeDocumentPath(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith(DOCUMENTS_PREFIX)) {
    return trimmed;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return null;
  }

  const markers = [
    '/storage/v1/object/public/documents/',
    '/storage/v1/object/sign/documents/',
    '/storage/v1/object/authenticated/documents/',
  ];

  for (const marker of markers) {
    const index = trimmed.indexOf(marker);
    if (index !== -1) {
      const rest = trimmed.slice(index + marker.length).split('?')[0];
      if (!rest) return null;
      try {
        return `${DOCUMENTS_PREFIX}${decodeURIComponent(rest)}`;
      } catch {
        return `${DOCUMENTS_PREFIX}${rest}`;
      }
    }
  }

  return null;
}

export function objectPathFromDocumentPath(path: string): string {
  return path.startsWith(DOCUMENTS_PREFIX) ? path.slice(DOCUMENTS_PREFIX.length) : path;
}

export function documentPathBelongsToUser(path: string, clerkUserId: string): boolean {
  const objectPath = objectPathFromDocumentPath(path);
  return objectPath.startsWith(`${clerkUserId}/`);
}

export async function createSignedDocumentUrl(
  storedValue: string | null | undefined,
  expiresInSeconds = 300,
): Promise<string | null> {
  if (!supabase) return null;

  const path = normalizeDocumentPath(storedValue);
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(objectPathFromDocumentPath(path), expiresInSeconds);

  if (error || !data) return null;
  return data.signedUrl;
}
