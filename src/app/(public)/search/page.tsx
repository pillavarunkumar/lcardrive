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
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        {/* Search Bar */}
        <div className="mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex items-center gap-2 sticky top-20 z-30">
          <div className="flex-1 relative">
            <div className="flex items-center bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
              <span className="material-symbols-outlined text-gray-400 mr-2 text-lg">search</span>
              <input
                type="text"
                placeholder="Search by instructor, suburb or postcode"
                value={filters.suburb || ''}
                onChange={(e) => setFilters((p) => ({ ...p, suburb: e.target.value }))}
                onFocus={() => setShowSuggestions(true)}
                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none focus-visible:outline-none text-sm text-gray-900 placeholder:text-gray-400/60 p-0"
                autoComplete="chrome-off"
                data-1p-ignore
                data-lpignore="true"
              />
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg z-50 text-left mt-1 overflow-hidden">
                {suggestions.map((s) => (
                  <div
                    key={s.display}
                    onClick={() => { setFilters((p) => ({ ...p, suburb: s.suburb })); setShowSuggestions(false); setSuggestions([]); }}
                    className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-900 border-b border-gray-100 last:border-b-0"
                  >
                    {s.display}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative w-32 shrink-0">
            <select
              value={showCustomRadius ? 'custom' : String(filters.radius_km || 5)}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setShowCustomRadius(true);
                  setFilters((p) => ({ ...p, radius_km: undefined }));
                } else {
                  setShowCustomRadius(false);
                  setFilters((p) => ({ ...p, radius_km: parseInt(e.target.value) }));
                }
              }}
              className="appearance-none bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 pr-8 text-sm text-gray-900 focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] cursor-pointer w-full outline-none"
            >
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="20">20 km</option>
              <option value="30">30 km</option>
              <option value="50">50 km</option>
              <option value="custom">Custom...</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[18px]">expand_more</span>
          </div>

          {showCustomRadius && (
            <div className="w-20 shrink-0">
              <input
                type="number"
                min="1"
                max="200"
                placeholder="km"
                value={filters.radius_km || ''}
                onChange={(e) => setFilters((p) => ({ ...p, radius_km: parseInt(e.target.value) || undefined }))}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] outline-none placeholder:text-gray-400/60"
                autoFocus
              />
            </div>
          )}

          <div className="relative shrink-0" ref={sortMenuRef}>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900 hover:bg-gray-100 transition-all"
            >
              <span className="material-symbols-outlined text-gray-400 text-lg">swap_vert</span>
              <span className="hidden sm:inline text-xs font-medium">{currentSortLabel}</span>
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 min-w-[180px] py-1 overflow-hidden">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setFilters((p) => ({ ...p, sort: opt.value })); setShowSortMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      filters.sort === opt.value
                        ? 'text-[#064E3B] font-bold bg-[#064E3B]/5'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap shrink-0 px-1">
            <span className="material-symbols-outlined text-[16px] text-[#064E3B]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span>{loading ? '...' : total}</span>
          </div>

          <button
            onClick={applyFilters}
            disabled={loading}
            className="flex items-center gap-1.5 bg-[#064E3B] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-sm shrink-0"
          >
            <span className="material-symbols-outlined text-lg">search</span>
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
          <aside className="hidden md:flex w-64 flex-col bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-28">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Filters</h3>
              <button
                onClick={() => {
                  setFilters((p) => ({ ...p, max_price: 150, transmission: undefined, anxiety_friendly: undefined, international_conversion: undefined, test_centre_familiarity: undefined, languages: undefined, gender: undefined }));
                }}
                className="text-[11px] text-[#064E3B] hover:underline font-semibold"
              >
                Reset All
              </button>
            </div>
            <FilterSidebar filters={filters} onFilterChange={setFilters} />
            <button
              onClick={applyFilters}
              disabled={loading}
              className="mt-4 w-full bg-[#064E3B] text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">check</span>
              Apply Filters
            </button>
          </aside>

          <div className="flex flex-col gap-4 min-w-0">
            {/* Mobile filter trigger */}
            <div className="md:hidden flex justify-between items-center">
              <h1 className="text-lg font-bold text-gray-900">{loading ? 'Searching...' : `${total} Instructors found`}</h1>
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm"
              >
                <span className="material-symbols-outlined text-lg text-gray-400">tune</span> Filters
              </button>
            </div>

            {/* Mobile drawer */}
            {showMobileFilters && (
              <div className="fixed inset-0 z-50 bg-black/30 md:hidden" onClick={() => setShowMobileFilters(false)}>
                <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white p-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold text-gray-900">Filters</h3>
                    <button onClick={() => setShowMobileFilters(false)} className="text-gray-400 hover:text-gray-900">
                      <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                  </div>
                  <FilterSidebar filters={filters} onFilterChange={setFilters} />
                  <button
                    onClick={() => { applyFilters(); setShowMobileFilters(false); }}
                    disabled={loading}
                    className="mt-4 w-full bg-[#064E3B] text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-lg">check</span>
                    Apply Filters
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 flex items-center gap-3">
                <span className="material-symbols-outlined text-red-400">error</span>
                <span className="text-sm">{error}</span>
                <button onClick={() => setError(null)} className="ml-auto hover:opacity-70">
                  <span className="material-symbols-outlined text-red-400">close</span>
                </button>
              </div>
            )}

            <section className="flex flex-col gap-4">
            {loading && results.length === 0 ? (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-[48px] text-[#064E3B] animate-spin inline-block">refresh</span>
                <p className="text-gray-400 text-sm mt-4">Searching instructors...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[40px] text-gray-300">search_off</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">No instructors found</h2>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                  We couldn&apos;t find any instructors matching your criteria. Try adjusting your filters.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto mb-6 text-left">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="material-symbols-outlined text-[#064E3B] text-lg mt-0.5">distance</span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Expand radius</p>
                      <p className="text-xs text-gray-500">Try increasing your search radius.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="material-symbols-outlined text-[#064E3B] text-lg mt-0.5">filter_alt_off</span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Remove filters</p>
                      <p className="text-xs text-gray-500">Fewer filters means more results.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="material-symbols-outlined text-[#064E3B] text-lg mt-0.5">auto_awesome</span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Try AI Match</p>
                      <p className="text-xs text-gray-500">Let our AI find you the perfect instructor.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="material-symbols-outlined text-[#064E3B] text-lg mt-0.5">support_agent</span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Need help?</p>
                      <p className="text-xs text-gray-500">Our team can help find the right match.</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFilters({ suburb: '', radius_km: 5, sort: 'rating', max_price: 150 });
                    setPage(1);
                    fetchResults({ suburb: '', radius_km: 5, sort: 'rating', max_price: 150 }, 1);
                  }}
                  className="bg-[#064E3B] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2 mx-auto shadow-sm"
                >
                  <span className="material-symbols-outlined text-lg">refresh</span>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                {/* AI Match Banner */}
                <div className="bg-gradient-to-br from-[#064E3B] to-[#047857] rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white/80 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    <div>
                      <span className="text-xs font-bold text-white/80 uppercase tracking-widest">AI Matchmaker</span>
                      <h3 className="text-base font-bold text-white mt-0.5">Not sure who to choose?</h3>
                      <p className="text-sm text-white/70">Let our AI find the perfect instructor for you.</p>
                    </div>
                  </div>
                  <a
                    href="/find-my-instructor"
                    className="shrink-0 bg-white text-[#064E3B] px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm flex items-center gap-2"
                  >
                    Start AI Match
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.slice(0, 6).map((instructor) => (
                    <InstructorCard key={instructor.id} instructor={instructor} variant="horizontal" />
                  ))}

                  {results.slice(6).map((instructor) => (
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
    <Suspense fallback={<div className="pt-24 pb-16 px-4 text-center text-gray-400">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
