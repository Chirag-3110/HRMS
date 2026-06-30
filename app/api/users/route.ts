/**
 * Users API Route
 * 
 * GET /api/users - Get paginated list of users with filtering and search
 * POST /api/users - Create a new user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import type { UserRole, UserStatus } from '@/lib/schemas/user';
import { normalizeEmail } from '@/lib/auth';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * GET /api/users
 * Fetch paginated list of users with optional filtering and search
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '25', 10);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') as UserRole | null;
    const status = searchParams.get('status') as UserStatus | null;

    // SaaS Multitenancy: determine active tenant scope
    const adminTenantId = (session.user as any).tenantId;
    let activeTenantId = adminTenantId;
    if (!adminTenantId || adminTenantId === 'system') {
      activeTenantId = searchParams.get('tenantId') || 'apex-logistics';
    }

    // Build query
    const query: any = {};
    if (activeTenantId) {
      query.tenantId = activeTenantId;
    }

    // Search filter (uses text index on fullName and email)
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Role filter
    if (role) {
      query.role = role;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Get total count for pagination
    const totalCount = await User.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize);

    // Fetch paginated users
    const users = await User.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .select('-__v') // Exclude version key
      .lean();

    // Transform to match API interface
    const transformedUsers = users.map((user) => ({
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
      registrationDate: user.registrationDate.toISOString(),
      lastLoginDate: user.lastLoginDate?.toISOString(),
    }));

    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Failed to fetch users', error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { email, fullName, phoneNumber, role, password } = body;

    // Validate required fields
    if (!email || !fullName || !role) {
      return NextResponse.json(
        { message: 'Email, fullName, and role are required' },
        { status: 400 }
      );
    }

    // SaaS Multitenancy: determine active tenant scope
    const adminTenantId = (session.user as any).tenantId;
    let activeTenantId = adminTenantId;
    if (!adminTenantId || adminTenantId === 'system') {
      activeTenantId = body.tenantId || 'apex-logistics';
    }

    // Check for duplicate email (within same tenant is enough, but global duplicate check protects user uniqueness)
    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = await User.create({
      email: normalizedEmail,
      fullName,
      phoneNumber,
      role,
      status: 'active',
      registrationDate: new Date(),
      tenantId: activeTenantId,
      ...(password && { password: hashPassword(password) }),
    });

    // Transform to match API interface
    const transformedUser = {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
      registrationDate: user.registrationDate.toISOString(),
      lastLoginDate: user.lastLoginDate?.toISOString(),
    };

    return NextResponse.json(transformedUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Failed to create user', error: String(error) },
      { status: 500 }
    );
  }
}
