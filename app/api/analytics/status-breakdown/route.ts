import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import type { UserStatus } from '@/lib/schemas/user';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const statuses: UserStatus[] = ['active', 'deactivated'];
    const breakdown = await Promise.all(
      statuses.map(async (status) => {
        const count = await User.countDocuments({ status });
        return { status, count };
      })
    );

    return NextResponse.json({ data: breakdown });
  } catch (error) {
    console.error('Error fetching status breakdown:', error);
    return NextResponse.json(
      { message: 'Failed to fetch status breakdown', error: String(error) },
      { status: 500 }
    );
  }
}
