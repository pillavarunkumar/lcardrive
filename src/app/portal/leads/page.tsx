'use client';

import { useState, useEffect } from 'react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  suburb: string | null;
  service: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  new: 'bg-primary/10 text-primary',
  contacted: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  booked: 'bg-primary-fixed text-on-primary-fixed',
  archived: 'bg-surface-container-high text-on-surface-variant',
};

const tabs = ['All', 'New', 'Contacted', 'Booked', 'Archived'];

export default function PortalLeads() {
  const [activeTab, setActiveTab] = useState('All');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal/leads')
      .then(r => r.json())
      .then(d => { if (d.leads) setLeads(d.leads); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateLeadStatus = async (id: string, status: string) => {
    const res = await fetch('/api/portal/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setLeads(leads.map((l) => (l.id === id ? { ...l, status } : l)));
    }
  };

  const filtered = activeTab === 'All' ? leads : leads.filter((l) => l.status === activeTab.toLowerCase());

  if (loading) {
    return (
      <div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Leads</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1 mb-6">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Leads</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Students who have contacted you about your services.</p>
        </div>
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-1 flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${
                activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-on-surface-variant font-body-md">
            <span className="material-symbols-outlined text-[48px] mb-4 block">inbox</span>
            No leads in this category yet.
          </div>
        )}
        {filtered.map((lead) => (
          <div key={lead.id} className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant hover:shadow-sm transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{lead.name}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${statusColors[lead.status]}`}>
                    {lead.status}
                  </span>
                </div>
                {lead.message && <p className="font-body-md text-body-md text-on-surface-variant mb-2">{lead.message}</p>}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-outline">
                  {lead.suburb && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span> {lead.suburb}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">email</span> {lead.email}
                  </span>
                  {lead.phone && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">phone</span> {lead.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span> {new Date(lead.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {lead.service && <span className="text-xs font-medium text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-lg whitespace-nowrap">{lead.service}</span>}
                {lead.status === 'new' && (
                  <button onClick={() => updateLeadStatus(lead.id, 'contacted')} className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-all whitespace-nowrap">Mark Contacted</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
