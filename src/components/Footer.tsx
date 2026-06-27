import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0A2E24] text-white">
      {/* Top accent line */}
      <div className="h-1 bg-gradient-to-r from-[#064E3B] via-[#059669] to-[#064E3B]" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
        <div className="flex flex-col md:flex-row gap-12 md:gap-0 mb-14">
          {/* Brand */}
          <div className="md:w-[300px] md:mr-12 shrink-0">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="material-symbols-outlined text-[#34D399] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
              <h2 className="text-lg font-bold tracking-tight text-white">LCarDrive</h2>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Australia&apos;s premium driving instructor marketplace. Connecting the next generation of safe drivers with verified professionals.
            </p>
            <div className="flex gap-3 mt-6">
              <a className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:bg-[#34D399] hover:text-white transition-all" href="/" target="_blank" rel="noopener noreferrer" aria-label="Website">
                <span className="material-symbols-outlined text-lg">public</span>
              </a>
              <a className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:bg-[#34D399] hover:text-white transition-all" href="mailto:hello@lcardrive.com.au" aria-label="Email">
                <span className="material-symbols-outlined text-lg">mail</span>
              </a>
              <a className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:bg-[#34D399] hover:text-white transition-all" href="https://linkedin.com/company/lcardrive" target="_blank" rel="noopener noreferrer" aria-label="Share">
                <span className="material-symbols-outlined text-lg">share</span>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-0">
            {/* Learners */}
            <div>
              <h5 className="text-xs font-bold text-white/40 uppercase tracking-[0.12em] mb-5">Learners</h5>
              <ul className="space-y-3">
                <li><Link href="/search" className="text-sm text-white/70 hover:text-[#34D399] transition-colors">Find Instructors</Link></li>
                <li><Link href="/#how-it-works" className="text-sm text-white/70 hover:text-[#34D399] transition-colors">How It Works</Link></li>
                <li><Link href="/search" className="text-sm text-white/70 hover:text-[#34D399] transition-colors">Browse Suburbs</Link></li>
                <li><Link href="/booking-guide" className="text-sm text-white/70 hover:text-[#34D399] transition-colors">Booking Guide</Link></li>
              </ul>
            </div>

            {/* Instructors */}
            <div>
              <h5 className="text-xs font-bold text-white/40 uppercase tracking-[0.12em] mb-5">Instructors</h5>
              <ul className="space-y-3">
                <li><Link href="/claim" className="text-sm text-white/70 hover:text-[#34D399] transition-colors">Join LCarDrive</Link></li>
                <li><Link href="/portal" className="text-sm text-white/70 hover:text-[#34D399] transition-colors">Instructor Portal</Link></li>
                <li><Link href="/success-tips" className="text-sm text-white/70 hover:text-[#34D399] transition-colors">Success Tips</Link></li>
                <li><Link href="/pricing" className="text-sm text-white/70 hover:text-[#34D399] transition-colors">Pricing &amp; Fees</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h5 className="text-xs font-bold text-white/40 uppercase tracking-[0.12em] mb-5">Company</h5>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-sm text-white/70 hover:text-[#34D399] transition-colors">About Us</Link></li>
                <li><Link href="/#success-stories" className="text-sm text-white/70 hover:text-[#34D399] transition-colors">Reviews</Link></li>
                <li><Link href="/privacy" className="text-sm text-white/70 hover:text-[#34D399] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-white/70 hover:text-[#34D399] transition-colors">Terms &amp; Conditions</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">&copy; {new Date().getFullYear()} LCarDrive Australia. Built for Safety.</p>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              ABN 12 345 678 901
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-white/30">verified</span>
              ASIC Verified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
