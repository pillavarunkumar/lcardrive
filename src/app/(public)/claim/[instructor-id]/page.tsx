'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function ClaimPage() {
  const [step, setStep] = useState<'signup' | 'submit' | 'done'>('signup');
  const [adiNumber, setAdiNumber] = useState('');

  const handleSignup = (e: React.FormEvent) => { e.preventDefault(); setStep('submit'); };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setStep('done'); };

  return (
    <div className="max-w-lg mx-auto px-margin-mobile py-stack-lg">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-secondary text-3xl">verified</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-on-surface mb-2">Claim This Profile</h1>
        <p className="text-on-surface-variant">Is this your listing? Verify your identity to take ownership.</p>
      </div>

      <div className="card-shadow bg-white rounded-2xl p-8">
        {step === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <h3 className="font-bold text-on-surface mb-2">Create Your Account</h3>
            <input type="text" placeholder="First Name" className="w-full px-4 py-3 rounded-lg border border-outline-variant text-sm text-on-surface focus:ring-2 focus:ring-secondary outline-none" required />
            <input type="text" placeholder="Last Name" className="w-full px-4 py-3 rounded-lg border border-outline-variant text-sm text-on-surface focus:ring-2 focus:ring-secondary outline-none" required />
            <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-lg border border-outline-variant text-sm text-on-surface focus:ring-2 focus:ring-secondary outline-none" required />
            <input type="password" placeholder="Password" className="w-full px-4 py-3 rounded-lg border border-outline-variant text-sm text-on-surface focus:ring-2 focus:ring-secondary outline-none" required minLength={8} />
            <button type="submit" className="w-full bg-secondary text-white py-3 rounded-lg font-bold text-sm hover:brightness-110 transition-all">
              Continue
            </button>
          </form>
        )}

        {step === 'submit' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-bold text-on-surface mb-2">Verify Your ADI Registration</h3>
            <p className="text-sm text-on-surface-variant">Enter your ADI registration number to verify your identity.</p>
            <input type="text" placeholder="ADI Registration Number" value={adiNumber} onChange={(e) => setAdiNumber(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-outline-variant text-sm text-on-surface focus:ring-2 focus:ring-secondary outline-none" required />
            <button type="submit" disabled={!adiNumber} className="w-full bg-secondary text-white py-3 rounded-lg font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50">
              Submit for Review
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="text-center py-6">
            <span className="material-symbols-outlined text-4xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <h3 className="font-bold text-on-surface text-lg mt-4 mb-2">Claim Submitted!</h3>
            <p className="text-sm text-on-surface-variant">You&apos;ll receive an email once it&apos;s approved, usually within 1–2 business days.</p>
          </div>
        )}
      </div>
    </div>
  );
}
