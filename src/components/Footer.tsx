'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <footer className={`${isHome ? 'bg-inverse-surface text-inverse-on-surface' : 'bg-surface-container-low border-t border-outline-variant text-on-surface'} py-16 px-4 md:px-40`}>
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className={`flex flex-col gap-6 ${!isHome ? 'text-on-surface' : ''}`}>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1", color: isHome ? '#006a61' : '#006a61' }}>directions_car</span>
            <h2 className="text-xl font-bold font-display">LCarDrive</h2>
          </div>
          <p className={`text-sm font-body ${isHome ? 'opacity-80' : 'text-on-surface-variant'}`}>
            Connecting Australia&apos;s learners with the most trusted, professional driving instructors in their neighborhood.
          </p>
          
        </div>

        <div>
          <h4 className="font-bold mb-6 font-display text-sm">For Learners</h4>
          <ul className={`flex flex-col gap-4 text-sm ${isHome ? 'opacity-80' : 'text-on-surface-variant'}`}>
            <li><Link href="/search" className={`transition-colors ${isHome ? 'hover:text-secondary-fixed' : 'hover:text-secondary'}`}>Find an Instructor</Link></li>
            <li><span className={`transition-colors cursor-default ${isHome ? 'hover:text-secondary-fixed' : 'hover:text-secondary'}`}>Learning App</span></li>
            <li><span className={`transition-colors cursor-default ${isHome ? 'hover:text-secondary-fixed' : 'hover:text-secondary'}`}>Driving Test Tips</span></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 font-display text-sm">For Instructors</h4>
          <ul className={`flex flex-col gap-4 text-sm ${isHome ? 'opacity-80' : 'text-on-surface-variant'}`}>
            <li><span className={`transition-colors cursor-default ${isHome ? 'hover:text-secondary-fixed' : 'hover:text-secondary'}`}>Join as Instructor</span></li>
            <li><Link href="/portal" className={`transition-colors ${isHome ? 'hover:text-secondary-fixed' : 'hover:text-secondary'}`}>Instructor Portal</Link></li>
            <li><span className={`transition-colors cursor-default ${isHome ? 'hover:text-secondary-fixed' : 'hover:text-secondary'}`}>Marketing Tools</span></li>
            <li><span className={`transition-colors cursor-default ${isHome ? 'hover:text-secondary-fixed' : 'hover:text-secondary'}`}>Insurance Partners</span></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 font-display text-sm">Support</h4>
          <ul className={`flex flex-col gap-4 text-sm ${isHome ? 'opacity-80' : 'text-on-surface-variant'}`}>
            <li><span className={`transition-colors cursor-default ${isHome ? 'hover:text-secondary-fixed' : 'hover:text-secondary'}`}>Help Center</span></li>
            <li><span className={`transition-colors cursor-default ${isHome ? 'hover:text-secondary-fixed' : 'hover:text-secondary'}`}>Contact Us</span></li>
            <li><span className={`transition-colors cursor-default ${isHome ? 'hover:text-secondary-fixed' : 'hover:text-secondary'}`}>Privacy Policy</span></li>
            <li><span className={`transition-colors cursor-default ${isHome ? 'hover:text-secondary-fixed' : 'hover:text-secondary'}`}>Terms of Service</span></li>
          </ul>
        </div>
      </div>

      <div className={`mt-16 pt-8 border-t text-center text-xs ${isHome ? 'border-white/10 opacity-60' : 'border-outline-variant text-on-surface-variant'}`}>
        &copy; {new Date().getFullYear()} LCarDrive Australia. All rights reserved. Driving toward a safer future.
      </div>
    </footer>
  );
}
