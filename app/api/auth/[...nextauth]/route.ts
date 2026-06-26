import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { loginSchema } from '@/lib/schemas/user';

/**
 * NextAuth.js Configuration
 * 
 * Implements secure authentication with:
 * - JWT strategy with HTTP-only cookies
 * - Secure cookie flags (HttpOnly, Secure, SameSite)
 * - Session management
 * 
 * Validates Requirements:
 * - 1.2: Verify credentials and create session
 * - 1.4: Session expiration and redirect
 * - 1.5: Secure session management with HTTP-only cookies
 * - 1.6: Logout and session termination
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate input format
        const validationResult = loginSchema.safeParse(credentials);
        if (!validationResult.success) {
          throw new Error('Invalid email or password format');
        }

        const { email, password } = validationResult.data;

        try {
          // TODO: Replace this mock implementation with actual backend API call
          // For development/demo purposes, we're using hardcoded credentials
          
          // Mock superadmin credentials for development
          const mockSuperadmin = {
            email: 'admin@phelbo.com',
            password: 'admin123', // In production, this would be verified against a hashed password
          };

          // Verify credentials
          if (email !== mockSuperadmin.email || password !== mockSuperadmin.password) {
            throw new Error('Invalid email or password');
          }

          // Return user object for session
          return {
            id: 'superadmin-1',
            email: mockSuperadmin.email,
            name: 'Super Admin',
            role: 'superadmin',
            accessToken: 'mock-access-token', // In production, this comes from the backend
          };

          /* 
          // Uncomment this block when you have a real backend API:
          
          const response = await fetch(
            `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/auth/login`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, password }),
            }
          );

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Invalid credentials');
          }

          const data = await response.json();

          // Verify user is a superadmin
          if (data.user?.role !== 'superadmin') {
            throw new Error('Insufficient permissions');
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            accessToken: data.accessToken,
          };
          */
        } catch (error) {
          console.error('Authentication error:', error);
          throw error;
        }
      },
    }),
  ],

  // Use JWT strategy for stateless authentication
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },

  // JWT configuration
  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours
  },

  // Secure cookie configuration
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true, // Prevent client-side JavaScript access
        sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
        path: '/',
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production'
        ? `__Secure-next-auth.callback-url`
        : `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production'
        ? `__Host-next-auth.csrf-token`
        : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  // Callback functions
  callbacks: {
    // Extend JWT with user data and access token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },

    // Expose user data in session
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          role: token.role as string,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },

  // Custom pages
  pages: {
    signIn: '/login',
    error: '/login',
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
