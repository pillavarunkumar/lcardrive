'use client';

import { useState } from 'react';

const TABLES = [
  { value: 'instructors', label: 'Instructors', icon: 'group', desc: 'All instructor profiles' },
  { value: 'reviews', label: 'Reviews', icon: 'rate_review', desc: 'Student reviews & ratings' },
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">Export Data</h2>
        <p className="text-on-surface-variant text-sm mt-1">Download table data as CSV or JSON.</p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 space-y-6">
        <div>
          <label className="text-xs font-bold text-on-surface mb-3 block">Table</label>
          <div className="grid grid-cols-2 gap-3">
            {TABLES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTable(t.value)}
                className={`p-4 rounded-xl text-left transition-all border ${
                  table === t.value
                    ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20'
                    : 'bg-surface border-outline-variant hover:border-primary/30'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${
                  table === t.value ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                </div>
                <p className="text-sm font-bold text-on-surface">{t.label}</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-on-surface mb-3 block">Format</label>
          <div className="flex gap-3">
            {(['csv', 'json'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`flex-1 p-4 rounded-xl text-center transition-all border ${
                  format === f
                    ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20'
                    : 'bg-surface border-outline-variant hover:border-primary/30'
                }`}
              >
                <span className={`material-symbols-outlined text-[24px] ${
                  format === f ? 'text-primary' : 'text-outline'
                }`} style={{ fontVariationSettings: "'FILL' 1" }}>{f === 'csv' ? 'table_rows' : 'data_object'}</span>
                <p className="text-sm font-bold text-on-surface mt-1">.{f}</p>
                <p className="text-[11px] text-on-surface-variant">{f === 'csv' ? 'Spreadsheet' : 'Structured data'}</p>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-error-container/20 text-error rounded-xl text-xs flex items-center gap-2 border border-error/20">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {error}
          </div>
        )}

        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full bg-primary text-on-primary py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {exporting ? (
            <>
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              Exporting...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              Export as .{format}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
