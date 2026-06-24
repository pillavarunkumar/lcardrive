'use client';

import { useState, useEffect } from 'react';

interface Claim {
  id: string;
  instructor_name: string;
  adi_registration: string | null;
  suburb?: string;
  is_claimed?: boolean;
  is_verified?: boolean;
  reason?: string;
  detail?: string | null;
  created_at: string;
}

export default function AdminClaims() {
  const [unverified, setUnverified] = useState<Claim[]>([]);
  const [submittedClaims, setSubmittedClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/claims/unverified').then(r => r.json()),
      fetch('/api/admin/stats').then(r => r.json()),
    ])
      .then(([unverifiedData, statsData]) => {
        if (unverifiedData.claims) setUnverified(unverifiedData.claims);
        if (statsData.recentClaims) setSubmittedClaims(statsData.recentClaims);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = async (id: string, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/admin/claims/unverified/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      if (action === 'approve') setUnverified((prev) => prev.filter((c) => c.id !== id));
      if (action === 'reject') setUnverified((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleSubmittedAction = async (id: string, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/admin/claims/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (res.ok) setSubmittedClaims((prev) => prev.filter((c) => c.id !== id));
  };

  const allItems = unverified.length + submittedClaims.length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Claims Queue</h2>
          <p className="text-on-surface-variant text-sm mt-1">Review and verify pending instructor profiles.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-container text-on-primary-container rounded-lg text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Refresh Queue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant">
          <p className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Pending Verification</p>
          <p className="text-2xl font-bold text-primary">{allItems}</p>
          <div className="mt-2 flex items-center gap-1 text-primary text-xs">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>Awaiting review</span>
          </div>
        </div>
        <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant">
          <p className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Unverified Instructors</p>
          <p className="text-2xl font-bold text-primary">{unverified.length}</p>
          <div className="mt-2 flex items-center gap-1 text-primary text-xs">
            <span className="material-symbols-outlined text-[14px]">person_remove</span>
            <span>Need verification</span>
          </div>
        </div>
        <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant">
          <p className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Submitted Claims</p>
          <p className="text-2xl font-bold text-primary">{submittedClaims.length}</p>
          <div className="mt-2 flex items-center gap-1 text-on-surface-variant text-xs">
            <span className="material-symbols-outlined text-[14px]">flag</span>
            <span>Self-submitted</span>
          </div>
        </div>
        <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant">
          <p className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Escalations</p>
          <p className="text-2xl font-bold text-error">0</p>
          <div className="mt-2 flex items-center gap-1 text-error text-xs">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            <span>Requires Manager review</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-outline-variant/30 animate-pulse">
              <div className="flex-1 h-4 bg-outline-variant/40 rounded" />
              <div className="w-24 h-4 bg-outline-variant/40 rounded" />
              <div className="w-28 h-8 bg-outline-variant/40 rounded" />
            </div>
          ))}
        </div>
      ) : allItems === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-container-lowest rounded-xl border border-outline-variant">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
          </div>
          <h3 className="text-lg font-bold text-primary mb-1">All Clear!</h3>
          <p className="text-on-surface-variant max-w-sm mx-auto text-sm mb-6">
            All instructors have been verified. No pending claims or unverified profiles.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Unverified instructors */}
          {unverified.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">person_remove</span>
                Unverified Instructors
                <span className="text-xs font-normal text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                  {unverified.length}
                </span>
              </h3>
              <div className="space-y-3">
                <div className="hidden md:grid grid-cols-12 px-6 py-3 bg-surface-container-highest rounded-lg text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  <div className="col-span-4">Instructor</div>
                  <div className="col-span-2">Suburb</div>
                  <div className="col-span-2">ADI Number</div>
                  <div className="col-span-1">Joined</div>
                  <div className="col-span-3 text-right">Actions</div>
                </div>
                {unverified.map((claim) => (
                  <div
                    key={claim.id}
                    className="grid grid-cols-1 md:grid-cols-12 px-6 py-6 bg-surface-container-lowest border border-outline-variant rounded-xl items-center hover:shadow-md transition-all gap-3 md:gap-0"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary font-bold overflow-hidden shrink-0 ring-1 ring-outline-variant">
                        {claim.instructor_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{claim.instructor_name}</p>
                        <p className="text-xs text-on-surface-variant">
                          <span className="inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            {new Date(claim.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-on-surface-variant">
                      {claim.suburb || '—'}
                    </div>
                    <div className="col-span-2">
                      <span className="inline-flex px-3 py-1.5 bg-primary-container/10 text-primary-container rounded-full text-xs font-bold border border-primary/20">
                        {claim.adi_registration || 'Not provided'}
                      </span>
                    </div>
                    <div className="col-span-1 text-sm text-on-surface-variant">
                      {new Date(claim.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="col-span-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleVerify(claim.id, 'reject')}
                        className="px-4 py-2 border border-error text-error rounded-lg text-xs font-bold hover:bg-error/5 transition-colors"
                      >
                        Skip
                      </button>
                      <button
                        onClick={() => handleVerify(claim.id, 'approve')}
                        className="px-4 py-2 bg-primary-container text-on-primary-container rounded-lg text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        Verify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submitted claims */}
          {submittedClaims.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">flag</span>
                Self-Submitted Claims
                <span className="text-xs font-normal text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                  {submittedClaims.length}
                </span>
              </h3>
              <div className="space-y-3">
                <div className="hidden md:grid grid-cols-12 px-6 py-3 bg-surface-container-highest rounded-lg text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  <div className="col-span-4">Instructor</div>
                  <div className="col-span-2">Reason</div>
                  <div className="col-span-2">ADI Number</div>
                  <div className="col-span-1">Date</div>
                  <div className="col-span-3 text-right">Actions</div>
                </div>
                {submittedClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="grid grid-cols-1 md:grid-cols-12 px-6 py-6 bg-surface-container-lowest border border-outline-variant rounded-xl items-center hover:shadow-md transition-all gap-3 md:gap-0"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary font-bold overflow-hidden shrink-0 ring-1 ring-outline-variant">
                        {claim.instructor_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{claim.instructor_name}</p>
                        <p className="text-xs text-on-primary-container flex items-center gap-1">
                          View Marketplace Listing
                          <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-on-surface-variant capitalize">
                      {claim.reason || '—'}
                    </div>
                    <div className="col-span-2">
                      <span className="inline-flex px-3 py-1.5 bg-primary-container/10 text-primary-container rounded-full text-xs font-bold border border-primary/20">
                        {claim.adi_registration || 'ADI-Not-Provided'}
                      </span>
                    </div>
                    <div className="col-span-1 text-sm text-on-surface-variant">
                      {new Date(claim.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="col-span-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleSubmittedAction(claim.id, 'reject')}
                        className="px-4 py-2 border border-error text-error rounded-lg text-xs font-bold hover:bg-error/5 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleSubmittedAction(claim.id, 'approve')}
                        className="px-4 py-2 bg-primary-container text-on-primary-container rounded-lg text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        Approve Claim
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
