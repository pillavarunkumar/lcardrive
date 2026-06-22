'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import InstructorCard from '@/components/InstructorCard';
import type { Instructor } from '@/types';

export default function HomePage() {
  const [suburb, setSuburb] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<{ display: string; suburb: string; state: string }[]>([]);
  const [radius, setRadius] = useState('5');
  const [customRadius, setCustomRadius] = useState('');
  const [showCustomRadius, setShowCustomRadius] = useState(false);
  const [quickFilters, setQuickFilters] = useState<Record<string, string>>({});
  const [featured, setFeatured] = useState<Instructor[]>([]);
  const [instructorCount, setInstructorCount] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    fetch('/api/search?limit=3&sort=rating')
      .then((r) => r.json())
      .then((data) => {
        setFeatured(data.instructors || []);
        if (data.total) setInstructorCount(data.total);
      })
      .catch(() => {});
  }, []);

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
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(suburb), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [suburb, fetchSuggestions]);

  const toggleFilter = (key: string, value: string) => {
    setQuickFilters((prev) => {
      if (prev[key] === value) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  };

  return (
    <>
      <section className="relative">
        <div
          className="flex min-h-[520px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center p-6 text-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%), url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&q=80')`,
          }}
        >
          <div className="flex flex-col gap-4 max-w-[800px]">
            <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] md:text-6xl font-display">
              Find your perfect driving instructor.
            </h1>
            <p className="text-white text-lg font-body opacity-90">
              {instructorCount !== null
                ? `Book from ${instructorCount}+ verified instructors and pass your test with confidence.`
                : 'Book professional lessons and pass your test with confidence.'}
            </p>
          </div>

          <div className="w-full max-w-[720px] bg-white p-2 rounded-xl shadow-2xl mt-4">
            <div className="flex flex-col md:flex-row items-stretch gap-2">
              <div className="flex flex-1 items-center px-4 border border-outline-variant rounded-lg bg-white relative h-10">
                <span className="material-symbols-outlined text-outline text-base">search</span>
                <input
                  type="text"
                  placeholder="Enter suburb or postcode (e.g. Footscray)"
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="flex-1 border-none focus:ring-0 text-on-surface font-body text-sm bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!navigator.geolocation) return;
                    navigator.geolocation.getCurrentPosition(async (pos) => {
                      const res = await fetch(`/api/location/reverse-geocode?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
                      const data = await res.json();
                      if (data.suburb) {
                        setSuburb(data.display);
                        setShowSuggestions(false);
                      }
                    }, () => {});
                  }}
                  className="text-outline hover:text-secondary p-1"
                  title="Use my location"
                >
                  <span className="material-symbols-outlined text-base">my_location</span>
                </button>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-outline-variant rounded-b-lg shadow-lg z-50 text-left" id="autocomplete">
                    {suggestions.map((s) => (
                      <div
                        key={s.display}
                        onClick={() => { setSuburb(s.suburb); setShowSuggestions(false); setSuggestions([]); }}
                        className="p-3 hover:bg-surface-container cursor-pointer font-body text-sm border-b border-outline-variant last:border-b-0"
                      >
                        {s.display}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {showCustomRadius ? (
                  <input
                    type="number"
                    min="1"
                    max="200"
                    placeholder="Custom km"
                    value={customRadius}
                    onChange={(e) => setCustomRadius(e.target.value)}
                    className="w-24 px-3 py-3 border border-outline-variant rounded-lg text-xs font-bold text-on-surface bg-surface-container focus:ring-2 focus:ring-secondary focus:border-secondary outline-none h-10"
                    autoFocus
                  />
                ) : (
                  <select
                    value={radius}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setShowCustomRadius(true);
                        setCustomRadius('');
                      } else {
                        setRadius(e.target.value);
                      }
                    }}
                    className="bg-surface-container border border-outline-variant rounded-lg px-3 py-3 text-xs font-bold text-on-surface focus:ring-2 focus:ring-secondary focus:border-secondary outline-none cursor-pointer h-10"
                  >
                    <option value="5">5 km</option>
                    <option value="10">10 km</option>
                    <option value="20">20 km</option>
                    <option value="30">30 km</option>
                    <option value="50">50 km</option>
                    <option value="custom">Custom...</option>
                  </select>
                )}
                <Link
                  href={`/search?suburb=${encodeURIComponent(suburb)}&radius_km=${showCustomRadius ? customRadius : radius}${Object.entries(quickFilters).map(([k, v]) => `&${k}=${encodeURIComponent(v)}`).join('')}`}
                  className="bg-secondary text-white px-6 py-3 rounded-lg font-bold hover:brightness-110 transition-all flex items-center gap-2 h-10"
                >
                  <span className="material-symbols-outlined text-sm">search</span>
                  Search
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {[
              { icon: 'directions_car', label: 'Auto', key: 'transmission', value: 'auto' },
              { icon: 'settings', label: 'Manual', key: 'transmission', value: 'manual' },
              { icon: 'sentiment_satisfied', label: 'Anxiety-friendly', key: 'anxiety_friendly', value: 'true' },
              { icon: 'public', label: 'Intl. Licence', key: 'international_conversion', value: 'true' },
            ].map((f) => {
              const active = quickFilters[f.key] === f.value;
              return (
                <button
                  key={f.label}
                  onClick={() => toggleFilter(f.key, f.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    active
                      ? 'bg-white text-secondary border border-white'
                      : 'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{f.icon}</span>
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
        <div className="ai-gradient rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-secondary/20 relative overflow-hidden">
          <div className="relative z-10 max-w-[560px]">
            <div className="inline-flex items-center gap-2 bg-secondary text-white px-3 py-1 rounded-full text-xs font-bold mb-4">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              SMART MATCHING
            </div>
            <h2 className="text-on-surface text-3xl md:text-4xl font-display font-bold mb-4">Not sure who to pick?</h2>
            <p className="text-on-surface-variant text-lg font-body mb-6">
              Answer 5 simple questions about your goals and experience — our AI will recommend your best instructor match instantly.
            </p>
            <Link
              href="/find-my-instructor"
              className="bg-primary text-white px-8 py-4 rounded-lg font-bold hover:scale-[1.02] transition-transform inline-flex items-center gap-2"
            >
              Find My Match <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
          <div className="relative z-10 w-full md:w-1/3 flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">smart_toy</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-secondary">98% Match</div>
                  <div className="text-sm font-bold text-on-surface">Suggested for Sarah</div>
                </div>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[98%] rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        </div>
      </section>

      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg bg-white rounded-t-3xl shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-on-surface">
              {featured.length > 0 ? 'Top rated instructors near you' : 'Top rated instructors in Melbourne West'}
            </h2>
            <p className="text-on-surface-variant font-body">Vetted professionals with 4.8+ average ratings</p>
          </div>
          <Link href="/search" className="text-secondary font-bold flex items-center gap-1 hover:underline">
            View all{instructorCount !== null ? ` (${instructorCount})` : ''} <span className="material-symbols-outlined text-sm">chevron_right</span>
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((instructor) => (
              <InstructorCard key={instructor.id} instructor={instructor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-outline">
            <span className="material-symbols-outlined text-[48px] mb-2">local_taxi</span>
            <p>Loading instructors...</p>
          </div>
        )}
      </section>
    </>
  );
}
