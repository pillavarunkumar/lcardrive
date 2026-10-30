'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import DocumentScanner from '@/components/DocumentScanner';
import type { PackageOption } from '@/types';
import {
  EMPTY_BUSINESS_INFO,
  ONBOARDING_STEPS,
  type ApprovalStatus,
  type BusinessInfo,
  type OnboardingChecks,
  type OnboardingStep,
} from '@/lib/onboarding';

const AU_STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'];
const WEEKDAYS = [
  { code: 'Mon', label: 'Monday' },
  { code: 'Tue', label: 'Tuesday' },
  { code: 'Wed', label: 'Wednesday' },
  { code: 'Thu', label: 'Thursday' },
  { code: 'Fri', label: 'Friday' },
  { code: 'Sat', label: 'Saturday' },
  { code: 'Sun', label: 'Sunday' },
];

const STEPS: Array<{
  id: OnboardingStep;
  title: string;
  short: string;
  icon: string;
  description: string;
}> = [
  {
    id: 'account',
    title: 'Account & email',
    short: 'Account',
    icon: 'mark_email_read',
    description: 'Confirm the verified email address and name attached to your account.',
  },
  {
    id: 'personal',
    title: 'Personal information',
    short: 'Personal',
    icon: 'person',
    description: 'Tell learners who you are and where you are based.',
  },
  {
    id: 'business',
    title: 'Business information',
    short: 'Business',
    icon: 'business_center',
    description: 'Add the trading details learners and administrators will see on your application.',
  },
  {
    id: 'qualifications',
    title: 'Qualifications & checks',
    short: 'Qualifications',
    icon: 'workspace_premium',
    description: 'Enter your ADI, licence and Certificate IV details, and upload supporting documents.',
  },
  {
    id: 'vehicle',
    title: 'Vehicle details',
    short: 'Vehicle',
    icon: 'directions_car',
    description: 'Add the dual-control vehicle you will teach in.',
  },
  {
    id: 'locations',
    title: 'Service locations',
    short: 'Locations',
    icon: 'map',
    description: 'Choose the suburbs and radius you can teach in.',
  },
  {
    id: 'rates',
    title: 'Hourly rate',
    short: 'Rates',
    icon: 'payments',
    description: 'Set the hourly rate shown on your public profile.',
  },
  {
    id: 'availability',
    title: 'Availability',
    short: 'Availability',
    icon: 'calendar_month',
    description: 'Choose the days and times you usually teach.',
  },
  {
    id: 'review',
    title: 'Review & submit',
    short: 'Review',
    icon: 'fact_check',
    description: 'Check your application and submit it for administrator approval.',
  },
];

const inputClass =
  'w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition-all focus:border-primary-container focus:ring-2 focus:ring-primary-container/20';
const labelClass =
  'mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant';

interface FormState {
  first_name: string;
  last_name: string;
  phone: string;
  suburb: string;
  state: string;
  postcode: string;
  gender: string;
  years_experience: number;
  languages: string[];
  bio: string;
  teaching_style: string;
  primary_learner_types: string;

  adi_registration: string;
  adi_registration_expiry: string;
  drivers_licence_number: string;
  drivers_licence_expiry: string;
  certificate_iv_reference: string;
  certificate_iv_date: string;
  wwcc_number: string;
  wwcc_expiry: string;
  police_check_date: string;
  medical_assessment_date: string;
  medical_assessment_expiry: string;
  public_liability_provider: string;
  public_liability_policy_number: string;
  public_liability_expiry: string;
  drivers_licence_image_url: string;
  adi_registration_image_url: string;
  certificate_iv_image_url: string;
  wwcc_image_url: string;
  police_check_image_url: string;
  medical_assessment_image_url: string;
  public_liability_image_url: string;

  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_rego: string;
  vehicle_color: string;
  vehicle_transmission: string;
  dual_controls: boolean;
  vehicle_image_url: string;

  service_suburbs: string[];
  service_radius_km: number;
  familiar_test_centres: string[];

  hourly_rate: number;
  package_options: PackageOption[];
}

interface AvailabilityDay {
  enabled: boolean;
  start: string;
  end: string;
}

interface OnboardingPayload {
  instructor: Record<string, unknown>;
  business: BusinessInfo;
  onboarding: {
    status: ApprovalStatus;
    step: OnboardingStep;
    nextStep: OnboardingStep;
    checks: OnboardingChecks;
    allComplete: boolean;
    canSubmit: boolean;
    hasPendingReview: boolean;
    submittedAt?: string | null;
    reviewedAt?: string | null;
    reviewNote?: string | null;
  };
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function number(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function emptyForm(): FormState {
  return {
    first_name: '',
    last_name: '',
    phone: '',
    suburb: '',
    state: 'VIC',
    postcode: '',
    gender: '',
    years_experience: 0,
    languages: ['English'],
    bio: '',
    teaching_style: '',
    primary_learner_types: '',
    adi_registration: '',
    adi_registration_expiry: '',
    drivers_licence_number: '',
    drivers_licence_expiry: '',
    certificate_iv_reference: '',
    certificate_iv_date: '',
    wwcc_number: '',
    wwcc_expiry: '',
    police_check_date: '',
    medical_assessment_date: '',
    medical_assessment_expiry: '',
    public_liability_provider: '',
    public_liability_policy_number: '',
    public_liability_expiry: '',
    drivers_licence_image_url: '',
    adi_registration_image_url: '',
    certificate_iv_image_url: '',
    wwcc_image_url: '',
    police_check_image_url: '',
    medical_assessment_image_url: '',
    public_liability_image_url: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: new Date().getFullYear(),
    vehicle_rego: '',
    vehicle_color: '',
    vehicle_transmission: 'auto',
    dual_controls: true,
    vehicle_image_url: '',
    service_suburbs: [],
    service_radius_km: 10,
    familiar_test_centres: [],
    hourly_rate: 70,
    package_options: [],
  };
}

function buildForm(instructor: Record<string, unknown> | null | undefined): FormState {
  const row = instructor || {};
  return {
    first_name: text(row.first_name),
    last_name: text(row.last_name),
    phone: text(row.phone),
    suburb: text(row.suburb) === 'Unknown' ? '' : text(row.suburb),
    state: text(row.state) || 'VIC',
    postcode: text(row.postcode),
    gender: text(row.gender),
    years_experience: number(row.years_experience),
    languages: stringArray(row.languages).length ? stringArray(row.languages) : ['English'],
    bio: text(row.bio),
    teaching_style: text(row.teaching_style),
    primary_learner_types: text(row.primary_learner_types),
    adi_registration: text(row.adi_registration),
    adi_registration_expiry: text(row.adi_registration_expiry),
    drivers_licence_number: text(row.drivers_licence_number),
    drivers_licence_expiry: text(row.drivers_licence_expiry),
    certificate_iv_reference: text(row.certificate_iv_reference),
    certificate_iv_date: text(row.certificate_iv_date),
    wwcc_number: text(row.wwcc_number),
    wwcc_expiry: text(row.wwcc_expiry),
    police_check_date: text(row.police_check_date),
    medical_assessment_date: text(row.medical_assessment_date),
    medical_assessment_expiry: text(row.medical_assessment_expiry),
    public_liability_provider: text(row.public_liability_provider),
    public_liability_policy_number: text(row.public_liability_policy_number),
    public_liability_expiry: text(row.public_liability_expiry),
    drivers_licence_image_url: text(row.drivers_licence_image_url),
    adi_registration_image_url: text(row.adi_registration_image_url),
    certificate_iv_image_url: text(row.certificate_iv_image_url),
    wwcc_image_url: text(row.wwcc_image_url),
    police_check_image_url: text(row.police_check_image_url),
    medical_assessment_image_url: text(row.medical_assessment_image_url),
    public_liability_image_url: text(row.public_liability_image_url),
    vehicle_make: text(row.vehicle_make),
    vehicle_model: text(row.vehicle_model),
    vehicle_year: number(row.vehicle_year, new Date().getFullYear()),
    vehicle_rego: text(row.vehicle_rego),
    vehicle_color: text(row.vehicle_color),
    vehicle_transmission: text(row.vehicle_transmission) || text(row.transmission) || 'auto',
    dual_controls: row.dual_controls !== false,
    vehicle_image_url: text(row.vehicle_image_url),
    service_suburbs: stringArray(row.service_suburbs),
    service_radius_km: number(row.service_radius_km, 10),
    familiar_test_centres: stringArray(row.familiar_test_centres),
    hourly_rate: number(row.hourly_rate, 70),
    package_options: Array.isArray(row.package_options) ? (row.package_options as PackageOption[]) : [],
  };
}

function to12Hour(value: string): string {
  if (!value) return '';
  const [h, m] = value.split(':');
  const hour = Number.parseInt(h, 10);
  if (!Number.isFinite(hour) || !m) return '';
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${String(display).padStart(2, '0')}:${m} ${suffix}`;
}

function from12Hour(value: string): { start: string; end: string } | null {
  const match = value.match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)\s*(?:—|-|to)\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i,
  );
  if (!match) return null;
  const to24 = (h: string, m: string, ap: string) => {
    let hour = Number.parseInt(h, 10);
    if (ap.toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (ap.toUpperCase() === 'AM' && hour === 12) hour = 0;
    return `${String(hour).padStart(2, '0')}:${m}`;
  };
  return { start: to24(match[1], match[2], match[3]), end: to24(match[4], match[5], match[6]) };
}

function buildAvailability(instructor: Record<string, unknown>): Record<string, AvailabilityDay> {
  const slots = (instructor.availability_slots || {}) as Record<string, string[]>;
  const days = stringArray(instructor.availability_days);
  const out: Record<string, AvailabilityDay> = {};
  for (const day of WEEKDAYS) {
    const values = slots[day.code] || slots[day.label] || [];
    const parsed = values.length ? from12Hour(values[0]) : null;
    out[day.code] = {
      enabled: days.includes(day.code) || days.includes(day.label) || Boolean(parsed),
      start: parsed?.start || '08:00',
      end: parsed?.end || '18:00',
    };
  }
  return out;
}

function statusCopy(status: ApprovalStatus) {
  switch (status) {
    case 'approved':
      return { label: 'Approved', color: 'bg-green-50 text-green-700 border-green-200', icon: 'verified' };
    case 'pending_review':
      return { label: 'Under review', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'schedule' };
    case 'rejected':
      return { label: 'Changes requested', color: 'bg-red-50 text-red-700 border-red-200', icon: 'error' };
    default:
      return { label: 'Draft', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'edit_note' };
  }
}

export default function PortalOnboardingPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [business, setBusiness] = useState<BusinessInfo>(EMPTY_BUSINESS_INFO);
  const [availability, setAvailability] = useState<Record<string, AvailabilityDay>>(() =>
    buildAvailability({}),
  );
  const [checks, setChecks] = useState<OnboardingChecks | null>(null);
  const [status, setStatus] = useState<ApprovalStatus>('draft');
  const [reviewNote, setReviewNote] = useState<string | null>(null);
  const [instructor, setInstructor] = useState<Record<string, unknown> | null>(null);
  const [langInput, setLangInput] = useState('');
  const [suburbInput, setSuburbInput] = useState('');
  const [testCentreInput, setTestCentreInput] = useState('');

  const step = STEPS[currentStep];
  const stepCheck = step.id === 'review' ? null : checks?.[step.id] || null;

  function applyPayload(payload: OnboardingPayload) {
    setInstructor(payload.instructor || null);
    setBusiness(payload.business || EMPTY_BUSINESS_INFO);
    setChecks(payload.onboarding.checks);
    setStatus(payload.onboarding.status);
    setReviewNote(payload.onboarding.reviewNote || null);
  }

  useEffect(() => {
    let cancelled = false;
    fetch('/api/portal/onboarding')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not load your registration');
        return data as OnboardingPayload;
      })
      .then((payload) => {
        if (cancelled) return;
        applyPayload(payload);
        setForm(buildForm(payload.instructor));
        setAvailability(buildAvailability(payload.instructor || {}));
        const index = STEPS.findIndex((item) => item.id === payload.onboarding.step);
        setCurrentStep(index >= 0 ? index : 0);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load your registration');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const email = user?.primaryEmailAddress?.emailAddress || text(instructor?.email);
  const emailVerified =
    user?.primaryEmailAddress?.verification?.status === 'verified' ||
    Boolean(instructor?.email);

  const publicHref = useMemo(() => {
    const suburb = text(instructor?.suburb);
    const slug = text(instructor?.slug);
    if (!suburb || !slug) return '';
    return `/instructors/${suburb.toLowerCase().replace(/\s+/g, '-')}/${slug}`;
  }, [instructor]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addLanguage() {
    const value = langInput.trim();
    if (!value) return;
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.some((item) => item.toLowerCase() === value.toLowerCase())
        ? prev.languages
        : [...prev.languages, value],
    }));
    setLangInput('');
  }

  function addSuburb() {
    const value = suburbInput.trim();
    if (!value) return;
    setForm((prev) => ({
      ...prev,
      service_suburbs: prev.service_suburbs.some((item) => item.toLowerCase() === value.toLowerCase())
        ? prev.service_suburbs
        : [...prev.service_suburbs, value],
    }));
    setSuburbInput('');
  }

  function addTestCentre() {
    const value = testCentreInput.trim();
    if (!value) return;
    setForm((prev) => ({
      ...prev,
      familiar_test_centres: prev.familiar_test_centres.some(
        (item) => item.toLowerCase() === value.toLowerCase(),
      )
        ? prev.familiar_test_centres
        : [...prev.familiar_test_centres, value],
    }));
    setTestCentreInput('');
  }

  function stepData(stepId: OnboardingStep): Record<string, unknown> {
    switch (stepId) {
      case 'account':
        return { first_name: form.first_name, last_name: form.last_name };
      case 'personal':
        return {
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          suburb: form.suburb,
          state: form.state,
          postcode: form.postcode,
          gender: form.gender,
          years_experience: form.years_experience,
          languages: form.languages,
          bio: form.bio,
          teaching_style: form.teaching_style,
          primary_learner_types: form.primary_learner_types,
        };
      case 'business':
        return { ...business };
      case 'qualifications':
        return {
          adi_registration: form.adi_registration,
          adi_registration_expiry: form.adi_registration_expiry,
          drivers_licence_number: form.drivers_licence_number,
          drivers_licence_expiry: form.drivers_licence_expiry,
          certificate_iv_reference: form.certificate_iv_reference,
          certificate_iv_date: form.certificate_iv_date,
          wwcc_number: form.wwcc_number,
          wwcc_expiry: form.wwcc_expiry,
          police_check_date: form.police_check_date,
          medical_assessment_date: form.medical_assessment_date,
          medical_assessment_expiry: form.medical_assessment_expiry,
          public_liability_provider: form.public_liability_provider,
          public_liability_policy_number: form.public_liability_policy_number,
          public_liability_expiry: form.public_liability_expiry,
          drivers_licence_image_url: form.drivers_licence_image_url,
          adi_registration_image_url: form.adi_registration_image_url,
          certificate_iv_image_url: form.certificate_iv_image_url,
          wwcc_image_url: form.wwcc_image_url,
          police_check_image_url: form.police_check_image_url,
          medical_assessment_image_url: form.medical_assessment_image_url,
          public_liability_image_url: form.public_liability_image_url,
        };
      case 'vehicle':
        return {
          vehicle_make: form.vehicle_make,
          vehicle_model: form.vehicle_model,
          vehicle_year: form.vehicle_year,
          vehicle_rego: form.vehicle_rego,
          vehicle_color: form.vehicle_color,
          vehicle_transmission: form.vehicle_transmission,
          dual_controls: form.dual_controls,
          vehicle_image_url: form.vehicle_image_url,
        };
      case 'locations':
        return {
          suburb: form.suburb,
          state: form.state,
          postcode: form.postcode,
          service_suburbs: form.service_suburbs,
          service_radius_km: form.service_radius_km,
          familiar_test_centres: form.familiar_test_centres,
        };
      case 'rates':
        return {
          hourly_rate: form.hourly_rate,
          package_options: form.package_options,
        };
      case 'availability': {
        const days: string[] = [];
        const slots: Record<string, string[]> = {};
        for (const day of WEEKDAYS) {
          const value = availability[day.code];
          if (!value?.enabled) continue;
          if (!value.start || !value.end || value.start >= value.end) {
            throw new Error(`Choose a valid start and end time for ${day.label}`);
          }
          days.push(day.code);
          slots[day.code] = [`${to12Hour(value.start)} — ${to12Hour(value.end)}`];
        }
        return { availability_days: days, availability_slots: slots };
      }
      case 'review':
        return {};
    }
  }

  async function saveStep(stepId: OnboardingStep, advance: boolean): Promise<boolean> {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      let data: Record<string, unknown>;
      try {
        data = stepData(stepId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Check the form values');
        return false;
      }

      const res = await fetch('/api/portal/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: stepId, data }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.errors?.join(' • ') || payload.error || 'Could not save this step');
        return false;
      }
      applyPayload(payload as OnboardingPayload);
      if (advance && currentStep < STEPS.length - 1) {
        setCurrentStep((value) => value + 1);
      }
      setNotice('Progress saved.');
      return true;
    } catch {
      setError('Could not save this step. Please try again.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/portal/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit' }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.errors?.join(' • ') || payload.error || 'Could not submit your registration');
        return;
      }
      applyPayload(payload as OnboardingPayload);
      setNotice('Submitted for approval. We will email you once an administrator reviews it.');
    } catch {
      setError('Could not submit your registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-1/3 rounded bg-white" />
        <div className="h-32 rounded-2xl bg-white" />
        <div className="h-96 rounded-2xl bg-white" />
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error || 'Your instructor account could not be loaded. Please sign out and sign in again.'}
      </div>
    );
  }

  const copy = statusCopy(status);
  const isLocked = status === 'pending_review';

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
            Instructor registration
          </p>
          <h1 className="mt-1 text-headline-md font-bold text-on-surface">
            {status === 'approved' ? 'Your profile is approved' : 'Build your public instructor profile'}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
            Complete each step, save your progress, and submit once all requirements are met. Your
            profile becomes searchable after administrator approval.
          </p>
        </div>
        <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${copy.color}`}>
          <span className="material-symbols-outlined text-[16px]">{copy.icon}</span>
          {copy.label}
        </span>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      {notice && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {notice}
        </div>
      )}
      {status === 'rejected' && reviewNote && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-bold">Administrator note</p>
          <p className="mt-1">{reviewNote}</p>
        </div>
      )}
      {status === 'approved' && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          Your profile is approved and publicly searchable.
          {publicHref && (
            <Link href={publicHref} className="ml-2 font-bold underline">
              View public profile
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-1 rounded-2xl border border-outline-variant bg-white p-3 shadow-sm">
            {STEPS.map((item, index) => {
              const check = item.id === 'review' ? null : checks?.[item.id];
              const active = index === currentStep;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    active
                      ? 'bg-primary-container text-white'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      active
                        ? 'bg-white/20 text-white'
                        : check?.complete
                          ? 'bg-green-100 text-green-700'
                          : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {check?.complete && !active ? '✓' : index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{item.short}</span>
                    {check && !check.complete && !active && (
                      <span className="block truncate text-[10px] opacity-70">
                        {check.missing.length} item{check.missing.length === 1 ? '' : 's'} left
                      </span>
                    )}
                  </span>
                  <span className="material-symbols-outlined text-[18px] opacity-70">{item.icon}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex gap-2 overflow-x-auto rounded-2xl border border-outline-variant bg-white p-2 lg:hidden">
            {STEPS.map((item, index) => {
              const check = item.id === 'review' ? null : checks?.[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${
                    index === currentStep
                      ? 'bg-primary-container text-white'
                      : check?.complete
                        ? 'bg-green-50 text-green-700'
                        : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">{item.icon}</span>
                  {item.short}
                </button>
              );
            })}
          </div>

          <section className="rounded-2xl border border-outline-variant bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-container/10 text-primary-container">
                <span className="material-symbols-outlined">{step.icon}</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Step {currentStep + 1} of {STEPS.length}
                </p>
                <h2 className="text-lg font-bold text-on-surface">{step.title}</h2>
                <p className="mt-1 text-sm text-on-surface-variant">{step.description}</p>
              </div>
            </div>

            {stepCheck && !stepCheck.complete && stepCheck.missing.length > 0 && (
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <span className="font-bold">Still needed:</span> {stepCheck.missing.join(', ')}
              </div>
            )}

            {step.id === 'account' && (
              <div className="space-y-5">
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-700">mark_email_read</span>
                    <div>
                      <p className="text-sm font-bold text-green-900">Email verification</p>
                      <p className="mt-0.5 text-sm text-green-800">{email || 'No email on file'}</p>
                      <p className="mt-1 text-xs text-green-700">
                        {emailVerified
                          ? 'This email is verified. We will use it for approval notifications.'
                          : 'Verify your email from your Clerk account before submitting.'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>First name</label>
                    <input
                      className={inputClass}
                      value={form.first_name}
                      onChange={(event) => setField('first_name', event.target.value)}
                      placeholder="Your first name"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Last name</label>
                    <input
                      className={inputClass}
                      value={form.last_name}
                      onChange={(event) => setField('last_name', event.target.value)}
                      placeholder="Your last name"
                    />
                  </div>
                </div>
              </div>
            )}

            {step.id === 'personal' && (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>First name</label>
                    <input className={inputClass} value={form.first_name} onChange={(event) => setField('first_name', event.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Last name</label>
                    <input className={inputClass} value={form.last_name} onChange={(event) => setField('last_name', event.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Mobile number</label>
                    <input className={inputClass} type="tel" value={form.phone} onChange={(event) => setField('phone', event.target.value)} placeholder="+61 400 000 000" />
                  </div>
                  <div>
                    <label className={labelClass}>Gender</label>
                    <select className={inputClass} value={form.gender} onChange={(event) => setField('gender', event.target.value)}>
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Home suburb</label>
                    <input className={inputClass} value={form.suburb} onChange={(event) => setField('suburb', event.target.value)} placeholder="e.g. Footscray" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>State</label>
                      <select className={inputClass} value={form.state} onChange={(event) => setField('state', event.target.value)}>
                        {AU_STATES.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Postcode</label>
                      <input className={inputClass} inputMode="numeric" maxLength={4} value={form.postcode} onChange={(event) => setField('postcode', event.target.value.replace(/\D/g, ''))} placeholder="3011" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Years of experience</label>
                    <input className={inputClass} type="number" min={0} max={70} value={form.years_experience} onChange={(event) => setField('years_experience', Number(event.target.value) || 0)} />
                  </div>
                  <div>
                    <label className={labelClass}>Teaching style</label>
                    <input className={inputClass} value={form.teaching_style} onChange={(event) => setField('teaching_style', event.target.value)} placeholder="e.g. Patient and calm" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {form.languages.map((language) => (
                      <span key={language} className="inline-flex items-center gap-1 rounded-full bg-primary-container px-3 py-1 text-sm text-white">
                        {language}
                        <button type="button" onClick={() => setField('languages', form.languages.filter((item) => item !== language))} aria-label={`Remove ${language}`}>
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      className={inputClass}
                      value={langInput}
                      onChange={(event) => setLangInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addLanguage();
                        }
                      }}
                      placeholder="Add a language"
                    />
                    <button type="button" onClick={addLanguage} className="rounded-lg border border-outline-variant px-4 text-sm font-bold text-primary-container hover:bg-primary-container/5">
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Profile bio</label>
                  <textarea className={`${inputClass} min-h-[130px] resize-y`} maxLength={1000} value={form.bio} onChange={(event) => setField('bio', event.target.value)} placeholder="Tell learners about your teaching approach and experience." />
                  <p className="mt-1 text-right text-[11px] text-on-surface-variant">{form.bio.length} / 1000</p>
                </div>
                <div>
                  <label className={labelClass}>Primary learner types</label>
                  <input className={inputClass} value={form.primary_learner_types} onChange={(event) => setField('primary_learner_types', event.target.value)} placeholder="e.g. Nervous beginners, international licence holders" />
                </div>
              </div>
            )}

            {step.id === 'business' && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Business or trading name</label>
                  <input className={inputClass} value={business.business_name} onChange={(event) => setBusiness((prev) => ({ ...prev, business_name: event.target.value }))} placeholder="e.g. Safe Start Driving School" />
                </div>
                <div>
                  <label className={labelClass}>ABN (optional)</label>
                  <input className={inputClass} inputMode="numeric" maxLength={14} value={business.abn} onChange={(event) => setBusiness((prev) => ({ ...prev, abn: event.target.value.replace(/[^\d\s]/g, '') }))} placeholder="11 digit ABN" />
                </div>
                <div>
                  <label className={labelClass}>Business email</label>
                  <input className={inputClass} type="email" value={business.business_email} onChange={(event) => setBusiness((prev) => ({ ...prev, business_email: event.target.value }))} placeholder="bookings@example.com.au" />
                </div>
                <div>
                  <label className={labelClass}>Business phone</label>
                  <input className={inputClass} type="tel" value={business.business_phone} onChange={(event) => setBusiness((prev) => ({ ...prev, business_phone: event.target.value }))} placeholder="+61 3 0000 0000" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Business address</label>
                  <input className={inputClass} value={business.business_address} onChange={(event) => setBusiness((prev) => ({ ...prev, business_address: event.target.value }))} placeholder="Street, suburb, state and postcode" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Website or booking page (optional)</label>
                  <input className={inputClass} type="url" value={business.website} onChange={(event) => setBusiness((prev) => ({ ...prev, website: event.target.value }))} placeholder="https://" />
                </div>
              </div>
            )}

            {step.id === 'qualifications' && (
              <div className="space-y-5">
                <DocumentCard
                  title="Driver's licence"
                  icon="badge"
                  description="Enter your licence number and expiry, then upload a clear photo."
                  scanner={
                    <DocumentScanner
                      docType="drivers_licence"
                      label="Scan licence"
                      existingImageUrl={form.drivers_licence_image_url}
                      onScanned={(data, url) =>
                        setForm((prev) => ({
                          ...prev,
                          drivers_licence_number: text(data.licence_number) || prev.drivers_licence_number,
                          drivers_licence_expiry: text(data.expiry_date) || prev.drivers_licence_expiry,
                          drivers_licence_image_url: url || prev.drivers_licence_image_url,
                        }))
                      }
                    />
                  }
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Licence number</label>
                      <input className={inputClass} value={form.drivers_licence_number} onChange={(event) => setField('drivers_licence_number', event.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Expiry date</label>
                      <input className={inputClass} type="date" value={form.drivers_licence_expiry} onChange={(event) => setField('drivers_licence_expiry', event.target.value)} />
                    </div>
                  </div>
                </DocumentCard>

                <DocumentCard
                  title="ADI registration"
                  icon="assignment_ind"
                  description="Authorised Driving Instructor registration issued by your state regulator."
                  scanner={
                    <DocumentScanner
                      docType="adi_registration"
                      label="Scan ADI certificate"
                      existingImageUrl={form.adi_registration_image_url}
                      onScanned={(data, url) =>
                        setForm((prev) => ({
                          ...prev,
                          adi_registration: text(data.adi_registration) || prev.adi_registration,
                          adi_registration_expiry: text(data.adi_registration_expiry) || prev.adi_registration_expiry,
                          adi_registration_image_url: url || prev.adi_registration_image_url,
                        }))
                      }
                    />
                  }
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>ADI registration number</label>
                      <input className={inputClass} value={form.adi_registration} onChange={(event) => setField('adi_registration', event.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Expiry date</label>
                      <input className={inputClass} type="date" value={form.adi_registration_expiry} onChange={(event) => setField('adi_registration_expiry', event.target.value)} />
                    </div>
                  </div>
                </DocumentCard>

                <DocumentCard
                  title="Certificate IV in Driving Instruction"
                  icon="school"
                  description="TLI41222 or equivalent qualification."
                  scanner={
                    <DocumentScanner
                      docType="certificate_iv"
                      label="Scan certificate"
                      existingImageUrl={form.certificate_iv_image_url}
                      onScanned={(data, url) =>
                        setForm((prev) => ({
                          ...prev,
                          certificate_iv_reference: text(data.certificate_iv_reference) || prev.certificate_iv_reference,
                          certificate_iv_date: text(data.certificate_iv_date) || prev.certificate_iv_date,
                          certificate_iv_image_url: url || prev.certificate_iv_image_url,
                        }))
                      }
                    />
                  }
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Certificate reference</label>
                      <input className={inputClass} value={form.certificate_iv_reference} onChange={(event) => setField('certificate_iv_reference', event.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Date issued</label>
                      <input className={inputClass} type="date" value={form.certificate_iv_date} onChange={(event) => setField('certificate_iv_date', event.target.value)} />
                    </div>
                  </div>
                </DocumentCard>

                <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
                  <p className="text-sm font-bold text-on-surface">Additional checks (optional)</p>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Add these if they apply to you. They are visible to administrators reviewing your application.
                  </p>
                </div>

                <DocumentCard
                  title="Working with Children Check"
                  icon="child_care"
                  description="Required if you teach learners under 18."
                  scanner={
                    <DocumentScanner
                      docType="wwcc"
                      label="Scan WWCC"
                      existingImageUrl={form.wwcc_image_url}
                      onScanned={(data, url) =>
                        setForm((prev) => ({
                          ...prev,
                          wwcc_number: text(data.wwcc_number) || prev.wwcc_number,
                          wwcc_expiry: text(data.wwcc_expiry) || prev.wwcc_expiry,
                          wwcc_image_url: url || prev.wwcc_image_url,
                        }))
                      }
                    />
                  }
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>WWCC number</label>
                      <input className={inputClass} value={form.wwcc_number} onChange={(event) => setField('wwcc_number', event.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Expiry date</label>
                      <input className={inputClass} type="date" value={form.wwcc_expiry} onChange={(event) => setField('wwcc_expiry', event.target.value)} />
                    </div>
                  </div>
                </DocumentCard>

                <DocumentCard
                  title="National police check"
                  icon="security"
                  description="Usually issued within the last three months."
                  scanner={
                    <DocumentScanner
                      docType="police_check"
                      label="Scan police check"
                      existingImageUrl={form.police_check_image_url}
                      onScanned={(data, url) =>
                        setForm((prev) => ({
                          ...prev,
                          police_check_date: text(data.police_check_date) || prev.police_check_date,
                          police_check_image_url: url || prev.police_check_image_url,
                        }))
                      }
                    />
                  }
                >
                  <div className="max-w-xs">
                    <label className={labelClass}>Date of check</label>
                    <input className={inputClass} type="date" value={form.police_check_date} onChange={(event) => setField('police_check_date', event.target.value)} />
                  </div>
                </DocumentCard>

                <DocumentCard
                  title="Medical assessment"
                  icon="stethoscope"
                  description="Commercial vehicle fitness-to-drive assessment."
                  scanner={
                    <DocumentScanner
                      docType="medical_assessment"
                      label="Scan assessment"
                      existingImageUrl={form.medical_assessment_image_url}
                      onScanned={(data, url) =>
                        setForm((prev) => ({
                          ...prev,
                          medical_assessment_date: text(data.medical_assessment_date) || prev.medical_assessment_date,
                          medical_assessment_expiry: text(data.medical_assessment_expiry) || prev.medical_assessment_expiry,
                          medical_assessment_image_url: url || prev.medical_assessment_image_url,
                        }))
                      }
                    />
                  }
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Assessment date</label>
                      <input className={inputClass} type="date" value={form.medical_assessment_date} onChange={(event) => setField('medical_assessment_date', event.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Expiry date</label>
                      <input className={inputClass} type="date" value={form.medical_assessment_expiry} onChange={(event) => setField('medical_assessment_expiry', event.target.value)} />
                    </div>
                  </div>
                </DocumentCard>

                <DocumentCard
                  title="Public liability insurance"
                  icon="verified_user"
                  description="Required in some states."
                  scanner={
                    <DocumentScanner
                      docType="public_liability"
                      label="Scan policy"
                      existingImageUrl={form.public_liability_image_url}
                      onScanned={(data, url) =>
                        setForm((prev) => ({
                          ...prev,
                          public_liability_provider: text(data.public_liability_provider) || prev.public_liability_provider,
                          public_liability_policy_number: text(data.public_liability_policy_number) || prev.public_liability_policy_number,
                          public_liability_expiry: text(data.public_liability_expiry) || prev.public_liability_expiry,
                          public_liability_image_url: url || prev.public_liability_image_url,
                        }))
                      }
                    />
                  }
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className={labelClass}>Provider</label>
                      <input className={inputClass} value={form.public_liability_provider} onChange={(event) => setField('public_liability_provider', event.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Policy number</label>
                      <input className={inputClass} value={form.public_liability_policy_number} onChange={(event) => setField('public_liability_policy_number', event.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Expiry date</label>
                      <input className={inputClass} type="date" value={form.public_liability_expiry} onChange={(event) => setField('public_liability_expiry', event.target.value)} />
                    </div>
                  </div>
                </DocumentCard>
              </div>
            )}

            {step.id === 'vehicle' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-on-surface-variant">
                    Use the scanner to read the registration, or enter the details manually.
                  </p>
                  <DocumentScanner
                    docType="vehicle_registration"
                    label="Scan registration"
                    existingImageUrl={form.vehicle_image_url}
                    onScanned={(data, url) =>
                      setForm((prev) => ({
                        ...prev,
                        vehicle_make: text(data.vehicle_make) || prev.vehicle_make,
                        vehicle_model: text(data.vehicle_model) || prev.vehicle_model,
                        vehicle_year: number(data.vehicle_year, prev.vehicle_year),
                        vehicle_rego: text(data.vehicle_rego) || prev.vehicle_rego,
                        vehicle_color: text(data.vehicle_color) || prev.vehicle_color,
                        vehicle_image_url: url || prev.vehicle_image_url,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className={labelClass}>Make</label>
                    <input className={inputClass} value={form.vehicle_make} onChange={(event) => setField('vehicle_make', event.target.value)} placeholder="Toyota" />
                  </div>
                  <div>
                    <label className={labelClass}>Model</label>
                    <input className={inputClass} value={form.vehicle_model} onChange={(event) => setField('vehicle_model', event.target.value)} placeholder="Corolla" />
                  </div>
                  <div>
                    <label className={labelClass}>Year</label>
                    <input className={inputClass} type="number" min={1990} max={new Date().getFullYear() + 1} value={form.vehicle_year} onChange={(event) => setField('vehicle_year', Number(event.target.value) || new Date().getFullYear())} />
                  </div>
                  <div>
                    <label className={labelClass}>Registration</label>
                    <input className={inputClass} value={form.vehicle_rego} onChange={(event) => setField('vehicle_rego', event.target.value.toUpperCase())} placeholder="ABC123" />
                  </div>
                  <div>
                    <label className={labelClass}>Colour</label>
                    <input className={inputClass} value={form.vehicle_color} onChange={(event) => setField('vehicle_color', event.target.value)} placeholder="White" />
                  </div>
                  <div>
                    <label className={labelClass}>Transmission</label>
                    <select className={inputClass} value={form.vehicle_transmission} onChange={(event) => setField('vehicle_transmission', event.target.value)}>
                      <option value="auto">Automatic</option>
                      <option value="manual">Manual</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <label className="flex items-center justify-between gap-3 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 md:col-span-2">
                    <span>
                      <span className="block text-sm font-semibold text-on-surface">Dual controls fitted</span>
                      <span className="block text-xs text-on-surface-variant">Instructor brake pedals installed</span>
                    </span>
                    <input type="checkbox" checked={form.dual_controls} onChange={(event) => setField('dual_controls', event.target.checked)} className="h-5 w-5 accent-[#064E3B]" />
                  </label>
                </div>
              </div>
            )}

            {step.id === 'locations' && (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className={labelClass}>Home suburb</label>
                    <input className={inputClass} value={form.suburb} onChange={(event) => setField('suburb', event.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>State</label>
                    <select className={inputClass} value={form.state} onChange={(event) => setField('state', event.target.value)}>
                      {AU_STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Postcode</label>
                    <input className={inputClass} inputMode="numeric" maxLength={4} value={form.postcode} onChange={(event) => setField('postcode', event.target.value.replace(/\D/g, ''))} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Service suburbs</label>
                  <div className="flex flex-wrap gap-2">
                    {form.service_suburbs.map((suburb) => (
                      <span key={suburb} className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container-low px-3 py-1 text-sm font-semibold text-on-surface">
                        {suburb}
                        <button type="button" onClick={() => setField('service_suburbs', form.service_suburbs.filter((item) => item !== suburb))} aria-label={`Remove ${suburb}`}>
                          <span className="material-symbols-outlined text-[14px] text-on-surface-variant">close</span>
                        </button>
                      </span>
                    ))}
                    {form.service_suburbs.length === 0 && (
                      <span className="text-sm text-on-surface-variant">No service suburbs added yet.</span>
                    )}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      className={inputClass}
                      value={suburbInput}
                      onChange={(event) => setSuburbInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addSuburb();
                        }
                      }}
                      placeholder="Type a suburb and press Enter"
                    />
                    <button type="button" onClick={addSuburb} className="rounded-lg border border-outline-variant px-4 text-sm font-bold text-primary-container hover:bg-primary-container/5">
                      Add
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Service radius (km)</label>
                    <input className={inputClass} type="number" min={1} max={200} value={form.service_radius_km} onChange={(event) => setField('service_radius_km', Number(event.target.value) || 1)} />
                  </div>
                  <div>
                    <label className={labelClass}>Test centres you know (optional)</label>
                    <div className="flex gap-2">
                      <input
                        className={inputClass}
                        value={testCentreInput}
                        onChange={(event) => setTestCentreInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            addTestCentre();
                          }
                        }}
                        placeholder="e.g. Broadmeadows"
                      />
                      <button type="button" onClick={addTestCentre} className="rounded-lg border border-outline-variant px-4 text-sm font-bold text-primary-container hover:bg-primary-container/5">
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {form.familiar_test_centres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.familiar_test_centres.map((centre) => (
                      <span key={centre} className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container-low px-3 py-1 text-sm text-on-surface">
                        {centre}
                        <button type="button" onClick={() => setField('familiar_test_centres', form.familiar_test_centres.filter((item) => item !== centre))} aria-label={`Remove ${centre}`}>
                          <span className="material-symbols-outlined text-[14px] text-on-surface-variant">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step.id === 'rates' && (
              <div className="space-y-5">
                <div className="max-w-sm">
                  <label className={labelClass}>Hourly rate (AUD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">$</span>
                    <input className={`${inputClass} pl-8 pr-16 text-2xl font-bold`} type="number" min={1} max={500} value={form.hourly_rate} onChange={(event) => setField('hourly_rate', Number(event.target.value) || 0)} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">/ hr</span>
                  </div>
                  <p className="mt-2 text-xs text-on-surface-variant">
                    This is the base rate shown in search results and on your public profile. You can add lesson packages later from Pricing.
                  </p>
                </div>
              </div>
            )}

            {step.id === 'availability' && (
              <div className="space-y-3">
                {WEEKDAYS.map((day) => {
                  const value = availability[day.code];
                  return (
                    <div key={day.code} className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:flex-row sm:items-center">
                      <label className="flex min-w-[150px] items-center gap-3">
                        <input
                          type="checkbox"
                          checked={value.enabled}
                          onChange={(event) =>
                            setAvailability((prev) => ({
                              ...prev,
                              [day.code]: { ...prev[day.code], enabled: event.target.checked },
                            }))
                          }
                          className="h-5 w-5 accent-[#064E3B]"
                        />
                        <span className="text-sm font-bold text-on-surface">{day.label}</span>
                      </label>
                      <div className={`flex flex-1 items-center gap-2 ${value.enabled ? '' : 'opacity-40'}`}>
                        <input
                          type="time"
                          value={value.start}
                          disabled={!value.enabled}
                          onChange={(event) =>
                            setAvailability((prev) => ({
                              ...prev,
                              [day.code]: { ...prev[day.code], start: event.target.value },
                            }))
                          }
                          className={inputClass}
                        />
                        <span className="text-xs text-on-surface-variant">to</span>
                        <input
                          type="time"
                          value={value.end}
                          disabled={!value.enabled}
                          onChange={(event) =>
                            setAvailability((prev) => ({
                              ...prev,
                              [day.code]: { ...prev[day.code], end: event.target.value },
                            }))
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {step.id === 'review' && (
              <div className="space-y-5">
                {status === 'pending_review' ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                    <p className="text-sm font-bold text-amber-900">Submitted for administrator approval</p>
                    <p className="mt-1 text-sm text-amber-800">
                      Your profile is under review and is not publicly searchable yet. You can still update
                      your details while you wait.
                    </p>
                  </div>
                ) : status === 'approved' ? (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                    <p className="text-sm font-bold text-green-900">Approved and live</p>
                    <p className="mt-1 text-sm text-green-800">
                      Your profile is publicly searchable. Keep your availability, rates and documents up to date.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
                    <p className="text-sm font-bold text-on-surface">Ready to submit?</p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      An administrator will check your identity documents and profile before it becomes public.
                    </p>
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-2">
                  {STEPS.filter((item) => item.id !== 'review').map((item) => {
                    const check = item.id === 'review' ? null : checks?.[item.id];
                    return (
                      <div key={item.id} className="rounded-xl border border-outline-variant p-4">
                        <div className="flex items-start gap-3">
                          <span className={`material-symbols-outlined ${check?.complete ? 'text-green-600' : 'text-amber-500'}`}>
                            {check?.complete ? 'check_circle' : 'pending'}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-on-surface">{item.title}</p>
                            {check?.complete ? (
                              <p className="mt-0.5 text-xs text-green-700">Complete</p>
                            ) : (
                              <p className="mt-0.5 text-xs text-amber-700">Missing: {check?.missing.join(', ') || 'Not checked'}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-outline-variant p-4 text-sm">
                  <p className="font-bold text-on-surface">Business details</p>
                  <p className="mt-1 text-on-surface-variant">
                    {business.business_name || 'No business name added'}
                    {business.abn ? ` · ABN ${business.abn}` : ''}
                  </p>
                  <p className="text-on-surface-variant">
                    {[business.business_email, business.business_phone].filter(Boolean).join(' · ') || 'No contact details added'}
                  </p>
                </div>

                {status !== 'approved' && status !== 'pending_review' && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !checks || !Object.values(checks).every((check) => check.complete)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-container px-6 py-3 text-sm font-bold text-white transition-all hover:bg-primary-container/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    {submitting ? 'Submitting...' : 'Submit for administrator approval'}
                  </button>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-outline-variant pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep((value) => Math.max(0, value - 1))}
                disabled={currentStep === 0 || saving}
                className="inline-flex items-center justify-center gap-1 rounded-xl border border-outline-variant px-5 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back
              </button>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => saveStep(step.id, false)}
                  disabled={saving || isLocked}
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-outline-variant px-5 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-40"
                >
                  Save progress
                </button>
                {step.id !== 'review' && (
                  <button
                    type="button"
                    onClick={() => saveStep(step.id, true)}
                    disabled={saving || isLocked}
                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-primary-container px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary-container/90 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save & continue'}
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function DocumentCard({
  title,
  icon,
  description,
  scanner,
  children,
}: {
  title: string;
  icon: string;
  description: string;
  scanner: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-outline-variant p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-on-surface-variant">{icon}</span>
          <div>
            <p className="text-sm font-bold text-on-surface">{title}</p>
            <p className="mt-0.5 text-xs text-on-surface-variant">{description}</p>
          </div>
        </div>
        {scanner}
      </div>
      {children}
    </div>
  );
}
