'use client';

import { useState, useEffect } from 'react';
import DocumentScanner from '@/components/DocumentScanner';

interface VehicleForm {
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleRego: string;
  vehicleColor: string;
  transmissionType: string;
  dualControls: boolean;
  vehicleImageUrl: string | null;
}

const emptyVehicleForm: VehicleForm = {
  vehicleMake: '',
  vehicleModel: '',
  vehicleYear: '',
  vehicleRego: '',
  vehicleColor: '',
  transmissionType: 'auto',
  dualControls: true,
  vehicleImageUrl: null,
};

export default function PortalVehicle() {
  const [form, setForm] = useState<VehicleForm>(emptyVehicleForm);
  const [savedForm, setSavedForm] = useState<VehicleForm>(emptyVehicleForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/portal/profile')
      .then(r => r.json())
      .then(d => {
        const inst = d.instructor;
        if (!inst) return;
        const next = {
          vehicleMake: inst.vehicle_make || '',
          vehicleModel: inst.vehicle_model || '',
          vehicleYear: inst.vehicle_year ? String(inst.vehicle_year) : '',
          vehicleRego: inst.vehicle_rego || '',
          vehicleColor: inst.vehicle_color || '',
          transmissionType: inst.vehicle_transmission || inst.transmission || 'auto',
          dualControls: inst.dual_controls !== undefined ? inst.dual_controls : true,
          vehicleImageUrl: inst.vehicle_image_url || null,
        };
        setForm(next);
        setSavedForm(next);
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleSave = async () => {
    const year = Number(form.vehicleYear);
    if (!form.vehicleMake.trim() || !form.vehicleModel.trim() || !year) {
      showToast('Make, model and year are required.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_make: form.vehicleMake.trim(),
          vehicle_model: form.vehicleModel.trim(),
          vehicle_year: year,
          vehicle_rego: form.vehicleRego.trim(),
          vehicle_color: form.vehicleColor.trim(),
          vehicle_transmission: form.transmissionType,
          dual_controls: form.dualControls,
          vehicle_image_url: form.vehicleImageUrl,
        }),
      });
      if (res.ok) {
        setSavedForm(form);
        showToast('Vehicle details saved successfully!');
      }
      else showToast('Failed to save.');
    } catch {
      showToast('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {toast && (
        <div className="fixed bottom-8 right-8 z-[60] bg-primary text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <p className="font-bold">{toast}</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Vehicle Image Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative group aspect-[4/3] rounded-xl overflow-hidden border border-outline-variant bg-surface-container-low flex items-center justify-center">
              {form.vehicleImageUrl ? (
                <img src={form.vehicleImageUrl} alt="Vehicle" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <span className="material-symbols-outlined text-6xl text-outline">directions_car</span>
              )}
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors pointer-events-none"></div>
              <DocumentScanner
                docType="vehicle_registration"
                label=""
                existingImageUrl={form.vehicleImageUrl}
                onScanned={(data, url, _name) => {
                  setForm((prev) => ({
                    ...prev,
                    vehicleMake: data.vehicle_make ? String(data.vehicle_make) : prev.vehicleMake,
                    vehicleModel: data.vehicle_model ? String(data.vehicle_model) : prev.vehicleModel,
                    vehicleYear: data.vehicle_year ? String(data.vehicle_year) : prev.vehicleYear,
                    vehicleRego: data.vehicle_rego ? String(data.vehicle_rego) : prev.vehicleRego,
                    vehicleColor: data.vehicle_color ? String(data.vehicle_color) : prev.vehicleColor,
                    vehicleImageUrl: url || prev.vehicleImageUrl,
                  }));
                  showToast('Vehicle details extracted from image!');
                }}
              />
            </div>
            <div className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl">
              <h3 className="text-body-lg font-bold text-primary mb-2">Vehicle Requirements</h3>
              <p className="text-secondary text-body-md mb-4">Students see these details on your profile. Keep them accurate and update them when you change vehicles.</p>
              <ul className="space-y-3 text-sm text-on-surface-variant">
                <li className="flex gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>Make, model and year are required.</li>
                <li className="flex gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>Registration and colour help students identify your car.</li>
                <li className="flex gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>Dual controls should reflect the vehicle you teach in.</li>
              </ul>
            </div>
          </div>

          {/* Form Fields Column */}
          <div className="lg:col-span-7">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 space-y-8">
              <div>
                <h3 className="text-headline-md font-headline-md text-primary mb-2">Instruction Vehicle</h3>
                <p className="text-secondary text-body-md">Keep your vehicle details up to date so students know what they&apos;ll be driving.</p>
              </div>
              <div className="grid grid-cols-2 gap-gutter">
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-2">
                  <label className="text-label-sm text-secondary px-1">Make</label>
                  <input
                    type="text"
                    placeholder="e.g. Toyota"
                    value={form.vehicleMake}
                    onChange={(e) => setForm((prev) => ({ ...prev, vehicleMake: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-2">
                  <label className="text-label-sm text-secondary px-1">Model</label>
                  <input
                    type="text"
                    placeholder="e.g. Corolla"
                    value={form.vehicleModel}
                    onChange={(e) => setForm((prev) => ({ ...prev, vehicleModel: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-2">
                  <label className="text-label-sm text-secondary px-1">Year</label>
                  <input
                    type="number"
                    placeholder="YYYY"
                    value={form.vehicleYear}
                    onChange={(e) => setForm((prev) => ({ ...prev, vehicleYear: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 flex flex-col gap-2">
                  <label className="text-label-sm text-secondary px-1">Registration</label>
                  <input
                    type="text"
                    placeholder="ABC-123"
                    value={form.vehicleRego}
                    onChange={(e) => setForm((prev) => ({ ...prev, vehicleRego: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="col-span-2 flex flex-col gap-2">
                  <label className="text-label-sm text-secondary px-1">Colour</label>
                  <input
                    type="text"
                    placeholder="e.g. White"
                    value={form.vehicleColor}
                    onChange={(e) => setForm((prev) => ({ ...prev, vehicleColor: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-label-sm text-secondary px-1">Transmission</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'auto', label: 'Automatic', icon: 'auto_mode' },
                    { value: 'manual', label: 'Manual', icon: 'settings_input_component' },
                    { value: 'both', label: 'Both', icon: 'dynamic_form' },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setForm((prev) => ({ ...prev, transmissionType: t.value }))}
                      className={`flex flex-col items-center gap-2 p-4 border rounded-xl hover:border-primary hover:bg-surface-container-low transition-all ${
                        form.transmissionType === t.value
                          ? 'bg-surface-container-low border-primary text-primary font-bold'
                          : 'border-outline-variant text-secondary'
                      }`}
                    >
                      <span className="material-symbols-outlined">{t.icon}</span>
                      <span className="text-label-sm">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-outline-variant rounded-xl bg-surface-container-low">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">settings_accessibility</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">Dual Controls Installed</p>
                    <p className="text-secondary text-body-md">Required for most licence assessments</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.dualControls}
                    onChange={() => setForm((prev) => ({ ...prev, dualControls: !prev.dualControls }))}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-secondary-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="pt-6 border-t border-outline-variant flex justify-end gap-4">
                <button
                  onClick={() => {
                    setForm(savedForm);
                    showToast('Changes discarded.');
                  }}
                  className="px-6 py-2.5 font-bold text-primary hover:bg-surface-container transition-colors rounded-lg"
                >
                  Discard Changes
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-2.5 bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
