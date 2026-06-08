'use client';

import { useState } from 'react';
import type { Instructor, Review } from '@/types';

const MOCK_INSTRUCTOR: Instructor = {
  id: '1', slug: 'sarah-m-footscray', first_name: 'Sarah', last_name: 'Mitchell', email: 'sarah@example.com', phone: '0400 123 456',
  suburb: 'Footscray', state: 'VIC', postcode: '3011',
  bio: 'I specialize in helping nervous drivers build confidence behind the wheel. With a background in teaching before becoming an ADI, I understand that everyone learns at their own pace. My lessons are structured, patient, and tailored entirely to your learning style.',
  hourly_rate: 75, transmission: 'both', licence_types: ['car'], specialises_anxiety: true, accepts_international: true,
  familiar_test_centres: ['Sunshine', 'Moorabbin'], languages: ['English', 'Spanish'], years_experience: 8, is_verified: true, is_claimed: true,
  profile_completeness: 90, service_suburbs: ['Footscray', 'Sunshine', 'Yarraville', 'Seddon', 'Kingsville'], service_radius_km: 10,
  dual_controls: true, vehicle_make: 'Toyota', vehicle_model: 'Yaris', vehicle_year: 2022,
  availability_days: ['mon', 'tue', 'wed', 'thu', 'fri'], average_rating: 4.8, review_count: 124,
  avg_rating_patience: 4.9, avg_rating_communication: 4.8, avg_rating_value: 4.7, avg_rating_punctuality: 4.9,
  social_facebook: 'https://facebook.com/sarahmitchell',
  package_options: [{ hours: 5, price: 300, label: '5-Hour Pack' }, { hours: 10, price: 580, label: '10-Hour Pack' }],
  profile_photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeenRA5958koQ54BRpXYDFWK382hdfEwy-j5Cfo4nK5bKhWcw-jqOz5NAwzK15TafyRrIYfjU69kYqscjrcFdQF04glvkKRWpyoqqHypncdS29oha_xrFoYctpF3muVODXsmzRTH-08hVHxGRTtCVjGl2FKhufSP7tmp4-7q6n9uLyEysj65fBBtTZbu7bLstM_hAQ8phHdY0F5qfnDzsh2UobfDmEdyoLYZyV7b68x3qnpitylw4M_diNC8Zm7TANptQ8moo_',
  created_at: '2026-01-15', updated_at: '2026-05-20',
};

const MOCK_REVIEWS: Review[] = [
  { id: 'r1', instructor_id: '1', reviewer_name: 'Tom', reviewer_email: 'tom@example.com', rating_overall: 5, rating_patience: 5, rating_communication: 5, rating_value: 4, rating_punctuality: 5, pass_outcome: 'passed_first', review_text: 'Sarah is amazing. I was really nervous but she made me feel so calm. Passed first go!', is_approved: true, created_at: '2026-04-15' },
  { id: 'r2', instructor_id: '1', reviewer_name: 'Mia', reviewer_email: 'mia@example.com', rating_overall: 5, rating_patience: 5, rating_communication: 4, rating_value: 5, rating_punctuality: 5, pass_outcome: 'passed_first', review_text: 'Best driving instructor in Footscray! Very patient and explains everything clearly.', is_approved: true, created_at: '2026-03-20' },
  { id: 'r3', instructor_id: '1', reviewer_name: 'Jake', reviewer_email: 'jake@example.com', rating_overall: 4, rating_patience: 4, rating_communication: 5, rating_value: 4, rating_punctuality: 5, pass_outcome: 'passed_retry', review_text: 'Great instructor. Helped me fix my mistakes and I passed on my second attempt.', is_approved: true, created_at: '2026-02-10' },
];

const TABS = ['About', 'Availability', 'Reviews'] as const;

export default function InstructorProfileClient() {
  const [activeTab, setActiveTab] = useState<string>('About');
  const [copied, setCopied] = useState(false);
  const instructor = MOCK_INSTRUCTOR;
  const reviews = MOCK_REVIEWS;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-md flex flex-col gap-stack-lg">
      {/* Profile Header — Glass Card */}
      <section className="glass-card rounded-xl p-6 md:p-10 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-fixed-dim opacity-20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden flex-shrink-0 border-4 border-surface z-10 shadow-lg">
          {instructor.profile_photo_url ? (
            <img src={instructor.profile_photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl font-display font-bold text-on-surface-variant">
              {instructor.first_name[0]}{instructor.last_name[0]}
            </div>
          )}
        </div>
        <div className="flex flex-col flex-grow z-10">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">{instructor.first_name} {instructor.last_name}</h1>
            <span className="bg-[#e6f4ea] text-secondary px-3 py-1 rounded-full flex items-center gap-1 font-label-sm text-label-sm border border-secondary/20">
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
            <button className="bg-secondary text-on-secondary font-label-md text-label-md px-8 py-3 rounded-full hover:brightness-110 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
              <span className="material-symbols-outlined">mail</span>
              Contact Instructor
            </button>
            <button onClick={copyLink} className="bg-surface text-primary border border-outline font-label-md text-label-md px-6 py-3 rounded-full hover:bg-surface-container-low transition-colors flex items-center gap-2">
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
            <p className="font-headline-sm text-headline-sm text-secondary">82%</p>
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
                  activeTab === tab ? 'text-secondary border-secondary' : 'text-on-surface-variant border-transparent hover:text-on-surface'
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
                        <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
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
                      available ? 'bg-secondary text-white' : 'bg-surface-container-low text-outline'
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
                      <div className="h-full bg-secondary rounded-full" style={{ width: `${(r.value / 5) * 100}%` }} />
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
                    <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-xs font-semibold">
                      {review.pass_outcome === 'passed_first' ? 'Passed first attempt' : 'Passed after retries'}
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
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-primary/5"></div>
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
                    <span className="w-2 h-2 rounded-full bg-secondary"></span> Dual Controls
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
