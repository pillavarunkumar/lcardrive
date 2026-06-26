'use client';

import { useState } from 'react';
import type { Instructor, Review } from '@/types';
import { getAvatarUrl } from '@/lib/utils';

interface Props {
  instructor: Instructor | null;
  reviews: Review[];
}

const TABS = ['About', 'Packages', 'Availability', 'Reviews'] as const;
type Tab = (typeof TABS)[number];

export default function InstructorProfileClient({ instructor: propInstructor, reviews }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('About');
  const [copied, setCopied] = useState(false);
  const [instructor] = useState<Instructor | null>(propInstructor);
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
          <span className="material-symbols-outlined text-[48px] text-gray-300 mb-4">error_outline</span>
          <p className="text-sm text-gray-500">Instructor not found.</p>
        </div>
      </div>
    );
  }

  const displayRatings = [
    { label: 'Patience', value: instructor.avg_rating_patience },
    { label: 'Communication', value: instructor.avg_rating_communication },
    { label: 'Value', value: instructor.avg_rating_value },
    { label: 'Punctuality', value: instructor.avg_rating_punctuality },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#064E3B] to-[#047857] rounded-2xl overflow-hidden mb-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0">
            <img src={getAvatarUrl(instructor)} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white truncate">{instructor.first_name} {instructor.last_name}</h1>
              {instructor.is_verified && (
                <span className="flex items-center gap-1 text-xs font-semibold text-white bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  Verified
                </span>
              )}
            </div>
            <p className="text-white/80 text-base mt-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-lg">location_on</span>
              {instructor.suburb}, {instructor.state}{instructor.postcode ? ` ${instructor.postcode}` : ''}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className="material-symbols-outlined text-xl text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {i <= Math.round(instructor.average_rating) ? 'star' : i - 0.5 <= instructor.average_rating ? 'star_half' : 'star'}
                    </span>
                  ))}
                </div>
                <span className="text-white font-bold text-lg ml-1">{instructor.average_rating.toFixed(1)}</span>
                <span className="text-white/60 text-sm">({instructor.review_count} reviews)</span>
              </div>
            </div>
            {instructor.bio && (
              <p className="text-white/70 text-sm mt-2 line-clamp-2 max-w-2xl">{instructor.bio}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-4">
              <button className="bg-white text-[#064E3B] text-base font-semibold px-6 py-2.5 rounded-xl hover:bg-white/90 transition-all flex items-center gap-2 shadow-md">
                <span className="material-symbols-outlined text-xl">mail</span>
                Contact {instructor.first_name}
              </button>
              <button onClick={copyLink} className="bg-white/10 text-white text-base font-semibold px-5 py-2.5 rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 backdrop-blur-sm border border-white/20">
                <span className="material-symbols-outlined text-xl">share</span>
                {copied ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-x-8 gap-y-3 bg-white/10 rounded-xl p-5 backdrop-blur-sm border border-white/10 shrink-0">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">${instructor.hourly_rate}</p>
              <p className="text-xs text-white/60 uppercase tracking-wider mt-0.5">per hour</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{instructor.years_experience || 0}y</p>
              <p className="text-xs text-white/60 uppercase tracking-wider mt-0.5">experience</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{instructor.review_count}</p>
              <p className="text-xs text-white/60 uppercase tracking-wider mt-0.5">reviews</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">82%</p>
              <p className="text-xs text-white/60 uppercase tracking-wider mt-0.5">pass rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row (mobile) */}
      <div className="grid grid-cols-4 gap-3 mb-6 md:hidden">
        {[
          { label: 'Rate', value: `$${instructor.hourly_rate}`, sub: '/hr' },
          { label: 'Experience', value: `${instructor.years_experience || 0}y`, sub: '' },
          { label: 'Reviews', value: instructor.review_count, sub: '' },
          { label: 'Pass Rate', value: '82%', sub: '' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
            <p className="text-lg font-bold text-gray-900">{s.value}<span className="text-xs font-normal text-gray-400">{s.sub}</span></p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tags */}
      {(instructor.transmission || instructor.licence_types?.length || instructor.specialises_anxiety || instructor.accepts_international) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {instructor.licence_types?.map((lt) => (
            <span key={lt} className="bg-[#064E3B]/10 text-[#064E3B] text-sm font-semibold px-4 py-1.5 rounded-lg capitalize">{lt} Licence</span>
          ))}
          {instructor.transmission === 'auto' && <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-1.5 rounded-lg">Automatic</span>}
          {instructor.transmission === 'manual' && <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-1.5 rounded-lg">Manual</span>}
          {instructor.transmission === 'both' && <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-1.5 rounded-lg">Auto & Manual</span>}
          {instructor.specialises_anxiety && <span className="bg-amber-50 text-amber-700 text-sm font-semibold px-4 py-1.5 rounded-lg">Anxiety Friendly</span>}
          {instructor.accepts_international && <span className="bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-lg">Intl. Licence</span>}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* Left Column */}
        <div>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-base font-semibold px-5 py-3 transition-all relative ${
                  activeTab === tab
                    ? 'text-[#064E3B]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#064E3B] rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {/* About Tab */}
            {activeTab === 'About' && (
              <div className="flex flex-col gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[#064E3B] text-2xl">badge</span>
                    <h2 className="text-lg font-bold text-gray-900">About {instructor.first_name}</h2>
                  </div>
                  {instructor.bio && (
                    <p className="text-base text-gray-600 leading-relaxed mb-5">{instructor.bio}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {instructor.teaching_style && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Teaching Style</p>
                        <p className="text-base text-gray-700">{instructor.teaching_style}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Languages</p>
                      <div className="flex flex-wrap gap-1.5">
                        {instructor.languages.map((lang) => (
                          <span key={lang} className="bg-gray-50 text-gray-600 text-sm px-3 py-1.5 rounded-lg border border-gray-100">{lang}</span>
                        ))}
                      </div>
                    </div>
                    {instructor.primary_learner_types && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Focus Areas</p>
                        <p className="text-base text-gray-700">{instructor.primary_learner_types}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Test Centres</p>
                      {instructor.familiar_test_centres?.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {instructor.familiar_test_centres.map((tc) => (
                            <span key={tc} className="bg-gray-50 text-gray-600 text-sm px-3 py-1.5 rounded-lg border border-gray-100">{tc}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-base text-gray-400">No test centres listed</p>
                      )}
                    </div>
                    {instructor.service_suburbs?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Service Areas</p>
                        <p className="text-base text-gray-700">
                          {instructor.service_suburbs.slice(0, 6).join(', ')}
                          {instructor.service_suburbs.length > 6 && <span className="text-[#064E3B] font-semibold"> +{instructor.service_suburbs.length - 6} more</span>}
                        </p>
                        {instructor.service_radius_km && (
                          <p className="text-sm text-gray-400 mt-1">Within {instructor.service_radius_km} km radius</p>
                        )}
                      </div>
                    )}
                    {instructor.adi_registration && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ADI Registration</p>
                        <p className="text-base text-gray-700 font-mono">{instructor.adi_registration}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Packages Tab */}
            {activeTab === 'Packages' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#064E3B] text-2xl">redeem</span>
                  <h2 className="text-lg font-bold text-gray-900">Packages</h2>
                </div>
                {instructor.package_options?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {instructor.package_options.map((pkg, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-4 text-center hover:shadow-md hover:border-[#064E3B]/20 transition-all">
                        <p className="text-2xl font-bold text-gray-900">{pkg.hours}<span className="text-sm font-normal text-gray-400">h</span></p>
                        <p className="text-2xl font-bold text-[#064E3B] mt-1">${pkg.price}</p>
                        <p className="text-sm text-gray-400 mt-1">${(pkg.price / pkg.hours).toFixed(0)}/hr</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-3xl text-gray-300">inventory_2</span>
                    <p className="text-base text-gray-400 mt-2">No packages available</p>
                  </div>
                )}
              </div>
            )}

            {/* Availability Tab */}
            {activeTab === 'Availability' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#064E3B] text-2xl">calendar_month</span>
                  <h2 className="text-lg font-bold text-gray-900">Availability</h2>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                    const d = day.toLowerCase().slice(0, 3);
                    const available = instructor.availability_days.includes(d);
                    return (
                      <div key={day} className={`py-3 rounded-xl text-center text-base font-semibold ${
                        available ? 'bg-[#064E3B] text-white shadow-sm' : 'bg-gray-50 text-gray-300'
                      }`}>
                        <div className="text-xs uppercase opacity-70">{day.slice(0, 2)}</div>
                        <div className="mt-1 text-lg">{available ? '✓' : '—'}</div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-3 italic">Self-reported — contact to confirm availability.</p>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'Reviews' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#064E3B] text-2xl">reviews</span>
                  <h2 className="text-lg font-bold text-gray-900">Reviews</h2>
                  <span className="text-sm text-gray-400 ml-auto">{instructor.review_count} reviews</span>
                </div>

                {/* Sub-ratings */}
                <div className="grid grid-cols-2 gap-3 mb-5 p-4 bg-gray-50 rounded-xl">
                  {displayRatings.map((r) => (
                    <div key={r.label} className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 w-20 shrink-0">{r.label}</span>
                      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#064E3B] rounded-full transition-all" style={{ width: `${(r.value / 5) * 100}%` }} />
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-6 text-right">{r.value.toFixed(1)}</span>
                    </div>
                  ))}
                </div>

                {/* Individual Reviews */}
                {reviews.length === 0 ? (
                  <div className="text-center py-10">
                    <span className="material-symbols-outlined text-3xl text-gray-300">rate_review</span>
                    <p className="text-base text-gray-400 mt-2">No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border border-gray-100 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#064E3B]/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-[#064E3B]">{review.reviewer_name.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{review.reviewer_name}</span>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            review.pass_outcome === 'passed_first' ? 'bg-green-50 text-green-700' :
                            review.pass_outcome === 'passed_retry' ? 'bg-blue-50 text-blue-700' :
                            'bg-gray-50 text-gray-500'
                          }`}>
                            {review.pass_outcome === 'passed_first' ? 'Passed 1st' :
                             review.pass_outcome === 'passed_retry' ? 'Passed' :
                             review.pass_outcome === 'still_learning' ? 'Learning' : 'Not tested'}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 mb-1.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span key={i} className={`material-symbols-outlined text-base ${
                              i <= review.rating_overall ? 'text-yellow-400' : 'text-gray-200'
                            }`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          ))}
                        </div>
                        {review.review_text && <p className="text-sm text-gray-500 leading-relaxed">{review.review_text}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5 lg:mt-[73px]">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#064E3B] to-[#047857] px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-white text-xl">directions_car</span>
                <h3 className="text-base font-bold text-white">Vehicle</h3>
              </div>
            </div>
            <div className="p-5">
              <ul className="space-y-3">
                <li className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Make</span>
                  <span className="text-sm font-semibold text-gray-900">{instructor.vehicle_make || '—'} {instructor.vehicle_model || ''}{instructor.vehicle_year ? ` (${instructor.vehicle_year})` : ''}</span>
                </li>
                <li className="border-t border-gray-50 pt-3 flex justify-between items-center">
                  <span className="text-sm text-gray-400">Transmission</span>
                  <span className="text-sm font-semibold text-gray-900 capitalize">{instructor.transmission === 'both' ? 'Manual' : instructor.transmission || '—'}</span>
                </li>
                <li className="border-t border-gray-50 pt-3 flex justify-between items-center">
                  <span className="text-sm text-gray-400">Duration</span>
                  <span className="text-sm font-semibold text-gray-900">{instructor.lesson_duration_mins || 60} min</span>
                </li>
                {instructor.vehicle_color && (
                  <li className="border-t border-gray-50 pt-3 flex justify-between items-center">
                    <span className="text-sm text-gray-400">Color</span>
                    <span className="text-sm font-semibold text-gray-900">{instructor.vehicle_color}</span>
                  </li>
                )}
                <li className="border-t border-gray-50 pt-3 flex justify-between items-center">
                  <span className="text-sm text-gray-400">Safety</span>
                  <span className="text-sm font-semibold text-green-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Dual Controls
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {(instructor.social_facebook || instructor.social_google_biz) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[#064E3B] text-xl">share</span>
                <h3 className="text-base font-bold text-gray-900">Social</h3>
              </div>
              <div className="flex flex-col gap-2">
                {instructor.social_facebook && (
                  <a href={instructor.social_facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#064E3B] transition-colors py-1">
                    <span className="material-symbols-outlined text-lg text-gray-400">facebook</span>
                    Facebook
                  </a>
                )}
                {instructor.social_google_biz && (
                  <a href={instructor.social_google_biz} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#064E3B] transition-colors py-1">
                    <span className="material-symbols-outlined text-lg text-gray-400">google</span>
                    Google Business
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
