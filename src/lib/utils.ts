import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(firstName: string, lastName: string, suburb: string) {
  return `${firstName.toLowerCase()}-${lastName[0].toLowerCase()}-${suburb.toLowerCase().replace(/\s+/g, '-')}`;
}

export function computeCompleteness(instructor: Record<string, any>): number {
  const fields: [string, any][] = [
    // Identity & Contact (4 items → 20%)
    ['profile_photo_url', instructor.profile_photo_url],
    ['bio', instructor.bio],
    ['phone', instructor.phone],
    ['suburb', instructor.suburb],

    // Qualifications (5 items → 25%)
    ['licence_types', instructor.licence_types?.length],
    ['transmission', instructor.transmission],
    ['languages', instructor.languages?.length],
    ['teaching_style', instructor.teaching_style],
    ['primary_learner_types', instructor.primary_learner_types],

    // Documents (5 items → 25%)
    ['drivers_licence_number', instructor.drivers_licence_number],
    ['adi_registration', instructor.adi_registration],
    ['wwcc_number', instructor.wwcc_number],
    ['certificate_iv_reference', instructor.certificate_iv_reference],
    ['public_liability_provider', instructor.public_liability_provider],

    // Vehicle (2 items → 10%)
    ['vehicle_make', instructor.vehicle_make],
    ['vehicle_rego', instructor.vehicle_rego],

    // Pricing & Service Areas (3 items → 15%)
    ['hourly_rate', instructor.hourly_rate],
    ['service_suburbs', instructor.service_suburbs?.length],
    ['availability_slots', instructor.availability_slots ? Object.keys(instructor.availability_slots).length : 0],

    // Social (1 item → 5%)
    ['social_facebook', instructor.social_facebook],
  ];
  const filled = fields.filter(([_, v]) => Boolean(v)).length;
  return Math.round((filled / fields.length) * 100);
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len).trimEnd() + '...';
}

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getAvatarUrl(instructor: { first_name: string; last_name: string; profile_photo_url?: string; gender?: string; email?: string }): string {
  if (instructor.profile_photo_url) return instructor.profile_photo_url;
  if (instructor.email) {
    const email = instructor.email.trim().toLowerCase();
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = ((hash << 5) - hash) + email.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(32, '0');
    return `https://www.gravatar.com/avatar/${hex}?d=robohash&s=200`;
  }
  const seed = hashName(`${instructor.first_name}${instructor.last_name}`);
  const idx = seed % 99;
  const gender = instructor.gender === 'female' ? 'women' : 'men';
  return `https://randomuser.me/api/portraits/${gender}/${idx}.jpg`;
}
