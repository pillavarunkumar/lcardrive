const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      process.env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const crypto = require('crypto');

function gravatarUrl(email) {
  const emailClean = email.trim().toLowerCase();
  const hex = crypto.createHash('md5').update(emailClean).digest('hex');
  return `https://www.gravatar.com/avatar/${hex}?d=404&s=200`;
}

async function main() {
  const { data: instructors, error } = await supabase.from('instructors').select('id, email, first_name, last_name, clerk_user_id');
  if (error) { console.error('Fetch error:', error.message); process.exit(1); }

  console.log(`Found ${instructors.length} instructors\n`);
  let updated = 0;
  for (const inst of instructors) {
    // Signed-in instructors use their Clerk/Google profile photo, so never
    // replace it with a generated avatar.
    if (inst.clerk_user_id) {
      console.log(`  SKIP ${inst.first_name} ${inst.last_name} — linked to a Clerk account`);
      continue;
    }
    if (!inst.email) {
      console.log(`  SKIP ${inst.first_name} ${inst.last_name} — no email`);
      continue;
    }
    const url = gravatarUrl(inst.email);
    const { error: upErr } = await supabase.from('instructors').update({ profile_photo_url: url }).eq('id', inst.id);
    if (upErr) {
      console.log(`  FAIL ${inst.first_name} ${inst.last_name} — ${upErr.message}`);
    } else {
      console.log(`  OK   ${inst.first_name} ${inst.last_name}`);
      updated++;
    }
  }
  console.log(`\nDone. ${updated} instructors updated.`);
}

main().catch(console.error);
