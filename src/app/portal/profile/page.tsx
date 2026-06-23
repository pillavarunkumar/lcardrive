'use client';

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import DocumentScanner from '@/components/DocumentScanner';
import VerificationStatus from '@/components/VerificationStatus';
import type { Instructor } from '@/types';

const tabs = ['Personal Info', 'Specialisations', 'Vehicle Details', 'Licences & Documents'];

export default function PortalProfile() {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('Personal Info');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'vehicle-details') setActiveTab('Vehicle Details');
    if (hash === 'licences-documents') setActiveTab('Licences & Documents');
  }, []);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiStep, setAiStep] = useState<'input' | 'loading' | 'preview'>('input');
  const [aiBioPreview, setAiBioPreview] = useState('');
  const [aiInputs, setAiInputs] = useState({ experience: '', licenceTypes: 'Manual & Automatic', teachingStyle: 'Patient & Calm', learnerTypes: '', specialisations: '', proudest: '' });
  const [toast, setToast] = useState<string | null>(null);
  const [bioText, setBioText] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [hasPendingReview, setHasPendingReview] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetch('/api/portal/verify/status').then(r => r.json()).then(d => {
      if (d.is_verified) setIsVerified(true);
      if (d.verified_name) setVerifiedName(d.verified_name);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/portal/profile')
      .then(r => r.json())
      .then(d => {
        const inst: Instructor | null = d.instructor;
        if (!inst) return;
        setBioText(inst.bio || '');
        setLicenceTypes(inst.licence_types || ['car']);
        setTransmission(inst.transmission || 'both');
        setTeachingStyle(inst.teaching_style || 'Patient & Calm');
        setLearnerTypes(inst.primary_learner_types || '');
        setSpecialisesAnxiety(inst.specialises_anxiety || false);
        setAcceptsInternational(inst.accepts_international || false);
        setLanguages(inst.languages?.length ? inst.languages : ['English']);
        setVehicleMake(inst.vehicle_make || '');
        setVehicleModel(inst.vehicle_model || '');
        setVehicleYear(inst.vehicle_year || new Date().getFullYear());
        setVehicleRego(inst.vehicle_rego || '');
        setVehicleColor(inst.vehicle_color || '');
        setTransmissionType(inst.vehicle_transmission || 'auto');
        setDualControls(inst.dual_controls ?? true);
        setDriversLicenceNumber(inst.drivers_licence_number || '');
        setDriversLicenceExpiry(inst.drivers_licence_expiry || '');
        setAdiRegNumber(inst.adi_registration || '');
        setAdiRegExpiry(inst.adi_registration_expiry || '');
        setCertIVReference(inst.certificate_iv_reference || '');
        setCertIVDate(inst.certificate_iv_date || '');
        setWwccNumber(inst.wwcc_number || '');
        setWwccExpiry(inst.wwcc_expiry || '');
        setPoliceCheckDate(inst.police_check_date || '');
        setMedAssessmentDate(inst.medical_assessment_date || '');
        setMedAssessmentExpiry(inst.medical_assessment_expiry || '');
        setPubLiabProvider(inst.public_liability_provider || '');
        setPubLiabPolicy(inst.public_liability_policy_number || '');
        setPubLiabExpiry(inst.public_liability_expiry || '');
        if (inst.is_verified) setIsVerified(true);
        setHasPendingReview(d.hasPendingReview || false);
      })
      .catch(() => {});
  }, []);

  // Specialisations
  const [licenceTypes, setLicenceTypes] = useState<string[]>(['car']);
  const [transmission, setTransmission] = useState('both');
  const [teachingStyle, setTeachingStyle] = useState('Patient & Calm');
  const [specialisesAnxiety, setSpecialisesAnxiety] = useState(true);
  const [acceptsInternational, setAcceptsInternational] = useState(true);
  const [languages, setLanguages] = useState<string[]>(['English']);
  const [langInput, setLangInput] = useState('');
  const [learnerTypes, setLearnerTypes] = useState('');

  // Vehicle Details
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState(new Date().getFullYear());
  const [vehicleRego, setVehicleRego] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [transmissionType, setTransmissionType] = useState('auto');
  const [dualControls, setDualControls] = useState(true);
  const [vehicleImageUrl, setVehicleImageUrl] = useState<string | null>(null);

  // Licences & Documents
  const [driversLicenceNumber, setDriversLicenceNumber] = useState('');
  const [driversLicenceExpiry, setDriversLicenceExpiry] = useState('');
  const [driversLicenceImageUrl, setDriversLicenceImageUrl] = useState<string | null>(null);
  const [adiRegNumber, setAdiRegNumber] = useState('');
  const [adiRegExpiry, setAdiRegExpiry] = useState('');
  const [adiRegImageUrl, setAdiRegImageUrl] = useState<string | null>(null);
  const [certIVReference, setCertIVReference] = useState('');
  const [certIVDate, setCertIVDate] = useState('');
  const [certIVImageUrl, setCertIVImageUrl] = useState<string | null>(null);
  const [wwccNumber, setWwccNumber] = useState('');
  const [wwccExpiry, setWwccExpiry] = useState('');
  const [wwccImageUrl, setWwccImageUrl] = useState<string | null>(null);
  const [policeCheckDate, setPoliceCheckDate] = useState('');
  const [policeCheckImageUrl, setPoliceCheckImageUrl] = useState<string | null>(null);
  const [medAssessmentDate, setMedAssessmentDate] = useState('');
  const [medAssessmentExpiry, setMedAssessmentExpiry] = useState('');
  const [medAssessmentImageUrl, setMedAssessmentImageUrl] = useState<string | null>(null);
  const [pubLiabProvider, setPubLiabProvider] = useState('');
  const [pubLiabPolicy, setPubLiabPolicy] = useState('');
  const [pubLiabExpiry, setPubLiabExpiry] = useState('');
  const [pubLiabImageUrl, setPubLiabImageUrl] = useState<string | null>(null);

  const formState = useMemo(() => ({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    verifiedName,
    profilePhotoUrl: user?.imageUrl || null,
    bio: bioText,
    driversLicenceNumber,
    driversLicenceImageUrl,
    adiRegNumber,
    adiRegImageUrl,
    certIVReference,
    certIVImageUrl,
    wwccNumber,
    wwccImageUrl,
    policeCheckDate,
    policeCheckImageUrl,
    medAssessmentDate,
    medAssessmentImageUrl,
    pubLiabProvider,
    pubLiabExpiry,
    pubLiabImageUrl,
    vehicleMake,
    vehicleModel,
    vehicleRego,
    vehicleColor,
    vehicleImageUrl,
  }), [user?.firstName, user?.lastName, user?.imageUrl, verifiedName, bioText, driversLicenceNumber, driversLicenceImageUrl, adiRegNumber, adiRegImageUrl, certIVReference, certIVImageUrl, wwccNumber, wwccImageUrl, policeCheckDate, policeCheckImageUrl, medAssessmentDate, medAssessmentImageUrl, pubLiabProvider, pubLiabExpiry, pubLiabImageUrl, vehicleMake, vehicleModel, vehicleRego, vehicleColor, vehicleImageUrl]);

  const handleVerify = async () => {
    try {
      const res = await fetch('/api/portal/verify', { method: 'POST' });
      const data = await res.json();
      if (data.verified) {
        setIsVerified(true);
        showToast('Profile verified successfully!');
      } else {
        showToast('Verification failed.');
      }
    } catch {
      showToast('Verification failed.');
    }
  };

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

  const generateBio = async () => {
    setAiStep('loading');
    try {
      const res = await fetch('/api/ai/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiInputs),
      });
      const data = await res.json();
      if (data.bio) {
        setAiBioPreview(data.bio);
        setAiStep('preview');
      } else {
        showToast('Failed to generate bio.');
        setAiStep('input');
      }
    } catch {
      showToast('Failed to generate bio.');
      setAiStep('input');
    }
  };

  const applyBio = (text: string) => {
    setBioText(text);
    toggleAIModal();
    showToast('Bio applied to your profile.');
  };

  const toggleLicenceType = (t: string) => {
    setLicenceTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const addLanguage = (l: string) => {
    if (!languages.includes(l)) setLanguages([...languages, l]);
    setLangInput('');
  };
  const removeLanguage = (l: string) => setLanguages(languages.filter((x) => x !== l));

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Personal Info':
        return (
          <>
            {/* Professional Bio */}
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(15,23,42,0.04)] border border-outline-variant/20 relative group">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Professional Bio</h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">This is the first thing learners read on your profile.</p>
                </div>
                <button
                  onClick={toggleAIModal}
                  className="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container border border-primary/20 text-primary rounded-full px-4 py-2 font-label-md text-label-md transition-all shadow-sm hover:shadow-md group"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary group-hover:rotate-12 transition-transform duration-300" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  Generate bio with AI
                </button>
              </div>
              <div className="relative">
                <textarea
                  className="w-full bg-surface border border-outline-variant/60 rounded-lg p-4 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y custom-scrollbar"
                  placeholder="Write a compelling bio that highlights your experience and teaching style..."
                  rows={6}
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                />
              </div>
            </div>
          </>
        );

      case 'Specialisations':
        return (
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(15,23,42,0.04)] border border-outline-variant/20">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Specialisations</h3>
            <div className="space-y-6">
              {/* Licence Types */}
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-3">Licence Types</label>
                <div className="flex flex-wrap gap-2">
                  {['car', 'motorbike', 'truck', 'bus'].map((t) => (
                    <label key={t} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                      licenceTypes.includes(t) ? 'border-primary bg-primary/10' : 'border-outline-variant'
                    }`}>
                      <input
                        type="checkbox"
                        checked={licenceTypes.includes(t)}
                        onChange={() => toggleLicenceType(t)}
                        className="accent-primary rounded"
                      />
                      <span className="text-sm font-medium text-on-surface capitalize">{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Transmission */}
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-3">Transmission Taught</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'both', label: 'Manual & Automatic' },
                    { value: 'auto', label: 'Automatic Only' },
                    { value: 'manual', label: 'Manual Only' },
                  ].map((t) => (
                    <label key={t.value} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                      transmission === t.value ? 'border-primary bg-primary/10' : 'border-outline-variant'
                    }`}>
                      <input
                        type="radio"
                        name="transmission"
                        checked={transmission === t.value}
                        onChange={() => setTransmission(t.value)}
                        className="accent-primary"
                      />
                      <span className="text-sm font-medium text-on-surface">{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Teaching Style */}
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-3">Teaching Style</label>
                <div className="flex flex-wrap gap-2">
                  {['Patient & Calm', 'Structured & Strict', 'Adaptable & Fun'].map((s) => (
                    <label key={s} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                      teachingStyle === s ? 'border-primary bg-primary/10' : 'border-outline-variant'
                    }`}>
                      <input
                        type="radio"
                        name="teachingStyle"
                        checked={teachingStyle === s}
                        onChange={() => setTeachingStyle(s)}
                        className="accent-primary"
                      />
                      <span className="text-sm font-medium text-on-surface">{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-4 rounded-xl border border-outline-variant cursor-pointer hover:bg-surface-container-low transition-colors">
                  <div>
                    <span className="text-sm font-medium text-on-surface block">Anxiety-Friendly</span>
                    <span className="text-xs text-on-surface-variant">Specialise in nervous learners</span>
                  </div>
                  <button
                    onClick={() => setSpecialisesAnxiety(!specialisesAnxiety)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${specialisesAnxiety ? 'bg-primary' : 'bg-surface-variant'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${specialisesAnxiety ? 'translate-x-5' : ''}`} />
                  </button>
                </label>
                <label className="flex items-center justify-between p-4 rounded-xl border border-outline-variant cursor-pointer hover:bg-surface-container-low transition-colors">
                  <div>
                    <span className="text-sm font-medium text-on-surface block">International Conversion</span>
                    <span className="text-xs text-on-surface-variant">Accept overseas licence holders</span>
                  </div>
                  <button
                    onClick={() => setAcceptsInternational(!acceptsInternational)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${acceptsInternational ? 'bg-primary' : 'bg-surface-variant'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${acceptsInternational ? 'translate-x-5' : ''}`} />
                  </button>
                </label>
              </div>

              {/* Languages */}
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-3">Languages Spoken</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {languages.map((l) => (
                    <span key={l} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface text-sm font-medium">
                      {l}
                      <button onClick={() => removeLanguage(l)} className="hover:text-error"><span className="material-symbols-outlined text-sm">close</span></button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Type a language and press Enter..."
                  value={langInput}
                  onChange={(e) => setLangInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && langInput.trim()) { e.preventDefault(); addLanguage(langInput.trim()); } }}
                  className="w-full max-w-xs px-4 py-2.5 rounded-lg border border-outline-variant text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>

              {/* Primary Learner Types */}
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1.5">Primary Learner Types</label>
                <input
                  type="text"
                  placeholder="e.g. Anxious beginners, Teens, Seniors"
                  value={learnerTypes}
                  onChange={(e) => setLearnerTypes(e.target.value)}
                  className="w-full max-w-xs px-4 py-2.5 rounded-lg border border-outline-variant text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>
        );

      case 'Vehicle Details':
        return (
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(15,23,42,0.04)] border border-outline-variant/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Vehicle Details</h3>
              <DocumentScanner
                docType="vehicle_registration"
                label="Scan Registration"
                existingImageUrl={vehicleImageUrl}
                onScanned={(data, url, _name) => {
                  if (data.vehicle_make) setVehicleMake(data.vehicle_make as string);
                  if (data.vehicle_model) setVehicleModel(data.vehicle_model as string);
                  if (data.vehicle_year) setVehicleYear(parseInt(data.vehicle_year as string) || new Date().getFullYear());
                  if (data.vehicle_rego) setVehicleRego(data.vehicle_rego as string);
                  if (data.vehicle_color) setVehicleColor(data.vehicle_color as string);
                  if (url) setVehicleImageUrl(url);
                  showToast('Vehicle details extracted from image!');
                }}
              />
            </div>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Make <span className="text-error">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Toyota"
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    required
                    className="bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Model <span className="text-error">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Corolla"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    required
                    className="bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Year <span className="text-error">*</span></label>
                  <input
                    type="number"
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(parseInt(e.target.value) || new Date().getFullYear())}
                    min={2000}
                    max={new Date().getFullYear() + 1}
                    required
                    className="bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Registration Plate <span className="text-error">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. ABC-123"
                    value={vehicleRego}
                    onChange={(e) => setVehicleRego(e.target.value)}
                    required
                    className="bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Colour</label>
                  <input
                    type="text"
                    placeholder="e.g. White"
                    value={vehicleColor}
                    onChange={(e) => setVehicleColor(e.target.value)}
                    className="bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant block mb-3">Transmission Type</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'auto', label: 'Automatic' },
                    { value: 'manual', label: 'Manual' },
                  ].map((t) => (
                    <label key={t.value} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                      transmissionType === t.value ? 'border-primary bg-primary/10' : 'border-outline-variant'
                    }`}>
                      <input
                        type="radio"
                        name="vehicleTransmission"
                        checked={transmissionType === t.value}
                        onChange={() => setTransmissionType(t.value)}
                        className="accent-primary"
                      />
                      <span className="text-sm font-medium text-on-surface">{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center justify-between p-4 rounded-xl border border-outline-variant cursor-pointer hover:bg-surface-container-low transition-colors max-w-md">
                <div>
                  <span className="text-sm font-medium text-on-surface block">Dual Controls Installed</span>
                  <span className="text-xs text-on-surface-variant">Instructor brake pedals fitted</span>
                </div>
                <button
                  onClick={() => setDualControls(!dualControls)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${dualControls ? 'bg-primary' : 'bg-surface-variant'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${dualControls ? 'translate-x-5' : ''}`} />
                </button>
              </label>
            </div>
          </div>
        );

      case 'Licences & Documents':
        return (
          <div className="space-y-6">
            {/* Driver's Licence */}
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(15,23,42,0.04)] border border-outline-variant/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Driver&apos;s Licence</h3>
                <DocumentScanner
                  docType="drivers_licence"
                  label="Scan Licence"
                  existingImageUrl={driversLicenceImageUrl}
                  onScanned={(data, url, docName) => {
                    if (data.licence_number) setDriversLicenceNumber(data.licence_number as string);
                    if (data.expiry_date) setDriversLicenceExpiry(data.expiry_date as string);
                    if (url) setDriversLicenceImageUrl(url);
                    if (docName) setVerifiedName(docName);
                    showToast('Licence details extracted from image!');
                  }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Licence Number</label>
                  <input type="text" placeholder="e.g. 12345678" value={driversLicenceNumber} onChange={(e) => setDriversLicenceNumber(e.target.value)} className="bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Expiry Date</label>
                  <input type="date" value={driversLicenceExpiry} onChange={(e) => setDriversLicenceExpiry(e.target.value)} className="bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* ADI Registration */}
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(15,23,42,0.04)] border border-outline-variant/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">ADI Registration</h3>
                <DocumentScanner
                  docType="adi_registration"
                  label="Scan ADI Card"
                  existingImageUrl={adiRegImageUrl}
                  onScanned={(data, url, docName) => {
                    if (data.adi_registration) setAdiRegNumber(data.adi_registration as string);
                    if (data.adi_registration_expiry) setAdiRegExpiry(data.adi_registration_expiry as string);
                    if (url) setAdiRegImageUrl(url);
                    if (docName) setVerifiedName(docName);
                    showToast('ADI details extracted from image!');
                  }}
                />
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">Authorised Driving Instructor (ADI) registration issued by your state&apos;s regulator.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">ADI Registration Number</label>
                  <input type="text" placeholder="e.g. ADI-123456" value={adiRegNumber} onChange={(e) => setAdiRegNumber(e.target.value)} className="bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Expiry Date</label>
                  <input type="date" value={adiRegExpiry} onChange={(e) => setAdiRegExpiry(e.target.value)} className="bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* Certificate IV */}
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(15,23,42,0.04)] border border-outline-variant/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Certificate IV in Driving Instruction</h3>
                <DocumentScanner
                  docType="certificate_iv"
                  label="Scan Certificate"
                  existingImageUrl={certIVImageUrl}
                  onScanned={(data, url, docName) => {
                    if (data.certificate_iv_reference) setCertIVReference(data.certificate_iv_reference as string);
                    if (data.certificate_iv_date) setCertIVDate(data.certificate_iv_date as string);
                    if (url) setCertIVImageUrl(url);
                    if (docName) setVerifiedName(docName);
                    showToast('Certificate details extracted from image!');
                  }}
                />
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">Nationally recognised TLI41222 (or equivalent) qualification.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Certificate Reference</label>
                  <input type="text" placeholder="e.g. CERT-98765" value={certIVReference} onChange={(e) => setCertIVReference(e.target.value)} className="bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Date Issued</label>
                  <input type="date" value={certIVDate} onChange={(e) => setCertIVDate(e.target.value)} className="bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* Working with Children Check */}
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(15,23,42,0.04)] border border-outline-variant/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Working with Children Check</h3>
                <DocumentScanner
                  docType="wwcc"
                  label="Scan WWCC"
                  existingImageUrl={wwccImageUrl}
                  onScanned={(data, url, docName) => {
                    if (data.wwcc_number) setWwccNumber(data.wwcc_number as string);
                    if (data.wwcc_expiry) setWwccExpiry(data.wwcc_expiry as string);
                    if (url) setWwccImageUrl(url);
                    if (docName) setVerifiedName(docName);
                    showToast('WWCC details extracted from image!');
                  }}
                />
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">Required if instructing learners under 18 years of age.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">WWCC Number</label>
                  <input type="text" placeholder="e.g. WWC-1234567" value={wwccNumber} onChange={(e) => setWwccNumber(e.target.value)} className="bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Expiry Date</label>
                  <input type="date" value={wwccExpiry} onChange={(e) => setWwccExpiry(e.target.value)} className="bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* National Police Check */}
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(15,23,42,0.04)] border border-outline-variant/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">National Police Check</h3>
                <DocumentScanner
                  docType="police_check"
                  label="Scan Certificate"
                  existingImageUrl={policeCheckImageUrl}
                  onScanned={(data, url, docName) => {
                    if (data.police_check_date) setPoliceCheckDate(data.police_check_date as string);
                    if (url) setPoliceCheckImageUrl(url);
                    if (docName) setVerifiedName(docName);
                    showToast('Police check date extracted from image!');
                  }}
                />
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">Must be no more than 3 months old for initial applications in most states.</p>
              <div className="flex flex-col gap-1.5 max-w-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Date of Check</label>
                <input type="date" value={policeCheckDate} onChange={(e) => setPoliceCheckDate(e.target.value)} className="bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
            </div>

            {/* Medical Assessment */}
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(15,23,42,0.04)] border border-outline-variant/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Medical Assessment</h3>
                <DocumentScanner
                  docType="medical_assessment"
                  label="Scan Form"
                  existingImageUrl={medAssessmentImageUrl}
                  onScanned={(data, url, docName) => {
                    if (data.medical_assessment_date) setMedAssessmentDate(data.medical_assessment_date as string);
                    if (data.medical_assessment_expiry) setMedAssessmentExpiry(data.medical_assessment_expiry as string);
                    if (url) setMedAssessmentImageUrl(url);
                    if (docName) setVerifiedName(docName);
                    showToast('Medical assessment details extracted from image!');
                  }}
                />
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">Commercial vehicle fitness-to-drive assessment. Typically required every 3 years.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Assessment Date</label>
                  <input type="date" value={medAssessmentDate} onChange={(e) => setMedAssessmentDate(e.target.value)} className="bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Expiry Date</label>
                  <input type="date" value={medAssessmentExpiry} onChange={(e) => setMedAssessmentExpiry(e.target.value)} className="bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* Public Liability Insurance */}
            <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(15,23,42,0.04)] border border-outline-variant/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Public Liability Insurance</h3>
                <DocumentScanner
                  docType="public_liability"
                  label="Scan Certificate"
                  existingImageUrl={pubLiabImageUrl}
                  onScanned={(data, url, docName) => {
                    if (data.public_liability_provider) setPubLiabProvider(data.public_liability_provider as string);
                    if (data.public_liability_policy_number) setPubLiabPolicy(data.public_liability_policy_number as string);
                    if (data.public_liability_expiry) setPubLiabExpiry(data.public_liability_expiry as string);
                    if (url) setPubLiabImageUrl(url);
                    if (docName) setVerifiedName(docName);
                    showToast('Insurance details extracted from image!');
                  }}
                />
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">Required in some states (e.g. ACT requires $5M cover).</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Insurance Provider</label>
                  <input type="text" placeholder="e.g. AAMI" value={pubLiabProvider} onChange={(e) => setPubLiabProvider(e.target.value)} className="bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Policy Number</label>
                  <input type="text" placeholder="e.g. POL-123456" value={pubLiabPolicy} onChange={(e) => setPubLiabPolicy(e.target.value)} className="bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Expiry Date</label>
                  <input type="date" value={pubLiabExpiry} onChange={(e) => setPubLiabExpiry(e.target.value)} className="bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {toast && (
        <div className="fixed top-6 right-6 z-[60] bg-primary text-white px-5 py-3 rounded-xl shadow-lg font-label-md text-label-md animate-in fade-in">
          {toast}
        </div>
      )}

      <div className="h-full flex flex-col">
        <div className="sticky top-0 z-10 bg-surface border-b border-outline-variant/40 pt-6 pb-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Edit Profile</h1>
            {verifiedName && (
              <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Name verified — {verifiedName}
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-outline-variant/20">
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
                  className="bg-surface border border-outline-variant/60 rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            ))}
          </div>

          <div className="flex overflow-x-auto hide-scrollbar gap-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-label-md text-label-md whitespace-nowrap px-1 pb-3 transition-colors ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full pb-stack-lg pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Left Column */}
            <div className="lg:col-span-8 flex flex-col gap-gutter">
              {renderTabContent()}
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

            {/* Verification Status */}
            <VerificationStatus
              formState={formState}
              onVerify={handleVerify}
              isVerified={isVerified}
            />
          </div>
        </div>

        {/* Status Banner */}
        {!isVerified && (
          <div className={`rounded-xl p-4 flex items-center gap-3 ${
            hasPendingReview
              ? 'bg-tertiary-fixed/20 text-on-tertiary-container border border-tertiary-fixed/30'
              : 'bg-surface-container border border-outline-variant/30'
          }`}>
            <span className="material-symbols-outlined text-[20px]">
              {hasPendingReview ? 'schedule' : 'edit_note'}
            </span>
            <div className="flex-1">
              <p className="font-label-md text-label-md font-medium">
                {hasPendingReview
                  ? 'Your profile is under review'
                  : 'Your profile is not yet visible to learners'}
              </p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                {hasPendingReview
                  ? 'An admin is reviewing your profile. You will be notified once approved.'
                  : 'Complete your profile to 100% and submit for admin approval.'}
              </p>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-stack-lg flex justify-end gap-4 pt-6 border-t border-outline-variant/30">
          <button
            onClick={() => {
              setBioText('');
              setSpecialisesAnxiety(true);
              setAcceptsInternational(true);
              setLanguages(['English']);
              setVehicleMake('');
              setVehicleModel('');
              setVehicleYear(new Date().getFullYear());
              setVehicleRego('');
              setVehicleColor('');
              setDualControls(true);
              setDriversLicenceNumber('');
              setDriversLicenceExpiry('');
              setDriversLicenceImageUrl(null);
              setAdiRegNumber('');
              setAdiRegExpiry('');
              setAdiRegImageUrl(null);
              setCertIVReference('');
              setCertIVDate('');
              setCertIVImageUrl(null);
              setWwccNumber('');
              setWwccExpiry('');
              setWwccImageUrl(null);
              setPoliceCheckDate('');
              setPoliceCheckImageUrl(null);
              setMedAssessmentDate('');
              setMedAssessmentExpiry('');
              setMedAssessmentImageUrl(null);
              setPubLiabProvider('');
              setPubLiabPolicy('');
              setPubLiabExpiry('');
              setPubLiabImageUrl(null);
              showToast('Changes discarded.');
            }}
            className="bg-transparent text-primary hover:bg-surface-container border border-outline-variant rounded-lg px-6 py-2.5 font-label-md text-label-md transition-colors"
          >
            Discard Changes
          </button>
          {!isVerified && !hasPendingReview && (
            <button
              onClick={async () => {
                setSubmitLoading(true);
                try {
                  const res = await fetch('/api/portal/submit-review', { method: 'POST' });
                  if (res.ok) {
                    setHasPendingReview(true);
                    showToast('Profile submitted for review!');
                  } else {
                    const data = await res.json();
                    showToast(data.error || 'Failed to submit');
                  }
                } catch {
                  showToast('Failed to submit');
                } finally {
                  setSubmitLoading(false);
                }
              }}
              disabled={submitLoading}
              className="bg-tertiary-fixed text-on-tertiary-container hover:brightness-110 rounded-lg px-6 py-2.5 font-label-md text-label-md transition-all shadow-sm disabled:opacity-50"
            >
              {submitLoading ? 'Submitting...' : 'Submit for Review'}
            </button>
          )}
          <button
            onClick={async () => {
              setSavingProfile(true);
              try {
                const res = await fetch('/api/portal/profile', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    first_name: user?.firstName || '',
                    last_name: user?.lastName || '',
                    bio: bioText,
                    licence_types: licenceTypes,
                    transmission,
                    teaching_style: teachingStyle,
                    primary_learner_types: learnerTypes,
                    vehicle_transmission: transmissionType,
                    specialises_anxiety: specialisesAnxiety,
                    accepts_international: acceptsInternational,
                    languages,
                    vehicle_make: vehicleMake,
                    vehicle_model: vehicleModel,
                    vehicle_year: vehicleYear,
                    vehicle_rego: vehicleRego,
                    vehicle_color: vehicleColor,
                    dual_controls: dualControls,
                    drivers_licence_number: driversLicenceNumber,
                    drivers_licence_expiry: driversLicenceExpiry || null,
                    adi_registration: adiRegNumber,
                    adi_registration_expiry: adiRegExpiry || null,
                    certificate_iv_reference: certIVReference,
                    certificate_iv_date: certIVDate || null,
                    wwcc_number: wwccNumber,
                    wwcc_expiry: wwccExpiry || null,
                    police_check_date: policeCheckDate || null,
                    medical_assessment_date: medAssessmentDate || null,
                    medical_assessment_expiry: medAssessmentExpiry || null,
                    public_liability_provider: pubLiabProvider,
                    public_liability_policy_number: pubLiabPolicy,
                    public_liability_expiry: pubLiabExpiry || null,
                    drivers_licence_image_url: driversLicenceImageUrl,
                    adi_registration_image_url: adiRegImageUrl,
                    certificate_iv_image_url: certIVImageUrl,
                    wwcc_image_url: wwccImageUrl,
                    police_check_image_url: policeCheckImageUrl,
                    medical_assessment_image_url: medAssessmentImageUrl,
                    public_liability_image_url: pubLiabImageUrl,
                    vehicle_image_url: vehicleImageUrl,
                  }),
                });
                if (res.ok) {
                  showToast('Profile saved successfully!');
                } else {
                  const err = await res.json().catch(() => ({}));
                  showToast(err.error || 'Failed to save profile.');
                }
              } catch {
                showToast('Failed to save profile.');
              } finally {
                setSavingProfile(false);
              }
            }}
            disabled={savingProfile}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 py-2.5 font-label-md text-label-md transition-colors shadow-sm disabled:opacity-50"
          >
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
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
                <div className="bg-surface-container-highest text-primary rounded-lg p-2 flex items-center justify-center">
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
                       <input className="bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="e.g. 5" type="number" value={aiInputs.experience} onChange={(e) => setAiInputs({ ...aiInputs, experience: e.target.value })} />
                     </div>
                     <div className="flex flex-col gap-1.5">
                       <label className="font-label-sm text-label-sm text-on-surface-variant">Licence Types</label>
                       <select className="bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" value={aiInputs.licenceTypes} onChange={(e) => setAiInputs({ ...aiInputs, licenceTypes: e.target.value })}>
                         <option>Manual & Automatic</option>
                         <option>Automatic Only</option>
                         <option>Manual Only</option>
                       </select>
                     </div>
                     <div className="flex flex-col gap-1.5">
                       <label className="font-label-sm text-label-sm text-on-surface-variant">Teaching Style</label>
                       <select className="bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" value={aiInputs.teachingStyle} onChange={(e) => setAiInputs({ ...aiInputs, teachingStyle: e.target.value })}>
                         <option>Patient & Calm</option>
                         <option>Structured & Strict</option>
                         <option>Adaptable & Fun</option>
                       </select>
                     </div>
                     <div className="flex flex-col gap-1.5">
                       <label className="font-label-sm text-label-sm text-on-surface-variant">Primary Learner Types</label>
                       <input className="bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="e.g. Anxious beginners, Teens" type="text" value={aiInputs.learnerTypes} onChange={(e) => setAiInputs({ ...aiInputs, learnerTypes: e.target.value })} />
                     </div>
                   </div>
                   <div className="flex flex-col gap-1.5">
                     <label className="font-label-sm text-label-sm text-on-surface-variant">Specialisations</label>
                     <input className="bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="e.g. Defensive driving, intensive courses" type="text" value={aiInputs.specialisations} onChange={(e) => setAiInputs({ ...aiInputs, specialisations: e.target.value })} />
                   </div>
                   <div className="flex flex-col gap-1.5">
                     <label className="font-label-sm text-label-sm text-on-surface-variant">What are you most proud of as an instructor?</label>
                     <textarea className="bg-surface border border-outline-variant/60 rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none" placeholder="e.g. High first-time pass rate, helping very nervous students." rows={2} value={aiInputs.proudest} onChange={(e) => setAiInputs({ ...aiInputs, proudest: e.target.value })}></textarea>
                   </div>
                </div>
              )}

              {aiStep === 'loading' && (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <span className="material-symbols-outlined animate-spin text-primary text-[32px]">sync</span>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Crafting your professional story...</p>
                </div>
              )}

              {aiStep === 'preview' && (
                <div className="flex flex-col gap-4">
                  <div className="bg-surface border border-primary/30 rounded-xl p-5 relative">
                    <div className="absolute -top-3 left-4 bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Draft 1</div>
                    <p className="font-body-md text-body-md text-on-surface leading-relaxed mt-2">{aiBioPreview}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low flex justify-end gap-3 rounded-b-2xl">
              {aiStep === 'input' && (
                <div className="flex gap-3 w-full justify-end">
                  <button onClick={toggleAIModal} className="text-primary hover:bg-surface-container px-4 py-2 rounded-lg font-label-md text-label-md transition-colors">Cancel</button>
                  <button onClick={generateBio} className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-label-md text-label-md transition-colors flex items-center gap-2 shadow-sm">
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
                      onClick={() => {
                        toggleAIModal();
                        showToast('Bio copied to editor. You can now edit it manually.');
                      }}
                      className="border border-outline-variant text-primary hover:bg-surface-container px-4 py-2 rounded-lg font-label-md text-label-md transition-colors"
                    >
                      Edit in Canvas
                    </button>
                    <button
                      onClick={() => { applyBio(aiBioPreview); }}
                      className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-label-md text-label-md transition-colors shadow-sm"
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
