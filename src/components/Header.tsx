'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';


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
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#eaecf1]">
      <div className="relative flex items-center justify-between whitespace-nowrap px-4 md:px-40 py-3">
        <Link href="/" className="flex items-center gap-3 text-[#111318]">
          <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
          <h2 className="text-[#111318] text-lg font-bold leading-tight tracking-[-0.015em] font-display">LCarDrive</h2>
        </Link>

        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-9">
          {navLinks.map((link) => {
            const active = isActive(link.href, pathname);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium leading-normal transition-colors relative pb-1 ${
                  active ? 'text-secondary' : 'text-[#111318] hover:text-secondary'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {link.icon && (
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{link.icon}</span>
                  )}
                  {link.label}
                </span>
                {active && <div className="absolute -bottom-[5px] left-0 right-0 h-0.5 bg-secondary rounded-full"></div>}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center max-w-[180px] w-full">
            <div className="bg-surface-container rounded-full px-4 py-2 border border-outline-variant focus-within:border-secondary flex items-center gap-2 w-full transition-colors">
              <span className="material-symbols-outlined text-outline text-sm">search</span>
              <input
                type="text"
                placeholder="Search suburb..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    router.push(`/search?suburb=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
                className="bg-transparent border-none focus:ring-0 text-sm outline-none w-full text-on-surface placeholder:text-outline font-body"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/signup" className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:brightness-110 transition-all">
              <span className="truncate">Sign Up</span>
            </Link>
            <Link href="/login" className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-surface-container text-on-surface text-sm font-bold hover:brightness-95 transition-all">
              <span className="truncate">Login</span>
            </Link>
          </div>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-on-surface" aria-label="Toggle menu">
          <span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#eaecf1] bg-white px-4 py-4 space-y-4">
          {navLinks.map((link) => {
            const active = isActive(link.href, pathname);
            return (
              <Link key={link.label} href={link.href} onClick={() => setOpen(false)}
                className={`block text-sm font-medium ${active ? 'text-secondary' : 'text-on-surface hover:text-secondary'}`}
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
            <Link href="/signup" onClick={() => setOpen(false)} className="flex-1 rounded-lg h-10 bg-primary text-white text-sm font-bold flex items-center justify-center">Sign Up</Link>
            <Link href="/login" onClick={() => setOpen(false)} className="flex-1 rounded-lg h-10 bg-surface-container text-on-surface text-sm font-bold flex items-center justify-center">Login</Link>
          </div>
        </div>
      )}
    </header>
  );
}
