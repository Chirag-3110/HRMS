import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Attendance } from '@/lib/models/Attendance';
import { LocationLog } from '@/lib/models/LocationLog';
import { Activity } from '@/lib/models/Activity';
import { calculateHaversineDistance } from '@/lib/utils/distance';
import { getAuthenticatedUser } from '@/lib/auth';

// POST - Check In
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const userId = user.id;
    const body = await request.json();
    const { latitude, longitude, address } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ message: 'Latitude and longitude are required' }, { status: 400 });
    }

    // Check if already checked in
    const activeShift = await Attendance.findOne({
      userId,
      status: 'checked_in',
    });

    if (activeShift) {
      return NextResponse.json({ message: 'Already checked in', shift: activeShift }, { status: 400 });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Clear old data for today to allow clean testing of multiple check-ins on the same day
    await Attendance.deleteOne({ userId, date: todayStr });
    
    // Create new attendance shift
    const shift = await Attendance.create({
      userId,
      checkInTime: new Date(),
      checkInLocation: { latitude, longitude, address },
      date: todayStr,
      totalDistanceKm: 0,
      status: 'checked_in',
    });

    // Save initial starting coordinate log
    await LocationLog.create({
      userId,
      attendanceId: shift._id,
      latitude,
      longitude,
      timestamp: new Date(),
      distanceFromPrev: 0,
    });

    // Record system activity
    await Activity.create({
      userId,
      actionType: 'check_in',
      description: `Checked in at lat: ${latitude}, lng: ${longitude}`,
    });

    return NextResponse.json(shift, { status: 201 });
  } catch (error) {
    console.error('Error checking in:', error);
    return NextResponse.json(
      { message: 'Check-in failed', error: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Check Out
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const userId = user.id;
    const body = await request.json();
    const { latitude, longitude, address } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ message: 'Latitude and longitude are required' }, { status: 400 });
    }

    // Find active shift
    const shift = await Attendance.findOne({
      userId,
      status: 'checked_in',
    });

    if (!shift) {
      return NextResponse.json({ message: 'No active check-in found' }, { status: 400 });
    }

    // Find last location log to calculate final segment distance
    const lastLog = await LocationLog.findOne({
      attendanceId: shift._id,
    }).sort({ timestamp: -1 });

    let finalSegmentDist = 0;
    if (lastLog) {
      finalSegmentDist = calculateHaversineDistance(lastLog.latitude, lastLog.longitude, latitude, longitude);
    }

    // Save check-out coordinate log
    await LocationLog.create({
      userId,
      attendanceId: shift._id,
      latitude,
      longitude,
      timestamp: new Date(),
      distanceFromPrev: finalSegmentDist,
    });

    // Update attendance record
    shift.checkOutTime = new Date();
    shift.checkOutLocation = { latitude, longitude, address };
    shift.status = 'checked_out';
    shift.totalDistanceKm = Math.round((shift.totalDistanceKm + finalSegmentDist) * 100) / 100;
    await shift.save();

    // Record system activity
    await Activity.create({
      userId,
      actionType: 'check_out',
      description: `Checked out. Total distance: ${shift.totalDistanceKm} km`,
    });

    return NextResponse.json(shift);
  } catch (error) {
    console.error('Error checking out:', error);
    return NextResponse.json(
      { message: 'Check-out failed', error: String(error) },
      { status: 500 }
    );
  }
}
