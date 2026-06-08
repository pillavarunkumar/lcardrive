'use client';

import { useState } from 'react';
import Link from 'next/link';
import InstructorCard from '@/components/InstructorCard';

const FEATURED = [
  {
    id: '1', slug: 'sarah-jenkins', first_name: 'Sarah', last_name: 'Jenkins',
    suburb: 'Footscray', state: 'VIC', postcode: '3011',
    bio: '12 years experience helping nervous students pass their first time in Footscray and Yarraville area.',
    hourly_rate: 75, transmission: 'both', licence_types: ['car'],
    specialises_anxiety: true, accepts_international: false,
    familiar_test_centres: [], languages: ['English'], is_verified: true, is_claimed: true,
    profile_completeness: 100, service_suburbs: [], service_radius_km: 10,
    dual_controls: true, availability_days: [],
    average_rating: 4.9, review_count: 128,
    avg_rating_patience: 4.9, avg_rating_communication: 4.8, avg_rating_value: 4.7, avg_rating_punctuality: 4.9,
    package_options: [], created_at: '', updated_at: '',
    profile_photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAg94NwVX4QBE3yzobbLQTtnKxSWROnVNEhNcJZX5WqAaI1q_kfOGcuB8HLGfCh15EfLo-jKRbs2NoG26yv2n5gjRXCALvUrBdI64AxSiHqSOM2tkQnmM6mdpaPLsEURVnplU8TW3FsUwOJfCIqCKnd6yk5YOZF4SL_OUC_ByKOdpwF-kxcNBdxFjtj9m9lPFmSK6hFgmSgTeyJHSdKEIRdfk0y1WqUka4MftXQ-zKaOeS9G39OjO5bPl0gyfAQN42xAoGWowhQ',
  },
  {
    id: '2', slug: 'david-chen', first_name: 'David', last_name: 'Chen',
    suburb: 'Sunshine', state: 'VIC', postcode: '3020',
    bio: 'Specialist in converting international licences and advanced defensive driving techniques.',
    hourly_rate: 80, transmission: 'both', licence_types: ['car'],
    specialises_anxiety: false, accepts_international: true,
    familiar_test_centres: [], languages: ['English', 'Mandarin'], is_verified: true, is_claimed: true,
    profile_completeness: 100, service_suburbs: [], service_radius_km: 15,
    dual_controls: true, availability_days: [],
    average_rating: 5.0, review_count: 84,
    avg_rating_patience: 4.9, avg_rating_communication: 4.8, avg_rating_value: 4.7, avg_rating_punctuality: 4.9,
    package_options: [], created_at: '', updated_at: '',
    profile_photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHIl8KavrhxPGd7dvqSbdA-gQt7odXAaAUMsHKpq2ePJi2SJ5tEmYFFPSaLzIhan9_7oMQXE47DjyeMiYgzMKBJsjuLwBalb5wZPjglCDY3Imf1N3FVMEfIdi5CoRxxYSKpoDD2Hi4uD_-s9dFefzipUaalEswK-Kq9IGDppuHrHFG6leC1vlJj3YgskyJy73koYrO2p7RYn_o9-4_Nl9AzHlV_j80nJV49-BijOWRZNKly5Shw_KAuzoPitE8JRSIBYcFyumK',
  },
  {
    id: '3', slug: 'amara-okafor', first_name: 'Amara', last_name: 'Okafor',
    suburb: 'Werribee', state: 'VIC', postcode: '3030',
    bio: 'Patient and flexible. Amara offers weekend and evening slots to accommodate busy students.',
    hourly_rate: 72, transmission: 'auto', licence_types: ['car'],
    specialises_anxiety: true, accepts_international: false,
    familiar_test_centres: [], languages: ['English'], is_verified: true, is_claimed: true,
    profile_completeness: 100, service_suburbs: [], service_radius_km: 10,
    dual_controls: true, availability_days: [],
    average_rating: 4.8, review_count: 96,
    avg_rating_patience: 4.9, avg_rating_communication: 4.8, avg_rating_value: 4.7, avg_rating_punctuality: 4.9,
    package_options: [], created_at: '', updated_at: '',
    profile_photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAn3Fx4QfrEvZaKsQhbMBtxyMnJDDia-f81eiT6XUqTi02FZt-v0YHYeTlE6NS7E0UuKkokxZfE4j21G4y9Ba92WeNRLGyjuklZJMPXfPo3tg5SsIire-f1bUIlJCnYWqew-JIxKtfWzzef3Twk0suc0UZZRITkQOfhbtYLJkXdr2dw72IF-dPN6fCXB4kzx21QHS33pjQ6Nti1g6zoZce2yoLqRq8IMFpSr35GO75mmis2nrFdtdC8KbcpJIWMuvikdLbno1pt',
  },
];

export default function HomePage() {
  const [suburb, setSuburb] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [radius, setRadius] = useState('10km');
  const [quickFilters, setQuickFilters] = useState<Record<string, string>>({});

  const toggleFilter = (key: string, value: string) => {
    setQuickFilters((prev) => {
      if (prev[key] === value) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  };

  const suggestions = ['Footscray, VIC 3011', 'West Footscray, VIC 3012', 'Yarraville, VIC 3013'];

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div
          className="flex min-h-[520px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center p-6 text-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%), url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&q=80')`,
          }}
        >
          <div className="flex flex-col gap-4 max-w-[800px]">
            <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] md:text-6xl font-display">
              Find your perfect driving instructor.
            </h1>
            <p className="text-white text-lg font-body opacity-90">
              Book professional lessons and pass your test with confidence.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-[720px] bg-white p-2 rounded-xl shadow-2xl mt-4">
            <div className="flex flex-col md:flex-row items-stretch gap-2">
              <div className="flex flex-1 items-center px-4 py-2 border border-outline-variant rounded-lg bg-white relative">
                <span className="material-symbols-outlined text-outline text-base">search</span>
                <input
                  type="text"
                  placeholder="Enter suburb or postcode (e.g. Footscray)"
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="flex-1 border-none focus:ring-0 text-on-surface font-body text-sm bg-transparent outline-none"
                />
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-outline-variant rounded-b-lg shadow-lg z-50 text-left" id="autocomplete">
                    {suggestions.map((s) => (
                      <div
                        key={s}
                        onClick={() => { setSuburb(s); setShowSuggestions(false); }}
                        className="p-3 hover:bg-surface-container cursor-pointer font-body text-sm border-b border-outline-variant last:border-b-0"
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-surface-container p-1 rounded-lg flex">
                  {['5km', '10km', '20km'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRadius(r)}
                      className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${
                        radius === r ? 'bg-white shadow-sm' : 'text-on-surface-variant'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <Link
                  href={`/search?suburb=${encodeURIComponent(suburb)}${Object.entries(quickFilters).map(([k, v]) => `&${k}=${encodeURIComponent(v)}`).join('')}`}
                  className="bg-secondary text-white px-8 py-3 rounded-lg font-bold hover:brightness-110 transition-all flex items-center gap-2"
                >
                  Search
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {[
              { icon: 'directions_car', label: 'Auto', key: 'transmission', value: 'auto' },
              { icon: 'settings', label: 'Manual', key: 'transmission', value: 'manual' },
              { icon: 'sentiment_satisfied', label: 'Anxiety-friendly', key: 'anxiety_friendly', value: 'true' },
              { icon: 'public', label: 'Intl. Licence', key: 'international_conversion', value: 'true' },
            ].map((f) => {
              const active = quickFilters[f.key] === f.value;
              return (
                <button
                  key={f.label}
                  onClick={() => toggleFilter(f.key, f.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    active
                      ? 'bg-white text-secondary border border-white'
                      : 'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{f.icon}</span>
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Match Banner */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
        <div className="ai-gradient rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-secondary/20 relative overflow-hidden">
          <div className="relative z-10 max-w-[560px]">
            <div className="inline-flex items-center gap-2 bg-secondary text-white px-3 py-1 rounded-full text-xs font-bold mb-4">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              SMART MATCHING
            </div>
            <h2 className="text-on-surface text-3xl md:text-4xl font-display font-bold mb-4">Not sure who to pick?</h2>
            <p className="text-on-surface-variant text-lg font-body mb-6">
              Answer 5 simple questions about your goals and experience — our AI will recommend your best instructor match instantly.
            </p>
            <Link
              href="/find-my-instructor"
              className="bg-primary text-white px-8 py-4 rounded-lg font-bold hover:scale-[1.02] transition-transform inline-flex items-center gap-2"
            >
              Find My Match <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
          <div className="relative z-10 w-full md:w-1/3 flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">smart_toy</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-secondary">98% Match</div>
                  <div className="text-sm font-bold text-on-surface">Suggested for Sarah</div>
                </div>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[98%] rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        </div>
      </section>

      {/* Featured Instructors */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg bg-white rounded-t-3xl shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-on-surface">Top rated instructors in Melbourne West</h2>
            <p className="text-on-surface-variant font-body">Vetted professionals with 4.8+ average ratings</p>
          </div>
          <Link href="/search" className="text-secondary font-bold flex items-center gap-1 hover:underline">
            View all <span className="material-symbols-outlined text-sm">chevron_right</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURED.map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor as any} />
          ))}
        </div>
      </section>


    </>
  );
}
