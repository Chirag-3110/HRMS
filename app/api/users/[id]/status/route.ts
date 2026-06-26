/**
 * User Status API Route
 * 
 * PATCH /api/users/[id]/status - Update user account status
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import mongoose from 'mongoose';
import type { UserStatus } from '@/lib/schemas/user';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * PATCH /api/users/[id]/status
 * Update user account status (activate/deactivate)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { status } = body as { status: UserStatus };

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Validate status
    if (!status || !['active', 'deactivated'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status. Must be "active" or "deactivated"' },
        { status: 400 }
      );
    }

    // Update user status
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Transform to match API interface
    const transformedUser = {
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role,
      status: updatedUser.status,
      registrationDate: updatedUser.registrationDate.toISOString(),
      lastLoginDate: updatedUser.lastLoginDate?.toISOString(),
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { message: 'Failed to update user status', error: String(error) },
      { status: 500 }
    );
  }
}
