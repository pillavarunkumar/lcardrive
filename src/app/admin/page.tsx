'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Claim {
  id: string;
  reason: string;
  detail: string | null;
  created_at: string;
  instructor_name: string;
  adi_registration: string | null;
}

interface Review {
  id: string;
  reviewer_name: string;
  rating_overall: number;
  review_text: string | null;
  created_at: string;
  instructor_name: string;
}

interface PendingReview {
  id: string;
  instructor_name: string;
  profile_completeness: number;
  created_at: string;
}

interface Stats {
  totalInstructors: number;
  pendingClaims: number;
  pendingReviews: number;
  newReviews: number;
  recentInstructors: any[];
  recentClaims: Claim[];
  pendingReviewRequests: PendingReview[];
  unapprovedReviews: Review[];
}

function StatCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/40 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-lg bg-surface-container-highest" />
        <div className="w-16 h-4 rounded bg-surface-container-highest" />
      </div>
      <div className="w-20 h-3 rounded bg-surface-container-highest mb-2" />
      <div className="w-16 h-8 rounded bg-surface-container-highest" />
    </div>
  );
}

function TableSkeleton({ rows = 4, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-outline-variant/30">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="flex-1 h-4 rounded bg-surface-container-highest" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleClaimAction = async (id: string, action: string) => {
    const res = await fetch(`/api/admin/claims/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setStats((prev) => prev ? {
        ...prev,
        recentClaims: prev.recentClaims.filter((c) => c.id !== id),
        pendingClaims: Math.max(0, prev.pendingClaims - 1),
      } : prev);
    }
  };

  const handleReviewAction = async (id: string, action: string) => {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setStats((prev) => prev ? {
        ...prev,
        unapprovedReviews: prev.unapprovedReviews.filter((r) => r.id !== id),
        newReviews: Math.max(0, prev.newReviews - 1),
      } : prev);
    }
  };

  const handleApproveReview = async (id: string) => {
    if (!stats) return;
    const review = stats.pendingReviewRequests.find((r) => r.id === id);
    const action = review ? 'approve' : 'approve';
    await fetch(`/api/admin/claims/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setStats((prev) => prev ? {
      ...prev,
      pendingReviewRequests: prev.pendingReviewRequests.filter((r) => r.id !== id),
      pendingReviews: Math.max(0, prev.pendingReviews - 1),
    } : prev);
  };

  const handleRejectProfileReview = async (id: string) => {
    await fetch(`/api/admin/claims/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject' }),
    });
    setStats((prev) => prev ? {
      ...prev,
      pendingReviewRequests: prev.pendingReviewRequests.filter((r) => r.id !== id),
      pendingReviews: Math.max(0, prev.pendingReviews - 1),
    } : prev);
  };

  const statCards = [
    {
      label: 'Total Instructors',
      value: stats?.totalInstructors ?? null,
      icon: 'local_taxi',
      href: '/admin/instructors',
      color: 'from-secondary to-secondary/70',
      bg: 'bg-secondary/10',
      textColor: 'text-secondary',
    },
    {
      label: 'Pending Claims',
      value: stats?.pendingClaims ?? null,
      icon: 'assignment_late',
      href: '/admin/claims',
      color: 'from-warning to-warning/70',
      bg: 'bg-error/10',
      textColor: 'text-error',
    },
    {
      label: 'Pending Reviews',
      value: stats?.pendingReviews ?? null,
      icon: 'rate_review',
      href: '/admin/reviews',
      color: 'from-tertiary-fixed-dim to-tertiary-fixed-dim/70',
      bg: 'bg-tertiary-fixed/30',
      textColor: 'text-on-tertiary-container',
    },
    {
      label: 'New Reviews (24h)',
      value: stats?.newReviews ?? null,
      icon: 'reviews',
      href: '/admin/reviews',
      color: 'from-secondary to-secondary/70',
      bg: 'bg-secondary/10',
      textColor: 'text-secondary',
      badge: stats && stats.newReviews > 0 ? stats.newReviews : undefined,
    },
  ];

  return (
    <div className="space-y-stack-md">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Dashboard</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Welcome back. Here is your platform overview.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg border border-outline-variant/40">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">calendar_today</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          statCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="group bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/40 hover:border-secondary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden"
            >
              <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-secondary/[0.03] to-transparent rounded-bl-full" />
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center ${card.textColor} group-hover:scale-110 transition-transform duration-200`}>
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
                </div>
                <span className="text-secondary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">View all →</span>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant mb-0.5">{card.label}</p>
              <p className="font-display-lg text-display-lg text-on-surface font-bold">
                {card.value !== null && card.value !== undefined ? card.value : '—'}
              </p>
              {card.badge && (
                <span className="absolute top-3 right-3 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-on-secondary bg-secondary rounded-full">
                  +{card.badge}
                </span>
              )}
            </Link>
          ))
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Recent Instructors</h2>
          <Link href="/admin/instructors" className="font-label-md text-label-md text-secondary hover:underline flex items-center gap-1">
            View All
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/40">
                  <th className="p-3 pl-4 font-label-md text-label-md text-on-surface-variant">Name</th>
                  <th className="p-3 font-label-md text-label-md text-on-surface-variant">Suburb</th>
                  <th className="p-3 font-label-md text-label-md text-on-surface-variant">Rating</th>
                  <th className="p-3 font-label-md text-label-md text-on-surface-variant">Rate</th>
                  <th className="p-3 pr-4 font-label-md text-label-md text-on-surface-variant">Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {loading ? (
                  <TableSkeleton rows={4} cols={5} />
                ) : stats?.recentInstructors?.length ? (
                  stats.recentInstructors.map((inst: any) => (
                    <tr key={inst.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="p-3 pl-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={inst.profile_photo_url || `https://ui-avatars.com/api/?name=${inst.first_name}+${inst.last_name}&background=006a61&color=fff&size=32`}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                          <span className="font-body-md text-body-md text-on-surface font-medium">{inst.first_name} {inst.last_name}</span>
                        </div>
                      </td>
                      <td className="p-3 font-body-md text-body-md text-on-surface-variant">{inst.suburb}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="font-body-md text-body-md text-on-surface">{inst.average_rating?.toFixed(1) || '—'}</span>
                          {inst.review_count > 0 && (
                            <span className="font-label-sm text-label-sm text-outline">({inst.review_count})</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-body-md text-body-md text-on-surface font-medium">
                        {inst.hourly_rate ? `$${inst.hourly_rate}/hr` : '—'}
                      </td>
                      <td className="p-3 pr-4">
                        {inst.is_verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary-container text-secondary rounded-full text-xs font-bold">
                            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            Verified
                          </span>
                        ) : (
                          <span className="text-xs text-on-surface-variant">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <span className="material-symbols-outlined text-[32px] text-outline mb-2">local_taxi</span>
                      <p className="text-sm text-on-surface-variant">No instructors yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <Link
          href="/admin/import"
          className="group bg-surface-container-lowest rounded-xl border-2 border-dashed border-outline-variant/50 hover:border-secondary/50 hover:bg-surface-container-low transition-all duration-200 p-6 text-center flex flex-col items-center justify-center"
        >
          <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-3 group-hover:scale-110 group-hover:bg-secondary/20 transition-all duration-200">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Import CSV</h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">Bulk import instructor listings from a CSV file.</p>
        </Link>
        <Link
          href="/admin/export"
          className="group bg-surface-container-lowest rounded-xl border-2 border-dashed border-outline-variant/50 hover:border-secondary/50 hover:bg-surface-container-low transition-all duration-200 p-6 text-center flex flex-col items-center justify-center"
        >
          <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-3 group-hover:scale-110 group-hover:bg-secondary/20 transition-all duration-200">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>download</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Export Data</h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">Download instructors, reviews, or flags as CSV or JSON.</p>
        </Link>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Pending Profile Reviews</h2>
          <span className="font-label-sm text-label-sm text-on-surface-variant">{stats?.pendingReviews ?? 0} pending</span>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/40">
                  <th className="p-3 pl-4 font-label-md text-label-md text-on-surface-variant">Instructor</th>
                  <th className="p-3 font-label-md text-label-md text-on-surface-variant">Completeness</th>
                  <th className="p-3 font-label-md text-label-md text-on-surface-variant">Submitted</th>
                  <th className="p-3 pr-4 font-label-md text-label-md text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {loading ? (
                  <TableSkeleton rows={3} cols={4} />
                ) : stats?.pendingReviewRequests?.length ? (
                  stats.pendingReviewRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="p-3 pl-4 font-body-md text-body-md text-on-surface font-medium">{req.instructor_name}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                            <div className="h-full bg-secondary rounded-full" style={{ width: `${req.profile_completeness}%` }} />
                          </div>
                          <span className="font-label-sm text-label-sm text-secondary font-bold">{req.profile_completeness}%</span>
                        </div>
                      </td>
                      <td className="p-3 font-body-md text-body-md text-on-surface-variant">{new Date(req.created_at).toLocaleDateString()}</td>
                      <td className="p-3 pr-4">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleRejectProfileReview(req.id)}
                            className="p-2 text-error hover:bg-error-container rounded-lg transition-colors" title="Reject"
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                          <button
                            onClick={() => handleApproveReview(req.id)}
                            className="p-2 text-secondary hover:bg-secondary-container rounded-lg transition-colors" title="Approve"
                          >
                            <span className="material-symbols-outlined text-[18px]">check</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center">
                      <span className="material-symbols-outlined text-[32px] text-outline mb-2">check_circle</span>
                      <p className="text-sm text-on-surface-variant">No pending reviews</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Claims Queue</h2>
          <Link href="/admin/claims" className="font-label-md text-label-md text-secondary hover:underline flex items-center gap-1">
            View All
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/40">
                  <th className="p-3 pl-4 font-label-md text-label-md text-on-surface-variant">Instructor</th>
                  <th className="p-3 font-label-md text-label-md text-on-surface-variant">Reason</th>
                  <th className="p-3 font-label-md text-label-md text-on-surface-variant">Date</th>
                  <th className="p-3 pr-4 font-label-md text-label-md text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {loading ? (
                  <TableSkeleton rows={3} cols={4} />
                ) : stats?.recentClaims?.length ? (
                  stats.recentClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="p-3 pl-4 font-body-md text-body-md text-on-surface font-medium">{claim.instructor_name}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center px-2 py-0.5 bg-surface-container-highest text-on-surface-variant rounded-full text-xs font-medium capitalize">
                          {claim.reason.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3 font-body-md text-body-md text-on-surface-variant">{new Date(claim.created_at).toLocaleDateString()}</td>
                      <td className="p-3 pr-4">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleClaimAction(claim.id, 'reject')}
                            className="p-2 text-error hover:bg-error-container rounded-lg transition-colors" title="Reject"
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                          <button
                            onClick={() => handleClaimAction(claim.id, 'approve')}
                            className="p-2 text-secondary hover:bg-secondary-container rounded-lg transition-colors" title="Approve"
                          >
                            <span className="material-symbols-outlined text-[18px]">check</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center">
                      <span className="material-symbols-outlined text-[32px] text-outline mb-2">check_circle</span>
                      <p className="text-sm text-on-surface-variant">No pending claims</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="pb-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Review Moderation</h2>
          <Link href="/admin/reviews" className="font-label-md text-label-md text-secondary hover:underline flex items-center gap-1">
            View All
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/40">
                  <th className="p-3 pl-4 font-label-md text-label-md text-on-surface-variant">Reviewer</th>
                  <th className="p-3 font-label-md text-label-md text-on-surface-variant">Instructor</th>
                  <th className="p-3 font-label-md text-label-md text-on-surface-variant">Comment</th>
                  <th className="p-3 pr-4 font-label-md text-label-md text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {loading ? (
                  <TableSkeleton rows={3} cols={4} />
                ) : stats?.unapprovedReviews?.length ? (
                  stats.unapprovedReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="p-3 pl-4">
                        <div className="font-body-md text-body-md text-on-surface font-medium">{review.reviewer_name}</div>
                        <div className="flex text-tertiary-fixed-dim text-[14px] mt-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: i <= review.rating_overall ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 font-body-md text-body-md text-on-surface-variant">{review.instructor_name}</td>
                      <td className="p-3 font-body-md text-body-md text-on-surface-variant text-sm line-clamp-2 max-w-xs">{review.review_text || '—'}</td>
                      <td className="p-3 pr-4">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleReviewAction(review.id, 'reject')}
                            className="p-2 text-error hover:bg-error-container rounded-lg transition-colors" title="Delete"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                          <button
                            onClick={() => handleReviewAction(review.id, 'approve')}
                            className="p-2 text-secondary hover:bg-secondary-container rounded-lg transition-colors" title="Approve"
                          >
                            <span className="material-symbols-outlined text-[18px]">check</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center">
                      <span className="material-symbols-outlined text-[32px] text-outline mb-2">rate_review</span>
                      <p className="text-sm text-on-surface-variant">No reviews pending moderation</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
