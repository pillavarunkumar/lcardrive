const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    host: process.env.SUPABASE_DB_HOST || 'db.crirgcykidzqabrqkthf.supabase.co',
    port: parseInt(process.env.SUPABASE_DB_PORT || '5432'),
    database: process.env.SUPABASE_DB_NAME || 'postgres',
    user: process.env.SUPABASE_DB_USER || 'postgres',
    password: process.env.SUPABASE_PASSWORD,
    ssl: { rejectUnauthorized: false },
    family: 4,
    connectionTimeoutMillis: 10000,
  });

  try {
    const res = await pool.query("ALTER TABLE instructors ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft'");
    console.log('Success:', res.command);

    const res2 = await pool.query("UPDATE instructors SET status = 'approved' WHERE status = 'draft'");
    console.log('Updated:', res2.rowCount, 'instructors');
  } catch (e) {
    console.log('Error:', e.message);
  }

  await pool.end();
}

main().catch(console.error);
