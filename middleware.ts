import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/**
 * Middleware to protect dashboard and mobile routes
 * 
 * Verifies authenticated session and role before allowing access.
 * - superadmin -> has access to admin dashboard and mobile
 * - fieldworker -> has access to mobile dashboard and attendance APIs
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If no token exists, the user is unauthenticated
    if (!token) {
      if (path.startsWith('/mobile')) {
        return NextResponse.redirect(new URL('/mobile/login', req.url));
      }
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Role-based access control
    
    // 1. Mobile interface and Attendance API access
    if (path.startsWith('/mobile') || path.startsWith('/api/attendance')) {
      if (token.role === 'fieldworker' || token.role === 'superadmin') {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/mobile/login', req.url));
    }

    // 2. Admin dashboard access (everything else matched by middleware)
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
      // Set to true so middleware always runs for matched routes, allowing custom redirect logic
      authorized: () => true,
    },
  }
);

/**
 * Configure which routes require authentication
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /login (admin login)
     * - /mobile/login (field worker login)
     * - /api/auth/* (NextAuth.js endpoints)
     * - /_next/* (Next.js internals)
     * - /favicon.ico, /robots.txt (static files)
     */
    '/((?!login|mobile/login|api/auth|_next|favicon.ico|robots.txt|.*\\..*$).*)',
  ],
};

