export default function PrivacyPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary via-primary to-primary-container/90 text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">Last updated: January 2026</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20 md:py-28">
        <div className="prose prose-lg max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-bold text-on-surface mb-3">1. Introduction</h2>
            <p className="text-on-surface-variant leading-relaxed">
              LCarDrive Australia (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-on-surface mb-3">2. Information We Collect</h2>
            <p className="text-on-surface-variant leading-relaxed">
              We collect information you provide directly to us, including your name, email address, phone number, and location data when you create an account or contact an instructor. We also automatically collect certain information about your device and usage of our platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-on-surface mb-3">3. How We Use Your Information</h2>
            <p className="text-on-surface-variant leading-relaxed">
              We use the information we collect to facilitate connections between learners and instructors, improve our platform, send relevant communications, and comply with legal obligations. We do not sell your personal information to third parties.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-on-surface mb-3">4. Data Security</h2>
            <p className="text-on-surface-variant leading-relaxed">
              We implement industry-standard security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure. We encourage you to use strong passwords and keep your account credentials confidential.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-on-surface mb-3">5. Contact Us</h2>
            <p className="text-on-surface-variant leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@lcardrive.com.au" className="text-primary-container underline">privacy@lcardrive.com.au</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
