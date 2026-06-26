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
        <h2 className="text-[22px] font-bold text-gray-900">Export Data</h2>
        <p className="text-sm text-gray-500 mt-1">Download table data as CSV or JSON.</p>
      </div>

      <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm p-6 space-y-6">
        <div>
          <label className="text-xs font-bold text-gray-900 mb-3 block">Table</label>
          <div className="grid grid-cols-2 gap-3">
            {TABLES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTable(t.value)}
                className={`p-4 rounded-xl text-left transition-all border ${
                  table === t.value
                    ? 'bg-[#064E3B]/5 border-[#064E3B]/40 ring-1 ring-[#064E3B]/20'
                    : 'bg-white border-[#E5E7EB] hover:border-[#064E3B]/30'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${
                  table === t.value ? 'bg-[#064E3B] text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                </div>
                <p className="text-sm font-bold text-gray-900">{t.label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-900 mb-3 block">Format</label>
          <div className="flex gap-3">
            {(['csv', 'json'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`flex-1 p-4 rounded-xl text-center transition-all border ${
                  format === f
                    ? 'bg-[#064E3B]/5 border-[#064E3B]/40 ring-1 ring-[#064E3B]/20'
                    : 'bg-white border-[#E5E7EB] hover:border-[#064E3B]/30'
                }`}
              >
                <span className={`material-symbols-outlined text-[24px] ${
                  format === f ? 'text-[#064E3B]' : 'text-gray-400'
                }`} style={{ fontVariationSettings: "'FILL' 1" }}>{f === 'csv' ? 'table_rows' : 'data_object'}</span>
                <p className="text-sm font-bold text-gray-900 mt-1">.{f}</p>
                <p className="text-[11px] text-gray-500">{f === 'csv' ? 'Spreadsheet' : 'Structured data'}</p>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-500 rounded-xl text-xs flex items-center gap-2 border border-red-200">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {error}
          </div>
        )}

        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full bg-[#064E3B] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#053A2C] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
