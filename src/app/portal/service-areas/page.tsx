'use client';

import { useState } from 'react';

const SUGGESTED = ['Footscray', 'Sunshine', 'Yarraville', 'Seddon', 'Kingsville', 'West Footscray', 'Maidstone', 'Braybrook'];

export default function PortalServiceAreas() {
  const [suburbs, setSuburbs] = useState<string[]>(['Footscray', 'Sunshine', 'Yarraville', 'Seddon', 'Kingsville']);
  const [input, setInput] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const addSuburb = (s: string) => { if (!suburbs.includes(s)) setSuburbs([...suburbs, s]); setInput(''); };
  const removeSuburb = (s: string) => setSuburbs(suburbs.filter((x) => x !== s));

  return (
    <>
      {toast && (
        <div className="fixed top-6 right-6 z-[60] bg-secondary text-on-secondary px-5 py-3 rounded-xl shadow-lg font-label-md text-label-md animate-in fade-in">
          {toast}
        </div>
      )}
    <div>
      <h1 className="font-display text-2xl font-bold text-on-surface mb-6">Service Areas</h1>
      <div className="border border-outline-variant rounded-2xl p-6 md:p-8 card-shadow space-y-6 max-w-2xl">
        <div>
          <label className="text-sm font-bold text-on-surface block mb-1.5">Primary Suburb</label>
          <input type="text" defaultValue="Footscray" className="w-full max-w-xs px-4 py-3 rounded-lg border border-outline-variant text-sm text-on-surface focus:ring-2 focus:ring-secondary outline-none" />
        </div>
        <div>
          <label className="text-sm font-bold text-on-surface block mb-1.5">Service Radius (km)</label>
          <input type="number" defaultValue={10} className="w-full max-w-xs px-4 py-3 rounded-lg border border-outline-variant text-sm text-on-surface focus:ring-2 focus:ring-secondary outline-none" min={1} max={50} />
        </div>
        <div>
          <label className="text-sm font-bold text-on-surface block mb-3">Suburbs You Serve</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {suburbs.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface text-sm font-medium">
                {s}
                <button onClick={() => removeSuburb(s)} className="hover:text-error"><span className="material-symbols-outlined text-sm">close</span></button>
              </span>
            ))}
          </div>
          <input type="text" placeholder="Type a suburb and press Enter..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && input.trim()) { e.preventDefault(); addSuburb(input.trim()); } }} className="w-full max-w-xs px-4 py-3 rounded-lg border border-outline-variant text-sm text-on-surface focus:ring-2 focus:ring-secondary outline-none" />
          <div className="flex flex-wrap gap-2 mt-3">
            {SUGGESTED.filter((s) => !suburbs.includes(s)).map((s) => (
              <button key={s} onClick={() => addSuburb(s)} className="px-3 py-1 rounded-full text-xs font-medium border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors">
                + {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-bold text-on-surface block mb-3">Familiar Test Centres</label>
          <div className="flex flex-wrap gap-2">
            {['Sunshine', 'Moorabbin', 'Carlton', 'Werribee'].map((tc) => (
              <label key={tc} className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-outline-variant cursor-pointer has-[:checked]:border-secondary has-[:checked]:bg-surface-container transition-all">
                <input type="checkbox" defaultChecked className="accent-secondary rounded" />
                <span className="text-sm text-on-surface">{tc}</span>
              </label>
            ))}
          </div>
        </div>
        <button onClick={() => showToast('Service areas saved successfully!')} className="bg-secondary text-white px-6 py-3 rounded-lg text-sm font-bold hover:brightness-110 transition-all">Save Changes</button>
      </div>
    </div></>
  );
}
