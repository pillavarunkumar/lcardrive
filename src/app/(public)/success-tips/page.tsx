import Link from 'next/link';

const tips = [
  { icon: 'badge', title: 'Complete Your Profile', desc: 'A 100% complete profile with a professional photo, detailed bio, and clear pricing builds trust with potential students. Profiles with photos receive 3x more enquiries.' },
  { icon: 'payments', title: 'Set Competitive Pricing', desc: 'Research other instructors in your area and set rates that reflect your experience. Offering lesson packages (5 or 10 lessons) at a slight discount encourages commitment.' },
  { icon: 'calendar_month', title: 'Maximise Availability', desc: 'Instructors with evening and weekend availability see up to 35% more bookings. Consider extending your hours to capture working professionals and students.' },
  { icon: 'map', title: 'Expand Service Areas', desc: 'The more suburbs you serve, the more students can find you. Focus on areas within a 10-15km radius that have high demand but limited instructor competition.' },
  { icon: 'directions_car', title: 'Keep Vehicle Info Updated', desc: 'Students often choose instructors based on the vehicle they\'ll learn in. Keep your make, model, year, and transmission type accurate and up to date.' },
  { icon: 'star', title: 'Encourage Reviews', desc: 'Positive reviews are your best marketing. Ask students to leave a review after they pass and showcase your success stories on your profile.' },
  { icon: 'trending_up', title: 'Track Your Analytics', desc: 'Use the Instructor Portal dashboard to monitor how often you appear in search results. Adjust your profile and pricing based on what works.' },
  { icon: 'verified', title: 'Get Verified', desc: 'A verified badge on your profile increases student confidence. Complete all profile requirements and submit for verification to stand out from the crowd.' },
];

export default function SuccessTipsPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary via-primary to-primary-container/90 text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Instructor Success Tips</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Proven strategies to grow your driving school and attract more students on LCarDrive.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-6">
          {tips.map((tip, i) => (
            <div key={i} className="bg-white rounded-2xl border border-outline-variant/40 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container mb-4">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{tip.icon}</span>
              </div>
              <h3 className="font-bold text-on-surface mb-2">{tip.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface-container-low py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-4">Ready to grow?</h2>
          <p className="text-on-surface-variant mb-8">Join LCarDrive and start receiving bookings from motivated learners.</p>
          <Link href="/claim" className="inline-flex items-center gap-2 bg-primary-container text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-container/90 transition-all shadow-lg shadow-primary-container/20">
            <span className="material-symbols-outlined">login</span>
            Become an Instructor
          </Link>
        </div>
      </section>
    </div>
  );
}
