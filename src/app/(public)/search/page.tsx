'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import FilterSidebar from '@/components/FilterSidebar';
import InstructorCard from '@/components/InstructorCard';
import Pagination from '@/components/Pagination';
import type { Instructor, SearchFilters } from '@/types';

const InstructorMap = dynamic(() => import('@/components/InstructorMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-50 text-sm text-gray-400">
      Loading map...
    </div>
  ),
});

interface Origin {
  lat: number;
  lng: number;
}

interface PlaceSuggestion {
  display: string;
  suburb: string;
  state: string;
  postcode?: string;
  lat?: number;
  lng?: number;
}

const RESULTS_PER_PAGE = 12;
const MAP_RESULT_LIMIT = 100;
const SORT_VALUES = ['price_asc', 'price_desc', 'rating', 'distance', 'name_asc', 'name_desc'] as const;
type SortValue = (typeof SORT_VALUES)[number];

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: 'distance', label: 'Distance: Nearest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
];

function toOrigin(lat: number | undefined, lng: number | undefined): Origin | null {
  if (
    typeof lat !== 'number' ||
    typeof lng !== 'number' ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    (lat === 0 && lng === 0)
  ) {
    return null;
  }
  return { lat, lng };
}

function buildSearchParams(
  filters: SearchFilters,
  pageNumber: number,
  origin: Origin | null,
  pageLimit: number,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.suburb) params.set('q', filters.suburb);
  if (filters.postcode) params.set('postcode', filters.postcode);
  if (filters.radius_km && filters.radius_km > 0) params.set('radius_km', String(filters.radius_km));
  if (origin) {
    params.set('lat', origin.lat.toFixed(6));
    params.set('lng', origin.lng.toFixed(6));
  }
  if (filters.transmission) params.set('transmission', filters.transmission);
  if (filters.max_price && filters.max_price < 150) params.set('max_price', String(filters.max_price));
  if (filters.anxiety_friendly) params.set('anxiety_friendly', 'true');
  if (filters.international_conversion) params.set('international_conversion', 'true');
  if (filters.test_centre_familiarity) params.set('test_centre_familiarity', 'true');
  if (filters.languages?.length) params.set('languages', filters.languages.join(','));
  if (filters.sort) params.set('sort', filters.sort);
  params.set('page', String(pageNumber));
  params.set('limit', String(pageLimit));
  return params;
}

function syncUrl(filters: SearchFilters, origin: Origin | null) {
  if (typeof window === 'undefined') return;
  const params = buildSearchParams(filters, 1, origin, RESULTS_PER_PAGE);
  params.delete('page');
  params.delete('limit');
  const query = params.toString();
  window.history.replaceState(null, '', query ? `/search?${query}` : '/search');
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialSuburb = searchParams.get('q') || searchParams.get('suburb') || '';
  const initialPostcode = searchParams.get('postcode') || '';
  const initialRadiusRaw = Number.parseInt(searchParams.get('radius_km') || '', 10);
  const initialRadius = Number.isFinite(initialRadiusRaw) && initialRadiusRaw > 0 ? initialRadiusRaw : undefined;
  const initialTransmission =
    (searchParams.get('transmission') as 'auto' | 'manual' | undefined) || undefined;
  const initialAnxiety = searchParams.get('anxiety_friendly') === 'true' || undefined;
  const initialInternational = searchParams.get('international_conversion') === 'true' || undefined;
  const initialTestCentre = searchParams.get('test_centre_familiarity') === 'true' || undefined;
  const initialLanguages = searchParams.get('languages')?.split(',').filter(Boolean) || undefined;
  const initialMaxPriceRaw = Number.parseFloat(searchParams.get('max_price') || '');
  const initialMaxPrice = Number.isFinite(initialMaxPriceRaw) && initialMaxPriceRaw > 0 ? initialMaxPriceRaw : 150;
  const initialSortRaw = searchParams.get('sort') as SortValue | null;
  const initialSort: SortValue =
    initialSortRaw && SORT_VALUES.includes(initialSortRaw) ? initialSortRaw : 'rating';
  const initialLat = Number.parseFloat(searchParams.get('lat') || '');
  const initialLng = Number.parseFloat(searchParams.get('lng') || '');
  const initialOrigin = toOrigin(initialLat, initialLng);

  const [filters, setFilters] = useState<SearchFilters>({
    suburb: initialSuburb,
    postcode: initialPostcode || undefined,
    radius_km: initialRadius,
    sort: initialSort,
    max_price: initialMaxPrice,
    transmission: initialTransmission,
    anxiety_friendly: initialAnxiety,
    international_conversion: initialInternational,
    test_centre_familiarity: initialTestCentre,
    languages: initialLanguages,
  });
  const [origin, setOrigin] = useState<Origin | null>(initialOrigin);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showCustomRadius, setShowCustomRadius] = useState(
    initialRadius !== undefined && ![5, 10, 20, 30, 50].includes(initialRadius),
  );
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const debounceSearchRef = useRef<ReturnType<typeof setTimeout>>();
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<Instructor[]>([]);
  const [mapResults, setMapResults] = useState<Instructor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const totalPages = Math.ceil(total / RESULTS_PER_PAGE);

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

  useEffect(() => {
    if (debounceSearchRef.current) clearTimeout(debounceSearchRef.current);
    debounceSearchRef.current = setTimeout(() => fetchSuggestions(filters.suburb || ''), 250);
    return () => {
      if (debounceSearchRef.current) clearTimeout(debounceSearchRef.current);
    };
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

  const fetchSearch = useCallback(
    async (
      f: SearchFilters,
      pageNumber: number,
      searchOrigin: Origin | null,
      target: 'list' | 'map',
    ) => {
      const setBusy = target === 'map' ? setMapLoading : setLoading;
      setBusy(true);
      const params = buildSearchParams(
        f,
        pageNumber,
        searchOrigin,
        target === 'map' ? MAP_RESULT_LIMIT : RESULTS_PER_PAGE,
      );

      try {
        const res = await fetch(`/api/search?${params}`);
        const data = await res.json();
        if (res.ok) {
          if (target === 'map') {
            setMapResults(data.instructors || []);
          } else {
            setResults(data.instructors || []);
            setTotal(data.total || 0);
          }
          setError(null);
        } else {
          setError(data.error || 'Search failed');
          if (target === 'map') setMapResults([]);
          else {
            setResults([]);
            setTotal(0);
          }
        }
      } catch {
        setError('Network error. Please try again.');
        if (target === 'map') setMapResults([]);
        else {
          setResults([]);
          setTotal(0);
        }
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const runSearch = useCallback(
    (f: SearchFilters, searchOrigin: Origin | null) => {
      setPage(1);
      syncUrl(f, searchOrigin);
      void fetchSearch(f, 1, searchOrigin, 'list');
      if (viewMode === 'map') {
        void fetchSearch(f, 1, searchOrigin, 'map');
      }
    },
    [fetchSearch, viewMode],
  );

  const applyFilters = useCallback(() => {
    runSearch(filters, origin);
  }, [filters, origin, runSearch]);

  const resetAll = useCallback(() => {
    const cleared: SearchFilters = { sort: 'rating', max_price: 150 };
    setFilters(cleared);
    setOrigin(null);
    setShowCustomRadius(false);
    setLocationError(null);
    setPage(1);
    syncUrl(cleared, null);
    void fetchSearch(cleared, 1, null, 'list');
    if (viewMode === 'map') {
      void fetchSearch(cleared, 1, null, 'map');
    }
  }, [fetchSearch, viewMode]);

  const openMap = useCallback(() => {
    setViewMode('map');
    void fetchSearch(filters, 1, origin, 'map');
  }, [filters, origin, fetchSearch]);

  const chooseSuggestion = useCallback(
    (suggestion: PlaceSuggestion) => {
      const nextOrigin = toOrigin(suggestion.lat, suggestion.lng) ?? origin;
      const next: SearchFilters = {
        ...filters,
        suburb: suggestion.suburb || suggestion.display.split(',')[0]?.trim() || '',
        postcode: suggestion.postcode,
      };
      setFilters(next);
      setOrigin(nextOrigin);
      setShowSuggestions(false);
      setSuggestions([]);
      runSearch(next, nextOrigin);
    },
    [filters, origin, runSearch],
  );

  const locateMe = useCallback(
    (options?: { sort?: SortValue; addRadius?: boolean }) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        setLocationError('Location is not available in this browser.');
        return;
      }

      setLocating(true);
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextOrigin = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          const next: SearchFilters = {
            ...filters,
            radius_km:
              options?.addRadius === false
                ? filters.radius_km
                : filters.radius_km || 20,
            sort:
              options?.sort ??
              (filters.sort === 'rating' || !filters.sort ? 'distance' : filters.sort),
          };
          setOrigin(nextOrigin);
          setFilters(next);
          setLocating(false);
          runSearch(next, nextOrigin);
        },
        (geoError) => {
          const fallbackSort = options?.sort;
          if (fallbackSort) {
            const next = { ...filters, sort: fallbackSort };
            setFilters(next);
            runSearch(next, origin);
          }
          setLocating(false);
          setLocationError(
            geoError.code === geoError.PERMISSION_DENIED
              ? 'Location permission was denied. Enter a suburb to sort by distance.'
              : 'Could not get your location. Enter a suburb instead.',
          );
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
      );
    },
    [filters, origin, runSearch],
  );

  const changeSort = useCallback(
    (nextSort: SortValue) => {
      setShowSortMenu(false);
      if (nextSort === 'distance' && !origin) {
        const next = { ...filters, sort: nextSort };
        setFilters(next);
        locateMe({ sort: nextSort, addRadius: false });
        return;
      }
      const next = { ...filters, sort: nextSort };
      setFilters(next);
      runSearch(next, origin);
    },
    [filters, origin, locateMe, runSearch],
  );

  useEffect(() => {
    void fetchSearch(filters, 1, origin, 'list');
    // Only run once on mount; later searches are triggered by explicit actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentSortLabel =
    SORT_OPTIONS.find((option) => option.value === filters.sort)?.label || 'Sort';

  const activeFilterCount = [
    filters.transmission,
    filters.anxiety_friendly,
    filters.international_conversion,
    filters.test_centre_familiarity,
    filters.languages?.length,
    filters.max_price && filters.max_price < 150,
  ].filter(Boolean).length;

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        {/* Search Bar */}
        <div className="mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex flex-wrap md:flex-nowrap items-center gap-2 sticky top-20 z-30">
          <div className="flex-1 min-w-[220px] relative">
            <div className="flex items-center bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
              <span className="material-symbols-outlined text-gray-400 mr-2 text-lg">search</span>
              <input
                type="text"
                placeholder="Instructor name, suburb or postcode"
                value={filters.suburb || ''}
                onChange={(e) => setFilters((previous) => ({ ...previous, suburb: e.target.value }))}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setShowSuggestions(false);
                    applyFilters();
                  }
                }}
                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none focus-visible:outline-none text-sm text-gray-900 placeholder:text-gray-400/60 p-0"
                autoComplete="chrome-off"
                data-1p-ignore
                data-lpignore="true"
              />
              {filters.suburb && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    const next = { ...filters, suburb: '' };
                    setFilters(next);
                    runSearch(next, origin);
                  }}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              )}
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg z-50 text-left mt-1 overflow-hidden">
                {suggestions.map((suggestion) => (
                  <button
                    key={`${suggestion.display}-${suggestion.lat}-${suggestion.lng}`}
                    type="button"
                    onClick={() => chooseSuggestion(suggestion)}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-900 border-b border-gray-100 last:border-b-0"
                  >
                    {suggestion.display}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative w-32 shrink-0">
            <select
              value={showCustomRadius ? 'custom' : filters.radius_km ? String(filters.radius_km) : ''}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setShowCustomRadius(true);
                  setFilters((previous) => ({ ...previous, radius_km: undefined }));
                } else {
                  setShowCustomRadius(false);
                  setFilters((previous) => ({
                    ...previous,
                    radius_km: e.target.value ? Number.parseInt(e.target.value, 10) : undefined,
                  }));
                }
              }}
              aria-label="Search radius"
              className="appearance-none bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 pr-8 text-sm text-gray-900 focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] cursor-pointer w-full outline-none"
            >
              <option value="">Any distance</option>
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="20">20 km</option>
              <option value="30">30 km</option>
              <option value="50">50 km</option>
              <option value="custom">Custom...</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[18px]">
              expand_more
            </span>
          </div>

          {showCustomRadius && (
            <div className="w-20 shrink-0">
              <input
                type="number"
                min="1"
                max="200"
                placeholder="km"
                value={filters.radius_km || ''}
                onChange={(e) =>
                  setFilters((previous) => ({
                    ...previous,
                    radius_km: Number.parseInt(e.target.value, 10) || undefined,
                  }))
                }
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] outline-none placeholder:text-gray-400/60"
                autoFocus
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => locateMe()}
            disabled={locating}
            title="Use my current location"
            className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900 hover:bg-gray-100 transition-all disabled:opacity-50 shrink-0"
          >
            <span className={`material-symbols-outlined text-lg ${locating ? 'animate-pulse text-[#064E3B]' : 'text-gray-500'}`}>
              my_location
            </span>
            <span className="hidden lg:inline text-xs font-medium">Near me</span>
          </button>

          <div className="relative shrink-0" ref={sortMenuRef}>
            <button
              type="button"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-900 hover:bg-gray-100 transition-all"
            >
              <span className="material-symbols-outlined text-gray-400 text-lg">swap_vert</span>
              <span className="hidden sm:inline text-xs font-medium">{currentSortLabel}</span>
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 min-w-[190px] py-1 overflow-hidden">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => changeSort(option.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      filters.sort === option.value
                        ? 'text-[#064E3B] font-bold bg-[#064E3B]/5'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap shrink-0 px-1">
            <span
              className="material-symbols-outlined text-[16px] text-[#064E3B]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <span>{loading ? '...' : total}</span>
          </div>

          <button
            type="button"
            onClick={applyFilters}
            disabled={loading}
            className="flex items-center gap-1.5 bg-[#064E3B] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-sm shrink-0"
          >
            <span className="material-symbols-outlined text-lg">search</span>
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>

        {locationError && (
          <div className="mb-4 bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-100 flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-amber-500 text-lg">warning</span>
            <span>{locationError}</span>
            <button
              type="button"
              onClick={() => setLocationError(null)}
              className="ml-auto text-amber-500 hover:text-amber-800"
              aria-label="Dismiss"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        )}

        {/* Main layout */}
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
          <aside className="hidden md:flex w-64 flex-col bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-28">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </h3>
              <button
                type="button"
                onClick={resetAll}
                className="text-[11px] text-[#064E3B] hover:underline font-semibold"
              >
                Reset All
              </button>
            </div>
            <FilterSidebar filters={filters} onFilterChange={setFilters} />
            <button
              type="button"
              onClick={applyFilters}
              disabled={loading}
              className="mt-4 w-full bg-[#064E3B] text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">check</span>
              Apply Filters
            </button>
          </aside>

          <div className="flex flex-col gap-4 min-w-0">
            {/* Mobile header + view toggle */}
            <div className="flex justify-between items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900">
                {loading ? 'Searching...' : `${total} Instructor${total === 1 ? '' : 's'} found`}
              </h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      viewMode === 'list' ? 'bg-[#064E3B] text-white' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    List
                  </button>
                  <button
                    type="button"
                    onClick={openMap}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      viewMode === 'map' ? 'bg-[#064E3B] text-white' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Map
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(true)}
                  className="md:hidden flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 shadow-sm"
                >
                  <span className="material-symbols-outlined text-lg text-gray-400">tune</span> Filters
                </button>
              </div>
            </div>

            {/* Mobile drawer */}
            {showMobileFilters && (
              <div className="fixed inset-0 z-50 bg-black/30 md:hidden" onClick={() => setShowMobileFilters(false)}>
                <div
                  className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white p-5 overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold text-gray-900">Filters</h3>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          resetAll();
                          setShowMobileFilters(false);
                        }}
                        className="text-xs text-[#064E3B] font-semibold hover:underline"
                      >
                        Reset All
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMobileFilters(false)}
                        className="text-gray-400 hover:text-gray-900"
                        aria-label="Close filters"
                      >
                        <span className="material-symbols-outlined text-xl">close</span>
                      </button>
                    </div>
                  </div>
                  <FilterSidebar filters={filters} onFilterChange={setFilters} />
                  <button
                    type="button"
                    onClick={() => {
                      applyFilters();
                      setShowMobileFilters(false);
                    }}
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
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="ml-auto hover:opacity-70"
                  aria-label="Dismiss error"
                >
                  <span className="material-symbols-outlined text-red-400">close</span>
                </button>
              </div>
            )}

            <section className="flex flex-col gap-4">
              {viewMode === 'map' ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">
                        {mapLoading ? 'Loading instructors on the map...' : `${mapResults.length} instructor${mapResults.length === 1 ? '' : 's'} shown`}
                      </h2>
                      <p className="text-xs text-gray-500">
                        Select a pin to see the instructor and open their profile.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className="text-xs font-semibold text-[#064E3B] hover:underline shrink-0"
                    >
                      Back to list
                    </button>
                  </div>
                  <div className="h-[420px] md:h-[600px] relative isolate">
                    {mapLoading && mapResults.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-[500]">
                        <span className="material-symbols-outlined text-[40px] text-[#064E3B] animate-spin">refresh</span>
                      </div>
                    )}
                    {!mapLoading && mapResults.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center px-6">
                        <span className="material-symbols-outlined text-[40px] text-gray-300 mb-2">map</span>
                        <h3 className="text-sm font-bold text-gray-900">No instructors to map</h3>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm">
                          Try widening your search radius or removing a filter.
                        </p>
                        <button
                          type="button"
                          onClick={resetAll}
                          className="mt-4 bg-[#064E3B] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90"
                        >
                          Clear all filters
                        </button>
                      </div>
                    ) : (
                      <InstructorMap
                        instructors={mapResults}
                        origin={origin}
                        radiusKm={filters.radius_km ?? null}
                      />
                    )}
                  </div>
                </div>
              ) : loading && results.length === 0 ? (
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
                        <p className="text-xs text-gray-500">Try increasing your search radius or choosing &quot;Any distance&quot;.</p>
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
                      <span className="material-symbols-outlined text-[#064E3B] text-lg mt-0.5">person_search</span>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Check the spelling</p>
                        <p className="text-xs text-gray-500">Search by full name, suburb or four-digit postcode.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="material-symbols-outlined text-[#064E3B] text-lg mt-0.5">auto_awesome</span>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Try AI Match</p>
                        <p className="text-xs text-gray-500">Let our AI find you the perfect instructor.</p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={resetAll}
                    className="bg-[#064E3B] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2 mx-auto shadow-sm"
                  >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  {/* AI Match Banner */}
                  <div className="bg-gradient-to-br from-[#064E3B] to-[#047857] rounded-xl px-4 py-2.5 flex flex-col md:flex-row items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="material-symbols-outlined text-white/80 text-xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        auto_awesome
                      </span>
                      <div>
                        <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">AI Matchmaker</span>
                        <h3 className="text-sm font-bold text-white mt-0">Not sure who to choose?</h3>
                        <p className="text-xs text-white/70 leading-tight">Let our AI find the perfect instructor for you.</p>
                      </div>
                    </div>
                    <a
                      href="/find-my-instructor"
                      className="shrink-0 bg-white text-[#064E3B] px-4 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-all shadow-sm flex items-center gap-1"
                    >
                      Start AI Match
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </a>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {results.map((instructor) => (
                      <InstructorCard key={instructor.id} instructor={instructor} variant="horizontal" />
                    ))}
                  </div>

                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(nextPage) => {
                      setPage(nextPage);
                      void fetchSearch(filters, nextPage, origin, 'list');
                      if (typeof window !== 'undefined') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
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
