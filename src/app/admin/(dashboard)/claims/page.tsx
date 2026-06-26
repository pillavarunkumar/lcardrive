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
          <h2 className="text-[22px] font-bold text-gray-900">Claims Queue</h2>
          <p className="text-sm text-gray-500 mt-1">Review and verify pending instructor profiles.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#064E3B]/10 text-[#064E3B] rounded-lg text-xs font-bold hover:bg-[#064E3B] hover:text-white transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Refresh Queue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-[#64748B] shrink-0 mb-3">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
          </div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Pending Verification</p>
          <p className="text-2xl font-bold text-gray-900 leading-none mt-1">{allItems}</p>
          <span className="block text-xs text-gray-400 mt-1.5">Awaiting review</span>
        </div>
        <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-[#64748B] shrink-0 mb-3">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>person_remove</span>
          </div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Unverified Instructors</p>
          <p className="text-2xl font-bold text-gray-900 leading-none mt-1">{unverified.length}</p>
          <span className="block text-xs text-gray-400 mt-1.5">Need verification</span>
        </div>
        <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-[#64748B] shrink-0 mb-3">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
          </div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Submitted Claims</p>
          <p className="text-2xl font-bold text-gray-900 leading-none mt-1">{submittedClaims.length}</p>
          <span className="block text-xs text-gray-400 mt-1.5">Self-submitted</span>
        </div>
        <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-[#64748B] shrink-0 mb-3">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          </div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Escalations</p>
          <p className="text-2xl font-bold text-red-500 leading-none mt-1">0</p>
          <span className="block text-xs text-gray-400 mt-1.5">Requires Manager review</span>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-[#E5E7EB]/30 animate-pulse">
              <div className="flex-1 h-4 bg-gray-200 rounded" />
              <div className="w-24 h-4 bg-gray-200 rounded" />
              <div className="w-28 h-8 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : allItems === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-[#64748B] mb-4">
            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">All Clear!</h3>
          <p className="text-gray-500 max-w-sm mx-auto text-sm mb-6">
            All instructors have been verified. No pending claims or unverified profiles.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Unverified instructors */}
          {unverified.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">person_remove</span>
                Unverified Instructors
                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {unverified.length}
                </span>
              </h3>
              <div className="space-y-3">
                <div className="hidden md:grid grid-cols-12 px-6 py-3 bg-gray-50 rounded-lg text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                  <div className="col-span-4">Instructor</div>
                  <div className="col-span-2">Suburb</div>
                  <div className="col-span-2">ADI Number</div>
                  <div className="col-span-1">Joined</div>
                  <div className="col-span-3 text-right">Actions</div>
                </div>
                {unverified.map((claim) => (
                  <div
                    key={claim.id}
                    className="grid grid-cols-1 md:grid-cols-12 px-6 py-6 bg-white border border-[#E5E7EB] rounded-[20px] items-center hover:shadow-md transition-all gap-3 md:gap-0"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold overflow-hidden shrink-0 ring-1 ring-gray-200">
                        {claim.instructor_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{claim.instructor_name}</p>
                        <p className="text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            {new Date(claim.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-gray-500">
                      {claim.suburb || '—'}
                    </div>
                    <div className="col-span-2">
                      <span className="inline-flex px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200">
                        {claim.adi_registration || 'Not provided'}
                      </span>
                    </div>
                    <div className="col-span-1 text-sm text-gray-500">
                      {new Date(claim.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="col-span-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleVerify(claim.id, 'reject')}
                        className="px-4 py-2 border border-red-400 text-red-500 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors"
                      >
                        Skip
                      </button>
                      <button
                        onClick={() => handleVerify(claim.id, 'approve')}
                        className="px-4 py-2 bg-[#064E3B] text-white rounded-lg text-xs font-bold hover:bg-[#053A2C] transition-all flex items-center gap-2"
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
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">flag</span>
                Self-Submitted Claims
                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {submittedClaims.length}
                </span>
              </h3>
              <div className="space-y-3">
                <div className="hidden md:grid grid-cols-12 px-6 py-3 bg-gray-50 rounded-lg text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                  <div className="col-span-4">Instructor</div>
                  <div className="col-span-2">Reason</div>
                  <div className="col-span-2">ADI Number</div>
                  <div className="col-span-1">Date</div>
                  <div className="col-span-3 text-right">Actions</div>
                </div>
                {submittedClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="grid grid-cols-1 md:grid-cols-12 px-6 py-6 bg-white border border-[#E5E7EB] rounded-[20px] items-center hover:shadow-md transition-all gap-3 md:gap-0"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold overflow-hidden shrink-0 ring-1 ring-gray-200">
                        {claim.instructor_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{claim.instructor_name}</p>
                        <p className="text-xs text-[#064E3B] flex items-center gap-1">
                          View Marketplace Listing
                          <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm text-gray-500 capitalize">
                      {claim.reason || '—'}
                    </div>
                    <div className="col-span-2">
                      <span className="inline-flex px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200">
                        {claim.adi_registration || 'ADI-Not-Provided'}
                      </span>
                    </div>
                    <div className="col-span-1 text-sm text-gray-500">
                      {new Date(claim.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="col-span-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleSubmittedAction(claim.id, 'reject')}
                        className="px-4 py-2 border border-red-400 text-red-500 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleSubmittedAction(claim.id, 'approve')}
                        className="px-4 py-2 bg-[#064E3B] text-white rounded-lg text-xs font-bold hover:bg-[#053A2C] transition-all flex items-center gap-2"
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
