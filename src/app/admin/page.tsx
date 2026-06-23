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
    await fetch(`/api/admin/claims/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    });
    setStats((prev) => prev ? {
      ...prev,
      pendingReviewRequests: prev.pendingReviewRequests.filter((r) => r.id !== id),
      pendingReviews: Math.max(0, prev.pendingReviews - 1),
    } : prev);
  };

  const handleRejectProfileReview = async (id: string) => {
    if (!stats) return;
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
      icon: 'group',
      href: '/admin/instructors',
      color: 'text-primary',
      bg: 'bg-primary/10',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Pending Claims',
      value: stats?.pendingClaims ?? null,
      icon: 'flag',
      href: '/admin/claims',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      trend: String(stats?.pendingClaims ?? 0),
      trendUp: (stats?.pendingClaims ?? 0) > 0,
    },
    {
      label: 'Pending Reviews',
      value: stats?.pendingReviews ?? null,
      icon: 'rate_review',
      href: '/admin/reviews',
      color: 'text-gray-600',
      bg: 'bg-gray-100',
      trend: String(stats?.pendingReviews ?? 0),
      trendUp: (stats?.pendingReviews ?? 0) > 0,
    },
    {
      label: 'New Reviews',
      value: stats?.newReviews ?? null,
      icon: 'rate_review',
      href: '/admin/reviews',
      color: 'text-primary',
      bg: 'bg-primary/10',
      trend: '24h',
      trendUp: true,
    },
  ];

  const quickActions = [
    { label: 'Import CSV', icon: 'upload_file', href: '/admin/import', desc: 'Bulk import instructors' },
    { label: 'Export Data', icon: 'file_download', href: '/admin/export', desc: 'Download as CSV/JSON' },
    { label: 'Backup DB', icon: 'database', href: '/admin/backup', desc: 'Download or restore' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform overview</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs text-gray-500">
          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                  <div className="h-5 w-12 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          ))
        ) : (
          statCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
                </div>
                {card.trend && (
                  <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                    card.trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {card.trend}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium">{card.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {card.value !== null && card.value !== undefined ? card.value : '—'}
              </p>
            </Link>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="bg-white rounded-xl p-4 border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{action.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{action.label}</p>
              <p className="text-xs text-gray-500">{action.desc}</p>
            </div>
            <span className="material-symbols-outlined text-[16px] text-gray-300 ml-auto group-hover:text-primary transition-colors">chevron_right</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-bold text-gray-900">Recent Instructors</h2>
            <Link href="/admin/instructors" className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5">
              View All
              <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="p-2.5 pl-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="p-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Suburb</th>
                    <th className="p-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="p-2.5 pr-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Verified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <td key={j} className="p-2.5 pl-3"><div className="h-3 w-20 bg-gray-100 rounded" /></td>
                        ))}
                      </tr>
                    ))
                  ) : stats?.recentInstructors?.length ? (
                    stats.recentInstructors.slice(0, 5).map((inst: any) => (
                      <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-2.5 pl-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={inst.profile_photo_url || `https://ui-avatars.com/api/?name=${inst.first_name}+${inst.last_name}&background=006a61&color=fff&size=32`}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover shrink-0"
                            />
                            <span className="text-sm font-medium text-gray-900">{inst.first_name} {inst.last_name}</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-sm text-gray-500">{inst.suburb || '—'}</td>
                        <td className="p-2.5">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="text-sm text-gray-900 font-medium">{inst.average_rating?.toFixed(1) || '—'}</span>
                          </div>
                        </td>
                        <td className="p-2.5 pr-3">
                          {inst.is_verified ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold">
                              <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                              Verified
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-medium">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-sm text-gray-400">No instructors yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-bold text-gray-900">Claims Queue</h2>
            <Link href="/admin/claims" className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5">
              View All
              <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="p-2.5 pl-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Instructor</th>
                    <th className="p-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="p-2.5 pr-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 3 }).map((_, j) => (
                          <td key={j} className="p-2.5 pl-3"><div className="h-3 w-16 bg-gray-100 rounded" /></td>
                        ))}
                      </tr>
                    ))
                  ) : stats?.recentClaims?.length ? (
                    stats.recentClaims.slice(0, 4).map((claim) => (
                      <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-2.5 pl-3 text-sm font-medium text-gray-900">{claim.instructor_name}</td>
                        <td className="p-2.5">
                          <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium capitalize">
                            {claim.reason.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-2.5 pr-3">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => handleClaimAction(claim.id, 'reject')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Reject">
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                            <button onClick={() => handleClaimAction(claim.id, 'approve')} className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors" title="Approve">
                              <span className="material-symbols-outlined text-[16px]">check</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-sm text-gray-400">No pending claims</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-bold text-gray-900">Pending Profile Reviews</h2>
            <span className="text-[11px] text-gray-400 font-medium">{stats?.pendingReviews ?? 0} pending</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="p-2.5 pl-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Instructor</th>
                    <th className="p-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="p-2.5 pr-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 3 }).map((_, j) => (
                          <td key={j} className="p-2.5 pl-3"><div className="h-3 w-16 bg-gray-100 rounded" /></td>
                        ))}
                      </tr>
                    ))
                  ) : stats?.pendingReviewRequests?.length ? (
                    stats.pendingReviewRequests.slice(0, 4).map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-2.5 pl-3 text-sm font-medium text-gray-900">{req.instructor_name}</td>
                        <td className="p-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${req.profile_completeness}%` }} />
                            </div>
                            <span className="text-[11px] font-semibold text-primary">{req.profile_completeness}%</span>
                          </div>
                        </td>
                        <td className="p-2.5 pr-3">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => handleRejectProfileReview(req.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Reject">
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                            <button onClick={() => handleApproveReview(req.id)} className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors" title="Approve">
                              <span className="material-symbols-outlined text-[16px]">check</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-sm text-gray-400">No pending reviews</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-bold text-gray-900">Review Moderation</h2>
            <Link href="/admin/reviews" className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5">
              View All
              <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="p-2.5 pl-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Reviewer</th>
                    <th className="p-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Instructor</th>
                    <th className="p-2.5 pr-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 3 }).map((_, j) => (
                          <td key={j} className="p-2.5 pl-3"><div className="h-3 w-16 bg-gray-100 rounded" /></td>
                        ))}
                      </tr>
                    ))
                  ) : stats?.unapprovedReviews?.length ? (
                    stats.unapprovedReviews.slice(0, 4).map((review) => (
                      <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-2.5 pl-3">
                          <div className="text-sm font-medium text-gray-900">{review.reviewer_name}</div>
                          <div className="flex text-amber-400 text-[10px]">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <span key={i} className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: i <= review.rating_overall ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                            ))}
                          </div>
                        </td>
                        <td className="p-2.5 text-sm text-gray-500">{review.instructor_name}</td>
                        <td className="p-2.5 pr-3">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => handleReviewAction(review.id, 'reject')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                            <button onClick={() => handleReviewAction(review.id, 'approve')} className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors" title="Approve">
                              <span className="material-symbols-outlined text-[16px]">check</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-sm text-gray-400">No reviews pending</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
