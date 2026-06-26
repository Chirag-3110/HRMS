import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import type { UserRole } from '@/lib/schemas/user';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const roles: UserRole[] = ['Admin', 'Member', 'Guest', 'FieldWorker'];
    const breakdown = await Promise.all(
      roles.map(async (role) => {
        const count = await User.countDocuments({ role });
        return { role, count };
      })
    );

    return NextResponse.json({ data: breakdown });
  } catch (error) {
    console.error('Error fetching role breakdown:', error);
    return NextResponse.json(
      { message: 'Failed to fetch role breakdown', error: String(error) },
      { status: 500 }
    );
  }
}
