import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/**
 * Middleware to protect dashboard routes
 * 
 * Verifies authenticated superadmin session before allowing access
 * to protected routes. Redirects unauthenticated users to login.
 * 
 * Validates Requirements:
 * - 1.4: Redirect to login when session expires or is missing
 * - 1.2: Verify superadmin session on protected routes
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // Verify user has superadmin role
    if (token?.role !== 'superadmin') {
      // Redirect to login if not superadmin
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only execute middleware if user is authenticated
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

/**
 * Configure which routes require authentication
 * 
 * Protected routes:
 * - /dashboard/* - All dashboard pages
 * - /users/* - User management pages
 * - /api/* - API routes (except auth)
 * 
 * Public routes:
 * - /login - Login page
 * - /api/auth/* - NextAuth.js endpoints
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /login (login page)
     * - /api/auth/* (NextAuth.js endpoints)
     * - /_next/* (Next.js internals)
     * - /favicon.ico, /robots.txt (static files)
     */
    '/((?!login|api/auth|_next|favicon.ico|robots.txt|.*\\..*$).*)',
  ],
};
