import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/portal(.*)',
]);

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

const isAdminLoginRoute = createRouteMatcher([
  '/admin/login',
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }

  if (isAdminRoute(req) && !isAdminLoginRoute(req)) {
    const adminSession = req.cookies.get('admin_session');
    if (!adminSession?.value) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|gif|png|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
