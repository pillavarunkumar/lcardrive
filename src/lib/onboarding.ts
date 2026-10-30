/**
 * Guided instructor registration shared by the portal wizard and the API.
 *
 * The database already has the core instructor columns and a `status` column.
 * Business details that do not have dedicated columns are stored in a single
 * `listing_flags` row using the prefix below. This keeps the flow deployable
 * without a schema migration while still persisting the data server-side.
 */
export const ONBOARDING_PREFIX = 'onboarding:';

export const ONBOARDING_STEPS = [
  'account',
  'personal',
  'business',
  'qualifications',
  'vehicle',
  'locations',
  'rates',
  'availability',
  'review',
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export interface BusinessInfo {
  business_name: string;
  abn: string;
  website: string;
  business_email: string;
  business_phone: string;
  business_address: string;
}

export const EMPTY_BUSINESS_INFO: BusinessInfo = {
  business_name: '',
  abn: '',
  website: '',
  business_email: '',
  business_phone: '',
  business_address: '',
};

export interface OnboardingMetadata {
  step: OnboardingStep;
  business: BusinessInfo;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  review_note?: string | null;
}

export type ApprovalStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';

export interface StepCheck {
  complete: boolean;
  missing: string[];
}

export type OnboardingChecks = Record<Exclude<OnboardingStep, 'review'>, StepCheck>;

export interface SubmissionValidation {
  valid: boolean;
  errors: string[];
}

export function isOnboardingStep(value: unknown): value is OnboardingStep {
  return typeof value === 'string' && (ONBOARDING_STEPS as readonly string[]).includes(value);
}

export function getStepIndex(step: OnboardingStep): number {
  return ONBOARDING_STEPS.indexOf(step);
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function clean(value: unknown, max = 200): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export function normalizeBusinessInfo(value: unknown): BusinessInfo {
  const raw = record(value);
  return {
    business_name: clean(raw.business_name, 120),
    abn: clean(raw.abn, 20),
    website: clean(raw.website, 300),
    business_email: clean(raw.business_email, 200).toLowerCase(),
    business_phone: clean(raw.business_phone, 40),
    business_address: clean(raw.business_address, 300),
  };
}

export function parseOnboardingDetail(
  detail: string | null | undefined,
): OnboardingMetadata | null {
  if (!detail || !detail.startsWith(ONBOARDING_PREFIX)) return null;
  try {
    const parsed = record(JSON.parse(detail.slice(ONBOARDING_PREFIX.length)));
    return {
      step: isOnboardingStep(parsed.step) ? parsed.step : 'account',
      business: normalizeBusinessInfo(parsed.business),
      submitted_at: typeof parsed.submitted_at === 'string' ? parsed.submitted_at : null,
      reviewed_at: typeof parsed.reviewed_at === 'string' ? parsed.reviewed_at : null,
      review_note: typeof parsed.review_note === 'string' ? parsed.review_note : null,
    };
  } catch {
    return null;
  }
}

export function serializeOnboardingDetail(metadata: OnboardingMetadata): string {
  return `${ONBOARDING_PREFIX}${JSON.stringify({
    step: metadata.step,
    business: normalizeBusinessInfo(metadata.business),
    submitted_at: metadata.submitted_at || null,
    reviewed_at: metadata.reviewed_at || null,
    review_note: metadata.review_note || null,
  })}`;
}

export function mergeBusinessInfo(
  current: BusinessInfo,
  patch: Partial<BusinessInfo>,
): BusinessInfo {
  return normalizeBusinessInfo({ ...current, ...patch });
}

export function deriveApprovalStatus(
  instructor: Record<string, unknown> | null | undefined,
  hasPendingReview: boolean,
): ApprovalStatus {
  const status = String(instructor?.status || '').toLowerCase();
  if (status === 'rejected') return 'rejected';
  if (hasPendingReview || status === 'pending_review' || status === 'pending') {
    return 'pending_review';
  }
  if (status === 'approved' || status === 'verified' || instructor?.is_verified === true) {
    return 'approved';
  }
  return 'draft';
}

/**
 * Pending, rejected and unverified rows must never be publicly reachable.
 * Existing verified listings predate the status workflow (status='draft'), so
 * is_verified remains the compatibility gate for them.
 */
export function isPubliclyVisible(
  instructor: Record<string, unknown> | null | undefined,
): boolean {
  if (!instructor?.is_verified) return false;
  const status = String(instructor.status || '').toLowerCase();
  return status !== 'pending_review' && status !== 'pending' && status !== 'rejected';
}

function hasText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function isIsoDate(value: unknown): boolean {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function positiveNumber(value: unknown): boolean {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) && parsed > 0;
}

function nonEmptyArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

function hasSlot(value: unknown): boolean {
  const slots = record(value);
  return Object.values(slots).some((slot) => Array.isArray(slot) && slot.length > 0);
}

function result(missing: string[]): StepCheck {
  return { complete: missing.length === 0, missing };
}

export function computeOnboardingChecks(
  instructor: Record<string, unknown> | null | undefined,
  business: BusinessInfo,
): OnboardingChecks {
  const row = instructor || {};
  const businessContact = hasText(business.business_phone) || hasText(business.business_email);

  return {
    account: result(hasText(row.email) ? [] : ['Verified email address']),
    personal: result(
      [
        hasText(row.first_name) ? null : 'First name',
        hasText(row.last_name) ? null : 'Last name',
        hasText(row.phone) ? null : 'Mobile number',
        hasText(row.suburb) ? null : 'Suburb',
        hasText(row.state) ? null : 'State',
        hasText(row.postcode) ? null : 'Postcode',
      ].filter(Boolean) as string[],
    ),
    business: result(
      [
        hasText(business.business_name) ? null : 'Business name',
        businessContact ? null : 'Business phone or email',
        hasText(business.abn) && !/^\d{11}$/.test(business.abn.replace(/\s/g, ''))
          ? 'ABN must be 11 digits'
          : null,
      ].filter(Boolean) as string[],
    ),
    qualifications: result(
      [
        hasText(row.adi_registration) ? null : 'ADI registration number',
        isIsoDate(row.adi_registration_expiry) ? null : 'ADI registration expiry',
        hasText(row.drivers_licence_number) ? null : "Driver's licence number",
        isIsoDate(row.drivers_licence_expiry) ? null : "Driver's licence expiry",
        hasText(row.certificate_iv_reference) ? null : 'Certificate IV reference',
        hasText(row.drivers_licence_image_url) ? null : "Driver's licence image",
        hasText(row.adi_registration_image_url) ? null : 'ADI registration image',
        hasText(row.certificate_iv_image_url) ? null : 'Certificate IV image',
      ].filter(Boolean) as string[],
    ),
    vehicle: result(
      [
        hasText(row.vehicle_make) ? null : 'Vehicle make',
        hasText(row.vehicle_model) ? null : 'Vehicle model',
        positiveNumber(row.vehicle_year) ? null : 'Vehicle year',
        hasText(row.vehicle_rego) ? null : 'Vehicle registration',
        hasText(row.vehicle_color) ? null : 'Vehicle colour',
        hasText(row.vehicle_transmission) ? null : 'Vehicle transmission',
      ].filter(Boolean) as string[],
    ),
    locations: result(
      [
        hasText(row.suburb) ? null : 'Suburb',
        hasText(row.state) ? null : 'State',
        hasText(row.postcode) ? null : 'Postcode',
        nonEmptyArray(row.service_suburbs) ? null : 'At least one service suburb',
        positiveNumber(row.service_radius_km) ? null : 'Service radius',
      ].filter(Boolean) as string[],
    ),
    rates: result([positiveNumber(row.hourly_rate) ? null : 'Hourly rate'].filter(Boolean) as string[]),
    availability: result(
      [
        nonEmptyArray(row.availability_days) ? null : 'At least one available day',
        hasSlot(row.availability_slots) ? null : 'Availability times',
      ].filter(Boolean) as string[],
    ),
  };
}

export function validateSubmission(
  instructor: Record<string, unknown> | null | undefined,
  business: BusinessInfo,
): SubmissionValidation {
  const checks = computeOnboardingChecks(instructor, business);
  const errors: string[] = [];

  for (const [step, check] of Object.entries(checks)) {
    for (const missing of check.missing) {
      errors.push(`${step}: ${missing}`);
    }
  }

  const postcode = String(instructor?.postcode || '');
  if (hasText(postcode) && !/^\d{4}$/.test(postcode)) {
    errors.push('locations: Postcode must be 4 digits');
  }

  if (hasText(business.business_email) && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(business.business_email)) {
    errors.push('business: Business email is invalid');
  }

  const hourlyRate = Number(instructor?.hourly_rate);
  if (Number.isFinite(hourlyRate) && hourlyRate > 500) {
    errors.push('rates: Hourly rate looks too high');
  }

  return { valid: errors.length === 0, errors };
}

function textValue(value: unknown, max = 200): string | null {
  return typeof value === 'string' ? value.trim().slice(0, max) : null;
}

function dateValue(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

function numberValue(value: unknown, min: number, max: number): number | null {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''));
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

function textArray(value: unknown, maxItems = 20, maxLength = 80): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim().slice(0, maxLength);
    const key = trimmed.toLowerCase();
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
    if (out.length >= maxItems) break;
  }
  return out;
}

function slotsValue(value: unknown): Record<string, string[]> {
  const raw = record(value);
  const out: Record<string, string[]> = {};
  for (const [day, slots] of Object.entries(raw).slice(0, 7)) {
    const values = textArray(slots, 3, 40);
    if (values.length > 0) out[day.slice(0, 10)] = values;
  }
  return out;
}

/**
 * Validate fields present in a step save. Empty optional values are allowed;
 * missing required values are only enforced when the instructor submits.
 */
export function validateStepData(step: OnboardingStep, value: unknown): string[] {
  const data = record(value);
  const errors: string[] = [];

  if (step === 'personal') {
    if ('first_name' in data && !textValue(data.first_name, 80)) errors.push('First name is required');
    if ('last_name' in data && !textValue(data.last_name, 80)) errors.push('Last name is required');
    if ('phone' in data && !textValue(data.phone, 40)) errors.push('Mobile number is required');
    if ('state' in data && !textValue(data.state, 10)) errors.push('State is required');
    if ('postcode' in data && data.postcode && !/^\d{4}$/.test(String(data.postcode))) {
      errors.push('Postcode must be 4 digits');
    }
  }

  if (step === 'business') {
    if ('business_email' in data && data.business_email) {
      const email = String(data.business_email).trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push('Business email is invalid');
    }
    if ('abn' in data && data.abn) {
      const abn = String(data.abn).replace(/\s/g, '');
      if (!/^\d{11}$/.test(abn)) errors.push('ABN must be 11 digits');
    }
  }

  if (step === 'qualifications') {
    for (const field of ['adi_registration_expiry', 'drivers_licence_expiry', 'certificate_iv_date', 'wwcc_expiry', 'police_check_date', 'medical_assessment_date', 'medical_assessment_expiry', 'public_liability_expiry']) {
      if (field in data && data[field] && !dateValue(data[field])) {
        errors.push(`${field.replace(/_/g, ' ')} must be a valid date`);
      }
    }
  }

  if (step === 'vehicle') {
    if ('vehicle_year' in data && data.vehicle_year) {
      const year = Number(data.vehicle_year);
      const maxYear = new Date().getFullYear() + 1;
      if (!Number.isInteger(year) || year < 1990 || year > maxYear) {
        errors.push('Vehicle year is invalid');
      }
    }
  }

  if (step === 'locations') {
    if ('postcode' in data && data.postcode && !/^\d{4}$/.test(String(data.postcode))) {
      errors.push('Postcode must be 4 digits');
    }
    if ('service_radius_km' in data && data.service_radius_km) {
      const radius = Number(data.service_radius_km);
      if (!Number.isFinite(radius) || radius < 1 || radius > 200) errors.push('Service radius must be between 1 and 200 km');
    }
  }

  if (step === 'rates' && 'hourly_rate' in data && data.hourly_rate) {
    const rate = Number(data.hourly_rate);
    if (!Number.isFinite(rate) || rate <= 0 || rate > 500) errors.push('Hourly rate must be between $1 and $500');
  }

  return errors;
}

export function sanitizeStepPayload(
  step: OnboardingStep,
  value: unknown,
): Record<string, unknown> {
  const data = record(value);
  const out: Record<string, unknown> = {};

  const text = (field: string, max = 200) => {
    if (field in data) out[field] = textValue(data[field], max);
  };
  const date = (field: string) => {
    if (field in data) out[field] = dateValue(data[field]);
  };
  const array = (field: string, maxItems = 20, maxLength = 80) => {
    if (field in data) out[field] = textArray(data[field], maxItems, maxLength);
  };

  switch (step) {
    case 'account':
    case 'personal':
      text('first_name', 80);
      text('last_name', 80);
      text('phone', 40);
      text('suburb', 100);
      text('state', 10);
      text('postcode', 12);
      text('gender', 20);
      text('bio', 1000);
      text('teaching_style', 120);
      text('primary_learner_types', 300);
      if ('years_experience' in data) {
        out.years_experience = numberValue(data.years_experience, 0, 70);
      }
      array('languages', 10, 40);
      break;

    case 'qualifications':
      text('adi_registration', 60);
      date('adi_registration_expiry');
      text('drivers_licence_number', 60);
      date('drivers_licence_expiry');
      text('certificate_iv_reference', 100);
      date('certificate_iv_date');
      text('wwcc_number', 60);
      date('wwcc_expiry');
      date('police_check_date');
      date('medical_assessment_date');
      date('medical_assessment_expiry');
      text('public_liability_provider', 120);
      text('public_liability_policy_number', 100);
      date('public_liability_expiry');
      text('drivers_licence_image_url', 500);
      text('adi_registration_image_url', 500);
      text('certificate_iv_image_url', 500);
      text('wwcc_image_url', 500);
      text('police_check_image_url', 500);
      text('medical_assessment_image_url', 500);
      text('public_liability_image_url', 500);
      break;

    case 'vehicle':
      text('vehicle_make', 80);
      text('vehicle_model', 80);
      text('vehicle_rego', 30);
      text('vehicle_color', 40);
      text('vehicle_transmission', 20);
      text('vehicle_image_url', 500);
      if ('vehicle_year' in data) out.vehicle_year = numberValue(data.vehicle_year, 1990, new Date().getFullYear() + 1);
      if ('dual_controls' in data) out.dual_controls = Boolean(data.dual_controls);
      break;

    case 'locations':
      text('suburb', 100);
      text('state', 10);
      text('postcode', 12);
      array('service_suburbs', 40, 80);
      array('familiar_test_centres', 20, 100);
      if ('service_radius_km' in data) {
        out.service_radius_km = numberValue(data.service_radius_km, 1, 200);
      }
      break;

    case 'rates':
      if ('hourly_rate' in data) out.hourly_rate = numberValue(data.hourly_rate, 1, 500);
      if ('package_options' in data && Array.isArray(data.package_options)) {
        out.package_options = data.package_options
          .filter((pkg): pkg is Record<string, unknown> => Boolean(pkg) && typeof pkg === 'object')
          .slice(0, 6)
          .map((pkg) => ({
            hours: numberValue(pkg.hours, 1, 100) || 1,
            price: numberValue(pkg.price, 1, 10000) || 0,
            label: textValue(pkg.label, 80) || '',
          }))
          .filter((pkg) => pkg.price > 0);
      }
      break;

    case 'availability':
      array('availability_days', 7, 12);
      if ('availability_slots' in data) out.availability_slots = slotsValue(data.availability_slots);
      break;

    case 'review':
      break;
  }

  return out;
}

export function sanitizeBusinessPayload(value: unknown): Partial<BusinessInfo> {
  const data = record(value);
  const out: Partial<BusinessInfo> = {};
  if ('business_name' in data) out.business_name = clean(data.business_name, 120);
  if ('abn' in data) out.abn = clean(data.abn, 20).replace(/\s/g, '');
  if ('website' in data) out.website = clean(data.website, 300);
  if ('business_email' in data) out.business_email = clean(data.business_email, 200).toLowerCase();
  if ('business_phone' in data) out.business_phone = clean(data.business_phone, 40);
  if ('business_address' in data) out.business_address = clean(data.business_address, 300);
  return out;
}
