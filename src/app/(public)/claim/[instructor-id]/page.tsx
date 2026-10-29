'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';

export default function ClaimPage() {
  const params = useParams();
  const pathname = usePathname();
  const { user, isLoaded, isSignedIn } = useUser();
  const [step, setStep] = useState<'submit' | 'done'>('submit');
  const [adiNumber, setAdiNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const instructorId = String(params['instructor-id'] || '');
  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.primaryEmailAddress?.emailAddress ||
    '';
  const displayEmail = user?.primaryEmailAddress?.emailAddress || '';

  useEffect(() => {
    document.title = 'Claim This Profile | LCarDrive';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructorId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructor_id: instructorId,
          adi_number: adiNumber || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStep('done');
      } else {
        setError(data.error || 'Failed to submit claim');
      }
    } catch {
      setError('Failed to submit claim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-margin-mobile py-stack-lg">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-primary text-3xl">verified</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-on-surface mb-2">Claim This Profile</h1>
        <p className="text-on-surface-variant">Is this your listing? Verify your identity to take ownership.</p>
      </div>

      <div className="card-shadow bg-white rounded-2xl p-8">
        {!isLoaded && (
          <div className="py-10 text-center text-sm text-gray-500">Checking your account…</div>
        )}

        {isLoaded && !isSignedIn && (
          <div className="space-y-4 text-center">
            <h3 className="font-bold text-on-surface">Sign in to continue</h3>
            <p className="text-sm text-on-surface-variant">
              Use the email address on your existing listing. We&apos;ll match it automatically and send the
              claim to our team for review.
            </p>
            <div className="flex flex-col gap-2">
              <SignInButton mode="modal" forceRedirectUrl={pathname}>
                <button className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-all">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl={pathname}>
                <button className="w-full border border-primary text-primary py-3 rounded-lg font-bold text-sm hover:bg-primary/5 transition-all">
                  Create an account
                </button>
              </SignUpButton>
            </div>
            <p className="text-xs text-gray-400">
              Trouble signing in?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Use the password login
              </Link>
            </p>
          </div>
        )}

        {isLoaded && isSignedIn && step === 'submit' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-bold text-on-surface mb-2">Verify Your ADI Registration</h3>
            <div className="rounded-xl bg-gray-50 p-3 text-sm">
              <p className="font-semibold text-gray-900">{displayName || 'Signed in'}</p>
              <p className="text-xs text-gray-500">{displayEmail}</p>
            </div>
            <p className="text-sm text-on-surface-variant">
              Enter your ADI registration number so our team can confirm ownership. This usually takes 1–2
              business days.
            </p>
            {error && (
              <div className="p-3 bg-error-container text-on-error-container rounded-xl text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {error}
              </div>
            )}
            <input
              type="text"
              placeholder="ADI Registration Number"
              value={adiNumber}
              onChange={(e) => setAdiNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-outline-variant text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </form>
        )}

        {isLoaded && isSignedIn && step === 'done' && (
          <div className="text-center py-6">
            <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <h3 className="font-bold text-on-surface text-lg mt-4 mb-2">Claim Submitted!</h3>
            <p className="text-sm text-on-surface-variant">We&apos;ll notify you once it&apos;s approved, usually within 1–2 business days.</p>
            <Link href="/portal" className="mt-5 inline-block text-sm font-bold text-primary hover:underline">
              Go to your portal
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
