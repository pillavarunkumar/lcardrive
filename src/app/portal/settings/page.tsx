'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export default function PortalSettings() {
  const { user } = useUser();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
      fetch('/api/portal/profile')
        .then(r => r.json())
        .then(d => {
          const inst = d.instructor;
          if (inst) {
            setFirstName(inst.first_name || user?.firstName || '');
            setLastName(inst.last_name || user?.lastName || '');
            setPhone(inst.phone || user?.primaryPhoneNumber?.phoneNumber || '');
            setEmail(inst.email || user?.primaryEmailAddress?.emailAddress || '');
            if (inst.is_hidden) setIsHidden(true);
          } else {
          setFirstName(user?.firstName || '');
          setLastName(user?.lastName || '');
          setPhone(user?.primaryPhoneNumber?.phoneNumber || '');
          setEmail(user?.primaryEmailAddress?.emailAddress || '');
        }
      })
      .catch(() => {
        setFirstName(user?.firstName || '');
        setLastName(user?.lastName || '');
        setPhone(user?.primaryPhoneNumber?.phoneNumber || '');
        setEmail(user?.primaryEmailAddress?.emailAddress || '');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, phone, email }),
      });
      if (res.ok) {
        showToast('Settings saved successfully!');
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || 'Failed to save.');
        showToast(err.error || 'Failed to save.');
      }
    } catch {
      setError('Failed to save.');
      showToast('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {toast && (
        <div className="fixed bottom-8 right-8 z-[60] bg-primary-container text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <p className="font-bold">{toast}</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Left Sidebar */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-white border border-outline-variant shadow-sm rounded-2xl p-6">
              <h3 className="text-base font-semibold text-on-surface mb-4">Settings Overview</h3>
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                Manage your account information, security credentials, and communication preferences from this central dashboard.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-primary-container font-medium">
                  <span className="w-2 h-2 bg-primary-container rounded-full"></span>
                  <span className="text-xs font-semibold uppercase tracking-wide">Account Information</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface-variant">
                  <span className="w-2 h-2 bg-outline-variant rounded-full"></span>
                  <span className="text-xs font-semibold uppercase tracking-wide">Security &amp; Privacy</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface-variant">
                  <span className="w-2 h-2 bg-outline-variant rounded-full"></span>
                  <span className="text-xs font-semibold uppercase tracking-wide">Notification Settings</span>
                </li>
              </ul>
            </div>
            <div className="bg-green-50 p-6 rounded-2xl border border-outline-variant">
              <div className="flex items-center gap-3 text-green-700 mb-3">
                <span className="material-symbols-outlined">verified_user</span>
                <span className="text-xs font-semibold uppercase tracking-wide">Identity Verified</span>
              </div>
              <p className="text-sm text-green-600">
                Your account is verified with LCarDrive Australia. This badge appears on your public profile.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-8 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-500 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {error}
              </div>
            )}

            {loading ? (
              <div className="bg-white border border-outline-variant shadow-sm rounded-2xl p-gutter animate-pulse">
                <div className="h-6 bg-surface-container rounded w-1/3 mb-8" />
                <div className="space-y-4">
                  <div className="h-12 bg-surface-container rounded" />
                  <div className="h-12 bg-surface-container rounded" />
                  <div className="h-12 bg-surface-container rounded" />
                </div>
              </div>
            ) : (
              <>
                {/* Account Info */}
                <section className="bg-white border border-outline-variant shadow-sm rounded-2xl p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined">person_outline</span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-on-surface">Account Information</h3>
                      <p className="text-sm text-on-surface-variant">Your basic profile details</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide px-1">First Name</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary-container focus:border-transparent outline-none transition-all text-sm bg-surface-container-low"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide px-1">Last Name</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary-container focus:border-transparent outline-none transition-all text-sm bg-surface-container-low"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide px-1">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary-container focus:border-transparent outline-none transition-all text-sm bg-surface-container-low"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide px-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary-container focus:border-transparent outline-none transition-all text-sm bg-surface-container-low"
                      />
                    </div>
                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary-container text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-container/90 transition-all disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </section>

                {/* Security */}
                <section className="bg-white border border-outline-variant shadow-sm rounded-2xl p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined">lock</span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-on-surface">Security</h3>
                      <p className="text-sm text-on-surface-variant">Manage password and access</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-on-surface-variant">password</span>
                        <div>
                          <p className="text-sm font-bold text-on-surface">Password</p>
                          <p className="text-xs text-on-surface-variant">Last changed via Clerk</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant">
                        Managed via Clerk
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-on-surface-variant">phonelink_lock</span>
                        <div>
                          <p className="text-sm font-bold text-on-surface">Two-Factor Authentication</p>
                          <p className="text-xs text-on-surface-variant">Secure your account with SMS codes</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-12 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container" />
                      </label>
                    </div>
                  </div>
                </section>

                {/* Notification Preferences */}
                <section className="bg-white border border-outline-variant shadow-sm rounded-2xl p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined">notifications_active</span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-on-surface">Notification Preferences</h3>
                      <p className="text-sm text-on-surface-variant">How we keep you updated</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Email Notifications', desc: 'Receive account updates and monthly performance summaries via email.' },
                      { label: 'Review Updates', desc: 'Get notified immediately when a student leaves a new review.' },
                      { label: 'Verification Updates', desc: 'Critical alerts regarding your instructor license or blue card status.' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start justify-between py-4 border-b border-outline-variant/20">
                        <div>
                          <p className="text-sm font-bold text-on-surface">{item.label}</p>
                          <p className="text-xs text-on-surface-variant max-w-sm">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" disabled={item.label === 'Verification Updates'} />
                          <div className={`w-12 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container ${
                            item.label === 'Verification Updates' ? 'bg-primary-container/20 cursor-not-allowed' : 'bg-surface-container-high'
                          }`} />
                        </label>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Danger Zone */}
                <div className={`p-8 border rounded-2xl flex items-center justify-between ${isHidden ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <div>
                    <p className={`text-sm font-bold ${isHidden ? 'text-green-600' : 'text-red-500'}`}>
                      {isHidden ? 'Profile Hidden' : 'Deactivate Account'}
                    </p>
                    <p className={`text-xs ${isHidden ? 'text-green-500' : 'text-red-400'}`}>
                      {isHidden ? 'Your profile is currently hidden from search results.' : 'Temporarily hide your profile from search results.'}
                    </p>
                  </div>
                  <button onClick={async () => {
                    if (!isHidden && !confirm('Are you sure you want to deactivate your profile? It will be hidden from search results.')) return;
                    setSaving(true);
                    try {
                      const res = await fetch('/api/portal/deactivate', { method: 'POST' });
                      if (res.ok) { setIsHidden(!isHidden); showToast(isHidden ? 'Profile reactivated.' : 'Profile deactivated.'); }
                      else showToast('Failed to update.');
                    } catch { showToast('Failed to update.'); }
                    finally { setSaving(false); }
                  }} disabled={saving}
                    className={`px-4 py-2 border text-xs font-semibold rounded-lg transition-all disabled:opacity-50 ${isHidden ? 'border-green-500 text-green-600 hover:bg-green-500 hover:text-white' : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'}`}>
                    {saving ? 'Updating...' : isHidden ? 'Reactivate' : 'Deactivate'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
