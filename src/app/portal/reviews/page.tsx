'use client';

import { useState, useEffect } from 'react';

interface Review {
  id: string;
  student_name: string;
  rating: number;
  content: string;
  created_at: string;
  tags: string[];
  passed_first_attempt?: boolean;
}

export default function PortalReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal/reviews')
      .then(r => r.json())
      .then(d => { if (d.reviews) setReviews(d.reviews); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length)
    : 0;

  const breakdown = {
    patience: 5.0,
    communication: 4.8,
    value: 4.7,
    punctuality: 4.9,
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-gutter mb-gutter">
        <div className="col-span-12 lg:col-span-4 bg-white border border-[#E5E7EB] shadow-sm rounded-[20px] p-8 flex flex-col justify-center items-center text-center">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Instructor Quality Score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-bold text-gray-900">{reviews.length > 0 ? avgRating.toFixed(1) : '\u2014'}</span>
            <span className="text-2xl text-gray-500">/ 5.0</span>
          </div>
          <div className="flex gap-1 my-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={`material-symbols-outlined ${s <= Math.round(avgRating) ? 'text-[#F59E0B]' : 'text-gray-200'}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            ))}
          </div>
          <p className="text-sm text-gray-500">Based on {reviews.length} verified learner review{reviews.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="col-span-12 lg:col-span-8 bg-white border border-[#E5E7EB] shadow-sm rounded-[20px] p-8">
          {reviews.length > 0 ? (
            <>
              <h3 className="text-base font-semibold text-gray-900 mb-6">Experience Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {Object.entries(breakdown).map(([key, val]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize text-gray-900">{key}</span>
                      <span className="text-sm font-bold text-gray-900">{val.toFixed(1)}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#064E3B] rounded-full transition-all duration-1000" style={{ width: `${(val / 5) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">chart_data</span>
              <p className="text-sm text-gray-500">Breakdown data will appear once reviews are received.</p>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] shadow-sm rounded-[20px] p-6 animate-pulse">
              <div className="flex gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-100" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
              <div className="h-4 bg-gray-100 rounded w-full mb-2" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-[#E5E7EB] shadow-sm rounded-[20px]">
          <span className="material-symbols-outlined text-6xl text-gray-300">star</span>
          <h3 className="text-base font-semibold text-gray-900 mt-4 mb-1">No reviews yet</h3>
          <p className="text-gray-500 max-w-sm text-sm">Reviews from your students will appear here once they complete their lessons.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => {
            const initials = review.student_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            return (
              <div key={review.id} className="bg-white border border-[#E5E7EB] shadow-sm rounded-[20px] p-6 transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">{initials}</div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{review.student_name}</h4>
                      <p className="text-[12px] text-gray-500">{new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex text-[#F59E0B]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: `'FILL' ${s <= review.rating ? 1 : 0}` }}>star</span>
                      ))}
                    </div>
                    {review.passed_first_attempt && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[12px] font-bold">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Passed First Attempt
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{review.content}</p>
                {review.tags && review.tags.length > 0 && (
                  <div className="mt-4 flex gap-2">
                    {review.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-500 rounded-md text-[11px] font-medium">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {reviews.length > 5 && (
            <div className="mt-12 flex justify-center items-center gap-4">
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-gray-50 transition-colors disabled:opacity-30" disabled>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#064E3B] text-white font-bold">1</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-gray-50 transition-colors text-gray-900">2</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-gray-50 transition-colors text-gray-900">3</button>
              </div>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-gray-50 transition-colors text-gray-900">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
