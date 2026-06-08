'use client';

export default function PortalDashboard() {
  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Welcome back, Marcus</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Here is how your instructor profile is performing today.</p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-lowest py-2 px-4 rounded-full border border-outline-variant shadow-sm">
          <span className="font-label-md text-label-md text-on-surface-variant">Status:</span>
          <div className="flex items-center justify-center">
            <span className="font-label-md text-label-md font-bold text-secondary mr-2">Online</span>
            <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
              <input defaultChecked type="checkbox" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-surface-variant transition-colors duration-200 checked:right-0 checked:border-secondary z-10" />
              <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-surface-variant cursor-pointer transition-colors duration-200"></label>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-md">
        {/* Profile Completeness */}
        <div className="bento-card bg-surface-container-lowest rounded-xl p-6 lg:col-span-2 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary-container rounded-full opacity-20 blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Profile Completeness</h3>
                <p className="font-body-sm text-on-surface-variant mt-1">A complete profile attracts 3x more students.</p>
              </div>
              <span className="font-headline-md text-headline-md font-bold text-secondary">65%</span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-3 mb-2 overflow-hidden">
              <div className="bg-secondary h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bento-card bg-surface-container-lowest rounded-xl p-6 flex flex-col justify-center items-center text-center">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1", fontSize: '28px' }}>star</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface">4.9</h3>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">Average Rating</p>
          <div className="mt-3 inline-block bg-inverse-on-surface text-on-secondary-fixed-variant px-2 py-1 rounded font-label-sm text-label-sm">
            Based on 42 reviews
          </div>
        </div>

        {/* Profile Views */}
        <div className="bento-card bg-surface-container-lowest rounded-xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-inverse-on-surface text-secondary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined">visibility</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Profile Views</p>
            <div className="flex items-end gap-2">
              <h3 className="font-headline-md text-headline-md text-on-surface">1,248</h3>
              <span className="font-label-sm text-label-sm text-secondary flex items-center">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_upward</span> 12%
              </span>
            </div>
            <p className="font-label-sm text-label-sm text-outline mt-1">Last 30 days</p>
          </div>
        </div>

        {/* Search Impressions */}
        <div className="bento-card bg-surface-container-lowest rounded-xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined">travel_explore</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Search Impressions</p>
            <div className="flex items-end gap-2">
              <h3 className="font-headline-md text-headline-md text-on-surface">5,892</h3>
              <span className="font-label-sm text-label-sm text-secondary flex items-center">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_upward</span> 8%
              </span>
            </div>
            <p className="font-label-sm text-label-sm text-outline mt-1">Last 30 days</p>
          </div>
        </div>

        {/* New Leads */}
        <div className="bento-card bg-surface-container-lowest rounded-xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-inverse-on-surface text-secondary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined">event_available</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">New Leads</p>
            <div className="flex items-end gap-2">
              <h3 className="font-headline-md text-headline-md text-on-surface">24</h3>
              <span className="font-label-sm text-label-sm text-outline flex items-center">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>horizontal_rule</span> 0%
              </span>
            </div>
            <p className="font-label-sm text-label-sm text-outline mt-1">Awaiting response</p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bento-card bg-surface-container-lowest rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-secondary">checklist</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Next Steps to Boost Visibility</h3>
          </div>
          <ul className="space-y-3">
            {[
              { icon: 'directions_car', label: 'Add your vehicle details', boost: '+15%' },
              { icon: 'add_a_photo', label: 'Upload a gallery photo', boost: '+20%' },
            ].map((step) => (
              <li key={step.label} className="flex items-center justify-between p-3 rounded-lg border border-outline-variant bg-surface-bright hover:bg-surface-container-low transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{step.icon}</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface group-hover:text-secondary transition-colors">{step.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-label-sm text-label-sm font-bold text-on-tertiary-container bg-tertiary-fixed px-2 py-1 rounded">{step.boost}</span>
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-secondary transition-colors">chevron_right</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </>
  );
}
