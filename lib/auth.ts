import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getToken } from 'next-auth/jwt';

export interface AuthenticatedUser {
  id: string;
  role: string;
  email: string;
  name?: string;
}

/**
 * Resolves the authenticated user from either NextAuth session cookies (Web)
 * or the Authorization Bearer header JWT token (React Native / Mobile).
 * 
 * @param req NextRequest
 * @returns AuthenticatedUser | null
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  // 1. Try getting session via cookies (Web client)
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      return {
        id: session.user.id,
        role: session.user.role,
        email: session.user.email,
        name: session.user.name || undefined,
      };
    }
  } catch (error) {
    console.error('Error fetching session cookies:', error);
  }

  // 2. Try getting JWT token from Authorization header or cookies (Mobile client)
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    if (token) {
      return {
        id: token.id as string,
        role: token.role as string,
        email: token.email as string,
        name: (token.name as string) || undefined,
      };
    }
  } catch (error) {
    console.error('Error decoding NextAuth JWT token:', error);
  }

  return null;
}
