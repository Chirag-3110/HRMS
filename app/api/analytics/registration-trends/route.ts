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

    // Fetch user registration dates
    const users = await User.find({}).select('registrationDate').lean();
    
    // Initialize past 12 months data structure
    const monthsData: Record<string, number> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      monthsData[label] = 0;
    }

    // Populate counts from MongoDB users
    users.forEach((user) => {
      if (!user.registrationDate) return;
      const regDate = new Date(user.registrationDate);
      const label = `${monthNames[regDate.getMonth()]} ${regDate.getFullYear().toString().substring(2)}`;
      if (monthsData[label] !== undefined) {
        monthsData[label]++;
      }
    });

    const data = Object.entries(monthsData).map(([month, count]) => ({
      month,
      count,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching registration trends:', error);
    return NextResponse.json(
      { message: 'Failed to fetch registration trends', error: String(error) },
      { status: 500 }
    );
  }
}
