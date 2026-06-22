'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/instructors', label: 'Instructors', icon: 'local_taxi' },
  { href: '/admin/claims', label: 'Claims', icon: 'assignment_late' },
  { href: '/admin/reviews', label: 'Reviews', icon: 'reviews' },
  { href: '/admin/import', label: 'Import CSV', icon: 'cloud_upload' },
  { href: '/admin/export', label: 'Export Data', icon: 'download' },
  { href: '/admin/backup', label: 'Backup', icon: 'database' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 mb-8 p-2">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center text-on-secondary shadow-md shrink-0">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate leading-tight">
            LCarDrive
          </h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Admin Portal</p>
        </div>
      </div>
      <nav className="flex-1 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-label-md text-label-md transition-all duration-150 ${
                active
                  ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
              <span>{item.label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-6 border-t border-outline-variant/60 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-150"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 font-label-md text-label-md text-on-surface-variant hover:bg-error-container hover:text-error transition-all duration-150"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <aside className="bg-surface-container h-screen w-64 left-0 top-0 hidden md:flex flex-col p-4 gap-stack-sm flex-shrink-0 z-40 relative border-r border-outline-variant/30">
        {sidebarContent}
      </aside>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobileSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-surface-container flex flex-col p-5 gap-stack-sm overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end mb-1">
              <button onClick={() => setMobileSidebarOpen(false)} className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container-highest transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-surface-container-lowest border-b border-outline-variant/40 w-full fixed top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileSidebarOpen(true)} className="text-secondary p-1.5 -ml-1.5 hover:bg-surface-container rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center text-on-secondary text-xs font-bold shadow-sm">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
          </div>
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Admin</span>
        </div>
        <button onClick={handleLogout} className="text-on-surface-variant hover:text-error p-1.5 rounded-lg hover:bg-error-container transition-colors" title="Logout">
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto mt-14 md:mt-0 bg-surface relative">
        <div className="max-w-container-max mx-auto p-margin-mobile md:p-margin-desktop space-y-stack-md">
          {children}
        </div>
      </main>
    </div>
  );
}
