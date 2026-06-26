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
    <aside className="flex flex-col gap-5">
      {/* Transmission */}
      <div className="border-b border-gray-100 pb-4">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Transmission</h3>
        <div className="flex flex-col gap-2">
          {[
            { label: 'Any', value: '' },
            { label: 'Automatic', value: 'auto' },
            { label: 'Manual', value: 'manual' },
          ].map((opt) => (
            <label key={opt.label} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="transmission"
                checked={opt.value === '' ? !filters.transmission : filters.transmission === opt.value}
                onChange={() => update({ transmission: opt.value ? (opt.value as 'auto' | 'manual') : undefined })}
                className="w-4 h-4 text-[#064E3B] border-gray-300 focus:ring-[#064E3B]"
              />
              <span className="text-sm text-gray-500 group-hover:text-gray-900 transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Hourly Rate */}
      <div className="border-b border-gray-100 pb-4">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Hourly Rate</h3>
        <div className="flex flex-col gap-3">
          <input
            type="range"
            min={0}
            max={150}
            value={filters.max_price || 150}
            onChange={(e) => update({ max_price: Number(e.target.value) })}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#064E3B]"
          />
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>$0</span>
            <span className="font-semibold text-[#064E3B] bg-[#064E3B]/10 px-2 py-0.5 rounded text-[11px]">Up to ${filters.max_price || 150}</span>
            <span>$150+</span>
          </div>
        </div>
      </div>

      {/* Special Needs & Comfort */}
      <div className="border-b border-gray-100 pb-4">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Special Needs</h3>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Anxiety-friendly', key: 'anxiety_friendly' as const },
            { label: 'Intl. Licence Conversion', key: 'international_conversion' as const },
            { label: 'Test Centre Familiarity', key: 'test_centre_familiarity' as const },
          ].map(({ label, key }) => (
            <label key={key} className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-gray-500 group-hover:text-gray-900 transition-colors">{label}</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={(filters[key] as boolean) || false}
                  onChange={(e) => update({ [key]: e.target.checked || undefined })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#064E3B] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#064E3B]"></div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="pb-2">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Languages Spoken</h3>
        <div className="flex flex-wrap gap-1.5">
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
                className={`px-3 py-1 rounded-full text-xs cursor-pointer transition-colors font-medium ${
                  active
                    ? 'bg-[#064E3B] text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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
