'use client';

import { useState } from 'react';

export default function PortalAvailability() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [available, setAvailable] = useState(days.slice(0, 5));
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const toggleDay = (day: string) => {
    setAvailable((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <>
      {toast && (
        <div className="fixed top-6 right-6 z-[60] bg-secondary text-on-secondary px-5 py-3 rounded-xl shadow-lg font-label-md text-label-md animate-in fade-in">
          {toast}
        </div>
      )}
      <div>
        <h1 className="font-display text-2xl font-bold text-on-surface mb-6">Availability</h1>
        <div className="border border-outline-variant rounded-2xl p-6 md:p-8 card-shadow max-w-2xl">
          <h3 className="font-bold text-on-surface mb-4">Days Available</h3>
          <div className="flex flex-wrap gap-3">
            {days.map((day) => (
              <label key={day} className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                available.includes(day) ? 'border-secondary bg-surface-container' : 'border-outline-variant'
              }`}>
                <input
                  type="checkbox"
                  checked={available.includes(day)}
                  onChange={() => toggleDay(day)}
                  className="accent-secondary rounded"
                />
                <span className="text-sm font-medium text-on-surface">{day}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-outline mt-4">* Self-reported availability. Learners will contact you to confirm times.</p>
          <button onClick={() => showToast('Availability saved successfully!')} className="bg-secondary text-white px-6 py-3 rounded-lg text-sm font-bold hover:brightness-110 transition-all mt-6">Save Changes</button>
        </div>
      </div>
    </>
  );
}
