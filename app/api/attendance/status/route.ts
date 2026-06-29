import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Attendance } from '@/lib/models/Attendance';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Find active checked-in shift for user
    const userId = user.id;
    
    const activeShift = await Attendance.findOne({
      userId,
      status: 'checked_in',
      ...(user.tenantId && { tenantId: user.tenantId }),
    }).lean();

    return NextResponse.json({
      checkedIn: !!activeShift,
      shift: activeShift
        ? {
            id: activeShift._id.toString(),
            checkInTime: activeShift.checkInTime,
            checkInLocation: activeShift.checkInLocation,
            totalDistanceKm: activeShift.totalDistanceKm,
          }
        : null,
    });
  } catch (error) {
    console.error('Error fetching attendance status:', error);
    return NextResponse.json(
      { message: 'Failed to fetch status', error: String(error) },
      { status: 500 }
    );
  }
}
