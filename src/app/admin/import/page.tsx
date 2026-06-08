'use client';

import { useState } from 'react';

export default function AdminImport() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ inserted: number; failed: number; results: { row: number; status: string; error?: string }[] } | null>(null);
  const [error, setError] = useState('');

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setError('');
    setResult(null);

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
    setImporting(false);
  };

  return (
    <div className="max-w-xl">
      <p className="text-sm text-on-surface-variant mb-6">
        Upload a CSV file to bulk import instructor listings. Required columns: <code className="text-secondary font-bold">first_name</code>, <code className="text-secondary font-bold">last_name</code>, <code className="text-secondary font-bold">suburb</code>.
        Optional columns: <code className="text-secondary font-bold">email</code>, <code className="text-secondary font-bold">phone</code>, <code className="text-secondary font-bold">bio</code>, <code className="text-secondary font-bold">state</code>, <code className="text-secondary font-bold">postcode</code>, <code className="text-secondary font-bold">lat</code>, <code className="text-secondary font-bold">lng</code>, <code className="text-secondary font-bold">hourly_rate</code>, <code className="text-secondary font-bold">transmission</code>, <code className="text-secondary font-bold">licence_types</code>, <code className="text-secondary font-bold">vehicle_make</code>, <code className="text-secondary font-bold">vehicle_model</code>, <code className="text-secondary font-bold">vehicle_year</code>, <code className="text-secondary font-bold">adi_registration</code>, <code className="text-secondary font-bold">years_experience</code>, <code className="text-secondary font-bold">languages</code> (semicolon-separated), <code className="text-secondary font-bold">service_suburbs</code> (semicolon-separated), <code className="text-secondary font-bold">gender</code>, <code className="text-secondary font-bold">slug</code>.
      </p>

      <div className="border-2 border-dashed border-outline-variant rounded-2xl p-8 text-center mb-6 hover:border-secondary hover:bg-surface-container-low transition-all cursor-pointer">
        {file ? (
          <div>
            <p className="text-sm font-bold text-on-surface">{file.name}</p>
            <p className="text-xs text-outline mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            <button onClick={() => { setFile(null); setResult(null); setError(''); }} className="text-xs text-error hover:text-error mt-2">Remove</button>
          </div>
        ) : (
          <div>
            <span className="material-symbols-outlined text-3xl text-outline mb-3">cloud_upload</span>
            <p className="text-sm text-on-surface-variant mb-2">Drag and drop your CSV here, or click to browse</p>
            <label className="border border-outline-variant text-on-surface px-4 py-2 rounded-lg text-xs font-bold hover:bg-surface-container transition-all cursor-pointer inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">folder_open</span>
              Browse Files
              <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
            </label>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-xl text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </div>
      )}

      {result && (
        <div className="mb-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
          <div className="flex items-center gap-2 mb-2">
            {result.failed === 0 ? (
              <span className="material-symbols-outlined text-secondary">check_circle</span>
            ) : (
              <span className="material-symbols-outlined text-warning">warning</span>
            )}
            <p className="text-sm font-bold text-on-surface">
              {result.inserted} inserted{result.failed > 0 ? `, ${result.failed} failed` : ''}
            </p>
          </div>
          {result.results.filter((r) => r.status === 'error').length > 0 && (
            <div className="mt-2 text-xs text-on-surface-variant space-y-1">
              {result.results.filter((r) => r.status === 'error').map((r) => (
                <p key={r.row}>Row {r.row}: {r.error}</p>
              ))}
            </div>
          )}
        </div>
      )}

      <button onClick={handleImport} disabled={!file || importing}
        className="w-full bg-secondary text-white py-3 rounded-lg text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50">
        {importing ? 'Importing...' : `Import ${file ? file.name : 'Listings'}`}
      </button>
    </div>
  );
}
