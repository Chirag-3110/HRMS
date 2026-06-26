/**
 * Users API Route
 * 
 * GET /api/users - Get paginated list of users with filtering and search
 * POST /api/users - Create a new user
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import type { UserRole, UserStatus } from '@/lib/schemas/user';

/**
 * GET /api/users
 * Fetch paginated list of users with optional filtering and search
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '25', 10);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') as UserRole | null;
    const status = searchParams.get('status') as UserStatus | null;

    // Build query
    const query: any = {};

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
    await connectDB();

    const body = await request.json();
    const { email, fullName, phoneNumber, role } = body;

    // Validate required fields
    if (!email || !fullName || !role) {
      return NextResponse.json(
        { message: 'Email, fullName, and role are required' },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = await User.create({
      email,
      fullName,
      phoneNumber,
      role,
      status: 'active',
      registrationDate: new Date(),
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
