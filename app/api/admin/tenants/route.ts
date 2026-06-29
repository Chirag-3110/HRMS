import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';

function formatTenantName(id: string): string {
  // Map specific ones for exact matching to match current UI design
  if (id === 'apex-logistics') return 'Apex Logistics';
  if (id === 'prime-healthcare') return 'Prime Healthcare';
  
  // Dynamic formatting for others
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Query unique tenantIds from User documents
    const uniqueTenantIds = await User.distinct('tenantId');

    // Filter out falsy values and system tenant, then map to final structure
    const tenants = uniqueTenantIds
      .filter((id): id is string => !!id && id !== 'system')
      .map((id) => ({
        id,
        name: formatTenantName(id),
      }));

    return NextResponse.json(tenants);
  } catch (error) {
    console.error('Error fetching dynamic tenants list:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: String(error) },
      { status: 500 }
    );
  }
}
