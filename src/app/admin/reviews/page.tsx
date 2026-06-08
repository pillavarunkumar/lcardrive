'use client';

import { useState } from 'react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([
    { id: 'r1', reviewer: 'Tom', instructor: 'Sarah Mitchell', rating: 5, text: 'Sarah is an amazing instructor. Very patient and calm.', submittedAt: '2026-05-23' },
    { id: 'r2', reviewer: 'Anna', instructor: 'James Chen', rating: 4, text: 'Good instructor, helped me improve my parallel parking.', submittedAt: '2026-05-22' },
  ]);

  const approve = (id: string) => setReviews((prev) => prev.filter((r) => r.id !== id));
  const reject = (id: string) => setReviews((prev) => prev.filter((r) => r.id !== id));

  if (reviews.length === 0) {
    return <div className="text-center py-16"><p className="text-outline">All reviews moderated.</p></div>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r.id} className="border border-outline-variant rounded-2xl p-6 card-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold text-on-surface">{r.reviewer}</span>
                <span className="text-sm text-outline">→</span>
                <span className="text-sm font-medium text-on-surface-variant">{r.instructor}</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className={`material-symbols-outlined text-sm ${
                      i <= r.rating ? 'text-[#fbbf24]' : 'text-outline-variant'
                    }`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-on-surface-variant mb-1">&ldquo;{r.text}&rdquo;</p>
              <p className="text-xs text-outline">{r.submittedAt}</p>
            </div>
            <div className="flex items-center gap-2 ml-4 shrink-0">
              <button onClick={() => reject(r.id)} className="p-2 rounded-lg hover:bg-error-container text-error transition-colors" title="Delete">
                <span className="material-symbols-outlined">delete</span>
              </button>
              <button onClick={() => approve(r.id)} className="p-2 rounded-lg hover:bg-secondary-container text-secondary transition-colors" title="Approve">
                <span className="material-symbols-outlined">check</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
