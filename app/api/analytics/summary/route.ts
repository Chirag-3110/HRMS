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

    await connectDB();

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersLast30Days = await User.countDocuments({
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
