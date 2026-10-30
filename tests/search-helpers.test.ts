import { describe, expect, it } from 'vitest';
import { haversineKm, isPostcode, matchesInstructorSearch } from '@/lib/search';

const instructor = {
  first_name: 'Priya',
  last_name: 'Sharma',
  suburb: 'Werribee',
  state: 'VIC',
  postcode: '3030',
  service_suburbs: ['Hoppers Crossing', 'Point Cook'],
};

describe('matchesInstructorSearch', () => {
  it('matches instructor names, suburbs and postcodes', () => {
    expect(matchesInstructorSearch(instructor, 'Priya')).toBe(true);
    expect(matchesInstructorSearch(instructor, 'Sharma')).toBe(true);
    expect(matchesInstructorSearch(instructor, 'Werribee')).toBe(true);
    expect(matchesInstructorSearch(instructor, '3030')).toBe(true);
  });

  it('matches a full name across first and last name fields', () => {
    expect(matchesInstructorSearch(instructor, 'Priya Sharma')).toBe(true);
    expect(matchesInstructorSearch(instructor, 'Priya Jones')).toBe(false);
  });

  it('matches service areas and multi-word suburbs', () => {
    expect(matchesInstructorSearch(instructor, 'Point Cook')).toBe(true);
    expect(matchesInstructorSearch(instructor, 'Hoppers')).toBe(true);
  });

  it('returns true for an empty search', () => {
    expect(matchesInstructorSearch(instructor, '   ')).toBe(true);
  });

  it('matches capital cities and state names as region searches', () => {
    expect(matchesInstructorSearch(instructor, 'Melbourne')).toBe(true);
    expect(matchesInstructorSearch(instructor, 'Victoria')).toBe(true);
    expect(matchesInstructorSearch(instructor, 'Sydney')).toBe(false);
    expect(matchesInstructorSearch(instructor, 'New South Wales')).toBe(false);
  });

  it('does not match state codes embedded inside unrelated words', () => {
    const brunswick = { ...instructor, service_suburbs: ['Brunswick', 'Coburg'] };
    expect(matchesInstructorSearch(brunswick, 'Sydney')).toBe(false);
    expect(matchesInstructorSearch(brunswick, 'NSW')).toBe(false);
  });

  it('matches state abbreviations by state only', () => {
    expect(matchesInstructorSearch(instructor, 'VIC')).toBe(true);
    expect(matchesInstructorSearch(instructor, 'NSW')).toBe(false);
  });
});

describe('haversineKm', () => {
  it('returns zero for the same point', () => {
    expect(haversineKm({ lat: -37.9, lng: 144.66 }, { lat: -37.9, lng: 144.66 })).toBe(0);
  });

  it('returns an approximate distance between Melbourne and Geelong', () => {
    const distance = haversineKm(
      { lat: -37.8136, lng: 144.9631 },
      { lat: -38.1499, lng: 144.3617 },
    );
    expect(distance).toBeGreaterThan(60);
    expect(distance).toBeLessThan(90);
  });
});

describe('isPostcode', () => {
  it('detects Australian four-digit postcodes', () => {
    expect(isPostcode('3030')).toBe(true);
    expect(isPostcode(' 5000 ')).toBe(true);
    expect(isPostcode('300')).toBe(false);
    expect(isPostcode('Werribee')).toBe(false);
  });
});
