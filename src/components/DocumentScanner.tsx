'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface DocumentScannerProps {
  docType: string;
  label: string;
  existingImageUrl?: string | null;
  onScanned: (data: Record<string, string>, imageUrl: string | null, documentName?: string | null) => void;
}

async function resolvePreview(value: string | null | undefined): Promise<string | null> {
  if (!value) return null;
  if (!value.startsWith('documents/')) return value;

  try {
    const res = await fetch(`/api/portal/documents/url?path=${encodeURIComponent(value)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
  } catch {
    return null;
  }
}

export default function DocumentScanner({ docType, label, existingImageUrl, onScanned }: DocumentScannerProps) {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    resolvePreview(existingImageUrl).then((url) => {
      if (!cancelled) setPreviewUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [existingImageUrl]);

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setScanning(true);
    setError(null);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    let keepObjectUrl = false;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);

    try {
      const res = await fetch('/api/ai/scan-document', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Scan failed');
      }

      const data = await res.json();

      if (data.requires_review) {
        setError(
          data.review_reason === 'timeout'
            ? 'The scan timed out and has been sent for manual review.'
            : 'We could not read this document confidently. It has been sent for manual review.',
        );
      }

      // Store the private storage path, not a signed URL that expires.
      const storedValue = data.image_path || data.image_url || objectUrl;
      keepObjectUrl = !data.image_url && !data.image_path;

      onScanned(data.extracted || {}, storedValue, data.document_name);
      setPreviewUrl(data.image_url || objectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
      setPreviewUrl(await resolvePreview(existingImageUrl));
    } finally {
      if (!keepObjectUrl) URL.revokeObjectURL(objectUrl);
      setScanning(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-3">
      {previewUrl && (
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-outline-variant shrink-0">
          <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={handleScan}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={scanning}
        className="flex items-center gap-1.5 text-xs font-medium text-secondary hover:bg-secondary-container/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-sm">
          {scanning ? 'sync' : 'scan'}
        </span>
        {scanning ? 'Scanning...' : label}
      </button>
      {error && (
        <span className="text-xs text-error">{error}</span>
      )}
    </div>
  );
}
