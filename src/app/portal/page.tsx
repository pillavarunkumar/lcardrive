'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import type { Instructor } from '@/types';

export default function PortalDashboard() {
  const { user } = useUser();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [hasPendingReview, setHasPendingReview] = useState(false);

  useEffect(() => {
    fetch('/api/portal/profile')
      .then((r) => r.json())
      .then((d) => {
        if (d.instructor) setInstructor(d.instructor);
        if (d.hasPendingReview) setHasPendingReview(true);
      })
      .catch(() => {});
  }, []);

  const comp = instructor?.profile_completeness ?? 0;
  const totalReviews = instructor?.review_count ?? 0;
  const avgRating = instructor?.average_rating ?? 0;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Welcome back, {user?.firstName || instructor?.first_name || 'Instructor'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Here is how your instructor profile is performing today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-md">
        <div className="bento-card bg-surface-container-lowest rounded-xl p-6 lg:col-span-2 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary-container rounded-full opacity-20 blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Profile Completeness</h3>
                <p className="font-body-sm text-on-surface-variant mt-1">A complete profile attracts 3x more students.</p>
              </div>
              <span className="font-headline-md text-headline-md font-bold text-primary">{comp}%</span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-3 mb-2 overflow-hidden">
              <div className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${comp}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bento-card bg-surface-container-lowest rounded-xl p-6 flex flex-col justify-center items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1", fontSize: '28px' }}>star</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</h3>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">Average Rating</p>
          <div className="mt-3 inline-block bg-primary/10 text-primary px-2 py-1 rounded font-label-sm text-label-sm">
            Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        <div className="bento-card bg-surface-container-lowest rounded-xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined">visibility</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Profile Views</p>
            <div className="flex items-end gap-2">
              <h3 className="font-headline-md text-headline-md text-on-surface">—</h3>
            </div>
            <p className="font-label-sm text-label-sm text-outline mt-1">Coming soon</p>
          </div>
        </div>

        <div className="bento-card bg-surface-container-lowest rounded-xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined">travel_explore</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Search Impressions</p>
            <div className="flex items-end gap-2">
              <h3 className="font-headline-md text-headline-md text-on-surface">—</h3>
            </div>
            <p className="font-label-sm text-label-sm text-outline mt-1">Coming soon</p>
          </div>
        </div>

        <div className="bento-card bg-surface-container-lowest rounded-xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined">event_available</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">New Leads</p>
            <div className="flex items-end gap-2">
              <h3 className="font-headline-md text-headline-md text-on-surface">—</h3>
            </div>
            <p className="font-label-sm text-label-sm text-outline mt-1">Coming soon</p>
          </div>
        </div>

        <div className="bento-card bg-surface-container-lowest rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">checklist</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Next Steps to Boost Visibility</h3>
          </div>
          <ul className="space-y-3">
            {[
              { icon: 'directions_car', label: 'Add your vehicle details', href: '/portal/profile#vehicle-details', boost: '+15%', done: !!(instructor?.vehicle_make && instructor?.vehicle_model) },
              { icon: 'add_a_photo', label: 'Upload a gallery photo', href: '/portal/profile#vehicle-details', boost: '+20%', done: !!(instructor?.vehicle_image_url || instructor?.profile_photo_url) },
              { icon: 'description', label: 'Upload your documents for verification', href: '/portal/profile#licences-documents', boost: '+25%', done: !!instructor?.is_verified },
              { icon: 'payments', label: 'Set your rates & packages', href: '/portal/rates', boost: '+30%', done: !!(instructor?.hourly_rate && instructor?.hourly_rate > 0) },
              { icon: 'map', label: 'Define your service areas', href: '/portal/service-areas', boost: '+15%', done: (instructor?.service_suburbs?.length ?? 0) > 0 },
              { icon: 'rate_review', label: 'Submit your profile for review', href: '/portal/profile', boost: 'Go Live', done: !!instructor?.is_verified || hasPendingReview },
            ].filter((step) => !step.done).map((step) => (
              <li key={step.label}>
                <Link href={step.href} className="flex items-center justify-between p-3 rounded-lg border border-outline-variant bg-surface-bright hover:bg-surface-container-low transition-colors group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container text-on-surface-variant">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{step.icon}</span>
                    </div>
                    <span className="font-label-md text-label-md text-on-surface group-hover:text-secondary transition-colors">{step.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-label-sm text-label-sm font-bold text-on-tertiary-container bg-tertiary-fixed px-2 py-1 rounded">{step.boost}</span>
                    <span className="material-symbols-outlined text-outline-variant group-hover:text-secondary transition-colors">chevron_right</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
