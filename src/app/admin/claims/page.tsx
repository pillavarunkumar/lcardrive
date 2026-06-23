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
        <h1 className="text-xl font-bold text-gray-900">Claims</h1>
        <p className="text-sm text-gray-500 mt-0.5">{claims.length} pending claim{claims.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3 border-b border-gray-50 animate-pulse">
              <div className="flex-1 h-3 bg-gray-100 rounded" />
              <div className="w-16 h-3 bg-gray-100 rounded" />
              <div className="w-20 h-3 bg-gray-100 rounded" />
              <div className="w-14 h-6 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <span className="material-symbols-outlined text-[36px] text-gray-300 mb-2">flag</span>
          <p className="text-sm font-semibold text-gray-900 mb-0.5">All Clear</p>
          <p className="text-xs text-gray-500">No pending claims to review.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="p-2.5 pl-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Instructor</th>
                  <th className="p-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="p-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Detail</th>
                  <th className="p-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">ADI Reg</th>
                  <th className="p-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="p-2.5 pr-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-2.5 pl-3 text-sm font-medium text-gray-900">{claim.instructor_name}</td>
                    <td className="p-2.5">
                      <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium capitalize">
                        {claim.reason.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-2.5 text-sm text-gray-500 max-w-[180px] truncate">{claim.detail || '—'}</td>
                    <td className="p-2.5">
                      <code className="text-[11px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-mono">
                        {claim.adi_registration || '—'}
                      </code>
                    </td>
                    <td className="p-2.5 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-2.5 pr-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleAction(claim.id, 'reject')}
                          className="px-2.5 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[12px]">close</span>
                          Reject
                        </button>
                        <button
                          onClick={() => handleAction(claim.id, 'approve')}
                          className="px-2.5 py-1 text-[10px] font-bold text-primary hover:bg-primary/10 rounded-md transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[12px]">check</span>
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
