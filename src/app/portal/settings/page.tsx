'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function PortalSettings() {
  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Left Sidebar */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <h3 className="text-headline-md font-headline-md text-primary mb-4">Settings Overview</h3>
              <p className="text-body-md font-body-md text-secondary mb-6 leading-relaxed">
                Manage your account information, security credentials, and communication preferences from this central dashboard.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-primary font-medium">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span className="text-label-sm font-label-sm">Account Information</span>
                </li>
                <li className="flex items-center gap-3 text-secondary">
                  <span className="w-2 h-2 bg-outline-variant rounded-full"></span>
                  <span className="text-label-sm font-label-sm">Security &amp; Privacy</span>
                </li>
                <li className="flex items-center gap-3 text-secondary">
                  <span className="w-2 h-2 bg-outline-variant rounded-full"></span>
                  <span className="text-label-sm font-label-sm">Notification Settings</span>
                </li>
              </ul>
            </div>
            <div className="bg-secondary-container p-6 rounded-xl">
              <div className="flex items-center gap-3 text-on-secondary-container mb-3">
                <span className="material-symbols-outlined">verified_user</span>
                <span className="text-label-sm font-label-sm font-bold uppercase tracking-wider">Identity Verified</span>
              </div>
              <p className="text-body-md text-[14px] text-on-secondary-container opacity-80">
                Your account is verified with LCarDrive Australia. This badge appears on your public profile.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-8 space-y-8">
            {/* Account Info */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-gutter">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-primary-container text-on-primary-container w-12 h-12 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined">person_outline</span>
                </div>
                <div>
                  <h3 className="text-headline-md font-headline-md">Account Information</h3>
                  <p className="text-body-md font-body-md text-secondary">Your basic profile details</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-label-sm font-label-sm text-secondary uppercase px-1">Full Name</label>
                    <input
                      type="text"
                      defaultValue={`${user?.firstName || ''} ${user?.lastName || ''}`}
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-body-md font-body-md bg-surface"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label-sm font-label-sm text-secondary uppercase px-1">Phone Number</label>
                    <input
                      type="tel"
                      defaultValue={user?.primaryPhoneNumber?.phoneNumber || ''}
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-body-md font-body-md bg-surface"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-label-sm font-label-sm text-secondary uppercase px-1">Email Address</label>
                  <input
                    type="email"
                    defaultValue={user?.primaryEmailAddress?.emailAddress || ''}
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-body-md font-body-md bg-surface"
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => showToast('Account info saved!')}
                    disabled={saving}
                    className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </section>

            {/* Security */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-gutter">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-surface-container-highest text-primary w-12 h-12 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <div>
                  <h3 className="text-headline-md font-headline-md">Security</h3>
                  <p className="text-body-md font-body-md text-secondary">Manage password and access</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-outline-variant/30">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-secondary">password</span>
                    <div>
                      <p className="text-body-md font-body-md font-bold">Password</p>
                      <p className="text-label-sm font-label-sm text-secondary">Last changed 4 months ago</p>
                    </div>
                  </div>
                  <button className="text-label-sm font-label-sm text-primary hover:underline font-bold">Change Password</button>
                </div>
                <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-outline-variant/30">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-secondary">phonelink_lock</span>
                    <div>
                      <p className="text-body-md font-body-md font-bold">Two-Factor Authentication</p>
                      <p className="text-label-sm font-label-sm text-secondary">Secure your account with SMS codes</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-12 h-6 bg-secondary-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Notification Preferences */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-gutter">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-surface-container text-on-secondary-container w-12 h-12 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined">notifications_active</span>
                </div>
                <div>
                  <h3 className="text-headline-md font-headline-md">Notification Preferences</h3>
                  <p className="text-body-md font-body-md text-secondary">How we keep you updated</p>
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
                      <p className="text-body-md font-body-md font-bold">{item.label}</p>
                      <p className="text-label-sm font-label-sm text-secondary max-w-sm">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" disabled={item.label === 'Verification Updates'} />
                      <div className={`w-12 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary ${
                        item.label === 'Verification Updates' ? 'bg-primary/20 cursor-not-allowed' : 'bg-secondary-container'
                      }`}></div>
                    </label>
                  </div>
                ))}
              </div>
            </section>

            {/* Danger Zone */}
            <div className="p-gutter border border-error/30 bg-error-container/20 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-body-md font-body-md font-bold text-error">Deactivate Account</p>
                <p className="text-label-sm font-label-sm text-on-error-container opacity-80">Temporarily hide your profile from search results.</p>
              </div>
              <button className="px-4 py-2 border border-error text-error text-label-sm font-label-sm rounded-lg hover:bg-error hover:text-white transition-all">
                Deactivate
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
