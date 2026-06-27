'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import Pagination from '@/components/Pagination';
import type { Instructor } from '@/types';

interface MatchResult {
  name: string;
  image: string;
  rating: number;
  reviews: number;
  bio: string;
  reason: string;
  verified: boolean;
  slug: string;
  suburb: string;
}

const QUESTIONS = [
  { id: 'suburb', label: 'To start, where are you looking to take your driving lessons?', type: 'text', placeholder: 'e.g. Suburb, City, or Zip Code' },
  { id: 'transmission', label: 'Automatic or manual?', type: 'choice', options: ['Automatic', 'Manual', 'No preference'] },
  { id: 'special_needs', label: 'Any special needs or preferences?', type: 'choice', options: ['Anxiety / nervous driver', 'ADHD', 'International licence conversion', 'None of the above'] },
  { id: 'available_days', label: 'Which days suit you best?', type: 'choice', options: ['Weekdays', 'Weekends', 'Both'] },
  { id: 'budget', label: "What's your max budget per hour?", type: 'choice', options: ['$40\u2013$50', '$50\u2013$65', '$65\u2013$80', '$80+'] },
];

function parseBudget(budget: string): number {
  const match = budget.match(/\$(\d+)/);
  return match ? parseInt(match[1], 10) + 10 : 100;
}

function buildSearchParams(answers: Record<string, string>): URLSearchParams {
  const params = new URLSearchParams();
  if (answers.suburb) params.set('suburb', answers.suburb);
  const t = answers.transmission;
  if (t === 'Automatic') params.set('transmission', 'auto');
  else if (t === 'Manual') params.set('transmission', 'manual');
  params.set('max_price', String(parseBudget(answers.budget)));
  if (answers.special_needs === 'Anxiety / nervous driver') params.set('anxiety_friendly', 'true');
  if (answers.special_needs === 'International licence conversion') params.set('international_conversion', 'true');
  if (answers.available_days && answers.available_days !== 'Both') {
    params.set('available_days', answers.available_days.toLowerCase());
  }
  params.set('limit', '12');
  return params;
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

function AnimatedEllipsis() {
  return (
    <span className="inline-flex">
      <span className="animate-bounce [animation-delay:0ms]">.</span>
      <span className="animate-bounce [animation-delay:150ms]">.</span>
      <span className="animate-bounce [animation-delay:300ms]">.</span>
    </span>
  );
}

export default function FindMyInstructorPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [aiMatches, setAiMatches] = useState<MatchResult[] | null>(null);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [totalInstructors, setTotalInstructors] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{ display: string; suburb: string; state: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fetchedRef = useRef(false);

  const current = QUESTIONS[step];

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

  const setAnswer = (value: string) => setAnswers((prev) => ({ ...prev, [current.id]: value }));

  const handleSuburbChange = (value: string) => {
    setAnswer(value);
    if (current.id === 'suburb') setShowSuggestions(true);
  };

  const selectSuggestion = (s: { display: string; suburb: string; state: string }) => {
    setAnswers((prev) => ({ ...prev, suburb: s.suburb }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (current.id !== 'suburb') return;
    const timer = setTimeout(() => fetchSuggestions(answers.suburb || ''), 250);
    return () => clearTimeout(timer);
  }, [answers.suburb, fetchSuggestions, current.id]);

  const fetchResults = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const params = buildSearchParams(answers);
      params.set('page', String(page));
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      if (res.ok) {
        setAllInstructors(data.instructors || []);
        setTotalInstructors(data.total || 0);
        setTotalPages(Math.max(1, Math.ceil((data.total || 0) / 12)));
        setCurrentPage(page);
      }
    } catch {
      setAllInstructors([]);
      setTotalInstructors(0);
    } finally {
      setLoading(false);
    }
  }, [answers]);

  const handleNext = async () => {
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    setInitialLoading(true);
    fetchedRef.current = false;

    try {
      const params = buildSearchParams(answers);
      params.set('page', '1');
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      const instructors: Instructor[] = data.instructors || [];
      const total = data.total || 0;

      setAllInstructors(instructors);
      setTotalInstructors(total);
      setTotalPages(Math.max(1, Math.ceil(total / 12)));
      setCurrentPage(1);

      if (instructors.length > 0) {
        const aiRes = await fetch('/api/ai/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            suburb: answers.suburb,
            transmission: answers.transmission === 'Automatic' ? 'auto' : answers.transmission === 'Manual' ? 'manual' : undefined,
            special_needs: answers.special_needs !== 'None of the above' ? [answers.special_needs] : [],
            available_days: answers.available_days ? [answers.available_days] : [],
            max_hourly_rate: parseBudget(answers.budget),
            instructors,
          }),
        });

        const { matches } = await aiRes.json();
        if (matches && matches.length > 0) {
          const matched: MatchResult[] = matches
            .map((m: { id: string; reason: string }) => {
              const inst = instructors.find((i) => i.id === m.id);
              if (!inst) return null;
              return {
                name: `${inst.first_name} ${inst.last_name}`,
                image: inst.profile_photo_url || '',
                rating: inst.average_rating,
                reviews: inst.review_count,
                bio: inst.bio || '',
                reason: m.reason,
                verified: inst.is_verified,
                slug: inst.slug,
                suburb: inst.suburb,
              };
            })
            .filter(Boolean) as MatchResult[];
          setAiMatches(matched);
        } else {
          setAiMatches([]);
        }
      } else {
        setAiMatches([]);
      }
    } catch {
      setAiMatches([]);
      setAllInstructors([]);
      setTotalInstructors(0);
    } finally {
      setInitialLoading(false);
      fetchedRef.current = true;
    }
  };

  const handlePrev = () => { if (step > 0) setStep((s) => s - 1); };
  const reset = () => {
    setStep(0);
    setAnswers({});
    setAiMatches(null);
    setAllInstructors([]);
    setTotalInstructors(0);
    setCurrentPage(1);
    setTotalPages(1);
    fetchedRef.current = false;
  };

  const handlePageChange = (page: number) => {
    fetchResults(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (fetchedRef.current || initialLoading) {
    return (
      <div className="flex-grow flex flex-col px-margin-mobile md:px-margin-desktop py-stack-lg w-full relative overflow-hidden">
        {initialLoading && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#064E3B]/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#064E3B]/5 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
          </div>
        )}
        <section className="w-full max-w-container-max mx-auto z-10 fade-in">
          {initialLoading ? (
            <div className="flex flex-col items-center justify-center py-24 relative">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-[20px] bg-[#064E3B] flex items-center justify-center shadow-lg shadow-[#064E3B]/20 animate-pulse">
                  <SparkleIcon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#064E3B] flex items-center justify-center shadow-sm animate-bounce">
                  <span className="text-white text-[10px] font-bold">AI</span>
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Analyzing your preferences</h2>
              <p className="text-sm text-[#64748B] max-w-xs text-center leading-relaxed">
                Our AI is cross-referencing availability, ratings, and teaching styles<AnimatedEllipsis />
              </p>
              <div className="mt-8 flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#064E3B] animate-bounce [animation-delay:0ms]" />
                <div className="w-2 h-2 rounded-full bg-[#064E3B] animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 rounded-full bg-[#064E3B] animate-bounce [animation-delay:300ms]" />
                <div className="w-2 h-2 rounded-full bg-[#064E3B] animate-bounce [animation-delay:450ms]" />
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-stack-lg">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#064E3B]/10 text-[#064E3B] mb-stack-sm shadow-sm">
                  <SparkleIcon className="w-4 h-4" />
                  <span className="text-xs font-bold">Analysis Complete</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your AI matches</h2>
                <p className="text-sm text-[#64748B] mb-5">
                  {totalInstructors} instructor{totalInstructors !== 1 ? 's' : ''} found in your area
                </p>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 bg-[#064E3B] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#053A2C] transition-all shadow-md"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  New Search
                </button>
              </div>

              {/* AI Top Picks */}
              {aiMatches && aiMatches.length > 0 && (
                <div className="mb-stack-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-[#064E3B]/10 flex items-center justify-center">
                      <SparkleIcon className="w-4 h-4 text-[#064E3B]" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">AI Top Picks</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {aiMatches.map((r, i) => (
                      <Link
                        key={r.name}
                        href={`/instructors/${r.suburb.toLowerCase().replace(/\s+/g, '-')}/${r.slug}`}
                        className="group relative bg-white rounded-[20px] border border-[#E5E7EB] hover:border-[#064E3B] transition-all duration-200 p-4 flex flex-col hover:shadow-md"
                      >
                        <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#064E3B] flex items-center justify-center shadow-sm text-white text-[11px] font-bold">
                          {i + 1}
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden ring-2 ring-[#E5E7EB] group-hover:ring-[#064E3B]/30 transition-all">
                            {r.image ? (
                              <img src={r.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#64748B]">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-bold text-gray-900 truncate">{r.name}</span>
                              {r.verified && (
                                <svg className="w-4 h-4 text-[#064E3B] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <svg className="w-3 h-3 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                              <span className="text-xs font-bold text-gray-900">{r.rating}</span>
                              <span className="text-[10px] text-[#64748B]">({r.reviews})</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
                          <p className="text-[11px] text-[#64748B] leading-relaxed">
                            <span className="text-[#064E3B] font-semibold">Why them? </span>
                            {r.reason}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Instructors */}
              {allInstructors.filter((i) => i.is_verified).length > 0 && (
                <div className="mb-stack-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-[#064E3B]/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#064E3B]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Verified Instructors</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                    {allInstructors.filter((i) => i.is_verified).map((inst) => (
                      <Link
                        key={inst.id}
                        href={`/instructors/${inst.suburb.toLowerCase().replace(/\s+/g, '-')}/${inst.slug}`}
                        className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-[#E5E7EB] hover:border-[#064E3B] hover:shadow-md transition-all duration-300 flex flex-col group"
                      >
                        <div className="relative h-40 w-full bg-gray-50">
                          {inst.profile_photo_url ? (
                            <img src={inst.profile_photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#64748B]">
                              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 shadow-sm">
                            <svg className="w-3.5 h-3.5 text-[#064E3B]" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                            </svg>
                            <span className="text-[10px] font-semibold text-[#064E3B]">Verified</span>
                          </div>
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                          <h3 className="text-sm font-bold text-gray-900 mb-1">{inst.first_name} {inst.last_name}</h3>
                          <p className="text-xs text-[#64748B] mb-2 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            {inst.suburb}, {inst.state}
                          </p>
                          {inst.hourly_rate && (
                            <p className="text-sm font-bold text-[#064E3B] mb-3">${inst.hourly_rate}/hr</p>
                          )}
                          <div className="mt-auto">
                            <span className="w-full text-xs font-semibold text-[#64748B] bg-gray-50 px-3 py-2 rounded-lg hover:bg-[#064E3B]/10 hover:text-[#064E3B] border border-[#E5E7EB] transition-colors text-center block">
                              View Profile
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {aiMatches && aiMatches.length === 0 && allInstructors.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-[20px] bg-gray-50 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#64748B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </div>
                  <p className="text-[#64748B] text-sm mb-4">No matching instructors found. Try adjusting your preferences.</p>
                  <button onClick={reset} className="bg-[#064E3B] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#053A2C] transition-colors shadow-sm">
                    Start New Search
                  </button>
                </div>
              )}

              {/* All Results */}
              {allInstructors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4 border-t border-[#E5E7EB] pt-stack-lg">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      All Matching Instructors
                      {loading && (
                        <svg className="w-4 h-4 text-[#064E3B] animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                      )}
                    </h3>
                    <span className="text-xs text-[#64748B]">Page {currentPage} of {totalPages}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                    {allInstructors.filter((i) => !i.is_verified).map((inst) => (
                      <div key={inst.id} className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-[#E5E7EB] hover:border-[#064E3B] hover:shadow-md transition-all duration-300 flex flex-col group">
                        <div className="relative h-40 w-full bg-gray-50">
                          {inst.profile_photo_url ? (
                            <img src={inst.profile_photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#64748B]">
                              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                          <div className="flex items-center gap-1.5 mb-1">
                            <h3 className="text-sm font-bold text-gray-900">{inst.first_name} {inst.last_name}</h3>
                          </div>
                          <p className="text-xs text-[#64748B] mb-1 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            {inst.suburb}, {inst.state}
                          </p>
                          {inst.hourly_rate && (
                            <p className="text-sm font-bold text-[#064E3B] mb-3">${inst.hourly_rate}/hr</p>
                          )}
                          <div className="mt-auto">
                            <Link
                              href={`/instructors/${inst.suburb.toLowerCase().replace(/\s+/g, '-')}/${inst.slug}`}
                              className="w-full text-xs font-semibold text-[#64748B] bg-gray-50 px-3 py-2 rounded-lg hover:bg-[#064E3B]/10 hover:text-[#064E3B] border border-[#E5E7EB] transition-colors text-center block"
                            >
                              View Profile
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}

              <div className="mt-stack-lg text-center">
                <button onClick={reset} className="text-sm font-medium text-[#64748B] hover:text-[#064E3B] transition-colors flex items-center justify-center gap-2 mx-auto">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  Start New Search
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop py-8 w-full relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-[#064E3B]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-[#064E3B]/5 rounded-full blur-3xl" />
      </div>
      <section className="w-full max-w-lg bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm p-6 md:p-8 relative z-10 fade-in">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#064E3B] flex items-center justify-center shadow-sm">
                <SparkleIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900">Find Your Match</span>
            </div>
            <span className="text-xs font-semibold text-[#64748B]">{step + 1} of {QUESTIONS.length}</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#064E3B] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">{current.label}</h1>

        {current.type === 'text' && (
          <div className="relative mb-6 mt-4">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <input
              type="text"
              placeholder={current.placeholder}
              value={answers[current.id] || ''}
              onChange={(e) => handleSuburbChange(e.target.value)}
              onFocus={() => { if (current.id === 'suburb') setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-10 pr-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]/30 focus:border-[#064E3B] transition-all shadow-sm"
              autoComplete="chrome-off"
              data-1p-ignore
              data-lpignore="true"
              autoFocus
            />
            {current.id === 'suburb' && showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-50 text-left mt-1 overflow-hidden">
                {suggestions.map((s) => (
                  <div
                    key={s.display}
                    onMouseDown={() => selectSuggestion(s)}
                    className="px-4 py-2.5 hover:bg-[#064E3B]/5 cursor-pointer text-sm text-gray-900 border-b border-[#E5E7EB] last:border-b-0 transition-colors"
                  >
                    {s.display}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {current.type === 'choice' && (
          <div className="space-y-2 mb-6 mt-4">
            {current.options!.map((opt) => (
              <button
                key={opt}
                onClick={() => setAnswer(opt)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all text-sm ${
                  answers[current.id] === opt
                    ? 'border-[#064E3B] bg-[#064E3B]/10 text-[#064E3B] font-bold shadow-sm'
                    : 'border-[#E5E7EB] bg-gray-50 text-[#64748B] hover:border-[#064E3B] hover:text-gray-900 hover:bg-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center pt-5 border-t border-[#E5E7EB]">
          <button onClick={handlePrev} disabled={step === 0} className="text-sm font-medium text-[#64748B] hover:text-gray-900 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-30">
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back
          </button>
          <button onClick={handleNext} disabled={!answers[current.id]} className="text-sm font-semibold bg-[#064E3B] text-white px-6 py-2.5 rounded-xl hover:bg-[#053A2C] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-40">
            {step === QUESTIONS.length - 1 ? (
              <>
                Find My Match
                <SparkleIcon className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
