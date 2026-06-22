'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Instructor } from '@/types';

function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-0">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 border-b border-outline-variant/30">
          <div className="w-8 h-8 rounded-full bg-surface-container-highest shrink-0" />
          <div className="flex-1 h-4 rounded bg-surface-container-highest" />
          <div className="w-20 h-4 rounded bg-surface-container-highest" />
          <div className="w-16 h-4 rounded bg-surface-container-highest" />
          <div className="w-16 h-4 rounded bg-surface-container-highest" />
          <div className="w-12 h-4 rounded bg-surface-container-highest" />
          <div className="w-16 h-6 rounded-full bg-surface-container-highest" />
          <div className="w-16 h-6 rounded-full bg-surface-container-highest" />
          <div className="w-20 h-6 rounded bg-surface-container-highest" />
        </div>
      ))}
    </div>
  );
}

export default function AdminInstructors() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Instructor | null>(null);
  const limit = 50;

  const fetchInstructors = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit) });
      if (q) params.set('search', q);
      const res = await fetch(`/api/admin/instructors?${params}`);
      const data = await res.json();
      setInstructors(data.instructors || []);
      setTotal(data.total || 0);
    } catch {
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructors(page, search);
  }, [page, search, fetchInstructors]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Instructors</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">{total} total instructors</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </span>
            <input
              type="text"
              placeholder="Search by name, suburb, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchInstructors(1, search); } }}
              className="pl-9 pr-4 py-2 bg-surface border border-outline-variant/60 rounded-lg text-sm text-on-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none w-64 transition-all"
            />
          </div>
          <button
            onClick={() => { setPage(1); fetchInstructors(1, search); }}
            className="bg-secondary text-on-secondary px-4 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all"
          >
            Search
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/40">
                <th className="p-3 pl-4 font-label-md text-label-md text-on-surface-variant">Photo</th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant">Name</th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant">Suburb</th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant">Rating</th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant">Rate</th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant">Radius</th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant">Verified</th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant">Status</th>
                <th className="p-3 pr-4 font-label-md text-label-md text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {loading ? (
                <TableSkeleton />
              ) : instructors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center">
                    <span className="material-symbols-outlined text-[40px] text-outline mb-2">local_taxi</span>
                    <p className="font-body-md text-body-md text-on-surface-variant">No instructors found</p>
                  </td>
                </tr>
              ) : (
                instructors.map((inst) => (
                  <tr key={inst.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-3 pl-4">
                      <img
                        src={inst.profile_photo_url || `https://ui-avatars.com/api/?name=${inst.first_name}+${inst.last_name}&background=006a61&color=fff&size=40`}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-body-md text-body-md text-on-surface font-medium">{inst.first_name} {inst.last_name}</div>
                      <div className="font-label-sm text-label-sm text-outline">{inst.email || '—'}</div>
                    </td>
                    <td className="p-3 font-body-md text-body-md text-on-surface-variant whitespace-nowrap">{inst.suburb}, {inst.state}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="font-body-md text-body-md text-on-surface">{inst.average_rating.toFixed(1)}</span>
                        <span className="font-label-sm text-label-sm text-outline">({inst.review_count})</span>
                      </div>
                    </td>
                    <td className="p-3 font-body-md text-body-md text-on-surface font-medium whitespace-nowrap">${inst.hourly_rate}/hr</td>
                    <td className="p-3 font-body-md text-body-md text-on-surface-variant">{inst.service_radius_km}km</td>
                    <td className="p-3">
                      <button
                        onClick={async () => {
                          await fetch(`/api/admin/instructors/${inst.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ is_verified: !inst.is_verified }),
                          });
                          fetchInstructors(page, search);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                          inst.is_verified
                            ? 'bg-secondary-container text-secondary hover:bg-error-container hover:text-error'
                            : 'bg-surface-container text-on-surface-variant hover:bg-secondary-container hover:text-secondary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        {inst.is_verified ? 'Verified' : 'Verify'}
                      </button>
                    </td>
                    <td className="p-3">
                      {inst.is_claimed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container text-on-surface rounded-full text-xs font-bold">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          Claimed
                        </span>
                      ) : inst.has_pending_claim ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-tertiary-fixed/50 text-on-tertiary-container rounded-full text-xs font-bold">
                          <span className="material-symbols-outlined text-[12px]">pending</span>
                          Pending
                        </span>
                      ) : (
                        <button
                          onClick={async () => {
                            const res = await fetch(`/api/admin/instructors/${inst.id}/claim`, { method: 'POST' });
                            if (!res.ok) {
                              const data = await res.json();
                              alert(data.error || 'Failed to create claim request');
                            }
                            fetchInstructors(page, search);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-error-container text-error hover:bg-secondary-container hover:text-secondary rounded-full text-xs font-bold transition-colors"
                        >
                          <span className="material-symbols-outlined text-[12px]">add_circle</span>
                          Claim
                        </button>
                      )}
                    </td>
                    <td className="p-3 pr-4">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`/instructors/${inst.suburb.toLowerCase().replace(/\s+/g, '-')}/${inst.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-secondary transition-all"
                          title="View profile"
                        >
                          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                        </a>
                        <button
                          onClick={() => setConfirmDelete(inst)}
                          className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-all"
                          title="Delete instructor"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Page {page} of {totalPages} ({total} total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-surface-container transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">chevron_left</span>
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-surface-container transition-colors flex items-center gap-1"
            >
              Next
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl p-6 max-w-md w-full mx-4 shadow-xl border border-outline-variant/40">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Delete Instructor</h3>
                <p className="font-label-sm text-label-sm text-on-surface-variant">This action cannot be undone</p>
              </div>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-1">
              Are you sure you want to delete <strong className="text-on-surface">{confirmDelete.first_name} {confirmDelete.last_name}</strong>?
            </p>
            <p className="font-label-sm text-label-sm text-error mb-6">
              This will permanently remove the instructor, their reviews, and all related data.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setDeletingId(confirmDelete.id);
                  try {
                    const res = await fetch(`/api/admin/instructors/${confirmDelete.id}`, { method: 'DELETE' });
                    if (res.ok) {
                      setConfirmDelete(null);
                      fetchInstructors(page, search);
                    } else {
                      const data = await res.json();
                      alert(data.error || 'Failed to delete instructor');
                    }
                  } catch {
                    alert('Failed to delete instructor');
                  } finally {
                    setDeletingId(null);
                  }
                }}
                disabled={deletingId === confirmDelete.id}
                className="px-4 py-2 bg-error text-on-error rounded-lg text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                {deletingId === confirmDelete.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
