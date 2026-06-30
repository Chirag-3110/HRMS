import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import type { UserRole } from '@/lib/schemas/user';

const ALL_ROLES: UserRole[] = ['Admin', 'Member', 'Guest', 'FieldWorker'];

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

    // Single aggregation instead of 4 separate countDocuments calls
    const aggregationResult = await User.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    // Build a count map
    const countMap: Record<string, number> = {};
    for (const item of aggregationResult) {
      countMap[item._id] = item.count;
    }

    // Ensure all roles are present in the response, even if count is 0
    const breakdown = ALL_ROLES.map((role) => ({
      role,
      count: countMap[role] ?? 0,
    }));

    return NextResponse.json({ data: breakdown });
  } catch (error) {
    console.error('Error fetching role breakdown:', error);
    return NextResponse.json(
      { message: 'Failed to fetch role breakdown', error: String(error) },
      { status: 500 }
    );
  }
}
