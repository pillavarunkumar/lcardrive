'use client';

import { useState } from 'react';

interface Props {
  instructorId: string;
  firstName: string;
  className?: string;
}

/**
 * Small enquiry form used by the public profile "Contact" button.
 * Leads are stored against the instructor and appear in the portal inbox.
 */
export default function ContactInstructorButton({ instructorId, firstName, className }: Props) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', suburb: '', message: '' });

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, instructor_id: instructorId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not send your enquiry');
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your enquiry');
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ||
          'bg-white text-[#064E3B] text-base font-semibold px-6 py-2.5 rounded-xl hover:bg-white/90 transition-all flex items-center gap-2 shadow-md'
        }
      >
        <span className="material-symbols-outlined text-xl">mail</span>
        Contact {firstName}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Contact ${firstName}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            {sent ? (
              <div className="py-4 text-center">
                <span className="material-symbols-outlined text-4xl text-[#064E3B]">check_circle</span>
                <h3 className="mt-3 text-lg font-bold text-gray-900">Enquiry sent</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {firstName} will see your message in their instructor portal.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-5 w-full rounded-xl bg-[#064E3B] py-2.5 text-sm font-bold text-white"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Contact {firstName}</h3>
                    <p className="text-xs text-gray-500">Send a lesson enquiry — no payment required.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Close"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
                )}

                <input
                  required
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#064E3B]/30"
                />
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="Your email"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#064E3B]/30"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={form.phone}
                    onChange={update('phone')}
                    placeholder="Phone (optional)"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#064E3B]/30"
                  />
                  <input
                    value={form.suburb}
                    onChange={update('suburb')}
                    placeholder="Suburb"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#064E3B]/30"
                  />
                </div>
                <textarea
                  value={form.message}
                  onChange={update('message')}
                  placeholder="What would you like to learn?"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#064E3B]/30"
                />

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full rounded-xl bg-[#064E3B] py-2.5 text-sm font-bold text-white transition hover:bg-[#053A2C] disabled:opacity-50"
                >
                  {sending ? 'Sending…' : 'Send enquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
