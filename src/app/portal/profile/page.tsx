'use client';

import { useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

export default function PortalProfile() {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiStep, setAiStep] = useState<'input' | 'loading' | 'preview'>('input');
  const [toast, setToast] = useState<string | null>(null);
  const [bioText, setBioText] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const toggleAIModal = () => {
    if (aiModalOpen) {
      setAiModalOpen(false);
      setAiStep('input');
    } else {
      setAiModalOpen(true);
    }
  };

  const generateBio = () => {
    setAiStep('loading');
    setTimeout(() => {
      setAiStep('preview');
    }, 1500);
  };

  const applyBio = (text: string) => {
    setBioText(text);
    toggleAIModal();
    showToast('Bio applied to your profile.');
  };

  return (
    <>
      {toast && (
        <div className="fixed top-6 right-6 z-[60] bg-secondary text-on-secondary px-5 py-3 rounded-xl shadow-lg font-label-md text-label-md animate-in fade-in">
          {toast}
        </div>
      )}

      <div className="sticky top-0 z-10 glass-panel border-b border-outline-variant/30 -mx-margin-mobile md:-mx-margin-desktop px-margin-mobile md:px-margin-desktop pt-8 pb-4 bg-surface/90 backdrop-blur-md">
        <div className="max-w-container-max mx-auto">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-6">Edit Profile</h1>
          <div className="flex overflow-x-auto hide-scrollbar gap-8 border-b border-outline-variant/40 pb-[1px]">
            {['Personal Info', 'Specialisations', 'Vehicle Details', 'Service Areas', 'Rates & Packages'].map((tab) => (
              <button
                key={tab}
                className={`font-label-md text-label-md whitespace-nowrap px-1 pb-3 transition-colors ${
                  tab === 'Personal Info'
                    ? 'text-secondary border-b-2 border-secondary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full pb-stack-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left Column */}
          <div className="lg:col-span-8 flex flex-col gap-gutter">
            {/* Basic Information */}
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(15,23,42,0.04)] border border-outline-variant/20 relative overflow-hidden">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                {[
                  { label: 'First Name', value: user?.firstName || '', type: 'text' },
                  { label: 'Last Name', value: user?.lastName || '', type: 'text' },
                  { label: 'Email Address', value: user?.primaryEmailAddress?.emailAddress || '', type: 'email' },
                  { label: 'Phone Number', value: user?.primaryPhoneNumber?.phoneNumber || '', type: 'tel' },
                ].map((f) => (
                  <div key={f.label} className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">{f.label}</label>
                    <input
                      type={f.type}
                      defaultValue={f.value}
                      className="bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Bio */}
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(15,23,42,0.04)] border border-outline-variant/20 relative group">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Professional Bio</h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">This is the first thing learners read on your profile.</p>
                </div>
                <button
                  onClick={toggleAIModal}
                  className="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container border border-secondary/20 text-secondary rounded-full px-4 py-2 font-label-md text-label-md transition-all shadow-sm hover:shadow-md group"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary group-hover:rotate-12 transition-transform duration-300" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  Generate bio with AI
                </button>
              </div>
              <div className="relative">
                <textarea
                  className="w-full bg-surface border border-outline-variant/60 rounded-lg p-4 font-body-md text-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all resize-y custom-scrollbar"
                  placeholder="Write a compelling bio that highlights your experience and teaching style..."
                  rows={6}
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 flex flex-col gap-gutter">
            {/* Avatar Upload */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_4px_20px rgba(15,23,42,0.04)] border border-outline-variant/20 flex flex-col items-center text-center">
              <div className="relative mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img
                  alt="Current Profile Picture"
                  className="w-32 h-32 rounded-full object-cover border-4 border-surface shadow-md"
                  src={user?.imageUrl || 'https://lh3.googleusercontent.com/a/ACg8ocL4e96UEDCIshPGI6UJ-PeexiFbwBk0HTi0ewoY3eOwFw=s360-c'}
                />
                <div className="absolute inset-0 bg-primary/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <span className="material-symbols-outlined text-on-primary text-[32px]">photo_camera</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !user) return;
                  setUploadingPhoto(true);
                  try {
                    await user.setProfileImage({ file });
                    showToast('Profile photo updated!');
                  } catch {
                    showToast('Failed to upload photo.');
                  } finally {
                    setUploadingPhoto(false);
                    e.target.value = '';
                  }
                }}
              />
              <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">Profile Photo</h4>
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">Clear frontal face photos build trust with learners.</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="w-full border border-outline-variant hover:bg-surface-container-low text-on-surface rounded-lg px-4 py-2 font-label-md text-label-md transition-colors disabled:opacity-50"
              >
                {uploadingPhoto ? 'Uploading...' : 'Upload New Photo'}
              </button>
            </div>

            {/* Profile Status */}
            <div className="bg-secondary-container/30 rounded-xl p-6 border border-secondary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-secondary text-on-secondary rounded-full p-1.5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
                <h4 className="font-label-md text-label-md font-bold text-on-secondary-container">Profile Status: Active</h4>
              </div>
              <p className="font-label-sm text-label-sm text-on-secondary-container/80 mb-4">Your profile is visible to learners in your selected service areas.</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center font-label-sm text-label-sm">
                  <span className="text-on-surface-variant">Profile Completion</span>
                  <span className="text-secondary font-bold">85%</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                  <div className="bg-secondary h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-stack-lg flex justify-end gap-4 pt-6 border-t border-outline-variant/30">
          <button
            onClick={() => { setBioText(''); showToast('Changes discarded.'); }}
            className="bg-transparent text-primary hover:bg-surface-container border border-outline-variant rounded-lg px-6 py-2.5 font-label-md text-label-md transition-colors"
          >
            Discard Changes
          </button>
          <button
            onClick={() => showToast('Profile saved successfully!')}
            className="bg-secondary hover:bg-secondary/90 text-on-secondary rounded-lg px-6 py-2.5 font-label-md text-label-md transition-colors shadow-sm"
          >
            Save Profile
          </button>
        </div>
      </div>

      {/* AI Bio Generator Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300">
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={toggleAIModal}></div>
          <div className="bg-surface-container-lowest w-[90%] max-w-2xl rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden transform transition-transform duration-300">
            {/* Modal Header */}
            <div className="ai-gradient-bg px-6 py-5 border-b border-outline-variant/20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-surface-container-highest text-secondary rounded-lg p-2 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">AI Bio Generator</h2>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Let AI craft a professional bio based on your strengths.</p>
                </div>
              </div>
              <button onClick={toggleAIModal} className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-container">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {aiStep === 'input' && (
                <div className="space-y-stack-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">Years of Experience</label>
                      <input className="bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all" placeholder="e.g. 5" type="number" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">Licence Types</label>
                      <select className="bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all">
                        <option>Manual & Automatic</option>
                        <option>Automatic Only</option>
                        <option>Manual Only</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">Teaching Style</label>
                      <select className="bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all">
                        <option>Patient & Calm</option>
                        <option>Structured & Strict</option>
                        <option>Adaptable & Fun</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">Primary Learner Types</label>
                      <input className="bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all" placeholder="e.g. Anxious beginners, Teens" type="text" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Specialisations</label>
                    <input className="bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all" placeholder="e.g. Defensive driving, intensive courses" type="text" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">What are you most proud of as an instructor?</label>
                    <textarea className="bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all resize-none" placeholder="e.g. High first-time pass rate, helping very nervous students." rows={2}></textarea>
                  </div>
                </div>
              )}

              {aiStep === 'loading' && (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <span className="material-symbols-outlined animate-spin text-secondary text-[32px]">sync</span>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Crafting your professional story...</p>
                </div>
              )}

              {aiStep === 'preview' && (
                <div className="flex flex-col gap-4">
                  <div className="bg-surface border border-secondary/30 rounded-xl p-5 relative">
                    <div className="absolute -top-3 left-4 bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Draft 1</div>
                    <p className="font-body-md text-body-md text-on-surface leading-relaxed mt-2">
                      With over 5 years of experience teaching both manual and automatic driving, I pride myself on a patient and calm approach. I specialize in helping anxious beginners build confidence behind the wheel, focusing heavily on defensive driving techniques. My greatest achievement is maintaining a consistently high first-time pass rate while ensuring my students become safe, lifelong drivers. Let&apos;s get you on the road safely!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low flex justify-end gap-3 rounded-b-2xl">
              {aiStep === 'input' && (
                <div className="flex gap-3 w-full justify-end">
                  <button onClick={toggleAIModal} className="text-primary hover:bg-surface-container px-4 py-2 rounded-lg font-label-md text-label-md transition-colors">Cancel</button>
                  <button onClick={generateBio} className="bg-secondary hover:bg-secondary/90 text-on-secondary px-6 py-2 rounded-lg font-label-md text-label-md transition-colors flex items-center gap-2 shadow-sm">
                    Generate <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              )}
              {aiStep === 'preview' && (
                <div className="flex gap-3 w-full justify-between items-center">
                  <button onClick={() => setAiStep('input')} className="text-on-surface-variant hover:text-primary font-label-md text-label-md flex items-center gap-1 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">refresh</span> Retry
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { applyBio('With over 5 years of experience...'); }}
                      className="border border-outline-variant text-primary hover:bg-surface-container px-4 py-2 rounded-lg font-label-md text-label-md transition-colors"
                    >
                      Edit in Canvas
                    </button>
                    <button
                      onClick={() => { applyBio("With over 5 years of experience teaching both manual and automatic driving, I pride myself on a patient and calm approach. I specialize in helping anxious beginners build confidence behind the wheel, focusing heavily on defensive driving techniques. My greatest achievement is maintaining a consistently high first-time pass rate while ensuring my students become safe, lifelong drivers. Let's get you on the road safely!"); }}
                      className="bg-secondary hover:bg-secondary/90 text-on-secondary px-6 py-2 rounded-lg font-label-md text-label-md transition-colors shadow-sm"
                    >
                      Use this Bio
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .ai-gradient-bg {
          background: linear-gradient(135deg, #f8f9ff 0%, #e5eeff 100%);
        }
        body { margin: 0; overflow: hidden; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
