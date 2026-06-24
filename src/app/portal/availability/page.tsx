'use client';

import { useState, useEffect } from 'react';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_TIMES: Record<string, string> = {
  Monday: '08:00 AM — 06:00 PM',
  Tuesday: '08:00 AM — 06:00 PM',
  Wednesday: '08:00 AM — 08:00 PM',
  Thursday: '08:00 AM — 06:00 PM',
  Friday: '08:00 AM — 05:00 PM',
  Saturday: 'Unavailable',
  Sunday: 'Unavailable',
};

const DAY_CODES: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

const DEFAULT_SCHEDULE = () => {
  const initial: Record<string, { enabled: boolean; timeRange: string }> = {};
  WEEKDAYS.forEach((day) => {
    initial[day] = {
      enabled: day !== 'Saturday' && day !== 'Sunday',
      timeRange: DEFAULT_TIMES[day],
    };
  });
  return initial;
};

export default function PortalAvailability() {
  const [schedule, setSchedule] = useState<Record<string, { enabled: boolean; timeRange: string }>>({});
  const [savedSchedule, setSavedSchedule] = useState<Record<string, { enabled: boolean; timeRange: string }>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editTimeRange, setEditTimeRange] = useState('');
  const [timeError, setTimeError] = useState('');

  useEffect(() => {
    fetch('/api/portal/profile')
      .then(r => r.json())
      .then(d => {
        const inst = d.instructor;
        const loaded = DEFAULT_SCHEDULE();
        WEEKDAYS.forEach((day) => {
          const code = DAY_CODES[day];
          const slot = inst?.availability_slots?.[day]?.[0] || inst?.availability_slots?.[code]?.[0];
          loaded[day] = {
            enabled: inst?.availability_days?.includes(code) || inst?.availability_days?.includes(day) || Boolean(slot),
            timeRange: slot || DEFAULT_TIMES[day],
          };
        });
        setSchedule(loaded);
        setSavedSchedule(loaded);
      })
      .catch(() => {
        const initial = DEFAULT_SCHEDULE();
        setSchedule(initial);
        setSavedSchedule(initial);
      });
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const toggleDay = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day]?.enabled,
      },
    }));
  };

  const startEdit = (day: string) => {
    setEditingDay(day);
    setEditTimeRange(schedule[day]?.timeRange || '');
  };

  const saveEdit = () => {
    const normalized = editTimeRange.trim();
    if (!isValidTimeRange(normalized)) {
      setTimeError('Use a format like 08:00 AM - 06:00 PM.');
      return;
    }
    if (editingDay && editTimeRange.trim()) {
      setSchedule((prev) => ({
        ...prev,
        [editingDay]: { ...prev[editingDay], timeRange: normalized },
      }));
    }
    setTimeError('');
    setEditingDay(null);
    setEditTimeRange('');
  };

  const activeDays = Object.values(schedule).filter((d) => d.enabled).length;

  const calcTotalHours = () => {
    let total = 0;
    Object.entries(schedule).forEach(([day, data]) => {
      if (!data.enabled) return;
      const match = parseTimeRange(data.timeRange);
      if (match) {
        let startH = parseInt(match[1]) + (match[3] === 'PM' && parseInt(match[1]) !== 12 ? 12 : 0);
        if (match[3] === 'AM' && parseInt(match[1]) === 12) startH = 0;
        let endH = parseInt(match[4]) + (match[6] === 'PM' && parseInt(match[4]) !== 12 ? 12 : 0);
        if (match[6] === 'AM' && parseInt(match[4]) === 12) endH = 0;
      if (endH <= startH) endH += 24;
        total += endH - startH;
      }
    });
    return total;
  };

  const handleSave = async () => {
    setSaving(true);
    const availabilityDays = WEEKDAYS
      .filter((day) => schedule[day]?.enabled)
      .map((day) => DAY_CODES[day]);
    const availabilitySlots = WEEKDAYS.reduce<Record<string, string[]>>((acc, day) => {
      if (schedule[day]?.enabled) acc[DAY_CODES[day]] = [schedule[day].timeRange];
      return acc;
    }, {});

    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability_days: availabilityDays, availability_slots: availabilitySlots }),
      });
      if (res.ok) {
        setSavedSchedule(schedule);
        showToast('Availability saved successfully!');
      }
      else showToast('Failed to save.');
    } catch {
      showToast('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const densityChart = WEEKDAYS.map((day) => {
    const data = schedule[day];
    if (!data?.enabled) return 0;
    const match = parseTimeRange(data.timeRange);
    if (match) {
      let startH = parseInt(match[1]) + (match[3] === 'PM' && parseInt(match[1]) !== 12 ? 12 : 0);
      if (match[3] === 'AM' && parseInt(match[1]) === 12) startH = 0;
      let endH = parseInt(match[4]) + (match[6] === 'PM' && parseInt(match[4]) !== 12 ? 12 : 0);
      if (match[6] === 'AM' && parseInt(match[4]) === 12) endH = 0;
      if (endH <= startH) endH += 12;
      return Math.min(100, ((endH - startH) / 14) * 100);
    }
    return 0;
  });

  function parseTimeRange(value: string) {
    return value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*(?:—|-|to)\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  }

  function isValidTimeRange(value: string) {
    return Boolean(parseTimeRange(value));
  }

  return (
    <>
      {toast && (
        <div className="fixed bottom-8 right-8 z-[60] bg-primary text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <p className="font-bold">{toast}</p>
        </div>
      )}

      <div className="mb-8 p-4 bg-surface-container-low border border-outline-variant rounded-xl flex items-start gap-4">
        <span className="material-symbols-outlined text-primary mt-1">info</span>
        <div>
          <p className="text-body-md font-body-md text-on-surface font-semibold">General Availability Configuration</p>
          <p className="text-body-md font-body-md text-on-surface-variant text-sm">This screen manages your default recurring weekly schedule. It determines which hours students can see as potentially available when searching for lessons.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter max-w-5xl">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-headline-md font-headline-md text-primary mb-2">Weekly Schedule</h3>
          <div className="space-y-3">
            {WEEKDAYS.map((day) => {
              const data = schedule[day];
              if (!data) return null;
              const isEditing = editingDay === day;
              return (
                <div
                  key={day}
                  className={`p-6 rounded-xl flex items-center justify-between transition-shadow hover:shadow-sm ${
                    data.enabled
                      ? 'bg-surface-container-lowest border border-outline-variant'
                      : 'bg-surface-container-low/30 border border-outline-variant/50 opacity-70 grayscale'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <span className={`text-body-lg font-bold w-24 ${data.enabled ? 'text-primary' : 'text-secondary'}`}>{day}</span>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editTimeRange}
                          onChange={(e) => {
                            setEditTimeRange(e.target.value);
                            setTimeError('');
                          }}
                          className="px-3 py-1 bg-white border border-outline-variant rounded text-sm outline-none focus:ring-1 focus:ring-primary"
                          placeholder="e.g. 08:00 AM - 06:00 PM"
                        />
                        <button onClick={saveEdit} className="text-primary text-sm font-bold hover:underline">Save</button>
                        <button onClick={() => setEditingDay(null)} className="text-secondary text-sm hover:underline">Cancel</button>
                      </div>
                    ) : (
                      <div className="hidden md:flex items-center gap-2 text-on-surface-variant bg-surface-container px-3 py-1 rounded-full text-sm">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span>{data.enabled ? data.timeRange : 'Unavailable'}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.enabled}
                        onChange={() => toggleDay(day)}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-secondary-container rounded-full peer peer-checked:bg-primary transition-colors relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6"></div>
                    </label>
                    <button
                      onClick={() => startEdit(day)}
                      className={`p-2 transition-colors ${data.enabled ? 'text-secondary hover:text-primary' : 'text-secondary/30 pointer-events-none'}`}
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {timeError && <p className="text-sm text-error mt-3">{timeError}</p>}
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 sticky top-28">
            <h3 className="text-headline-md font-headline-md text-primary mb-6">Overview</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-outline-variant">
                <span className="text-secondary text-body-md font-body-md">Working Days</span>
                <span className="font-bold text-primary">{activeDays} / 7 Days</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-outline-variant">
                <span className="text-secondary text-body-md font-body-md">Total Hours / Week</span>
                <span className="font-bold text-primary">{calcTotalHours()} Hours</span>
              </div>
            </div>
            <div className="mt-8 p-4 bg-primary-container/5 rounded-xl border border-primary-container/10">
              <p className="text-label-sm font-label-sm text-primary uppercase mb-2 tracking-wider">Instructor Tip</p>
              <p className="text-body-md font-body-md text-sm text-on-surface-variant italic">&ldquo;Instructors with late-evening availability (after 5 PM) on weekdays see a 35% higher booking rate from working students.&rdquo;</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-8 bg-primary text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => {
                setSchedule(savedSchedule);
                setEditingDay(null);
                setEditTimeRange('');
                setTimeError('');
                showToast('Unsaved changes discarded.');
              }}
              className="w-full mt-3 bg-transparent border border-outline text-secondary py-3 rounded-xl hover:bg-surface-container transition-all"
            >
              Discard Edits
            </button>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
            <p className="text-primary font-bold mb-4">Availability Density</p>
            <div className="h-32 flex items-end gap-1 px-2">
              {densityChart.map((h, i) => (
                <div key={i} className={`flex-1 rounded-t-sm ${h > 0 ? 'bg-primary-container' : 'bg-primary-container/10'}`} style={{ height: `${h || 5}%` }}></div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-secondary font-bold uppercase tracking-tighter">
              {WEEKDAYS.map((d) => (
                <span key={d}>{d.slice(0, 3)}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
