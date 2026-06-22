'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSignUp, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/portal');
    }
  }, [isSignedIn, router]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) { setError('Please agree to the Terms of Service and Privacy Policy'); return; }
    if (!isLoaded) return;
    setError('');
    setLoading(true);
    try {
      const nameParts = fullName.trim().split(/\s+/);
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || undefined,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/portal');
      } else {
        if (result.status === 'missing_requirements' && result.missingFields?.includes('email_address')) {
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          setError('Please check your email for a verification code.');
        } else {
          setError('Something went wrong. Please try again.');
        }
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: 'google') => {
    if (!isLoaded) return;
    setError('');
    if (isSignedIn) {
      router.push('/portal');
      return;
    }
    signUp.authenticateWithRedirect({
      strategy: `oauth_${provider}`,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/portal',
    }).catch((err: any) => {
      if (err.errors?.[0]?.code === 'session_exists') {
        router.push('/portal');
      } else {
        setError(err.errors?.[0]?.message || 'OAuth sign up failed');
      }
    });
  };

  return (
    <main className="h-dvh flex flex-col md:flex-row bg-surface overflow-hidden">
      {/* Left: Form */}
      <section className="flex-1 flex flex-col justify-center px-3 md:px-8 lg:px-16 bg-surface-container-lowest">
        <div className="max-w-md w-full mx-auto py-1 md:py-4">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-3 md:mb-4">
            <div className="w-7 h-7 md:w-10 md:h-10 bg-primary flex items-center justify-center rounded-lg">
              <span className="material-symbols-outlined text-white text-lg md:text-xl">directions_car</span>
            </div>
            <span className="text-xl md:text-2xl font-semibold text-primary tracking-tight font-display">LCarDrive</span>
          </div>

          <div className="mb-2 md:mb-3">
            <h1 className="text-2xl md:text-[32px] font-bold text-on-surface font-display">Start your journey</h1>
            <p className="text-sm md:text-base text-on-surface-variant mb-3 md:mb-4 font-body">Join the community of safe and skilled drivers today.</p>
          </div>

          <button onClick={() => handleOAuth('google')} className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border border-outline-variant rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors font-body mb-2 md:mb-3">
            <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </button>

          <div className="relative flex items-center mb-2 md:mb-3">
            <div className="flex-grow border-t border-outline-variant" />
            <span className="flex-shrink mx-3 text-xs font-semibold text-on-surface-variant uppercase tracking-widest font-body">or</span>
            <div className="flex-grow border-t border-outline-variant" />
          </div>

          {error && (
            <div className="mb-3 p-2.5 bg-error-container text-on-error-container rounded-xl text-xs md:text-sm font-body flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5 md:space-y-3">
            <div>
              <label className="text-xs md:text-sm font-semibold text-on-surface font-body" htmlFor="fullname">Full Name</label>
              <input id="fullname" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" required
                className="w-full px-3 py-2 md:py-2.5 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-sm md:text-base text-on-surface placeholder:text-outline-variant transition-all font-body mt-0.5" />
            </div>
            <div>
              <label className="text-xs md:text-sm font-semibold text-on-surface font-body" htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
                className="w-full px-3 py-2 md:py-2.5 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-sm md:text-base text-on-surface placeholder:text-outline-variant transition-all font-body mt-0.5" />
            </div>
            <div>
              <label className="text-xs md:text-sm font-semibold text-on-surface font-body" htmlFor="password">Password</label>
              <div className="relative mt-0.5">
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8}
                  className="w-full px-3 py-2 md:py-2.5 bg-surface border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-sm md:text-base text-on-surface placeholder:text-outline-variant transition-all font-body" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-secondary">
                  <span className="material-symbols-outlined text-[18px] md:text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="p-2.5 md:p-3 bg-surface-container-low border border-outline-variant rounded-xl flex items-center justify-between group hover:border-secondary transition-colors">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-7 h-7 md:w-9 md:h-9 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined text-sm md:text-base">school</span>
                </div>
                <div>
                  <p className="text-xs md:text-sm font-semibold text-on-surface font-body">I am an instructor</p>
                  <p className="text-[10px] text-on-surface-variant font-body">Apply to teach and earn</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isInstructor} onChange={(e) => setIsInstructor(e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 md:w-11 md:h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 md:after:h-5 md:after:w-5 after:transition-all peer-checked:bg-secondary" />
              </label>
            </div>

            <div className="flex items-start gap-1.5 md:gap-2">
              <input id="terms" type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 md:w-4 md:h-4 rounded border-outline-variant text-secondary focus:ring-secondary cursor-pointer" />
              <label htmlFor="terms" className="text-xs md:text-sm font-medium text-on-surface-variant leading-relaxed font-body">
                I agree to the <Link href="/terms" className="text-secondary font-bold hover:underline">Terms</Link> and <Link href="/privacy" className="text-secondary font-bold hover:underline">Privacy Policy</Link>.
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-secondary text-on-secondary font-semibold text-sm md:text-base py-2.5 md:py-3.5 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-body">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs md:text-base text-on-surface-variant mt-3 md:pt-3 font-body">
            Already have an account?{' '}
            <Link href="/login" className="text-secondary font-bold hover:underline transition-all">Login</Link>
          </p>
        </div>
      </section>

      {/* Right: Brand Experience */}
      <section className="hidden md:block md:w-[45%] lg:w-[55%] relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=2070&auto=format&fit=crop" alt="Car driving on scenic coastal road" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary-container/90 via-primary-container/40 to-transparent z-10 flex flex-col justify-end p-6 md:p-8 lg:p-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-secondary-container/20 backdrop-blur-md px-2.5 py-1 rounded-full text-secondary-fixed mb-4 border border-secondary-fixed/30">
              <span className="material-symbols-outlined text-[10px] md:text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="text-[9px] md:text-xs uppercase tracking-wider font-semibold font-body">Trusted by 10k+ Learners</span>
            </div>
            <h2 className="text-white text-2xl md:text-3xl lg:text-[48px] font-bold leading-[1.1] tracking-[-0.02em] font-display">Drive with confidence, learn with experts.</h2>
            <div className="hidden lg:grid grid-cols-2 gap-4 mt-8">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <span className="material-symbols-outlined text-white text-lg">security</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm font-display">Safety First</h4>
                  <p className="text-[11px] text-white/70 font-body">Certified instructors with dual-control vehicles.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <span className="material-symbols-outlined text-white text-lg">trending_up</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm font-display">Fast Progress</h4>
                  <p className="text-[11px] text-white/70 font-body">Personalized lesson plans for faster licensing.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-1/4 right-8 z-20 hidden xl:block">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 md:p-5 rounded-2xl shadow-2xl max-w-[220px]">
            <div className="flex items-center gap-3 mb-3">
              <img alt="Instructor" className="w-10 h-10 rounded-full border-2 border-secondary" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop" />
              <div>
                <p className="text-[11px] md:text-sm font-semibold text-white font-body">David Miller</p>
                <p className="text-[10px] text-secondary-fixed font-body">Top Rated Instructor</p>
              </div>
            </div>
            <div className="flex gap-0.5 text-[#FFD700]">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-[12px] md:text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              ))}
            </div>
            <p className="text-[11px] md:text-[13px] text-white/80 mt-2 leading-relaxed font-body">&ldquo;Ready to help you master the roads with confidence and care.&rdquo;</p>
          </div>
        </div>
      </section>
    </main>
  );
}
