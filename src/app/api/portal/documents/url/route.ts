import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  createSignedDocumentUrl,
  documentPathBelongsToUser,
  normalizeDocumentPath,
} from '@/lib/storage/documents';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const value = req.nextUrl.searchParams.get('path');
  const path = normalizeDocumentPath(value);

  if (!path) {
    return NextResponse.json({ error: 'Invalid document path' }, { status: 400 });
  }

  if (!documentPathBelongsToUser(path, userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = await createSignedDocumentUrl(path, 300);
  if (!url) {
    return NextResponse.json({ error: 'Document not available' }, { status: 404 });
  }

  return NextResponse.json({ url });
}
