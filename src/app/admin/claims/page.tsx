'use client';

import { useState, useEffect } from 'react';

interface Claim {
  id: string;
  instructor_name: string;
  adi_registration: string | null;
  reason: string;
  detail: string | null;
  created_at: string;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-outline-variant/30 animate-pulse">
      <div className="flex-1 h-4 rounded bg-surface-container-highest" />
      <div className="w-20 h-4 rounded bg-surface-container-highest" />
      <div className="w-24 h-4 rounded bg-surface-container-highest" />
      <div className="w-16 h-8 rounded bg-surface-container-highest" />
    </div>
  );
}

export default function AdminClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => {
        if (d.recentClaims) setClaims(d.recentClaims);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/admin/claims/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (res.ok) setClaims((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Claims</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
          {claims.length} pending claim{claims.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden">
          {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-12 text-center">
          <span className="material-symbols-outlined text-[40px] text-outline mb-3">assignment_late</span>
          <p className="font-headline-sm text-headline-sm text-on-surface mb-1">All Clear</p>
          <p className="font-body-md text-body-md text-on-surface-variant">No pending claims to review.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/40">
                  <th className="p-3 pl-4 font-label-md text-label-md text-on-surface-variant">Instructor</th>
                  <th className="p-3 font-label-md text-label-md text-on-surface-variant">Reason</th>
                  <th className="p-3 font-label-md text-label-md text-on-surface-variant">Detail</th>
                  <th className="p-3 font-label-md text-label-md text-on-surface-variant">ADI Reg</th>
                  <th className="p-3 font-label-md text-label-md text-on-surface-variant">Date</th>
                  <th className="p-3 pr-4 font-label-md text-label-md text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-3 pl-4 font-body-md text-body-md text-on-surface font-medium">{claim.instructor_name}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-0.5 bg-surface-container-highest text-on-surface-variant rounded-full text-xs font-medium capitalize">
                        {claim.reason.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-body-md text-body-md text-on-surface-variant max-w-[200px] truncate">{claim.detail || '—'}</td>
                    <td className="p-3">
                      <code className="text-xs bg-surface-container px-2 py-0.5 rounded text-on-surface font-mono">
                        {claim.adi_registration || '—'}
                      </code>
                    </td>
                    <td className="p-3 font-body-md text-body-md text-on-surface-variant whitespace-nowrap">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 pr-4">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleAction(claim.id, 'reject')}
                          className="px-3 py-1.5 text-xs font-bold text-error hover:bg-error-container rounded-lg transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                          Reject
                        </button>
                        <button
                          onClick={() => handleAction(claim.id, 'approve')}
                          className="px-3 py-1.5 text-xs font-bold text-secondary hover:bg-secondary-container rounded-lg transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">check</span>
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
