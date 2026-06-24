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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">Database Backup</h2>
        <p className="text-on-surface-variant text-sm mt-1">Download or restore database backups.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>database</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-on-surface mb-0.5">Backup Database</h3>
              <p className="text-xs text-on-surface-variant mb-4">Download all tables as a single JSON file.</p>
              <button
                onClick={handleBackup}
                disabled={backingUp}
                className="bg-primary text-on-primary px-5 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
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

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-error-container/20 flex items-center justify-center text-error shrink-0">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>restore_page</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-on-surface mb-0.5">Restore Database</h3>
              <p className="text-xs text-on-surface-variant mb-4">
                Upload a backup JSON file. <span className="text-error font-semibold">Existing data will be replaced.</span>
              </p>

              <div
                className="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center hover:border-error/50 hover:bg-error/5 transition-all cursor-pointer mb-4"
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept=".json" onChange={() => { setResult(null); setError(''); }} className="hidden" />
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-outline mx-auto mb-2">
                  <span className="material-symbols-outlined text-[22px]">upload_file</span>
                </div>
                <p className="text-xs text-on-surface-variant">Click to select a backup JSON file</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-error-container/20 text-error rounded-xl text-xs flex items-center gap-2 border border-error/20">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {error}
                </div>
              )}

              {result && (
                <div className="mb-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`material-symbols-outlined text-[16px] ${result.errors ? 'text-amber-500' : 'text-primary'}`}>
                      {result.errors ? 'warning' : 'check_circle'}
                    </span>
                    <p className="text-sm font-bold text-on-surface">{result.message}</p>
                  </div>
                  {result.totalInserted !== undefined && (
                    <p className="text-[11px] text-on-surface-variant">{result.totalInserted} total rows restored</p>
                  )}
                  {result.results?.filter((r) => r.error).map((r) => (
                    <p key={r.table} className="text-[11px] text-error mt-0.5">{r.table}: {r.error}</p>
                  ))}
                </div>
              )}

              <button
                onClick={handleRestore}
                disabled={!fileRef.current?.files?.[0] || restoring}
                className="w-full bg-error text-on-error py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
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
