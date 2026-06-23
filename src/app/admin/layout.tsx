'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'grid_view' },
  { href: '/admin/claims', label: 'Claims', icon: 'flag' },
  { href: '/admin/reviews', label: 'Reviews', icon: 'rate_review' },
  { href: '/admin/import', label: 'Import CSV', icon: 'upload_file' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    signOut({ redirectUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 md:px-6 h-16 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-4 md:gap-8">
            <Link href="/" className="flex items-center gap-2 text-primary shrink-0">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
              <span className="text-base font-bold tracking-tight hidden sm:inline">LCarDrive</span>
            </Link>
            <div className="h-5 w-px bg-gray-200 hidden md:block" />
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/search" className="hidden md:inline text-sm font-medium text-gray-500 hover:text-primary transition-colors">Find Instructors</Link>
            <Link href="/find-my-instructor" className="hidden md:inline text-sm font-medium text-gray-500 hover:text-primary transition-colors">AI Match</Link>
            <div className="h-5 w-px bg-gray-200 hidden md:block" />
            {user ? (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span className="hidden sm:inline">Logout</span>
                </button>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold overflow-hidden">
                  {user.imageUrl ? (
                    <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'A'
                  )}
                </div>
              </div>
            ) : (
              <Link href="/admin/login" className="text-sm font-semibold text-primary hover:underline">Login</Link>
            )}
          </div>
        </div>
        <div className="md:hidden flex items-center gap-2 px-4 pb-2 overflow-x-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      <main className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto">
        {children}
      </main>
    </div>
  );
}
