import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-20 pb-12 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 text-primary-fixed mb-6">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
              <h2 className="text-headline-md font-headline-md tracking-tight">LCarDrive</h2>
            </div>
            <p className="text-body-md text-primary-fixed/80">
              Australia&apos;s premium driving instructor marketplace. Connecting the next generation of safe drivers with verified professionals.
            </p>
            <div className="flex gap-4 mt-8">
              <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all" href="#">
                <span className="material-symbols-outlined text-[20px]">public</span>
              </a>
              <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all" href="#">
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </a>
              <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all" href="#">
                <span className="material-symbols-outlined text-[20px]">share</span>
              </a>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-white mb-6 text-label-sm uppercase tracking-widest">Learners</h5>
            <ul className="space-y-4">
              <li><Link href="/search" className="text-primary-fixed/70 hover:text-white transition-colors text-body-md">Find Instructors</Link></li>
              <li><Link href="/how-it-works" className="text-primary-fixed/70 hover:text-white transition-colors text-body-md">How It Works</Link></li>
              <li><Link href="/search" className="text-primary-fixed/70 hover:text-white transition-colors text-body-md">Browse Suburbs</Link></li>
              <li><Link href="/booking-guide" className="text-primary-fixed/70 hover:text-white transition-colors text-body-md">Booking Guide</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-6 text-label-sm uppercase tracking-widest">Instructors</h5>
            <ul className="space-y-4">
              <li><Link href="/claim" className="text-primary-fixed/70 hover:text-white transition-colors text-body-md">Join LCarDrive</Link></li>
              <li><Link href="/portal" className="text-primary-fixed/70 hover:text-white transition-colors text-body-md">Instructor Portal</Link></li>
              <li><Link href="/success-tips" className="text-primary-fixed/70 hover:text-white transition-colors text-body-md">Success Tips</Link></li>
              <li><Link href="/pricing" className="text-primary-fixed/70 hover:text-white transition-colors text-body-md">Pricing &amp; Fees</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-6 text-label-sm uppercase tracking-widest">Company</h5>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-primary-fixed/70 hover:text-white transition-colors text-body-md">About Us</Link></li>
              <li><Link href="/reviews" className="text-primary-fixed/70 hover:text-white transition-colors text-body-md">Reviews</Link></li>
              <li><Link href="/privacy" className="text-primary-fixed/70 hover:text-white transition-colors text-body-md">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-primary-fixed/70 hover:text-white transition-colors text-body-md">Terms &amp; Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-label-sm text-primary-fixed/60 uppercase font-medium tracking-wide">
          <p>&copy; {new Date().getFullYear()} LCarDrive Australia. Built for Safety.</p>
          <div className="flex gap-8">
            <span>ABN 12 345 678 901</span>
            <span>ASIC Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
