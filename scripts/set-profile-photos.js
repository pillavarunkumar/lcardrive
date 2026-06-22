const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = Object.fromEntries(
  envContent.split('\n').filter(Boolean).map((l) => l.split('=')).map(([k, ...v]) => [k.trim(), v.join('=').trim()])
);

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

const DRIVER_PHOTOS = [
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1546456073-6712f79251bb?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
];

async function main() {
  const { data: instructors, error } = await supabase
    .from('instructors')
    .select('id, first_name, last_name, profile_photo_url')
    .is('profile_photo_url', null);

  if (error) {
    console.error('Query error:', error);
    process.exit(1);
  }

  console.log(`Found ${instructors.length} instructors without photos`);

  for (let i = 0; i < instructors.length; i++) {
    const inst = instructors[i];
    const photo = DRIVER_PHOTOS[i % DRIVER_PHOTOS.length];

    const { error: updateError } = await supabase
      .from('instructors')
      .update({ profile_photo_url: photo })
      .eq('id', inst.id);

    if (updateError) {
      console.error(`Failed to update ${inst.first_name} ${inst.last_name}:`, updateError.message);
    } else {
      console.log(`✓ ${inst.first_name} ${inst.last_name} -> photo assigned`);
    }
  }

  console.log('Done!');
}

main();
