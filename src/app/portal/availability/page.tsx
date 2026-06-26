'use client';

import { useState, useEffect, useRef } from 'react';

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
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
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

  function formatTime24To12(val: string) {
    if (!val) return '';
    const [h, m] = val.split(':');
    const hh = parseInt(h);
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
    return `${String(h12).padStart(2, '0')}:${m} ${ampm}`;
  }

  const startEdit = (day: string) => {
    setEditingDay(day);
    const existing = schedule[day]?.timeRange || '';
    const match = existing.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*(?:—|-|to)\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      const to24 = (h: string, m: string, ap: string) => {
        let hh = parseInt(h);
        if (ap === 'PM' && hh !== 12) hh += 12;
        if (ap === 'AM' && hh === 12) hh = 0;
        return `${String(hh).padStart(2, '0')}:${m}`;
      };
      setEditStartTime(to24(match[1], match[2], match[3]));
      setEditEndTime(to24(match[4], match[5], match[6]));
    } else {
      setEditStartTime('08:00');
      setEditEndTime('18:00');
    }
  };

  const saveEdit = () => {
    if (!editStartTime || !editEndTime) {
      setTimeError('Select both start and end times.');
      return;
    }
    if (editStartTime >= editEndTime) {
      setTimeError('End time must be after start time.');
      return;
    }
    if (editingDay) {
      const formatted = `${formatTime24To12(editStartTime)} — ${formatTime24To12(editEndTime)}`;
      setSchedule((prev) => ({
        ...prev,
        [editingDay]: { ...prev[editingDay], timeRange: formatted },
      }));
    }
    setTimeError('');
    setEditingDay(null);
    setEditStartTime('');
    setEditEndTime('');
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

  function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);
    const times: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (const m of ['00', '30']) {
        times.push(`${String(h).padStart(2, '0')}:${m}`);
      }
    }
    return (
      <div className="relative" ref={ref}>
        <button type="button" onClick={() => setOpen(!open)}
          className="px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm font-medium text-gray-900 hover:border-[#064E3B] transition-colors flex items-center gap-2 min-w-[100px]">
          <span className="material-symbols-outlined text-[18px] text-[#064E3B]">schedule</span>
          {value || 'Select'}
        </button>
        {open && (
          <div className="absolute top-full mt-1 left-0 z-50 w-44 bg-white border border-[#E5E7EB] rounded-[20px] shadow-lg max-h-60 overflow-y-auto">
            {times.map(t => {
              const [h, m] = t.split(':');
              const hh = parseInt(h);
              const ampm = hh >= 12 ? 'PM' : 'AM';
              const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
              const label = `${String(h12).padStart(2, '0')}:${m} ${ampm}`;
              const selected = t === value;
              return (
                <button key={t} type="button" onClick={() => { onChange(t); setOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    selected ? 'bg-[#064E3B] text-white font-semibold' : 'text-gray-700 hover:bg-[#064E3B]/10 hover:text-[#064E3B]'
                  }`}>
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function parseTimeRange(value: string) {
    return value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*(?:—|-|to)\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  }

  function isValidTimeRange(value: string) {
    return Boolean(parseTimeRange(value));
  }

  return (
    <>
      {toast && (
        <div className="fixed bottom-8 right-8 z-[60] bg-[#064E3B] text-white px-6 py-4 rounded-[20px] shadow-2xl flex items-center gap-3">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <p className="font-bold">{toast}</p>
        </div>
      )}

      <div className="mb-8 p-4 bg-white border border-[#E5E7EB] rounded-[20px] shadow-sm flex items-start gap-4">
        <span className="material-symbols-outlined text-[#064E3B] mt-1">info</span>
        <div>
          <p className="text-sm text-gray-900 font-semibold">General Availability Configuration</p>
          <p className="text-gray-500 text-sm">This screen manages your default recurring weekly schedule. It determines which hours students can see as potentially available when searching for lessons.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter max-w-5xl">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-semibold text-gray-900 mb-2">Weekly Schedule</h3>
          <div className="space-y-3">
            {WEEKDAYS.map((day) => {
              const data = schedule[day];
              if (!data) return null;
              const isEditing = editingDay === day;
              return (
                <div
                  key={day}
                  className={`p-6 rounded-[20px] flex items-center justify-between transition-shadow hover:shadow-md ${
                    data.enabled
                      ? 'bg-white border border-[#E5E7EB] shadow-sm'
                      : 'bg-white border border-[#E5E7EB]/50 opacity-70 grayscale'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <span className={`text-sm font-bold w-24 ${data.enabled ? 'text-gray-900' : 'text-gray-500'}`}>{day}</span>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <TimePicker value={editStartTime} onChange={(v) => { setEditStartTime(v); setTimeError(''); }} />
                        <span className="text-gray-400 text-sm font-semibold">—</span>
                        <TimePicker value={editEndTime} onChange={(v) => { setEditEndTime(v); setTimeError(''); }} />
                        <button onClick={saveEdit} className="text-[#064E3B] text-sm font-bold hover:underline">Save</button>
                        <button onClick={() => { setEditingDay(null); setEditStartTime(''); setEditEndTime(''); }} className="text-gray-500 text-sm hover:underline">Cancel</button>
                      </div>
                    ) : (
                      <div className="hidden md:flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1 rounded-full text-sm">
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
                      <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#064E3B] transition-colors relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6"></div>
                    </label>
                    <button
                      onClick={() => startEdit(day)}
                      className={`p-2 transition-colors ${data.enabled ? 'text-gray-500 hover:text-[#064E3B]' : 'text-gray-300 pointer-events-none'}`}
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {timeError && <p className="text-sm text-red-500 mt-3">{timeError}</p>}
        </div>

        <div className="space-y-6 sticky top-28">
          <div className="bg-white border border-[#E5E7EB] shadow-sm rounded-[20px] p-8">
            <h3 className="text-base font-semibold text-gray-900 mb-6">Overview</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#E5E7EB]">
                <span className="text-sm text-gray-500">Working Days</span>
                <span className="font-bold text-gray-900">{activeDays} / 7 Days</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-[#E5E7EB]">
                <span className="text-sm text-gray-500">Total Hours / Week</span>
                <span className="font-bold text-gray-900">{calcTotalHours()} Hours</span>
              </div>
            </div>
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-[#E5E7EB]">
              <p className="text-[10px] text-[#064E3B] font-semibold uppercase mb-2 tracking-wide">Instructor Tip</p>
              <p className="text-sm text-gray-500 italic">&ldquo;Instructors with late-evening availability (after 5 PM) on weekdays see a 35% higher booking rate from working students.&rdquo;</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-8 bg-[#064E3B] text-white py-4 rounded-xl font-bold hover:bg-[#053A2C] transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => {
                setSchedule(savedSchedule);
                setEditingDay(null);
                setEditStartTime(''); setEditEndTime('');
                setTimeError('');
                showToast('Unsaved changes discarded.');
              }}
              className="w-full mt-3 bg-transparent border border-[#E5E7EB] text-gray-500 py-3 rounded-xl hover:bg-gray-50 transition-all"
            >
              Discard Edits
            </button>
          </div>

          <div className="bg-white border border-[#E5E7EB] shadow-sm rounded-[20px] p-6">
            <p className="text-gray-900 font-semibold mb-4">Availability Density</p>
            <div className="h-32 flex items-end gap-1 px-2">
              {densityChart.map((h, i) => (
                <div key={i} className={`flex-1 rounded-t-sm ${h > 0 ? 'bg-[#064E3B]/30' : 'bg-gray-100'}`} style={{ height: `${h || 5}%` }}></div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
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
