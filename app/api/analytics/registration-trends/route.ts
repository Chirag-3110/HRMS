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

    // Calculate date 12 months ago
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);
    matchQuery.registrationDate = { $gte: twelveMonthsAgo };

    // Use aggregation instead of fetching all users — much faster
    const aggregationResult = await User.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$registrationDate' },
            month: { $month: '$registrationDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Build a lookup map from aggregation result
    const countMap: Record<string, number> = {};
    for (const item of aggregationResult) {
      const key = `${item._id.year}-${item._id.month}`;
      countMap[key] = item.count;
    }

    // Build the last 12 months labels in order
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const data = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 1-indexed
      const label = `${monthNames[d.getMonth()]} ${year.toString().substring(2)}`;
      const key = `${year}-${month}`;
      data.push({ month: label, count: countMap[key] ?? 0 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching registration trends:', error);
    return NextResponse.json(
      { message: 'Failed to fetch registration trends', error: String(error) },
      { status: 500 }
    );
  }
}
