import { clerkClient } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export interface ClerkProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  emailVerified: boolean;
}

/**
 * Read the signed-in user's Clerk profile. Falls back to an empty profile if
 * Clerk is unavailable so profile editing still works.
 */
export async function getClerkProfile(userId: string): Promise<ClerkProfile | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const primary = user.emailAddresses.find((address) => address.id === user.primaryEmailAddressId);
    const verified = [primary, ...user.emailAddresses].find(
      (address) => address && address.verification?.status === 'verified',
    );
    const chosen = verified || primary || user.emailAddresses[0];

    return {
      userId,
      email: chosen?.emailAddress?.trim().toLowerCase() || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      imageUrl: user.imageUrl || '',
      emailVerified: chosen?.verification?.status === 'verified',
    };
  } catch (error) {
    console.warn('Could not read Clerk profile:', error);
    return null;
  }
}

interface LinkResult {
  instructor: Record<string, any> | null;
  linkedNow: boolean;
}

/** Escape PostgREST ILIKE wildcards so an email is matched literally. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

/**
 * Find the instructor row for a Clerk user.
 *
 * Imported/unclaimed listings are matched only when the user has a verified
 * Clerk email that matches exactly one unclaimed row. This keeps a Google
 * signup from creating a duplicate listing and gives the imported listing the
 * account's Gmail photo. Ambiguous or already-claimed rows are left for the
 * manual claim review flow.
 */
export async function findOrLinkInstructor(
  userId: string,
  profile: ClerkProfile | null,
): Promise<LinkResult> {
  if (!supabase) return { instructor: null, linkedNow: false };

  const { data: existing, error } = await supabase
    .from('instructors')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('findOrLinkInstructor: lookup by Clerk id failed:', error.message);
  }
  if (existing) return { instructor: existing, linkedNow: false };
  if (!profile?.email || !profile.emailVerified) return { instructor: null, linkedNow: false };

  const { data: candidates, error: candidateError } = await supabase
    .from('instructors')
    .select('*')
    .ilike('email', escapeLike(profile.email))
    .is('clerk_user_id', null)
    .limit(2);

  if (candidateError) {
    console.error('findOrLinkInstructor: lookup by email failed:', candidateError.message);
    return { instructor: null, linkedNow: false };
  }

  const rows = candidates || [];
  const unclaimed = rows.filter((row) => !row.is_claimed);
  // Never auto-link when the email is ambiguous or any matching row is already
  // claimed; those cases go through the manual ownership-review flow.
  if (rows.length !== 1 || unclaimed.length !== 1) return { instructor: null, linkedNow: false };

  const target = unclaimed[0];
  const update: Record<string, unknown> = {
    clerk_user_id: userId,
    is_claimed: true,
  };
  if (profile.imageUrl) update.profile_photo_url = profile.imageUrl;
  if (!target.email) update.email = profile.email;

  const { data: linked, error: linkError } = await supabase
    .from('instructors')
    .update(update)
    .eq('id', target.id)
    .select('*')
    .single();

  if (linkError || !linked) {
    console.error('findOrLinkInstructor: link update failed:', linkError?.message);
    return { instructor: null, linkedNow: false };
  }

  return { instructor: linked, linkedNow: true };
}

/** Keep the public photo in sync with the signed-in Clerk/Google account. */
export async function syncClerkPhoto(
  instructor: Record<string, any>,
  profile: ClerkProfile | null,
): Promise<Record<string, any>> {
  if (!supabase || !profile?.imageUrl || instructor.profile_photo_url === profile.imageUrl) {
    return instructor;
  }

  const { error } = await supabase
    .from('instructors')
    .update({ profile_photo_url: profile.imageUrl })
    .eq('id', instructor.id);

  if (error) {
    console.warn('Could not sync Clerk profile photo:', error.message);
    return instructor;
  }
  return { ...instructor, profile_photo_url: profile.imageUrl };
}
