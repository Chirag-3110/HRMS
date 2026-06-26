import 'next-auth';
import 'next-auth/jwt';

/**
 * Extend NextAuth types to include custom user properties
 * 
 * Adds id, role, and accessToken to the user and token interfaces
 */
declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    accessToken?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: string;
    accessToken?: string;
  }
}
