'use client';

import { useState } from 'react';

const MOCK_LEADS = [
  { id: '1', name: 'Tom Watson', email: 'tom.w@example.com', phone: '0401 234 567', suburb: 'Footscray', service: '10-Hour Pack (Auto)', status: 'new', date: '2026-06-01', message: 'Looking for weekend lessons. I\'m a complete beginner.' },
  { id: '2', name: 'Emma Fairchild', email: 'emma.f@example.com', phone: '0422 345 678', suburb: 'Yarraville', service: '5-Hour Pack (Manual)', status: 'contacted', date: '2026-05-28', message: 'I need manual lessons. I\'ve driven a bit before but need to build confidence.' },
  { id: '3', name: 'Liam O\'Connor', email: 'liam.oconnor@example.com', phone: '0433 456 789', suburb: 'Sunshine', service: 'Test Preparation', status: 'new', date: '2026-05-25', message: 'My test is in 3 weeks. Need intensive prep.' },
  { id: '4', name: 'Sophia Chen', email: 'sophia.c@example.com', phone: '0444 567 890', suburb: 'Seddon', service: '10-Hour Pack (Auto)', status: 'booked', date: '2026-05-20', message: 'Booked first lesson for June 5th.' },
  { id: '5', name: 'Jack Miller', email: 'jack.m@example.com', phone: '0455 678 901', suburb: 'Footscray', service: 'Single Lesson', status: 'archived', date: '2026-05-15', message: 'Had one lesson, decided to go with another instructor.' },
  { id: '6', name: 'Olivia Taylor', email: 'olivia.t@example.com', phone: '0466 789 012', suburb: 'Kingsville', service: '5-Hour Pack (Auto)', status: 'contacted', date: '2026-05-22', message: 'Nervous driver. Looking for a patient instructor.' },
];

const statusColors: Record<string, string> = {
  new: 'bg-secondary-container text-on-secondary-container',
  contacted: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  booked: 'bg-primary-fixed text-on-primary-fixed',
  archived: 'bg-surface-container-high text-on-surface-variant',
};

const tabs = ['All', 'New', 'Contacted', 'Booked', 'Archived'];

export default function PortalLeads() {
  const [activeTab, setActiveTab] = useState('All');
  const [leads, setLeads] = useState(MOCK_LEADS);

  const updateLeadStatus = (id: string, status: string) => {
    setLeads(leads.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const filtered = activeTab === 'All' ? leads : leads.filter((l) => l.status === activeTab.toLowerCase());

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
                activeTab === tab ? 'bg-white shadow-sm text-on-surface' : 'text-on-surface-variant'
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
                <p className="font-body-md text-body-md text-on-surface-variant mb-2">{lead.message}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-outline">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">location_on</span> {lead.suburb}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">email</span> {lead.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">phone</span> {lead.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span> {lead.date}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-lg whitespace-nowrap">{lead.service}</span>
                {lead.status === 'new' && (
                  <button onClick={() => updateLeadStatus(lead.id, 'contacted')} className="bg-secondary text-on-secondary px-4 py-2 rounded-lg text-xs font-bold hover:brightness-110 transition-all whitespace-nowrap">Mark Contacted</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
