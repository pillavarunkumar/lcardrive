import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-session';

const isAdminLoginRoute = createRouteMatcher(['/admin/login']);

export default async function middleware(req: NextRequest, event: any) {
  const { pathname } = req.nextUrl;

  // Block ALL admin pages (except login) - check session FIRST
  if (pathname.startsWith('/admin') && !isAdminLoginRoute(req)) {
    const adminSession = req.cookies.get('admin_session')?.value;
    if (!adminSession || !(await verifyAdminSession(adminSession).catch(() => false))) {
      const redirectRes = NextResponse.redirect(new URL('/admin/login', req.url));
      redirectRes.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      redirectRes.headers.set('Pragma', 'no-cache');
      redirectRes.headers.set('Expires', '0');
      return redirectRes;
    }
  }

  // Block ALL admin API routes (except login endpoints)
  if (pathname.startsWith('/api/admin') &&
      pathname !== '/api/admin/login' &&
      pathname !== '/api/admin/login-via-clerk' &&
      pathname !== '/api/admin/logout') {
    const adminSession = req.cookies.get('admin_session')?.value;
    if (!adminSession || !(await verifyAdminSession(adminSession).catch(() => false))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Run Clerk middleware for routes that need auth()
  if (pathname.startsWith('/portal') || pathname.startsWith('/api/portal') || pathname === '/api/admin/login-via-clerk') {
    return clerkMiddleware((auth) => {
      auth().protect();
    })(req, event);
  }

  // Forward pathname to server components via header
  const response = NextResponse.next();

  // Prevent caching of admin pages to avoid serving stale content after logout
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  response.headers.set('x-pathname', pathname);
  return response;
}

export const config = {
  matcher: [
    '/admin(/?.*)',
    '/api/admin(/?.*)',
    '/portal(/?.*)',
    '/login',
    '/signup',
    '/sso-callback',
    '/(api|trpc)(.*)',
  ],
};
