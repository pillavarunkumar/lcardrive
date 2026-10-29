import pkg from 'pg';
const { Client } = pkg;
import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer); }));
}

async function main() {
  let dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    const projectRef = 'crirgcykidzqabrqkthf';
    const password = await ask('Enter your Supabase database password (find it at Dashboard > Project Settings > Database): ');
    dbUrl = `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`;
  }

  console.log('Connecting to database...');
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  console.log('Connected.\n');

  const migrationsDir = resolve(__dirname, '../supabase/migrations');
  let files = readdirSync(migrationsDir).sort().filter((file) => file.endsWith('.sql'));

  // Optional arguments apply only the named migrations, e.g.
  //   node scripts/apply-migrations.mjs 00014_document_reviews.sql 00015_documents_bucket_private.sql
  // This avoids replaying historical migrations (some of which clean up or
  // rewrite existing rows) against a database that is already set up.
  const requested = process.argv.slice(2);
  if (requested.length > 0) {
    const missing = requested.filter((name) => !files.includes(name));
    if (missing.length > 0) {
      console.error(`Unknown migration(s): ${missing.join(', ')}`);
      console.error(`Available: ${files.join(', ')}`);
      process.exit(1);
    }
    files = files.filter((file) => requested.includes(file));
  } else {
    console.warn(
      'No migration names supplied: applying ALL migrations. On an existing database prefer naming only the new ones.',
    );
  }

  for (const file of files) {
    const sql = readFileSync(resolve(migrationsDir, file), 'utf-8');
    process.stdout.write(`Applying ${file}...`);
    try {
      await client.query(sql);
      console.log(' OK');
    } catch (err) {
      console.log(` FAILED — ${err.message}`);
    }
  }

  await client.end();
  console.log('\nDone! Now restart your Next.js dev server for PostgREST to refresh its schema cache.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
