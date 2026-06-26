'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { useState, useRef, useEffect } from 'react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/instructors', label: 'Instructors', icon: 'groups' },
  { href: '/admin/claims', label: 'Claims', icon: 'fact_check' },
  { href: '/admin/reviews', label: 'Reviews', icon: 'rate_review' },
  { href: '/admin/import', label: 'Import', icon: 'upload_file' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [photoDropdownOpen, setPhotoDropdownOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dbStatus, setDbStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;
    fetch('/api/admin/stats')
      .then(r => {
        if (r.ok) {
          setSessionValid(true);
          setDbStatus('connected');
        } else {
          setSessionValid(false);
          setDbStatus('error');
          router.replace('/admin/login');
        }
      })
      .catch(() => {
        setSessionValid(false);
        setDbStatus('error');
        router.replace('/admin/login');
      });
  }, [isLoginPage, router]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (photoDropdownRef.current && !photoDropdownRef.current.contains(e.target as Node)) {
        setPhotoDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (sessionValid === null) {
    return null;
  }

  if (sessionValid === false) {
    return null;
  }

  const handleLogout = () => {
    router.push('/');
    fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    if (signOut) {
      signOut().catch(() => {});
    }
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-surface">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen flex flex-col py-8 overflow-y-auto bg-white border-r border-outline-variant/30 w-72 z-50 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-8 mb-12">
          <Link href="/admin" className="flex items-center gap-3 text-primary">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
            <h2 className="text-headline-md font-headline-md tracking-tight">LCarDrive</h2>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  active
                    ? 'text-primary font-bold bg-primary/5'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-8 mt-auto">
            <div className="p-4 bg-surface-dim/30 rounded-xl mb-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Status</p>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${dbStatus === 'loading' ? 'bg-amber-400 animate-pulse' : dbStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs font-medium text-on-surface-variant">
                  {dbStatus === 'loading' ? 'Checking...' : dbStatus === 'connected' ? 'All systems normal' : 'Connection error'}
                </span>
              </div>
            </div>
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full bg-primary text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Sign Out
            </button>
          ) : (
            <Link
              href="/admin/login"
              className="block w-full bg-primary text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all text-center"
            >
              Login
            </Link>
          )}
        </div>
      </aside>

      <main className="lg:ml-72 min-h-screen flex flex-col">
        <header className="h-20 flex items-center justify-between px-6 md:px-12 bg-surface/80 backdrop-blur-md border-b border-outline-variant/20 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button
              className="lg:hidden p-2 -ml-2 text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
            <div className="hidden md:flex items-center bg-surface-container-low rounded-2xl px-5 py-2 w-full max-w-md shadow-sm">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 focus:outline-none focus-visible:outline-none text-sm w-full ml-2 placeholder:text-on-surface-variant/50"
                placeholder="Search anything..."
                type="text"
                autoComplete="chrome-off"
                data-1p-ignore
                data-lpignore="true"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center gap-4 md:gap-6">
              <button className="relative text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-surface" />
              </button>
              <button className="text-on-surface-variant hover:text-primary transition-colors hidden sm:block">
                <span className="material-symbols-outlined text-[22px]">help</span>
              </button>
            </div>
            <div className="h-8 w-px bg-outline-variant/30 hidden sm:block" />
            {user ? (
              <div className="flex items-center gap-3 md:gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-primary">{user.fullName || 'Admin'}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">Admin</p>
                </div>
                <div className="relative" ref={photoDropdownRef}>
                  <button
                    onClick={() => setPhotoDropdownOpen(!photoDropdownOpen)}
                    className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border-2 border-white shadow-sm hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer"
                  >
                    {user.imageUrl ? (
                      <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      user.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'A'
                    )}
                  </button>
                  {photoDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-outline-variant shadow-xl z-50 py-1 overflow-hidden">
                      <button
                        onClick={async () => {
                          fileInputRef.current?.click();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px] text-secondary">photo_camera</span>
                        Change Photo
                      </button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !user) return;
                      setUploadingPhoto(true);
                      try {
                        await user.setProfileImage({ file });
                        setPhotoDropdownOpen(false);
                      } catch {}
                      finally { setUploadingPhoto(false); e.target.value = ''; }
                    }}
                  />
                </div>
              </div>
            ) : (
              <Link href="/admin/login" className="text-sm font-bold text-primary hover:underline">
                Login
              </Link>
            )}
          </div>
        </header>

        <div className="flex-1 p-6 md:p-12 pt-8 md:pt-12 max-w-6xl mx-auto w-full bg-[#F8FAFC]">
          {children}
        </div>
      </main>
    </div>
  );
}
