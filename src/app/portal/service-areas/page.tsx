'use client';

import { useState, useEffect } from 'react';

const SUGGESTED = ['Footscray', 'Sunshine', 'Yarraville', 'Seddon', 'Kingsville', 'West Footscray', 'Maidstone', 'Braybrook'];
const DEMAND_SUBURB = 'Altona Meadows';

export default function PortalServiceAreas() {
  const [suburb, setSuburb] = useState('');
  const [serviceRadius, setServiceRadius] = useState(10);
  const [serviceSuburbs, setServiceSuburbs] = useState<string[]>([]);
  const [savedServiceSuburbs, setSavedServiceSuburbs] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [familiarTestCentres, setFamiliarTestCentres] = useState<string[]>([]);
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
        if (inst.service_suburbs?.length) {
          setServiceSuburbs(inst.service_suburbs);
          setSavedServiceSuburbs(inst.service_suburbs);
        }
        if (inst.familiar_test_centres?.length) setFamiliarTestCentres(inst.familiar_test_centres);
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const addSuburb = (s: string) => {
    const normalized = s.trim();
    if (!normalized) return;
    const exists = serviceSuburbs.some((area) => area.toLowerCase() === normalized.toLowerCase());
    if (exists) {
      showToast(`${normalized} is already in your service areas.`);
      setInput('');
      return;
    }
    setServiceSuburbs([...serviceSuburbs, normalized]);
    setInput('');
  };
  const removeSuburb = (s: string) => setServiceSuburbs(serviceSuburbs.filter((x) => x !== s));

  const handleSave = async () => {
    if (!suburb.trim() && serviceSuburbs.length === 0) {
      showToast('Add at least one service suburb before saving.');
      return;
    }
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
        setSavedServiceSuburbs(serviceSuburbs);
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
        <div className="fixed bottom-8 right-8 z-[60] bg-[#064E3B] text-white px-6 py-4 rounded-[20px] shadow-2xl flex items-center gap-3">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <p className="font-bold">{toast}</p>
        </div>
      )}
      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-12 lg:col-span-7 space-y-gutter">
          <section className="bg-white border border-[#E5E7EB] shadow-sm rounded-[20px] p-8">
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-gray-900">Expand Your Coverage</h3>
                <p className="text-sm text-gray-500">Add the suburbs where you can teach. Students searching in these areas can find your listing.</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full space-y-2">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Search Suburb or Postcode</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#064E3B] transition-colors">search</span>
                    <input
                      className="w-full pl-12 pr-4 py-4 rounded-lg border border-[#E5E7EB] bg-gray-50 focus:ring-2 focus:ring-[#064E3B] focus:ring-offset-2 focus:outline-none transition-all text-sm"
                      placeholder="e.g. Richmond or 3000"
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSuburb(input);
                        }
                      }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => addSuburb(input)}
                  className="w-full md:w-auto px-8 py-4 bg-[#064E3B] text-white rounded-xl font-bold hover:bg-[#053A2C] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">add_location</span>
                  Add Suburb
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white border border-[#E5E7EB] shadow-sm rounded-[20px] p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-semibold text-gray-900">Selected Suburbs</h3>
              <span className="px-3 py-1 bg-[#064E3B] text-white rounded-full text-[10px] font-semibold uppercase tracking-wide">{serviceSuburbs.length} Active Areas</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {serviceSuburbs.length > 0 ? (
                serviceSuburbs.map((s) => (
                  <div key={s} className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-[#E5E7EB] rounded-full group hover:bg-gray-100 transition-colors cursor-default">
                    <span className="text-gray-900 font-bold text-sm">{s}</span>
                    <button onClick={() => removeSuburb(s)} className="text-gray-400 hover:text-red-500 transition-colors flex items-center" aria-label={`Remove ${s}`}>
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No service suburbs selected yet.</p>
              )}
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick add a suburb</p>
              <input
                type="text"
                placeholder="Type a suburb and press Enter..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && input.trim()) { e.preventDefault(); addSuburb(input.trim()); } }}
                className="w-full max-w-xs px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] outline-none transition-all"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {SUGGESTED.filter((s) => !serviceSuburbs.includes(s)).map((s) => (
                  <button key={s} onClick={() => addSuburb(s)} className="px-3 py-1 rounded-full text-xs font-medium border border-[#E5E7EB] text-gray-500 hover:bg-gray-50 transition-colors">
                    + {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8 p-4 rounded-lg bg-gray-50 border border-dashed border-[#E5E7EB] flex items-center gap-4">
              <span className="material-symbols-outlined text-[#064E3B] text-3xl">info</span>
              <p className="text-gray-500 text-xs">Adding accurate service suburbs helps students find you in local search results.</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setServiceSuburbs(savedServiceSuburbs);
                  showToast('Unsaved changes discarded.');
                }}
                className="px-5 py-3 border border-[#E5E7EB] rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-colors"
              >
                Discard Changes
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-[#064E3B] text-white rounded-xl font-bold hover:bg-[#053A2C] transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Areas'}
              </button>
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-gutter">
          <section className="bg-white border border-[#E5E7EB] shadow-sm rounded-[20px] overflow-hidden h-[400px] relative group">
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <span className="material-symbols-outlined text-6xl">map</span>
                <p className="text-xs mt-2">Map Integration</p>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 p-4 bg-white border border-[#E5E7EB] shadow-sm rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-[#064E3B] rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-gray-900">{serviceSuburbs.length} areas selected</span>
              </div>
              <span className="text-xs text-gray-500">Map preview coming soon</span>
            </div>
          </section>

          <section className="bg-[#064E3B] text-white rounded-[20px] p-8">
            <h4 className="text-base font-semibold mb-2">Demand Insight</h4>
            <p className="text-white/80 text-sm mb-6">Students are often searching near <span className="font-bold underline decoration-2 underline-offset-4">{DEMAND_SUBURB}</span>. Add it if you can teach there.</p>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs opacity-80">Market Saturation</span>
                <span className="font-bold text-sm">Low (Great Opportunity)</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div className="bg-white/40 h-full w-[25%]"></div>
              </div>
            </div>
            <button
              onClick={() => addSuburb(DEMAND_SUBURB)}
              className="mt-8 w-full py-3 bg-white text-[#064E3B] font-bold rounded-xl hover:bg-white/90 transition-colors"
            >
              Add {DEMAND_SUBURB}
            </button>
          </section>
        </div>
      </div>

      <section className="mt-gutter bg-white border border-[#E5E7EB] shadow-sm rounded-[20px] overflow-hidden">
        <div className="p-8 border-b border-[#E5E7EB]">
          <h3 className="text-base font-semibold text-gray-900">Selected Service Areas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-[#E5E7EB]">
              <tr>
                <th className="px-8 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Suburb</th>
                <th className="px-8 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wide text-center">Coverage Radius</th>
                <th className="px-8 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wide text-center">Test Centre Familiarity</th>
                <th className="px-8 py-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wide text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {serviceSuburbs.map((area) => {
                const familiar = familiarTestCentres.some((centre) => centre.toLowerCase() === area.toLowerCase());
                return (
                  <tr key={area} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6 font-bold text-gray-900 text-sm">{area}</td>
                    <td className="px-8 py-6 text-center text-sm text-gray-500">{serviceRadius} km</td>
                    <td className="px-8 py-6 text-center text-sm text-gray-500">{familiar ? 'Familiar' : 'Not listed'}</td>
                    <td className="px-8 py-6 text-right">
                      <span className="px-3 py-1 bg-[#064E3B] text-white rounded-full text-xs font-bold">ACTIVE</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
