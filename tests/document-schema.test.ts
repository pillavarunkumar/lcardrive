import { describe, expect, it, vi } from 'vitest';
import {
  extractJson,
  parseExtraction,
  CONFIDENCE_THRESHOLD,
} from '@/lib/ai/document-schema';
import { scanDocument } from '@/lib/ai/scan-service';
import { TimeoutError } from '@/lib/ai/gemini';

describe('extractJson', () => {
  it('parses fenced JSON', () => {
    expect(extractJson('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it('ignores prose around the object', () => {
    expect(extractJson('Here you go: {"a":1} thanks')).toBe('{"a":1}');
  });

  it('throws when there is no object', () => {
    expect(() => extractJson('no json here')).toThrow(/No JSON object/);
  });
});

describe('parseExtraction', () => {
  it('accepts a valid high-confidence licence', () => {
    const result = parseExtraction(
      'drivers_licence',
      '{"full_name":"Alex Sample","licence_number":"SYN-1","expiry_date":"2029-01-01","confidence":0.9}',
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.licence_number).toBe('SYN-1');
    expect(result.confidence).toBe(0.9);
    expect(result.manualReview).toBe(false);
  });

  it('routes missing required fields to manual review', () => {
    const result = parseExtraction(
      'drivers_licence',
      '{"full_name":"Alex Sample","licence_number":null,"expiry_date":"2029-01-01","confidence":0.9}',
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.manualReview).toBe(true);
    expect(result.reviewReason).toBe('required_field_missing');
  });

  it('routes low confidence to manual review', () => {
    const result = parseExtraction(
      'drivers_licence',
      `{"full_name":"Alex Sample","licence_number":"SYN-1","expiry_date":"2029-01-01","confidence":${CONFIDENCE_THRESHOLD - 0.1}}`,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.manualReview).toBe(true);
    expect(result.reviewReason).toBe('low_confidence');
  });

  it('rejects malformed JSON', () => {
    const result = parseExtraction('wwcc', 'definitely not json');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('invalid_json');
  });

  it('coerces a numeric-string year for vehicles', () => {
    const result = parseExtraction(
      'vehicle_registration',
      '{"vehicle_make":"Toyota","vehicle_model":"Corolla","vehicle_year":"2021","vehicle_rego":"SYN-123","vehicle_color":"White","confidence":0.8}',
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.vehicle_year).toBe(2021);
  });
});

describe('scanDocument', () => {
  it('retries once after invalid JSON and then succeeds', async () => {
    const responses = ['not json', '{"full_name":"Alex Sample","police_check_date":"2026-01-01","confidence":0.9}'];
    let call = 0;

    const outcome = await scanDocument({
      docType: 'police_check',
      bytes: Buffer.from('x'),
      mimeType: 'image/png',
      timeoutMs: 50,
      retries: 1,
      generator: async () => responses[call++],
    });

    expect(outcome.status).toBe('accepted');
    expect(outcome.attempts).toBe(2);
  });

  it('returns needs_review after exhausting retries', async () => {
    const outcome = await scanDocument({
      docType: 'police_check',
      bytes: Buffer.from('x'),
      mimeType: 'image/png',
      timeoutMs: 50,
      retries: 1,
      generator: async () => 'still not json',
    });

    expect(outcome.status).toBe('needs_review');
    expect(outcome.attempts).toBe(2);
    expect(outcome.reason).toBe('invalid_json');
  });

  it('surfaces timeouts as manual review instead of throwing', async () => {
    const outcome = await scanDocument({
      docType: 'wwcc',
      bytes: Buffer.from('x'),
      mimeType: 'image/png',
      timeoutMs: 5,
      retries: 0,
      generator: async () => {
        throw new TimeoutError(5);
      },
    });

    expect(outcome.status).toBe('needs_review');
    expect(outcome.reason).toBe('timeout');
  });

  it('does not call the generator more than retries + 1 times', async () => {
    const generator = vi.fn(async () => 'nope');

    await scanDocument({
      docType: 'wwcc',
      bytes: Buffer.from('x'),
      mimeType: 'image/png',
      timeoutMs: 50,
      retries: 2,
      generator,
    });

    expect(generator).toHaveBeenCalledTimes(3);
  });
});
