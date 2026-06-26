'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Instructor } from '@/types';
import { getAvatarUrl } from '@/lib/utils';

export default function AdminInstructors() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [total, setTotal] = useState(0);
  const [verifiedTotal, setVerifiedTotal] = useState(0);
  const [unclaimedTotal, setUnclaimedTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Instructor | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [claimFilter, setClaimFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('created_at-desc');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingBulk, setDeletingBulk] = useState(false);
  const limit = 50;

  const fetchInstructors = useCallback(async (p: number, q: string, vf?: string, cf?: string, so?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit) });
      if (q) params.set('search', q);
      if (vf) params.set('is_verified', vf);
      if (cf) params.set('claim_status', cf);
      if (so) {
        const [sortField, sortDir] = so.split('-');
        params.set('sort', sortField);
        params.set('order', sortDir);
      }
      const res = await fetch(`/api/admin/instructors?${params}`);
      const data = await res.json();
      setInstructors(data.instructors || []);
      setTotal(data.total || 0);
      setVerifiedTotal(data.verifiedTotal ?? 0);
      setUnclaimedTotal(data.unclaimedTotal ?? 0);
    } catch {
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructors(page, searchQuery, verificationFilter, claimFilter, sortOrder);
  }, [page, searchQuery, verificationFilter, claimFilter, sortOrder, fetchInstructors]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-primary">Instructor Management</h2>
          <p className="text-on-surface-variant text-sm mt-1">Monitor, verify, and manage instructor profiles across Australia.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant">
            {(['all', 'pending'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                  setVerificationFilter(tab === 'pending' ? 'false' : '');
                }}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {tab === 'all' ? 'All Instructors' : 'Pending Review'}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setSelectionMode(!selectionMode);
              setSelectedIds(new Set());
            }}
            className={`p-2 rounded-lg transition-all ${
              selectionMode
                ? 'bg-error text-on-error shadow-sm'
                : 'text-on-surface-variant hover:text-error hover:bg-error/5'
            }`}
            title={selectionMode ? 'Exit selection mode' : 'Delete instructors'}
          >
            <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
          </button>
        </div>
      </div>

      <section className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">Filters</span>
        </div>
        <div className="relative">
          <select
            value={verificationFilter}
            onChange={(e) => { setVerificationFilter(e.target.value); setPage(1); }}
            className="appearance-none bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 pr-10 text-xs text-on-surface focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[18px]">expand_more</span>
        </div>
        <div className="relative">
          <select
            value={claimFilter}
            onChange={(e) => { setClaimFilter(e.target.value); setPage(1); }}
            className="appearance-none bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 pr-10 text-xs text-on-surface focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="claimed">Claimed</option>
            <option value="unclaimed">Unclaimed</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[18px]">expand_more</span>
        </div>
        <div className="relative">
          <select
            value={sortOrder}
            onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}
            className="appearance-none bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 pr-10 text-xs text-on-surface focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer"
          >
            <option value="created_at-desc">Sort: Newest</option>
            <option value="first_name-asc">Name: A-Z</option>
            <option value="first_name-desc">Name: Z-A</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[18px]">sort</span>
        </div>
        <div className="ml-auto flex items-center gap-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search by name, ADI, suburb or state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); setSearchQuery(search); } }}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low rounded-lg text-xs text-on-surface focus:outline-none placeholder:text-outline/60 transition-all"
            />
          </div>
          <button
            onClick={() => { setPage(1); setSearchQuery(search); }}
            className="flex items-center gap-1.5 bg-primary/10 text-primary px-5 py-2 rounded-full text-xs font-semibold hover:bg-primary hover:text-white transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[16px]">search</span>
            Search
          </button>
        </div>
      </section>

      {selectionMode && (
        <div className="flex items-center justify-between bg-primary/[0.03] border border-primary/20 rounded-xl px-5 py-3">
          <p className="text-sm font-semibold text-primary">
            {selectedIds.size > 0
              ? `${selectedIds.size} instructor${selectedIds.size > 1 ? 's' : ''} selected`
              : 'Select instructors to delete'}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectionMode(false)}
              className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={() => setConfirmBulkDelete(true)}
                className="px-3 py-1.5 bg-error text-on-error rounded-lg text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
                Delete Selected
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant">
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant">
                {selectionMode && (
                  <th className="px-3 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={instructors.length > 0 && selectedIds.size === instructors.length}
                      onChange={() => {
                        if (selectedIds.size === instructors.length) {
                          setSelectedIds(new Set());
                        } else {
                          setSelectedIds(new Set(instructors.map(i => i.id)));
                        }
                      }}
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                    />
                  </th>
                )}
                <th className="px-3 py-3.5 w-8 text-[11px] font-semibold text-outline uppercase tracking-wider text-center">#</th>
                <th className="px-3 py-3.5 text-[11px] font-semibold text-outline uppercase tracking-wider whitespace-nowrap">Instructor</th>
                <th className="px-3 py-3.5 text-[11px] font-semibold text-outline uppercase tracking-wider whitespace-nowrap">ADI Number</th>
                <th className="px-3 py-3.5 text-[11px] font-semibold text-outline uppercase tracking-wider whitespace-nowrap">Suburb</th>
                <th className="px-3 py-3.5 text-[11px] font-semibold text-outline uppercase tracking-wider whitespace-nowrap">Verification</th>
                <th className="px-3 py-3.5 text-[11px] font-semibold text-outline uppercase tracking-wider whitespace-nowrap">Claim Status</th>
                <th className="px-3 py-3.5 text-[11px] font-semibold text-outline uppercase tracking-wider whitespace-nowrap">Rating</th>
                <th className="px-3 py-3.5 text-[11px] font-semibold text-outline uppercase tracking-wider whitespace-nowrap">Rate</th>
                <th className="pl-3 pr-6 py-3.5 text-[11px] font-semibold text-outline uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: selectionMode ? 10 : 9 }).map((_, j) => (
                      <td key={j} className="px-3 py-3"><div className="h-3 w-14 bg-outline-variant/40 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : instructors.length === 0 ? (
                <tr>
                  <td colSpan={selectionMode ? 10 : 9} className="p-12 text-center text-sm text-on-surface-variant">No instructors found</td>
                </tr>
              ) : (
                instructors.map((inst, index) => (
                  <tr key={inst.id} className={`hover:bg-surface-container-low transition-colors group ${selectedIds.has(inst.id) ? 'bg-primary/[0.02]' : ''}`}>
                    {selectionMode && (
                      <td className="px-3 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(inst.id)}
                          onChange={() => {
                            const next = new Set(selectedIds);
                            if (next.has(inst.id)) next.delete(inst.id);
                            else next.add(inst.id);
                            setSelectedIds(next);
                          }}
                          className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="px-3 py-3 text-center text-[11px] text-outline font-mono">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <div className="relative w-7 h-7 rounded-full shrink-0 ring-1 ring-outline-variant overflow-hidden bg-primary/10 flex items-center justify-center text-primary text-[9px] font-bold">
                          {(inst.first_name?.[0] || '').toUpperCase()}{(inst.last_name?.[0] || '').toUpperCase()}
                          <img
                            src={getAvatarUrl(inst)}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.remove(); }}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-surface whitespace-nowrap">{inst.first_name} {inst.last_name}</p>
                          <p className="text-[10px] text-on-surface-variant whitespace-nowrap">{inst.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[11px] text-on-surface-variant font-mono whitespace-nowrap">{inst.adi_registration || '—'}</td>
                    <td className="px-3 py-3 text-[11px] text-on-surface-variant whitespace-nowrap">{inst.suburb}, {inst.state}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <button
                        onClick={async () => {
                          await fetch(`/api/admin/instructors/${inst.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ is_verified: !inst.is_verified }),
                          });
                          fetchInstructors(page, searchQuery);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                          inst.is_verified
                            ? 'bg-primary-container/10 text-primary-container border-primary/20'
                            : 'bg-error-container/20 text-error border-error/20'
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-[12px]"
                          style={inst.is_verified ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          {inst.is_verified ? 'verified' : 'warning'}
                        </span>
                        {inst.is_verified ? 'Verified' : 'Unverified'}
                      </button>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {inst.is_claimed ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant text-[10px] font-bold">
                          Claimed
                        </span>
                      ) : inst.has_pending_claim ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-bold">
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
                            fetchInstructors(page, searchQuery);
                          }}
                          className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-[10px] font-bold hover:bg-primary-container/10 hover:text-primary transition-colors"
                        >
                          Unclaimed
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-0.5">
                        <span
                          className="material-symbols-outlined text-[13px] text-primary"
                          style={inst.average_rating ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          star
                        </span>
                        <span className="text-xs font-bold text-on-surface">
                          {inst.average_rating?.toFixed(1) || '—'}
                        </span>
                        {inst.review_count > 0 && (
                          <span className="text-[10px] text-on-surface-variant ml-0.5">({inst.review_count})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-on-surface-variant font-medium whitespace-nowrap">
                      {inst.hourly_rate ? `$${inst.hourly_rate}/hr` : '—'}
                    </td>
                    <td className="pl-3 pr-6 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-0.5">
                        <a
                          href={`/instructors/${(inst.suburb || '').toLowerCase().replace(/\s+/g, '-')}/${inst.slug || ''}`}
                          target="_blank"
                          className="p-1 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all"
                          title="View Profile"
                        >
                          <span className="material-symbols-outlined text-[15px]">visibility</span>
                        </a>
                        <button
                          onClick={() => setConfirmDelete(inst)}
                          className="p-1 rounded-md text-on-surface-variant hover:text-error hover:bg-error/5 transition-all"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-4 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">
              Showing <span className="font-bold text-on-surface">1-{Math.min(limit, total)}</span> of{' '}
              <span className="font-bold text-on-surface">{total}</span> instructors
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-md border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-md text-xs font-bold transition-colors ${
                        page === pageNum
                          ? 'bg-primary text-on-primary'
                          : 'hover:bg-surface-container text-on-surface'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && page < totalPages - 2 && (
                  <>
                    <span className="px-1 text-outline text-xs">...</span>
                    <button
                      onClick={() => setPage(totalPages)}
                      className="w-8 h-8 rounded-md hover:bg-surface-container text-on-surface text-xs font-medium transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-md border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant">Total Instructors</p>
            <p className="text-xl font-bold text-on-surface">{total.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-secondary-container/30 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant">Verified ADIs</p>
            <p className="text-xl font-bold text-on-surface">{verifiedTotal.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-error-container/10 flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_late</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant">Unclaimed Profiles</p>
            <p className="text-xl font-bold text-on-surface">{unclaimedTotal.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface">
            <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-on-surface-variant">Monthly Growth</p>
            <p className="text-xl font-bold text-on-surface">+12%</p>
          </div>
        </div>
      </div>

      {(confirmDelete || confirmBulkDelete) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl p-5 max-w-sm w-full mx-4 shadow-lg border border-outline-variant">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-error-container/20 flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface">Delete {confirmBulkDelete ? 'Instructors' : 'Instructor'}</h3>
                <p className="text-xs text-on-surface-variant">This action cannot be undone</p>
              </div>
            </div>
            {confirmDelete ? (
              <p className="text-sm text-on-surface-variant mb-1">
                Delete <strong className="text-on-surface">{confirmDelete.first_name} {confirmDelete.last_name}</strong> permanently?
              </p>
            ) : (
              <p className="text-sm text-on-surface-variant mb-1">
                Delete <strong className="text-on-surface">{selectedIds.size} instructors</strong> permanently?
              </p>
            )}
            <p className="text-xs text-error mb-4">All reviews and related data will be removed.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setConfirmDelete(null); setConfirmBulkDelete(false); }}
                className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const ids = confirmDelete ? [confirmDelete.id] : [...selectedIds];
                  const isSingle = !!confirmDelete;
                  if (isSingle) setDeletingId(confirmDelete!.id);
                  else setDeletingBulk(true);
                  try {
                    const res = await fetch('/api/admin/instructors/bulk-delete', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ids }),
                    });
                    if (res.ok) {
                      setConfirmDelete(null);
                      setConfirmBulkDelete(false);
                      setSelectedIds(new Set());
                      fetchInstructors(page, searchQuery);
                    } else {
                      const data = await res.json();
                      alert(data.error || 'Failed to delete');
                    }
                  } catch {
                    alert('Failed to delete');
                  } finally {
                    setDeletingId(null);
                    setDeletingBulk(false);
                  }
                }}
                disabled={deletingId !== null || deletingBulk}
                className="px-3 py-1.5 bg-error text-on-error rounded-lg text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
                {deletingId || deletingBulk ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
