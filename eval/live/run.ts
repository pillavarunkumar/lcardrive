import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { scanDocument } from '../../src/lib/ai/scan-service';
import { GEMINI_MODEL } from '../../src/lib/gemini';
import { liveCases, type LiveCase } from './cases';

interface LiveResult {
  fixture: LiveCase;
  status: 'accepted' | 'needs_review';
  reason: string | null;
  confidence: number;
  attempts: number;
  latencyMs: number;
  extracted: Record<string, unknown>;
  issues: string[];
  matchedFields: number;
  expectedFields: number;
}

async function runCase(fixture: LiveCase): Promise<LiveResult> {
  const bytes = readFileSync(join(process.cwd(), 'eval', 'live', 'fixtures', fixture.image));
  const started = Date.now();

  const outcome = await scanDocument({
    docType: fixture.docType,
    bytes,
    mimeType: 'image/png',
    timeoutMs: 30_000,
    retries: 1,
  });

  let matchedFields = 0;
  let expectedFields = 0;
  for (const [key, expectedValue] of Object.entries(fixture.expected)) {
    expectedFields += 1;
    if (outcome.extracted[key] === expectedValue) matchedFields += 1;
  }

  return {
    fixture,
    status: outcome.status,
    reason: outcome.reason,
    confidence: outcome.confidence,
    attempts: outcome.attempts,
    latencyMs: Date.now() - started,
    extracted: outcome.extracted,
    issues: outcome.issues,
    matchedFields,
    expectedFields,
  };
}

function pct(value: number, total: number): string {
  if (total === 0) return 'n/a';
  return `${((value / total) * 100).toFixed(1)}%`;
}

// Free-tier Gemini keys allow only a handful of requests per minute. Pace the
// sample so the result reflects OCR quality rather than quota errors.
const DELAY_MS = Number(process.env.LIVE_SAMPLE_DELAY_MS ?? 25_000);

async function main() {
  const results: LiveResult[] = [];
  for (const [index, fixture] of liveCases.entries()) {
    if (index > 0 && DELAY_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
    process.stdout.write(`${fixture.id}... `);
    const result = await runCase(fixture);
    results.push(result);
    console.log(`${result.status} (${result.latencyMs}ms)`);
  }

  const accepted = results.filter((r) => r.status === 'accepted');
  const matched = accepted.reduce((sum, r) => sum + r.matchedFields, 0);
  const expected = accepted.reduce((sum, r) => sum + r.expectedFields, 0);
  const exact = accepted.filter((r) => r.matchedFields === r.expectedFields).length;
  const retried = results.filter((r) => r.attempts > 1);
  const averageLatency = results.reduce((sum, r) => sum + r.latencyMs, 0) / results.length;

  const lines = [
    '# AI document scanning — small live sample',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Model: \`${GEMINI_MODEL}\``,
    '',
    '> **This is a small live sample, not the main evaluation.** Six synthetic',
    '> images (invented names and numbers) were sent to the real Gemini API through',
    '> `scanDocument`. Results are reported as observed and are not used as a',
    '> pass/fail gate. The main deterministic evaluation is in `eval/results.md`.',
    '',
    '## Summary',
    '',
    '| Metric | Result |',
    '| --- | --- |',
    `| Documents | ${results.length} |`,
    `| Auto-accepted | ${accepted.length}/${results.length} |`,
    `| Routed to manual review | ${results.length - accepted.length}/${results.length} |`,
    `| Field accuracy (auto-accepted) | ${pct(matched, expected)} (${matched}/${expected}) |`,
    `| Exact documents (auto-accepted) | ${exact}/${accepted.length} |`,
    `| Cases needing a retry | ${retried.length} |`,
    `| Average latency | ${Math.round(averageLatency)}ms |`,
    '',
    '## Per-document results',
    '',
    '| Case | Type | Scenario | Status | Confidence | Attempts | Latency | Fields |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ];

  for (const result of results) {
    const status = result.status === 'accepted' ? 'accepted' : `review (${result.reason ?? 'unknown'})`;
    lines.push(
      `| ${result.fixture.id} | ${result.fixture.docType} | ${result.fixture.description} | ${status} | ${(result.confidence * 100).toFixed(0)}% | ${result.attempts} | ${result.latencyMs}ms | ${result.matchedFields}/${result.expectedFields} |`,
    );
  }

  lines.push(
    '',
    '## Extract output',
    '',
    '```json',
    JSON.stringify(
      results.map((r) => ({
        case: r.fixture.id,
        status: r.status,
        reason: r.reason,
        confidence: r.confidence,
        extracted: r.extracted,
        issues: r.issues.length > 0 ? r.issues : undefined,
      })),
      null,
      2,
    ),
    '```',
    '',
    '## Reproduce',
    '',
    '```bash',
    'python3 eval/live/generate_fixtures.py',
    'npm run eval:live   # requires GEMINI_API_KEY',
    '```',
    '',
  );

  writeFileSync(join(process.cwd(), 'eval', 'live-results.md'), lines.join('\n'), 'utf8');
  console.log(`\nWrote eval/live-results.md`);
  console.log(`Accepted: ${accepted.length}/${results.length}`);
  console.log(`Field accuracy: ${pct(matched, expected)}`);
  console.log(`Average latency: ${Math.round(averageLatency)}ms`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
