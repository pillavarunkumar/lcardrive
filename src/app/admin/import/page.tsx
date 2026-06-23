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
    <div className="max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Import CSV</h1>
        <p className="text-sm text-gray-500 mt-0.5">Bulk import instructor listings from a CSV file.</p>
      </div>

      <div className="mt-4 bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            Required columns: <code className="bg-gray-100 px-1 py-0.5 rounded text-primary font-bold text-[10px]">first_name</code>,{' '}
            <code className="bg-gray-100 px-1 py-0.5 rounded text-primary font-bold text-[10px]">last_name</code>,{' '}
            <code className="bg-gray-100 px-1 py-0.5 rounded text-primary font-bold text-[10px]">suburb</code>.
            See the sample file for all supported columns.
          </p>
          <a
            href="/sample-instructors.csv" download
            className="shrink-0 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-gray-50 transition-all inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[12px]">file_download</span>
            Sample CSV
          </a>
        </div>

        <div
          ref={dropRef}
          onDragOver={(e) => { e.preventDefault(); dropRef.current?.classList.add('border-primary', 'bg-primary/[0.02]'); }}
          onDragLeave={() => dropRef.current?.classList.remove('border-primary', 'bg-primary/[0.02]')}
          onDrop={(e) => { e.preventDefault(); dropRef.current?.classList.remove('border-primary', 'bg-primary/[0.02]'); handleFile(e.dataTransfer.files[0]); }}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            file ? 'border-primary bg-primary/[0.03]' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
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
              <span className="material-symbols-outlined text-[32px] text-primary mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
              <p className="text-sm font-semibold text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); setError(''); }}
                className="mt-1 text-[10px] text-red-600 hover:underline font-medium"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <span className="material-symbols-outlined text-[32px] text-gray-300 mb-1">upload_file</span>
              <p className="text-sm text-gray-600 mb-0.5">Drag & drop your CSV here, or click to browse</p>
              <p className="text-xs text-gray-400">.csv files only</p>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-100">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {error}
          </div>
        )}

        {result && (
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              {result.failed === 0 ? (
                <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              ) : (
                <span className="material-symbols-outlined text-amber-500 text-[16px]">warning</span>
              )}
              <p className="text-sm font-semibold text-gray-900">
                {result.inserted} inserted{result.failed > 0 ? `, ${result.failed} failed` : ''}
              </p>
            </div>
            {result.results.filter((r) => r.status === 'error').length > 0 && (
              <div className="mt-1 space-y-0.5 max-h-24 overflow-y-auto">
                {result.results.filter((r) => r.status === 'error').map((r) => (
                  <p key={r.row} className="text-[11px] text-red-600">Row {r.row}: {r.error}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!file || importing}
          className="w-full bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          {importing ? (
            <>
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              Importing...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              Import {file ? file.name : 'Listings'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
