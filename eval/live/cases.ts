import type { DocType } from '../../src/lib/ai/document-schema';

export interface LiveCase {
  id: string;
  docType: DocType;
  image: string;
  description: string;
  expected: Record<string, unknown>;
}

/**
 * Small live sample for real-Gemini sanity checking. The images are generated
 * by generate_fixtures.py and contain invented names/numbers only.
 */
export const liveCases: LiveCase[] = [
  {
    id: 'live-dl-clean',
    docType: 'drivers_licence',
    image: 'dl-clean.png',
    description: 'Clean synthetic driver licence',
    expected: {
      full_name: 'Alex Sample',
      licence_number: 'SYN-100001',
      expiry_date: '2029-03-14',
    },
  },
  {
    id: 'live-dl-rotated',
    docType: 'drivers_licence',
    image: 'dl-rotated.png',
    description: 'Licence rotated by 6 degrees',
    expected: {
      full_name: 'Bailey Example',
      licence_number: 'SYN-100002',
      expiry_date: '2028-11-02',
    },
  },
  {
    id: 'live-dl-blurry',
    docType: 'drivers_licence',
    image: 'dl-blurry.png',
    description: 'Licence with gaussian blur',
    expected: {
      full_name: 'Casey Fiction',
      licence_number: 'SYN-100003',
      expiry_date: '2030-01-01',
    },
  },
  {
    id: 'live-adi',
    docType: 'adi_registration',
    image: 'adi.png',
    description: 'Synthetic ADI registration certificate',
    expected: {
      full_name: 'Grace Example',
      adi_registration: 'ADI-SYN-2001',
      adi_registration_expiry: '2028-02-29',
    },
  },
  {
    id: 'live-wwcc',
    docType: 'wwcc',
    image: 'wwcc.png',
    description: 'Synthetic WWCC card',
    expected: {
      full_name: 'Morgan Mock',
      wwcc_number: 'WWC-SYN-4001',
      wwcc_expiry: '2032-01-15',
    },
  },
  {
    id: 'live-vehicle',
    docType: 'vehicle_registration',
    image: 'vehicle.png',
    description: 'Synthetic vehicle registration certificate',
    expected: {
      vehicle_make: 'Toyota',
      vehicle_model: 'Corolla',
      vehicle_year: 2021,
      vehicle_rego: 'SYN-123',
      vehicle_color: 'White',
    },
  },
];
