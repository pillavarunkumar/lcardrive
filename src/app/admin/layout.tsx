import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function AdminServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  // Allow login page to render so it can handle auth flow
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const user = await currentUser();

  if (!user) {
    redirect('/admin/login');
  }

  const isAdmin = user.publicMetadata?.role === 'admin';

  if (!isAdmin) {
    redirect('/portal');
  }

  return <>{children}</>;
}
