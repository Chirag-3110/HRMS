import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { Attendance } from '@/lib/models/Attendance';
import { LocationLog } from '@/lib/models/LocationLog';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');

    // SaaS Multitenancy: determine active tenant scope
    const adminTenantId = (session.user as any).tenantId;
    let activeTenantId = adminTenantId;
    if (!adminTenantId || adminTenantId === 'system') {
      activeTenantId = searchParams.get('tenantId') || 'apex-logistics';
    }

    // 1. If no specific worker ID is provided, return all field workers with latest status
    if (!userId) {
      const workerQuery: any = { role: 'FieldWorker' };
      if (activeTenantId) {
        workerQuery.tenantId = activeTenantId;
      }
      const fieldWorkers = await User.find(workerQuery).select('-password -__v').lean();
      
      const workersStatus = await Promise.all(
        fieldWorkers.map(async (worker) => {
          // Get latest attendance session
          const latestShift = await Attendance.findOne({ userId: worker._id, tenantId: activeTenantId })
            .sort({ checkInTime: -1 })
            .lean();

          // Get latest location coordinates
          let latestLocation = null;
          if (latestShift) {
            latestLocation = await LocationLog.findOne({ attendanceId: latestShift._id, tenantId: activeTenantId })
              .sort({ timestamp: -1 })
              .lean();
          }

          return {
            id: worker._id.toString(),
            fullName: worker.fullName,
            email: worker.email,
            phoneNumber: worker.phoneNumber,
            status: worker.status,
            activeShift: latestShift ? {
              id: latestShift._id.toString(),
              checkInTime: latestShift.checkInTime.toISOString(),
              checkOutTime: latestShift.checkOutTime ? latestShift.checkOutTime.toISOString() : null,
              status: latestShift.status,
              totalDistanceKm: latestShift.totalDistanceKm,
              date: latestShift.date,
            } : null,
            latestLocation: latestLocation ? {
              latitude: latestLocation.latitude,
              longitude: latestLocation.longitude,
              timestamp: latestLocation.timestamp.toISOString(),
            } : null,
          };
        })
      );

      return NextResponse.json({ workers: workersStatus });
    }

    // 2. If worker ID is provided, fetch detailed shift logs & routes for a specific date
    if (!date) {
      return NextResponse.json(
        { message: 'Date parameter (YYYY-MM-DD) is required when querying a specific worker' }, 
        { status: 400 }
      );
    }

    const workerQuery: any = { _id: userId, role: 'FieldWorker' };
    if (activeTenantId) {
      workerQuery.tenantId = activeTenantId;
    }
    const worker = await User.findOne(workerQuery).select('-password -__v').lean();
    if (!worker) {
      return NextResponse.json({ message: 'Field worker not found' }, { status: 404 });
    }

    const shiftQuery: any = { userId, date };
    if (activeTenantId) {
      shiftQuery.tenantId = activeTenantId;
    }
    const shift = await Attendance.findOne(shiftQuery).lean();
    if (!shift) {
      return NextResponse.json({
        worker: {
          id: worker._id.toString(),
          fullName: worker.fullName,
          email: worker.email,
          phoneNumber: worker.phoneNumber,
        },
        shift: null,
        route: [],
      });
    }

    // Fetch coordinate history sorted by timestamp
    const logQuery: any = { attendanceId: shift._id };
    if (activeTenantId) {
      logQuery.tenantId = activeTenantId;
    }
    const logs = await LocationLog.find(logQuery)
      .sort({ timestamp: 1 })
      .select('-__v')
      .lean();

    const transformedLogs = logs.map(log => ({
      id: log._id.toString(),
      latitude: log.latitude,
      longitude: log.longitude,
      timestamp: log.timestamp.toISOString(),
      distanceFromPrev: log.distanceFromPrev,
    }));

    return NextResponse.json({
      worker: {
        id: worker._id.toString(),
        fullName: worker.fullName,
        email: worker.email,
        phoneNumber: worker.phoneNumber,
      },
      shift: {
        id: shift._id.toString(),
        checkInTime: shift.checkInTime.toISOString(),
        checkOutTime: shift.checkOutTime ? shift.checkOutTime.toISOString() : null,
        checkInLocation: shift.checkInLocation,
        checkOutLocation: shift.checkOutLocation || null,
        totalDistanceKm: shift.totalDistanceKm,
        status: shift.status,
        date: shift.date,
      },
      route: transformedLogs,
    });
  } catch (error) {
    console.error('Error fetching admin tracking telemetry:', error);
    return NextResponse.json(
      { message: 'Failed to fetch telemetry data', error: String(error) },
      { status: 500 }
    );
  }
}
