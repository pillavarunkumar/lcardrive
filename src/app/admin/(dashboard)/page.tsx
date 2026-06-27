'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

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
        <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start mb-5 md:mb-6">
            <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide">Instructors</p>
            <Sparkline data={[10, 25, 20, 35, 30, 45, 40, 55]} color="#064e3b" />
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl md:text-4xl font-bold text-on-surface leading-none">
              {loading ? '—' : (stats?.totalInstructors ?? 0).toLocaleString()}
            </p>
            {!loading && (
              <span className="text-[11px] font-bold text-green-600 mb-1">+12%</span>
            )}
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start mb-5 md:mb-6">
            <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide">Active Claims</p>
            <Sparkline data={[5, 12, 8, 15, 25, 20, 30, 47]} color="#ba1a1a" />
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl md:text-4xl font-bold text-on-surface leading-none">{stats?.pendingClaims ?? '—'}</p>
            {!loading && stats && (
              <span className="text-[11px] font-bold text-red-500 mb-1">+{(stats.pendingClaims || 0) > 0 ? stats.pendingClaims : 0}</span>
            )}
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start mb-5 md:mb-6">
            <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide">Reviews</p>
            <Sparkline data={[5, 12, 8, 15, 25, 20, 30, 47].map(v => 150 - v)} color="#545f73" />
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl md:text-4xl font-bold text-on-surface leading-none">{stats?.newReviews ?? '—'}</p>
            {!loading && (
              <span className="text-[11px] font-bold text-green-600 mb-1">{stats?.unapprovedReviews?.length ? `+${stats.unapprovedReviews.length}` : '0'}</span>
            )}
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start mb-5 md:mb-6">
            <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide">Searches</p>
            <Sparkline data={[40, 42, 48, 55, 52, 60, 62]} color="#064e3b" />
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl md:text-4xl font-bold text-on-surface leading-none">
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
          <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-base font-semibold text-on-surface">Pending Audits</h4>
              <Link href="/admin/claims" className="text-sm font-bold text-primary hover:underline">
                View Queue →
              </Link>
            </div>
            <div className="space-y-3">
              <Link
                href="/admin/instructors"
                className="flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0">
                    <span className="material-symbols-outlined text-[20px]">policy</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">Verify New Instructor Profiles</p>
                    <p className="text-xs text-on-surface-variant/60">{stats?.pendingReviewRequests?.length || 0} pending verifications</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/30 group-hover:text-primary transition-colors duration-200 shrink-0" />
              </Link>
              <Link
                href="/admin/reviews"
                className="flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0">
                    <span className="material-symbols-outlined text-[20px]">rate_review</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">Flagged Review Moderation</p>
                    <p className="text-xs text-on-surface-variant/60">{stats?.unapprovedReviews?.length || 0} reviews pending approval</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/30 group-hover:text-primary transition-colors duration-200 shrink-0" />
              </Link>
              <Link
                href="/admin/claims"
                className="flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">Conflict Resolution</p>
                    <p className="text-xs text-on-surface-variant/60">{stats?.recentClaims?.length || 0} disputed claims require review</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/30 group-hover:text-primary transition-colors duration-200 shrink-0" />
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-primary-container text-white rounded-2xl shadow-sm p-5 h-full relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wide opacity-60">System Update</span>
              <h4 className="text-base font-semibold mt-3 leading-tight">Next maintenance window: Sunday 2AM</h4>
              <p className="text-sm opacity-80 mt-2 leading-relaxed">
                Platform performance metrics will be aggregated in read-only mode for 15 minutes.
              </p>
            </div>
            <button className="mt-6 bg-white text-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all w-fit">
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
