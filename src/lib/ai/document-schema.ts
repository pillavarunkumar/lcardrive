import { z } from 'zod';

export const DOC_TYPES = [
  'drivers_licence',
  'adi_registration',
  'certificate_iv',
  'wwcc',
  'police_check',
  'medical_assessment',
  'public_liability',
  'vehicle_registration',
] as const;

export type DocType = (typeof DOC_TYPES)[number];

export function isDocType(value: string): value is DocType {
  return (DOC_TYPES as readonly string[]).includes(value);
}

const nullableText = z
  .string()
  .trim()
  .max(200)
  .nullable()
  .catch(null);

const isoDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD')
  .nullable()
  .catch(null);

const year = z
  .union([z.number(), z.string()])
  .nullable()
  .transform((value) => {
    if (value === null || value === '') return null;
    const parsed = typeof value === 'number' ? value : Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) return null;
    if (parsed < 1900 || parsed > 2100) return null;
    return parsed;
  })
  .catch(null);

/** Every extraction schema tolerates missing fields; the caller decides whether
 * that is acceptable based on `requiredFields` and `confidence`. */
export const extractionSchemas = {
  drivers_licence: z.object({
    full_name: nullableText,
    licence_number: nullableText,
    expiry_date: isoDate,
  }),
  adi_registration: z.object({
    full_name: nullableText,
    adi_registration: nullableText,
    adi_registration_expiry: isoDate,
  }),
  certificate_iv: z.object({
    full_name: nullableText,
    certificate_iv_reference: nullableText,
    certificate_iv_date: isoDate,
  }),
  wwcc: z.object({
    full_name: nullableText,
    wwcc_number: nullableText,
    wwcc_expiry: isoDate,
  }),
  police_check: z.object({
    full_name: nullableText,
    police_check_date: isoDate,
  }),
  medical_assessment: z.object({
    full_name: nullableText,
    medical_assessment_date: isoDate,
    medical_assessment_expiry: isoDate,
  }),
  public_liability: z.object({
    full_name: nullableText,
    public_liability_provider: nullableText,
    public_liability_policy_number: nullableText,
    public_liability_expiry: isoDate,
  }),
  vehicle_registration: z.object({
    vehicle_make: nullableText,
    vehicle_model: nullableText,
    vehicle_year: year,
    vehicle_rego: nullableText,
    vehicle_color: nullableText,
  }),
} satisfies Record<DocType, z.ZodTypeAny>;

/** The field an admin must be able to read to trust the document. If it is
 * missing the result always goes to manual review. */
export const requiredFields: Record<DocType, string> = {
  drivers_licence: 'licence_number',
  adi_registration: 'adi_registration',
  certificate_iv: 'certificate_iv_reference',
  wwcc: 'wwcc_number',
  police_check: 'police_check_date',
  medical_assessment: 'medical_assessment_date',
  public_liability: 'public_liability_policy_number',
  vehicle_registration: 'vehicle_rego',
};

export const DOCUMENT_FIELDS: Record<DocType, readonly string[]> = {
  drivers_licence: ['drivers_licence_image_url'],
  adi_registration: ['adi_registration_image_url'],
  certificate_iv: ['certificate_iv_image_url'],
  wwcc: ['wwcc_image_url'],
  police_check: ['police_check_image_url'],
  medical_assessment: ['medical_assessment_image_url'],
  public_liability: ['public_liability_image_url'],
  vehicle_registration: ['vehicle_image_url'],
};

export const DOCUMENT_LABELS: Record<DocType, string> = {
  drivers_licence: "Driver's licence",
  adi_registration: 'ADI registration',
  certificate_iv: 'Certificate IV',
  wwcc: 'Working with Children Check',
  police_check: 'National Police Check',
  medical_assessment: 'Medical assessment',
  public_liability: 'Public liability insurance',
  vehicle_registration: 'Vehicle registration',
};

export const CONFIDENCE_THRESHOLD = 0.6;

export const PROMPTS: Record<DocType, string> = {
  drivers_licence: `Extract the following from this Australian driver's licence card image. Return ONLY valid JSON:
{
  "full_name": "full name as shown on the licence (e.g. Sarah Mitchell)",
  "licence_number": "the licence number",
  "expiry_date": "expiry date in YYYY-MM-DD format",
  "confidence": 0.0
}
"confidence" must be a number between 0 and 1 describing how certain you are that every value is correct. Use null for any field that is not clearly visible.`,
  adi_registration: `Extract the following from this ADI (Authorised Driving Instructor) registration certificate image. Return ONLY valid JSON:
{
  "full_name": "instructor name as shown on the certificate",
  "adi_registration": "registration number (e.g. ADI-123456)",
  "adi_registration_expiry": "expiry date in YYYY-MM-DD format",
  "confidence": 0.0
}
"confidence" must be a number between 0 and 1. Use null for fields that are not clearly visible.`,
  certificate_iv: `Extract the following from this Certificate IV in Driving Instruction image. Return ONLY valid JSON:
{
  "full_name": "student name as shown on the certificate",
  "certificate_iv_reference": "certificate reference or serial number",
  "certificate_iv_date": "date issued in YYYY-MM-DD format",
  "confidence": 0.0
}
"confidence" must be a number between 0 and 1. Use null for fields that are not clearly visible.`,
  wwcc: `Extract the following from this Working with Children Check card/image. Return ONLY valid JSON:
{
  "full_name": "cardholder name as shown on the card",
  "wwcc_number": "WWCC number",
  "wwcc_expiry": "expiry date in YYYY-MM-DD format",
  "confidence": 0.0
}
"confidence" must be a number between 0 and 1. Use null for fields that are not clearly visible.`,
  police_check: `Extract the following from this National Police Check certificate image. Return ONLY valid JSON:
{
  "full_name": "applicant name as shown on the certificate",
  "police_check_date": "date of check/certificate in YYYY-MM-DD format",
  "confidence": 0.0
}
"confidence" must be a number between 0 and 1. Use null for fields that are not clearly visible.`,
  medical_assessment: `Extract the following from this Medical Assessment / Fitness to Drive certificate image. Return ONLY valid JSON:
{
  "full_name": "patient name as shown on the form",
  "medical_assessment_date": "assessment date in YYYY-MM-DD format",
  "medical_assessment_expiry": "expiry date in YYYY-MM-DD format",
  "confidence": 0.0
}
"confidence" must be a number between 0 and 1. Use null for fields that are not clearly visible.`,
  public_liability: `Extract the following from this Public Liability Insurance certificate image. Return ONLY valid JSON:
{
  "full_name": "insured name or business name as shown on the certificate",
  "public_liability_provider": "insurance provider name",
  "public_liability_policy_number": "policy number",
  "public_liability_expiry": "expiry date in YYYY-MM-DD format",
  "confidence": 0.0
}
"confidence" must be a number between 0 and 1. Use null for fields that are not clearly visible.`,
  vehicle_registration: `Extract the following from this vehicle registration document or a photo of a car. Return ONLY valid JSON:
{
  "vehicle_make": "car make/manufacturer (e.g. Toyota)",
  "vehicle_model": "car model (e.g. Corolla)",
  "vehicle_year": 2020,
  "vehicle_rego": "registration plate number (e.g. ABC-123)",
  "vehicle_color": "vehicle colour (e.g. White, Silver, Blue)",
  "confidence": 0.0
}
"confidence" must be a number between 0 and 1. Use null for fields that are not clearly visible.`,
};

export type ParsedExtraction =
  | {
      ok: true;
      data: Record<string, unknown>;
      confidence: number;
      missingFields: string[];
      manualReview: boolean;
      reviewReason: string | null;
    }
  | {
      ok: false;
      error: string;
      issues: string[];
    };

/** Strip markdown fences and pull the first JSON object out of a model reply. */
export function extractJson(raw: string): string {
  const cleaned = raw
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found in model response');
  }
  return cleaned.slice(start, end + 1);
}

export function parseExtraction(docType: DocType, raw: string): ParsedExtraction {
  let json: unknown;
  try {
    json = JSON.parse(extractJson(raw));
  } catch (error) {
    return {
      ok: false,
      error: 'invalid_json',
      issues: [error instanceof Error ? error.message : 'Unknown JSON parse error'],
    };
  }

  if (typeof json !== 'object' || json === null || Array.isArray(json)) {
    return { ok: false, error: 'invalid_shape', issues: ['Response was not a JSON object'] };
  }

  const { confidence: rawConfidence, ...fields } = json as Record<string, unknown>;
  const result = extractionSchemas[docType].safeParse(fields);

  if (!result.success) {
    return {
      ok: false,
      error: 'schema_validation',
      issues: result.error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`),
    };
  }

  const data = result.data as Record<string, unknown>;
  const expected = Object.keys(extractionSchemas[docType].shape);
  const missingFields = expected.filter((key) => data[key] === null || data[key] === undefined);

  const completeness = (expected.length - missingFields.length) / expected.length;
  const providedConfidence =
    typeof rawConfidence === 'number' && rawConfidence >= 0 && rawConfidence <= 1
      ? rawConfidence
      : typeof rawConfidence === 'string' && rawConfidence.trim() !== '' && Number.isFinite(Number(rawConfidence))
        ? Math.min(1, Math.max(0, Number(rawConfidence)))
        : null;

  const confidence = providedConfidence ?? completeness;
  const requiredMissing = data[requiredFields[docType]] === null || data[requiredFields[docType]] === undefined;

  let reviewReason: string | null = null;
  if (requiredMissing) reviewReason = 'required_field_missing';
  else if (confidence < CONFIDENCE_THRESHOLD) reviewReason = 'low_confidence';

  return {
    ok: true,
    data,
    confidence,
    missingFields,
    manualReview: reviewReason !== null,
    reviewReason,
  };
}
