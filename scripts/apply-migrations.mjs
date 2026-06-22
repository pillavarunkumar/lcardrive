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
  const files = readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (!file.endsWith('.sql')) continue;
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
