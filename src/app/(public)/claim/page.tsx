import Link from 'next/link';

export const metadata = {
  title: 'Claim Your Instructor Profile | LCarDrive',
  description: 'Claim an existing LCarDrive instructor listing or create a new instructor account.',
};

export default function ClaimLandingPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary via-primary to-primary-container/90 text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Claim Your Instructor Profile</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Take ownership of an existing listing, or create a new profile to start receiving learner
            enquiries.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-outline-variant/40 shadow-sm p-8">
            <div className="w-11 h-11 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container mb-5">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                search
              </span>
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-3">Already listed?</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              Find your profile in search, open it, and select &ldquo;Claim this profile&rdquo;. You will
              need to sign in and provide your ADI registration number so our team can confirm ownership.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-primary-container text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-container/90 transition-all"
            >
              Find my listing
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-outline-variant/40 shadow-sm p-8">
            <div className="w-11 h-11 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container mb-5">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                person_add
              </span>
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-3">Not listed yet?</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              Create an instructor account to build your profile, add your rates and availability, and
              submit it for review. Creating a listing is free.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 border-2 border-primary-container text-primary-container px-6 py-3 rounded-xl font-bold hover:bg-primary-container/5 transition-all"
            >
              Create an instructor account
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-on-surface-variant">
          Claim reviews usually take 1&ndash;2 business days. If you need help, email{' '}
          <a href="mailto:hello@lcardrive.com.au" className="text-primary-container font-semibold hover:underline">
            hello@lcardrive.com.au
          </a>
          .
        </p>
      </section>
    </div>
  );
}
