# LCAR Drive

A platform connecting learner drivers with driving instructors. Built with Next.js 14, Supabase, Clerk, and Tailwind CSS.

## Features

- **Search & Discovery** – Find instructors by suburb, rating, and service areas
- **Instructor Profiles** – Detailed profiles with rates, availability, service areas, and reviews
- **Claims System** – Instructors can claim and manage their profiles
- **Admin Dashboard** – Review, approve, import/export data, manage backups
- **AI Document Scanning** – Google Gemini-powered document verification
- **Leads Management** – Track student inquiries and leads
- **Authentication** – Clerk-powered auth with student and admin roles

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS 3
- **Database:** Supabase (PostgreSQL)
- **Auth:** Clerk
- **AI:** Google Generative AI (Gemini)
- **Icons:** Lucide React
- **Location:** LocationIQ API
- **Email:** Resend

## Getting Started

1. Clone the repo:
   ```bash
   git clone git@github.com:pillavarunkumar/lcardrive.git
   cd lcardrive
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment template and fill in your keys:
   ```bash
   cp .env.local.example .env.local
   ```

4. Apply Supabase migrations:
   ```bash
   node scripts/apply-migrations.mjs
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `LOCATIONIQ_API_KEY` | LocationIQ API key |
| `RESEND_API_KEY` | Resend API key for emails |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Optional model override; defaults to `gemini-3.5-flash` |

Admin access is controlled by the Clerk `publicMetadata.role` claim (`"admin"`).
There is no shared admin password or `ADMIN_SECRET`.

## Scripts

- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run start` – Start production server
- `npm run lint` – Run ESLint
- `npm test` – Run the Vitest suite (schema parsing, scan pipeline, API routes)
- `npm run eval` – Run the synthetic AI scanning evaluation and rewrite `eval/results.md`
- `npm run eval:live` – Run the 6-document live Gemini sample (needs `GEMINI_API_KEY`; not run in CI)

## AI Document Scanning

Instructors upload identity and compliance documents from the portal. Each file
is scanned by Google Gemini and the extracted fields are used to pre-fill the
profile, but a scan is never trusted blindly.

### Flow

1. `DocumentScanner` (`src/components/DocumentScanner.tsx`) posts the file to
   `POST /api/ai/scan-document`. The request contains only the file and
   `doc_type`; the user identity comes from the Clerk session.
2. The route enforces, in order: a Clerk session, a per-user rate limit
   (20 scans / 10 minutes), the document type allowlist, a 5MB size cap, and an
   image/PDF MIME allowlist backed by magic-byte sniffing.
3. `src/lib/ai/scan-service.ts` sends the image to Gemini with a 25 second
   timeout. Failures and invalid output are retried once. Calls request a bounded
   JSON response so newer models cannot spend the whole budget on hidden
   reasoning.
4. The reply is stripped of markdown fences and validated with a zod schema per
   document type (`src/lib/ai/document-schema.ts`). Unknown fields are dropped
   and dates must be `YYYY-MM-DD`.
5. A scan is auto-accepted only when the type-specific required field is present
   and confidence is at least `0.6`. Everything else — low confidence, missing
   required field, schema failure, timeout, or API error — is written to the
   `document_reviews` table for manual admin review instead of updating the
   instructor record.
6. Files are stored in the private `documents` bucket as
   `documents/<clerkId>/<docType>-<timestamp>.<ext>`. The portal and admin UI
   request 5-minute signed URLs from `/api/portal/documents/url` and
   `/api/admin/documents/[id]`, both of which check ownership or admin role.

Admins can open the document viewer from the instructors table (the
`folder_open` action) to see every uploaded file plus any pending reviews,
including the extracted fields, confidence, attempt count and the scanned file.

> **Rate limiting is per instance only.** The limiter in
> `src/lib/http/rate-limit.ts` is an in-memory fixed window. On Vercel, requests
> can land on different serverless instances, so the effective limit is
> `20 × instances` rather than a global 20. It raises the cost of abuse but is
> not a hard guarantee. Replace it with a shared store (Upstash Redis, Vercel KV)
> before relying on it for billing or security.

### Evaluation

`eval/run.ts` runs 20 synthetic documents (fake names, licence, policy and
registration numbers) through the real scan pipeline with a deterministic
Gemini stub. It exercises clean scans, fenced JSON, numeric-string coercion,
missing required fields, low confidence, malformed JSON, wrong types, and
timeouts, then writes `eval/results.md` and exits non-zero if any document that
should have gone to manual review was auto-accepted.

Latest results:

| Metric | Result |
| --- | --- |
| Synthetic documents | 20 |
| False-accept rate | 0.0% (0/8) |
| Field accuracy (accepted docs) | 100.0% (38/38) |
| Exact-document accuracy | 100.0% (12/12) |
| Average confidence (accepted) | 91.7% |
| Cases that needed a retry | 3 |

The stub keeps the evaluation free and deterministic in CI, but it measures the
validation, retry, timeout and routing logic — not Gemini's real-world OCR
accuracy. Re-run against the live model before changing the confidence
threshold or prompts.

#### Small live sample

Six generated synthetic images (clean, rotated and blurred licence, ADI, WWCC,
vehicle registration) were also sent to the real Gemini API through
`scanDocument`. This is reported separately from the deterministic evaluation
and is not a CI gate. Full output: `eval/live-results.md`.

| Metric | Result |
| --- | --- |
| Documents | 6 |
| Auto-accepted | 6/6 |
| Field accuracy (auto-accepted) | 100.0% (20/20) |
| Exact documents | 6/6 |
| Cases needing a retry | 0 |
| Average latency | 7.4s |

The sample ran on `gemini-3.1-flash-lite` because the free-tier key exhausted its
per-model daily quota on the default `gemini-3.5-flash` after the first four
documents. The scanner is model-agnostic via `GEMINI_MODEL`; these six clean
fixtures are an easy sample and do not establish real-world accuracy on messy
photos.

## Database Migrations

Migrations are in `supabase/migrations/`. Apply **only the new files** to an
existing database, because some historical migrations clean up duplicate rows:

```bash
node scripts/apply-migrations.mjs 00014_document_reviews.sql 00015_documents_bucket_private.sql
```

`00014` creates the manual review table and `00015` makes the `documents` bucket
private. Apply them before deploying the code that depends on them.

## License

Private – All rights reserved.
