import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getToken } from 'next-auth/jwt';
import punycode from 'punycode';

export interface AuthenticatedUser {
  id: string;
  role: string;
  email: string;
  name?: string;
  tenantId?: string | null;
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
        tenantId: (session.user as any).tenantId || null,
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
        tenantId: token.tenantId as string || null,
      };
    }
  } catch (error) {
    console.error('Error decoding NextAuth JWT token:', error);
  }

  return null;
}

/**
 * Normalizes email address by:
 * 1. Converting to lower case and trimming.
 * 2. Decoding Punycode-encoded domain names (e.g. from smart hyphens / en-dash).
 * 3. Replacing common Unicode dash-like characters with standard ASCII hyphens.
 */
export function normalizeEmail(email: string): string {
  if (!email) return '';
  let normalized = email.toLowerCase().trim();

  const parts = normalized.split('@');
  if (parts.length === 2) {
    const [local, domain] = parts;
    try {
      // Decode domain if it's Punycode (e.g. xn--)
      const decodedDomain = domain.startsWith('xn--') ? punycode.toUnicode(domain) : domain;
      // Replace Unicode dashes (like \u2010 to \u2015, e.g., en-dash/em-dash) with standard ASCII hyphen '-'
      const normalizedDomain = decodedDomain.replace(/[\u2010-\u2015]/g, '-');
      normalized = `${local}@${normalizedDomain}`;
    } catch (e) {
      normalized = normalized.replace(/[\u2010-\u2015]/g, '-');
    }
  } else {
    normalized = normalized.replace(/[\u2010-\u2015]/g, '-');
  }

  return normalized;
}
