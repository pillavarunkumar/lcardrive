import type { DocType } from '../src/lib/ai/document-schema';

export interface EvalCase {
  id: string;
  docType: DocType;
  description: string;
  /** Successive Gemini replies. The last reply is reused for extra retries. */
  modelResponses: string[];
  /** `timeout` simulates an aborted Gemini call. */
  failWith?: 'timeout';
  expected: Record<string, unknown> | null;
  /** Whether the pipeline is allowed to auto-accept this document. */
  shouldAccept: boolean;
}

/**
 * Synthetic documents only. Every name, number and date here is invented and
 * does not correspond to a real person, licence or vehicle.
 */
export const evalCases: EvalCase[] = [
  {
    id: 'dl-001',
    docType: 'drivers_licence',
    description: 'Clean NSW-style licence, high confidence',
    modelResponses: [
      '{"full_name":"Alex Sample","licence_number":"SYN-100001","expiry_date":"2029-03-14","confidence":0.96}',
    ],
    expected: { full_name: 'Alex Sample', licence_number: 'SYN-100001', expiry_date: '2029-03-14' },
    shouldAccept: true,
  },
  {
    id: 'dl-002',
    docType: 'drivers_licence',
    description: 'Markdown-fenced JSON reply',
    modelResponses: [
      '```json\n{"full_name":"Bailey Example","licence_number":"SYN-100002","expiry_date":"2028-11-02","confidence":0.91}\n```',
    ],
    expected: { full_name: 'Bailey Example', licence_number: 'SYN-100002', expiry_date: '2028-11-02' },
    shouldAccept: true,
  },
  {
    id: 'dl-003',
    docType: 'drivers_licence',
    description: 'Missing licence number (required field)',
    modelResponses: [
      '{"full_name":"Casey Fiction","licence_number":null,"expiry_date":"2030-01-01","confidence":0.88}',
    ],
    expected: null,
    shouldAccept: false,
  },
  {
    id: 'dl-004',
    docType: 'drivers_licence',
    description: 'Low model confidence',
    modelResponses: [
      '{"full_name":"Dana Placeholder","licence_number":"SYN-100004","expiry_date":"2027-06-30","confidence":0.31}',
    ],
    expected: null,
    shouldAccept: false,
  },
  {
    id: 'dl-005',
    docType: 'drivers_licence',
    description: 'Malformed JSON on both attempts',
    modelResponses: ['not json at all', 'still not json'],
    expected: null,
    shouldAccept: false,
  },
  {
    id: 'dl-006',
    docType: 'drivers_licence',
    description: 'Wrong type for licence number',
    modelResponses: [
      '{"full_name":"Elliot Mock","licence_number":{"value":"SYN-100006"},"expiry_date":"2029-09-09","confidence":0.93}',
    ],
    expected: null,
    shouldAccept: false,
  },
  {
    id: 'dl-007',
    docType: 'drivers_licence',
    description: 'First reply malformed, retry succeeds',
    modelResponses: [
      '{"full_name":"Frank Sample",',
      '{"full_name":"Frank Sample","licence_number":"SYN-100007","expiry_date":"2031-04-21","confidence":0.9}',
    ],
    expected: { full_name: 'Frank Sample', licence_number: 'SYN-100007', expiry_date: '2031-04-21' },
    shouldAccept: true,
  },
  {
    id: 'adi-001',
    docType: 'adi_registration',
    description: 'Clean ADI certificate',
    modelResponses: [
      '{"full_name":"Grace Example","adi_registration":"ADI-SYN-2001","adi_registration_expiry":"2028-02-29","confidence":0.95}',
    ],
    expected: { full_name: 'Grace Example', adi_registration: 'ADI-SYN-2001', adi_registration_expiry: '2028-02-29' },
    shouldAccept: true,
  },
  {
    id: 'adi-002',
    docType: 'adi_registration',
    description: 'Extra unknown fields are stripped',
    modelResponses: [
      '{"full_name":"Harper Fiction","adi_registration":"ADI-SYN-2002","adi_registration_expiry":"2027-12-01","confidence":0.89,"notes":"ignore me"}',
    ],
    expected: { full_name: 'Harper Fiction', adi_registration: 'ADI-SYN-2002', adi_registration_expiry: '2027-12-01' },
    shouldAccept: true,
  },
  {
    id: 'adi-003',
    docType: 'adi_registration',
    description: 'Confidence delivered as a numeric string',
    modelResponses: [
      '{"full_name":"Indigo Mock","adi_registration":"ADI-SYN-2003","adi_registration_expiry":"2029-05-05","confidence":"0.88"}',
    ],
    expected: { full_name: 'Indigo Mock', adi_registration: 'ADI-SYN-2003', adi_registration_expiry: '2029-05-05' },
    shouldAccept: true,
  },
  {
    id: 'adi-004',
    docType: 'adi_registration',
    description: 'Low confidence ADI scan',
    modelResponses: [
      '{"full_name":"Jules Sample","adi_registration":"ADI-SYN-2004","adi_registration_expiry":"2028-08-18","confidence":0.55}',
    ],
    expected: null,
    shouldAccept: false,
  },
  {
    id: 'cert-001',
    docType: 'certificate_iv',
    description: 'Certificate IV with fenced JSON',
    modelResponses: [
      '```json\n{"full_name":"Kai Example","certificate_iv_reference":"CERT-SYN-3001","certificate_iv_date":"2024-02-10","confidence":0.94}\n```',
    ],
    expected: { full_name: 'Kai Example', certificate_iv_reference: 'CERT-SYN-3001', certificate_iv_date: '2024-02-10' },
    shouldAccept: true,
  },
  {
    id: 'cert-002',
    docType: 'certificate_iv',
    description: 'Certificate reference missing',
    modelResponses: [
      '{"full_name":"Lane Fiction","certificate_iv_reference":null,"certificate_iv_date":"2023-07-01","confidence":0.9}',
    ],
    expected: null,
    shouldAccept: false,
  },
  {
    id: 'wwcc-001',
    docType: 'wwcc',
    description: 'Clean WWCC card',
    modelResponses: [
      '{"full_name":"Morgan Mock","wwcc_number":"WWC-SYN-4001","wwcc_expiry":"2032-01-15","confidence":0.97}',
    ],
    expected: { full_name: 'Morgan Mock', wwcc_number: 'WWC-SYN-4001', wwcc_expiry: '2032-01-15' },
    shouldAccept: true,
  },
  {
    id: 'wwcc-002',
    docType: 'wwcc',
    description: 'Gemini call times out on both attempts',
    modelResponses: [],
    failWith: 'timeout',
    expected: null,
    shouldAccept: false,
  },
  {
    id: 'police-001',
    docType: 'police_check',
    description: 'Clean police check',
    modelResponses: [
      '{"full_name":"Noel Placeholder","police_check_date":"2026-04-01","confidence":0.92}',
    ],
    expected: { full_name: 'Noel Placeholder', police_check_date: '2026-04-01' },
    shouldAccept: true,
  },
  {
    id: 'medical-001',
    docType: 'medical_assessment',
    description: 'Assessment date present, expiry absent',
    modelResponses: [
      '{"full_name":"Oakley Sample","medical_assessment_date":"2026-01-20","medical_assessment_expiry":null,"confidence":0.85}',
    ],
    expected: { full_name: 'Oakley Sample', medical_assessment_date: '2026-01-20', medical_assessment_expiry: null },
    shouldAccept: true,
  },
  {
    id: 'liability-001',
    docType: 'public_liability',
    description: 'Clean public liability certificate',
    modelResponses: [
      '{"full_name":"Pat Fiction","public_liability_provider":"Sample Insurance Co","public_liability_policy_number":"POL-SYN-5001","public_liability_expiry":"2027-03-31","confidence":0.93}',
    ],
    expected: {
      full_name: 'Pat Fiction',
      public_liability_provider: 'Sample Insurance Co',
      public_liability_policy_number: 'POL-SYN-5001',
      public_liability_expiry: '2027-03-31',
    },
    shouldAccept: true,
  },
  {
    id: 'vehicle-001',
    docType: 'vehicle_registration',
    description: 'Year returned as a string',
    modelResponses: [
      '{"vehicle_make":"Toyota","vehicle_model":"Corolla","vehicle_year":"2021","vehicle_rego":"SYN-123","vehicle_color":"White","confidence":0.9}',
    ],
    expected: { vehicle_make: 'Toyota', vehicle_model: 'Corolla', vehicle_year: 2021, vehicle_rego: 'SYN-123', vehicle_color: 'White' },
    shouldAccept: true,
  },
  {
    id: 'vehicle-002',
    docType: 'vehicle_registration',
    description: 'Registration number returned as a number',
    modelResponses: [
      '{"vehicle_make":"Mazda","vehicle_model":"3","vehicle_year":2020,"vehicle_rego":12345,"vehicle_color":"Blue","confidence":0.9}',
    ],
    expected: null,
    shouldAccept: false,
  },
];
