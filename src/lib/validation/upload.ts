export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const EXTENSIONS: Record<AllowedMimeType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

export interface UploadValidation {
  ok: true;
  mimeType: AllowedMimeType;
  extension: string;
  size: number;
}

export interface UploadRejection {
  ok: false;
  status: 413 | 415;
  error: string;
}

/**
 * Checks the declared MIME type, the byte length and the file signature. The
 * browser's `accept` attribute is a hint only and is never trusted server-side.
 */
export function validateUpload(file: File, bytes: Buffer): UploadValidation | UploadRejection {
  if (bytes.length === 0) {
    return { ok: false, status: 415, error: 'File is empty' };
  }

  if (bytes.length > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      status: 413,
      error: `File exceeds the ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))}MB limit`,
    };
  }

  const declared = (file.type || '').toLowerCase();
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(declared)) {
    return {
      ok: false,
      status: 415,
      error: `Unsupported file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  const sniffed = sniffMimeType(bytes);
  if (!sniffed) {
    return { ok: false, status: 415, error: 'File contents do not match an allowed image or PDF format' };
  }

  if (sniffed !== declared) {
    return {
      ok: false,
      status: 415,
      error: `Declared type ${declared} does not match file contents (${sniffed})`,
    };
  }

  const mimeType = sniffed as AllowedMimeType;

  return { ok: true, mimeType, extension: EXTENSIONS[mimeType], size: bytes.length };
}

export function sniffMimeType(bytes: Buffer): AllowedMimeType | null {
  // JPEG: FF D8 FF
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }

  // WEBP: "RIFF" .... "WEBP"
  if (
    bytes.length >= 12 &&
    bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }

  // PDF: "%PDF-"
  if (bytes.length >= 5 && bytes.toString('ascii', 0, 5) === '%PDF-') {
    return 'application/pdf';
  }

  return null;
}
