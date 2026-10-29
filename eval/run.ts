import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { scanDocument } from '../src/lib/ai/scan-service';
import { TimeoutError } from '../src/lib/ai/gemini';
import { evalCases, type EvalCase } from './fixtures';

interface CaseResult {
  fixture: EvalCase;
  status: 'accepted' | 'needs_review';
  reason: string | null;
  confidence: number;
  attempts: number;
  extracted: Record<string, unknown>;
  matchedFields: number;
  expectedFields: number;
  exact: boolean;
}

async function runCase(fixture: EvalCase): Promise<CaseResult> {
  let call = 0;

  const outcome = await scanDocument({
    docType: fixture.docType,
    bytes: Buffer.from(`synthetic-document:${fixture.id}`),
    mimeType: 'image/png',
    timeoutMs: 50,
    retries: 1,
    generator: async () => {
      if (fixture.failWith === 'timeout') {
        throw new TimeoutError(50);
      }
      const index = Math.min(call, fixture.modelResponses.length - 1);
      call += 1;
      return fixture.modelResponses[index] ?? '';
    },
  });

  let matchedFields = 0;
  let expectedFields = 0;

  if (fixture.expected) {
    for (const [key, expectedValue] of Object.entries(fixture.expected)) {
      expectedFields += 1;
      if (outcome.extracted[key] === expectedValue) matchedFields += 1;
    }
  }

  return {
    fixture,
    status: outcome.status,
    reason: outcome.reason,
    confidence: outcome.confidence,
    attempts: outcome.attempts,
    extracted: outcome.extracted,
    matchedFields,
    expectedFields,
    exact: expectedFields > 0 && matchedFields === expectedFields,
  };
}

function pct(value: number, total: number): string {
  if (total === 0) return 'n/a';
  return `${((value / total) * 100).toFixed(1)}%`;
}

async function main() {
  const results = await Promise.all(evalCases.map(runCase));

  const acceptable = results.filter((r) => r.fixture.shouldAccept);
  const unacceptable = results.filter((r) => !r.fixture.shouldAccept);
  const accepted = results.filter((r) => r.status === 'accepted');
  const reviewed = results.filter((r) => r.status === 'needs_review');

  const trueAccepts = accepted.filter((r) => r.fixture.shouldAccept);
  const falseAccepts = accepted.filter((r) => !r.fixture.shouldAccept);

  const matchedFields = trueAccepts.reduce((sum, r) => sum + r.matchedFields, 0);
  const expectedFields = trueAccepts.reduce((sum, r) => sum + r.expectedFields, 0);
  const exactDocs = trueAccepts.filter((r) => r.exact).length;
  const retried = results.filter((r) => r.attempts > 1);
  const avgConfidence =
    trueAccepts.length > 0
      ? trueAccepts.reduce((sum, r) => sum + r.confidence, 0) / trueAccepts.length
      : 0;

  const generatedAt = new Date().toISOString();

  const lines: string[] = [
    '# AI document scanning — evaluation results',
    '',
    `Generated: ${generatedAt}`,
    '',
    '> All documents in this evaluation are synthetic. Names, licence numbers,',
    '> policy numbers and dates are invented and match no real person or vehicle.',
    '> The Gemini client is replaced by deterministic fixtures so the harness costs',
    '> nothing and can run in CI. Schema validation, retries, timeouts and the',
    '> manual-review routing are exercised exactly as they are in production.',
    '',
    '## Summary',
    '',
    '| Metric | Result |',
    '| --- | --- |',
    `| Synthetic documents | ${results.length} |`,
    `| Should auto-accept | ${acceptable.length} |`,
    `| Should route to manual review | ${unacceptable.length} |`,
    `| Auto-accepted | ${accepted.length} |`,
    `| Routed to manual review | ${reviewed.length} |`,
    `| **False-accept rate** | **${pct(falseAccepts.length, unacceptable.length)}** (${falseAccepts.length}/${unacceptable.length}) |`,
    `| **Field accuracy (accepted docs)** | **${pct(matchedFields, expectedFields)}** (${matchedFields}/${expectedFields}) |`,
    `| Exact-document accuracy | ${pct(exactDocs, trueAccepts.length)} (${exactDocs}/${trueAccepts.length}) |`,
    `| Average confidence (accepted) | ${(avgConfidence * 100).toFixed(1)}% |`,
    `| Cases that needed a retry | ${retried.length} |`,
    '',
    'False accept = a document that should *not* be trusted automatically was',
    'accepted without human review. Schema-invalid, low-confidence, missing-required-',
    'field and timed-out scans all count as false accepts if they slip through.',
    '',
    '## Per-document results',
    '',
    '| Case | Type | Scenario | Expected | Actual | Attempts | Confidence | Field match |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ];

  for (const result of results) {
    const expected = result.fixture.shouldAccept ? 'accept' : 'review';
    const actual = result.status === 'accepted' ? 'accept' : `review (${result.reason ?? 'unknown'})`;
    const fieldMatch = result.fixture.expected
      ? `${result.matchedFields}/${result.expectedFields}`
      : '—';
    lines.push(
      `| ${result.fixture.id} | ${result.fixture.docType} | ${result.fixture.description} | ${expected} | ${actual} | ${result.attempts} | ${(result.confidence * 100).toFixed(0)}% | ${fieldMatch} |`,
    );
  }

  lines.push(
    '',
    '## Reproduce',
    '',
    '```bash',
    'npm run eval',
    '```',
    '',
    'The script writes this file (`eval/results.md`) and exits non-zero if any',
    'false accept is detected.',
    '',
  );

  const targetDir = join(process.cwd(), 'eval');
  mkdirSync(targetDir, { recursive: true });
  writeFileSync(join(targetDir, 'results.md'), lines.join('\n'), 'utf8');

  console.log(`Wrote eval/results.md`);
  console.log(
    `False accepts: ${falseAccepts.length}/${unacceptable.length} (${pct(falseAccepts.length, unacceptable.length)})`,
  );
  console.log(`Field accuracy: ${pct(matchedFields, expectedFields)}`);
  console.log(`Exact documents: ${exactDocs}/${trueAccepts.length}`);

  if (falseAccepts.length > 0) {
    console.error('Evaluation failed: false accepts detected.');
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
