import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/admin(/?.*)',
  '/api/admin(/?.*)',
  '/portal(/?.*)',
  '/api/portal(/?.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Skip auth for login pages/endpoints so they can handle auth flow themselves
  if (pathname === '/admin/login' || pathname === '/api/admin/login-via-clerk' || pathname === '/login' || pathname === '/signup') {
    return NextResponse.next();
  }

  if (isProtectedRoute(req)) {
    auth().protect();
  }

  const response = NextResponse.next();

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  response.headers.set('x-pathname', pathname);
  return response;
});

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
