'use client';

import { useState } from 'react';

const TABLES = [
  { value: 'instructors', label: 'Instructors', icon: 'local_taxi', desc: 'All instructor profiles and details' },
  { value: 'reviews', label: 'Reviews', icon: 'rate_review', desc: 'Student reviews and ratings' },
  { value: 'listing_flags', label: 'Listing Flags', icon: 'flag', desc: 'Reported listing issues' },
  { value: 'search_logs', label: 'Search Logs', icon: 'search_insights', desc: 'User search analytics' },
];

export default function AdminExport() {
  const [table, setTable] = useState('instructors');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    setExporting(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/export?table=${table}&format=${format}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Export failed');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${table}-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'json'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Export Data</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
          Download table data as CSV or JSON.
        </p>
      </div>

      <div className="mt-6 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 space-y-6">
        <div>
          <label className="font-label-md text-label-md font-bold text-on-surface mb-3 block">Table</label>
          <div className="grid grid-cols-2 gap-3">
            {TABLES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTable(t.value)}
                className={`p-4 rounded-xl text-left transition-all border-2 ${
                  table === t.value
                    ? 'bg-secondary-container/30 border-secondary'
                    : 'bg-surface-container-low border-transparent hover:border-outline-variant/60'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${
                  table === t.value ? 'bg-secondary text-on-secondary' : 'bg-surface-container-highest text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                </div>
                <p className="font-label-md text-label-md font-bold text-on-surface">{t.label}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-label-md text-label-md font-bold text-on-surface mb-3 block">Format</label>
          <div className="flex gap-3">
            {(['csv', 'json'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`flex-1 p-4 rounded-xl text-center transition-all border-2 ${
                  format === f
                    ? 'bg-secondary-container/30 border-secondary'
                    : 'bg-surface-container-low border-transparent hover:border-outline-variant/60'
                }`}
              >
                <span className={`material-symbols-outlined text-[24px] ${
                  format === f ? 'text-secondary' : 'text-on-surface-variant'
                }`} style={{ fontVariationSettings: "'FILL' 1" }}>{f === 'csv' ? 'table_rows' : 'data_object'}</span>
                <p className="font-label-md text-label-md font-bold text-on-surface mt-1">.{f}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{f === 'csv' ? 'Spreadsheet' : 'Structured data'}</p>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-error-container text-on-error-container rounded-xl text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {error}
          </div>
        )}

        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full bg-secondary text-on-secondary py-3 rounded-xl font-label-md text-label-md font-bold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {exporting ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              Exporting...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export as .{format}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
