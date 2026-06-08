'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/import', label: 'Import CSV', icon: 'cloud_upload' },
  { href: '/admin/reviews', label: 'Reviews', icon: 'reviews' },
  { href: '/admin/claims', label: 'Claims', icon: 'assignment_late' },
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
      <div className="flex items-center gap-3 mb-6 p-2">
        <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed text-lg font-bold">
          AD
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">
            Admin Portal
          </h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Platform management</p>
        </div>
      </div>
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-lg p-3 font-label-md text-label-md transition-all duration-200 ease-in-out ${
                active
                  ? 'bg-secondary-container text-on-secondary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-outline-variant space-y-2">
        <Link href="/"
          className="w-full bg-surface-container-highest text-on-surface rounded-lg py-3 font-label-md text-label-md font-bold flex items-center justify-center gap-2 hover:brightness-95 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Site
        </Link>
        <button onClick={handleLogout}
          className="w-full bg-surface-container-highest text-on-surface rounded-lg py-3 font-label-md text-label-md font-bold flex items-center justify-center gap-2 hover:brightness-95 transition-colors">
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Desktop SideNavBar */}
      <aside className="bg-surface-container h-screen w-64 left-0 top-0 hidden md:flex flex-col p-4 gap-stack-sm flex-shrink-0 z-40 relative">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobileSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/40"></div>
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-surface-container flex flex-col p-4 gap-stack-sm overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <button onClick={() => setMobileSidebarOpen(false)} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-highest transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-surface-container-lowest border-b border-outline-variant w-full fixed top-0 z-40">
        <div className="flex items-center gap-2">
          <button onClick={() => setMobileSidebarOpen(true)} className="text-secondary p-1 -ml-1 hover:bg-surface-container rounded-lg transition-colors">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="font-headline-sm text-headline-sm font-bold">Admin</span>
        </div>
        <button onClick={handleLogout} className="text-on-surface-variant hover:text-secondary transition-colors">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto mt-16 md:mt-0 p-margin-mobile md:p-margin-desktop bg-surface relative">
        <div className="max-w-container-max mx-auto space-y-stack-md">
          {children}
        </div>
      </main>
    </div>
  );
}
