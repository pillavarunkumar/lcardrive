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
    ['availability_days', instructor.availability_days?.length],
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
