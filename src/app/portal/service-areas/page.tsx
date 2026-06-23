'use client';

import { useState, useEffect } from 'react';

const SUGGESTED = ['Footscray', 'Sunshine', 'Yarraville', 'Seddon', 'Kingsville', 'West Footscray', 'Maidstone', 'Braybrook'];

export default function PortalServiceAreas() {
  const [suburb, setSuburb] = useState('Footscray');
  const [serviceRadius, setServiceRadius] = useState(10);
  const [serviceSuburbs, setServiceSuburbs] = useState<string[]>(['Footscray', 'Sunshine', 'Yarraville', 'Seddon', 'Kingsville']);
  const [input, setInput] = useState('');
  const [familiarTestCentres, setFamiliarTestCentres] = useState<string[]>(['Sunshine', 'Moorabbin', 'Carlton', 'Werribee']);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/portal/profile')
      .then(r => r.json())
      .then(d => {
        const inst = d.instructor;
        if (!inst) return;
        if (inst.suburb) setSuburb(inst.suburb);
        if (inst.service_radius_km) setServiceRadius(inst.service_radius_km);
        if (inst.service_suburbs?.length) setServiceSuburbs(inst.service_suburbs);
        if (inst.familiar_test_centres?.length) setFamiliarTestCentres(inst.familiar_test_centres);
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const addSuburb = (s: string) => { if (!serviceSuburbs.includes(s)) setServiceSuburbs([...serviceSuburbs, s]); setInput(''); };
  const removeSuburb = (s: string) => setServiceSuburbs(serviceSuburbs.filter((x) => x !== s));
  const toggleTestCentre = (tc: string) => {
    setFamiliarTestCentres((prev) => prev.includes(tc) ? prev.filter((x) => x !== tc) : [...prev, tc]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suburb,
          service_radius_km: serviceRadius,
          service_suburbs: serviceSuburbs,
          familiar_test_centres: familiarTestCentres,
        }),
      });
      if (res.ok) {
        showToast('Service areas saved successfully!');
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

  return (
    <>
      {toast && (
        <div className="fixed top-6 right-6 z-[60] bg-primary text-white px-5 py-3 rounded-xl shadow-lg font-label-md text-label-md animate-in fade-in">
          {toast}
        </div>
      )}
    <div>
      <h1 className="font-display text-2xl font-bold text-on-surface mb-6">Service Areas</h1>
      <div className="border border-outline-variant rounded-2xl p-6 md:p-8 card-shadow space-y-6 max-w-2xl">
        <div>
          <label className="text-sm font-bold text-on-surface block mb-1.5">Primary Suburb</label>
          <input type="text" value={suburb} onChange={(e) => setSuburb(e.target.value)}
            className="w-full max-w-xs px-4 py-3 rounded-lg border border-outline-variant text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none" />
        </div>
        <div>
          <label className="text-sm font-bold text-on-surface block mb-1.5">Service Radius (km)</label>
          <input type="number" value={serviceRadius} onChange={(e) => setServiceRadius(parseInt(e.target.value) || 10)}
            className="w-full max-w-xs px-4 py-3 rounded-lg border border-outline-variant text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none" min={1} max={50} />
        </div>
        <div>
          <label className="text-sm font-bold text-on-surface block mb-3">Suburbs You Serve</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {serviceSuburbs.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface text-sm font-medium">
                {s}
                <button onClick={() => removeSuburb(s)} className="hover:text-error"><span className="material-symbols-outlined text-sm">close</span></button>
              </span>
            ))}
          </div>
          <input type="text" placeholder="Type a suburb and press Enter..." value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && input.trim()) { e.preventDefault(); addSuburb(input.trim()); } }}
            className="w-full max-w-xs px-4 py-3 rounded-lg border border-outline-variant text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none" />
          <div className="flex flex-wrap gap-2 mt-3">
            {SUGGESTED.filter((s) => !serviceSuburbs.includes(s)).map((s) => (
              <button key={s} onClick={() => addSuburb(s)}
                className="px-3 py-1 rounded-full text-xs font-medium border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors">
                + {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-bold text-on-surface block mb-3">Familiar Test Centres</label>
          <div className="flex flex-wrap gap-2">
            {['Sunshine', 'Moorabbin', 'Carlton', 'Werribee'].map((tc) => (
              <label key={tc}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                  familiarTestCentres.includes(tc) ? 'border-primary bg-primary/10' : 'border-outline-variant'
                }`}>
                <input type="checkbox" checked={familiarTestCentres.includes(tc)}
                  onChange={() => toggleTestCentre(tc)} className="accent-primary rounded" />
                <span className="text-sm text-on-surface">{tc}</span>
              </label>
            ))}
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div></>
  );
}
