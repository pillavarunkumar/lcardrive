'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { useState, useEffect, useRef } from 'react';
import type { Instructor } from '@/types';

const navItems = [
  { href: '/portal', label: 'Dashboard', icon: 'dashboard' },
  { href: '/portal/profile', label: 'My Profile', icon: 'person' },
  { href: '/portal/leads', label: 'Leads', icon: 'conversion_path' },
  { href: '/portal/rates', label: 'Pricing', icon: 'payments' },
  { href: '/portal/availability', label: 'Availability', icon: 'calendar_month' },
  { href: '/portal/service-areas', label: 'Service Areas', icon: 'map' },
  { href: '/portal/reviews', label: 'Reviews', icon: 'star' },
  { href: '/portal/settings', label: 'Settings', icon: 'settings' },
];

const pageTitles: Record<string, string> = {
  '/portal': 'Dashboard',
  '/portal/profile': 'My Profile',
  '/portal/leads': 'Student Leads',
  '/portal/rates': 'Pricing Management',
  '/portal/availability': 'Availability Management',
  '/portal/service-areas': 'Service Areas',
  '/portal/reviews': 'Reviews & Feedback',
  '/portal/settings': 'Account Settings',
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [hasPendingReview, setHasPendingReview] = useState(false);

  useEffect(() => {
    fetch('/api/portal/profile')
      .then(r => r.json())
      .then(d => {
        if (d.instructor) setInstructor(d.instructor);
        if (d.hasPendingReview) setHasPendingReview(true);
      })
      .catch(() => {});
  }, []);

  const isActive = (href: string) => {
    if (href === '/portal') return pathname === '/portal';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const pageTitle = Object.entries(pageTitles).find(([href]) =>
    href === '/portal' ? pathname === '/portal' : pathname === href || pathname.startsWith(href + '/')
  )?.[1] || 'Instructor Portal';

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
    : '';

  const displayName = `${instructor?.first_name || user?.firstName || ''} ${instructor?.last_name || user?.lastName || ''}`.trim();
  const profileStatus = instructor?.is_verified
    ? { label: 'Profile verified', color: 'bg-green-500', pulse: false }
    : hasPendingReview
      ? { label: 'Under review', color: 'bg-amber-500', pulse: false }
      : { label: 'Profile pending', color: 'bg-error', pulse: true };

  return (
    <div className="min-h-screen bg-surface">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen flex flex-col py-8 bg-white border-r border-outline-variant/30 w-72 z-50 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-8 mb-12">
          <Link href="/portal" className="flex items-center gap-3 text-primary" aria-label="Go to dashboard">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
            <h2 className="text-headline-md font-headline-md tracking-tight">LCarDrive</h2>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4" aria-label="Portal navigation">
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
              <span className={`w-2 h-2 rounded-full ${profileStatus.color} ${profileStatus.pulse ? 'animate-pulse' : ''}`} />
              <span className="text-xs font-medium text-on-surface-variant">{profileStatus.label}</span>
            </div>
          </div>
          {user && (
            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              className="w-full bg-primary text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Sign Out
            </button>
          )}
        </div>
      </aside>

      <main className="lg:ml-72 min-h-screen flex flex-col">
        <header className="h-20 flex items-center justify-between px-6 md:px-12 bg-surface/80 backdrop-blur-md border-b border-outline-variant/20 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button
              className="lg:hidden p-2 -ml-2 text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
            <h2 className="text-headline-md font-headline-md font-bold text-primary">{pageTitle}</h2>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center gap-4 md:gap-6">
              <button className="relative text-on-surface-variant hover:text-primary transition-colors" aria-label="Notifications">
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-surface" />
              </button>
              <button className="text-on-surface-variant hover:text-primary transition-colors hidden sm:block" aria-label="Help">
                <span className="material-symbols-outlined text-[22px]">help</span>
              </button>
            </div>
            <div className="h-8 w-px bg-outline-variant/30 hidden sm:block" />
            {user && (
              <div className="flex items-center gap-3 md:gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-primary">{displayName || 'Instructor'}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">Instructor</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border-2 border-white shadow-sm">
                  {user.imageUrl ? (
                    <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm">{initials || 'I'}</span>
                  )}
                </div>
              </div>
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
