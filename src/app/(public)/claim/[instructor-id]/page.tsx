'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function ClaimPage() {
  const params = useParams();
  const [step, setStep] = useState<'signup' | 'submit' | 'done'>('signup');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adiNumber, setAdiNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('submit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructor_id: params['instructor-id'],
          first_name: firstName,
          last_name: lastName,
          email,
          adi_number: adiNumber || undefined,
        }),
      });
      const data = await res.json();
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
        {step === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <h3 className="font-bold text-on-surface mb-2">Your Details</h3>
            {error && (
              <div className="p-3 bg-error-container text-on-error-container rounded-xl text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {error}
              </div>
            )}
            <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-outline-variant text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none" required />
            <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-outline-variant text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none" required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-outline-variant text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none" required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-outline-variant text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none" required minLength={8} />
            <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-all">
              Continue
            </button>
          </form>
        )}

        {step === 'submit' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-bold text-on-surface mb-2">Verify Your ADI Registration</h3>
            <p className="text-sm text-on-surface-variant">Enter your ADI registration number to verify your identity.</p>
            {error && (
              <div className="p-3 bg-error-container text-on-error-container rounded-xl text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {error}
              </div>
            )}
            <input type="text" placeholder="ADI Registration Number" value={adiNumber} onChange={(e) => setAdiNumber(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-outline-variant text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none" />
            <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="text-center py-6">
            <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <h3 className="font-bold text-on-surface text-lg mt-4 mb-2">Claim Submitted!</h3>
            <p className="text-sm text-on-surface-variant">You&apos;ll receive an email once it&apos;s approved, usually within 1–2 business days.</p>
          </div>
        )}
      </div>
    </div>
  );
}
