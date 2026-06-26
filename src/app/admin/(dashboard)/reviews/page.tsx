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
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-[22px] font-bold text-gray-900">Review Moderation</h2>
          <p className="text-sm text-gray-500 mt-1">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''} pending moderation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-[#E5E7EB] text-gray-500 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">sort</span>
            Sort
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#064E3B]/10 text-[#064E3B] rounded-lg text-xs font-bold hover:bg-[#064E3B] hover:text-white transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border-b border-[#E5E7EB]/30 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-gray-200 rounded" />
                  <div className="h-3 w-72 bg-gray-200 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="w-16 h-8 bg-gray-200 rounded-lg" />
                  <div className="w-20 h-8 bg-gray-200 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-[#64748B] mb-4">
            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>rate_review</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">All Moderated</h3>
          <p className="text-gray-500 max-w-sm mx-auto text-sm">No reviews pending approval.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-bold text-gray-900">{r.reviewer_name}</span>
                    <span className="text-gray-400 text-xs">→</span>
                    <span className="text-sm text-gray-500">{r.instructor_name}</span>
                    <div className="flex items-center gap-0.5 ml-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span
                          key={i}
                          className={`material-symbols-outlined text-[14px] ${
                            i <= r.rating_overall ? 'text-amber-500' : 'text-gray-200'
                          }`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >star</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">&ldquo;{r.review_text || 'No comment'}&rdquo;</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => reject(r.id)}
                    className="px-3 py-1.5 border border-red-400 text-red-500 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    Delete
                  </button>
                  <button
                    onClick={() => approve(r.id)}
                    className="px-4 py-1.5 bg-[#064E3B] text-white rounded-lg text-xs font-bold hover:bg-[#053A2C] transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
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
