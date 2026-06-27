import Link from 'next/link';

export default function PricingPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary via-primary to-primary-container/90 text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Pricing &amp; Fees</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Transparent pricing for learners and instructors. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-2xl border border-outline-variant/40 shadow-sm p-8 md:p-10">
            <span className="material-symbols-outlined text-primary-container text-3xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            <h2 className="text-2xl font-bold text-on-surface mb-2">For Learners</h2>
            <p className="text-on-surface-variant mb-6">Finding and booking your perfect instructor</p>
            <ul className="space-y-4">
              {['Free to browse and search', 'Free to view instructor profiles', 'Free to send enquiries', 'Pay instructors directly', 'No booking fees or platform charges'].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-on-surface">
                  <span className="material-symbols-outlined text-primary-container text-[18px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-outline-variant/40 shadow-sm p-8 md:p-10">
            <span className="material-symbols-outlined text-primary-container text-3xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
            <h2 className="text-2xl font-bold text-on-surface mb-2">For Instructors</h2>
            <p className="text-on-surface-variant mb-6">Grow your driving school with LCarDrive</p>
            <ul className="space-y-4">
              {['Free to create a profile', 'Free to list your services', '5% platform fee on completed bookings', 'Keep 100% of lesson package payments', 'No monthly subscription required'].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-on-surface">
                  <span className="material-symbols-outlined text-primary-container text-[18px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/40 p-8 md:p-10">
          <h2 className="text-xl font-bold text-on-surface mb-4">How the platform fee works</h2>
          <p className="text-on-surface-variant mb-6 leading-relaxed">
            When a learner books and completes a lesson through LCarDrive, a 5% platform fee is applied to the lesson cost. 
            This fee covers payment processing, platform maintenance, student acquisition, and ongoing support. 
            There are no setup fees, monthly charges, or hidden costs.
          </p>
          <div className="bg-white rounded-xl border border-outline-variant/40 p-6">
            <p className="text-sm font-bold text-on-surface mb-2">Example</p>
            <p className="text-sm text-on-surface-variant">
              A $70/hour lesson results in a $3.50 platform fee. You receive $66.50. 
              Package bookings (5 or 10 lessons) are paid directly to you with no platform fee.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-primary-container/5 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-4">Ready to get started?</h2>
          <p className="text-on-surface-variant mb-8">Join Australia&#39;s fastest growing driving instructor marketplace.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search" className="inline-flex items-center justify-center gap-2 bg-primary-container text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-container/90 transition-all shadow-lg shadow-primary-container/20">
              Find an Instructor
            </Link>
            <Link href="/claim" className="inline-flex items-center justify-center gap-2 bg-white text-primary-container border-2 border-primary-container px-8 py-4 rounded-xl font-bold hover:bg-primary-container/5 transition-all">
              Become an Instructor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
