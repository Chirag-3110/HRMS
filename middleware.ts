import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/**
 * Proxy (formerly middleware) to protect dashboard and mobile routes.
 *
 * Verifies authenticated session and role before allowing access.
 * - superadmin  -> admin dashboard + mobile
 * - fieldworker -> mobile dashboard + attendance APIs
 */
export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Unauthenticated — redirect to appropriate login
    if (!token) {
      if (path.startsWith('/mobile')) {
        return NextResponse.redirect(new URL('/mobile/login', req.url));
      }
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // 1. Mobile interface and Attendance API access
    if (path.startsWith('/mobile') || path.startsWith('/api/attendance')) {
      if (token.role === 'fieldworker' || token.role === 'superadmin') {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/mobile/login', req.url));
    }

    // 2. Admin dashboard — superadmin only
    if (token.role !== 'superadmin') {
      if (token.role === 'fieldworker') {
        return NextResponse.redirect(new URL('/mobile', req.url));
      }
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Always run so custom redirect logic above can execute
      authorized: () => true,
    },
  }
);

/**
 * Routes that require authentication check.
 * Excludes: login pages, NextAuth endpoints, Next.js internals, static assets.
 * NOTE: mobile/login must come before login in the lookahead.
 */
export const config = {
  matcher: [
    '/((?!mobile/login|login|api/auth|api/mobile/login|_next|favicon\\.ico|robots\\.txt|.*\\..*$).*)',
  ],
};
