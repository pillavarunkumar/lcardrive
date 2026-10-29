# AI document scanning — evaluation results

Generated: 2026-10-29T05:45:09.172Z

> All documents in this evaluation are synthetic. Names, licence numbers,
> policy numbers and dates are invented and match no real person or vehicle.
> The Gemini client is replaced by deterministic fixtures so the harness costs
> nothing and can run in CI. Schema validation, retries, timeouts and the
> manual-review routing are exercised exactly as they are in production.

## Summary

| Metric | Result |
| --- | --- |
| Synthetic documents | 20 |
| Should auto-accept | 12 |
| Should route to manual review | 8 |
| Auto-accepted | 12 |
| Routed to manual review | 8 |
| **False-accept rate** | **0.0%** (0/8) |
| **Field accuracy (accepted docs)** | **100.0%** (38/38) |
| Exact-document accuracy | 100.0% (12/12) |
| Average confidence (accepted) | 91.7% |
| Cases that needed a retry | 3 |

False accept = a document that should *not* be trusted automatically was
accepted without human review. Schema-invalid, low-confidence, missing-required-
field and timed-out scans all count as false accepts if they slip through.

## Per-document results

| Case | Type | Scenario | Expected | Actual | Attempts | Confidence | Field match |
| --- | --- | --- | --- | --- | --- | --- | --- |
| dl-001 | drivers_licence | Clean NSW-style licence, high confidence | accept | accept | 1 | 96% | 3/3 |
| dl-002 | drivers_licence | Markdown-fenced JSON reply | accept | accept | 1 | 91% | 3/3 |
| dl-003 | drivers_licence | Missing licence number (required field) | review | review (required_field_missing) | 1 | 88% | — |
| dl-004 | drivers_licence | Low model confidence | review | review (low_confidence) | 1 | 31% | — |
| dl-005 | drivers_licence | Malformed JSON on both attempts | review | review (invalid_json) | 2 | 0% | — |
| dl-006 | drivers_licence | Wrong type for licence number | review | review (required_field_missing) | 1 | 93% | — |
| dl-007 | drivers_licence | First reply malformed, retry succeeds | accept | accept | 2 | 90% | 3/3 |
| adi-001 | adi_registration | Clean ADI certificate | accept | accept | 1 | 95% | 3/3 |
| adi-002 | adi_registration | Extra unknown fields are stripped | accept | accept | 1 | 89% | 3/3 |
| adi-003 | adi_registration | Confidence delivered as a numeric string | accept | accept | 1 | 88% | 3/3 |
| adi-004 | adi_registration | Low confidence ADI scan | review | review (low_confidence) | 1 | 55% | — |
| cert-001 | certificate_iv | Certificate IV with fenced JSON | accept | accept | 1 | 94% | 3/3 |
| cert-002 | certificate_iv | Certificate reference missing | review | review (required_field_missing) | 1 | 90% | — |
| wwcc-001 | wwcc | Clean WWCC card | accept | accept | 1 | 97% | 3/3 |
| wwcc-002 | wwcc | Gemini call times out on both attempts | review | review (timeout) | 2 | 0% | — |
| police-001 | police_check | Clean police check | accept | accept | 1 | 92% | 2/2 |
| medical-001 | medical_assessment | Assessment date present, expiry absent | accept | accept | 1 | 85% | 3/3 |
| liability-001 | public_liability | Clean public liability certificate | accept | accept | 1 | 93% | 4/4 |
| vehicle-001 | vehicle_registration | Year returned as a string | accept | accept | 1 | 90% | 5/5 |
| vehicle-002 | vehicle_registration | Registration number returned as a number | review | review (required_field_missing) | 1 | 90% | — |

## Reproduce

```bash
npm run eval
```

The script writes this file (`eval/results.md`) and exits non-zero if any
false accept is detected.
