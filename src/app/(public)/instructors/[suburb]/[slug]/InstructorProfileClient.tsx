'use client';

import { useState } from 'react';
import type { Instructor, Review } from '@/types';
import { getAvatarUrl } from '@/lib/utils';

interface Props {
  instructor: Instructor | null;
  reviews: Review[];
}

const TABS = ['About', 'Availability', 'Reviews'] as const;

export default function InstructorProfileClient({ instructor: propInstructor, reviews }: Props) {
  const [activeTab, setActiveTab] = useState<string>('About');
  const [copied, setCopied] = useState(false);
  const [instructor, setInstructor] = useState<Instructor | null>(propInstructor);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!instructor) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-outline mb-4">error_outline</span>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Instructor not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-md flex flex-col gap-stack-lg">
      {/* Profile Header — Glass Card */}
      <section className="glass-card rounded-2xl p-6 md:p-10 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-primary/5 blur-3xl rounded-full"></div>
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden flex-shrink-0 border-4 border-white z-10 shadow-xl">
          <img src={getAvatarUrl(instructor)} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col flex-grow z-10">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">{instructor.first_name} {instructor.last_name}</h1>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1 font-label-sm text-label-sm border border-primary/20">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              Verified Instructor
            </span>
          </div>
          <p className="font-body-lg text-body-lg text-on-surface-variant flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[20px]">location_on</span>
            {instructor.suburb}, {instructor.state}
          </p>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-[#fbbf24]">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {i <= Math.round(instructor.average_rating) ? 'star' : i - 0.5 <= instructor.average_rating ? 'star_half' : 'star'}
                </span>
              ))}
            </div>
            <span className="font-headline-sm text-headline-sm text-on-surface">{instructor.average_rating.toFixed(1)}</span>
            <span className="font-body-md text-body-md text-on-surface-variant">({instructor.review_count} Reviews)</span>
          </div>
          <div className="flex flex-wrap gap-4 mt-auto">
            <button className="bg-primary text-white font-label-md text-label-md px-8 py-3 rounded-xl hover:opacity-90 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
              <span className="material-symbols-outlined">mail</span>
              Contact Instructor
            </button>
            <button onClick={copyLink} className="border-2 border-primary text-primary rounded-xl hover:bg-primary/5 font-label-md text-label-md px-6 py-3 flex items-center gap-2">
              <span className="material-symbols-outlined">share</span>
              {copied ? 'Copied!' : 'Share Profile'}
            </button>
          </div>
        </div>
        {/* Quick Stats - Desktop */}
        <div className="hidden lg:flex flex-col gap-4 min-w-[200px] border-l border-outline-variant pl-8 z-10">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Experience</p>
            <p className="font-headline-md text-headline-md text-on-surface">{instructor.years_experience} Years</p>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">ADI Registration</p>
            <p className="font-headline-sm text-headline-sm text-on-surface font-mono">{instructor.adi_registration || '#9482751'}</p>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Pass Rate</p>
            <p className="font-headline-sm text-headline-sm text-primary">82%</p>
          </div>
        </div>
      </section>

      {/* Main Content Area: Bento Layout */}
      <div className="bento-grid">
        {/* Left Column: Tabs & Main Info */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-stack-md">
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto hide-scrollbar border-b border-outline-variant gap-8">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-label-md text-label-md pb-3 px-1 whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-on-surface'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'About' && (
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">About {instructor.first_name}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">{instructor.bio}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">Teaching Style</h3>
                  <ul className="flex flex-col gap-2">
                    {[
                      'Patient & Calm Approach',
                      'Anxiety Specialist',
                      'Mock Test Focused',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 font-body-md text-body-md text-on-surface">
                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-3">Languages Spoken</h3>
                  <div className="flex gap-2 flex-wrap">
                    {instructor.languages.map((lang) => (
                      <span key={lang} className="px-3 py-1 bg-surface-container rounded-md font-label-sm text-label-sm text-on-surface">{lang}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Availability' && (
            <div className="glass-card rounded-xl p-6">
              <div className="flex flex-wrap gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                  const d = day.toLowerCase().slice(0, 3);
                  const available = instructor.availability_days.includes(d);
                  return (
                    <div key={day} className={`px-4 py-2 rounded-lg text-sm font-bold ${
                      available ? 'bg-primary text-white' : 'bg-surface-container-low text-outline'
                    }`}>
                      {day}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-outline mt-4">* Self-reported availability. Contact instructor to confirm specific times.</p>
            </div>
          )}

          {activeTab === 'Reviews' && (
            <div className="glass-card rounded-xl p-6 space-y-8">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: 'Patience', value: instructor.avg_rating_patience },
                  { label: 'Communication', value: instructor.avg_rating_communication },
                  { label: 'Value for Money', value: instructor.avg_rating_value },
                  { label: 'Punctuality', value: instructor.avg_rating_punctuality },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-3">
                    <span className="text-sm text-on-surface-variant w-24 shrink-0">{r.label}</span>
                    <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(r.value / 5) * 100}%` }} />
                    </div>
                    <span className="text-sm font-bold text-on-surface w-6">{r.value.toFixed(1)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-outline-variant rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-on-surface">{review.reviewer_name}</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span key={i} className={`material-symbols-outlined text-sm ${
                            i <= review.rating_overall ? 'text-[#fbbf24]' : 'text-outline-variant'
                          }`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-on-surface-variant mb-2">{review.review_text}</p>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-semibold">
                      {review.pass_outcome === 'passed_first' ? 'Passed first attempt' : review.pass_outcome === 'passed_retry' ? 'Passed after retries' : review.pass_outcome === 'still_learning' ? 'Still learning' : 'Not yet tested'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Vehicle & Quick Booking */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-stack-md">
          {/* Vehicle Card */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="h-32 bg-surface-container-high relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5"></div>
              <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[48px] text-on-surface-variant opacity-20">directions_car</span>
            </div>
            <div className="p-5">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Training Vehicle</h3>
              <ul className="flex flex-col gap-3">
                <li className="flex justify-between items-center border-b border-outline-variant pb-2">
                  <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">commute</span> Make
                  </span>
                  <span className="font-label-md text-label-md text-on-surface">{instructor.vehicle_make} {instructor.vehicle_model} ({instructor.vehicle_year})</span>
                </li>
                <li className="flex justify-between items-center border-b border-outline-variant pb-2">
                  <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">settings</span> Transmission
                  </span>
                  <span className="font-label-md text-label-md text-on-surface capitalize">{instructor.transmission === 'both' ? 'Manual' : instructor.transmission}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">health_and_safety</span> Safety
                  </span>
                  <span className="font-label-md text-label-md text-on-surface flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary"></span> Dual Controls
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
