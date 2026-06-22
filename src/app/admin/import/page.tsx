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
      <div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Import CSV</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
          Bulk import instructor listings from a CSV file.
        </p>
      </div>

      <div className="mt-6 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <p className="font-label-sm text-label-sm text-on-surface-variant leading-relaxed">
            Required columns: <code className="bg-surface-container px-1.5 py-0.5 rounded text-secondary font-bold text-xs">first_name</code>,{' '}
            <code className="bg-surface-container px-1.5 py-0.5 rounded text-secondary font-bold text-xs">last_name</code>,{' '}
            <code className="bg-surface-container px-1.5 py-0.5 rounded text-secondary font-bold text-xs">suburb</code>.
            {' '}See the sample file for all supported columns.
          </p>
          <a
            href="/sample-instructors.csv" download
            className="shrink-0 border border-outline-variant text-on-surface px-4 py-2 rounded-lg text-xs font-bold hover:bg-surface-container transition-all inline-flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Sample CSV
          </a>
        </div>

        <div
          ref={dropRef}
          onDragOver={(e) => { e.preventDefault(); dropRef.current?.classList.add('border-secondary', 'bg-secondary/[0.02]'); }}
          onDragLeave={() => dropRef.current?.classList.remove('border-secondary', 'bg-secondary/[0.02]')}
          onDrop={(e) => { e.preventDefault(); dropRef.current?.classList.remove('border-secondary', 'bg-secondary/[0.02]'); handleFile(e.dataTransfer.files[0]); }}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            file ? 'border-secondary bg-secondary/[0.03]' : 'border-outline-variant/60 hover:border-secondary/50 hover:bg-surface-container-low'
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
              <span className="material-symbols-outlined text-[36px] text-secondary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
              <p className="font-label-md text-label-md font-bold text-on-surface">{file.name}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); setError(''); }}
                className="mt-2 text-xs text-error hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <span className="material-symbols-outlined text-[36px] text-outline mb-2">cloud_upload</span>
              <p className="font-label-md text-label-md text-on-surface-variant mb-1">Drag & drop your CSV here, or click to browse</p>
              <p className="font-label-sm text-label-sm text-outline">.csv files only</p>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-error-container text-on-error-container rounded-xl text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {error}
          </div>
        )}

        {result && (
          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/40">
            <div className="flex items-center gap-2 mb-2">
              {result.failed === 0 ? (
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              ) : (
                <span className="material-symbols-outlined text-warning">warning</span>
              )}
              <p className="font-label-md text-label-md font-bold text-on-surface">
                {result.inserted} inserted{result.failed > 0 ? `, ${result.failed} failed` : ''}
              </p>
            </div>
            {result.results.filter((r) => r.status === 'error').length > 0 && (
              <div className="mt-2 space-y-0.5 max-h-32 overflow-y-auto">
                {result.results.filter((r) => r.status === 'error').map((r) => (
                  <p key={r.row} className="font-label-sm text-label-sm text-error">Row {r.row}: {r.error}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!file || importing}
          className="w-full bg-secondary text-on-secondary py-3 rounded-xl font-label-md text-label-md font-bold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {importing ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              Importing...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
              Import {file ? file.name : 'Listings'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
