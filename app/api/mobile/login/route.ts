import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import crypto from 'crypto';
import { encode } from 'next-auth/jwt';
import { normalizeEmail } from '@/lib/auth';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        { message: 'Your account has been deactivated. Contact administration.' },
        { status: 403 }
      );
    }

    const hashedPassword = hashPassword(password);
    if (user.password && user.password !== hashedPassword) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Map role for session
    let sessionRole = user.role.toLowerCase();
    if (user.role === 'Admin') {
      sessionRole = 'superadmin';
    }

    // Prepare token payload matching NextAuth standard structure
    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      name: user.fullName,
      role: sessionRole,
      tenantId: user.tenantId || null,
      accessToken: 'mock-access-token',
    };

    // Encrypt the JWT token using NextAuth standard key
    const token = await encode({
      token: tokenPayload,
      secret: process.env.NEXTAUTH_SECRET || 'pYYOM1hD1tUUNsE4Unp1XfuK2b04kFMaBUL6ayHtv98=',
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: sessionRole,
        tenantId: user.tenantId || null,
      }
    });
  } catch (error) {
    console.error('Mobile authentication error:', error);
    return NextResponse.json(
      { message: 'Login failed', error: String(error) },
      { status: 500 }
    );
  }
}
