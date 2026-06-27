import Link from 'next/link';

const guides = [
  { title: '1. Create Your Account', desc: 'Sign up with your email or Google account. It takes less than a minute and you\'ll be able to message instructors and book lessons.' },
  { title: '2. Search & Filter', desc: 'Use our search tool to find instructors in your area. Filter by transmission type, specialisations, ratings, and availability to narrow your options.' },
  { title: '3. Review Profiles', desc: 'Each instructor profile includes their experience, vehicle details, hourly rate, lesson packages, service areas, and genuine student reviews.' },
  { title: '4. Send an Enquiry', desc: 'Found an instructor you like? Send them a message through our platform. Tell them about your experience level and what you\'re looking to achieve.' },
  { title: '5. Book Your Lesson', desc: 'Once the instructor responds, agree on a time and date. Pay securely through our platform or directly — whichever you and your instructor prefer.' },
  { title: '6. Get Driving', desc: 'Show up at the agreed location and start learning. Track your progress and book subsequent lessons through your dashboard.' },
];

export default function BookingGuidePage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary via-primary to-primary-container/90 text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Booking Guide</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Everything you need to know about booking driving lessons on LCarDrive.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20 md:py-28">
        <div className="space-y-8">
          {guides.map((g, i) => (
            <div key={i} className="bg-white rounded-2xl border border-outline-variant/40 shadow-sm p-8 flex gap-6">
              <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container font-bold shrink-0 text-sm">
                {i + 1}
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface mb-2">{g.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface-container-low py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-4">Have questions?</h2>
          <p className="text-on-surface-variant mb-8">Our support team is here to help you every step of the way.</p>
          <a href="mailto:support@lcardrive.com.au" className="inline-flex items-center gap-2 bg-primary-container text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-container/90 transition-all shadow-lg shadow-primary-container/20">
            <span className="material-symbols-outlined">mail</span>
            Contact Support
          </a>
        </div>
      </section>
    </div>
  );
}
