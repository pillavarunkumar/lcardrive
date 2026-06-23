'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';

const navLinks = [
  { href: '/search', label: 'Find Instructors', icon: '' },
  { href: '/find-my-instructor', label: 'AI Match', icon: 'auto_awesome' },
];

function isActive(href: string, pathname: string): boolean {
  if (href === '/search' && pathname.startsWith('/search')) return true;
  if (href === '/find-my-instructor' && pathname.startsWith('/find-my-instructor')) return true;
  if (href === '/' && pathname === '/') return true;
  return false;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-outline-variant">
      <div className="relative flex items-center justify-between whitespace-nowrap px-margin-mobile md:px-margin-desktop h-20 max-w-container-max mx-auto">
        <Link href="/" className="flex items-center gap-3 text-primary">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
          <h2 className="text-headline-md font-headline-md tracking-tight">LCarDrive</h2>
        </Link>

        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-9">
          {navLinks.map((link) => {
            const active = isActive(link.href, pathname);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-body-md font-medium transition-colors relative pb-1 ${
                  active ? 'text-primary' : 'text-on-surface hover:text-primary'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {link.icon && (
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{link.icon}</span>
                  )}
                  {link.label}
                </span>
                {active && <div className="absolute -bottom-[5px] left-0 right-0 h-0.5 bg-primary rounded-full"></div>}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isSignedIn && user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => signOut({ redirectUrl: '/' })}
                className="text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Logout
              </button>
              <Link href="/portal" className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold overflow-hidden">
                  {user.imageUrl ? (
                    <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">{user.fullName || 'Profile'}</span>
              </Link>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-on-surface hover:text-primary transition-colors text-body-md font-semibold px-4 py-2">
                Login
              </Link>
              <Link href="/signup" className="bg-primary text-white px-6 py-2.5 rounded-full font-bold hover:opacity-90 transition-all text-body-md shadow-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-on-surface" aria-label="Toggle menu">
          <span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-outline-variant bg-white px-margin-mobile py-4 space-y-4">
          {isSignedIn && user && (
            <div className="flex items-center gap-3 pb-3 border-b border-outline-variant">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold overflow-hidden">
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  user.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                <p className="text-xs text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
          )}
          {navLinks.map((link) => {
            const active = isActive(link.href, pathname);
            return (
              <Link key={link.label} href={link.href} onClick={() => setOpen(false)}
                className={`block text-body-md font-medium ${active ? 'text-primary' : 'text-on-surface hover:text-primary'}`}
              >
                <span className="flex items-center gap-2">
                  {link.icon && (
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{link.icon}</span>
                  )}
                  {link.label}
                </span>
              </Link>
            );
          })}
          <div className="flex gap-2 pt-2">
            {isSignedIn ? (
              <button onClick={() => { setOpen(false); signOut({ redirectUrl: '/' }); }} className="flex-1 rounded-full h-10 border border-red-200 text-red-600 text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-red-50 transition-colors">
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Logout
              </button>
            ) : (
              <>
                <Link href="/signup" onClick={() => setOpen(false)} className="flex-1 rounded-full h-10 bg-primary text-white text-sm font-bold flex items-center justify-center">Sign Up</Link>
                <Link href="/login" onClick={() => setOpen(false)} className="flex-1 rounded-full h-10 border border-primary text-primary text-sm font-bold flex items-center justify-center">Login</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
