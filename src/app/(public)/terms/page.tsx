export default function TermsPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary via-primary to-primary-container/90 text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms &amp; Conditions</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">Last updated: January 2026</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20 md:py-28">
        <div className="prose prose-lg max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-bold text-on-surface mb-3">1. Acceptance of Terms</h2>
            <p className="text-on-surface-variant leading-relaxed">
              By accessing or using LCarDrive (&quot;the Platform&quot;), you agree to be bound by these Terms &amp; Conditions. If you do not agree with any part of these terms, you may not use our services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-on-surface mb-3">2. Definitions</h2>
            <p className="text-on-surface-variant leading-relaxed">
              &quot;Learner&quot; refers to any person using the Platform to find a driving instructor. &quot;Instructor&quot; refers to a verified driving professional listing services on the Platform. &quot;Platform&quot; refers to the LCarDrive website and all associated services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-on-surface mb-3">3. User Responsibilities</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Users agree to provide accurate information, maintain the confidentiality of their accounts, and use the Platform in compliance with all applicable Australian laws. Instructors must hold valid credentials and maintain appropriate insurance.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-on-surface mb-3">4. Platform Fee</h2>
            <p className="text-on-surface-variant leading-relaxed">
              LCarDrive charges a 5% platform fee on completed lesson bookings. This fee is deducted from the instructor&apos;s payment. Package bookings are exempt from platform fees. All fees are disclosed before any transaction is completed.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-on-surface mb-3">5. Limitation of Liability</h2>
            <p className="text-on-surface-variant leading-relaxed">
              LCarDrive acts as a marketplace connecting learners with instructors. We are not responsible for the quality of instruction provided, nor for any disputes arising between learners and instructors. We recommend users exercise due diligence.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-on-surface mb-3">6. Contact</h2>
            <p className="text-on-surface-variant leading-relaxed">
              For questions about these terms, contact us at <a href="mailto:legal@lcardrive.com.au" className="text-primary-container underline">legal@lcardrive.com.au</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
