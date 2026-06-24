'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'redirecting' | 'signin'>('checking');

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setStatus('signin');
      router.replace('/login');
      return;
    }

    setStatus('redirecting');
    fetch('/api/admin/login-via-clerk', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data.isAdmin) {
          window.location.href = '/admin';
        } else {
          window.location.href = '/portal';
        }
      })
      .catch(() => {
        window.location.href = '/portal';
      });
  }, [isLoaded, isSignedIn, router]);

  if (status === 'checking' || status === 'redirecting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-5">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              directions_car
            </span>
          </div>
          <h1 className="text-headline-md font-headline-md text-primary mb-2">LCarDrive</h1>
          <p className="text-body-md text-on-surface-variant">
            {status === 'redirecting' ? 'Verifying admin access...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
