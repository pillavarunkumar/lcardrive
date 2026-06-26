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
  const fetchedRef = useRef(false);

  const current = QUESTIONS[step];

  const setAnswer = (value: string) => setAnswers((prev) => ({ ...prev, [current.id]: value }));

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
        <section className="w-full max-w-container-max mx-auto z-10 fade-in">
          {initialLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="material-symbols-outlined text-[48px] text-primary animate-spin mb-4">refresh</span>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Analyzing your preferences...</h2>
              <p className="text-sm text-gray-500">Our AI is cross-referencing availability, ratings, and teaching styles.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-stack-lg">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-[#064E3B] mb-stack-sm shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  <span className="text-xs font-bold">Analysis Complete</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Our AI matches for you</h2>
                <p className="text-sm text-gray-500 mb-4">
                  {totalInstructors} instructor{totalInstructors !== 1 ? 's' : ''} found in your area
                </p>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-md shadow-primary/20"
                >
                  <span className="material-symbols-outlined text-[18px]">search</span>
                  Submit New Search
                </button>
              </div>

              {/* Verified / Admin profiles at the top */}
              {allInstructors.filter((i) => i.is_verified).length > 0 && (
                <div className="mb-stack-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    <h3 className="text-sm font-bold text-gray-900">Verified Instructors</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                    {allInstructors.filter((i) => i.is_verified).map((inst) => (
                      <Link
                        key={inst.id}
                        href={`/instructors/${inst.suburb.toLowerCase().replace(/\s+/g, '-')}/${inst.slug}`}
                        className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(15,23,42,0.08)] hover:shadow-[0px_10px_25px_rgba(15,23,42,0.12)] transition-all duration-300 border border-primary flex flex-col group"
                      >
                        <div className="relative h-40 w-full bg-surface-container">
                          {inst.profile_photo_url ? (
                            <img src={inst.profile_photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-outline">
                              <span className="material-symbols-outlined text-[40px]">person</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                          <div className="flex items-center gap-1.5 mb-1">
                            <h3 className="text-sm font-bold text-gray-900">{inst.first_name} {inst.last_name}</h3>
                            <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            <span className="material-symbols-outlined text-[14px] align-text-bottom">location_on</span> {inst.suburb}, {inst.state}
                          </p>
                          {inst.hourly_rate && (
                            <p className="text-sm font-bold text-[#064E3B] mb-3">${inst.hourly_rate}/hr</p>
                          )}
                          <div className="mt-auto">
                            <span className="w-full text-xs font-semibold text-[#064E3B] border border-primary px-3 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors text-center block">
                              View Profile
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Top Picks in small rectangles */}
              {aiMatches && aiMatches.length > 0 && (
                <div className="mb-stack-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    <h3 className="text-sm font-bold text-gray-900">AI Match Suggestions</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {aiMatches.map((r) => (
                      <Link
                        key={r.name}
                        href={`/instructors/${r.suburb.toLowerCase().replace(/\s+/g, '-')}/${r.slug}`}
                        className="bg-surface-container-lowest rounded-lg border border-outline-variant hover:border-primary transition-all duration-200 p-3 flex items-start gap-3 group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-surface-container flex-shrink-0 overflow-hidden">
                          {r.image ? (
                            <img src={r.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-outline">
                              <span className="material-symbols-outlined text-[20px]">person</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-gray-900 truncate">{r.name}</span>
                            {r.verified && (
                              <span className="material-symbols-outlined text-primary text-[14px] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[12px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="text-xs font-bold text-gray-900">{r.rating}</span>
                            <span className="text-[10px] text-gray-500">({r.reviews})</span>
                          </div>
                          <div className="mt-1 text-[11px] text-[#064E3B]/80 bg-primary/5 rounded px-1.5 py-1 leading-snug">
                            <span className="material-symbols-outlined text-[10px] align-text-bottom">psychology</span> {r.reason}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {aiMatches && aiMatches.length === 0 && allInstructors.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-gray-400 text-sm">No matching instructors found. Try adjusting your preferences.</p>
                  <button onClick={reset} className="mt-4 border border-outline-variant px-6 py-2 rounded-lg text-sm font-medium hover:bg-surface-container">
                    Start New Search
                  </button>
                </div>
              )}

              {/* All Results with Pagination */}
              {allInstructors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4 border-t border-outline-variant pt-stack-lg">
                    <h3 className="text-sm font-bold text-gray-900">
                      All Matching Instructors
                      {loading && (
                        <span className="material-symbols-outlined text-primary animate-spin text-[18px] ml-2 inline-block align-middle">refresh</span>
                      )}
                    </h3>
                    <span className="text-xs text-gray-500">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                    {allInstructors.filter((i) => !i.is_verified).map((inst) => (
                      <div key={inst.id} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(15,23,42,0.08)] hover:shadow-[0px_10px_25px_rgba(15,23,42,0.12)] transition-all duration-300 border border-transparent hover:border-outline-variant flex flex-col group">
                        <div className="relative h-40 w-full bg-surface-container">
                          {inst.profile_photo_url ? (
                            <img src={inst.profile_photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-outline">
                              <span className="material-symbols-outlined text-[40px]">person</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                          <div className="flex items-center gap-1.5 mb-1">
                            <h3 className="text-sm font-bold text-gray-900">{inst.first_name} {inst.last_name}</h3>
                            {inst.is_verified && (
                              <span className="material-symbols-outlined text-primary text-[16px] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mb-1">
                            <span className="material-symbols-outlined text-[14px] align-text-bottom">location_on</span> {inst.suburb}, {inst.state}
                          </p>
                          {inst.hourly_rate && (
                            <p className="text-sm font-bold text-[#064E3B] mb-3">${inst.hourly_rate}/hr</p>
                          )}
                          <div className="mt-auto">
                            <Link
                              href={`/instructors/${inst.suburb.toLowerCase().replace(/\s+/g, '-')}/${inst.slug}`}
                              className="w-full text-xs font-semibold text-gray-500 border border-outline-variant px-3 py-2 rounded-lg hover:border-primary hover:text-[#064E3B] transition-colors text-center block"
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
                <button onClick={reset} className="text-sm font-medium text-gray-500 hover:text-[#064E3B] transition-colors flex items-center justify-center gap-2 mx-auto">
                  <span className="material-symbols-outlined">restart_alt</span> Start New Search
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
      <section className="w-full max-w-lg bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(15,23,42,0.08)] p-5 md:p-8 relative z-10 fade-in">
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Step {step + 1} of {QUESTIONS.length}</span>
            <span className="text-xs font-semibold text-[#064E3B] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">psychology</span> AI Assisting
            </span>
          </div>
          <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}></div>
          </div>
        </div>

        <h1 className="text-lg font-bold text-gray-900 mb-3">Help me find the right instructor.</h1>
        <p className="text-sm text-gray-500 mb-6">{current.label}</p>

        {current.type === 'text' && (
          <div className="relative mb-6">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">location_on</span>
            <input
              type="text"
              placeholder={current.placeholder}
              value={answers[current.id] || ''}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-outline-variant rounded-lg text-sm text-gray-900 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
              autoFocus
            />
          </div>
        )}

        {current.type === 'choice' && (
          <div className="space-y-2 mb-6">
            {current.options!.map((opt) => (
              <button
                key={opt}
                onClick={() => setAnswer(opt)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm ${
                  answers[current.id] === opt
                    ? 'border-primary bg-primary/10 text-[#064E3B] font-bold'
                    : 'border-outline-variant text-gray-500 hover:border-primary hover:text-gray-900'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-surface-container">
          <button onClick={handlePrev} disabled={step === 0} className="text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-30">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
          </button>
          <button onClick={handleNext} disabled={!answers[current.id]} className="text-sm font-semibold bg-primary text-white px-6 py-2.5 rounded-xl hover:brightness-110 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
            {step === QUESTIONS.length - 1 ? (
              <>Find My Match <span className="material-symbols-outlined">auto_awesome</span></>
            ) : (
              <>Next <span className="material-symbols-outlined">arrow_forward</span></>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
