import Link from 'next/link';

const values = [
  { icon: 'verified', title: 'Safety First', desc: 'Every instructor on LCarDrive is verified and vetted. We prioritise student safety above all else.' },
  { icon: 'diversity_3', title: 'Community Driven', desc: 'We\'re building a community of passionate instructors and confident learners across Australia.' },
  { icon: 'trending_up', title: 'Continuous Improvement', desc: 'We constantly refine our platform based on feedback from instructors and learners alike.' },
  { icon: 'visibility', title: 'Transparency', desc: 'Clear pricing, honest reviews, and complete instructor profiles — no hidden information.' },
];

export default function AboutPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary via-primary to-primary-container/90 text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About LCarDrive</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Australia&#39;s premium driving instructor marketplace, connecting learners with verified professionals.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20 md:py-28">
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-on-surface mb-4">Our Mission</h2>
          <p className="text-on-surface-variant leading-relaxed mb-8">
            LCarDrive was founded with a simple mission: make it easier for learner drivers to find 
            qualified, reputable driving instructors in their local area. We believe that access to 
            quality driver education should be straightforward, transparent, and stress-free.
          </p>

          <h2 className="text-2xl font-bold text-on-surface mb-4">Our Story</h2>
          <p className="text-on-surface-variant leading-relaxed mb-8">
            Founded in 2024, LCarDrive has grown from a simple idea into Australia&#39;s trusted platform 
            for connecting learner drivers with verified driving instructors. Our team is passionate 
            about road safety and believes that better driver education leads to safer roads for everyone.
          </p>

          <h2 className="text-2xl font-bold text-on-surface mb-4">What Sets Us Apart</h2>
          <p className="text-on-surface-variant leading-relaxed mb-8">
            Unlike traditional methods of finding an instructor — word of mouth, local ads, or 
            random internet searches — LCarDrive provides a centralised, searchable platform with 
            verified profiles, genuine reviews, transparent pricing, and direct booking. We give 
            learners the information they need to make an informed choice.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mt-12">
          {values.map((v, i) => (
            <div key={i} className="bg-white rounded-2xl border border-outline-variant/40 shadow-sm p-6">
              <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container mb-4">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{v.icon}</span>
              </div>
              <h3 className="font-bold text-on-surface mb-2">{v.title}</h3>
              <p className="text-sm text-on-surface-variant">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary-container text-white py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Join us in making roads safer</h2>
          <p className="text-white/80 mb-8">Whether you&#39;re learning to drive or teaching others, LCarDrive is here for you.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search" className="inline-flex items-center justify-center gap-2 bg-white text-primary-container px-8 py-4 rounded-xl font-bold hover:bg-white/90 transition-all">
              Find an Instructor
            </Link>
            <Link href="/claim" className="inline-flex items-center justify-center gap-2 bg-white/10 text-white border-2 border-white/30 px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all">
              Become an Instructor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
