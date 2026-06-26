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
        <div className="fixed bottom-8 right-8 z-[60] bg-[#064E3B] text-white px-6 py-4 rounded-[20px] shadow-2xl flex items-center gap-3">
          <span className="material-symbols-outlined">check_circle</span>
          <p className="font-bold">{toast}</p>
        </div>
      )}
      <div className="mb-8">
        <p className="text-gray-500 text-sm flex items-center gap-2">
          Settings <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-gray-900 font-semibold">Pricing &amp; Packages</span>
        </p>
      </div>
      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-12 lg:col-span-7 space-y-gutter">
          <section className="bg-white p-8 rounded-[20px] border border-[#E5E7EB] shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">Standard Rate</h2>
                <p className="text-sm text-gray-500">Set your base hourly rate for individual lessons.</p>
              </div>
              <span className="material-symbols-outlined text-[#64748B] text-3xl">payments</span>
            </div>
            <div className="relative max-w-xs">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                className="w-full pl-8 pr-16 py-4 bg-gray-50 border border-[#E5E7EB] rounded-lg text-[32px] font-bold text-gray-900 focus:ring-2 focus:ring-[#064E3B] focus:border-transparent transition-all outline-none"
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">/ hr</span>
            </div>
            <p className="mt-4 text-sm text-gray-400 italic">Average instructor rate in your area: $65 — $75/hr</p>
          </section>

          <section className="bg-white p-8 rounded-[20px] border border-[#E5E7EB] shadow-sm">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">Lesson Packages</h2>
                <p className="text-sm text-gray-500">Offer discounts for multi-lesson bookings to encourage commitment.</p>
              </div>
              <span className="material-symbols-outlined text-[#64748B] text-3xl">redeem</span>
            </div>
            <div className="space-y-6">
              {packages.map((pkg, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gray-50 rounded-lg border border-[#E5E7EB]">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{pkg.label}</h3>
                    <p className="text-sm text-gray-500">Ideal for beginners starting their journey</p>
                  </div>
                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Package Price</p>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 font-bold">$</span>
                        <input
                          className="w-24 px-2 py-1 bg-white border border-[#E5E7EB] rounded focus:ring-1 focus:ring-[#064E3B] outline-none text-right font-bold"
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
            <button className="px-8 py-3 text-gray-500 font-bold hover:text-[#064E3B] transition-colors rounded-lg">Discard Changes</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-10 py-3 bg-[#064E3B] text-white rounded-xl font-bold hover:bg-[#053A2C] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">save</span>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div className="sticky top-28">
            <div className="bg-[#064E3B] text-white rounded-[20px] overflow-hidden shadow-2xl relative">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              <div className="p-8 relative z-10">
                <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full uppercase tracking-widest mb-6 inline-block">Learner Preview</span>
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

            <div className="mt-gutter p-6 bg-white border border-[#E5E7EB] rounded-[20px] shadow-sm">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">info</span>
                Revenue Projections
              </h4>
              <p className="text-sm text-gray-500 mb-4">Based on your new rates and current booking volume (avg. 22 hrs/week):</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Est. Monthly</p>
                  <p className="text-xl font-bold text-gray-900">${(hourlyRate * 22 * 4).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Platform Fee (5%)</p>
                  <p className="text-xl font-bold text-red-500">-${Math.round(hourlyRate * 22 * 4 * 0.05).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
