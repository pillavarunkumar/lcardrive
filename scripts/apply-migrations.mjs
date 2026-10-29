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

function selectFiles() {
  const migrationsDir = resolve(__dirname, '../supabase/migrations');
  const allFiles = readdirSync(migrationsDir).sort().filter((file) => file.endsWith('.sql'));
  const requested = process.argv.slice(2);

  // Named arguments apply only those migrations, e.g.
  //   node scripts/apply-migrations.mjs 00014_document_reviews.sql 00015_documents_bucket_private.sql
  // This avoids replaying historical migrations (some of which clean up or
  // rewrite existing rows) against a database that is already set up.
  if (requested.length === 0) {
    console.error('Refusing to apply every migration to an existing database.');
    console.error('Pass --all for a fresh database, or name the migrations to apply.');
    console.error(`Available: ${allFiles.join(', ')}`);
    process.exit(1);
  }

  if (requested.length === 1 && requested[0] === '--all') {
    console.warn('Applying ALL migrations. Use this only on a fresh database.\n');
    return { migrationsDir, files: allFiles };
  }

  const missing = requested.filter((name) => !allFiles.includes(name));
  if (missing.length > 0) {
    console.error(`Unknown migration(s): ${missing.join(', ')}`);
    console.error(`Available: ${allFiles.join(', ')}`);
    process.exit(1);
  }

  return { migrationsDir, files: allFiles.filter((file) => requested.includes(file)) };
}

async function main() {
  const { migrationsDir, files } = selectFiles();

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

  let failures = 0;
  for (const file of files) {
    const sql = readFileSync(resolve(migrationsDir, file), 'utf-8');
    process.stdout.write(`Applying ${file}...`);
    try {
      await client.query(sql);
      console.log(' OK');
    } catch (err) {
      failures += 1;
      console.log(` FAILED — ${err.message}`);
    }
  }

  await client.end();
  console.log('\nDone! Now restart your Next.js dev server for PostgREST to refresh its schema cache.');
  if (failures > 0) {
    console.error(`${failures} migration(s) failed. Review the errors above before continuing.`);
    process.exitCode = 1;
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
