'use client';

import { useState, useEffect } from 'react';

interface PackageOption {
  hours: number;
  price: number;
  label: string;
}

export default function PortalRates() {
  const [hourlyRate, setHourlyRate] = useState(65);
  const [lessonDuration, setLessonDuration] = useState(60);
  const [packages, setPackages] = useState<PackageOption[]>([
    { hours: 5, price: 300, label: '5-Hour Pack' },
    { hours: 10, price: 550, label: '10-Hour Pack' },
  ]);
  const [pkgHours, setPkgHours] = useState('');
  const [pkgPrice, setPkgPrice] = useState('');
  const [pkgLabel, setPkgLabel] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/portal/profile')
      .then(r => r.json())
      .then(d => {
        const inst = d.instructor;
        if (!inst) return;
        if (inst.hourly_rate) setHourlyRate(inst.hourly_rate);
        if (inst.lesson_duration_mins) setLessonDuration(inst.lesson_duration_mins);
        if (inst.package_options?.length) setPackages(inst.package_options);
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const addPackage = () => {
    const h = parseInt(pkgHours);
    const p = parseInt(pkgPrice);
    if (h > 0 && p > 0 && pkgLabel.trim()) {
      setPackages([...packages, { hours: h, price: p, label: pkgLabel.trim() }]);
      setPkgHours('');
      setPkgPrice('');
      setPkgLabel('');
    }
  };
  const removePackage = (i: number) => setPackages(packages.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hourly_rate: hourlyRate, lesson_duration_mins: lessonDuration, package_options: packages }),
      });
      showToast(res.ok ? 'Rates saved successfully!' : 'Failed to save rates.');
    } catch {
      showToast('Failed to save rates.');
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
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-6">Rates & Packages</h1>
        <div className="border border-outline-variant rounded-2xl p-6 md:p-8 card-shadow space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Hourly Rate ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-body-md">$</span>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
                  min={0}
                  className="bg-surface border border-outline-variant/60 rounded-lg pl-8 pr-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all w-full"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Lesson Duration</label>
              <div className="flex flex-wrap gap-2">
                {[60, 90].map((d) => (
                  <label key={d} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                    lessonDuration === d ? 'border-secondary bg-surface-container' : 'border-outline-variant'
                  }`}>
                    <input
                      type="radio"
                      name="duration"
                      checked={lessonDuration === d}
                      onChange={() => setLessonDuration(d)}
                      className="accent-secondary"
                    />
                    <span className="text-sm font-medium text-on-surface">{d} min</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-outline-variant/30 pt-6">
            <label className="font-label-sm text-label-sm text-on-surface-variant block mb-4">Packages</label>
            {packages.length > 0 && (
              <div className="space-y-2 mb-4">
                {packages.map((pkg, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-outline-variant bg-surface">
                    <div>
                      <span className="text-sm font-medium text-on-surface">{pkg.label}</span>
                      <span className="text-xs text-on-surface-variant ml-3">{pkg.hours} hours</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-secondary">${pkg.price}</span>
                      <button onClick={() => removePackage(i)} className="text-on-surface-variant hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-on-surface-variant">Label</label>
                <input type="text" placeholder="e.g. Starter Pack" value={pkgLabel} onChange={(e) => setPkgLabel(e.target.value)}
                  className="bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-on-surface-variant">Hours</label>
                <input type="number" placeholder="5" value={pkgHours} onChange={(e) => setPkgHours(e.target.value)} min={1}
                  className="bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-on-surface-variant">Price ($)</label>
                <input type="number" placeholder="300" value={pkgPrice} onChange={(e) => setPkgPrice(e.target.value)} min={0}
                  className="bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 text-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all" />
              </div>
              <button onClick={addPackage}
                className="bg-surface-container-high hover:bg-surface-container-higher text-on-surface rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">add</span> Add Package
              </button>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="bg-secondary text-white px-6 py-3 rounded-lg text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  );
}
