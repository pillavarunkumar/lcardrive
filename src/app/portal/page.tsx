'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, Eye, Pencil, DollarSign, Calendar, Sparkles, ChevronRight, MessageSquare, TrendingUp } from 'lucide-react';
import type { Instructor } from '@/types';

function getNextProfileStep(
  instructor: Instructor | null,
  comp: number = 0,
  hasPendingReview?: boolean,
  approvalStatus: string = 'draft',
) {
  if (!instructor || approvalStatus === 'rejected') {
    return {
      href: '/portal/onboarding',
      icon: approvalStatus === 'rejected' ? 'edit_note' : 'person_add',
      label: approvalStatus === 'rejected' ? 'Update and resubmit' : 'Start instructor registration',
      helper: approvalStatus === 'rejected'
        ? 'Review the admin notes and resubmit your details.'
        : 'The guided registration covers your details, documents, vehicle, service areas and pricing.',
      action: 'link' as const,
    };
  }

  if (approvalStatus === 'pending_review' || hasPendingReview) {
    return {
      href: '/portal/onboarding',
      icon: 'schedule',
      label: 'View registration status',
      helper: 'Your profile is waiting for administrator approval.',
      action: 'link' as const,
    };
  }

  if (!instructor.is_verified) {
    if (comp < 100 || !instructor.vehicle_make || !instructor.hourly_rate || !instructor.availability_days?.length || !instructor.service_suburbs?.length) {
      return {
        href: '/portal/onboarding',
        icon: 'assignment',
        label: 'Continue registration',
        helper: 'Finish the remaining steps and submit your profile for approval.',
        action: 'link' as const,
      };
    }

    return {
      href: '',
      icon: 'verified',
      label: 'Submit for Review',
      helper: 'Submit your completed registration for admin approval.',
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

function getVerificationCopy(
  instructor: Instructor | null,
  hasPendingReview: boolean,
  approvalStatus: string = 'draft',
) {
  if (approvalStatus === 'rejected') {
    return { label: 'Changes Requested', body: 'Update your details and submit again for approval.' };
  }
  if (instructor?.is_verified || approvalStatus === 'approved') {
    return { label: 'Verified', body: 'Your profile is approved and visible to students.' };
  }
  if (hasPendingReview || approvalStatus === 'pending_review') {
    return { label: 'Under Review', body: 'Admin is reviewing your submitted profile.' };
  }
  return { label: 'Pending', body: 'Complete your registration and submit for admin review.' };
}

export default function PortalDashboard() {
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [hasPendingReview, setHasPendingReview] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState('draft');
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
        if (profileData.approvalStatus) setApprovalStatus(profileData.approvalStatus);
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
  const nextStep = getNextProfileStep(instructor, comp, hasPendingReview, approvalStatus);
  const verification = getVerificationCopy(instructor, hasPendingReview, approvalStatus);

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
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">

        {/* Profile Completion */}
        <section className="lg:col-span-4 bg-white rounded-2xl border border-outline-variant shadow-sm p-5 relative hover:shadow-md transition-shadow duration-200">
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
                <svg className="w-full h-full -rotate-90 text-outline-variant" viewBox="0 0 144 144">
                  <circle cx="72" cy="72" r="62" fill="none" stroke="currentColor" strokeWidth="10" />
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
                    <span className="text-xl font-bold text-on-surface" style={{ color: loading ? undefined : progressColor }}>
                      {loading ? '--' : `${comp}%`}
                    </span>
                    <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-wider mt-0.5">Complete</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[22px] font-bold text-on-surface mb-1.5">
                  {comp >= 100 ? 'Your Profile Is Complete' : 'Complete Your Profile'}
                </h2>
                <p className="text-sm text-on-surface-variant mb-4">
                  Keep your profile accurate so students can understand your services, pricing, vehicle, and availability.
                </p>
                {nextStep.action === 'submit' ? (
                  <button
                    onClick={submitForReview}
                    disabled={submitting}
                    className="inline-flex items-center h-10 px-5 bg-primary-container text-white text-sm font-medium rounded-xl hover:bg-primary-container/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : nextStep.label}
                  </button>
                ) : (
                  <Link
                    href={nextStep.href}
                    className="inline-flex items-center h-10 px-5 bg-primary-container text-white text-sm font-medium rounded-xl hover:bg-primary-container/90 transition-colors duration-200"
                  >
                    {nextStep.label}
                  </Link>
                )}
                <p className="mt-2 text-xs text-on-surface-variant/60">{nextStep.helper}</p>
              </div>
            </div>
          </section>

        {/* Left Column */}
        <div className="lg:col-span-3 space-y-6">

          {/* Stats */}
          <section className="grid grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-outline-variant shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </div>
                <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide">Profile Checklist</span>
              </div>
              <span className="text-2xl font-bold text-on-surface leading-none">{loading ? '--' : `${comp}%`}</span>
              <span className="block text-xs text-on-surface-variant/60 mt-1.5">
                {comp < 100 ? `${6 - Math.ceil(comp / 20)} steps remaining` : 'All steps completed'}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-outline-variant shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0">
                  <Star className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide">Average Rating</span>
              </div>
              <span className="text-2xl font-bold text-on-surface leading-none">
                {loading ? '--' : avgRating > 0 ? avgRating.toFixed(1) : '-'}
              </span>
              <span className="block text-xs text-on-surface-variant/60 mt-1.5">
                {avgRating > 0 ? `${avgRating.toFixed(1)} / 5.0` : 'No rating yet'}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-outline-variant shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide">Total Reviews</span>
              </div>
              <span className="text-2xl font-bold text-on-surface leading-none">{loading ? '--' : totalReviews}</span>
              <span className="block text-xs text-on-surface-variant/60 mt-1.5">
                {totalReviews === 0 ? 'No reviews yet' : `${totalReviews} review${totalReviews !== 1 ? 's' : ''}`}
              </span>
            </div>

          </section>

          {/* Analytics */}
          <section className="bg-white rounded-2xl border border-outline-variant shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-on-surface">Search Appearances</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Appearances in search results over the last 7 days</p>
              </div>
            </div>

            {!instructor || appearanceTotals.length === 0 ? (
              <div className="h-48 rounded-2xl border border-dashed border-outline-variant bg-surface-container-low flex items-center justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center mx-auto mb-3 text-on-surface-variant">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-on-surface">No data available yet</h4>
                  <p className="text-xs text-on-surface-variant/60 mt-1">Analytics will appear once your profile is live.</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-end gap-2 h-48">
                  {appearanceTotals.map((h, i) => {
                    const maxVal = Math.max(...appearanceTotals, 1);
                    const pct = (h / maxVal) * 100;
                    return (
                      <div key={i} className="flex-1 bg-primary-container/5 rounded-lg relative group transition-all hover:bg-primary-container/10" style={{ height: '100%', minHeight: '3rem' }}>
                        <div className="absolute bottom-0 w-full bg-primary-container/40 rounded-lg transition-all group-hover:bg-primary-container/60" style={{ height: `${Math.max(pct, 4)}%` }}></div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-3 text-xs text-on-surface-variant/60 px-1">
                  {appearanceLabels.map((label, i) => (
                    <span key={i}>{label}</span>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1">
          <section className="bg-white rounded-2xl border border-outline-variant shadow-sm p-5 hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
            <h3 className="text-base font-semibold text-on-surface mb-4">Quick Actions</h3>
            <div className="space-y-2.5 flex-1">
              <Link href="/portal/profile" className="w-full flex items-center justify-between p-3.5 bg-surface-container-low hover:bg-surface-container transition-colors duration-200 rounded-xl group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-outline-variant flex items-center justify-center text-on-surface-variant shrink-0">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-on-surface">Edit Profile</p>
                    <p className="text-[11px] text-on-surface-variant/60 mt-0.5">Update your information</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/40 group-hover:text-primary-container transition-colors duration-200 shrink-0" />
              </Link>

              <Link href="/portal/rates" className="w-full flex items-center justify-between p-3.5 bg-surface-container-low hover:bg-surface-container transition-colors duration-200 rounded-xl group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-outline-variant flex items-center justify-center text-on-surface-variant shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-on-surface">Update Pricing</p>
                    <p className="text-[11px] text-on-surface-variant/60 mt-0.5">Manage your rates</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/40 group-hover:text-primary-container transition-colors duration-200 shrink-0" />
              </Link>

              <Link href="/portal/availability" className="w-full flex items-center justify-between p-3.5 bg-surface-container-low hover:bg-surface-container transition-colors duration-200 rounded-xl group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-outline-variant flex items-center justify-center text-on-surface-variant shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-on-surface">Update Availability</p>
                    <p className="text-[11px] text-on-surface-variant/60 mt-0.5">Set your schedule</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/40 group-hover:text-primary-container transition-colors duration-200 shrink-0" />
              </Link>
            </div>

            <div className="pt-4 border-t border-outline-variant">
              <Link
                href="/portal/profile"
                className="w-full flex items-center justify-center gap-2 h-10 bg-primary-container text-white text-sm font-medium rounded-xl hover:bg-primary-container/90 transition-colors duration-200"
              >
                <Sparkles size={14} />
                Generate AI Bio
              </Link>
              <p className="text-center text-[11px] text-on-surface-variant/60 mt-2">Open Profile to generate and apply your bio.</p>
            </div>
          </section>
        </div>

        {/* Upcoming */}
        <section className="lg:col-span-4 bg-primary-container rounded-2xl shadow-lg shadow-primary-container/20 p-5 text-white relative overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Calendar className="w-16 h-16" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
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
