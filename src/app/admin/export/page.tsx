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
    <div className="max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Export Data</h1>
        <p className="text-sm text-gray-500 mt-0.5">Download table data as CSV or JSON.</p>
      </div>

      <div className="mt-4 bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">Table</label>
          <div className="grid grid-cols-2 gap-2">
            {TABLES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTable(t.value)}
                className={`p-3 rounded-xl text-left transition-all border ${
                  table === t.value
                    ? 'bg-primary/5 border-primary/40'
                    : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                  table === t.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                </div>
                <p className="text-xs font-bold text-gray-900">{t.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-2 block">Format</label>
          <div className="flex gap-2">
            {(['csv', 'json'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`flex-1 p-3 rounded-xl text-center transition-all border ${
                  format === f
                    ? 'bg-primary/5 border-primary/40'
                    : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${
                  format === f ? 'text-primary' : 'text-gray-400'
                }`} style={{ fontVariationSettings: "'FILL' 1" }}>{f === 'csv' ? 'table_rows' : 'data_object'}</span>
                <p className="text-xs font-bold text-gray-900 mt-1">.{f}</p>
                <p className="text-[10px] text-gray-500">{f === 'csv' ? 'Spreadsheet' : 'Structured data'}</p>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-100">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {error}
          </div>
        )}

        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
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
