import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Attendance } from '@/lib/models/Attendance';
import { LocationLog } from '@/lib/models/LocationLog';
import { calculateHaversineDistance } from '@/lib/utils/distance';
import { getAuthenticatedUser } from '@/lib/auth';

// POST - Log periodic location telemetry
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const userId = user.id;
    const body = await request.json();
    const { latitude, longitude } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ message: 'Latitude and longitude are required' }, { status: 400 });
    }

    // Find active shift
    const shift = await Attendance.findOne({
      userId,
      status: 'checked_in',
    });

    if (!shift) {
      return NextResponse.json({ message: 'No active check-in found to log location' }, { status: 400 });
    }

    // Find last location log to calculate distance segment
    const lastLog = await LocationLog.findOne({
      attendanceId: shift._id,
    }).sort({ timestamp: -1 });

    let distance = 0;
    if (lastLog) {
      distance = calculateHaversineDistance(lastLog.latitude, lastLog.longitude, latitude, longitude);
    }

    // Save location log entry
    const log = await LocationLog.create({
      userId,
      attendanceId: shift._id,
      latitude,
      longitude,
      timestamp: new Date(),
      distanceFromPrev: distance,
    });

    // Update total distance in shift if distance moved is greater than 10 meters (prevents GPS jitter drift)
    if (distance > 0.01) {
      shift.totalDistanceKm = Math.round((shift.totalDistanceKm + distance) * 100) / 100;
      await shift.save();
    }

    return NextResponse.json({
      success: true,
      logId: log._id.toString(),
      distanceFromPrev: Math.round(distance * 1000) / 1000, // round to meters
      totalDistanceKm: shift.totalDistanceKm,
    });
  } catch (error) {
    console.error('Error logging location:', error);
    return NextResponse.json(
      { message: 'Failed to log location', error: String(error) },
      { status: 500 }
    );
  }
}
