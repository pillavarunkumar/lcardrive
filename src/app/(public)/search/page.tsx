'use client';

import { Suspense, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import FilterSidebar from '@/components/FilterSidebar';
import InstructorCard from '@/components/InstructorCard';
import Pagination from '@/components/Pagination';
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
    sort: 'rating',
    max_price: 150,
    transmission: initialTransmission,
    anxiety_friendly: initialAnxiety,
    international_conversion: initialInternational,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<{ display: string; suburb: string; state: string }[]>([]);
  const [showCustomRadius, setShowCustomRadius] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const debounceSearchRef = useRef<ReturnType<typeof setTimeout>>();
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<Instructor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const limit = 12;
  const totalPages = Math.ceil(total / limit);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/location/autocomplete?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const sortOptions = useMemo(() => [
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'name_asc', label: 'Name: A to Z' },
    { value: 'name_desc', label: 'Name: Z to A' },
  ] as const, []);

  useEffect(() => {
    if (debounceSearchRef.current) clearTimeout(debounceSearchRef.current);
    debounceSearchRef.current = setTimeout(() => fetchSuggestions(filters.suburb || ''), 250);
    return () => { if (debounceSearchRef.current) clearTimeout(debounceSearchRef.current); };
  }, [filters.suburb, fetchSuggestions]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchResults = useCallback(async (f: SearchFilters, page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (f.suburb) params.set('suburb', f.suburb);
    if (f.radius_km) params.set('radius_km', String(f.radius_km));

    if (f.transmission) params.set('transmission', f.transmission);
    if (f.max_price && f.max_price < 150) params.set('max_price', String(f.max_price));
    if (f.anxiety_friendly) params.set('anxiety_friendly', 'true');
    if (f.international_conversion) params.set('international_conversion', 'true');
    if (f.test_centre_familiarity) params.set('test_centre_familiarity', 'true');
    if (f.languages?.length) params.set('languages', f.languages.join(','));
    if (f.sort) params.set('sort', f.sort);
    params.set('page', String(page));
    params.set('limit', String(limit));

    try {
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      if (res.ok) {
        setResults(data.instructors || []);
        setTotal(data.total || 0);
        setError(null);
      } else {
        setError(data.error || 'Search failed');
        setResults([]);
        setTotal(0);
      }
    } catch {
      setError('Network error. Please try again.');
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const currentSortLabel = sortOptions.find(o => o.value === filters.sort)?.label || 'Sort';

  const applyFilters = useCallback(() => {
    setPage(1);
    fetchResults(filters, 1);
  }, [filters, fetchResults]);

  useEffect(() => {
    fetchResults(filters, 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-md relative">
        {/* Search Bar at Top - always visible */}
        <div className="sticky top-20 z-30 mb-4 bg-surface pt-2 pb-3 border-b border-outline-variant/50">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="flex-1 flex items-center bg-surface-container-low rounded-xl px-4 py-2.5 search-container-shadow relative">
              <span className="material-symbols-outlined text-primary mr-2 text-xl">search</span>
              <input
                type="text"
                placeholder="Suburb or Postcode"
                value={filters.suburb || ''}
                onChange={(e) => setFilters((p) => ({ ...p, suburb: e.target.value }))}
                onFocus={() => setShowSuggestions(true)}
                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none focus-visible:outline-none text-on-surface placeholder:text-outline p-0 text-body-md"
                autoComplete="chrome-off"
                data-1p-ignore
                data-lpignore="true"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-outline-variant rounded-b-xl shadow-lg z-50 text-left mt-1">
                  {suggestions.map((s) => (
                    <div
                      key={s.display}
                      onClick={() => { setFilters((p) => ({ ...p, suburb: s.suburb })); setShowSuggestions(false); setSuggestions([]); }}
                      className="p-3 hover:bg-surface-container cursor-pointer font-body text-sm border-b border-outline-variant last:border-b-0"
                    >
                      {s.display}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="w-full md:w-44 flex items-center bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 search-container-shadow">
              <span className="material-symbols-outlined text-primary mr-2 text-xl">distance</span>
              {showCustomRadius ? (
                <input
                  type="number"
                  min="1"
                  max="200"
                  placeholder="Custom km"
                  value={filters.radius_km || ''}
                  onChange={(e) => setFilters((p) => ({ ...p, radius_km: parseInt(e.target.value) || undefined }))}
                  className="w-full bg-transparent border-none focus:ring-0 text-on-surface p-0 outline-none text-body-md"
                  autoFocus
                />
              ) : (
                <select
                  value={filters.radius_km || 5}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setShowCustomRadius(true);
                    } else {
                      setFilters((p) => ({ ...p, radius_km: parseInt(e.target.value) }));
                    }
                  }}
                  className="w-full bg-transparent border-none focus:ring-0 text-on-surface p-0 outline-none text-body-md appearance-none cursor-pointer"
                >
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="20">20 km</option>
                  <option value="30">30 km</option>
                  <option value="50">50 km</option>
                  <option value="custom">Custom...</option>
                </select>
              )}
            </div>
            <div className="relative shrink-0" ref={sortMenuRef}>
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2.5 text-label-md text-on-surface hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined text-primary">swap_vert</span>
                <span className="hidden sm:inline">{currentSortLabel}</span>
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-outline-variant rounded-xl shadow-lg z-50 min-w-[200px] py-1 overflow-hidden">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setFilters((p) => ({ ...p, sort: opt.value })); setShowSortMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        filters.sort === opt.value
                          ? 'text-primary font-bold bg-primary/5'
                          : 'text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-label-sm text-on-surface-variant whitespace-nowrap shrink-0">
              <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span>{loading ? 'Searching...' : `${total} results`}</span>
            </div>
          </div>
        </div>

        {/* Main layout: filters sidebar always visible on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-gutter items-start">
          <aside className="hidden md:flex w-72 flex-col bg-surface-container-lowest border border-outline-variant rounded-xl px-6 py-6 search-container-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Filters</h3>
              <button
                onClick={() => {
                  setFilters((p) => ({ ...p, max_price: 150, transmission: undefined, anxiety_friendly: undefined, international_conversion: undefined, test_centre_familiarity: undefined, languages: undefined, gender: undefined }));
                }}
                className="text-label-sm text-primary hover:underline"
              >
                Reset
              </button>
            </div>
            <FilterSidebar filters={filters} onFilterChange={setFilters} />
            <button
              onClick={applyFilters}
              disabled={loading}
              className="mt-5 w-full bg-primary text-white py-2.5 rounded-xl font-label-md text-label-md font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              Save Changes
            </button>
          </aside>

          <div className="flex flex-col gap-4 min-w-0">
            {/* Mobile filter trigger */}
            <div className="md:hidden flex justify-between items-center">
              <h1 className="font-headline-sm text-headline-sm">{loading ? 'Searching...' : `${total} Instructors found`}</h1>
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 border border-outline-variant rounded-full px-4 py-2 bg-surface-container-lowest font-label-md text-label-md"
              >
                <span className="material-symbols-outlined text-[20px]">tune</span> Filters
              </button>
            </div>

            {/* Mobile drawer */}
            {showMobileFilters && (
              <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setShowMobileFilters(false)}>
                <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-on-surface">Filters</h3>
                    <button onClick={() => setShowMobileFilters(false)}><span className="material-symbols-outlined">close</span></button>
                  </div>
                  <FilterSidebar filters={filters} onFilterChange={setFilters} />
                  <button
                    onClick={() => { applyFilters(); setShowMobileFilters(false); }}
                    disabled={loading}
                    className="mt-5 w-full bg-primary text-white py-2.5 rounded-xl font-label-md text-label-md font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">check</span>
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-error-container text-error p-4 rounded-xl border border-error/30 flex items-center gap-3">
                <span className="material-symbols-outlined">error</span>
                <span className="font-body-md text-body-md">{error}</span>
                <button onClick={() => setError(null)} className="ml-auto hover:opacity-70">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            )}

            <section className="flex flex-col gap-stack-sm">
            {loading && results.length === 0 ? (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-[48px] text-primary animate-spin inline-block">refresh</span>
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
                </div>

                {/* Empty State Card */}
                <div className="bg-surface-container-lowest w-full rounded-xl border border-outline-variant flex flex-col items-center p-stack-lg text-center shadow-[0_4px_20px_rgba(15,23,42,0.08)]">
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
                      <span className="material-symbols-outlined text-[80px] text-primary/20 select-none" style={{ fontVariationSettings: "'wght' 200" }}>search_off</span>
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
                      <div className="bg-primary/10 p-2 rounded-lg h-fit text-primary">
                        <span className="material-symbols-outlined">distance</span>
                      </div>
                      <div>
                        <h4 className="font-label-md text-label-md mb-1">Expand Search Radius</h4>
                        <p className="font-label-sm text-label-sm text-on-surface-variant leading-tight">Nearby instructors might be just outside your current {filters.radius_km || ''} limit.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-4 rounded-lg bg-surface-bright border border-outline-variant/50">
                      <div className="bg-primary/10 p-2 rounded-lg h-fit text-primary">
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
                      <div className="bg-primary/10 p-2 rounded-lg h-fit text-primary">
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
                      onClick={() => setFilters((p) => ({ suburb: p.suburb, radius_km: p.radius_km, sort: 'rating', max_price: 150 }))}
                      className="bg-primary text-white px-8 py-3 rounded-xl font-label-md text-label-md font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                      <span className="material-symbols-outlined text-[20px]">refresh</span>
                      Clear All Filters
                    </button>
                    <Link
                      href="/"
                      className="border border-outline-variant text-on-surface px-8 py-3 rounded-xl font-label-md text-label-md font-bold hover:bg-surface-container transition-all active:scale-95 inline-flex items-center justify-center"
                    >
                      Return to Home
                    </Link>
                  </div>
                </div>

                {/* Support Teaser */}
                <div className="p-stack-md bg-primary/5 rounded-xl border border-primary/10 flex flex-col md:flex-row items-center gap-6 w-full">
                  <span className="material-symbols-outlined text-[32px] text-primary">support_agent</span>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-label-md text-label-md text-primary">Need human help finding the right match?</h3>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Our road safety advisors are available to manually source instructors for your area.</p>
                  </div>
                  <a className="text-primary font-bold font-label-md text-label-md hover:underline cursor-pointer" href="#">Chat with us</a>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter mt-2">
                  {results.slice(0, 2).map((instructor) => (
                    <InstructorCard key={instructor.id} instructor={instructor} variant="horizontal" />
                  ))}

                  <div className="sm:col-span-2 bg-primary/5 rounded-xl p-6 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl"></div>
                    <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-primary/5 rounded-full blur-xl"></div>
                    <div className="relative z-10 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        <span className="font-label-md text-label-md text-primary font-bold tracking-wide">AI MATCHMAKER</span>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Not sure who to choose?</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant max-w-md">Let our AI analyze your learning style, anxiety levels, and schedule to find the perfect instructor for you in under 60 seconds.</p>
                    </div>
                    <div className="relative z-10 flex-shrink-0 w-full md:w-auto">
                      <a
                        href="/find-my-instructor"
                        className="w-full md:w-auto bg-primary text-white px-6 py-3 rounded-xl font-label-md text-label-md hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                      >
                        Start AI Match
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </a>
                    </div>
                  </div>

                  {results.slice(2).map((instructor) => (
                    <InstructorCard key={instructor.id} instructor={instructor} variant="horizontal" />
                  ))}
                </div>

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    setPage(p);
                    fetchResults(filters, p);
                  }}
                />
              </>
            )}
          </section>
        </div>
      </div>
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
