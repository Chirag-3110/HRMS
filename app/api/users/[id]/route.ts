/**
 * Individual User API Routes
 * 
 * GET /api/users/[id] - Get user detail with activity log
 * PATCH /api/users/[id] - Update user information
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { Activity } from '@/lib/models/Activity';
import mongoose from 'mongoose';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET /api/users/[id]
 * Fetch user detail with activity log
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Fetch user
    const user = await User.findById(id).select('-__v').lean();

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch user's activities (most recent 50)
    const activities = await Activity.find({ userId: id })
      .sort({ timestamp: -1 })
      .limit(50)
      .select('-__v -userId')
      .lean();

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
      activities: activities.map((activity) => ({
        id: activity._id.toString(),
        timestamp: activity.timestamp.toISOString(),
        actionType: activity.actionType,
        description: activity.description,
      })),
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user', error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/[id]
 * Update user information
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check for duplicate email if email is being updated
    if (body.email && body.email !== existingUser.email) {
      const duplicateUser = await User.findOne({ email: body.email.toLowerCase() });
      if (duplicateUser) {
        return NextResponse.json(
          { message: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(body.email && { email: body.email }),
          ...(body.fullName && { fullName: body.fullName }),
          ...(body.phoneNumber !== undefined && { phoneNumber: body.phoneNumber }),
          ...(body.role && { role: body.role }),
        },
      },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'Failed to update user' },
        { status: 500 }
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
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Failed to update user', error: String(error) },
      { status: 500 }
    );
  }
}
