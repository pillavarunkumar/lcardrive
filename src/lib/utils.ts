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
    ['profile_photo_url', instructor.profile_photo_url],
    ['bio', instructor.bio],
    ['phone', instructor.phone],
    ['hourly_rate', instructor.hourly_rate],
    ['transmission', instructor.transmission],
    ['vehicle_make', instructor.vehicle_make],
    ['languages', instructor.languages?.length],
    ['availability_slots', instructor.availability_slots ? Object.keys(instructor.availability_slots).length : 0],
    ['service_suburbs', instructor.service_suburbs?.length],
    ['familiar_test_centres', instructor.familiar_test_centres?.length],
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

export function getAvatarUrl(instructor: { first_name: string; last_name: string; profile_photo_url?: string; gender?: string }): string {
  if (instructor.profile_photo_url) return instructor.profile_photo_url;
  const seed = hashName(`${instructor.first_name}${instructor.last_name}`);
  const idx = seed % 99;
  const gender = instructor.gender === 'female' ? 'women' : 'men';
  return `https://randomuser.me/api/portraits/${gender}/${idx}.jpg`;
}
