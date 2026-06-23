'use client';

import { useState, useRef } from 'react';

export default function AdminBackup() {
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [result, setResult] = useState<{ message: string; totalInserted?: number; errors?: number; results?: { table: string; inserted: number; error?: string }[] } | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleBackup = async () => {
    setBackingUp(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/admin/backup');
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Backup failed');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lcardrive-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Backup failed');
    } finally {
      setBackingUp(false);
    }
  };

  const handleRestore = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setRestoring(true);
    setError('');
    setResult(null);
    try {
      const text = await file.text();
      JSON.parse(text);
      const res = await fetch('/api/admin/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: text,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Restore failed');
      } else {
        setResult(data);
      }
    } catch {
      setError('Invalid JSON file');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Database Backup</h1>
        <p className="text-sm text-gray-500 mt-0.5">Download or restore database backups.</p>
      </div>

      <div className="mt-4 space-y-3">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>database</span>
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-gray-900 mb-0.5">Backup Database</h2>
              <p className="text-xs text-gray-500 mb-3">Download all tables as a single JSON file.</p>
              <button
                onClick={handleBackup}
                disabled={backingUp}
                className="bg-primary text-white px-5 py-2 rounded-xl text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              >
                {backingUp ? (
                  <>
                    <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                    Downloading...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">file_download</span>
                    Download Backup
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>restore_page</span>
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-gray-900 mb-0.5">Restore Database</h2>
              <p className="text-xs text-gray-500 mb-3">
                Upload a backup JSON file. <span className="text-red-600 font-semibold">Existing data will be replaced.</span>
              </p>

              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-red-300 hover:bg-red-50/30 transition-all cursor-pointer mb-3"
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept=".json" onChange={() => { setResult(null); setError(''); }} className="hidden" />
                <span className="material-symbols-outlined text-[28px] text-gray-300 mb-1">upload_file</span>
                <p className="text-xs text-gray-600">Click to select a backup JSON file</p>
              </div>

              {error && (
                <div className="mb-3 p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-100">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {error}
                </div>
              )}

              {result && (
                <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`material-symbols-outlined text-[16px] ${result.errors ? 'text-amber-500' : 'text-primary'}`}>
                      {result.errors ? 'warning' : 'check_circle'}
                    </span>
                    <p className="text-sm font-semibold text-gray-900">{result.message}</p>
                  </div>
                  <p className="text-[11px] text-gray-500">{result.totalInserted} total rows restored</p>
                  {result.results?.filter((r) => r.error).map((r) => (
                    <p key={r.table} className="text-[11px] text-red-600 mt-0.5">{r.table}: {r.error}</p>
                  ))}
                </div>
              )}

              <button
                onClick={handleRestore}
                disabled={!fileRef.current?.files?.[0] || restoring}
                className="w-full bg-red-600 text-white py-2 rounded-xl text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
              >
                {restoring ? (
                  <>
                    <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                    Restoring...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">restore_page</span>
                    Restore from File
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
