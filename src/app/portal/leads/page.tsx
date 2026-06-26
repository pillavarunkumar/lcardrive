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
  new: 'bg-[#064E3B]/10 text-[#064E3B]',
  contacted: 'bg-gray-200 text-gray-500',
  booked: 'bg-green-50 text-green-700',
  archived: 'bg-gray-100 text-gray-400',
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-[22px] font-bold text-gray-900">Leads</h2>
          <p className="text-sm text-gray-500 mt-1">Students who have contacted you about your services.</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-1 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${
                activeTab === tab ? 'bg-[#064E3B] text-white shadow-sm' : 'text-gray-500 hover:text-[#064E3B]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-[#E5E7EB]/30 animate-pulse">
              <div className="flex-1 h-4 bg-gray-200 rounded" />
              <div className="w-24 h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-[#64748B] mb-4">
            <span className="material-symbols-outlined text-[32px]">inbox</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No leads yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto text-sm">
            {activeTab === 'All' ? 'Leads will appear here when students contact you.' : `No leads with status "${activeTab.toLowerCase()}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => (
            <div key={lead.id} className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-bold text-gray-900">{lead.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${statusColors[lead.status]}`}>
                      {lead.status}
                    </span>
                  </div>
                  {lead.message && <p className="text-sm text-gray-500 mb-2">&ldquo;{lead.message}&rdquo;</p>}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
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
                  {lead.service && <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg whitespace-nowrap">{lead.service}</span>}
                  {lead.status === 'new' && (
                    <button onClick={() => updateLeadStatus(lead.id, 'contacted')} className="bg-[#064E3B] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#053A2C] transition-all whitespace-nowrap">Mark Contacted</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
