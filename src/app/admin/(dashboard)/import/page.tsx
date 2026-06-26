'use client';

import { useState, useRef } from 'react';

export default function AdminImport() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ inserted: number; failed: number; results: { row: number; status: string; error?: string }[] } | null>(null);
  const [error, setError] = useState('');
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFile = (f: File | null) => {
    if (f && f.type !== 'text/csv' && !f.name.endsWith('.csv')) {
      setError('Please select a CSV file.');
      return;
    }
    setFile(f);
    setResult(null);
    setError('');
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setError('');
    setResult(null);

    try {
      const text = await file.text();
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Import failed');
      } else {
        setResult(data);
      }
    } catch {
      setError('Failed to read file');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-[22px] font-bold text-gray-900">CSV Import</h2>
        <p className="text-sm text-gray-500 mt-1">Bulk import instructor listings from a CSV file.</p>
      </div>

      <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            Required columns: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[#064E3B] font-bold text-[10px]">first_name</code>,{' '}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[#064E3B] font-bold text-[10px]">last_name</code>,{' '}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[#064E3B] font-bold text-[10px]">suburb</code>.
          </p>
          <a
            href="/sample-instructors.csv" download
            className="shrink-0 border border-[#E5E7EB] text-gray-500 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-gray-50 transition-all inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[12px]">file_download</span>
            Sample CSV
          </a>
        </div>

        <details className="group">
          <summary className="text-xs font-bold text-[#064E3B] cursor-pointer hover:opacity-80 transition-opacity select-none">
            <span className="material-symbols-outlined text-[14px] align-middle mr-1 group-open:rotate-90 transition-transform">chevron_right</span>
            All supported columns ({25})
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <code className="text-red-500 font-semibold">first_name</code>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <code className="text-red-500 font-semibold">last_name</code>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <code className="text-red-500 font-semibold">suburb</code>
            </div>
            <div className="flex items-center gap-1.5"><code>slug</code></div>
            <div className="flex items-center gap-1.5"><code>email</code></div>
            <div className="flex items-center gap-1.5"><code>phone</code></div>
            <div className="flex items-center gap-1.5"><code>bio</code></div>
            <div className="flex items-center gap-1.5"><code>profile_photo_url</code></div>
            <div className="flex items-center gap-1.5"><code>state</code></div>
            <div className="flex items-center gap-1.5"><code>postcode</code></div>
            <div className="flex items-center gap-1.5"><code>lat</code></div>
            <div className="flex items-center gap-1.5"><code>lng</code></div>
            <div className="flex items-center gap-1.5"><code>service_suburbs</code></div>
            <div className="flex items-center gap-1.5"><code>service_radius_km</code></div>
            <div className="flex items-center gap-1.5"><code>hourly_rate</code></div>
            <div className="flex items-center gap-1.5"><code>licence_types</code></div>
            <div className="flex items-center gap-1.5"><code>transmission</code></div>
            <div className="flex items-center gap-1.5"><code>lesson_duration_mins</code></div>
            <div className="flex items-center gap-1.5"><code>vehicle_make</code></div>
            <div className="flex items-center gap-1.5"><code>vehicle_model</code></div>
            <div className="flex items-center gap-1.5"><code>vehicle_year</code></div>
            <div className="flex items-center gap-1.5"><code>dual_controls</code></div>
            <div className="flex items-center gap-1.5"><code>languages</code></div>
            <div className="flex items-center gap-1.5"><code>gender</code></div>
            <div className="flex items-center gap-1.5"><code>adi_registration</code></div>
            <div className="flex items-center gap-1.5"><code>years_experience</code></div>
            <div className="flex items-center gap-1.5"><code>profile_completeness</code></div>
          </div>
        </details>

        <div
          ref={dropRef}
          onDragOver={(e) => { e.preventDefault(); dropRef.current?.classList.add('border-[#064E3B]', 'bg-[#064E3B]/[0.02]'); }}
          onDragLeave={() => dropRef.current?.classList.remove('border-[#064E3B]', 'bg-[#064E3B]/[0.02]')}
          onDrop={(e) => { e.preventDefault(); dropRef.current?.classList.remove('border-[#064E3B]', 'bg-[#064E3B]/[0.02]'); handleFile(e.dataTransfer.files[0]); }}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            file ? 'border-[#064E3B] bg-[#064E3B]/[0.03]' : 'border-[#E5E7EB] hover:border-[#064E3B]/50 hover:bg-gray-50'
          }`}
          onClick={() => document.getElementById('csv-input')?.click()}
        >
          <input
            id="csv-input"
            type="file"
            accept=".csv"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          {file ? (
            <div>
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-[#64748B] mx-auto mb-3">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
              </div>
              <p className="text-sm font-bold text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); setError(''); }}
                className="mt-2 text-[10px] text-red-500 hover:underline font-semibold"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-[#64748B] mx-auto mb-3">
                <span className="material-symbols-outlined text-[28px]">upload_file</span>
              </div>
              <p className="text-sm text-gray-500 mb-0.5">Drag &amp; drop your CSV here, or click to browse</p>
              <p className="text-xs text-gray-400">.csv files only</p>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-500 rounded-xl text-xs flex items-center gap-2 border border-red-200">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {error}
          </div>
        )}

        {result && (
          <div className="p-4 bg-gray-50 rounded-xl border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-1">
              {result.failed === 0 ? (
                <span className="material-symbols-outlined text-[#064E3B] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              ) : (
                <span className="material-symbols-outlined text-amber-500 text-[16px]">warning</span>
              )}
              <p className="text-sm font-bold text-gray-900">
                {result.inserted} inserted{result.failed > 0 ? `, ${result.failed} failed` : ''}
              </p>
            </div>
            {result.results.filter((r) => r.status === 'error').length > 0 && (
              <div className="mt-2 space-y-0.5 max-h-24 overflow-y-auto custom-scrollbar">
                {result.results.filter((r) => r.status === 'error').map((r) => (
                  <p key={r.row} className="text-[11px] text-red-500">Row {r.row}: {r.error}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!file || importing}
          className="w-full bg-[#064E3B] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#053A2C] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {importing ? (
            <>
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              Importing...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              Import
            </>
          )}
        </button>
      </div>
    </div>
  );
}
