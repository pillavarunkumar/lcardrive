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
    <div className="max-w-2xl">
      <div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Database Backup</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
          Download or restore database backups.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>database</span>
            </div>
            <div className="flex-1">
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">Backup Database</h2>
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">
                Download all tables (instructors, reviews, listing_flags, search_logs) as a single JSON file.
              </p>
              <button
                onClick={handleBackup}
                disabled={backingUp}
                className="bg-secondary text-on-secondary px-6 py-2.5 rounded-xl font-label-md text-label-md font-bold hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {backingUp ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Downloading...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Download Backup
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center text-error shrink-0">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>restore_page</span>
            </div>
            <div className="flex-1">
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">Restore Database</h2>
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">
                Upload a backup JSON file to restore all tables. <span className="text-error font-bold">Existing data will be replaced.</span>
              </p>

              <div
                className="border-2 border-dashed border-outline-variant/60 rounded-xl p-6 text-center hover:border-error/50 hover:bg-error/[0.02] transition-all cursor-pointer mb-4"
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept=".json" onChange={() => { setResult(null); setError(''); }} className="hidden" />
                <span className="material-symbols-outlined text-[32px] text-outline mb-2">upload_file</span>
                <p className="font-label-md text-label-md text-on-surface-variant">Click to select a backup JSON file</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-xl text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {error}
                </div>
              )}

              {result && (
                <div className="mb-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/40">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`material-symbols-outlined ${result.errors ? 'text-warning' : 'text-secondary'}`}>
                      {result.errors ? 'warning' : 'check_circle'}
                    </span>
                    <p className="font-label-md text-label-md font-bold text-on-surface">{result.message}</p>
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{result.totalInserted} total rows restored</p>
                  {result.results?.filter((r) => r.error).map((r) => (
                    <p key={r.table} className="font-label-sm text-label-sm text-error mt-1">{r.table}: {r.error}</p>
                  ))}
                </div>
              )}

              <button
                onClick={handleRestore}
                disabled={!fileRef.current?.files?.[0] || restoring}
                className="w-full bg-error text-on-error py-2.5 rounded-xl font-label-md text-label-md font-bold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {restoring ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Restoring...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">restore_page</span>
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
