import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const adminTenantId = (session.user as any).tenantId;
    let activeTenantId = adminTenantId;
    if (!adminTenantId || adminTenantId === 'system') {
      activeTenantId = searchParams.get('tenantId') || 'apex-logistics';
    }

    const matchQuery: any = {};
    if (activeTenantId) {
      matchQuery.tenantId = activeTenantId;
    }

    await connectDB();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Single aggregation replaces 3 separate countDocuments calls
    const [result] = await User.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          newUsersLast30Days: {
            $sum: {
              $cond: [{ $gte: ['$registrationDate', thirtyDaysAgo] }, 1, 0],
            },
          },
        },
      },
    ]);

    return NextResponse.json({
      totalUsers: result?.totalUsers ?? 0,
      activeUsers: result?.activeUsers ?? 0,
      newUsersLast30Days: result?.newUsersLast30Days ?? 0,
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return NextResponse.json(
      { message: 'Failed to fetch analytics summary', error: String(error) },
      { status: 500 }
    );
  }
}
