'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, Eye, Pencil, DollarSign, Calendar, Sparkles, ChevronRight, MessageSquare, TrendingUp } from 'lucide-react';
import type { Instructor } from '@/types';

function getNextProfileStep(instructor: Instructor | null) {
  if (!instructor) {
    return {
      href: '/portal/profile',
      icon: 'person_add',
      label: 'Create your profile',
      helper: 'A complete profile increases trust and bookings.',
    };
  }

  if (!instructor.bio) {
    return {
      href: '/portal/profile',
      icon: 'edit_note',
      label: 'Add your bio',
      helper: 'Describe your teaching style and experience.',
    };
  }

  if (!instructor.vehicle_make || !instructor.vehicle_model || !instructor.vehicle_year) {
    return {
      href: '/portal/vehicle',
      icon: 'directions_car',
      label: 'Add vehicle details',
      helper: 'Show students what they will be learning in.',
    };
  }

  if (!instructor.hourly_rate) {
    return {
      href: '/portal/rates',
      icon: 'payments',
      label: 'Set your pricing',
      helper: 'Publish your hourly rate and lesson packages.',
    };
  }

  if (!instructor.availability_days?.length) {
    return {
      href: '/portal/availability',
      icon: 'event_available',
      label: 'Set availability',
      helper: 'Let students know when you usually teach.',
    };
  }

  if (!instructor.service_suburbs?.length) {
    return {
      href: '/portal/service-areas',
      icon: 'map',
      label: 'Add service areas',
      helper: 'Choose the suburbs where students can find you.',
    };
  }

  return {
    href: '/portal/profile',
    icon: 'verified',
    label: 'Review your profile',
    helper: 'Keep your public listing accurate and up to date.',
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
  const nextStep = getNextProfileStep(instructor);
  const verification = getVerificationCopy(instructor, hasPendingReview);

  return (
    <div className="grid lg:grid-cols-3 gap-gutter">

      {/* Left Content */}
      <div className="lg:col-span-2 space-y-gutter">

        {loadError && (
          <div className="bg-error-container/30 border border-error/20 rounded-2xl p-4 text-body-md font-body-md text-error">
            {loadError}
          </div>
        )}

        {/* Profile Completion */}
        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/80 p-8">
          <div className="grid md:grid-cols-[180px_1fr] gap-8 items-center">
            <div className="relative flex justify-center">
              <div className="w-36 h-36 rounded-full border-[10px] border-surface-dim flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-headline-md font-headline-md font-bold text-primary">
                    {loading ? '--' : `${comp}%`}
                  </h2>
                  <p className="text-label-sm font-label-sm text-secondary uppercase tracking-wider">Complete</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-headline-md font-headline-md text-primary mb-3">
                {comp >= 100 ? 'Your Profile Is Complete' : 'Complete Your Profile'}
              </h2>
              <p className="text-body-md font-body-md text-secondary mb-6">
                Keep your profile accurate so students can understand your services, pricing, vehicle, and availability.
              </p>
              <Link
                href={nextStep.href}
                className="inline-block bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-label-md hover:brightness-110 transition"
              >
                {nextStep.label}
              </Link>
              <p className="mt-4 text-label-sm font-label-sm text-on-surface-variant">{nextStep.helper}</p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid md:grid-cols-3 gap-gutter">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary-container/30 flex items-center justify-center text-secondary">
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-label-sm font-label-sm text-secondary uppercase font-medium">Total Reviews</p>
            </div>
            <h3 className="text-[40px] font-bold text-primary leading-none">
              {loading ? '--' : totalReviews}
            </h3>
            <p className="text-label-sm font-label-sm text-on-surface-variant mt-2">
              {totalReviews === 0 ? 'No reviews yet' : `${totalReviews} review${totalReviews !== 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary-container/30 flex items-center justify-center text-secondary">
                <Star className="w-5 h-5" />
              </div>
              <p className="text-label-sm font-label-sm text-secondary uppercase font-medium">Average Rating</p>
            </div>
            <h3 className="text-[40px] font-bold text-primary leading-none">
              {loading ? '--' : avgRating > 0 ? avgRating.toFixed(1) : '-'}
            </h3>
            <p className="text-label-sm font-label-sm text-on-surface-variant mt-2">
              {avgRating > 0 ? `${avgRating.toFixed(1)} / 5.0` : 'No rating yet'}
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                verification.label === 'Verified' ? 'bg-primary/10 text-primary'
                : verification.label === 'Under Review' ? 'bg-warning-container/30 text-warning'
                : 'bg-surface-container text-on-surface-variant'
              }`}>
                <Eye className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-label-sm font-label-sm text-secondary uppercase font-medium">Profile Status</p>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  verification.label === 'Verified'
                    ? 'bg-primary/10 text-primary'
                    : verification.label === 'Under Review'
                    ? 'bg-warning-container/30 text-warning'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    verification.label === 'Verified' ? 'bg-primary'
                    : verification.label === 'Under Review' ? 'bg-warning'
                    : 'bg-outline'
                  }`} />
                  {verification.label}
                </span>
              </div>
            </div>
            <p className="text-body-md font-body-md text-on-surface-variant">{verification.body}</p>
          </div>
        </section>

        {/* Analytics */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-headline-md font-headline-md text-primary">Search Appearances</h3>
              <p className="text-body-md font-body-md text-secondary mt-1">Appearances in search results over the last 7 days</p>
            </div>
          </div>

          {!instructor || appearanceTotals.length === 0 ? (
            <div className="h-64 rounded-2xl border border-dashed border-outline-variant bg-surface flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-10 h-10 text-outline mx-auto mb-3" />
                <h4 className="font-bold text-headline-sm text-on-surface">No data available yet</h4>
                <p className="text-body-md font-body-md text-secondary">Analytics will appear once your profile is live.</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-end gap-2 h-48">
                {appearanceTotals.map((h, i) => {
                  const maxVal = Math.max(...appearanceTotals, 1);
                  const pct = (h / maxVal) * 100;
                  return (
                    <div key={i} className="flex-1 bg-primary/5 rounded-t-lg relative group transition-all hover:bg-primary/10" style={{ height: '100%', minHeight: '4rem' }}>
                      <div className="absolute bottom-0 w-full bg-primary/60 rounded-t-lg transition-all group-hover:bg-primary/80" style={{ height: `${Math.max(pct, 4)}%` }}></div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-3 text-label-sm font-label-sm text-secondary px-2">
                {appearanceLabels.map((label, i) => (
                  <span key={i}>{label}</span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Sidebar */}
      <div className="space-y-gutter">

        {/* Quick Actions */}
        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/80 p-8">
          <h3 className="text-headline-md font-headline-md text-primary mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/portal/profile" className="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-container transition-all rounded-xl border border-outline-variant group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary-container/30 flex items-center justify-center text-secondary">
                  <Pencil className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-body-md font-body-md text-on-surface font-semibold">Edit Profile</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">Update your information</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-outline group-hover:text-primary" />
            </Link>

            <Link href="/portal/rates" className="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-container transition-all rounded-xl border border-outline-variant group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary-container/30 flex items-center justify-center text-secondary">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-body-md font-body-md text-on-surface font-semibold">Update Pricing</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">Manage your rates</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-outline group-hover:text-primary" />
            </Link>

            <Link href="/portal/availability" className="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-container transition-all rounded-xl border border-outline-variant group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary-container/30 flex items-center justify-center text-secondary">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-body-md font-body-md text-on-surface font-semibold">Update Availability</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">Set your schedule</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-outline group-hover:text-primary" />
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-outline-variant">
            <Link
              href="/portal/profile"
              className="w-full flex items-center justify-center gap-3 p-4 bg-primary text-on-primary rounded-xl font-bold text-label-md hover:opacity-90 transition-all"
            >
              <Sparkles size={18} />
              Generate AI Bio
            </Link>
            <p className="text-center text-label-sm font-label-sm text-secondary mt-3">Open Profile to generate and apply your bio.</p>
          </div>
        </section>

        {/* Upcoming */}
        <section className="bg-primary rounded-2xl p-8 text-on-primary relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
            <Calendar className="w-16 h-16" />
          </div>
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-label-sm font-label-sm mb-6">Upcoming</span>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-headline-md font-headline-md leading-none">No upcoming sessions</h4>
                <p className="text-body-md font-body-md opacity-80 mt-1">Your future bookings will appear here.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-md">
              <Calendar className="w-5 h-5" />
              <span className="text-body-md font-body-md font-bold">Availability managed in your schedule</span>
            </div>
          </div>
        </section>

        {/* Verification Status */}
        {!loading && (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
            <div className="flex items-center justify-between mb-5">
              <span className="text-label-sm font-bold uppercase tracking-widest text-secondary">Profile Status</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                verification.label === 'Verified'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : verification.label === 'Under Review'
                  ? 'bg-warning-container/30 text-warning border-warning/20'
                  : 'bg-surface-container-high text-on-surface-variant border-outline-variant'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  verification.label === 'Verified' ? 'bg-primary'
                  : verification.label === 'Under Review' ? 'bg-warning'
                  : 'bg-outline'
                }`} />
                {verification.label}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                verification.label === 'Verified' ? 'bg-primary/10 text-primary'
                : verification.label === 'Under Review' ? 'bg-warning-container/30 text-warning'
                : 'bg-surface-container text-on-surface-variant'
              }`}>
                <Eye className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-body-md font-body-md text-secondary">{verification.body}</h4>
              </div>
            </div>

            {/* Profile completeness bar */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-label-sm font-bold uppercase tracking-wider text-secondary">Profile Completeness</span>
                <span className="text-label-sm font-bold text-primary">{comp}%</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(comp, 100)}%` }}
                />
              </div>
            </div>

            {/* Next action */}
            {verification.label !== 'Verified' && (
              <Link
                href={nextStep.href}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-90 transition-all"
              >
                {nextStep.label}
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
