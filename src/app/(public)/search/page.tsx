'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import FilterSidebar from '@/components/FilterSidebar';
import InstructorCard from '@/components/InstructorCard';
import type { Instructor, SearchFilters } from '@/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialSuburb = searchParams.get('suburb') || '';
  const initialRadius = searchParams.get('radius_km') ? Number(searchParams.get('radius_km')) : undefined;
  const initialTransmission = searchParams.get('transmission') as 'auto' | 'manual' | undefined || undefined;
  const initialAnxiety = searchParams.get('anxiety_friendly') === 'true' || undefined;
  const initialInternational = searchParams.get('international_conversion') === 'true' || undefined;

  const [filters, setFilters] = useState<SearchFilters>({
    suburb: initialSuburb,
    radius_km: initialRadius,
    sort: 'relevance',
    max_price: 150,
    transmission: initialTransmission,
    anxiety_friendly: initialAnxiety,
    international_conversion: initialInternational,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(initialSuburb);
  const [results, setResults] = useState<Instructor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchResults = useCallback(async (f: SearchFilters, page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (f.suburb) params.set('suburb', f.suburb);
    if (f.radius_km) params.set('radius_km', String(f.radius_km));

    if (f.transmission) params.set('transmission', f.transmission);
    if (f.max_price && f.max_price < 150) params.set('max_price', String(f.max_price));
    if (f.anxiety_friendly) params.set('anxiety_friendly', 'true');
    if (f.international_conversion) params.set('international_conversion', 'true');
    if (f.test_centre) params.set('test_centre', f.test_centre);
    if (f.languages?.length) params.set('languages', f.languages.join(','));
    if (f.sort && f.sort !== 'relevance') params.set('sort', f.sort);
    params.set('page', String(page));

    try {
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      if (res.ok) {
        setResults(data.instructors || []);
        setTotal(data.total || 0);
      }
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(filters), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [filters, fetchResults]);

  return (
    <>
      <div className="md:hidden flex justify-between items-center mb-4 px-margin-mobile pt-4">
        <h1 className="font-headline-sm text-headline-sm">{loading ? 'Searching...' : `${total} Instructors found`}</h1>
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2 border border-outline-variant rounded-lg px-4 py-2 bg-surface-container-lowest font-label-md text-label-md"
        >
          <span className="material-symbols-outlined text-[20px]">tune</span> Filters
        </button>
      </div>

      <div className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-md flex flex-col md:flex-row gap-gutter relative">
        <aside className="hidden md:flex w-64 flex-shrink-0 flex-col gap-stack-md sticky top-[100px] h-[calc(100vh-120px)] overflow-y-auto sidebar-scroll pr-4">
          <FilterSidebar filters={filters} onFilterChange={setFilters} />
        </aside>

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

        <section className="flex-1 flex flex-col gap-stack-sm min-w-0">
          <div className="hidden md:flex justify-between items-center bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="font-label-md text-label-md text-on-surface">
                {loading ? 'Searching...' : `${total} Instructors available in your area`}
              </span>
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
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading && results.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-[48px] text-secondary animate-spin inline-block">refresh</span>
              <p className="text-outline text-lg font-body mt-4">Searching instructors...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center gap-stack-md">
              {/* Breadcrumbs / Search Controls */}
              <div className="w-full flex justify-between items-center">
                <div className="flex gap-2 items-center text-on-surface-variant font-label-sm text-label-sm">
                  <span>Search</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  <span>Instructors</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  <span className="text-primary font-bold">Results</span>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-on-surface-variant font-label-sm text-label-sm">Applied Filters: </span>
                  <div className="flex gap-2">
                    {filters.radius_km && (
                      <span className="bg-surface-container-high px-3 py-1 rounded-full text-label-sm font-label-sm flex items-center gap-1">
                        Radius: {filters.radius_km} miles <button onClick={() => setFilters((p) => ({ ...p, radius_km: undefined }))} className="hover:text-error transition-colors"><span className="material-symbols-outlined text-[14px]">close</span></button>
                      </span>
                    )}
                    {filters.transmission && (
                      <span className="bg-surface-container-high px-3 py-1 rounded-full text-label-sm font-label-sm flex items-center gap-1">
                        {filters.transmission === 'manual' ? 'Manual' : 'Auto'} Transmission <button onClick={() => setFilters((p) => ({ ...p, transmission: undefined }))} className="hover:text-error transition-colors"><span className="material-symbols-outlined text-[14px]">close</span></button>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Empty State Card */}
              <div className="bg-white w-full rounded-xl border border-outline-variant flex flex-col items-center p-stack-lg text-center shadow-[0_4px_20px_rgba(15,23,42,0.08)]">
                {/* Illustration */}
                <div className="relative mb-stack-md">
                  <div className="w-48 h-48 bg-surface-container rounded-full flex items-center justify-center overflow-hidden mb-6 mx-auto">
                    <img
                      className="w-full h-full object-cover opacity-80 mix-blend-multiply"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDf_EmcyXyIEjNeXa_3jlQev-fPpQkpvsvTE3yjSgyYLuAEz3gOoxoZ9tOYfxpcsioTQionQAu_w31O7sk6NCc_33La6aG8nihboT_MBo9qoXJANKEbtUdXXYTuvElCBKGXCc2sVxy7xnrWcAEpApfQ_M_-nmK6ooKfPo3cag3v6X5Y7rbsnjwCS8xX2JNNffueVaeK0Qlk3lm2DRjmZMEgXaU0cA4gmK5u1Xa0iExGAd-AF1wNyUkdfVoDyQcJUD1a0rKeFRPH"
                      alt="Car through magnifying glass illustration"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="material-symbols-outlined text-[80px] text-secondary/40 select-none" style={{ fontVariationSettings: "'wght' 200" }}>search_off</span>
                  </div>
                </div>

                {/* Content */}
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-stack-sm">No instructors found</h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-stack-md">
                  We couldn&apos;t find any professional instructors matching your current search criteria. Let&apos;s try adjusting your requirements to get you on the road.
                </p>

                {/* Suggestions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter w-full max-w-2xl mb-stack-lg text-left">
                  <div className="flex gap-4 p-4 rounded-lg bg-surface-bright border border-outline-variant/50">
                    <div className="bg-secondary-container p-2 rounded-lg h-fit text-on-secondary-container">
                      <span className="material-symbols-outlined">distance</span>
                    </div>
                    <div>
                      <h4 className="font-label-md text-label-md mb-1">Expand Search Radius</h4>
                      <p className="font-label-sm text-label-sm text-on-surface-variant leading-tight">Nearby instructors might be just outside your current {filters.radius_km || ''} limit.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-lg bg-surface-bright border border-outline-variant/50">
                    <div className="bg-on-primary-fixed p-2 rounded-lg h-fit text-primary-fixed">
                      <span className="material-symbols-outlined">filter_alt_off</span>
                    </div>
                    <div>
                      <h4 className="font-label-md text-label-md mb-1">Remove Specific Filters</h4>
                      <p className="font-label-sm text-label-sm text-on-surface-variant leading-tight">Try removing transmission or lesson length preferences to see more results.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-lg bg-surface-bright border border-outline-variant/50">
                    <div className="bg-surface-container-highest p-2 rounded-lg h-fit text-on-surface-variant">
                      <span className="material-symbols-outlined">calendar_today</span>
                    </div>
                    <div>
                      <h4 className="font-label-md text-label-md mb-1">Check Availability</h4>
                      <p className="font-label-sm text-label-sm text-on-surface-variant leading-tight">Switching to &apos;Flexible Dates&apos; can reveal instructors with upcoming openings.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-lg bg-surface-bright border border-outline-variant/50">
                    <div className="bg-tertiary-container p-2 rounded-lg h-fit text-tertiary-fixed">
                      <span className="material-symbols-outlined">auto_awesome</span>
                    </div>
                    <div>
                      <h4 className="font-label-md text-label-md mb-1">Try AI Match</h4>
                      <p className="font-label-sm text-label-sm text-on-surface-variant leading-tight">Our algorithm can find a custom instructor based on your personality profile.</p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col md:flex-row gap-4">
                  <button
                    onClick={() => setFilters({ sort: 'relevance', max_price: 150 })}
                    className="bg-secondary text-on-secondary px-8 py-3 rounded-xl font-label-md text-label-md font-bold hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                    Clear All Filters
                  </button>
                  <Link
                    href="/"
                    className="border border-outline-variant text-on-surface px-8 py-3 rounded-xl font-label-md text-label-md font-bold hover:bg-surface-container transition-all active:scale-95 inline-flex items-center justify-center"
                  >
                    Return to Map
                  </Link>
                </div>
              </div>

              {/* Support Teaser */}
              <div className="p-stack-md bg-secondary-container/20 rounded-xl border border-secondary/20 flex flex-col md:flex-row items-center gap-6 w-full">
                <span className="material-symbols-outlined text-[32px] text-secondary">support_agent</span>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-label-md text-label-md text-secondary">Need human help finding the right match?</h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Our road safety advisors are available to manually source instructors for your area.</p>
                </div>
                <a className="text-secondary font-bold font-label-md text-label-md hover:underline cursor-pointer" href="#">Chat with us</a>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mt-2">
                {results.slice(0, 4).map((instructor) => (
                  <InstructorCard key={instructor.id} instructor={instructor} variant="horizontal" />
                ))}

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

                {results.slice(4).map((instructor) => (
                  <InstructorCard key={instructor.id} instructor={instructor} variant="horizontal" />
                ))}
              </div>

              {total > results.length && (
                <div className="w-full flex justify-center mt-6">
                  <button
                    onClick={() => {
                      const nextPage = Math.floor(results.length / 20) + 2;
                      fetchResults(filters, nextPage);
                    }}
                    className="bg-surface border-2 border-outline-variant text-on-surface font-label-md text-label-md px-8 py-3 rounded-full hover:border-secondary hover:text-secondary transition-colors"
                  >
                    Load More Results ({total - results.length} remaining)
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
