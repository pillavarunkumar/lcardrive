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
              <span className="material-symbols-outlined text-[48px] text-secondary animate-spin mb-4">refresh</span>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Analyzing your preferences...</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Our AI is cross-referencing availability, ratings, and teaching styles.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-stack-lg">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container mb-stack-sm shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  <span className="font-label-sm text-label-sm font-bold">Analysis Complete</span>
                </div>
                <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Our AI matches for you</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  {totalInstructors} instructor{totalInstructors !== 1 ? 's' : ''} found in your area
                </p>
              </div>

              {/* AI Top Picks */}
              {aiMatches && aiMatches.length > 0 && (
                <div className="mb-stack-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Top AI Picks</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                    {aiMatches.map((r) => (
                      <div key={r.name} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(15,23,42,0.08)] hover:shadow-[0px_10px_25px_rgba(15,23,42,0.12)] transition-all duration-300 border border-secondary flex flex-col group">
                        <div className="relative h-48 w-full bg-surface-container">
                          {r.image ? (
                            <img src={r.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-outline">
                              <span className="material-symbols-outlined text-[48px]">person</span>
                            </div>
                          )}
                          {r.verified && (
                            <div className="absolute top-4 left-4 bg-secondary-container text-on-secondary-container px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm">
                              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Verified
                            </div>
                          )}
                        </div>
                        <div className="p-6 flex-grow flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-secondary transition-colors">{r.name}</h3>
                            <div className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded text-sm">
                              <span className="material-symbols-outlined text-tertiary-fixed-dim text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                              <span className="font-label-sm font-bold text-on-surface">{r.rating}</span>
                            </div>
                          </div>
                          <p className="font-body-md text-body-md text-on-surface-variant mb-4">{r.bio}</p>
                          <div className="mt-auto ai-gradient-bg border-l-4 border-secondary rounded-r-lg p-4 mb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="material-symbols-outlined text-secondary text-[16px]">psychology</span>
                              <span className="font-label-sm text-label-sm font-bold text-on-surface">Why this match?</span>
                            </div>
                            <p className="font-label-sm text-label-sm text-on-surface-variant">{r.reason}</p>
                          </div>
                          <Link
                            href={`/instructors/${r.suburb.toLowerCase().replace(/\s+/g, '-')}/${r.slug}`}
                            className="w-full font-label-md text-label-md text-secondary border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-on-secondary transition-colors text-center block"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aiMatches && aiMatches.length === 0 && allInstructors.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-outline text-lg font-body">No matching instructors found. Try adjusting your preferences.</p>
                  <button onClick={reset} className="mt-4 border border-outline-variant px-6 py-2 rounded-lg font-label-md text-label-md hover:bg-surface-container">
                    Start New Search
                  </button>
                </div>
              )}

              {/* All Results with Pagination */}
              {allInstructors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4 border-t border-outline-variant pt-stack-lg">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      All Matching Instructors
                      {loading && (
                        <span className="material-symbols-outlined text-secondary animate-spin text-[18px] ml-2 inline-block align-middle">refresh</span>
                      )}
                    </h3>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                    {allInstructors.map((inst) => (
                      <div key={inst.id} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(15,23,42,0.08)] hover:shadow-[0px_10px_25px_rgba(15,23,42,0.12)] transition-all duration-300 border border-transparent hover:border-outline-variant flex flex-col group">
                        <div className="relative h-40 w-full bg-surface-container">
                          {inst.profile_photo_url ? (
                            <img src={inst.profile_photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-outline">
                              <span className="material-symbols-outlined text-[40px]">person</span>
                            </div>
                          )}
                          {inst.is_verified && (
                            <div className="absolute top-3 left-3 bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 shadow-sm">
                              <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Verified
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-headline-sm text-headline-sm text-on-surface">{inst.first_name} {inst.last_name}</h3>
                            <div className="flex items-center gap-1 bg-surface-container px-1.5 py-0.5 rounded text-xs">
                              <span className="material-symbols-outlined text-tertiary-fixed-dim text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                              <span className="font-label-sm font-bold text-on-surface">{inst.average_rating}</span>
                            </div>
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mb-1">
                            <span className="material-symbols-outlined text-[14px] align-text-bottom">location_on</span> {inst.suburb}, {inst.state}
                          </p>
                          {inst.hourly_rate && (
                            <p className="font-label-md text-label-md font-bold text-secondary mb-3">${inst.hourly_rate}/hr</p>
                          )}
                          <div className="mt-auto">
                            <Link
                              href={`/instructors/${inst.suburb.toLowerCase().replace(/\s+/g, '-')}/${inst.slug}`}
                              className="w-full font-label-sm text-label-sm text-on-surface-variant border border-outline-variant px-3 py-2 rounded-lg hover:border-secondary hover:text-secondary transition-colors text-center block"
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
                <button onClick={reset} className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors flex items-center justify-center gap-2 mx-auto">
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
    <div className="flex-grow flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop py-stack-lg w-full relative overflow-hidden">
      <section className="w-full max-w-2xl bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(15,23,42,0.08)] p-6 md:p-12 relative z-10 fade-in">
        <div className="mb-stack-lg">
          <div className="flex justify-between items-end mb-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Step {step + 1} of {QUESTIONS.length}</span>
            <span className="font-label-sm text-label-sm text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">psychology</span> AI Assisting
            </span>
          </div>
          <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-secondary rounded-full" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}></div>
          </div>
        </div>

        <h1 className="font-display-lg text-display-lg text-on-surface mb-stack-md">Help me find the right instructor.</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-lg">{current.label}</p>

        {current.type === 'text' && (
          <div className="relative mb-stack-lg">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">location_on</span>
            <input
              type="text"
              placeholder={current.placeholder}
              value={answers[current.id] || ''}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-outline-variant rounded-lg font-body-lg text-body-lg text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all shadow-sm"
              autoFocus
            />
          </div>
        )}

        {current.type === 'choice' && (
          <div className="space-y-3 mb-stack-lg">
            {current.options!.map((opt) => (
              <button
                key={opt}
                onClick={() => setAnswer(opt)}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                  answers[current.id] === opt
                    ? 'border-secondary bg-surface-container text-on-surface font-semibold'
                    : 'border-outline-variant text-on-surface-variant hover:border-secondary'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center pt-stack-sm border-t border-surface-container">
          <button onClick={handlePrev} disabled={step === 0} className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-30">
            <span className="material-symbols-outlined">arrow_back</span> Back
          </button>
          <button onClick={handleNext} disabled={!answers[current.id]} className="font-label-md text-label-md bg-secondary text-on-secondary px-8 py-3 rounded-lg hover:brightness-110 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
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
