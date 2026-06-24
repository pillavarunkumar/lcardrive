import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

export default async function AdminServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  // Don't check session for login page (allows OAuth callback to flow through)
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session')?.value;
  const isValid = await verifyAdminSession(adminSession);

  if (!isValid) {
    redirect('/admin/login');
  }

  return <>{children}</>;
}
