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
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
          <span className="text-2xl font-bold text-on-surface">LCarDrive Admin</span>
        </div>
        <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant space-y-4">
          <h1 className="text-xl font-bold text-on-surface">Admin Login</h1>
          <p className="text-sm text-on-surface-variant">Enter the admin password to continue.</p>

          {error && (
            <div className="p-3 bg-error-container text-on-error-container rounded-xl text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-on-surface" htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter admin password" required
              className="w-full mt-1 px-4 py-2.5 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-sm transition-all" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-secondary text-on-secondary font-bold text-sm rounded-xl hover:brightness-110 transition-all disabled:opacity-50">
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <Link href="/" className="block text-center text-sm text-secondary hover:underline">
            Back to site
          </Link>
        </form>
      </div>
    </div>
  );
}
