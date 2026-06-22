'use client';

import { useState, useEffect } from 'react';

interface Review {
  id: string;
  reviewer_name: string;
  instructor_name: string;
  rating_overall: number;
  review_text: string | null;
  created_at: string;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-outline-variant/30 animate-pulse">
      <div className="flex-[2] h-4 rounded bg-surface-container-highest" />
      <div className="flex-1 h-4 rounded bg-surface-container-highest" />
      <div className="flex-[3] h-4 rounded bg-surface-container-highest" />
      <div className="w-24 h-8 rounded bg-surface-container-highest" />
    </div>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => {
        if (d.unapprovedReviews) setReviews(d.unapprovedReviews);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const approve = async (id: string) => {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    });
    if (res.ok) setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const reject = async (id: string) => {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject' }),
    });
    if (res.ok) setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Review Moderation</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''} pending moderation
        </p>
      </div>

      {loading ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden">
          {[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-12 text-center">
          <span className="material-symbols-outlined text-[40px] text-outline mb-3">rate_review</span>
          <p className="font-headline-sm text-headline-sm text-on-surface mb-1">All Moderated</p>
          <p className="font-body-md text-body-md text-on-surface-variant">No reviews pending approval.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-4 hover:border-outline transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <span className="font-label-md text-label-md font-bold text-on-surface">{r.reviewer_name}</span>
                    <span className="text-outline text-sm">→</span>
                    <span className="font-label-md text-label-md text-on-surface-variant">{r.instructor_name}</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span
                          key={i}
                          className={`material-symbols-outlined text-sm ${
                            i <= r.rating_overall ? 'text-tertiary-fixed-dim' : 'text-outline-variant'
                          }`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >star</span>
                      ))}
                    </div>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                    &ldquo;{r.review_text || 'No comment'}&rdquo;
                  </p>
                  <p className="font-label-sm text-label-sm text-outline mt-1">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => reject(r.id)}
                    className="px-3 py-1.5 text-xs font-bold text-error hover:bg-error-container rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    Delete
                  </button>
                  <button
                    onClick={() => approve(r.id)}
                    className="px-3 py-1.5 text-xs font-bold text-secondary hover:bg-secondary-container rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
