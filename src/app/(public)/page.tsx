'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import InstructorCard from '@/components/InstructorCard';
import type { Instructor } from '@/types';

function Star({ filled }: { filled: boolean }) {
  return (
    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}>
      {filled ? 'star' : 'star_half'}
    </span>
  );
}

function StarRow({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center gap-1 text-primary">
      {Array.from({ length: count }, (_, i) => (
        <Star key={i} filled={true} />
      ))}
    </div>
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
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 px-margin-mobile md:px-margin-desktop overflow-hidden bg-surface">
        <div className="max-w-container-max mx-auto text-center relative z-10">
          <h1 className="text-display-lg-mobile md:text-display-lg font-display-lg text-on-surface mb-6 max-w-3xl mx-auto leading-tight">
            Find the Right <span className="text-primary underline decoration-primary/20 decoration-8 underline-offset-4">Driving Instructor</span> Near You
          </h1>
          <p className="text-body-lg text-secondary mb-12 max-w-2xl mx-auto">
            {instructorCount !== null
              ? `Search from ${instructorCount}+ verified instructors, compare prices, read reviews, and find an instructor that matches your learning style.`
              : 'Search verified driving instructors, compare prices, read reviews, and find an instructor that matches your learning style.'}
          </p>

          {/* Search Module */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-surface-container-lowest border border-outline-variant p-2 md:p-3 rounded-xl search-container-shadow flex flex-col md:flex-row items-stretch md:items-center gap-2">
              <div className="flex-1 flex items-center px-4 py-3 md:py-0 border-b md:border-b-0 md:border-r border-outline-variant relative">
                <span className="material-symbols-outlined text-primary mr-3 text-xl">location_on</span>
                <input
                  type="text"
                  placeholder="Suburb or Postcode"
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline p-0 text-body-md outline-none"
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
                  className="text-outline hover:text-primary p-1"
                  title="Use my location"
                >
                  <span className="material-symbols-outlined text-xl">my_location</span>
                </button>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-outline-variant rounded-b-lg shadow-lg z-50 text-left mt-1">
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
              <div className="w-full md:w-48 flex items-center px-4 py-3 md:py-0 border-b md:border-b-0 md:border-r border-outline-variant">
                <span className="material-symbols-outlined text-primary mr-3 text-xl">distance</span>
                {showCustomRadius ? (
                  <input
                    type="number"
                    min="1"
                    max="200"
                    placeholder="Custom km"
                    value={customRadius}
                    onChange={(e) => setCustomRadius(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-on-surface p-0 outline-none text-body-md"
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
                    className="w-full bg-transparent border-none focus:ring-0 text-on-surface p-0 outline-none text-body-md appearance-none cursor-pointer"
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
                className="bg-primary text-white px-8 py-4 rounded font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-all text-body-md shrink-0"
              >
                <span>Search Instructors</span>
                <span className="material-symbols-outlined text-xl">search</span>
              </Link>
            </div>

            {/* Quick Filter Chips */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="text-label-sm text-secondary uppercase font-bold tracking-wider mr-2">Quick Filters:</span>
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
                    className={`px-4 py-1.5 border border-outline-variant rounded-full text-body-md transition-all duration-300 ${
                      active
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-surface-container-lowest text-on-surface hover:border-primary hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/find-my-instructor" className="text-primary font-bold hover:underline decoration-2 underline-offset-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">help_outline</span>
              Help Me Find the Right Instructor
            </Link>
          </div>
        </div>
      </section>

      {/* AI Match Section */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest overflow-hidden">
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
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-container-max mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-headline-md font-headline-md text-on-surface mb-2">Popular Instructors Near You</h2>
              <p className="text-body-lg text-secondary">Trusted professionals with proven success rates.</p>
            </div>
            <Link href="/search" className="hidden md:flex items-center gap-2 text-primary font-bold group">
              <span>Browse All Instructors{instructorCount !== null ? ` (${instructorCount})` : ''}</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          <div className="mt-12 text-center md:hidden">
            <Link href="/search" className="w-full block py-4 border border-primary text-primary font-bold rounded-lg">
              Browse All Instructors
            </Link>
          </div>
        </div>
      </section>

      {/* Why Learners Choose LCarDrive */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto">
          <h2 className="text-headline-md font-headline-md text-on-surface mb-16 text-center">Why Learners Choose LCarDrive</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <div className="feature-card">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">bolt</span>
              <h3 className="text-body-lg font-bold text-on-surface mb-4">Find Instructors Faster</h3>
              <p className="text-body-md text-secondary">No more calling around. Our instant search gives you real-time availability in seconds.</p>
            </div>
            <div className="feature-card">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">compare_arrows</span>
              <h3 className="text-body-lg font-bold text-on-surface mb-4">Compare With Confidence</h3>
              <p className="text-body-md text-secondary">Compare instructors side-by-side based on price, vehicle type, and verified learner ratings.</p>
            </div>
            <div className="feature-card">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">psychology</span>
              <h3 className="text-body-lg font-bold text-on-surface mb-4">Learn With The Right Match</h3>
              <p className="text-body-md text-secondary">Find instructors that specialise in your specific needs, like anxiety-friendly teaching styles.</p>
            </div>
            <div className="feature-card">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">verified</span>
              <h3 className="text-body-lg font-bold text-on-surface mb-4">Verified Profiles</h3>
              <p className="text-body-md text-secondary">Every instructor on our platform is pre-vetted with valid working with children checks and licenses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-headline-md font-headline-md text-on-surface mb-4">How It Works</h2>
            <p className="text-body-lg text-secondary">Getting your license is easier than you think.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-1/2 left-[16.67%] right-[16.67%] h-px border-t border-dashed border-primary/30 -translate-y-12"></div>
            {[
              { num: '1', title: 'Search', desc: 'Enter your suburb and filter by car type, transmission, or special requirements.' },
              { num: '2', title: 'Compare', desc: 'Read reviews, check prices, and view detailed profiles of instructors near you.' },
              { num: '3', title: 'Contact', desc: 'Message instructors directly or book your first lesson through their profile.' },
            ].map((step) => (
              <div key={step.num} className="text-center relative">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-headline-md font-bold mx-auto mb-6 shadow-lg">
                  {step.num}
                </div>
                <h3 className="text-body-lg font-bold text-on-surface mb-4">{step.title}</h3>
                <p className="text-body-md text-secondary">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructor CTA */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-primary text-white overflow-hidden relative">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <h2 className="text-display-lg-mobile md:text-headline-lg font-headline-lg mb-6 leading-tight">Are You A Driving Instructor?</h2>
            <p className="text-body-lg text-primary-fixed/80 mb-8">
              Join Australia&apos;s fastest-growing instructor marketplace and grow your business with premium leads and professional tools.
            </p>
            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-fixed">check_circle</span>
                <span className="text-body-md">Free listing with zero upfront costs</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-fixed">check_circle</span>
                <span className="text-body-md">AI-powered bio generation for your profile</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-fixed">check_circle</span>
                <span className="text-body-md">Full booking and student management dashboard</span>
              </li>
            </ul>
            <Link href="/claim" className="bg-white text-primary px-10 py-4 rounded-xl font-bold text-body-lg hover:bg-surface-container-low transition-all inline-block">
              Claim Your Profile
            </Link>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
              <div className="bg-white text-on-surface p-6 rounded-xl shadow-2xl max-w-sm rotate-2">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                    JD
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">Jason D.</p>
                    <p className="text-label-sm text-secondary">Melbourne Instructor</p>
                  </div>
                </div>
                <p className="text-body-md text-on-surface-variant italic">
                  &ldquo;I filled my weekly schedule within 14 days of claiming my profile. The AI bio tool made me look professional instantly.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-headline-md font-headline-md text-on-surface mb-4">Success Stories</h2>
            <p className="text-body-lg text-secondary">Join thousands of Aussies who found their perfect match.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
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
              <div key={testimonial.name} className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-sm">
                <StarRow />
                <p className="text-body-md text-on-surface mb-6 italic mt-4">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="border-t border-outline-variant pt-4 flex items-center justify-between">
                  <span className="font-bold text-on-surface">{testimonial.name}</span>
                  <span className="text-label-sm text-secondary">{testimonial.instructor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-headline-md font-headline-md text-on-surface mb-12 text-center">Frequently Asked Questions</h2>
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
              <div key={i} className="border border-outline-variant rounded-lg overflow-hidden">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full px-6 py-5 text-left font-bold flex justify-between items-center hover:bg-surface transition-colors text-on-surface"
                >
                  {faq.q}
                  <span className="material-symbols-outlined text-primary transition-transform duration-300" style={{ transform: faqOpen === i ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                    add
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${faqOpen === i ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="px-6 pb-6 text-body-md text-secondary">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface border-t border-outline-variant">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-display-lg-mobile md:text-headline-md font-headline-md text-on-surface mb-8">Ready To Start Your Driving Journey?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/search" className="w-full sm:w-auto bg-primary text-white px-10 py-4 rounded-xl font-bold text-body-lg shadow-lg hover:shadow-xl transition-all">
              Search Instructors
            </Link>
            <Link href="/find-my-instructor" className="w-full sm:w-auto border-2 border-primary text-primary px-10 py-3.5 rounded-xl font-bold text-body-lg hover:bg-primary/5 transition-all">
              Start AI Match
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
