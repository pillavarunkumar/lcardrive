# AI document scanning — small live sample

Generated: 2026-10-29T05:44:33.000Z

Model: `gemini-3.1-flash-lite`

> **This is a small live sample, not the main evaluation.** Six synthetic
> images (invented names and numbers) were sent to the real Gemini API through
> `scanDocument`. Results are reported as observed and are not used as a
> pass/fail gate. The main deterministic evaluation is in `eval/results.md`.

## Summary

| Metric | Result |
| --- | --- |
| Documents | 6 |
| Auto-accepted | 6/6 |
| Routed to manual review | 0/6 |
| Field accuracy (auto-accepted) | 100.0% (20/20) |
| Exact documents (auto-accepted) | 6/6 |
| Cases needing a retry | 0 |
| Average latency | 7420ms |

## Per-document results

| Case | Type | Scenario | Status | Confidence | Attempts | Latency | Fields |
| --- | --- | --- | --- | --- | --- | --- | --- |
| live-dl-clean | drivers_licence | Clean synthetic driver licence | accepted | 100% | 1 | 3078ms | 3/3 |
| live-dl-rotated | drivers_licence | Licence rotated by 6 degrees | accepted | 100% | 1 | 1817ms | 3/3 |
| live-dl-blurry | drivers_licence | Licence with gaussian blur | accepted | 100% | 1 | 6686ms | 3/3 |
| live-adi | adi_registration | Synthetic ADI registration certificate | accepted | 100% | 1 | 3326ms | 3/3 |
| live-wwcc | wwcc | Synthetic WWCC card | accepted | 100% | 1 | 14058ms | 3/3 |
| live-vehicle | vehicle_registration | Synthetic vehicle registration certificate | accepted | 100% | 1 | 15556ms | 5/5 |

## Extract output

```json
[
  {
    "case": "live-dl-clean",
    "status": "accepted",
    "reason": null,
    "confidence": 1,
    "extracted": {
      "full_name": "Alex Sample",
      "licence_number": "SYN-100001",
      "expiry_date": "2029-03-14"
    }
  },
  {
    "case": "live-dl-rotated",
    "status": "accepted",
    "reason": null,
    "confidence": 1,
    "extracted": {
      "full_name": "Bailey Example",
      "licence_number": "SYN-100002",
      "expiry_date": "2028-11-02"
    }
  },
  {
    "case": "live-dl-blurry",
    "status": "accepted",
    "reason": null,
    "confidence": 1,
    "extracted": {
      "full_name": "Casey Fiction",
      "licence_number": "SYN-100003",
      "expiry_date": "2030-01-01"
    }
  },
  {
    "case": "live-adi",
    "status": "accepted",
    "reason": null,
    "confidence": 1,
    "extracted": {
      "full_name": "Grace Example",
      "adi_registration": "ADI-SYN-2001",
      "adi_registration_expiry": "2028-02-29"
    }
  },
  {
    "case": "live-wwcc",
    "status": "accepted",
    "reason": null,
    "confidence": 1,
    "extracted": {
      "full_name": "Morgan Mock",
      "wwcc_number": "WWC-SYN-4001",
      "wwcc_expiry": "2032-01-15"
    }
  },
  {
    "case": "live-vehicle",
    "status": "accepted",
    "reason": null,
    "confidence": 1,
    "extracted": {
      "vehicle_make": "Toyota",
      "vehicle_model": "Corolla",
      "vehicle_year": 2021,
      "vehicle_rego": "SYN-123",
      "vehicle_color": "White"
    }
  }
]
```

## Reproduce

```bash
python3 eval/live/generate_fixtures.py
npm run eval:live   # requires GEMINI_API_KEY
```
