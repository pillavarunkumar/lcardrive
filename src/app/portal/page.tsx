'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, Eye, Pencil, DollarSign, Calendar, Sparkles, ChevronRight, MessageSquare, TrendingUp } from 'lucide-react';
import type { Instructor } from '@/types';

function getNextProfileStep(instructor: Instructor | null, comp: number = 0, hasPendingReview?: boolean) {
  if (!instructor) {
    return {
      href: '/portal/profile',
      icon: 'person_add',
      label: 'Create your profile',
      helper: 'A complete profile increases trust and bookings.',
      action: 'link' as const,
    };
  }

  if (!instructor.bio) {
    return {
      href: '/portal/profile',
      icon: 'edit_note',
      label: 'Add your bio',
      helper: 'Describe your teaching style and experience.',
      action: 'link' as const,
    };
  }

  if (!instructor.vehicle_make || !instructor.vehicle_model || !instructor.vehicle_year) {
    return {
      href: '/portal/vehicle',
      icon: 'directions_car',
      label: 'Add vehicle details',
      helper: 'Show students what they will be learning in.',
      action: 'link' as const,
    };
  }

  if (!instructor.hourly_rate) {
    return {
      href: '/portal/rates',
      icon: 'payments',
      label: 'Set your pricing',
      helper: 'Publish your hourly rate and lesson packages.',
      action: 'link' as const,
    };
  }

  if (!instructor.availability_days?.length) {
    return {
      href: '/portal/availability',
      icon: 'event_available',
      label: 'Set availability',
      helper: 'Let students know when you usually teach.',
      action: 'link' as const,
    };
  }

  if (!instructor.service_suburbs?.length) {
    return {
      href: '/portal/service-areas',
      icon: 'map',
      label: 'Add service areas',
      helper: 'Choose the suburbs where students can find you.',
      action: 'link' as const,
    };
  }

  if (comp < 100) {
    return {
      href: '/portal/profile',
      icon: 'edit_note',
      label: 'Complete your profile',
      helper: 'Add optional details like your photo, specialisations, and experience to reach 100%.',
      action: 'link' as const,
    };
  }

  if (!hasPendingReview && !instructor?.is_verified) {
    return {
      href: '',
      icon: 'verified',
      label: 'Submit for Review',
      helper: 'Submit your completed profile for admin approval.',
      action: 'submit' as const,
    };
  }

  return {
    href: '/portal/profile',
    icon: 'verified',
    label: 'Review your profile',
    helper: 'Keep your public listing accurate and up to date.',
    action: 'link' as const,
  };
}

function getVerificationCopy(instructor: Instructor | null, hasPendingReview: boolean) {
  if (instructor?.is_verified) {
    return { label: 'Verified', body: 'Your profile is approved and visible to students.' };
  }
  if (hasPendingReview) {
    return { label: 'Under Review', body: 'Admin is reviewing your submitted profile.' };
  }
  return { label: 'Pending', body: 'Complete your profile and submit for admin review.' };
}

export default function PortalDashboard() {
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [hasPendingReview, setHasPendingReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [appearanceLabels, setAppearanceLabels] = useState<string[]>([]);
  const [appearanceTotals, setAppearanceTotals] = useState<number[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/profile').then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Failed to load dashboard');
        return data;
      }),
      fetch('/api/portal/analytics/appearances').then(r => r.json()).catch(() => ({ days: [], totals: [] })),
    ])
      .then(([profileData, analytics]) => {
        if (profileData.instructor) setInstructor(profileData.instructor);
        if (profileData.hasPendingReview) setHasPendingReview(true);
        if (analytics.days?.length) {
          setAppearanceLabels(analytics.days);
          setAppearanceTotals(analytics.totals);
        }
      })
      .catch((err) => setLoadError(err.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const comp = instructor?.profile_completeness ?? 0;
  const totalReviews = instructor?.review_count ?? 0;
  const avgRating = instructor?.average_rating ?? 0;
  const nextStep = getNextProfileStep(instructor, comp, hasPendingReview);
  const verification = getVerificationCopy(instructor, hasPendingReview);

  const [submitting, setSubmitting] = useState(false);

  const submitForReview = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/portal/submit-review', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setHasPendingReview(true);
      } else {
        alert(data.error || 'Failed to submit for review.');
      }
    } catch {
      alert('Failed to submit for review.');
    } finally {
      setSubmitting(false);
    }
  };

  const ringRadius = 67;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = !loading ? ringCircumference * (1 - comp / 100) : 0;
  const progressColor = !loading
    ? comp <= 24 ? '#EF4444'
      : comp <= 49 ? '#F59E0B'
        : comp <= 74 ? '#3B82F6'
          : '#22C55E'
    : '#3B82F6';

  return (
    <>
      {loadError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-[20px] p-4 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">

        {/* Profile Completion */}
        <section className="lg:col-span-4 bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm p-5 relative hover:shadow-md transition-shadow duration-200">
            {!loading && verification.label && (
              <div className={`absolute top-5 right-5 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium ${
                verification.label === 'Verified'
                  ? 'bg-green-50 text-green-700'
                  : verification.label === 'Under Review'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-red-50 text-red-700 animate-pulse'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  verification.label === 'Verified' ? 'bg-green-500'
                  : verification.label === 'Under Review' ? 'bg-amber-500'
                  : 'bg-red-500'
                }`} />
                {verification.label}
              </div>
            )}
            <div className="flex items-center gap-6">
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
                  <circle cx="72" cy="72" r="62" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                  {!loading && (
                    <circle
                      cx="72" cy="72" r="62"
                      fill="none"
                      stroke={progressColor}
                      strokeWidth="10"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringOffset}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <span className="text-xl font-bold" style={{ color: loading ? '#111827' : progressColor }}>
                      {loading ? '--' : `${comp}%`}
                    </span>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Complete</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[22px] font-bold text-gray-900 mb-1.5">
                  {comp >= 100 ? 'Your Profile Is Complete' : 'Complete Your Profile'}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Keep your profile accurate so students can understand your services, pricing, vehicle, and availability.
                </p>
                {nextStep.action === 'submit' ? (
                  <button
                    onClick={submitForReview}
                    disabled={submitting}
                    className="inline-flex items-center h-10 px-5 bg-[#064E3B] text-white text-sm font-medium rounded-xl hover:bg-[#053A2C] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : nextStep.label}
                  </button>
                ) : (
                  <Link
                    href={nextStep.href}
                    className="inline-flex items-center h-10 px-5 bg-[#064E3B] text-white text-sm font-medium rounded-xl hover:bg-[#053A2C] transition-colors duration-200"
                  >
                    {nextStep.label}
                  </Link>
                )}
                <p className="mt-2 text-xs text-gray-400">{nextStep.helper}</p>
              </div>
            </div>
          </section>

        {/* Left Column */}
        <div className="lg:col-span-3 space-y-6">

          {/* Stats */}
          <section className="grid grid-cols-3 gap-5">
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-[#64748B] shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </div>
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Profile Checklist</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 leading-none">{loading ? '--' : `${comp}%`}</span>
              <span className="block text-xs text-gray-400 mt-1.5">
                {comp < 100 ? `${6 - Math.ceil(comp / 20)} steps remaining` : 'All steps completed'}
              </span>
            </div>

            <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-[#64748B] shrink-0">
                  <Star className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Average Rating</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 leading-none">
                {loading ? '--' : avgRating > 0 ? avgRating.toFixed(1) : '-'}
              </span>
              <span className="block text-xs text-gray-400 mt-1.5">
                {avgRating > 0 ? `${avgRating.toFixed(1)} / 5.0` : 'No rating yet'}
              </span>
            </div>

            <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-[#64748B] shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Total Reviews</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 leading-none">{loading ? '--' : totalReviews}</span>
              <span className="block text-xs text-gray-400 mt-1.5">
                {totalReviews === 0 ? 'No reviews yet' : `${totalReviews} review${totalReviews !== 1 ? 's' : ''}`}
              </span>
            </div>

          </section>

          {/* Analytics */}
          <section className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Search Appearances</h3>
                <p className="text-xs text-gray-500 mt-0.5">Appearances in search results over the last 7 days</p>
              </div>
            </div>

            {!instructor || appearanceTotals.length === 0 ? (
              <div className="h-48 rounded-2xl border border-dashed border-[#E5E7EB] bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-[#64748B]">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">No data available yet</h4>
                  <p className="text-xs text-gray-400 mt-1">Analytics will appear once your profile is live.</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-end gap-2 h-48">
                  {appearanceTotals.map((h, i) => {
                    const maxVal = Math.max(...appearanceTotals, 1);
                    const pct = (h / maxVal) * 100;
                    return (
                      <div key={i} className="flex-1 bg-[#064E3B]/5 rounded-lg relative group transition-all hover:bg-[#064E3B]/10" style={{ height: '100%', minHeight: '3rem' }}>
                        <div className="absolute bottom-0 w-full bg-[#064E3B]/40 rounded-lg transition-all group-hover:bg-[#064E3B]/60" style={{ height: `${Math.max(pct, 4)}%` }}></div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-3 text-xs text-gray-400 px-1">
                  {appearanceLabels.map((label, i) => (
                    <span key={i}>{label}</span>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 self-start">
          <section className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2.5">
              <Link href="/portal/profile" className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 rounded-xl group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#64748B] shrink-0">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">Edit Profile</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Update your information</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#064E3B] transition-colors duration-200 shrink-0" />
              </Link>

              <Link href="/portal/rates" className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 rounded-xl group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#64748B] shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">Update Pricing</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Manage your rates</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#064E3B] transition-colors duration-200 shrink-0" />
              </Link>

              <Link href="/portal/availability" className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 rounded-xl group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#64748B] shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">Update Availability</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Set your schedule</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#064E3B] transition-colors duration-200 shrink-0" />
              </Link>
            </div>

            <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
              <Link
                href="/portal/profile"
                className="w-full flex items-center justify-center gap-2 h-10 bg-[#064E3B] text-white text-sm font-medium rounded-xl hover:bg-[#053A2C] transition-colors duration-200"
              >
                <Sparkles size={14} />
                Generate AI Bio
              </Link>
              <p className="text-center text-[11px] text-gray-400 mt-2">Open Profile to generate and apply your bio.</p>
            </div>
          </section>
        </div>

        {/* Upcoming */}
        <section className="lg:col-span-4 bg-[#064E3B] rounded-[20px] p-5 text-white relative overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Calendar className="w-16 h-16" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Upcoming</span>
                <h4 className="text-base font-bold mt-0.5">No upcoming sessions</h4>
                <p className="text-sm text-white/60 mt-0.5">Your future bookings will appear here.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl shrink-0">
              <Calendar className="w-4 h-4 text-white/70" />
              <span className="text-xs font-medium">Managed in schedule</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
