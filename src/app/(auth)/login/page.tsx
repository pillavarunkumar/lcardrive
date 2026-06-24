'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSignIn, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const redirectAfterLogin = async (defaultPath: string) => {
  try {
    const res = await fetch('/api/admin/login-via-clerk', { method: 'POST' });
    const data = await res.json();
    if (data.isAdmin) {
      window.location.href = '/admin';
    } else {
      window.location.href = defaultPath;
    }
  } catch {
    window.location.href = defaultPath;
  }
};

export default function LoginPage() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      redirectAfterLogin('/portal');
    }
  }, [isSignedIn, router]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError('');
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        await redirectAfterLogin('/portal');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: 'google') => {
    if (!isLoaded) return;
    setError('');
    if (isSignedIn) {
      redirectAfterLogin('/portal');
      return;
    }
    signIn.authenticateWithRedirect({
      strategy: `oauth_${provider}`,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/login',
    }).catch((err: any) => {
      if (err.errors?.[0]?.code === 'session_exists') {
        redirectAfterLogin('/portal');
      } else {
        setError(err.errors?.[0]?.message || 'OAuth sign in failed');
      }
    });
  };

  return (
    <main className="flex flex-col lg:flex-row h-dvh w-full bg-surface overflow-hidden">
      {/* Left: Hero */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary-container">
        <div className="absolute inset-0 bg-primary-container/20 z-10" />
        <img
          alt="Driving Instruction"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop"
        />
        <div className="absolute bottom-12 left-12 z-20 max-w-md">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/90 text-white rounded-full mb-6 backdrop-blur-md">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <span className="text-xs font-semibold tracking-wide">Trusted by 50,000+ Students</span>
          </div>
          <h1 className="text-white text-[48px] font-bold leading-[1.1] tracking-[-0.02em] font-display">Master the road with confidence.</h1>
          <p className="text-white/80 text-lg leading-relaxed mt-4 font-body">Connect with the best certified instructors and accelerate your journey to getting your license.</p>
        </div>
        <div className="absolute top-1/2 right-12 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20">
          <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
            <span className="material-symbols-outlined">safety_check</span>
          </div>
          <div>
            <p className="font-semibold text-sm text-primary">Safety First Always</p>
            <p className="text-xs text-on-surface-variant">Dual-control certified vehicles</p>
          </div>
        </div>
      </section>

      {/* Right: Form */}
      <section className="w-full lg:w-1/2 flex flex-col items-center justify-center px-4 md:px-12 lg:px-24 bg-surface">
        <div className="w-full max-w-[400px]">
          <div className="flex items-center justify-center lg:justify-start gap-2 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary flex items-center justify-center rounded-lg">
              <span className="material-symbols-outlined text-white text-lg md:text-xl">directions_car</span>
            </div>
            <span className="text-xl md:text-2xl font-semibold text-primary tracking-tight font-display">LCarDrive</span>
          </div>
          <h2 className="text-2xl md:text-[32px] font-bold text-on-surface mb-1 font-display">Welcome back</h2>
          <p className="text-sm md:text-base text-on-surface-variant mb-4 md:mb-6 font-body">Please enter your details to sign in.</p>

          <button onClick={() => handleOAuth('google')} className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border border-outline-variant rounded-xl hover:bg-surface-container transition-all active:scale-95 text-sm font-semibold font-body mb-3 md:mb-4">
            <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>

          <div className="relative flex items-center justify-center mb-3 md:mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant" />
            </div>
            <div className="relative bg-surface px-3 text-on-surface-variant text-xs font-medium">or</div>
          </div>

          {error && (
            <div className="mb-3 p-2.5 bg-error-container text-on-error-container rounded-xl text-xs md:text-sm font-body flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div>
              <label className="text-xs md:text-sm font-semibold text-on-surface font-body" htmlFor="email">Email Address</label>
              <div className="relative mt-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">mail</span>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required
                  className="w-full pl-9 pr-3 py-2.5 md:py-3 bg-white border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base font-body" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs md:text-sm font-semibold text-on-surface font-body" htmlFor="password">Password</label>
                <Link href="/forgot-password" className="text-[10px] md:text-xs font-medium text-primary hover:text-primary transition-colors font-body">Forgot password?</Link>
              </div>
              <div className="relative mt-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">lock</span>
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                  className="w-full pl-9 pr-9 py-2.5 md:py-3 bg-white border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base font-body" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input id="remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                className="w-3.5 h-3.5 md:w-4 md:h-4 rounded border-outline-variant text-primary focus:ring-primary" />
              <label htmlFor="remember" className="text-[10px] md:text-xs font-medium text-on-surface-variant select-none cursor-pointer font-body">Remember me for 30 days</label>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 md:py-4 bg-primary text-white font-bold text-sm md:text-base rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-body">
              {loading ? 'Signing in...' : 'Sign In'}
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </form>

          <p className="text-center text-xs md:text-base text-on-surface-variant mt-4 md:pt-4 font-body">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary font-bold hover:underline transition-all">Sign Up</Link>
          </p>

          <div className="hidden md:flex pt-8 text-center lg:text-left gap-x-6 justify-center lg:justify-start">
            <span className="text-[10px] font-medium text-on-surface-variant/60 font-body">&copy; 2024 LCarDrive</span>
            <Link href="/privacy" className="text-[10px] font-medium text-on-surface-variant/60 hover:text-primary transition-colors font-body">Privacy Policy</Link>
            <Link href="/terms" className="text-[10px] font-medium text-on-surface-variant/60 hover:text-primary transition-colors font-body">Terms of Service</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
