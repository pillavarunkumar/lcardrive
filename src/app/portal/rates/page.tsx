'use client';

import { useState, useEffect } from 'react';

interface PackageOption {
  hours: number;
  price: number;
  label: string;
}

export default function PortalRates() {
  const [hourlyRate, setHourlyRate] = useState(70);
  const [packages, setPackages] = useState<PackageOption[]>([
    { hours: 5, price: 325, label: '5 Lesson Starter' },
    { hours: 10, price: 630, label: '10 Lesson Professional' },
  ]);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/portal/profile')
      .then(r => r.json())
      .then(d => {
        const inst = d.instructor;
        if (!inst) return;
        if (inst.hourly_rate !== null && inst.hourly_rate !== undefined) setHourlyRate(inst.hourly_rate);
        if (inst.package_options?.length) setPackages(inst.package_options);
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const updatePkg = (idx: number, field: 'hours' | 'price', val: number) => {
    setPackages(prev => prev.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hourly_rate: hourlyRate, package_options: packages }),
      });
      if (res.ok) {
        showToast('Pricing changes saved successfully!');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Failed to save.');
      }
    } catch {
      showToast('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const val5 = hourlyRate * 5;
  const sav5 = val5 - (packages[0]?.price || 0);
  const perc5 = val5 > 0 ? Math.round((sav5 / val5) * 100) : 0;
  const val10 = hourlyRate * 10;
  const sav10 = val10 - (packages[1]?.price || 0);
  const perc10 = val10 > 0 ? Math.round((sav10 / val10) * 100) : 0;

  return (
    <>
      {toast && (
        <div className="fixed bottom-8 right-8 z-[60] bg-primary text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
          <span className="material-symbols-outlined">check_circle</span>
          <p className="font-bold">{toast}</p>
        </div>
      )}
      <div className="mb-8">
        <p className="text-secondary text-body-md font-body-md flex items-center gap-2">
          Settings <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-semibold">Pricing &amp; Packages</span>
        </p>
      </div>
      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-12 lg:col-span-7 space-y-gutter">
          <section className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-headline-md font-headline-md text-primary mb-1">Standard Rate</h2>
                <p className="text-secondary text-body-md font-body-md">Set your base hourly rate for individual lessons.</p>
              </div>
              <span className="material-symbols-outlined text-primary-container text-3xl">payments</span>
            </div>
            <div className="relative max-w-xs">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">$</span>
              <input
                className="w-full pl-8 pr-16 py-4 bg-surface border border-outline rounded-lg text-[32px] font-bold text-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary text-body-md font-body-md">/ hr</span>
            </div>
            <p className="mt-4 text-sm text-secondary italic">Average instructor rate in your area: $65 \u2014 $75/hr</p>
          </section>

          <section className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-headline-md font-headline-md text-primary mb-1">Lesson Packages</h2>
                <p className="text-secondary text-body-md font-body-md">Offer discounts for multi-lesson bookings to encourage commitment.</p>
              </div>
              <span className="material-symbols-outlined text-primary-container text-3xl">redeem</span>
            </div>
            <div className="space-y-6">
              {packages.map((pkg, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-surface rounded-lg border border-outline-variant">
                  <div>
                    <h3 className="text-body-lg font-bold text-on-surface">{pkg.label}</h3>
                    <p className="text-sm text-secondary">Ideal for beginners starting their journey</p>
                  </div>
                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="text-right">
                      <p className="text-xs text-secondary uppercase tracking-wider">Package Price</p>
                      <div className="flex items-center gap-2">
                        <span className="text-on-surface font-bold">$</span>
                        <input
                          className="w-24 px-2 py-1 bg-white border border-outline-variant rounded focus:ring-1 focus:ring-primary outline-none text-right font-bold"
                          type="number"
                          value={pkg.price}
                          onChange={(e) => updatePkg(i, 'price', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button className="px-8 py-3 text-secondary font-bold hover:text-primary transition-colors rounded-lg">Discard Changes</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-10 py-3 bg-primary text-white rounded-lg font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">save</span>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div className="sticky top-28">
            <div className="bg-primary text-on-primary rounded-2xl overflow-hidden shadow-2xl relative">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              <div className="p-8 relative z-10">
                <span className="px-3 py-1 bg-on-primary-container text-primary-container text-xs font-bold rounded-full uppercase tracking-widest mb-6 inline-block">Learner Preview</span>
                <h3 className="text-[32px] font-bold leading-tight mb-2">How your pricing appears to students</h3>
                <p className="text-on-primary-container/80 text-body-md font-body-md mb-8">This is the conversion card shown on your public profile and in search results.</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b border-white/10">
                    <span className="text-body-md font-body-md opacity-80">Hourly Rate</span>
                    <span className="text-headline-md font-headline-md">${hourlyRate.toFixed(2)}</span>
                  </div>
                  {packages.map((pkg, i) => {
                    const val = hourlyRate * pkg.hours;
                    const sav = val - pkg.price;
                    const perc = val > 0 ? Math.round((sav / val) * 100) : 0;
                    return (
                      <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold">{pkg.label}</span>
                          <span className="font-bold">${pkg.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm opacity-60">Value: ${val.toFixed(2)}</span>
                          <span className="text-sm font-bold text-inverse-primary">Save ${sav.toFixed(2)} ({perc}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-8 pt-8 border-t border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="material-symbols-outlined text-inverse-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    <p className="text-sm text-body-md font-body-md">Best value instructor in Sydney CBD</p>
                  </div>
                  <button className="w-full py-4 bg-white text-primary font-bold rounded-xl pointer-events-none opacity-60 cursor-not-allowed">Book a Lesson <span className="text-xs font-normal ml-2">(preview)</span></button>
                </div>
              </div>
            </div>

            <div className="mt-gutter p-6 bg-surface-container-lowest border border-outline-variant rounded-xl">
              <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">info</span>
                Revenue Projections
              </h4>
              <p className="text-sm text-secondary mb-4">Based on your new rates and current booking volume (avg. 22 hrs/week):</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-surface rounded-lg">
                  <p className="text-[10px] text-secondary uppercase tracking-wider font-bold">Est. Monthly</p>
                  <p className="text-xl font-bold text-primary">${(hourlyRate * 22 * 4).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-surface rounded-lg">
                  <p className="text-[10px] text-secondary uppercase tracking-wider font-bold">Platform Fee (5%)</p>
                  <p className="text-xl font-bold text-error">-${Math.round(hourlyRate * 22 * 4 * 0.05).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
