'use client';

import { useState, useEffect } from 'react';

export default function PortalAvailability() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [available, setAvailable] = useState(days.slice(0, 5));
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/portal/profile')
      .then(r => r.json())
      .then(d => {
        const inst = d.instructor;
        if (inst?.availability_days?.length) setAvailable(inst.availability_days);
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const toggleDay = (day: string) => {
    setAvailable((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability_days: available }),
      });
      showToast(res.ok ? 'Availability saved successfully!' : 'Failed to save.');
    } catch {
      showToast('Failed to save.');
    } finally {
      setSaving(false);
    }
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
          <button onClick={handleSave} disabled={saving}
            className="bg-secondary text-white px-6 py-3 rounded-lg text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50 mt-6">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  );
}
