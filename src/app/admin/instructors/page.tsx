'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Instructor } from '@/types';

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Instructors</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total instructors</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
              <span className="material-symbols-outlined text-[16px]">search</span>
            </span>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchInstructors(1, search); } }}
              className="pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-48 transition-all"
            />
          </div>
          <button
            onClick={() => { setPage(1); fetchInstructors(1, search); }}
            className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-semibold hover:brightness-110 transition-all"
          >
            Search
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="p-2.5 pl-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="p-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Suburb</th>
                <th className="p-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="p-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Rate</th>
                <th className="p-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Radius</th>
                <th className="p-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Verified</th>
                <th className="p-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-2.5 pr-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="p-2.5 pl-3"><div className="h-3 w-14 bg-gray-100 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : instructors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-sm text-gray-400">No instructors found</td>
                </tr>
              ) : (
                instructors.map((inst) => (
                  <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-2.5 pl-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={inst.profile_photo_url || `https://ui-avatars.com/api/?name=${inst.first_name}+${inst.last_name}&background=006a61&color=fff&size=32`}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{inst.first_name} {inst.last_name}</div>
                          <div className="text-[11px] text-gray-400">{inst.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2.5 text-sm text-gray-500 whitespace-nowrap">{inst.suburb}, {inst.state}</td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-sm text-gray-900 font-medium">{inst.average_rating?.toFixed(1) || '—'}</span>
                        <span className="text-[11px] text-gray-400">({inst.review_count})</span>
                      </div>
                    </td>
                    <td className="p-2.5 text-sm text-gray-900 font-medium whitespace-nowrap">{inst.hourly_rate ? `$${inst.hourly_rate}/hr` : '—'}</td>
                    <td className="p-2.5 text-sm text-gray-500">{inst.service_radius_km ? `${inst.service_radius_km}km` : '—'}</td>
                    <td className="p-2.5">
                      <button
                        onClick={async () => {
                          await fetch(`/api/admin/instructors/${inst.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ is_verified: !inst.is_verified }),
                          });
                          fetchInstructors(page, search);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          inst.is_verified
                            ? 'bg-primary/10 text-primary hover:bg-red-50 hover:text-red-600'
                            : 'bg-gray-100 text-gray-500 hover:bg-primary/10 hover:text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        {inst.is_verified ? 'Verified' : 'Verify'}
                      </button>
                    </td>
                    <td className="p-2.5">
                      {inst.is_claimed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-bold">
                          <span className="material-symbols-outlined text-[10px]">check_circle</span>
                          Claimed
                        </span>
                      ) : inst.has_pending_claim ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
                          <span className="material-symbols-outlined text-[10px]">pending</span>
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
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 hover:bg-primary/10 hover:text-primary rounded text-[10px] font-bold transition-colors"
                        >
                          <span className="material-symbols-outlined text-[10px]">add_circle</span>
                          Claim
                        </button>
                      )}
                    </td>
                    <td className="p-2.5 pr-3">
                      <div className="flex justify-end gap-0.5">
                        <a
                          href={`/instructors/${(inst.suburb || '').toLowerCase().replace(/\s+/g, '-')}/${inst.slug || ''}`}
                          target="_blank"
                          className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-primary transition-all"
                          title="View profile"
                        >
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        </a>
                        <button
                          onClick={() => setConfirmDelete(inst)}
                          className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                          title="Delete instructor"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
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
          <span className="text-xs text-gray-500">Page {page} of {totalPages} ({total} total)</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[12px]">chevron_left</span>
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
              Next
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full mx-4 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Delete Instructor</h3>
                <p className="text-xs text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Delete <strong className="text-gray-900">{confirmDelete.first_name} {confirmDelete.last_name}</strong> permanently?
            </p>
            <p className="text-xs text-red-600 mb-4">All reviews and related data will be removed.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
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
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
                {deletingId === confirmDelete.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
