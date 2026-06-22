'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/admin');
    } else {
      const data = await res.json();
      setError(data.error || 'Invalid password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center text-on-secondary mx-auto mb-4 shadow-lg shadow-secondary/20">
            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">LCarDrive</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Admin Portal</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/40 space-y-5">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">Welcome back</h2>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Enter the admin password to continue.</p>
          </div>

          {error && (
            <div className="p-3 bg-error-container text-on-error-container rounded-xl text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          )}

          <div>
            <label className="font-label-md text-label-md font-semibold text-on-surface mb-1.5 block" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              autoFocus
              className="w-full px-4 py-2.5 bg-surface border border-outline-variant/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-secondary text-on-secondary font-bold text-sm rounded-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>

          <Link href="/" className="block text-center font-label-sm text-label-sm text-secondary hover:underline">
            Back to site
          </Link>
        </form>
      </div>
    </div>
  );
}
