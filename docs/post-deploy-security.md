# Post-deploy security checklist

Run these after applying migrations `00014` and `00015` and deploying the new
code. Replace `https://app.example.com` with the deployment URL.

## Before deploying

1. Apply **only** the new migrations, in order:

   ```bash
   node scripts/apply-migrations.mjs 00014_document_reviews.sql 00015_documents_bucket_private.sql
   ```

2. Confirm the bucket is private and the old permissive policies are gone:

   ```sql
   select id, public, file_size_limit, allowed_mime_types
   from storage.buckets where id = 'documents';

   select policyname, cmd from pg_policies
   where schemaname = 'storage' and tablename = 'objects'
     and policyname like '%documents%';
   ```

   `public` must be `false`. There should be no authenticated-wide insert or
   select policy for the `documents` bucket.

3. Pick an instructor with a document uploaded before this change. Its column
   holds a full public-style URL. Open the admin instructors table, click
   `folder_open`, and confirm the old file still loads through a signed URL.

## Unauthenticated checks

```bash
BASE=https://app.example.com

# 1. Scan endpoint must reject anonymous callers
curl -sS -o /tmp/scan.json -w '%{http_code}\n' -X POST "$BASE/api/ai/scan-document"
# expect 401

# 2. Seed endpoints must reject anonymous callers
for path in /api/seed /api/seed/australia /api/seed/new-30; do
  curl -sS -o /dev/null -w "$path %{http_code}\n" "$BASE$path"
done
# expect 403 for all three

# 3. Public search must not expose private columns
curl -sS "$BASE/api/search?suburb=Sydney" > /tmp/search.json
grep -Ei 'email|phone|licence|wwcc|clerk_user_id|_image_url' /tmp/search.json && echo 'LEAK' || echo 'no private fields'
```

## Authenticated checks

Use a normal instructor account. Copy the Clerk session cookie from the browser
devtools into `COOKIE`, then:

```bash
# 4. A renamed executable must be rejected, not scanned
printf 'MZ fake executable contents' > /tmp/fake.jpg
curl -sS -o /tmp/upload.json -w '%{http_code}\n' \
  -H "Cookie: $COOKIE" \
  -F 'file=@/tmp/fake.jpg;type=image/jpeg' \
  -F 'doc_type=drivers_licence' \
  "$BASE/api/ai/scan-document"
# expect 415

# 5. A file over 5MB must be rejected before Gemini is called
# expect 413
```

## Admin checks

As an admin, open the document viewer and inspect a signed URL:

```bash
# Replace with the signedUrl returned by /api/admin/documents/<id>
curl -sS -o /tmp/doc.pdf -w '%{http_code}\n' "$SIGNED_URL"
# expect 200

sleep 310
curl -sS -o /dev/null -w '%{http_code}\n' "$SIGNED_URL"
# expect 400/403 once the 5-minute signature has expired
```

Confirm a non-admin instructor receives `403` from
`/api/admin/documents/<id>`.

## Past-abuse review

The scan route and the three seed routes were unauthenticated until this change.

- Check the Google AI Studio usage dashboard for spikes before the deployment.
- Check for unexpected rows created by the public seed endpoints:

  ```sql
  select date_trunc('hour', created_at) as hour, count(*)
  from instructors
  group by 1 order by 1 desc limit 48;

  select count(*) from document_reviews;
  ```

- If anything looks unexplained, rotate `GEMINI_API_KEY` and
  `SUPABASE_SERVICE_KEY` in Vercel and in the local `.env.local`.
