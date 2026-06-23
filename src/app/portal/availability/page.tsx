'use client';

import { useState, useEffect } from 'react';

const SLOTS = [
  { key: 'morning', label: 'Morning', time: '6am – 12pm', icon: 'wb_sunny' },
  { key: 'afternoon', label: 'Afternoon', time: '12pm – 5pm', icon: 'light_mode' },
  { key: 'evening', label: 'Evening', time: '5pm – 9pm', icon: 'nightlight' },
];

type Availability = Record<string, string[]>;

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function dayName(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
}

function isPastDate(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr + 'T00:00:00') < today;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function PortalAvailability() {
  const [availability, setAvailability] = useState<Availability>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [dateInput, setDateInput] = useState('');

  useEffect(() => {
    fetch('/api/portal/profile')
      .then((r) => r.json())
      .then((d) => {
        const inst = d.instructor;
        if (inst?.availability_slots && Object.keys(inst.availability_slots).length > 0) {
          setAvailability(inst.availability_slots);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const addDate = () => {
    if (!dateInput) return;
    if (availability[dateInput]) {
      showToast('Date already added.');
      return;
    }
    setAvailability((prev) => ({ ...prev, [dateInput]: [] }));
    setDateInput('');
  };

  const removeDate = (date: string) => {
    setAvailability((prev) => {
      const next = { ...prev };
      delete next[date];
      return next;
    });
  };

  const toggleSlot = (date: string, slot: string) => {
    setAvailability((prev) => {
      const current = prev[date] || [];
      const next = current.includes(slot)
        ? current.filter((s) => s !== slot)
        : [...current, slot];
      return { ...prev, [date]: next };
    });
  };

  const totalSlots = Object.values(availability).reduce((acc, slots) => acc + slots.length, 0);
  const datesActive = Object.keys(availability).length;

  const sortedDates = Object.keys(availability).sort();

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability_slots: availability }),
      });
      if (res.ok) {
        showToast('Availability saved successfully!');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save.');
      }
    } catch {
      showToast('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {toast && (
        <div className="fixed top-6 right-6 z-[60] bg-primary text-white px-5 py-3 rounded-xl shadow-lg font-label-md text-label-md animate-in fade-in">
          {toast}
        </div>
      )}
      <div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-1">Availability</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">Add specific dates and set your available time slots.</p>

        {loading ? (
          <div className="border border-outline-variant rounded-2xl p-6 md:p-8 card-shadow max-w-3xl animate-pulse">
            <div className="h-10 bg-surface-container-highest rounded-xl mb-6" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-surface-container-highest rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <div className="border border-outline-variant rounded-2xl p-6 md:p-8 card-shadow max-w-3xl">
            {/* Date Picker */}
            <div className="flex items-end gap-3 mb-6">
              <div className="flex-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant mb-1 block">Select Date</label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  min={todayStr()}
                  className="w-full px-3 py-2.5 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-on-surface transition-all"
                />
              </div>
              <button
                onClick={addDate}
                disabled={!dateInput}
                className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Date
              </button>
            </div>

            {/* Dates List */}
            {sortedDates.length === 0 ? (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-[40px] text-outline">calendar_month</span>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">No dates added yet. Pick a date above to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedDates.map((date) => {
                  const slots = availability[date] || [];
                  const past = isPastDate(date);
                  return (
                    <div
                      key={date}
                      className={`rounded-xl border-2 transition-all ${
                        past
                          ? 'border-outline-variant/30 bg-surface opacity-60'
                          : slots.length > 0
                            ? 'border-primary bg-primary/5'
                            : 'border-dashed border-warning bg-warning/5'
                      }`}
                    >
                      <div className="p-3">
                        {/* Date header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              slots.length > 0 ? 'bg-primary text-white' : 'bg-warning/20 text-warning'
                            }`}>
                              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm ${slots.length > 0 ? 'text-primary' : 'text-warning'}`}>
                                  {formatDate(date)}
                                </span>
                                <span className="text-[11px] text-outline">{dayName(date)}{past ? ' (past)' : ''}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {slots.length > 0 && (
                              <span className="text-xs font-medium text-primary">{slots.length}/{SLOTS.length} slots</span>
                            )}
                            <button
                              onClick={() => removeDate(date)}
                              className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-lg hover:bg-error-container/30"
                              title="Remove date"
                            >
                              <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                          </div>
                        </div>

                        {/* Slot toggles */}
                        <div className="flex flex-wrap gap-2">
                          {SLOTS.map((slot) => {
                            const selected = slots.includes(slot.key);
                            return (
                              <button
                                key={slot.key}
                                type="button"
                                onClick={() => toggleSlot(date, slot.key)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                                  selected
                                    ? 'bg-primary text-white border-primary shadow-sm'
                                    : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[14px]">{slot.icon}</span>
                                <span>{slot.label}</span>
                                <span className="opacity-60">({slot.time})</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Prompt when no slots selected */}
                        {slots.length === 0 && !past && (
                          <div className="mt-2 flex items-center gap-1.5 text-warning animate-pulse">
                            <span className="material-symbols-outlined text-[14px]">touch_app</span>
                            <span className="text-[11px] font-medium">Tap the time slots above to set your availability for this date</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary */}
            {sortedDates.length > 0 && (
              <div className="mt-6 p-4 bg-surface-container-high rounded-xl border border-outline-variant/30">
                <h3 className="font-label-md text-label-md text-on-surface mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">summarize</span>
                  Availability Summary
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sortedDates.map((date) => {
                    const slots = availability[date] || [];
                    const hasSlots = slots.length > 0;
                    return (
                      <div key={date} className={`text-sm p-2 rounded-lg ${hasSlots ? '' : 'bg-warning/10 border border-dashed border-warning/30'}`}>
                        <span className={`font-bold ${hasSlots ? 'text-primary' : 'text-warning'}`}>{formatDate(date)}</span>
                        <span className="text-on-surface-variant">
                          {hasSlots
                            ? `: ${slots.map((s) => SLOTS.find((sl) => sl.key === s)?.label).join(', ')}`
                            : ' — no slots selected'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-outline mt-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {totalSlots} time slots across {datesActive} {datesActive === 1 ? 'date' : 'dates'}
                  {totalSlots === 0 && datesActive > 0 && (
                    <span className="text-warning font-medium"> — select time slots to continue</span>
                  )}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <div>
                {datesActive > 0 && totalSlots === 0 && (
                  <p className="text-xs text-warning flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    Select at least one time slot to save
                  </p>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={saving || totalSlots === 0}
                className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
