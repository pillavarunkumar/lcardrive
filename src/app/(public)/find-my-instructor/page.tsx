'use client';

import { useState } from 'react';

const QUESTIONS = [
  { id: 'suburb', label: 'To start, where are you looking to take your driving lessons?', type: 'text', placeholder: 'e.g. Suburb, City, or Zip Code' },
  { id: 'transmission', label: 'Automatic or manual?', type: 'choice', options: ['Automatic', 'Manual', 'No preference'] },
  { id: 'special_needs', label: 'Any special needs or preferences?', type: 'choice', options: ['Anxiety / nervous driver', 'ADHD', 'International licence conversion', 'None of the above'] },
  { id: 'available_days', label: 'Which days suit you best?', type: 'choice', options: ['Weekdays', 'Weekends', 'Both'] },
  { id: 'budget', label: 'What\'s your max budget per hour?', type: 'choice', options: ['$40\u2013$50', '$50\u2013$65', '$65\u2013$80', '$80+'] },
];

const MOCK_RESULTS = [
  {
    name: 'Sarah Jenkins',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjn4P8CPlpFlG4bJtZD__yU2iUrU7cMYULp79oEYqpiSTlGEc2VYrYomKZGkbCrbwpzaR87ejTKIKS-YhwMSoWuZiIc4qKLfLEgyuG9cNCvBjy55hqJCIMjU8oYz_N3psxreLfuBha3nS0dQ3nSiDqXhcQvvTwkJXH-JiKjowe5kp32iXfV9AKgVB0wxDA8-QoCXF_Li6LCK4zrC3jJQk9hIa8fPUIKJGmRdZA2ytjSxZ95blKyDmmP58qu-cAH2Zti-ZIdcEt',
    rating: 4.9, reviews: 128,
    bio: 'Patient & encouraging. Specializes in nervous learners and test preparation.',
    reason: 'Highly rated for nervous beginners in your suburb. Uses modern dual-control automatic vehicles.',
    verified: true,
  },
  {
    name: 'David Chen',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQQe7a1M0XsLO4ixRLQpbxSJLkFKkJ19d-rtiDC7r9hHsCFJapoUZqQbszAkFz5KGglxUSn9hDDKgDkz6Yra2-DAP9BobPgT1WvwrFJO3QS9Dt6qJNJvltHSuDUQrG_GFNqcsy3R6UyzXoliGIPicIrAXykBwFAUrGUle6YX2Pwrqodsl_rMus2J0GGA9oxh9IFxMm1-rZuSie_hWr-dD2mrhOrdN40B9hm27_rgBY6EV3rlzlwusZTedP_zut8YDPwSDANh_6',
    rating: 5.0, reviews: 84,
    bio: 'Structured methodology. Focuses on defensive driving and city navigation.',
    reason: 'Perfect for your requested weekend availability. Over 10 years of incident-free instruction history.',
    verified: true,
  },
  {
    name: 'Emma Roberts',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKRAeJo9wtWQRHXNWrlBMZkpiz2fQKPaidnWsDpq_vkgw8JgrBIiFInquBcs4XR35xxc1pwjgzN065-YuNHiFJhizr2FHRmF_R538WlN0bMJaKLcc2y9OIp8pZK9ZKsg-un9risuM8H8vl4CbEJyJMpxA9s2p5goBhfwan5oBequvo9dUMgKxFDOIEyNJo7ADgKIxTLrPYOkn0peXmsXY0hhePL1SHO6NLoRqHKK9qUoIteio6AuA2q4u5QqQ7K0w7x1wYQULo',
    rating: 4.8, reviews: 96,
    bio: 'Energetic and clear communicator. Manual and Automatic transmission certified.',
    reason: 'Strong track record of first-time pass rates in your area. Matches your preference for evening lessons.',
    verified: false,
    limitedSpots: true,
  },
];

export default function FindMyInstructorPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<typeof MOCK_RESULTS | null>(null);
  const [loading, setLoading] = useState(false);

  const current = QUESTIONS[step];

  const setAnswer = (value: string) => setAnswers((prev) => ({ ...prev, [current.id]: value }));

  const handleNext = () => {
    if (step < QUESTIONS.length - 1) setStep((s) => s + 1);
    else {
      setLoading(true);
      setTimeout(() => { setResults(MOCK_RESULTS); setLoading(false); }, 1200);
    }
  };

  const handlePrev = () => { if (step > 0) setStep((s) => s - 1); };
  const reset = () => { setStep(0); setAnswers({}); setResults(null); };

  if (results) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop py-stack-lg w-full relative overflow-hidden">
        <section className="w-full max-w-container-max z-10 fade-in">
          <div className="text-center mb-stack-lg">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container mb-stack-sm shadow-sm">
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              <span className="font-label-sm text-label-sm font-bold">Analysis Complete</span>
            </div>
            <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Our AI matches for you</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Based on your location and learning style preferences.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {results.map((r) => (
              <div key={r.name} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(15,23,42,0.08)] hover:shadow-[0px_10px_25px_rgba(15,23,42,0.12)] transition-all duration-300 border border-transparent hover:border-secondary flex flex-col group">
                <div className="relative h-48 w-full bg-surface-container">
                  <img src={r.image} alt="" className="w-full h-full object-cover" />
                  {r.verified && (
                    <div className="absolute top-4 left-4 bg-secondary-container text-on-secondary-container px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Verified
                    </div>
                  )}
                  {r.limitedSpots && (
                    <div className="absolute top-4 left-4 bg-tertiary-fixed text-on-tertiary-fixed-variant px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined text-[14px]">local_fire_department</span> Limited Spots
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
                  <button className="w-full font-label-md text-label-md text-secondary border border-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-on-secondary transition-colors text-center">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-stack-lg text-center">
            <button onClick={reset} className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors flex items-center justify-center gap-2 mx-auto">
              <span className="material-symbols-outlined">restart_alt</span> Start New Search
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop py-stack-lg w-full relative overflow-hidden">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 z-10">
          <span className="material-symbols-outlined text-[48px] text-secondary animate-spin mb-4">refresh</span>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Analyzing your preferences...</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Our AI is cross-referencing availability, ratings, and teaching styles.</p>
        </div>
      ) : (
        <section className="w-full max-w-2xl bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(15,23,42,0.08)] p-6 md:p-12 relative z-10 fade-in">
          {/* Progress Header */}
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

          {/* Question */}
          <h1 className="font-display-lg text-display-lg text-on-surface mb-stack-md">Help me find the right instructor.</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-lg">{current.label}</p>

          {/* Input Area */}
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

          {/* Actions */}
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
      )}
    </div>
  );
}
