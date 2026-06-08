'use client';

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import FilterSidebar from '@/components/FilterSidebar';
import InstructorCard from '@/components/InstructorCard';
import type { Instructor, SearchFilters } from '@/types';

const MOCK_INSTRUCTORS: Instructor[] = [
  { id: '1', slug: 'sarah-m-footscray', first_name: 'Sarah', last_name: 'Mitchell', suburb: 'Footscray', state: 'VIC', postcode: '3011', bio: '12 years experience helping nervous students pass their first time in Footscray and Yarraville area.', hourly_rate: 75, transmission: 'both', licence_types: ['car'], specialises_anxiety: true, accepts_international: true, familiar_test_centres: ['Sunshine', 'Moorabbin'], languages: ['English'], average_rating: 4.9, review_count: 24, is_verified: true, is_claimed: true, profile_completeness: 90, service_suburbs: ['Footscray', 'Sunshine', 'Yarraville'], service_radius_km: 10, dual_controls: true, availability_days: ['mon', 'tue', 'wed', 'thu', 'fri'], created_at: '2026-01-15', updated_at: '2026-05-20', package_options: [], avg_rating_patience: 4.9, avg_rating_communication: 4.8, avg_rating_value: 4.7, avg_rating_punctuality: 4.9, profile_photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm9MY0RxUPT8iI0GrzkoQE_8jRrbLjQzKRWb69deTk_MFAU2vxXFrCjqyZ4g-rgpV-EP2skh7FVvyPtSO3Apw5WeM4tFcvOvwLVcbyzd1Ub53FDKYvmOiq56AlwGzh9tb9eFs3DipcGANS2fIKm-WfdwC3oBoaZrHuzrl14OcBKiyp5EhKXoVlwriJ1UKh0cmKtxhvPf0MaSKQhowG8mXCjC3f0TZysusrBJC36mo9Spfb5fxjVY7lyPe_qvPCjHpvgzeEaqo5' },
  { id: '2', slug: 'james-c-sunshine', first_name: 'James', last_name: 'Chen', suburb: 'Sunshine', state: 'VIC', postcode: '3020', bio: 'Specialist in converting international licences and advanced defensive driving techniques.', hourly_rate: 80, transmission: 'both', licence_types: ['car'], specialises_anxiety: false, accepts_international: true, familiar_test_centres: ['Sunshine'], languages: ['English', 'Mandarin'], average_rating: 5.0, review_count: 18, is_verified: true, is_claimed: true, profile_completeness: 85, service_suburbs: ['Sunshine', 'Deer Park', 'St Albans'], service_radius_km: 15, dual_controls: true, availability_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'], created_at: '2026-02-01', updated_at: '2026-05-18', package_options: [], avg_rating_patience: 4.5, avg_rating_communication: 4.7, avg_rating_value: 4.6, avg_rating_punctuality: 4.8, profile_photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlCugeUr-BuyIHgxrMJJnR-NHMGk7ilAnwmHYsjVB00CBk-4Crg16GPCj_a0wudcva7pEcCsKEfd4i7TfIDXlo0noobicdBnCDs1e7TBhbGRPZ5kNWeb01T52EaC5dCy6ouR5sfzE6ZJ6sxHyBVSYf8rZ35Fwi_0tfGf-YYNlVSEvVYtBEf9S28o98lrD-n3ht0maQPUUMr8IIMLrxHxLjyn4kWBB-ujaqEi-CXOMi3qFIOxYYLs0anwlhCyC3yKGXMZUno4Yd' },
  { id: '3', slug: 'emma-r-werribee', first_name: 'Emma', last_name: 'Roberts', suburb: 'Werribee', state: 'VIC', postcode: '3030', bio: 'Patient and flexible. Emma offers weekend and evening slots to accommodate busy students.', hourly_rate: 72, transmission: 'auto', licence_types: ['car'], specialises_anxiety: true, accepts_international: false, familiar_test_centres: ['Werribee'], languages: ['English'], average_rating: 4.8, review_count: 31, is_verified: true, is_claimed: true, profile_completeness: 95, service_suburbs: ['Werribee', 'Hoppers Crossing', 'Point Cook'], service_radius_km: 10, dual_controls: true, availability_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], created_at: '2025-11-10', updated_at: '2026-05-22', package_options: [], avg_rating_patience: 5.0, avg_rating_communication: 4.9, avg_rating_value: 4.8, avg_rating_punctuality: 4.9, profile_photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKRAeJo9wtWQRHXNWrlBMZkpiz2fQKPaidnWsDpq_vkgw8JgrBIiFInquBcs4XR35xxc1pwjgzN065-YuNHiFJhizr2FHRmF_R538WlN0bMJaKLcc2y9OIp8pZK9ZKsg-un9risuM8H8vl4CbEJyJMpxA9s2p5goBhfwan5oBequvo9dUMgKxFDOIEyNJo7ADgKIxTLrPYOkn0peXmsXY0hhePL1SHO6NLoRqHKK9qUoIteio6AuA2q4u5QqQ7K0w7x1wYQULo' },
  { id: '4', slug: 'marcos-g-coburg', first_name: 'Marcos', last_name: 'Garcia', suburb: 'Coburg', state: 'VIC', postcode: '3058', bio: 'Patient instructor specialising in manual transmissions and nervous drivers.', hourly_rate: 60, transmission: 'manual', licence_types: ['car'], specialises_anxiety: true, accepts_international: true, familiar_test_centres: ['Carlton', 'Moorabbin'], languages: ['English', 'Spanish'], average_rating: 4.7, review_count: 15, is_verified: true, is_claimed: true, profile_completeness: 70, service_suburbs: ['Coburg', 'Brunswick', 'Preston'], service_radius_km: 10, dual_controls: true, availability_days: ['tue', 'wed', 'thu', 'fri', 'sat'], created_at: '2026-03-05', updated_at: '2026-05-15', package_options: [], avg_rating_patience: 4.6, avg_rating_communication: 4.7, avg_rating_value: 4.8, avg_rating_punctuality: 4.5, profile_photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80' },
  { id: '5', slug: 'priya-k-preston', first_name: 'Priya', last_name: 'Kumar', suburb: 'Preston', state: 'VIC', postcode: '3072', bio: 'Multi-lingual instructor with 10 years experience. Specialises in nervous learners.', hourly_rate: 70, transmission: 'both', licence_types: ['car', 'truck'], specialises_anxiety: true, accepts_international: true, familiar_test_centres: ['Carlton', 'Moorabbin'], languages: ['English', 'Hindi', 'Punjabi'], average_rating: 4.9, review_count: 42, is_verified: true, is_claimed: true, profile_completeness: 100, service_suburbs: ['Preston', 'Reservoir', 'Thomastown', 'Epping'], service_radius_km: 15, dual_controls: true, availability_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'], created_at: '2025-08-20', updated_at: '2026-05-22', package_options: [], avg_rating_patience: 5.0, avg_rating_communication: 4.9, avg_rating_value: 4.9, avg_rating_punctuality: 4.8, profile_photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80' },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const initialSuburb = searchParams.get('suburb') || '';
  const initialTransmission = searchParams.get('transmission') as 'auto' | 'manual' | undefined || undefined;
  const initialAnxiety = searchParams.get('anxiety_friendly') === 'true' || undefined;
  const initialInternational = searchParams.get('international_conversion') === 'true' || undefined;

  const [filters, setFilters] = useState<SearchFilters>({
    suburb: initialSuburb,
    sort: 'relevance',
    max_price: 150,
    transmission: initialTransmission,
    anxiety_friendly: initialAnxiety,
    international_conversion: initialInternational,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(initialSuburb);

  const filtered = useMemo(() => {
    let results = [...MOCK_INSTRUCTORS];
    if (filters.suburb) {
      const q = filters.suburb.toLowerCase();
      results = results.filter((i) => i.suburb.toLowerCase().includes(q) || i.service_suburbs.some((s) => s.toLowerCase().includes(q)));
    }
    if (filters.transmission) {
      results = results.filter((i) => i.transmission === filters.transmission || i.transmission === 'both');
    }
    if (filters.max_price && filters.max_price < 150) {
      results = results.filter((i) => (i.hourly_rate || 0) <= filters.max_price!);
    }
    if (filters.anxiety_friendly) results = results.filter((i) => i.specialises_anxiety);
    if (filters.international_conversion) results = results.filter((i) => i.accepts_international);
    if (filters.test_centre_familiarity) results = results.filter((i) => i.familiar_test_centres.length > 0);
    if (filters.languages?.length) {
      results = results.filter((i) => filters.languages!.some((l) => i.languages.includes(l)));
    }
    switch (filters.sort) {
      case 'price_asc': results.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0)); break;
      case 'price_desc': results.sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0)); break;
      case 'rating': results.sort((a, b) => b.average_rating - a.average_rating); break;
    }
    return results;
  }, [filters]);

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="md:hidden flex justify-between items-center mb-4 px-margin-mobile pt-4">
        <h1 className="font-headline-sm text-headline-sm">{filtered.length} Instructors found</h1>
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2 border border-outline-variant rounded-lg px-4 py-2 bg-surface-container-lowest font-label-md text-label-md"
        >
          <span className="material-symbols-outlined text-[20px]">tune</span> Filters
        </button>
      </div>

      <div className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-md flex flex-col md:flex-row gap-gutter relative">
        {/* Left Sidebar Filters - Desktop */}
        <aside className="hidden md:flex w-64 flex-shrink-0 flex-col gap-stack-md sticky top-[100px] h-[calc(100vh-120px)] overflow-y-auto sidebar-scroll pr-4">
          <FilterSidebar filters={filters} onFilterChange={setFilters} />
        </aside>

        {/* Mobile filter overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setShowMobileFilters(false)}>
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-on-surface">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)}><span className="material-symbols-outlined">close</span></button>
              </div>
              <FilterSidebar filters={filters} onFilterChange={setFilters} />
            </div>
          </div>
        )}

        {/* Main Results Area */}
        <section className="flex-1 flex flex-col gap-stack-sm min-w-0">
          {/* Top Action Bar - Desktop */}
          <div className="hidden md:flex justify-between items-center bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="font-label-md text-label-md text-on-surface">{filtered.length} Instructors available in your area</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Sort by:</span>
              <select
                value={filters.sort || 'relevance'}
                onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value as any }))}
                className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 font-label-md text-label-md text-on-surface focus:ring-2 focus:ring-secondary focus:border-secondary outline-none cursor-pointer"
              >
                <option value="relevance">Relevance (AI Match)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="rating">Highest Rated</option>
                <option value="price_desc">Nearest to me</option>
              </select>
            </div>
          </div>

          {/* Results Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-outline text-lg font-body">No instructors found matching your filters.</p>
              <button onClick={() => setFilters({ sort: 'relevance', max_price: 150 })} className="mt-4 border border-outline-variant px-6 py-2 rounded-lg font-label-md text-label-md hover:bg-surface-container">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mt-2">
                {filtered.slice(0, 4).map((instructor) => (
                  <InstructorCard key={instructor.id} instructor={instructor} variant="horizontal" />
                ))}

                {/* AI Promo Card - spans 2 columns */}
                <div className="lg:col-span-2 bg-gradient-to-r from-surface-container-high to-surface-container rounded-xl p-6 shadow-sm border border-secondary-fixed-dim/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl"></div>
                  <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-primary/5 rounded-full blur-xl"></div>
                  <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                      <span className="font-label-md text-label-md text-secondary font-bold tracking-wide">AI MATCHMAKER</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Not sure who to choose?</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-md">Let our AI analyze your learning style, anxiety levels, and schedule to find the perfect instructor for you in under 60 seconds.</p>
                  </div>
                  <div className="relative z-10 flex-shrink-0 w-full md:w-auto">
                    <a
                      href="/find-my-instructor"
                      className="w-full md:w-auto bg-secondary text-on-secondary px-6 py-3 rounded-xl font-label-md text-label-md hover:brightness-110 transition-all shadow-[0_4px_14px_0_rgba(0,106,97,0.39)] hover:shadow-[0_6px_20px_rgba(0,106,97,0.23)] flex items-center justify-center gap-2"
                    >
                      Start AI Match
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </a>
                  </div>
                </div>

                {filtered.slice(4).map((instructor) => (
                  <InstructorCard key={instructor.id} instructor={instructor} variant="horizontal" />
                ))}
              </div>

              {filtered.length > 6 && (
                <div className="w-full flex justify-center mt-6">
                  <button className="bg-surface border-2 border-outline-variant text-on-surface font-label-md text-label-md px-8 py-3 rounded-full hover:border-secondary hover:text-secondary transition-colors">
                    Load More Results
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="pt-24 pb-16 px-4 text-center text-outline">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
