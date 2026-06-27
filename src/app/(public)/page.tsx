'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import InstructorCard from '@/components/InstructorCard';
import type { Instructor } from '@/types';

function Star({ filled }: { filled: boolean }) {
  return (
    <svg className={`w-4 h-4 ${filled ? 'text-yellow-500' : 'text-gray-300'}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function StarRow({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }, (_, i) => (
        <Star key={i} filled={true} />
      ))}
    </div>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />
      <path d="M18 14l.7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7z" />
      <path d="M6 14l.7 2.3L9 17l-2.3.7L6 20l-.7-2.3L3 17l2.3-.7z" />
    </svg>
  );
}

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

  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/search?limit=4&sort=rating')
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

  const searchHref = `/search?suburb=${encodeURIComponent(suburb)}&radius_km=${showCustomRadius ? customRadius : radius}${Object.entries(quickFilters).map(([k, v]) => `&${k}=${encodeURIComponent(v)}`).join('')}`;

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-margin-mobile md:px-margin-desktop bg-white">
        <div className="max-w-container-max mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 max-w-3xl mx-auto leading-tight">
            Find the Right <span className="text-[#064E3B] underline decoration-[#064E3B]/20 decoration-8 underline-offset-4">Driving Instructor</span> Near You
          </h1>
          <p className="text-lg text-[#64748B] mb-12 max-w-2xl mx-auto leading-relaxed">
            {instructorCount !== null
              ? `Search from ${instructorCount}+ verified instructors, compare prices, read reviews, and find an instructor that matches your learning style.`
              : 'Search verified driving instructors, compare prices, read reviews, and find an instructor that matches your learning style.'}
          </p>

          {/* Search Module */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white border border-[#E5E7EB] p-2 md:p-3 rounded-[20px] shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-2">
              <div className="flex-1 flex items-center px-4 py-3 md:py-0 border-b md:border-b-0 md:border-r border-[#E5E7EB] relative">
                <svg className="w-5 h-5 text-[#064E3B] mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <input
                  type="text"
                  placeholder="Suburb or Postcode"
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full bg-transparent border-none focus:ring-0 text-gray-900 placeholder:text-gray-400 p-0 text-base outline-none"
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
                  className="text-gray-400 hover:text-[#064E3B] p-1 transition-colors"
                  title="Use my location"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </button>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-50 text-left mt-1 overflow-hidden">
                    {suggestions.map((s) => (
                      <div
                        key={s.display}
                        onClick={() => { setSuburb(s.suburb); setShowSuggestions(false); setSuggestions([]); }}
                        className="px-4 py-2.5 hover:bg-[#064E3B]/5 cursor-pointer text-sm text-gray-900 border-b border-[#E5E7EB] last:border-b-0 transition-colors"
                      >
                        {s.display}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-full md:w-48 flex items-center px-4 py-3 md:py-0 border-b md:border-b-0 md:border-r border-[#E5E7EB]">
                <svg className="w-5 h-5 text-[#064E3B] mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                {showCustomRadius ? (
                  <input
                    type="number"
                    min="1"
                    max="200"
                    placeholder="Custom km"
                    value={customRadius}
                    onChange={(e) => setCustomRadius(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-gray-900 p-0 outline-none text-base"
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
                    className="w-full bg-transparent border-none focus:ring-0 text-gray-900 p-0 outline-none text-base appearance-none cursor-pointer"
                  >
                    <option value="5">5 km radius</option>
                    <option value="10">10 km radius</option>
                    <option value="20">20 km radius</option>
                    <option value="30">30 km radius</option>
                    <option value="50">50 km radius</option>
                    <option value="custom">Custom...</option>
                  </select>
                )}
              </div>
              <Link
                href={searchHref}
                className="bg-[#064E3B] text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#053A2C] transition-all text-base shrink-0"
              >
                <span>Search Instructors</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </Link>
            </div>

            {/* Quick Filter Chips */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider mr-2">Quick Filters:</span>
              {[
                { label: 'Automatic', key: 'transmission', value: 'auto' },
                { label: 'Manual', key: 'transmission', value: 'manual' },
                { label: 'Anxiety Friendly', key: 'anxiety_friendly', value: 'true' },
                { label: 'Intl. Licence Conversion', key: 'international_conversion', value: 'true' },
              ].map((f) => {
                const active = quickFilters[f.key] === f.value;
                return (
                  <button
                    key={f.label}
                    onClick={() => toggleFilter(f.key, f.value)}
                    className={`px-4 py-1.5 border rounded-full text-sm transition-all duration-300 ${
                      active
                        ? 'bg-[#064E3B] text-white border-[#064E3B] shadow-sm'
                        : 'bg-white text-gray-500 border-[#E5E7EB] hover:border-[#064E3B] hover:text-[#064E3B]'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/find-my-instructor" className="text-[#064E3B] font-bold hover:underline decoration-2 underline-offset-4 flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
              Help Me Find the Right Instructor
            </Link>
          </div>
        </div>
      </section>

      {/* AI Match Section */}
      <section className="py-10 md:py-14 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest overflow-hidden">
        <div className="max-w-container-max mx-auto">
          <div className="bg-primary/5 rounded-3xl p-10 md:p-16 border border-primary/10 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 text-left">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-label-sm font-bold uppercase tracking-widest mb-6">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                AI Personalized Match
              </div>
              <h2 className="text-display-lg-mobile md:text-headline-lg font-headline-lg text-on-surface mb-6 leading-tight">Not Sure Who To Pick?</h2>
              <p className="text-body-lg text-secondary mb-10 max-w-xl">
                Answer 5 simple questions about your goals and experience — our AI will recommend your best instructor match instantly.
              </p>
              <Link
                href="/find-my-instructor"
                className="bg-primary text-white px-10 py-5 rounded-xl font-bold text-body-lg inline-flex items-center gap-3 hover:scale-105 transition-transform shadow-lg shadow-primary/20"
              >
                Start AI Matching Now
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                alt="AI-powered driving instructor matching service illustration showing a futuristic transparent vehicle connecting student and instructor icons"
                className="w-full h-auto rounded-2xl shadow-lg object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtitf9VoYbvIboIrvtNl1HpSXpTcBEc3IgjowVW-UhyG5Ufg_Bdav05GQi7I4HF-NaWaVIFpnshN-ak4UZXRKE4ineefUGT75cugdHuLXDw3eUdP-UWjqaXGbvSbWNAud4_ghrCFB3eTeNoma4jvANqUBKpO2ZKChS767HuSPFvOnFOQ4cA47LcY3vjrsoCYGQD6Xb5Pmpr0O2yRzXdR8CTvQB2fs2JefYlrqoRaDAD4AicpQ4Ky5SFIuCzsBDe6SOGrJ3-5t-AII"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Instructors */}
      <section className="py-10 md:py-14 px-margin-mobile md:px-margin-desktop bg-white">
        <div className="max-w-container-max mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Popular Instructors Near You</h2>
              <p className="text-lg text-[#64748B]">Trusted professionals with proven success rates.</p>
            </div>
            <Link href="/search" className="hidden md:flex items-center gap-2 text-[#064E3B] font-bold group">
              <span>Browse All Instructors{instructorCount !== null ? ` (${instructorCount})` : ''}</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((instructor) => (
                <InstructorCard key={instructor.id} instructor={instructor} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              <p>Loading instructors...</p>
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link href="/search" className="w-full block py-4 border border-[#064E3B] text-[#064E3B] font-bold rounded-xl">
              Browse All Instructors
            </Link>
          </div>
        </div>
      </section>

      {/* Why Learners Choose LCarDrive */}
      <section className="relative py-16 md:py-20 px-margin-mobile md:px-margin-desktop bg-white overflow-hidden">
        {/* Decorative background curves */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <svg className="absolute top-0 left-0 w-[600px] h-[600px] text-[#064E3B]/[0.03]" viewBox="0 0 600 600" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M0 400 Q150 200 300 400 T600 400" />
            <path d="M0 450 Q150 250 300 450 T600 450" />
            <path d="M0 500 Q150 300 300 500 T600 500" />
          </svg>
          <svg className="absolute bottom-0 right-0 w-[500px] h-[500px] text-[#064E3B]/[0.03]" viewBox="0 0 500 500" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M500 100 Q350 300 500 500" />
            <path d="M500 150 Q350 350 500 500" />
          </svg>
          <svg className="absolute top-1/4 right-[10%] w-[200px] h-[200px] text-[#064E3B]/[0.04]" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="100" cy="100" r="80" />
            <circle cx="100" cy="100" r="50" />
          </svg>
        </div>

        <div className="max-w-container-max mx-auto relative z-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">Why Learners Choose LCarDrive</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative bg-white p-8 rounded-[20px] border border-[#E5E7EB] shadow-sm text-center group hover:shadow-md hover:border-[#064E3B]/20 transition-all duration-300">
              <div className="absolute inset-0 rounded-[20px] bg-gradient-to-b from-[#064E3B]/[0.02] to-transparent pointer-events-none" />
              <svg className="w-10 h-10 text-[#064E3B] mx-auto mb-6 relative" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 mb-4 relative">Find Instructors Faster</h3>
              <p className="text-base text-[#64748B] leading-relaxed relative">No more calling around. Our instant search gives you real-time availability in seconds.</p>
            </div>
            <div className="relative bg-white p-8 rounded-[20px] border border-[#E5E7EB] shadow-sm text-center group hover:shadow-md hover:border-[#064E3B]/20 transition-all duration-300">
              <div className="absolute inset-0 rounded-[20px] bg-gradient-to-b from-[#064E3B]/[0.02] to-transparent pointer-events-none" />
              <svg className="w-10 h-10 text-[#064E3B] mx-auto mb-6 relative" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 3h5v5" />
                <path d="M8 3H3v5" />
                <path d="M3 16v5h5" />
                <path d="M21 16v5h-5" />
                <path d="m8 8 8 8" />
                <path d="m16 8-8 8" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 mb-4 relative">Compare With Confidence</h3>
              <p className="text-base text-[#64748B] leading-relaxed relative">Compare instructors side-by-side based on price, vehicle type, and verified learner ratings.</p>
            </div>
            <div className="relative bg-white p-8 rounded-[20px] border border-[#E5E7EB] shadow-sm text-center group hover:shadow-md hover:border-[#064E3B]/20 transition-all duration-300">
              <div className="absolute inset-0 rounded-[20px] bg-gradient-to-b from-[#064E3B]/[0.02] to-transparent pointer-events-none" />
              <svg className="w-10 h-10 text-[#064E3B] mx-auto mb-6 relative" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 mb-4 relative">Learn With The Right Match</h3>
              <p className="text-base text-[#64748B] leading-relaxed relative">Find instructors that specialise in your specific needs, like anxiety-friendly teaching styles.</p>
            </div>
            <div className="relative bg-white p-8 rounded-[20px] border border-[#E5E7EB] shadow-sm text-center group hover:shadow-md hover:border-[#064E3B]/20 transition-all duration-300">
              <div className="absolute inset-0 rounded-[20px] bg-gradient-to-b from-[#064E3B]/[0.02] to-transparent pointer-events-none" />
              <svg className="w-10 h-10 text-[#064E3B] mx-auto mb-6 relative" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.33 22H18a2 2 0 0 0 2-2v-1a6 6 0 0 0-5.36-5.93" />
                <path d="M9.67 22H6a2 2 0 0 1-2-2v-1a6 6 0 0 1 5.36-5.93" />
                <path d="M12 2v2" />
                <path d="M12 14v2" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 mb-4 relative">Verified Profiles</h3>
              <p className="text-base text-[#64748B] leading-relaxed relative">Every instructor on our platform is pre-vetted with valid working with children checks and licenses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-20 px-margin-mobile md:px-margin-desktop bg-white">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-[#64748B]">Getting your license is easier than you think.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-[16.67%] right-[16.67%] h-px border-t border-dashed border-[#064E3B]/20 -translate-y-12"></div>
            {[
              { num: '1', title: 'Search', desc: 'Enter your suburb and filter by car type, transmission, or special requirements.' },
              { num: '2', title: 'Compare', desc: 'Read reviews, check prices, and view detailed profiles of instructors near you.' },
              { num: '3', title: 'Contact', desc: 'Message instructors directly or book your first lesson through their profile.' },
            ].map((step) => (
              <div key={step.num} className="text-center relative">
                <div className="w-16 h-16 bg-[#064E3B] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-md">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-base text-[#64748B] leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructor CTA */}
      <section className="py-16 md:py-20 px-margin-mobile md:px-margin-desktop bg-[#064E3B] text-white overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">Are You A Driving Instructor?</h2>
            <p className="text-lg text-white/80 mb-6 leading-relaxed">
              Join Australia&apos;s fastest-growing instructor marketplace and grow your business with premium leads and professional tools.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-white/80 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                <span className="text-base">Free listing with zero upfront costs</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-white/80 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                <span className="text-base">AI-powered bio generation for your profile</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-white/80 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                <span className="text-base">Full booking and student management dashboard</span>
              </li>
            </ul>
            <Link href="/claim" className="bg-white text-[#064E3B] px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all inline-block shadow-md">
              Claim Your Profile
            </Link>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="bg-white/10 p-4 rounded-[20px] backdrop-blur-sm border border-white/20">
              <div className="bg-white text-gray-900 p-6 rounded-xl shadow-2xl max-w-sm rotate-2">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#064E3B]/10 rounded-full flex items-center justify-center text-[#064E3B] font-bold text-lg">
                    JD
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Jason D.</p>
                    <p className="text-sm text-[#64748B]">Melbourne Instructor</p>
                  </div>
                </div>
                <p className="text-base text-gray-600 italic">
                  &ldquo;I filled my weekly schedule within 14 days of claiming my profile. The AI bio tool made me look professional instantly.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="success-stories" className="py-16 md:py-20 px-margin-mobile md:px-margin-desktop bg-white">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-lg text-[#64748B]">Join thousands of Aussies who found their perfect match.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Emma R.',
                instructor: 'w/ Sarah T.',
                text: 'I was so nervous about starting, but the AI match found me Sarah who specialised in anxious learners. Passed first go!',
              },
              {
                name: 'Liam W.',
                instructor: 'w/ David C.',
                text: 'Great platform. I could see David\'s availability and book instantly. Saved me so much time calling around different schools.',
              },
              {
                name: 'Priya K.',
                instructor: 'w/ Marcus R.',
                text: 'The filters are amazing. I needed a manual instructor who spoke Hindi for my dad, and LCarDrive found 3 options in minutes.',
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="bg-white p-8 rounded-[20px] border border-[#E5E7EB] shadow-sm">
                <StarRow />
                <p className="text-base text-gray-600 mb-6 italic mt-4 leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="border-t border-[#E5E7EB] pt-4 flex items-center justify-between">
                  <span className="font-bold text-gray-900">{testimonial.name}</span>
                  <span className="text-sm text-[#64748B]">{testimonial.instructor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 px-margin-mobile md:px-margin-desktop bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'How do I know if an instructor is qualified?',
                a: 'Every instructor on LCarDrive must upload their current driving instructor license and Working With Children Check (WWCC). We verify these documents before their profile goes live.',
              },
              {
                q: 'Can I switch instructors if it\'s not a good match?',
                a: 'Absolutely. We believe the student-instructor connection is vital. If you\'re not happy after your first lesson, our support team can help you find a new match or you can use our AI search again.',
              },
              {
                q: 'What\'s the difference between Automatic and Manual lessons?',
                a: 'Automatic cars handle gear shifts for you, while manual cars require you to use a clutch and gear stick. If you pass in an automatic, your license may be restricted to automatic vehicles only.',
              },
            ].map((faq, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full px-6 py-5 text-left font-bold flex justify-between items-center hover:bg-gray-50 transition-colors text-gray-900"
                >
                  {faq.q}
                  <svg
                    className={`w-5 h-5 text-[#064E3B] transition-transform duration-300 ${faqOpen === i ? 'rotate-45' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${faqOpen === i ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="px-6 pb-6 text-base text-[#64748B] leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 px-margin-mobile md:px-margin-desktop bg-white border-t border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Ready To Start Your Driving Journey?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/search" className="w-full sm:w-auto bg-[#064E3B] text-white px-10 py-4 rounded-xl font-bold text-lg shadow-md hover:bg-[#053A2C] transition-all">
              Search Instructors
            </Link>
            <Link href="/find-my-instructor" className="w-full sm:w-auto border-2 border-[#064E3B] text-[#064E3B] px-10 py-3.5 rounded-xl font-bold text-lg hover:bg-[#064E3B]/5 transition-all">
              Start AI Match
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
