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
        <h1 className="text-xl font-bold text-gray-900">Review Moderation</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''} pending moderation
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border-b border-gray-50 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-40 bg-gray-100 rounded" />
                  <div className="h-3 w-64 bg-gray-100 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="w-14 h-7 bg-gray-100 rounded-md" />
                  <div className="w-16 h-7 bg-gray-100 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <span className="material-symbols-outlined text-[36px] text-gray-300 mb-2">rate_review</span>
          <p className="text-sm font-semibold text-gray-900 mb-0.5">All Moderated</p>
          <p className="text-xs text-gray-500">No reviews pending approval.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-semibold text-gray-900">{r.reviewer_name}</span>
                    <span className="text-gray-300 text-xs">→</span>
                    <span className="text-sm text-gray-500">{r.instructor_name}</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span
                          key={i}
                          className={`material-symbols-outlined text-[12px] ${
                            i <= r.rating_overall ? 'text-amber-400' : 'text-gray-200'
                          }`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >star</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">&ldquo;{r.review_text || 'No comment'}&rdquo;</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => reject(r.id)}
                    className="px-2.5 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[12px]">delete</span>
                    Delete
                  </button>
                  <button
                    onClick={() => approve(r.id)}
                    className="px-2.5 py-1 text-[10px] font-bold text-primary hover:bg-primary/10 rounded-md transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[12px]">check</span>
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
