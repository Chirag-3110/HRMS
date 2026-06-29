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

    const query: any = {};
    if (activeTenantId) {
      query.tenantId = activeTenantId;
    }

    await connectDB();

    const totalUsers = await User.countDocuments(query);
    const activeUsers = await User.countDocuments({ ...query, status: 'active' });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersLast30Days = await User.countDocuments({
      ...query,
      registrationDate: { $gte: thirtyDaysAgo },
    });

    return NextResponse.json({
      totalUsers,
      activeUsers,
      newUsersLast30Days,
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return NextResponse.json(
      { message: 'Failed to fetch analytics summary', error: String(error) },
      { status: 500 }
    );
  }
}
