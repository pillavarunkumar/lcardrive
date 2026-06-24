'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import DocumentScanner from '@/components/DocumentScanner';
import type { Instructor } from '@/types';

export default function PortalProfile() {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [hasPendingReview, setHasPendingReview] = useState(false);

  const [bioText, setBioText] = useState('');
  const [learnerTypes, setLearnerTypes] = useState('');
  const [yearsExp, setYearsExp] = useState(10);
  const [mobileNumber, setMobileNumber] = useState('');
  const [gender, setGender] = useState('male');
  const [profileCompleteness, setProfileCompleteness] = useState(85);
  const [licenceTypes, setLicenceTypes] = useState<string[]>(['car']);
  const [transmission, setTransmission] = useState('both');
  const [teachingStyle, setTeachingStyle] = useState('Patient & Calm');

  const [specialisesAnxiety, setSpecialisesAnxiety] = useState(true);
  const [acceptsInternational, setAcceptsInternational] = useState(true);
  const [languages, setLanguages] = useState<string[]>(['English']);
  const [langInput, setLangInput] = useState('');

  const [testCentres, setTestCentres] = useState<string[]>(['Bondi Junction', 'Marrickville']);
  const [socialWebsite, setSocialWebsite] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialFacebook, setSocialFacebook] = useState('');

  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState(new Date().getFullYear());
  const [vehicleRego, setVehicleRego] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [transmissionType, setTransmissionType] = useState('auto');
  const [dualControls, setDualControls] = useState(true);
  const [vehicleImageUrl, setVehicleImageUrl] = useState<string | null>(null);

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

  const [activeTab, setActiveTab] = useState('profile');

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiStep, setAiStep] = useState<'input' | 'loading' | 'preview'>('input');
  const [aiBioPreview, setAiBioPreview] = useState('');
  const [aiInputs, setAiInputs] = useState({ experience: '', licenceTypes: 'Manual & Automatic', teachingStyle: 'Patient & Calm', learnerTypes: '', specialisations: '', proudest: '' });

  const [aiExperience, setAiExperience] = useState('5-10 Years (Senior)');
  const [aiLicenseTypes, setAiLicenseTypes] = useState<string[]>(['Manual', 'Heavy Rigid (HR)']);
  const [aiTeachingStyles, setAiTeachingStyles] = useState<string[]>(['Patient & Calm', 'Highly Technical']);
  const [aiLearnerTypes, setAiLearnerTypes] = useState('Nervous beginners, International license transfers');
  const [aiAchievement, setAiAchievement] = useState('Over 1,000 successful students licensed in the Melbourne Metro area with a 98% first-time pass rate.');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/profile').then(r => r.json()),
      fetch('/api/portal/verify/status').then(r => r.json()).catch(() => ({})),
    ]).then(([d, v]) => {
      const inst: Instructor | null = d.instructor;
      if (!inst) return;
      setBioText(inst.bio || '');
      setLearnerTypes(inst.primary_learner_types || '');
      setLicenceTypes(inst.licence_types || ['car']);
      setTransmission(inst.transmission || 'both');
      setTeachingStyle(inst.teaching_style || 'Patient & Calm');
      setSpecialisesAnxiety(inst.specialises_anxiety || false);
      setAcceptsInternational(inst.accepts_international || false);
      setLanguages(inst.languages?.length ? inst.languages : ['English']);
      setYearsExp(inst.years_experience || 10);
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
      if (inst.service_suburbs) setTestCentres(inst.service_suburbs);
      if (inst.is_verified) setIsVerified(true);
      if (v.is_verified && v.verified_name) setVerifiedName(v.verified_name);
      setHasPendingReview(d.hasPendingReview || false);
      if (inst.profile_completeness) setProfileCompleteness(inst.profile_completeness);
    }).catch(() => {});
  }, []);

  const addLanguage = (l: string) => {
    if (!languages.includes(l)) setLanguages([...languages, l]);
    setLangInput('');
  };
  const removeLanguage = (l: string) => setLanguages(languages.filter((x) => x !== l));

  const toggleTestCentre = (tc: string) => {
    setTestCentres((prev) => prev.includes(tc) ? prev.filter((x) => x !== tc) : [...prev, tc]);
  };

  const toggleLicenceType = (t: string) => {
    setLicenceTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

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

  const generateBio = async () => {
    setAiStep('loading');
    setTimeout(() => {
      setAiBioPreview("Expertly guiding learners through the complexities of Victorian roads for nearly a decade, I offer a 'safety-first' technical curriculum that doesn't compromise on confidence. As a Senior Instructor specializing in Manual and Heavy Rigid licensing, my mission is to provide a stress-free learning environment for nervous students and seasoned drivers alike. My track record of 1,000+ successes proves that with the right technical foundation and a patient mentor, anyone can master the road.");
      setAiStep('preview');
    }, 1500);
  };

  const applyBio = () => {
    setBioText(aiBioPreview);
    setAiModalOpen(false);
    setAiStep('input');
    showToast('Bio applied to your profile.');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: bioText,
          primary_learner_types: learnerTypes,
          licence_types: licenceTypes,
          transmission,
          teaching_style: teachingStyle,
          specialises_anxiety: specialisesAnxiety,
          accepts_international: acceptsInternational,
          languages,
          years_experience: yearsExp,
          service_suburbs: testCentres,
          vehicle_make: vehicleMake,
          vehicle_model: vehicleModel,
          vehicle_year: vehicleYear,
          vehicle_rego: vehicleRego,
          vehicle_color: vehicleColor,
          vehicle_transmission: transmissionType,
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
          phone: mobileNumber,
          gender,
          social_website: socialWebsite,
          social_instagram: socialInstagram,
          social_facebook: socialFacebook,
        }),
      });
      if (res.ok) {
        showToast('Profile updated successfully!');
      } else {
        showToast('Failed to save.');
      }
    } catch {
      showToast('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setBioText('');
    setLanguages(['English']);
    setSpecialisesAnxiety(true);
    setAcceptsInternational(true);
    setTestCentres(['Bondi Junction', 'Marrickville']);
    setLicenceTypes(['car']);
    setTransmission('both');
    setTeachingStyle('Patient & Calm');
    setVehicleMake('');
    setVehicleModel('');
    setVehicleYear(new Date().getFullYear());
    setVehicleRego('');
    setVehicleColor('');
    setTransmissionType('auto');
    setDualControls(true);
    setDriversLicenceNumber('');
    setDriversLicenceExpiry('');
    setAdiRegNumber('');
    setAdiRegExpiry('');
    setCertIVReference('');
    setCertIVDate('');
    setWwccNumber('');
    setWwccExpiry('');
    setPoliceCheckDate('');
    setMedAssessmentDate('');
    setMedAssessmentExpiry('');
    setPubLiabProvider('');
    setPubLiabPolicy('');
    setPubLiabExpiry('');
    showToast('Changes discarded.');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'specialisations', label: 'Specialisations', icon: 'tune' },
    { id: 'vehicle', label: 'Vehicle', icon: 'directions_car' },
    { id: 'documents', label: 'Documents', icon: 'folder' },
  ];

  return (
    <>
      {toast && (
        <div className="fixed bottom-8 right-8 z-[60] bg-primary text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-400">check_circle</span>
            {toast}
          </div>
        </div>
      )}

      <form className="space-y-gutter" id="profile-editor" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
      <div className="max-w-6xl mx-auto">

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-gutter p-1.5 bg-surface-container-lowest rounded-xl border border-outline-variant overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-secondary hover:bg-surface-container hover:text-primary'
              }`}>
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Profile */}
        {activeTab === 'profile' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            <div className="md:col-span-7 xl:col-span-8">
              <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant h-full">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-headline-md font-headline-md text-primary flex items-center">
                    <span className="material-symbols-outlined mr-2">badge</span>
                    Personal Information
                  </h4>
                  {verifiedName && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-container/10 text-primary-container rounded-full text-[11px] font-bold">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      {verifiedName}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-label-sm font-bold text-secondary">Full Name</label>
                    <input type="text" value={`${user?.firstName || ''} ${user?.lastName || ''}`} readOnly
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-label-sm font-bold text-secondary">Mobile Number</label>
                    <input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="+61 000 000 000"
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-label-sm font-bold text-secondary">Years of Experience</label>
                    <div className="relative">
                      <input type="number" value={yearsExp} onChange={(e) => setYearsExp(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary text-sm">Years</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-label-sm font-bold text-secondary">Gender</label>
                    <div className="flex gap-2">
                      {['male', 'female', 'other'].map((g) => (
                        <label key={g} className="flex-1 cursor-pointer">
                          <input type="radio" name="gender" value={g} checked={gender === g} onChange={() => setGender(g)} className="hidden peer" />
                          <div className="text-center py-3 border border-outline-variant rounded-lg peer-checked:border-primary peer-checked:bg-primary-container/10 peer-checked:text-primary transition-all capitalize">{g}</div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 xl:col-span-4">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant text-center space-y-4 h-full flex flex-col justify-center">
                <div className="relative inline-block group">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-sm mx-auto">
                    <img alt="Profile" className="w-full h-full object-cover"
                      src={user?.imageUrl || 'https://lh3.googleusercontent.com/a/ACg8ocL4e96UEDCIshPGI6UJ-PeexiFbwBk0HTi0ewoY3eOwFw=s360-c'} />
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:opacity-90 transition-all shadow-lg" htmlFor="photo-upload">
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                  </label>
                  <input id="photo-upload" ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !user) return;
                      setUploadingPhoto(true);
                      try { await user.setProfileImage({ file }); showToast('Profile photo updated!'); }
                      catch { showToast('Failed to upload photo.'); }
                      finally { setUploadingPhoto(false); e.target.value = ''; }
                    }} />
                </div>
                <div>
                  <h3 className="text-headline-md font-headline-md text-primary">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-label-sm text-secondary">Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</p>
                </div>
                <div className="pt-4 border-t border-outline-variant">
                  <div className="flex justify-between text-label-sm mb-2">
                    <span className="text-secondary">Profile Strength</span>
                    <span className="text-primary font-bold">{profileCompleteness}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-500" style={{ width: `${profileCompleteness}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mt-gutter">
            <div className="md:col-span-7 xl:col-span-8">
              <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant h-full">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-headline-md font-headline-md text-primary flex items-center">
                    <span className="material-symbols-outlined mr-2">description</span>
                    About Me
                  </h4>
                  <button onClick={() => setAiModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary-container/10 text-primary rounded-full text-xs font-bold hover:bg-primary-container/20 transition-all">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    AI Bio
                  </button>
                </div>
                <textarea
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface resize-none custom-scrollbar"
                  placeholder="Tell students about your teaching style, philosophy, and background..." rows={6}
                  value={bioText} onChange={(e) => setBioText(e.target.value)} />
                <p className="mt-2 text-label-sm text-secondary text-right">{bioText.length} / 1000 characters</p>
              </div>
            </div>

            <div className="md:col-span-5 xl:col-span-4 space-y-gutter">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <h4 className="font-bold text-md text-primary flex items-center mb-4">
                  <span className="material-symbols-outlined mr-2">translate</span>
                  Languages
                </h4>
                <div className="flex flex-wrap gap-2">
                  {languages.map((l) => (
                    <span key={l} className="px-3 py-1 bg-primary text-white rounded-full text-sm flex items-center gap-1">
                      {l}
                      <span className="material-symbols-outlined text-xs cursor-pointer" onClick={() => removeLanguage(l)}>close</span>
                    </span>
                  ))}
                  <input type="text" placeholder="+ Add Language" value={langInput}
                    onChange={(e) => setLangInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && langInput.trim()) { e.preventDefault(); addLanguage(langInput.trim()); } }}
                    className="px-3 py-1 border border-dashed border-outline-variant rounded-full text-sm text-secondary hover:border-primary hover:text-primary transition-all bg-transparent outline-none w-28" />
                </div>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
                <h4 className="font-bold text-md text-primary flex items-center mb-4">
                  <span className="material-symbols-outlined mr-2">verified</span>
                  Toggles
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low cursor-pointer transition-all border border-transparent hover:border-outline-variant">
                    <span className="text-body-md">Anxiety Friendly</span>
                    <input type="checkbox" checked={specialisesAnxiety} onChange={() => setSpecialisesAnxiety(!specialisesAnxiety)} className="sr-only peer" aria-label="Anxiety friendly toggle" />
                    <div className="w-12 h-6 bg-secondary-container rounded-full peer-checked:bg-primary transition-colors relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6"></div>
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low cursor-pointer transition-all border border-transparent hover:border-outline-variant">
                    <span className="text-body-md">Intl. Licence Conversion</span>
                    <input type="checkbox" checked={acceptsInternational} onChange={() => setAcceptsInternational(!acceptsInternational)} className="sr-only peer" aria-label="International licence conversion toggle" />
                    <div className="w-12 h-6 bg-secondary-container rounded-full peer-checked:bg-primary transition-colors relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </>
        )}

        {/* Tab: Specialisations */}
        {activeTab === 'specialisations' && (
        <>
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant">
            <h4 className="text-headline-md font-headline-md text-primary flex items-center mb-6">
              <span className="material-symbols-outlined mr-2">tune</span>
              Specialisations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-label-sm font-bold text-secondary block mb-3">Licence Types Taught</label>
                  <div className="flex flex-wrap gap-2">
                    {['car', 'motorbike', 'truck', 'bus'].map((t) => (
                      <label key={t} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                        licenceTypes.includes(t) ? 'border-primary bg-primary/10' : 'border-outline-variant'
                      }`}>
                        <input type="checkbox" checked={licenceTypes.includes(t)} onChange={() => toggleLicenceType(t)} className="accent-primary rounded" />
                        <span className="text-sm font-medium text-on-surface capitalize">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-label-sm font-bold text-secondary block mb-3">Transmission Taught</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'both', label: 'Manual & Automatic' },
                      { value: 'auto', label: 'Automatic Only' },
                      { value: 'manual', label: 'Manual Only' },
                    ].map((t) => (
                      <label key={t.value} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                        transmission === t.value ? 'border-primary bg-primary/10' : 'border-outline-variant'
                      }`}>
                        <input type="radio" name="transmission" checked={transmission === t.value} onChange={() => setTransmission(t.value)} className="accent-primary" />
                        <span className="text-sm font-medium text-on-surface">{t.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-label-sm font-bold text-secondary block mb-3">Teaching Style</label>
                  <div className="flex flex-wrap gap-2">
                    {['Patient & Calm', 'Structured & Strict', 'Adaptable & Fun'].map((s) => (
                      <label key={s} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                        teachingStyle === s ? 'border-primary bg-primary/10' : 'border-outline-variant'
                      }`}>
                        <input type="radio" name="teachingStyle" checked={teachingStyle === s} onChange={() => setTeachingStyle(s)} className="accent-primary" />
                        <span className="text-sm font-medium text-on-surface">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-label-sm font-bold text-secondary block mb-3">Primary Learner Types</label>
                  <input type="text" placeholder="e.g. Anxious beginners, Teens, Seniors" value={learnerTypes}
                    onChange={(e) => setLearnerTypes(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mt-gutter">
            <div className="md:col-span-7 xl:col-span-8">
              <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant h-full">
                <h4 className="text-headline-md font-headline-md text-primary flex items-center mb-6">
                  <span className="material-symbols-outlined mr-2">location_on</span>
                  Preferred Test Centres
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {['Bondi Junction', 'Marrickville', 'Chatswood', 'Botany', 'Ryde', 'Hornsby', 'Penrith', 'Liverpool'].map((tc) => (
                    <label key={tc} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg cursor-pointer">
                      <input type="checkbox" checked={testCentres.includes(tc)} onChange={() => toggleTestCentre(tc)}
                        className="rounded border-outline-variant text-primary focus:ring-primary" />
                      <span className="text-sm">{tc}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-5 xl:col-span-4">
              <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant h-full">
                <h4 className="text-headline-md font-headline-md text-primary flex items-center mb-6">
                  <span className="material-symbols-outlined mr-2">share</span>
                  Social Links
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-surface-container text-secondary rounded-lg shrink-0">
                      <span className="material-symbols-outlined">language</span>
                    </div>
                    <input type="url" value={socialWebsite} onChange={(e) => setSocialWebsite(e.target.value)}
                      className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm" placeholder="Personal Website" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-surface-container text-secondary rounded-lg shrink-0">
                      <span className="material-symbols-outlined">camera_alt</span>
                    </div>
                    <input type="url" value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)}
                      className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm" placeholder="Instagram Profile" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-surface-container text-secondary rounded-lg shrink-0">
                      <span className="material-symbols-outlined">public</span>
                    </div>
                    <input type="url" value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)}
                      className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm" placeholder="Facebook Page" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
        )}

        {/* Tab: Vehicle */}
        {activeTab === 'vehicle' && (
        <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-headline-md font-headline-md text-primary flex items-center">
              <span className="material-symbols-outlined mr-2">directions_car</span>
              Vehicle Details
            </h4>
            <DocumentScanner
              docType="vehicle_registration"
              label=""
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-label-sm font-bold text-secondary">Make</label>
              <input type="text" placeholder="e.g. Toyota" value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-label-sm font-bold text-secondary">Model</label>
              <input type="text" placeholder="e.g. Corolla" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-label-sm font-bold text-secondary">Year</label>
              <input type="number" value={vehicleYear} onChange={(e) => setVehicleYear(parseInt(e.target.value) || new Date().getFullYear())}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-label-sm font-bold text-secondary">Registration</label>
              <input type="text" placeholder="ABC-123" value={vehicleRego} onChange={(e) => setVehicleRego(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-label-sm font-bold text-secondary">Colour</label>
              <input type="text" placeholder="e.g. White" value={vehicleColor} onChange={(e) => setVehicleColor(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
            </div>
            <div>
              <label className="text-label-sm font-bold text-secondary block mb-3">Transmission Type</label>
              <div className="flex gap-2">
                {[
                  { value: 'auto', label: 'Automatic' },
                  { value: 'manual', label: 'Manual' },
                  { value: 'both', label: 'Both' },
                ].map((t) => (
                  <label key={t.value} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                    transmissionType === t.value ? 'border-primary bg-primary/10' : 'border-outline-variant'
                  }`}>
                    <input type="radio" name="vehicleTransmission" checked={transmissionType === t.value} onChange={() => setTransmissionType(t.value)} className="accent-primary" />
                    <span className="text-sm font-medium text-on-surface">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <label className="flex items-center justify-between p-4 rounded-xl border border-outline-variant cursor-pointer hover:bg-surface-container-low transition-colors max-w-md mt-6">
            <div>
              <span className="text-sm font-bold text-on-surface block">Dual Controls Installed</span>
              <span className="text-xs text-on-surface-variant">Instructor brake pedals fitted</span>
            </div>
            <input type="checkbox" checked={dualControls} onChange={() => setDualControls(!dualControls)} className="sr-only peer" aria-label="Dual controls toggle" />
            <div className="w-12 h-6 bg-secondary-container rounded-full peer-checked:bg-primary transition-colors relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6"></div>
          </label>
        </div>
        )}

        {/* Tab: Documents */}
        {activeTab === 'documents' && (
        <div className="space-y-gutter">
          {/* Driver's Licence */}
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant">
            <div className="flex items-center justify-between mb-6">
              <h5 className="font-bold text-md text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">badge</span>
                Driver&apos;s Licence
              </h5>
              <DocumentScanner docType="drivers_licence" label="" existingImageUrl={driversLicenceImageUrl}
                onScanned={(data, url, docName) => {
                  if (data.licence_number) setDriversLicenceNumber(data.licence_number as string);
                  if (data.expiry_date) setDriversLicenceExpiry(data.expiry_date as string);
                  if (url) setDriversLicenceImageUrl(url);
                  if (docName) setVerifiedName(docName);
                  showToast('Licence details extracted from image!');
                }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-secondary">Licence Number</label>
                <input type="text" placeholder="e.g. 12345678" value={driversLicenceNumber} onChange={(e) => setDriversLicenceNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-secondary">Expiry Date</label>
                <input type="date" value={driversLicenceExpiry} onChange={(e) => setDriversLicenceExpiry(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
              </div>
            </div>
          </div>

          {/* ADI Registration */}
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant">
            <div className="flex items-center justify-between mb-6">
              <h5 className="font-bold text-md text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">assignment</span>
                ADI Registration
              </h5>
              <DocumentScanner docType="adi_registration" label="" existingImageUrl={adiRegImageUrl}
                onScanned={(data, url, docName) => {
                  if (data.adi_registration) setAdiRegNumber(data.adi_registration as string);
                  if (data.adi_registration_expiry) setAdiRegExpiry(data.adi_registration_expiry as string);
                  if (url) setAdiRegImageUrl(url);
                  if (docName) setVerifiedName(docName);
                  showToast('ADI details extracted from image!');
                }} />
            </div>
            <p className="text-sm text-on-surface-variant mb-4">Authorised Driving Instructor (ADI) registration issued by your state&apos;s regulator.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-secondary">ADI Registration Number</label>
                <input type="text" placeholder="e.g. ADI-123456" value={adiRegNumber} onChange={(e) => setAdiRegNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-secondary">Expiry Date</label>
                <input type="date" value={adiRegExpiry} onChange={(e) => setAdiRegExpiry(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
              </div>
            </div>
          </div>

          {/* Certificate IV */}
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant">
            <div className="flex items-center justify-between mb-6">
              <h5 className="font-bold text-md text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">school</span>
                Certificate IV in Driving Instruction
              </h5>
              <DocumentScanner docType="certificate_iv" label="" existingImageUrl={certIVImageUrl}
                onScanned={(data, url, docName) => {
                  if (data.certificate_iv_reference) setCertIVReference(data.certificate_iv_reference as string);
                  if (data.certificate_iv_date) setCertIVDate(data.certificate_iv_date as string);
                  if (url) setCertIVImageUrl(url);
                  if (docName) setVerifiedName(docName);
                  showToast('Certificate details extracted from image!');
                }} />
            </div>
            <p className="text-sm text-on-surface-variant mb-4">Nationally recognised TLI41222 (or equivalent) qualification.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-secondary">Certificate Reference</label>
                <input type="text" placeholder="e.g. CERT-98765" value={certIVReference} onChange={(e) => setCertIVReference(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-secondary">Date Issued</label>
                <input type="date" value={certIVDate} onChange={(e) => setCertIVDate(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
              </div>
            </div>
          </div>

          {/* Working with Children Check */}
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant">
            <div className="flex items-center justify-between mb-6">
              <h5 className="font-bold text-md text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">child_care</span>
                Working with Children Check
              </h5>
              <DocumentScanner docType="wwcc" label="" existingImageUrl={wwccImageUrl}
                onScanned={(data, url, docName) => {
                  if (data.wwcc_number) setWwccNumber(data.wwcc_number as string);
                  if (data.wwcc_expiry) setWwccExpiry(data.wwcc_expiry as string);
                  if (url) setWwccImageUrl(url);
                  if (docName) setVerifiedName(docName);
                  showToast('WWCC details extracted from image!');
                }} />
            </div>
            <p className="text-sm text-on-surface-variant mb-4">Required if instructing learners under 18 years of age.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-secondary">WWCC Number</label>
                <input type="text" placeholder="e.g. WWC-1234567" value={wwccNumber} onChange={(e) => setWwccNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-secondary">Expiry Date</label>
                <input type="date" value={wwccExpiry} onChange={(e) => setWwccExpiry(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
              </div>
            </div>
          </div>

          {/* National Police Check */}
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant">
            <div className="flex items-center justify-between mb-6">
              <h5 className="font-bold text-md text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">security</span>
                National Police Check
              </h5>
              <DocumentScanner docType="police_check" label="" existingImageUrl={policeCheckImageUrl}
                onScanned={(data, url, docName) => {
                  if (data.police_check_date) setPoliceCheckDate(data.police_check_date as string);
                  if (url) setPoliceCheckImageUrl(url);
                  if (docName) setVerifiedName(docName);
                  showToast('Police check date extracted from image!');
                }} />
            </div>
            <p className="text-sm text-on-surface-variant mb-4">Must be no more than 3 months old for initial applications in most states.</p>
            <div className="max-w-xs flex flex-col gap-1.5">
              <label className="text-label-sm font-bold text-secondary">Date of Check</label>
              <input type="date" value={policeCheckDate} onChange={(e) => setPoliceCheckDate(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
            </div>
          </div>

          {/* Medical Assessment */}
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant">
            <div className="flex items-center justify-between mb-6">
              <h5 className="font-bold text-md text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">stethoscope</span>
                Medical Assessment
              </h5>
              <DocumentScanner docType="medical_assessment" label="" existingImageUrl={medAssessmentImageUrl}
                onScanned={(data, url, docName) => {
                  if (data.medical_assessment_date) setMedAssessmentDate(data.medical_assessment_date as string);
                  if (data.medical_assessment_expiry) setMedAssessmentExpiry(data.medical_assessment_expiry as string);
                  if (url) setMedAssessmentImageUrl(url);
                  if (docName) setVerifiedName(docName);
                  showToast('Medical assessment details extracted from image!');
                }} />
            </div>
            <p className="text-sm text-on-surface-variant mb-4">Commercial vehicle fitness-to-drive assessment. Typically required every 3 years.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-secondary">Assessment Date</label>
                <input type="date" value={medAssessmentDate} onChange={(e) => setMedAssessmentDate(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-secondary">Expiry Date</label>
                <input type="date" value={medAssessmentExpiry} onChange={(e) => setMedAssessmentExpiry(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
              </div>
            </div>
          </div>

          {/* Public Liability Insurance */}
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant">
            <div className="flex items-center justify-between mb-6">
              <h5 className="font-bold text-md text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">verified_user</span>
                Public Liability Insurance
              </h5>
              <DocumentScanner docType="public_liability" label="" existingImageUrl={pubLiabImageUrl}
                onScanned={(data, url, docName) => {
                  if (data.public_liability_provider) setPubLiabProvider(data.public_liability_provider as string);
                  if (data.public_liability_policy_number) setPubLiabPolicy(data.public_liability_policy_number as string);
                  if (data.public_liability_expiry) setPubLiabExpiry(data.public_liability_expiry as string);
                  if (url) setPubLiabImageUrl(url);
                  if (docName) setVerifiedName(docName);
                  showToast('Insurance details extracted from image!');
                }} />
            </div>
            <p className="text-sm text-on-surface-variant mb-4">Required in some states (e.g. ACT requires $5M cover).</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-secondary">Insurance Provider</label>
                <input type="text" placeholder="e.g. AAMI" value={pubLiabProvider} onChange={(e) => setPubLiabProvider(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-secondary">Policy Number</label>
                <input type="text" placeholder="e.g. POL-123456" value={pubLiabPolicy} onChange={(e) => setPubLiabPolicy(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm font-bold text-secondary">Expiry Date</label>
                <input type="date" value={pubLiabExpiry} onChange={(e) => setPubLiabExpiry(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface" />
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Verification Status Banner */}
        {!isVerified && (
          <div className={`rounded-xl p-4 flex items-center gap-3 mt-gutter ${
            hasPendingReview
              ? 'bg-tertiary-fixed/20 text-on-tertiary-container border border-tertiary-fixed/30'
              : 'bg-surface-container border border-outline-variant/30'
          }`}>
            <span className="material-symbols-outlined text-[20px]">
              {hasPendingReview ? 'schedule' : 'edit_note'}
            </span>
            <div className="flex-1">
              <p className="font-bold text-sm">
                {hasPendingReview ? 'Your profile is under review' : 'Your profile is not yet visible to learners'}
              </p>
              <p className="text-xs text-on-surface-variant">
                {hasPendingReview
                  ? 'An admin is reviewing your profile. You will be notified once approved.'
                  : 'Complete your profile to 100% and submit for admin approval.'}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 py-10 border-t border-outline-variant/30 mt-gutter">
          <button type="button" onClick={handleReset}
            className="px-8 py-3 text-secondary font-bold hover:text-primary transition-colors rounded-lg">
            Discard Changes
          </button>
          {!isVerified && !hasPendingReview && (
            <button
              onClick={async () => {
                setSubmitLoading(true);
                try {
                  const res = await fetch('/api/portal/submit-review', { method: 'POST' });
                  if (res.ok) { setHasPendingReview(true); showToast('Profile submitted for review!'); }
                  else { const data = await res.json(); showToast(data.error || 'Failed to submit'); }
                } catch { showToast('Failed to submit'); }
                finally { setSubmitLoading(false); }
              }}
              disabled={submitLoading}
              className="px-8 py-3 bg-tertiary-fixed text-on-tertiary-container font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
            >
              {submitLoading ? 'Submitting...' : 'Submit for Review'}
            </button>
          )}
          <button type="submit" disabled={saving}
            className="px-10 py-3 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/10 hover:translate-y-[-2px] transition-all active:scale-95 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
      </form>

      {/* AI Bio Generator Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => { setAiModalOpen(false); setAiStep('input'); }} />
          <div className="relative bg-surface rounded-3xl w-full max-w-5xl max-h-[921px] overflow-hidden flex flex-col shadow-2xl border border-outline-variant">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </div>
                <div>
                  <h2 className="text-headline-md font-headline-md text-primary leading-tight">AI Bio Architect</h2>
                  <p className="text-label-sm text-secondary uppercase tracking-widest">Powered by Kinetic Precision</p>
                </div>
              </div>
              <button className="p-2 hover:bg-surface-container-highest rounded-full transition-colors"
                onClick={() => { setAiModalOpen(false); setAiStep('input'); }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-gutter grid grid-cols-1 lg:grid-cols-2 gap-gutter bg-background">
              <div className="space-y-8">
                <div>
                  <h4 className="font-bold text-on-surface mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-[12px] flex items-center justify-center">1</span>
                    Your Professional Details
                  </h4>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-label-sm font-label-sm text-on-surface-variant mb-2 uppercase">Years of Experience</label>
                      <select value={aiExperience} onChange={(e) => setAiExperience(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-body-md">
                        <option>1-3 Years (Foundational)</option>
                        <option>5-10 Years (Senior)</option>
                        <option>15+ Years (Expert)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-label-sm font-label-sm text-on-surface-variant mb-2 uppercase">License Types &amp; Specialties</label>
                      <div className="flex flex-wrap gap-2">
                        {['Manual', 'Automatic', 'Heavy Rigid (HR)', 'Defensive Driving'].map((lt) => {
                          const selected = aiLicenseTypes.includes(lt);
                          return (
                            <button key={lt} onClick={() => setAiLicenseTypes((prev) => prev.includes(lt) ? prev.filter((x) => x !== lt) : [...prev, lt])}
                              className={`px-4 py-2 rounded-full border text-label-sm font-bold transition-all ${
                                selected ? 'border-primary bg-primary-fixed text-on-primary-fixed-variant' : 'border-outline-variant hover:border-primary text-on-surface-variant'
                              }`}>{lt}</button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-label-sm font-label-sm text-on-surface-variant mb-2 uppercase">Your Teaching Style</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Patient & Calm', 'Highly Technical', 'Humor-led', 'Fast-paced'].map((ts) => {
                          const selected = aiTeachingStyles.includes(ts);
                          return (
                            <label key={ts} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-surface-container transition-all ${
                              selected ? 'border-primary bg-primary-fixed/20' : 'border-outline-variant'
                            }`}>
                              <input type="checkbox" checked={selected}
                                onChange={() => setAiTeachingStyles((prev) => prev.includes(ts) ? prev.filter((x) => x !== ts) : [...prev, ts])}
                                className="w-5 h-5 rounded text-primary focus:ring-primary" />
                              <span className="text-body-md">{ts}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-label-sm font-label-sm text-on-surface-variant mb-2 uppercase">Ideal Learner Types</label>
                      <input type="text" value={aiLearnerTypes} onChange={(e) => setAiLearnerTypes(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-body-md"
                        placeholder="e.g. Nervous beginners, corporate training..." />
                    </div>
                    <div>
                      <label className="block text-label-sm font-label-sm text-on-surface-variant mb-2 uppercase">Key Achievement</label>
                      <textarea value={aiAchievement} onChange={(e) => setAiAchievement(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-body-md h-24"
                        placeholder="e.g. 95% first-time pass rate for 2023..." />
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:border-l border-outline-variant lg:pl-gutter space-y-6">
                <h4 className="font-bold text-on-surface flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-[12px] flex items-center justify-center">2</span>
                  Generated Result
                </h4>
                <div className="relative group">
                  {aiStep === 'loading' && (
                    <div className="absolute inset-0 bg-surface/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-4 rounded-xl">
                      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <p className="font-bold text-primary">Crafting your professional story...</p>
                    </div>
                  )}
                  <div className="bg-surface-container-lowest border border-primary/20 rounded-xl p-6 min-h-[440px] shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary/10">
                      <div className={`h-full bg-primary transition-all duration-300 ${aiStep === 'loading' ? 'w-3/4' : aiStep === 'preview' ? 'w-full' : 'w-0'}`}></div>
                    </div>
                    <textarea className="w-full h-[380px] bg-transparent border-none focus:ring-0 text-body-md leading-relaxed resize-none text-on-surface"
                      placeholder="Your AI-generated bio will appear here..." value={aiBioPreview}
                      onChange={(e) => setAiBioPreview(e.target.value)} spellCheck={false} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={generateBio}
                    className="flex items-center justify-center gap-2 py-4 border border-primary text-primary font-bold rounded-xl hover:bg-primary-container/10 transition-all active:scale-95">
                    <span className="material-symbols-outlined">refresh</span> Regenerate
                  </button>
                  <button onClick={applyBio} disabled={aiStep !== 'preview'}
                    className="flex items-center justify-center gap-2 py-4 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-container shadow-lg transition-all active:scale-95 disabled:opacity-50">
                    <span className="material-symbols-outlined">check_circle</span> Use This Bio
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-surface-container-low border-t border-outline-variant flex justify-between items-center">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                <p className="text-label-sm">AI results may vary. Always review and edit for accuracy.</p>
              </div>
              <button onClick={generateBio}
                className="bg-primary-container text-on-primary-container px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary hover:text-on-primary transition-all">
                <span className="material-symbols-outlined">auto_awesome</span> Generate Bio
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
