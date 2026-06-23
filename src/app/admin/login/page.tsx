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
    <div className="min-h-screen bg-[#f4f6fa] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-[44px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">LCarDrive</h1>
          <p className="text-sm text-gray-500 mt-0.5 font-medium">Admin Portal</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-200/80 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-500 mt-0.5">Enter the admin password to continue.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2 border border-red-100">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              autoFocus
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-white font-semibold text-sm rounded-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
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

          <Link href="/" className="block text-center text-sm text-primary font-medium hover:underline">
            Back to site
          </Link>
        </form>
      </div>
    </div>
  );
}
