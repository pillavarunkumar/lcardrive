'use client';

import { useState } from 'react';

interface Claim { id: string; name: string; email: string; adiNumber: string; suburb: string; submittedAt: string; }

export default function AdminClaims() {
  const [claims, setClaims] = useState<Claim[]>([
    { id: '1', name: 'Marcos Garcia', email: 'marcos@example.com', adiNumber: 'ADI-67890-VIC', suburb: 'Coburg', submittedAt: '2026-05-22' },
    { id: '2', name: 'Lisa Tran', email: 'lisa@example.com', adiNumber: 'ADI-54321-VIC', suburb: 'Werribee', submittedAt: '2026-05-21' },
  ]);

  const approve = (id: string) => setClaims((prev) => prev.filter((c) => c.id !== id));
  const reject = (id: string) => setClaims((prev) => prev.filter((c) => c.id !== id));

  if (claims.length === 0) {
    return <div className="text-center py-16"><p className="text-outline">No pending claims.</p></div>;
  }

  return (
    <div className="space-y-4">
      {claims.map((claim) => (
        <div key={claim.id} className="border border-outline-variant rounded-2xl p-6 card-shadow">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-on-surface">{claim.name}</h3>
              <p className="text-sm text-on-surface-variant">{claim.email}</p>
              <p className="text-sm text-on-surface-variant">ADI: <span className="font-mono font-medium text-on-surface">{claim.adiNumber}</span></p>
              <p className="text-sm text-on-surface-variant">Suburb: {claim.suburb} &middot; Submitted: {claim.submittedAt}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => reject(claim.id)} className="p-2 rounded-lg hover:bg-error-container text-error transition-colors" title="Reject">
                <span className="material-symbols-outlined">close</span>
              </button>
              <button onClick={() => approve(claim.id)} className="p-2 rounded-lg hover:bg-secondary-container text-secondary transition-colors" title="Approve">
                <span className="material-symbols-outlined">check</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
