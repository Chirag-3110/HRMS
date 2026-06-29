import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { loginSchema } from '@/lib/schemas/user';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { normalizeEmail } from '@/lib/auth';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * NextAuth.js Configuration
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
        const normalizedEmail = normalizeEmail(email);

        try {
          await connectDB();
          const user = await User.findOne({ email: normalizedEmail });

          if (!user) {
            throw new Error('Invalid email or password');
          }

          if (user.status !== 'active') {
            throw new Error('Your account is deactivated. Please contact admin.');
          }

          // Check password
          const hashedPassword = hashPassword(password);
          if (user.password && user.password !== hashedPassword) {
            throw new Error('Invalid email or password');
          }

          // Map role for session: 'Admin' -> 'superadmin', others lowercase
          let sessionRole = user.role.toLowerCase();
          if (user.role === 'Admin') {
            sessionRole = 'superadmin';
          }

          // Return user object for session
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.fullName,
            role: sessionRole,
            tenantId: user.tenantId || null,
            accessToken: 'mock-access-token',
          };
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
        token.tenantId = (user as any).tenantId || null;
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
          tenantId: token.tenantId as string || null,
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
