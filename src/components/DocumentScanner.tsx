'use client';

import { useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface DocumentScannerProps {
  docType: string;
  label: string;
  existingImageUrl?: string | null;
  onScanned: (data: Record<string, string>, imageUrl: string | null, documentName?: string | null) => void;
}

export default function DocumentScanner({ docType, label, existingImageUrl, onScanned }: DocumentScannerProps) {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl || null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setScanning(true);
    setError(null);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);
    formData.append('clerk_user_id', user.id);

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
      onScanned(data.extracted, data.image_url || objectUrl, data.document_name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(existingImageUrl || null);
    } finally {
      URL.revokeObjectURL(objectUrl);
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
        accept="image/*"
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
