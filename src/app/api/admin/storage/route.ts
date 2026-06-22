import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ALLOWED_BUCKETS = ['documents', 'profile-photos', 'vehicle-photos'] as const;

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const bucket = (formData.get('bucket') as string) || 'documents';
  const folder = (formData.get('folder') as string) || 'uploads';

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!ALLOWED_BUCKETS.includes(bucket as typeof ALLOWED_BUCKETS[number])) {
    return NextResponse.json({ error: `Invalid bucket. Must be one of: ${ALLOWED_BUCKETS.join(', ')}` }, { status: 400 });
  }

  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { upsert: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return NextResponse.json({ path: data.path, url: urlData.publicUrl });
}

export async function DELETE(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { path, bucket } = await request.json();

  if (!path) {
    return NextResponse.json({ error: 'No path provided' }, { status: 400 });
  }

  const { error } = await supabase.storage
    .from(bucket || 'documents')
    .remove([path]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
