/**
 * Ownership claims are stored in listing_flags.detail so they work with the
 * existing schema (no extra migration needed). Format:
 *   claim:{"clerk_user_id":"...","email":"...","name":"...","adi_number":"..."}
 */
export const CLAIM_PREFIX = 'claim:';

export interface ClaimDetails {
  clerk_user_id?: string;
  email?: string;
  name?: string;
  adi_number?: string;
}

export function parseClaimDetail(detail: string | null | undefined): ClaimDetails | null {
  if (!detail || !detail.startsWith(CLAIM_PREFIX)) return null;
  try {
    const parsed = JSON.parse(detail.slice(CLAIM_PREFIX.length));
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function isOwnershipFlag(detail: string | null | undefined): boolean {
  return detail === 'ownership' || Boolean(parseClaimDetail(detail));
}
