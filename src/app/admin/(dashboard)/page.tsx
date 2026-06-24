'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalInstructors: number;
  searches30d: number;
  pendingClaims: number;
  pendingReviews: number;
  newReviews: number;
  recentInstructors: any[];
  recentClaims: any[];
  pendingReviewRequests: any[];
  unapprovedReviews: any[];
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const width = 100;
  const height = 40;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p}`).join(' ');
  return (
    <svg width={width} height={height} className="shrink-0">
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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

  return (
    <>
      <div className="mb-16">
        <h2 className="text-[40px] md:text-[48px] font-bold text-primary tracking-tight leading-[1.1]">Overview</h2>
        <p className="text-lg text-on-surface-variant mt-2 max-w-2xl leading-relaxed">
          A minimalist view of your platform&apos;s health and primary management tools.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-16">
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-outline-variant/20 shadow-sm hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex justify-between items-start mb-5 md:mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Instructors</p>
            <Sparkline data={[10, 25, 20, 35, 30, 45, 40, 55]} color="#064e3b" />
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl md:text-4xl font-bold text-primary">
              {loading ? '—' : (stats?.totalInstructors ?? 0).toLocaleString()}
            </p>
            {!loading && (
              <span className="text-[11px] font-bold text-green-600 mb-1">+12%</span>
            )}
          </div>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-outline-variant/20 shadow-sm hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex justify-between items-start mb-5 md:mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Active Claims</p>
            <Sparkline data={[5, 12, 8, 15, 25, 20, 30, 47]} color="#ba1a1a" />
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl md:text-4xl font-bold text-primary">{stats?.pendingClaims ?? '—'}</p>
            {!loading && stats && (
              <span className="text-[11px] font-bold text-error mb-1">+{(stats.pendingClaims || 0) > 0 ? stats.pendingClaims : 0}</span>
            )}
          </div>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-outline-variant/20 shadow-sm hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex justify-between items-start mb-5 md:mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Reviews</p>
            <Sparkline data={[5, 12, 8, 15, 25, 20, 30, 47].map(v => 150 - v)} color="#545f73" />
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl md:text-4xl font-bold text-primary">{stats?.newReviews ?? '—'}</p>
            {!loading && (
              <span className="text-[11px] font-bold text-green-600 mb-1">{stats?.unapprovedReviews?.length ? `+${stats.unapprovedReviews.length}` : '0'}</span>
            )}
          </div>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-outline-variant/20 shadow-sm hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex justify-between items-start mb-5 md:mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Searches</p>
            <Sparkline data={[40, 42, 48, 55, 52, 60, 62]} color="#064e3b" />
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl md:text-4xl font-bold text-primary">
            {loading ? '—' : (stats?.searches30d ?? 0) >= 1000
              ? ((stats?.searches30d ?? 0) / 1000).toFixed(1) + 'k'
              : (stats?.searches30d ?? 0).toLocaleString()}
          </p>
            {!loading && (
              <span className="text-[11px] font-bold text-green-600 mb-1">30d</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-6 md:p-10">
            <div className="flex items-center justify-between mb-8 md:mb-10">
              <h4 className="text-xl md:text-2xl font-bold text-primary tracking-tight">Pending Audits</h4>
              <Link href="/admin/claims" className="text-sm font-bold text-primary hover:underline">
                View Queue →
              </Link>
            </div>
            <div className="space-y-4 md:space-y-6">
              <Link
                href="/admin/instructors"
                className="flex items-center justify-between p-4 md:p-6 bg-surface-dim/20 rounded-xl hover:bg-surface-dim/40 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-4 md:gap-5">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[20px] md:text-[24px]">policy</span>
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-bold text-on-surface">Verify New Instructor Profiles</p>
                    <p className="text-xs md:text-sm text-on-surface-variant">{stats?.pendingReviewRequests?.length || 0} pending verifications</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline shrink-0">chevron_right</span>
              </Link>
              <Link
                href="/admin/reviews"
                className="flex items-center justify-between p-4 md:p-6 bg-surface-dim/20 rounded-xl hover:bg-surface-dim/40 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-4 md:gap-5">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary shrink-0">
                    <span className="material-symbols-outlined text-[20px] md:text-[24px]">rate_review</span>
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-bold text-on-surface">Flagged Review Moderation</p>
                    <p className="text-xs md:text-sm text-on-surface-variant">{stats?.unapprovedReviews?.length || 0} reviews pending approval</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline shrink-0">chevron_right</span>
              </Link>
              <Link
                href="/admin/claims"
                className="flex items-center justify-between p-4 md:p-6 bg-surface-dim/20 rounded-xl hover:bg-surface-dim/40 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-4 md:gap-5">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-error/10 rounded-xl flex items-center justify-center text-error shrink-0">
                    <span className="material-symbols-outlined text-[20px] md:text-[24px]">warning</span>
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-bold text-on-surface">Conflict Resolution</p>
                    <p className="text-xs md:text-sm text-on-surface-variant">{stats?.recentClaims?.length || 0} disputed claims require review</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline shrink-0">chevron_right</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-primary text-white rounded-2xl shadow-sm p-8 md:p-10 h-full relative overflow-hidden flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">System Update</span>
              <h4 className="text-xl md:text-2xl font-bold mt-4 leading-tight">Next maintenance window: Sunday 2AM</h4>
              <p className="text-sm opacity-80 mt-4 leading-relaxed">
                Platform performance metrics will be aggregated in read-only mode for 15 minutes.
              </p>
            </div>
            <button className="mt-8 md:mt-12 bg-white text-primary px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-sm hover:bg-surface-container transition-all w-fit">
              Read Details
            </button>
            <span
              className="material-symbols-outlined absolute -bottom-10 -right-10 text-[10rem] md:text-[12rem] opacity-5 pointer-events-none select-none"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
