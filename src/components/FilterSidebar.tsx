'use client';

import type { SearchFilters } from '@/types';

interface Props {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
}

const languages = ['English', 'Mandarin', 'Hindi', 'Arabic'];

export default function FilterSidebar({ filters, onFilterChange }: Props) {
  const update = (partial: Partial<SearchFilters>) => {
    onFilterChange({ ...filters, ...partial });
  };

  return (
    <aside className="flex flex-col gap-6 sidebar-scroll max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
      {/* Transmission */}
      <div className="border-b border-outline-variant pb-6">
        <h3 className="font-headline-sm text-headline-sm mb-4 text-on-surface">Transmission</h3>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="transmission"
              checked={(filters.transmission || '') === ''}
              onChange={() => update({ transmission: undefined as any })}
              className="w-5 h-5 text-secondary border-outline-variant focus:ring-secondary focus:ring-offset-surface"
            />
            <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">Any</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="transmission"
              checked={filters.transmission === 'auto'}
              onChange={() => update({ transmission: 'auto' })}
              className="w-5 h-5 text-secondary border-outline-variant focus:ring-secondary focus:ring-offset-surface"
            />
            <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">Automatic</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="transmission"
              checked={filters.transmission === 'manual'}
              onChange={() => update({ transmission: 'manual' })}
              className="w-5 h-5 text-secondary border-outline-variant focus:ring-secondary focus:ring-offset-surface"
            />
            <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">Manual</span>
          </label>
        </div>
      </div>

      {/* Hourly Rate */}
      <div className="border-b border-outline-variant pb-6">
        <h3 className="font-headline-sm text-headline-sm mb-4 text-on-surface">Hourly Rate</h3>
        <div className="flex flex-col gap-4">
          <input
            type="range"
            min={0}
            max={150}
            value={filters.max_price || 150}
            onChange={(e) => update({ max_price: Number(e.target.value) })}
            className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-secondary"
          />
          <div className="flex justify-between items-center font-label-sm text-label-sm text-on-surface-variant">
            <span>$0</span>
            <span className="font-bold text-secondary bg-surface-container px-2 py-1 rounded">Up to ${filters.max_price || 150}</span>
            <span>$150+</span>
          </div>
        </div>
      </div>

      {/* Special Needs & Comfort */}
      <div className="border-b border-outline-variant pb-6">
        <h3 className="font-headline-sm text-headline-sm mb-4 text-on-surface">Special Needs &amp; Comfort</h3>
        <div className="flex flex-col gap-4">
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">Anxiety-friendly</span>
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.anxiety_friendly || false}
                onChange={(e) => update({ anxiety_friendly: e.target.checked || undefined })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
            </div>
          </label>
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">Intl. Licence Conversion</span>
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.international_conversion || false}
                onChange={(e) => update({ international_conversion: e.target.checked || undefined })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
            </div>
          </label>
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">Test Centre Familiarity</span>
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.test_centre_familiarity || false}
                onChange={(e) => update({ test_centre_familiarity: e.target.checked || undefined })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
            </div>
          </label>
        </div>
      </div>

      {/* Languages */}
      <div className="pb-6">
        <h3 className="font-headline-sm text-headline-sm mb-4 text-on-surface">Languages Spoken</h3>
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => {
            const active = filters.languages?.includes(lang);
            return (
              <button
                key={lang}
                onClick={() => {
                  const current = filters.languages || [];
                  const next = active ? current.filter((l) => l !== lang) : [...current, lang];
                  update({ languages: next.length ? next : undefined });
                }}
                className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm cursor-pointer transition-colors ${
                  active
                    ? 'border border-secondary bg-surface-container text-secondary'
                    : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
